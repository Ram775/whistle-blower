import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { verifyAllFiles } from '../utils/fileVerifier.js'; // ✅ Import

const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Storage: Folder + Filename config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const subFolder = file.fieldname === 'id_photo' ? 'idphoto' : 'complaintdocument';
        const storagePath = path.join(process.cwd(), 'uploads', subFolder);
        ensureDir(storagePath);
        cb(null, storagePath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname).toLowerCase());
    }
});

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/x-icon',
    'image/vnd.microsoft.icon',
    'image/svg+xml',
    'application/pdf'
];

const fileFilter = (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return cb(new Error('Invalid file type. Only JPEG, PNG, ICO, SVG, and PDF files are allowed.'), false);
    }
    cb(null, true);
};

// Multer instance
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 20000 * 1024 } // 20MB max
});

// ================== POST-UPLOAD VERIFICATION MIDDLEWARE ==================

/**
 * Ye middleware upload ke baad chalta hai:
 * 1. Har file ka magic number check karta hai (file content vs extension)
 * 2. Malicious content scan karta hai (SVG scripts)
 * 3. Invalid file ko delete karta hai
 * 
 * Usage: upload.single('file'), verifyUploadedFiles, controller
 */
export const verifyUploadedFiles = (req, res, next) => {
    try {
        // req.file (single) ya req.files (fields/array) dono handle karo
        let filesToVerify = null;
        if (req.file) filesToVerify = [req.file];
        else if (req.files) filesToVerify = req.files;

        if (!filesToVerify) {
            return next(); // Koi file nahi, aage badho
        }

        const result = verifyAllFiles(filesToVerify);

        if (!result.valid) {
            // ❌ Invalid file delete karo
            if (result.invalidFile && fs.existsSync(result.invalidFile)) {
                fs.unlinkSync(result.invalidFile);
            }
            // Baaki files bhi delete karo (safety)
            const allFiles = Array.isArray(filesToVerify) ? filesToVerify : Object.values(filesToVerify).flat();
            allFiles.forEach(f => {
                if (f.path && fs.existsSync(f.path)) {
                    try { fs.unlinkSync(f.path); } catch (e) {}
                }
            });

            return res.status(422).json({
                status: false,
                message: result.error
            });
        }

        next();
    } catch (error) {
        console.error('Upload verification error:', error);
        return res.status(500).json({
            status: false,
            message: 'File verification failed due to a server error. Please try again.'
        });
    }
};

// ================== ERROR HANDLER ==================

export const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(422).json({
                status: false,
                message: 'File size is too large. Maximum allowed size is 20MB.'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(422).json({
                status: false,
                message: 'Unexpected file field. Please check the file field name in your request.'
            });
        }
        return res.status(422).json({
            status: false,
            message: `File upload error: ${err.message}`
        });
    } else if (err) {
        return res.status(422).json({
            status: false,
            message: err.message || 'File upload failed due to an unknown error.'
        });
    }
    next();
};