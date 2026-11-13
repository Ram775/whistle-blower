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

// Custom Rule: No HTML/Script Tags
const noHtmlTags = (value) => {
    if (/<[^>]*>/g.test(value) || /<script\b[^>]*>(.*?)<\/script>/is.test(value)) {
        throw new Error('Field contains forbidden HTML/script tags.');
    }
    return true;
};

// Submit Complaint (Public Registration)
export const submitComplaintValidator = [
    body('id_type')
        .notEmpty().withMessage('Please Select Identity Type')
        .isIn(['PAN Number', 'Passport Number', 'VoterID Number', 'Adhar Number', 'Employee ID']),
    body('id_number')
        .notEmpty().withMessage('Please Enter Id Number')
        .isString().isLength({ max: 512 }),
    body('dob')
        .notEmpty().withMessage('Please Select DOB')
        .isDate()
        .custom((value) => {
            const dob = new Date(value);
            const eighteenYearsAgo = new Date();
            eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
            if (dob > eighteenYearsAgo) throw new Error('You must be at least 18 years old');
            return true;
        }),
    body('district_id').notEmpty().withMessage('Please Select District').isInt(),
    body('city_id').notEmpty().withMessage('Please Select City').isInt(),
    body('city_name')
        .if(body('city_id').equals('0'))
        .notEmpty().withMessage('City name required')
        .isString().isLength({ max: 100 })
        .custom(noHtmlTags),
    body('state_id').notEmpty().isInt(),
    body('eligibility_of_whistle_blower')
        .notEmpty()
        .isIn([
            'Director of the Corporation', 'Employee', 'Trainee', 'Auditor',
            'Third party consultant', 'Service provider', 'Vendor'
        ]),
    body('disclosure_against').notEmpty().isInt(),
    body('sr_number').notEmpty().withMessage('This Field Is Required').isString().isLength({ max: 100 }),
    body('first_name').notEmpty().isString().isLength({ max: 100 }).custom(noHtmlTags),
    body('last_name').notEmpty().isString().isLength({ max: 100 }).custom(noHtmlTags),
    body('email_id').notEmpty().isEmail().isLength({ max: 150 }),
    body('mobile_no').notEmpty().matches(/^[0-9]{10}$/).withMessage('Mobile number must be 10 digits'),
    body('gender').notEmpty().isIn(['Male', 'Female', 'Transgender', 'Does Not Wish To Say']),
    body('pincode').notEmpty().matches(/^[0-9]{6}$/).withMessage('Pincode must be 6 digits'),
    body('complaint_description').notEmpty().isLength({ max: 3000 }).custom(noHtmlTags),
    body('remarks').optional({ nullable: true }).isLength({ max: 3000 }).custom(noHtmlTags),
    validate,
];

// Submit New Complaint (Logged-in Customer)
export const submitNewComplaintValidator = [
    body('complaint_description').notEmpty().isLength({ max: 3000 }).custom(noHtmlTags),
    body('remarks').notEmpty().isLength({ max: 3000 }).custom(noHtmlTags),
    validate,
];