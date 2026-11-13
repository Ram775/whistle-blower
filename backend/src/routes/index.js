import express from 'express';
import frontendRoutes from './frontendRoutes.js';
import complaintRoutes from './complaintRoutes.js';
import userRoutes from './userRoutes.js';
import masterRoutes from './masterRoutes.js';
import adminRoutes from './adminRoutes.js';
import uploadRoutes from './uploadRoutes.js';

const router = express.Router();

router.use('/frontend', frontendRoutes);
router.use('/complaints', complaintRoutes);
router.use('/users', userRoutes);
router.use('/master', masterRoutes); 
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);  

export default router;