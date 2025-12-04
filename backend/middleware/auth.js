import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No authentication token, access denied'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'User account is inactive'
            });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        // Check if it's an SSL/TLS error
        if (error.message && error.message.includes('SSL') || error.message.includes('TLS')) {
            console.error('SSL/TLS Error in auth middleware:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Database connection error. Please try again.'
            });
        }

        // JWT verification errors
        if (error.name === 'JsonWebTokenError') {
            console.error('Invalid token:', error.message);
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token'
            });
        }

        if (error.name === 'TokenExpiredError') {
            console.error('Token expired:', error.message);
            return res.status(401).json({
                success: false,
                message: 'Authentication token has expired'
            });
        }

        console.error('Auth middleware error:', error.message);
        res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

export const protect = authMiddleware;
export default authMiddleware;

