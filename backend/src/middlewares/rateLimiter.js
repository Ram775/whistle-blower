import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

// ==== In-Memory Block List ====
const blockedIPs = new Map();

// Middleware: Check if IP is blocked
export const checkBlockedIP = (req, res, next) => {
    const ip = req.ip;
    const unblockTime = blockedIPs.get(ip);

    if (unblockTime && Date.now() < unblockTime) {
        const remainingMin = Math.ceil((unblockTime - Date.now()) / 60000);
        return res.status(403).json({
            status: false,
            message: `Your IP is blocked due to too many failed attempts. Try again in ${remainingMin} minutes.`,
            blocked: true
        });
    }
    
    if (unblockTime && Date.now() >= unblockTime) {
        blockedIPs.delete(ip);
    }
    next();
};

// Global API Limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { status: false, message: 'Too many requests. Try again after 15 minutes.' }
});

// Login Limiter (5 attempts)
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 5, // 5 attempts
    keyGenerator: (req) => ipKeyGenerator(req.ip), // IPv6 fix
    handler: (req, res) => {
        // 5th failed attempt -> Block IP
        blockedIPs.set(req.ip, Date.now() + 15 * 60 * 1000);
        res.status(429).json({
            status: false,
            message: 'Too many failed login attempts. Your IP is blocked for 15 minutes.',
            blocked: true
        });
    },
    skipSuccessfulRequests: true, // Success hone pe count reset
    standardHeaders: true,
    legacyHeaders: false
});

// OTP Send Limiter (3 attempts)
export const otpSendLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    keyGenerator: (req) => {
        return req.body.email_id || req.body.email || ipKeyGenerator(req.ip);
    },
    message: {
        status: false,
        message: 'You have reached the maximum OTP send limit (3 per hour). Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// OTP Verify Limiter (5 attempts)
export const otpVerifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    keyGenerator: (req) => {
        return req.body.email || req.body.email_id || ipKeyGenerator(req.ip);
    },
    handler: (req, res) => {
        res.status(429).json({
            status: false,
            message: 'Too many invalid OTP attempts. Please request a new OTP.'
        });
    },
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false
});