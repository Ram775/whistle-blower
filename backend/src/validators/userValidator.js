import { body, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ 
            status: false, 
            message: 'Validation Error', 
            errors: errors.array() 
        });
    }
    next();
};

// Login (Admin/Vigilance)
export const loginValidator = [
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
];

// Store User
export const storeUserValidator = [
    body('first_name').trim().notEmpty().withMessage('First name is required').isLength({ max: 255 }).escape(),
    body('middle_name').optional({ nullable: true }).trim().isLength({ max: 255 }).escape(),
    body('last_name').optional({ nullable: true }).trim().isLength({ max: 255 }).escape(),
    body('email_id').trim().notEmpty().withMessage('Email is required').isEmail().normalizeEmail(),
    body('mobile_no').trim().notEmpty().matches(/^[0-9]{10,15}$/).withMessage('Mobile number must be 10-15 digits'),
    body('password').notEmpty().isLength({ min: 8, max: 255 }).withMessage('Password must be 8-255 chars'),
    body('status').notEmpty().isIn(['0', '1']).withMessage('Status must be 0 or 1'),
    validate,
];

// Update User
export const updateUserValidator = [
    body('first_name').trim().notEmpty().isLength({ max: 255 }).escape(),
    body('middle_name').optional({ nullable: true }).trim().isLength({ max: 255 }).escape(),
    body('last_name').optional({ nullable: true }).trim().isLength({ max: 255 }).escape(),
    body('email_id').trim().notEmpty().isEmail().normalizeEmail(),
    body('mobile_no').trim().notEmpty().matches(/^[0-9]{10,15}$/),
    body('password').optional({ nullable: true }).isLength({ min: 8, max: 255 }),
    body('status').notEmpty().isIn(['0', '1']),
    validate,
];

// Update Profile
export const updateProfileValidator = [
    body('first_Name').trim().notEmpty().isLength({ max: 255 }).escape(),
    body('last_Name').optional({ nullable: true }).trim().isLength({ max: 255 }).escape(),
    body('email_id').trim().notEmpty().isEmail().normalizeEmail(),
    body('mobile_no').optional({ nullable: true }).trim().matches(/^[0-9]{10,15}$/),
    validate,
];

// Update Password
export const updatePasswordValidator = [
    body('old_password').notEmpty().withMessage('Old Password is Required'),
    body('new_password').notEmpty().withMessage('Please Enter New Password').isLength({ min: 8 }).withMessage('New Password At Least 8 Characters'),
    body('confirm_new_password').notEmpty().withMessage('Please Enter Confirm Password').custom((value, { req }) => {
        if (value !== req.body.new_password) {
            throw new Error('New Password & Confirm Password Not Match');
        }
        return true;
    }),
    validate,
];