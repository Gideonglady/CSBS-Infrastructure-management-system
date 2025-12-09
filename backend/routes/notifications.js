import express from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get all notifications for logged-in user
// @access  Protected
router.get('/', protect, async (req, res) => {
    try {
        // Build query based on user role
        let query = { userId: req.user._id };

        // For non-admin users, exclude "New Issue Reported" notifications
        // These are only relevant for admins who need to see all new issues
        if (req.user.role !== 'admin') {
            query.title = { $ne: 'New Issue Reported' };
        }

        const notifications = await Notification.find(query)
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

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Protected
router.delete('/:id', protect, async (req, res) => {
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

        await Notification.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Notification deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting notification',
            error: error.message,
        });
    }
});

// @route   DELETE /api/notifications/cleanup/duplicates
// @desc    Remove duplicate notifications (admin or self-cleanup)
// @access  Protected
router.delete('/cleanup/duplicates', protect, async (req, res) => {
    try {
        // Find duplicate "Issue Resolved" notifications for this user
        const duplicates = await Notification.aggregate([
            {
                $match: { 
                    userId: req.user._id,
                    title: 'Issue Resolved'
                }
            },
            {
                $group: {
                    _id: { issueId: '$metadata.issueId' },
                    notifications: { 
                        $push: { 
                            id: '$_id', 
                            createdAt: '$createdAt' 
                        } 
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $match: { count: { $gt: 1 } }
            }
        ]);

        let deletedCount = 0;

        // For each group of duplicates, keep the most recent and delete the rest
        for (const dup of duplicates) {
            const sorted = dup.notifications.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            const toDelete = sorted.slice(1).map(n => n.id);
            const result = await Notification.deleteMany({ _id: { $in: toDelete } });
            deletedCount += result.deletedCount || 0;
        }

        res.json({
            success: true,
            message: `Removed ${deletedCount} duplicate notifications`,
            deletedCount,
        });
    } catch (error) {
        console.error('Error cleaning up duplicate notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Error cleaning up duplicates',
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
