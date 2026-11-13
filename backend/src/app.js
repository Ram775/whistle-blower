import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { multerErrorHandler } from './middlewares/uploadMiddleware.js';
import morgan from 'morgan';

dotenv.config();

const app = express();

// CORS (allow frontend Vite)
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));


app.use(morgan('dev')); // Logging middleware

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static folder for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API Routes
app.use('/api', routes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ status: false, message: 'Route Not Found' });
});

// Global Error Handler
app.use(multerErrorHandler);
app.use((err, req, res, next) => {
    console.error('Global Error:', err);
    res.status(500).json({ 
        status: false, 
        message: err.message || 'Internal Server Error' 
    });
});

export default app;