import express from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get all notifications for logged-in user
// @access  Protected
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .lean();

        const unreadCount = notifications.filter(n => !n.read).length;

        res.json({
            success: true,
            count: notifications.length,
            unreadCount,
            data: notifications,
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications',
            error: error.message,
        });
    }
});

// @route   PATCH /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Protected
router.patch('/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            });
        }

        // Check if notification belongs to the user
        if (notification.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            });
        }

        notification.read = true;
        await notification.save();

        res.json({
            success: true,
            message: 'Notification marked as read',
            data: notification,
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating notification',
            error: error.message,
        });
    }
});

// @route   PATCH /api/notifications/read-all
// @desc    Mark all notifications as read for logged-in user
// @access  Protected
router.patch('/read-all', protect, async (req, res) => {
    try {
        const result = await Notification.updateMany(
            { userId: req.user._id, read: false },
            { $set: { read: true } }
        );

        res.json({
            success: true,
            message: 'All notifications marked as read',
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating notifications',
            error: error.message,
        });
    }
});

// @route   POST /api/notifications
// @desc    Create a new notification (internal use or admin)
// @access  Protected
router.post('/', protect, async (req, res) => {
    try {
        const { userId, title, message, type, actionUrl, metadata } = req.body;

        // Validate required fields
        if (!userId || !title || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please provide userId, title, and message',
            });
        }

        const notification = await Notification.create({
            userId,
            title,
            message,
            type: type || 'info',
            actionUrl,
            metadata: metadata || {},
        });

        res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            data: notification,
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating notification',
            error: error.message,
        });
    }
});

export default router;
