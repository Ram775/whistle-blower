import multer from 'multer';
import path from 'path';
import fs from 'fs';

const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Storage: Initial temporary folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tempPath = path.join(process.cwd(), 'uploads', 'temp');
        ensureDir(tempPath);
        cb(null, tempPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname).toLowerCase());
    }
});

// Allowed MIME types (Same as Laravel)
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
        return cb(new Error('Invalid file type. Only JPEG, PNG, ICO, SVG, PDF allowed.'), false);
    }
    cb(null, true);
};

// Yahan hum direct multer instance export kar rahe hain
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 20000 * 1024 } // 20MB max
});

// Error Handler
export const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(422).json({ status: false, message: 'Maximum uploading size is 20 MB' });
        }
        return res.status(422).json({ status: false, message: err.message });
    } else if (err) {
        return res.status(422).json({ status: false, message: err.message });
    }
    next();
};