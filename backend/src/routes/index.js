import express from 'express';
import frontendRoutes from './frontendRoutes.js';
import complaintRoutes from './complaintRoutes.js';
import userRoutes from './userRoutes.js';

const router = express.Router();

router.use('/frontend', frontendRoutes);
router.use('/complaints', complaintRoutes);
router.use('/users', userRoutes);

export default router;