import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import morgan from 'morgan';
import routes from './routes/index.js';
import { multerErrorHandler } from './middlewares/uploadMiddleware.js';
import logger from './utils/logger.js';

dotenv.config();

const app = express();

// ✅ Ensure logs folder exists
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// ✅ Ensure uploads folder exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// ================= MIDDLEWARES =================

// CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Morgan Logging (Console + File)
const accessLogStream = fs.createWriteStream(
    path.join(logDir, 'access.log'),
    { flags: 'a' }
);
app.use(morgan('dev')); // Console me dikhega
app.use(morgan('combined', { stream: accessLogStream })); // File me save hoga

// Static folder for uploads
app.use('/uploads', express.static(uploadsDir));

// ================= ROUTES =================
app.use('/api', routes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ status: false, message: 'Route Not Found' });
});

// ================= ERROR HANDLERS =================
// ✅ Ye sabse last me hona chahiye

// Multer specific errors
app.use(multerErrorHandler);

// Global errors
app.use((err, req, res, next) => {
    // ✅ Custom Logger se log karo
    logger.error(`${err.message} | ${req.method} ${req.url} | IP: ${req.ip}`);
    
    res.status(500).json({
        status: false,
        message: err.message || 'Internal Server Error'
    });
});

export default app;