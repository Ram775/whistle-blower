import { body, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ status: false, message: 'Validation Error', errors: errors.array() });
    }
    next();
};

// Frontend Login (Customer)
export const accountLoginValidator = [
    body('id_type')
        .notEmpty().withMessage('Please Select Identify By')
        .isIn(['PAN Number', 'Passport Number', 'VoterID Number', 'Adhar Number', 'Employee ID']).withMessage('Invalid ID Type'),
    body('id_number')
        .notEmpty().withMessage('Please Enter Id Number')
        .isString().isLength({ max: 512 }),
    body('dob')
        .notEmpty().withMessage('Please Select DOB')
        .isDate().withMessage('Invalid Date Format'),
    validate,
];

// Check Correct Password (Banner Toggle)
export const checkCorrectPasswordValidator = [
    body('corrent_value_check')
        .notEmpty().withMessage('Secret is required')
        .isString(),
    validate,
];