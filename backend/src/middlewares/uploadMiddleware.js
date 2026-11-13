import multer from 'multer';
import path from 'path';
import fs from 'fs';

const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'others';
        if (file.fieldname === 'id_photo') folder = 'idphoto';
        else if (file.fieldname === 'complaint_document') folder = 'complaintdocument';
        else if (file.fieldname === 'slider_image') folder = 'slider';
        else if (file.fieldname === 'logo') folder = 'logo';

        const uploadPath = path.join(process.cwd(), 'uploads', folder);
        ensureDir(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(1000 + Math.random() * 9000);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${file.fieldname}-${dateStr}-${random}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'id_photo') {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error('ID photo must be jpg, jpeg, png, gif or pdf'), false);
        }
    } else if (file.fieldname === 'complaint_document') {
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Complaint document must be PDF only'), false);
        }
    }
    cb(null, true);
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 }
});

export const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(422).json({ status: false, message: 'File size must be less than 1MB' });
        }
        return res.status(422).json({ status: false, message: err.message });
    } else if (err) {
        return res.status(422).json({ status: false, message: err.message });
    }
    next();
};