import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

// ==== In-Memory Block List ====
const blockedIPs = new Map();

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

// ==== Helper: Key by User ====
const keyByUser = (req) => req.user?.id ? `user:${req.user.id}` : ipKeyGenerator(req.ip);

// ==== Helper: Standard 429 Response ====
const makeHandler = (message) => (req, res) => {
    res.status(429).json({
        status: false,
        message,
        retryAfter: req.rateLimit?.resetTime ? Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000) : 60
    });
};

// ================= GLOBAL =================
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 5, // 15 min
    max: 100, // 100 requests
    keyGenerator: (req) => ipKeyGenerator(req.ip),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: makeHandler('Too many requests. Try again after 15 minutes.'),
    // ✅ Auth routes ko skip karo (unke apne limiters hain)
    skip: (req) => {
        const url = req.originalUrl;
        return url.includes('/api/users/login') ||
               url.includes('/api/frontend/account_login') ||
               url.includes('/api/users/forgot-password') ||
               url.includes('/api/users/reset-password');
    }
});

// ================= LOGIN =================
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    keyGenerator: (req) => ipKeyGenerator(req.ip),
    handler: (req, res) => {
        blockedIPs.set(req.ip, Date.now() + 15 * 60 * 1000);
        res.status(429).json({
            status: false,
            message: 'Too many failed login attempts. Your IP is blocked for 15 minutes.',
            blocked: true
        });
    },
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-7',
    legacyHeaders: false
});

// ================= OTP SEND =================
export const otpSendLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    keyGenerator: (req) => (req.body.email_id || req.body.email || '').toLowerCase().trim() || ipKeyGenerator(req.ip),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: makeHandler('You have reached the maximum OTP send limit (3 per hour).'),
});

// ================= OTP VERIFY =================
export const otpVerifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    keyGenerator: (req) => (req.body.email || req.body.email_id || '').toLowerCase().trim() || ipKeyGenerator(req.ip),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: makeHandler('Too many invalid OTP attempts. Please request a new OTP.'),
});

// ================= COMPLAINT SUBMIT =================
export const complaintSubmitLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    keyGenerator: (req) => ipKeyGenerator(req.ip),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: makeHandler('You have reached the complaint submission limit (5 per hour).'),
});

// ================= COMPLAINT READ =================
export const complaintReadLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 min
    max: 60,
    keyGenerator: keyByUser,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: makeHandler('Too many requests. Please slow down.'),
});

// ================= UPLOAD =================
export const uploadLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 min
    max: 10,
    keyGenerator: keyByUser,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: makeHandler('Too many file uploads. Please try again after 10 minutes.'),
});

// ================= PDF =================
export const pdfLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    keyGenerator: keyByUser,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: makeHandler('Too many PDF generation requests. Please try again later.'),
});

// ================= ADMIN CRUD =================
export const adminCrudLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    keyGenerator: keyByUser,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: makeHandler('Too many admin operations. Please slow down.'),
});

// ================= MASTER READ =================
export const masterReadLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    keyGenerator: (req) => ipKeyGenerator(req.ip),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: makeHandler('Too many requests to master data. Please slow down.'),
});

// ================= MASTER WRITE =================
export const masterWriteLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    keyGenerator: keyByUser,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: makeHandler('Too many write operations. Please slow down.'),
});

// ================= USER READ / WRITE =================
export const userReadLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    keyGenerator: keyByUser,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: makeHandler('Too many requests. Please slow down.'),
});

export const userWriteLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    keyGenerator: keyByUser,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: makeHandler('Too many user management operations. Please slow down.'),
});

// ================= SETTINGS READ / WRITE =================
export const settingsReadLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    keyGenerator: keyByUser,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: makeHandler('Too many requests. Please slow down.'),
});

export const settingsWriteLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 15,
    keyGenerator: keyByUser,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: makeHandler('Too many settings changes. Please slow down.'),
});