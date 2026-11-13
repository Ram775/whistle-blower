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

// Customer Login (id_type, id_number, dob)
export const accountLoginValidator = [
    body('id_type')
        .notEmpty().withMessage('Please Select Identify By')
        .isIn(['PAN Number', 'Passport Number', 'VoterID Number', 'Adhar Number', 'Employee ID'])
        .withMessage('Invalid ID Type'),
    body('id_number')
        .notEmpty().withMessage('Please Enter Id Number')
        .isString().withMessage('ID Number must be string')
        .isLength({ max: 512 }).withMessage('ID Number too long'),
    body('dob')
        .notEmpty().withMessage('Please Select DOB')
        .isDate().withMessage('Invalid Date Format'),
    validate,
];

// Banner Toggle Secret Check
export const checkCorrectPasswordValidator = [
    body('corrent_value_check')
        .notEmpty().withMessage('Secret is required')
        .isString(),
    validate,
];