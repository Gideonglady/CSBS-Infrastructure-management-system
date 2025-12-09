import express from 'express';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', authMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view users'
            });
        }

        // Fetch users, excluding password, and populate assigned locations
        const users = await User.find()
            .select('-password')
            .populate('assignedLocations', 'name type building floor department')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching users'
        });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user (Admin only)
// @access  Private/Admin
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete users'
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent deleting self (optional but good practice)
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete yourself'
            });
        }

        await user.deleteOne();

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting user'
        });
    }
});

// @route   PUT /api/users/:id/locations
// @desc    Update user's assigned locations (Admin only)
// @access  Private/Admin
router.put('/:id/locations', authMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update user locations'
            });
        }

        const { assignedLocations } = req.body;

        if (!Array.isArray(assignedLocations)) {
            return res.status(400).json({
                success: false,
                message: 'assignedLocations must be an array'
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.assignedLocations = assignedLocations;
        await user.save();

        res.json({
            success: true,
            message: 'User locations updated successfully',
            data: user.toJSON()
        });
    } catch (error) {
        console.error('Update user locations error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating user locations'
        });
    }
});

// @route   GET /api/users/me/locations
// @desc    Get current user's assigned locations
// @access  Private
router.get('/me/locations', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('assignedLocations')
            .select('assignedLocations');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user.assignedLocations || []
        });
    } catch (error) {
        console.error('Get user locations error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user locations'
        });
    }
});

export default router;
