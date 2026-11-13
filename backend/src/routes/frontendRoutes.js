import express from 'express';
import {
    accountLogin,
    logout,
    checkCorrectPassword,
    getRegistrationData
} from '../controllers/FrontendController.js';
import {
    accountLoginValidator,
    checkCorrectPasswordValidator
} from '../validators/frontendValidator.js';

const router = express.Router();

// Public Routes
router.post('/account_login', accountLoginValidator, accountLogin);
router.post('/check_correct_password', checkCorrectPasswordValidator, checkCorrectPassword);
router.get('/registration-data', getRegistrationData);

// Logout
router.post('/logout', logout);

export default router;