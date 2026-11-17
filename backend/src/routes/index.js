import express from 'express';
import { apiLimiter } from '../middlewares/rateLimiter.js'; // ✅ Global limiter import
import frontendRoutes from './frontendRoutes.js';
import complaintRoutes from './complaintRoutes.js';
import userRoutes from './userRoutes.js';
import masterRoutes from './masterRoutes.js';
import adminRoutes from './adminRoutes.js';
import uploadRoutes from './uploadRoutes.js';

const router = express.Router();

// ✅ Global Limiter (auth routes automatically skip ho jayenge)
router.use(apiLimiter);

router.use('/frontend', frontendRoutes);
router.use('/complaints', complaintRoutes);
router.use('/users', userRoutes);
router.use('/master', masterRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);

export default router;