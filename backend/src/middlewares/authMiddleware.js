import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ status: false, message: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password', 'remember_token', 'id_number_hash'] }
        });

        if (!user) {
            return res.status(401).json({ status: false, message: 'Unauthorized: User not found' });
        }

        if (user.status !== '1') {
            return res.status(403).json({ status: false, message: 'Account is inactive' });
        }

        req.user = user;
        req.userType = decoded.type;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ status: false, message: 'Token expired. Please login again.' });
        }
        return res.status(401).json({ status: false, message: 'Invalid token' });
    }
};

export const allowRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        }
        if (!allowedRoles.includes(Number(req.user.role_id))) {
            return res.status(403).json({ 
                status: false, 
                message: 'Forbidden: You do not have permission to access this resource' 
            });
        }
        next();
    };
};