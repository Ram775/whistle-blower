import express from 'express';
import * as UploadController from '../controllers/UploadFileController.js';
import { upload } from '../middlewares/uploadMiddleware.js';
// import { uploadImageValidator } from '../validators/uploadValidator.js'; <-- Isko hata de
import { auth, allowRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// File Uploads admin protected (Validator hata diya)
router.post('/single_image', auth, allowRoles(1, 2), upload.single('file'), UploadController.single_image);

router.post('/remove_single_image', auth, allowRoles(1, 2), UploadController.remove_single_image);

export default router;