import { body, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ status: false, message: 'Validation Error', errors: errors.array() });
    }
    next();
};

// Upload Image Validator
export const uploadImageValidator = [
    body('save_folder')
        .notEmpty().withMessage('Folder name is required')
        .matches(/^[A-Za-z0-9_\-]+$/).withMessage('Invalid upload destination'),
    validate,
];

// Country Validator
export const countryValidator = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isString().isLength({ max: 255 })
        .custom((value) => {
            if (/<[^>]*>/g.test(value)) throw new Error('Field contains forbidden HTML tags.');
            return true;
        }),
    body('country_code').optional({ nullable: true }).isString().isLength({ max: 10 }).isAlphanumeric(),
    body('sort_order').optional({ nullable: true }).isInt({ min: 0, max: 999999 }),
    body('status').notEmpty().isIn(['0', '1']),
    validate,
];