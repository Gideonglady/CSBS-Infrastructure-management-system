import express from 'express';
import Issue from '../models/Issue.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/issues/create
// @desc    Create a new issue
// @access  Protected
router.post('/create', protect, async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            location,
            urgency,
            estimatedImpact,
            attachments,
            images,
            notifyAdmin,
            allowPublicView,
        } = req.body;

        console.log('Received Create Issue Body:', JSON.stringify(req.body, null, 2));

        // Validate required fields
        if (!title || !description || !category || !location) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields',
            });
        }

        // Create new issue
        const issue = await Issue.create({
            title,
            description,
            category,
            location,
            urgency,
            estimatedImpact,
            attachments: attachments || [],
            images: images || [],
            notifyAdmin: notifyAdmin !== undefined ? notifyAdmin : true,
            allowPublicView: allowPublicView || false,
            reporterId: req.user._id,
            reporterName: req.user.name,
            assignedTo: 'admin',
            assignedToName: 'Administrator',
            status: 'pending',
        });

        // Create notifications for all admin users
        if (notifyAdmin !== false) {
            try {
                // Find all admin users
                const adminUsers = await User.find({ role: 'admin', isActive: true });

                // Create notification for each admin
                const notificationPromises = adminUsers.map(admin =>
                    Notification.create({
                        userId: admin._id,
                        title: 'New Issue Reported',
                        message: `${req.user.name} reported: ${title}`,
                        type: 'info',
                        actionUrl: `/admin/issues?issueId=${issue._id.toString()}`,
                        metadata: {
                            issueId: issue._id.toString(),
                            reporterId: req.user._id.toString(),
                            reporterName: req.user.name,
                            category,
                        },
                    })
                );

                await Promise.all(notificationPromises);
                console.log(`Created notifications for ${adminUsers.length} admin(s)`);
            } catch (notificationError) {
                console.error('Error creating admin notifications:', notificationError);
                // Don't fail the issue creation if notification fails
            }
        }

        res.status(201).json({
            success: true,
            message: 'Issue created successfully',
            data: issue,
        });
    } catch (error) {
        console.error('Error creating issue:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating issue',
            error: error.message,
        });
    }
});

// @route   GET /api/issues
// @desc    Get all issues with optional filters
// @access  Protected
router.get('/', protect, async (req, res) => {
    try {
        const { status, category, reporterId } = req.query;

        // Build filter object
        const filter = {};
        if (status) filter.status = status;
        if (category) filter.category = category;
        if (reporterId) filter.reporterId = reporterId;

        // If user is not admin, only show their issues or public issues
        if (req.user.role !== 'admin') {
            filter.$or = [
                { reporterId: req.user._id },
                { allowPublicView: true },
            ];
        }

        const issues = await Issue.find(filter)
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            count: issues.length,
            data: issues,
        });
    } catch (error) {
        console.error('Error fetching issues:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching issues',
            error: error.message,
        });
    }
});

// @route   GET /api/issues/:id
// @desc    Get specific issue by ID
// @access  Protected
router.get('/:id', protect, async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Issue not found',
            });
        }

        // Check if user has access to this issue
        if (
            req.user.role !== 'admin' &&
            issue.reporterId.toString() !== req.user._id.toString() &&
            !issue.allowPublicView
        ) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            });
        }

        res.json({
            success: true,
            data: issue,
        });
    } catch (error) {
        console.error('Error fetching issue:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching issue',
            error: error.message,
        });
    }
});

// @route   PATCH /api/issues/:id/status
// @desc    Update issue status (admin only)
// @access  Protected (Admin)
router.patch('/:id/status', protect, async (req, res) => {
    try {
        const { status, comment } = req.body;

        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can update issue status',
            });
        }

        // Validate status
        const validStatuses = ['pending', 'in_progress', 'resolved', 'closed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value',
            });
        }

        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Issue not found',
            });
        }

        // Update status
        issue.status = status;

        // Add comment if provided
        if (comment || status) {
            issue.comments.push({
                userId: req.user._id.toString(),
                userName: req.user.name,
                content: comment || `Status changed to ${status}`,
                isInternal: false,
                createdAt: new Date(),
            });
        }

        await issue.save();

        // Notify reporter if issue is resolved
        if (status === 'resolved') {
            await Notification.create({
                userId: issue.reporterId,
                title: 'Issue Resolved',
                message: `Good news! Your issue "${issue.title}" has been resolved.`,
                type: 'success',
                read: false,
                metadata: {
                    issueId: issue._id,
                    category: issue.category
                }
            });
        }

        res.json({
            success: true,
            message: 'Issue status updated successfully',
            data: issue,
        });
    } catch (error) {
        console.error('Error updating issue status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating issue status',
            error: error.message,
        });
    }
});

// @route   POST /api/issues/:id/comment
// @desc    Add comment to issue
// @access  Protected
router.post('/:id/comment', protect, async (req, res) => {
    try {
        const { content, isInternal } = req.body;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required',
            });
        }

        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Issue not found',
            });
        }

        // Check if user has access to this issue
        if (
            req.user.role !== 'admin' &&
            issue.reporterId.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            });
        }

        // Add comment
        issue.comments.push({
            userId: req.user._id.toString(),
            userName: req.user.name,
            content,
            isInternal: isInternal || false,
            createdAt: new Date(),
        });

        await issue.save();

        res.json({
            success: true,
            message: 'Comment added successfully',
            data: issue,
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding comment',
            error: error.message,
        });
    }
});

export default router;
