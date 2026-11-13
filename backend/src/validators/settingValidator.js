import { body, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ status: false, message: 'Validation Error', errors: errors.array() });
    }
    next();
};

// Custom Rule: Comma separated valid emails
const emailListRule = (value) => {
    if (!value) return true;
    const emails = value.split(',').map(e => e.trim()).filter(e => e);
    for (let email of emails) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error('Must contain valid email address(es).');
        }
    }
    return true;
};

// Custom Rule: No malicious HTML (SafeTextRule)
const safeTextRule = (value) => {
    if (/<[^>]*>/g.test(value)) throw new Error('Field contains forbidden HTML tags.');
    return true;
};

// Image path regex (Laravel: /^[A-Za-z0-9_\-\/.]+$/)
const imagePathRule = (value) => {
    if (!value) return true;
    if (!/^[A-Za-z0-9_\-\/.]+$/.test(value)) {
        throw new Error('Invalid image path format.');
    }
    return true;
};

export const settingValidator = [
    body('config_company_name').optional({ nullable: true }).isString().isLength({ max: 255 }).custom(safeTextRule),
    body('config_company_email').optional({ nullable: true }).isEmail().isLength({ max: 255 }),
    body('config_company_address').optional({ nullable: true }).isString().isLength({ max: 500 }).matches(/^[\p{L}\p{N}\s.,#\-\/&()\x27]*$/u),
    body('config_company_mobile_number').optional({ nullable: true }).matches(/^[0-9+\-\s]{1,20}$/),
    
    // URLs
    body('config_google_map_address_link').optional({ nullable: true }).isURL().isLength({ max: 500 }),
    body('config_facebook').optional({ nullable: true }).isURL().isLength({ max: 500 }),
    body('config_instagram').optional({ nullable: true }).isURL().isLength({ max: 500 }),
    body('config_linkedin').optional({ nullable: true }).isURL().isLength({ max: 500 }),
    body('config_twitter').optional({ nullable: true }).isURL().isLength({ max: 500 }),
    body('config_you_tube').optional({ nullable: true }).isURL().isLength({ max: 500 }),

    // Email Lists
    body('config_getting_contact_details_email').optional({ nullable: true }).isString().isLength({ max: 1000 }).custom(emailListRule),
    body('config_career_inquiry_details_email').optional({ nullable: true }).isString().isLength({ max: 1000 }).custom(emailListRule),
    body('config_getting_complaint_email').optional({ nullable: true }).isString().isLength({ max: 1000 }).custom(emailListRule),

    // Images (Frontend will send filename)
    body('company_logo').optional({ nullable: true }).isString().isLength({ max: 255 }).custom(imagePathRule),
    body('company_fav_logo').optional({ nullable: true }).isString().isLength({ max: 255 }).custom(imagePathRule),
    body('config_home_page_produce_the_bg_image').optional({ nullable: true }).isString().isLength({ max: 255 }).custom(imagePathRule),
    
    // Edit fallbacks (agar nayi file na aayi ho)
    body('edit_company_logo').optional({ nullable: true }).isString().isLength({ max: 255 }),
    body('edit_company_fav_logo').optional({ nullable: true }).isString().isLength({ max: 255 }),
    body('edit_config_home_page_produce_the_bg_image').optional({ nullable: true }).isString().isLength({ max: 255 }),

    body('is_banner_active').optional({ nullable: true }).isIn(['0', '1']),
    validate,
];

export const sliderValidator = [
    body('image').notEmpty().isString().isLength({ max: 255 }).custom(imagePathRule),
    body('alt_tag').optional({ nullable: true }).isString().isLength({ max: 255 }).custom(safeTextRule),
    body('sort_order').optional({ nullable: true }).isInt({ min: 0, max: 999999 }),
    body('status').notEmpty().isIn(['0', '1']),
    validate,
];