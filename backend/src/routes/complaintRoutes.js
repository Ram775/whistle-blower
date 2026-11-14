import express from 'express';
import {
    sendOtp,
    verifyOtp,
    submitComplaint,
    submitNewComplaint,
    getAllComplaints,
    updateComplaintStatus,
    getComplaintById,
    getMyComplaints,
    generateComplaintPdf
} from '../controllers/ComplaintController.js';
import {
    submitComplaintValidator,
    submitNewComplaintValidator
} from '../validators/complaintValidator.js';
import { auth, allowRoles } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import { otpSendLimiter, otpVerifyLimiter, checkBlockedIP } from '../middlewares/rateLimiter.js';





const router = express.Router();
router.use(checkBlockedIP);

// Public Routes (registration flow)
router.post('/send-otp',otpSendLimiter, sendOtp);
router.post('/verify-otp', otpVerifyLimiter, verifyOtp);

// Public complaint submission (with file uploads)
router.post(
    '/submit_complaint',
    upload.fields([
        { name: 'id_photo', maxCount: 1 },
        { name: 'complaint_document', maxCount: 1 }
    ]),
    submitComplaintValidator,
    submitComplaint
);

// Protected Routes (customer only - role_id = 3)
router.post(
    '/submit_new_complaint',
    auth,
    allowRoles(3),
    upload.fields([{ name: 'complaint_document', maxCount: 1 }]),
    submitNewComplaintValidator,
    submitNewComplaint
);

// Admin Routes (role_id = 1 or 2)
router.get('/admin/all', auth, allowRoles(1, 2), getAllComplaints);
router.get('/admin/:id', auth, allowRoles(1, 2), getComplaintById);
router.put('/admin/:id/status', auth, allowRoles(1, 2), updateComplaintStatus);
router.get('/my-complaints', auth, allowRoles(3), getMyComplaints);
router.get('/my-complaints/:id', auth, allowRoles(3), getComplaintById); // Same controller function, bas ID se
router.get('/pdf/:id', auth, generateComplaintPdf);

export default router;