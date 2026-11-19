import fs from 'fs';

/**
 * File ke first bytes (magic numbers) check karo
 * Ye ensure karta hai ki file ka content uske extension se match kare
 */
export const verifyFileSignature = (filePath, mimetype) => {
    try {
        const buffer = Buffer.alloc(8);
        const fd = fs.openSync(filePath, 'r');
        fs.readSync(fd, buffer, 0, 8, 0);
        fs.closeSync(fd);

        const hex = buffer.toString('hex').toUpperCase();

        // PDF: 25 50 44 46 (%PDF)
        if (mimetype === 'application/pdf') return hex.startsWith('25504446');
        // JPEG: FF D8 FF
        if (mimetype === 'image/jpeg') return hex.startsWith('FFD8FF');
        // PNG: 89 50 4E 47
        if (mimetype === 'image/png') return hex.startsWith('89504E47');
        // GIF: 47 49 46 38 (GIF8)
        if (mimetype === 'image/gif') return hex.startsWith('47494638');
        // ICO: 00 00 01 00
        if (mimetype === 'image/x-icon' || mimetype === 'image/vnd.microsoft.icon') {
            return hex.startsWith('00000100');
        }
        // SVG: XML-based, read text
        if (mimetype === 'image/svg+xml') {
            const content = fs.readFileSync(filePath, 'utf8').substring(0, 200);
            return content.includes('<svg') || content.includes('<?xml');
        }
        return false;
    } catch (error) {
        console.error('File signature verification error:', error);
        return false;
    }
};

/**
 * File ke andar malicious content check karo (sirf text-based files like SVG)
 */
export const scanForMaliciousContent = (filePath, mimetype) => {
    try {
        if (mimetype === 'image/svg+xml') {
            const content = fs.readFileSync(filePath, 'utf8').toLowerCase();
            const dangerousPatterns = [
                '<script', 'javascript:', 'onload=', 'onerror=',
                '<iframe', 'onclick=', 'onmouseover=', 'eval(',
                'document.cookie', '<embed', '<object'
            ];
            for (const pattern of dangerousPatterns) {
                if (content.includes(pattern)) return false;
            }
        }
        return true;
    } catch (error) {
        console.error('Malicious content scan error:', error);
        return false;
    }
};

/**
 * Saari uploaded files verify karo
 * @param {Array} files - Array of multer file objects
 * @returns {Object} - { valid: boolean, error: string | null, invalidFile: string | null }
 */
export const verifyAllFiles = (files) => {
    let allFiles = [];
    if (Array.isArray(files)) allFiles = files;
    else if (files && typeof files === 'object') {
        Object.values(files).forEach(arr => {
            if (Array.isArray(arr)) allFiles.push(...arr);
        });
    }

    for (const file of allFiles) {
        // Magic number check
        if (!verifyFileSignature(file.path, file.mimetype)) {
            return {
                valid: false,
                error: `Invalid file detected. The file "${file.originalname}" does not match its extension. Please upload a valid file.`,
                invalidFile: file.path
            };
        }
        // Malicious content scan
        if (!scanForMaliciousContent(file.path, file.mimetype)) {
            return {
                valid: false,
                error: `Security Alert: The file "${file.originalname}" contains malicious content (scripts). Upload has been rejected.`,
                invalidFile: file.path
            };
        }
    }
    return { valid: true, error: null, invalidFile: null };
};