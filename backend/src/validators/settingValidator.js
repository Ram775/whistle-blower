import { body, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ status: false, message: 'Validation Error', errors: errors.array() });
    }
    next();
};

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

const safeTextRule = (value) => {
    if (/<[^>]*>/g.test(value)) throw new Error('Field contains forbidden HTML tags.');
    return true;
};

const imagePathRule = (value) => {
    if (!value) return true;
    if (!/^[A-Za-z0-9_\-\/.]+$/.test(value)) {
        throw new Error('Invalid image path format.');
    }
    return true;
};

export const settingValidator = [
    body('config_company_name').optional({ checkFalsy: true }).isString().isLength({ max: 255 }).custom(safeTextRule),
    body('config_company_email').optional({ checkFalsy: true }).isEmail().isLength({ max: 255 }),
    body('config_company_address').optional({ checkFalsy: true }).isString().isLength({ max: 500 }),
    body('config_company_mobile_number').optional({ checkFalsy: true }).isString().isLength({ max: 100 }),
    body('config_company_landline_number').optional({ checkFalsy: true }).isString().isLength({ max: 100 }),

    // ✅ URLs (checkFalsy: true => Empty string valid hai)
    body('config_google_map_address_link').optional({ checkFalsy: true }).isURL().isLength({ max: 500 }),
    body('config_facebook').optional({ checkFalsy: true }).isURL().isLength({ max: 500 }),
    body('config_instagram').optional({ checkFalsy: true }).isURL().isLength({ max: 500 }),
    body('config_linkedin').optional({ checkFalsy: true }).isURL().isLength({ max: 500 }),
    body('config_twitter').optional({ checkFalsy: true }).isURL().isLength({ max: 500 }),
    body('config_you_tube').optional({ checkFalsy: true }).isURL().isLength({ max: 500 }),

    // Emails
    body('config_getting_contact_details_email').optional({ checkFalsy: true }).custom(emailListRule),
    body('config_career_inquiry_details_email').optional({ checkFalsy: true }).custom(emailListRule),
    body('config_getting_complaint_email').optional({ checkFalsy: true }).custom(emailListRule),

    // Images
    body('company_logo').optional({ checkFalsy: true }).isString().custom(imagePathRule),
    body('company_fav_logo').optional({ checkFalsy: true }).isString().custom(imagePathRule),
    body('config_home_page_produce_the_bg_image').optional({ checkFalsy: true }).isString().custom(imagePathRule),

    body('is_banner_active').optional({ checkFalsy: true }).isIn(['0', '1']),
    validate,
];

export const sliderValidator = [
    body('image').notEmpty().isString().isLength({ max: 255 }).custom(imagePathRule),
    body('alt_tag').optional({ checkFalsy: true }).isString().isLength({ max: 255 }).custom(safeTextRule),
    body('sort_order').optional({ checkFalsy: true }).isInt({ min: 0, max: 999999 }),
    body('status').notEmpty().isIn(['0', '1']),
    validate,
];