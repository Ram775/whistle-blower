import path from 'path';
import fs from 'fs';

const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/x-icon',
    'image/vnd.microsoft.icon',
    'image/svg+xml',
    'application/pdf'
];

export const single_image = async (req, res) => {
    try {
        // Safe extraction: check req.file, then req.files
        const file = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);
        const save_folder = req.body.save_folder;

        // 🔥 YAHAN SAVE_FOLDER KI VALIDATION ADD KI HAI 🔥
        if (!save_folder || !/^[A-Za-z0-9_\-]+$/.test(save_folder)) {
             if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path); // Cleanup temp file
             return res.status(422).json({ status: false, message: 'Invalid upload destination or folder missing', filename: '', display_filename: '' });
        }

        // 1. Check if file exists
        if (!file) {
            return res.status(422).json({ status: false, message: 'File is required', filename: '', display_filename: '' });
        }

        // 2. File Size check
        if (file.size > 20000 * 1024) {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            return res.status(422).json({ status: false, message: 'maximum uploading size is 20 MB', filename: '', display_filename: '' });
        }

        // 3. MIME Type Check
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            return res.status(422).json({ status: false, message: 'uploaded file type is not valid', filename: '', display_filename: '' });
        }

        // 4. Generate safe filename
        const ext = path.extname(file.originalname).toLowerCase();
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(1000 + Math.random() * 9000);
        const filename = `${dateStr}-${random}${ext}`;

        // 5. Ensure target folder exists
        const targetDir = path.join(process.cwd(), 'uploads', save_folder);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        // 6. Move file from temp to actual folder
        const targetPath = path.join(targetDir, filename);
        
        try {
            fs.renameSync(file.path, targetPath); // Move file
        } catch (moveError) {
            // Fallback: copy then delete
            fs.copyFileSync(file.path, targetPath);
            fs.unlinkSync(file.path);
        }

        const database_store_name = `${save_folder}/${filename}`;
        const baseUrl = process.env.APP_URL || 'http://localhost:5000';
        const display_filename = `${baseUrl}/uploads/${database_store_name}`;

        return res.status(200).json({
            status: true,
            message: 'File successfully uploaded!',
            filename: database_store_name,
            display_filename: display_filename
        });

    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ status: false, message: 'Something went wrong', filename: '', display_filename: '' });
    }
};

export const remove_single_image = async (req, res) => {
    try {
        const delete_image = req.body.delete_image;

        if (!delete_image || !/^[A-Za-z0-9_\-\/.]+$/.test(delete_image) || delete_image.includes('..')) {
            return res.status(400).json({ status: false, message: 'File Not removed', filename: '', display_filename: '' });
        }

        const uploadsRoot = path.join(process.cwd(), 'uploads');
        const targetPath = path.resolve(uploadsRoot, delete_image);

        if (targetPath.startsWith(uploadsRoot) && fs.existsSync(targetPath) && fs.lstatSync(targetPath).isFile()) {
            fs.unlinkSync(targetPath);
            return res.status(200).json({
                status: true,
                message: 'File successfully removed!',
                filename: '',
                display_filename: `${process.env.APP_URL || 'http://localhost:5000'}/uploads/default.png`
            });
        } else {
            return res.status(400).json({ status: false, message: 'File Not removed', filename: '', display_filename: '' });
        }
    } catch (error) {
        console.error('Remove image error:', error);
        return res.status(500).json({ status: false, message: 'Something went wrong' });
    }
};