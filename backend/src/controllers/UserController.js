import { User,PasswordReset } from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Op } from 'sequelize';

import { sendOtpMail, sendResetLinkEmail,sendLoginAlertEmail, sendAccountBlockedEmail} from '../utils/mailer.js';
import { getSecurityContext } from '../utils/security.js';
import { sendSecurityAlertEmail } from '../utils/mailer.js';



// ==============================
// Helper: Password Compare (Laravel compatible)
// ==============================
const comparePassword = async (plainPassword, hashedPassword) => {
    if (!hashedPassword) return false;
    // Laravel uses $2y$ but bcryptjs uses $2a$. Convert both to $2a$.
    const normalizedHash = hashedPassword.replace(/^\$2y\$/, '$2a$');
    return await bcrypt.compare(plainPassword, normalizedHash);
};

// ==============================
// Helper: Hash Password
// ==============================
const hashPassword = async (plainPassword) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(plainPassword, salt);
};

// ==============================
// 1. Admin Login
// ==============================


export const loginSubmit = async (req, res) => {
    try {
        const { email, password } = req.body;
        const security = getSecurityContext(req);

        const user = await User.findOne({
            where: { email_id: email, role_id: [1, 2], status: '1' }
        });

        if (!user) {
            return res.status(401).json({
                status: false,
                message: 'Invalid Credentials',
                attempts_remaining: null
            });
        }

        const isMatch = await comparePassword(password, user.password);
        
        // ❌ Wrong Password
        if (!isMatch) {
            const remaining = parseInt(req.rateLimit?.remaining || 4);
            const willBlock = remaining <= 1;

            // ✅ Email Alert bhejo
            await sendSecurityAlertEmail(user.email_id, {
                type: 'LOGIN_FAILED',
                name: user.first_name,
                ip: security.ip,
                userAgent: security.userAgent,
                timestamp: security.timestamp,
                attemptsLeft: remaining,
                blocked: willBlock
            });

            return res.status(401).json({
                status: false,
                message: `Invalid Credentials. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
                attempts_remaining: remaining
            });
        }

        // ✅ Successful Login - Alert bhejo
        await sendSecurityAlertEmail(user.email_id, {
            type: 'LOGIN_SUCCESS',
            name: user.first_name,
            ip: security.ip,
            userAgent: security.userAgent,
            timestamp: security.timestamp
        });

        const token = jwt.sign(
            { id: user.id, role_id: user.role_id, type: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        return res.status(200).json({
            status: true,
            message: 'Login Successful',
            token,
            user: {
                id: user.id,
                role_id: user.role_id,
                first_name: user.first_name,
                last_name: user.last_name,
                email_id: user.email_id,
                mobile_no: user.mobile_no
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};

// ==============================
// 2. Dashboard Stats
// ==============================
export const dashboard = async (req, res) => {
    try {
        const { Complaint } = await import('../models/index.js');
        const role_id = req.user.role_id;

        if (role_id === 1) {
            const registered_complaint = await Complaint.count();
            const underprocessing_complaint = await Complaint.count({ where: { complaint_status: 2 } });
            const completed_complaint = await Complaint.count({ where: { complaint_status: 3 } });
            const pending_complaint = await Complaint.count({ where: { complaint_status: 1 } });

            return res.status(200).json({
                status: true,
                data: { registered_complaint, underprocessing_complaint, completed_complaint, pending_complaint }
            });
        } else {
            const registered_complaint = await Complaint.count({ where: { complaint_status: 1 } });
            const underprocessing_complaint = await Complaint.count({ where: { complaint_status: 2 } });
            const completed_complaint = await Complaint.count({ where: { complaint_status: 3 } });

            return res.status(200).json({
                status: true,
                data: { registered_complaint, underprocessing_complaint, completed_complaint }
            });
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};

// ==============================
// 3. Check Email Duplication
// ==============================
export const checkEmailDuplication = async (req, res) => {
    try {
        const { email_id, id } = req.body;
        let check_dup = null;

        if (email_id) {
            const whereClause = { email_id };
            if (id) whereClause.id = { [Op.ne]: id };
            check_dup = await User.findOne({ where: whereClause });
        }

        return res.status(200).json({ success: true, status: !!check_dup });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// ==============================
// 4. Check Duplication (Email OR id_number)
// ==============================
export const checkDuplication = async (req, res) => {
    try {
        const { email_id, id_number } = req.body;
        let check_dup = null;

        if (email_id) {
            check_dup = await User.findOne({ where: { email_id } });
        } else if (id_number) {
            const hash = User.hashIdNumber(id_number);
            check_dup = await User.findOne({ where: { id_number_hash: hash } });
        }

        // Laravel returns plain text "true" / "false"
        return res.send(check_dup ? 'false' : 'true');
    } catch (error) {
        return res.send('true');
    }
};

// ==============================
// 5. Forgot Password
// ==============================
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const { PasswordReset } = await import('../models/index.js');
        const { sendOtpMail } = await import('../utils/mailer.js');

        // ✅ Token generate (crypto.randomBytes ke liye crypto import zaroori hai)
        const token = crypto.randomBytes(32).toString('hex');

        const email_exist = await User.findOne({
            where: { email_id: email, status: '1', role_id: [1, 2] }
        });

        if (!email_exist) {
            return res.status(404).json({ 
                status: false, 
                message: 'This email is not registered as an Admin.' 
            });
        }

        await PasswordReset.create({
            email: email,
            token: token,
            created_at: new Date()
        });

        await email_exist.update({ remember_token: token });

        // ✅ Reset Link (Frontend route: /admin/reset-password/:token)
        const resetLink = `${process.env.FRONTEND_URL}/admin/reset-password/${token}`;
        
        await sendOtpMail(email, `Click here to reset your password: ${resetLink}`);

        return res.status(200).json({
            status: true,
            message: 'Password reset link sent to your registered email id'
        });
    } catch (error) {
        console.error('Forgot Password Error:', error); // ✅ Log karo taaki pata chale error kya hai
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};

// ==============================
// 6. Reset Password (validate token, set new password)
// ==============================
export const postPassword = async (req, res) => {
    try {
        const { remember_token } = req.params;
        const { new_password, confirm_new_password } = req.body;
        const security = getSecurityContext(req);

        if (new_password !== confirm_new_password) {
            return res.status(400).json({ status: false, message: 'Passwords do not match' });
        }

        const user = await User.findOne({ where: { remember_token } });

        if (!user) {
            return res.status(404).json({ status: false, message: 'Invalid Reset Token' });
        }

        const hashed = await hashPassword(new_password);
        await user.update({ password: hashed, remember_token: '' });

        // ✅ Password Reset Complete Alert
        await sendSecurityAlertEmail(user.email_id, {
            type: 'PASSWORD_CHANGED',
            name: user.first_name,
            ip: security.ip,
            userAgent: security.userAgent,
            timestamp: security.timestamp,
            extraMessage: 'Your password has been reset successfully via the reset link. You can now login with your new password.'
        });

        return res.status(200).json({ status: true, message: 'Password reset successfully!' });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};

// ==============================
// 7. Profile (get logged-in user)
// ==============================
export const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password', 'remember_token', 'id_number_hash'] }
        });
        if (!user) return res.status(404).json({ status: false, message: 'User not found' });
        return res.status(200).json({ status: true, data: user });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};

// ==============================
// 8. Update Profile
// ==============================
export const updateProfile = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { first_Name, last_Name, email_id, mobile_no } = req.body;

        // Check email not taken by someone else
        const existing = await User.findOne({
            where: {
                email_id,
                id: { [Op.ne]: user_id }
            }
        });
        if (existing) {
            return res.status(400).json({ status: false, message: 'Email already in use' });
        }

        await User.update(
            {
                first_name: first_Name,
                last_name: last_Name || null,
                email_id: email_id,
                mobile_no: mobile_no || null
            },
            { where: { id: user_id } }
        );

        return res.status(200).json({ status: true, message: 'Successfully Submitted' });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Something went wrong' });
    }
};

// ==============================
// 9. Update Password (old + new)
// ==============================
export const updatePassword = async (req, res) => {
    try {
        const { old_password, new_password } = req.body;
        const user = await User.findByPk(req.user.id);
        const security = getSecurityContext(req);

        const isMatch = await comparePassword(old_password, user.password);
        if (!isMatch) {
            // ❌ Old password galat
            await sendSecurityAlertEmail(user.email_id, {
                type: 'LOGIN_FAILED',
                name: user.first_name,
                ip: security.ip,
                userAgent: security.userAgent,
                timestamp: security.timestamp,
                extraMessage: 'An attempt was made to change your password using an incorrect old password.'
            });

            return res.status(400).json({
                status: false,
                message: 'Your Old Password Does Not Match With The Provided Password.'
            });
        }

        const hashed = await hashPassword(new_password);
        await user.update({ password: hashed });

        // ✅ Password Changed Alert
        await sendSecurityAlertEmail(user.email_id, {
            type: 'PASSWORD_CHANGED',
            name: user.first_name,
            ip: security.ip,
            userAgent: security.userAgent,
            timestamp: security.timestamp
        });

        return res.status(200).json({ status: true, message: 'Your Password Updated Successfully' });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};

// ==============================
// 10. List Users (exclude admin & customers)
// ==============================
export const listUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'first_name', 'middle_name', 'last_name', 'email_id', 'mobile_no', 'status'],
            where: {
                role_id: { [Op.notIn]: [1, 3] } // <-- YAHAN OP USE KAR
            }
        });

        const data = users.map((row, key) => ({
            id: row.id,
            srno: key + 1,
            full_name: `${row.first_name || ''} ${row.middle_name || ''} ${row.last_name || ''}`.trim(),
            email_id: row.email_id,
            mobile_no: row.mobile_no,
            status: row.status
        }));

        return res.status(200).json({ status: true, data });
    } catch (error) {
        console.error('listUsers error:', error); // <-- Isse terminal me exact error dikhega
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};

// ==============================
// 11. Store User (Create)
// ==============================
export const storeUser = async (req, res) => {
    try {
        const { first_name, middle_name, last_name, email_id, mobile_no, password, status } = req.body;

        // Duplicate email check
        const existing = await User.findOne({ where: { email_id } });
        if (existing) {
            return res.status(400).json({ status: false, message: 'Email already exists' });
        }

        const hashed = await hashPassword(password);

        await User.create({
            first_name,
            middle_name: middle_name || null,
            last_name: last_name || null,
            email_id,
            mobile_no,
            password: hashed,
            status,
            role_id: 2 // Force role to 2 (vigilance), never trust client
        });

        return res.status(201).json({ status: true, message: 'Data Successfully Submitted' });
    } catch (error) {
        console.error('storeUser:', error);
        return res.status(500).json({ status: false, message: 'Something went wrong' });
    }
};

// ==============================
// 12. Edit User (get single)
// ==============================
export const editUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password', 'remember_token', 'id_number_hash'] }
        });
        if (!user) return res.status(404).json({ status: false, message: 'User not found' });
        return res.status(200).json({ status: true, data: user });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};

// ==============================
// 13. Update User
// ==============================
export const updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const { first_name, middle_name, last_name, email_id, mobile_no, password, status } = req.body;

        // Duplicate email check (excluding self)
        const existing = await User.findOne({
             where: { email_id, id: { [Op.ne]: id } }
        });
        if (existing) {
            return res.status(400).json({ status: false, message: 'Email already exists' });
        }

        const data = {
            first_name,
            middle_name: middle_name || null,
            last_name: last_name || null,
            email_id,
            mobile_no,
            status
        };

        if (password && password.trim() !== '') {
            data.password = await hashPassword(password);
        }

        await User.update(data, { where: { id } });

        return res.status(200).json({ status: true, message: 'Data Successfully Updated' });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Something went wrong' });
    }
};

// ==============================
// 14. Change Status (toggle)
// ==============================
export const changeStatus = async (req, res) => {
    try {
        const { status_id, status } = req.body;

        await User.update({ status }, { where: { id: status_id } });

        return res.status(200).json({
            status: true,
            message: 'Status successfully updated'
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Something went wrong' });
    }
};




// ✅ Step 1: Send OTP for Password Reset
export const sendResetOtp = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists (Admin ya Vigilance)
        const email_exist = await User.findOne({ 
            where: { email_id: email, status: '1', role_id: [1, 2] } 
        });

        if (!email_exist) {
            return res.status(404).json({ 
                status: false, 
                message: 'This email is not registered as an Admin.' 
            });
        }

        // Generate OTP (6 digits)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Token me OTP aur Email store karo (5 min validity)
        const otpToken = jwt.sign(
            { otp, email, purpose: 'password_reset' },
            process.env.JWT_SECRET,
            { expiresIn: '5m' }
        );

        // OTP Email bhejo
        await sendOtpMail(email, otp);

        return res.status(200).json({
            status: true,
            message: 'OTP sent to your email.',
            otp_token: otpToken
        });
    } catch (error) {
        console.error('Send Reset OTP Error:', error);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};



export const verifyResetOtp = async (req, res) => {
    try {
        const { email, otp, otp_token } = req.body;
        const security = getSecurityContext(req);

        // 1. OTP Token verify karo
        let decoded;
        try {
            decoded = jwt.verify(otp_token, process.env.JWT_SECRET);
        } catch (e) {
            return res.status(400).json({ status: false, message: 'OTP expired or invalid.' });
        }

        // 2. OTP Content verify karo
        if (decoded.purpose !== 'password_reset' || decoded.email !== email) {
            return res.status(400).json({ status: false, message: 'Invalid verification request.' });
        }

        if (decoded.otp !== otp) {
            return res.status(400).json({ status: false, message: 'Invalid OTP.' });
        }

        // 3. Reset Token generate karo
        const resetToken = crypto.randomBytes(32).toString('hex');

        // 4. DB me save karo
        await PasswordReset.create({
            email: email,
            token: resetToken,
            created_at: new Date()
        });

        await User.update(
            { remember_token: resetToken },
            { where: { email_id: email } }
        );

        // 5. Reset Link email pe bhejo
        const resetLink = `${process.env.FRONTEND_URL}/admin/reset-password/${resetToken}`;
        await sendResetLinkEmail(email, resetLink);

        // ✅ 6. Security Alert bhejo (IP, Time, Device ke saath)
        const user = await User.findOne({ where: { email_id: email } });
        if (user) {
            await sendSecurityAlertEmail(email, {
                type: 'PASSWORD_RESET',
                name: user.first_name || 'User',
                ip: security.ip,
                userAgent: security.userAgent,
                timestamp: security.timestamp,
                extraMessage: 'A password reset link has been sent to your email. Click the link in the other email to reset your password.'
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Password reset link sent to your email.'
        });

    } catch (error) {
        console.error('Verify Reset OTP Error:', error);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};