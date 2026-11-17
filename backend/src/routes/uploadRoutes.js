import express from 'express';
import * as UploadController from '../controllers/UploadFileController.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import { auth, allowRoles } from '../middlewares/authMiddleware.js';
import { uploadLimiter } from '../middlewares/rateLimiter.js'; // ✅ Add

const router = express.Router();

// File Uploads admin protected
router.post(
    '/single_image', 
    auth, 
    allowRoles(1, 2), 
    uploadLimiter,   // ✅ Rate limit
    upload.single('file'), 
    UploadController.single_image
);

router.post(
    '/remove_single_image', 
    auth, 
    allowRoles(1, 2), 
    uploadLimiter,   // ✅ Rate limit
    UploadController.remove_single_image
);

export default router;