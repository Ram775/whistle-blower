import { User, Setting } from '../models/index.js';
import { decryptClientIdNumber } from '../utils/encryption.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const generateToken = (user, role = 'customer') => {
    return jwt.sign(
        { id: user.id, role_id: user.role_id, type: role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
};

export const accountLogin = async (req, res) => {
    try {
        const { id_type, id_number, dob } = req.body;

        const memberId = decryptClientIdNumber(id_number);
        if (memberId === null) {
            return res.status(400).json({ status: false, message: 'Unable to verify ID Number.' });
        }

        const idHash = User.hashIdNumber(memberId);

        const user = await User.findOne({
            where: { id_type, id_number_hash: idHash, dob, role_id: 3, status: '1' }
        });

        if (!user) {
            return res.status(401).json({ status: false, message: 'Invalid Login Details' });
        }

        const token = generateToken(user, 'customer');

        return res.status(200).json({
            status: true,
            message: 'Successfully Login',
            token,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email_id: user.email_id,
                role_id: user.role_id
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};

export const logout = async (req, res) => {
    return res.status(200).json({ status: true, message: 'Successfully Logout' });
};

export const checkCorrectPassword = async (req, res) => {
    try {
        const { corrent_value_check } = req.body;
        const secret = process.env.BANNER_TOGGLE_SECRET;

        if (!secret) {
            return res.status(500).json({ status: false, message: 'Server configuration error' });
        }

        const submitted = Buffer.from(corrent_value_check || '');
        const serverSecret = Buffer.from(secret);

        let isMatch = false;
        if (submitted.length === serverSecret.length) {
            isMatch = crypto.timingSafeEqual(submitted, serverSecret);
        }

        if (isMatch) {
            await Setting.update({ config_value: '0' }, { where: { config_key: 'is_banner_active' } });
            return res.status(200).json({ status: true });
        }
        return res.status(200).json({ status: false });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};

export const getRegistrationData = async (req, res) => {
    try {
        return res.status(200).json({ status: true, message: 'Data fetched successfully' });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};