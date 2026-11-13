import { body, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ status: false, message: 'Validation Error', errors: errors.array() });
    }
    next();
};

// Custom Rule: No malicious HTML
const safeTextRule = (value) => {
    if (/<[^>]*>/g.test(value)) throw new Error('Field contains forbidden HTML tags.');
    return true;
};

// State Validator
export const stateValidator = [
    body('country_id').notEmpty().isInt(),
    body('state_name').notEmpty().isString().isLength({ max: 255 }).trim().custom(safeTextRule),
    body('sort_order').optional().isInt({ min: 0, max: 999999 }),
    body('status').notEmpty().isIn(['0', '1']),
    validate,
];

// District Validator
export const districtValidator = [
    body('state_id').notEmpty().isInt(),
    body('district_name').notEmpty().isString().isLength({ max: 255 }).trim().custom(safeTextRule),
    body('sort_order').optional().isInt({ min: 0, max: 999999 }),
    body('status').notEmpty().isIn(['0', '1']),
    validate,
];

// City Validator
export const cityValidator = [
    body('district_id').notEmpty().isInt(),
    body('city_name').notEmpty().isString().isLength({ max: 255 }).trim().custom(safeTextRule),
    body('pincode').optional().isString().isLength({ min: 4, max: 8 }),
    body('sort_order').optional().isInt({ min: 0, max: 999999 }),
    body('status').notEmpty().isIn(['0', '1']),
    validate,
];

// DeterminationofVigilanceAngle Validator
export const vigilanceAngleValidator = [
    body('name').notEmpty().isString().isLength({ max: 255 }).trim().custom(safeTextRule),
    body('sort_order').optional().isInt({ min: 0, max: 999999 }),
    body('status').notEmpty().isIn(['0', '1']),
    validate,
];

// ✅ Country Validator (Yahan add kiya)
export const countryValidator = [
    body('name').notEmpty().isString().isLength({ max: 255 }).trim().custom(safeTextRule),
    body('country_code').optional({ nullable: true }).isString().isLength({ max: 10 }).isAlphanumeric(),
    body('sort_order').optional().isInt({ min: 0, max: 999999 }),
    body('status').notEmpty().isIn(['0', '1']),
    validate,
];

// ✅ Disclosure Detail Validator (Yahan add kiya)
export const disclosureDetailValidator = [
    body('name').notEmpty().isString().isLength({ max: 255 }).trim().custom(safeTextRule),
    body('email').optional({ nullable: true }).isEmail().isLength({ max: 255 }),
    body('sort_order').optional().isInt({ min: 0, max: 999999 }),
    body('status').notEmpty().isIn(['0', '1']),
    validate,
];