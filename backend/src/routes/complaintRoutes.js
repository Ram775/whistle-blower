import express from 'express';
import {
    sendOtp,
    verifyOtp,
    submitComplaint,
    submitNewComplaint,
    getAllComplaints,
    updateComplaintStatus
} from '../controllers/ComplaintController.js';
import {
    submitComplaintValidator,
    submitNewComplaintValidator
} from '../validators/complaintValidator.js';
import { auth, allowRoles } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Public Routes (registration flow)
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

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
router.put('/admin/:id/status', auth, allowRoles(1, 2), updateComplaintStatus);

export default router;