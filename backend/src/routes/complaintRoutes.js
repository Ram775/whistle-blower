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
    generateComplaintPdf,
     editComplaint,
    updateComplaint,
} from '../controllers/ComplaintController.js';
import {
    submitComplaintValidator,
    submitNewComplaintValidator
} from '../validators/complaintValidator.js';
import { auth, allowRoles } from '../middlewares/authMiddleware.js';
import { upload, verifyUploadedFiles  } from '../middlewares/uploadMiddleware.js';
import { 
    otpSendLimiter, 
    otpVerifyLimiter, 
    checkBlockedIP,
    complaintSubmitLimiter,  // ✅ Add
    complaintReadLimiter,    // ✅ Add
    adminCrudLimiter,        // ✅ Add
    pdfLimiter               // ✅ Add
} from '../middlewares/rateLimiter.js';

const router = express.Router();

router.use(checkBlockedIP);

// ================= PUBLIC =================
router.post('/send-otp', otpSendLimiter, sendOtp);
router.post('/verify-otp', otpVerifyLimiter, verifyOtp);

router.post(
    '/submit_complaint',
    complaintSubmitLimiter,   // ✅ Rate limit
    upload.fields([
        { name: 'id_photo', maxCount: 1 },
        { name: 'complaint_document', maxCount: 1 }
    ]),
    verifyUploadedFiles, 
    submitComplaintValidator,
    submitComplaint
);

// ================= CUSTOMER =================
router.post(
    '/submit_new_complaint',
    auth,
    allowRoles(3),
    complaintSubmitLimiter,   // ✅ Rate limit
    upload.fields([{ name: 'complaint_document', maxCount: 1 }]),
    verifyUploadedFiles,
    submitNewComplaintValidator,
    submitNewComplaint
);

router.get('/my-complaints', auth, allowRoles(3), complaintReadLimiter, getMyComplaints);
router.get('/my-complaints/:id', auth, allowRoles(3), complaintReadLimiter, getComplaintById);
router.get(
    '/my-complaints/:id/edit',
    auth, allowRoles(3),
    complaintReadLimiter,
    editComplaint
);


router.put(
    '/my-complaints/:id',
    auth, allowRoles(3),
    complaintSubmitLimiter,  // Reuse submit limiter
    upload.single('complaint_document'),
    verifyUploadedFiles,     // ✅ File verification
    updateComplaint
);

// ================= ADMIN =================
router.get('/admin/all', auth, allowRoles(1, 2), complaintReadLimiter, getAllComplaints);
router.get('/admin/:id', auth, allowRoles(1, 2), complaintReadLimiter, getComplaintById);
router.put('/admin/:id/status', auth, allowRoles(1, 2), adminCrudLimiter, updateComplaintStatus);

// ================= PDF =================
router.get('/pdf/:id', auth, pdfLimiter, generateComplaintPdf);

export default router;