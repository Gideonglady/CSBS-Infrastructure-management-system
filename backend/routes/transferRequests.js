import express from 'express';
import TransferRequest from '../models/TransferRequest.js';
import LabSystem from '../models/LabSystem.js';
import Laboratory from '../models/Laboratory.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { canTransferFromLocation, validateDestinationLocation } from '../middleware/transferAuth.js';

const router = express.Router();

// @route   POST /api/transfer-requests
// @desc    Create a new transfer request
// @access  Protected (Staff/Lab Technician from assigned location)
router.post(
    '/',
    [protect, canTransferFromLocation, validateDestinationLocation],
    async (req, res) => {
        try {
            const { equipmentId, sourceLocation, destinationLocation, notes } = req.body;

            // Get equipment details for snapshot
            const equipment = await LabSystem.findById(equipmentId);
            if (!equipment) {
                return res.status(404).json({
                    success: false,
                    message: 'Equipment not found'
                });
            }

            // Create equipment snapshot
            const equipmentSnapshot = {
                sysID: equipment.sysID,
                processor: equipment.processor,
                ram: equipment.ram,
                hdd: equipment.hdd,
                softwareAvailable: equipment.softwareAvailable,
                equipment: equipment.equipment,
            };

            // Create transfer request
            const transferRequest = await TransferRequest.create({
                equipmentId,
                equipmentType: 'system',
                sourceLocation,
                destinationLocation,
                requestedBy: req.user._id,
                notes,
                equipmentSnapshot,
            });

            // Populate references
            await transferRequest.populate([
                { path: 'sourceLocation', select: 'name type building floor' },
                { path: 'destinationLocation', select: 'name type building floor' },
                { path: 'requestedBy', select: 'name email' },
            ]);

            // Notify all admins about the new transfer request
            try {
                const admins = await User.find({ role: 'admin', isActive: true });
                const notifications = admins.map(admin => ({
                    userId: admin._id,
                    title: 'New Equipment Transfer Request',
                    message: `${req.user.name} has requested to transfer equipment from ${transferRequest.sourceLocation.name} to ${transferRequest.destinationLocation.name}`,
                    type: 'warning',
                    actionUrl: '/admin/transfer-approvals'
                }));

                if (notifications.length > 0) {
                    await Notification.insertMany(notifications);
                }
            } catch (notifError) {
                console.error('Failed to create notifications:', notifError);
                // Don't fail the request if notification fails
            }

            res.status(201).json({
                success: true,
                message: 'Transfer request created successfully',
                data: transferRequest,
            });
        } catch (error) {
            console.error('Create transfer request error:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating transfer request',
                error: error.message,
            });
        }
    }
);

// @route   GET /api/transfer-requests
// @desc    Get all transfer requests (filtered by role)
// @access  Protected
router.get('/', protect, async (req, res) => {
    try {
        const { status } = req.query;

        let filter = {};

        // Admin sees all requests
        if (req.user.role !== 'admin') {
            // Others see only their own requests
            filter.requestedBy = req.user._id;
        }

        // Filter by status if provided
        if (status) {
            filter.status = status;
        }

        const requests = await TransferRequest.find(filter)
            .populate('sourceLocation', 'name type building floor')
            .populate('destinationLocation', 'name type building floor')
            .populate('requestedBy', 'name email')
            .populate('approvedBy', 'name email')
            .populate('equipmentId', 'sysID labName')
            .sort({ requestedAt: -1 });

        res.json({
            success: true,
            count: requests.length,
            data: requests,
        });
    } catch (error) {
        console.error('Get transfer requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transfer requests',
            error: error.message,
        });
    }
});

// @route   GET /api/transfer-requests/:id
// @desc    Get specific transfer request
// @access  Protected
router.get('/:id', protect, async (req, res) => {
    try {
        const request = await TransferRequest.findById(req.params.id)
            .populate('sourceLocation', 'name type building floor')
            .populate('destinationLocation', 'name type building floor')
            .populate('requestedBy', 'name email')
            .populate('approvedBy', 'name email')
            .populate('equipmentId', 'sysID labName processor ram hdd softwareAvailable');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Transfer request not found',
            });
        }

        // Check access: admin or requester can view
        if (req.user.role !== 'admin' && request.requestedBy._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this request',
            });
        }

        res.json({
            success: true,
            data: request,
        });
    } catch (error) {
        console.error('Get transfer request error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transfer request',
            error: error.message,
        });
    }
});

// @route   PUT /api/transfer-requests/:id/approve
// @desc    Approve transfer request and move equipment
// @access  Protected (Admin only)
router.put('/:id/approve', protect, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can approve transfer requests',
            });
        }

        const { notes } = req.body;

        const request = await TransferRequest.findById(req.params.id)
            .populate('sourceLocation')
            .populate('destinationLocation')
            .populate('equipmentId');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Transfer request not found',
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot approve request with status: ${request.status}`,
            });
        }

        const equipment = request.equipmentId;
        if (!equipment) {
            return res.status(404).json({
                success: false,
                message: 'Equipment not found',
            });
        }

        // Get the destination location name
        const destinationLab = request.destinationLocation;

        // Get the highest sno in destination lab
        const highestSnoSystem = await LabSystem.findOne({ labName: destinationLab.name })
            .sort({ sno: -1 })
            .limit(1);

        const newSno = highestSnoSystem ? highestSnoSystem.sno + 1 : 1;

        // Update equipment location and add to transfer history
        const oldLabName = equipment.labName;
        equipment.labName = destinationLab.name;
        equipment.sno = newSno;

        // Add to transfer history
        if (!equipment.transferHistory) {
            equipment.transferHistory = [];
        }

        equipment.transferHistory.push({
            fromLocation: oldLabName,
            toLocation: destinationLab.name,
            transferDate: new Date(),
            transferredBy: request.requestedBy,
            approvedBy: req.user._id,
        });

        equipment.lastTransferDate = new Date();

        await equipment.save();

        // Update transfer request status
        request.status = 'approved';
        request.approvedBy = req.user._id;
        request.approvedAt = new Date();
        if (notes) {
            request.notes = request.notes ? `${request.notes}\n\nAdmin notes: ${notes}` : notes;
        }

        await request.save();

        // Populate for response
        await request.populate([
            { path: 'requestedBy', select: 'name email' },
            { path: 'approvedBy', select: 'name email' },
        ]);

        // Notify requester about approval
        try {
            await Notification.create({
                userId: request.requestedBy._id,
                title: 'Transfer Request Approved',
                message: `Your equipment transfer request from ${request.sourceLocation.name} to ${request.destinationLocation.name} has been approved`,
                type: 'success'
            });
        } catch (notifError) {
            console.error('Failed to create approval notification:', notifError);
        }

        res.json({
            success: true,
            message: 'Transfer request approved and equipment moved successfully',
            data: request,
        });
    } catch (error) {
        console.error('Approve transfer request error:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving transfer request',
            error: error.message,
        });
    }
});

// @route   PUT /api/transfer-requests/:id/reject
// @desc    Reject transfer request
// @access  Protected (Admin only)
router.put('/:id/reject', protect, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can reject transfer requests',
            });
        }

        const { rejectionReason } = req.body;

        if (!rejectionReason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required',
            });
        }

        const request = await TransferRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Transfer request not found',
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot reject request with status: ${request.status}`,
            });
        }

        request.status = 'rejected';
        request.approvedBy = req.user._id;
        request.approvedAt = new Date();
        request.rejectionReason = rejectionReason;

        await request.save();

        // Populate for response
        await request.populate([
            { path: 'sourceLocation', select: 'name type' },
            { path: 'destinationLocation', select: 'name type' },
            { path: 'requestedBy', select: 'name email' },
            { path: 'approvedBy', select: 'name email' },
        ]);

        // Notify requester about rejection
        try {
            await Notification.create({
                userId: request.requestedBy._id,
                title: 'Transfer Request Rejected',
                message: `Your equipment transfer request has been rejected. Reason: ${rejectionReason}`,
                type: 'error'
            });
        } catch (notifError) {
            console.error('Failed to create rejection notification:', notifError);
        }

        res.json({
            success: true,
            message: 'Transfer request rejected',
            data: request,
        });
    } catch (error) {
        console.error('Reject transfer request error:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting transfer request',
            error: error.message,
        });
    }
});

// @route   DELETE /api/transfer-requests/:id
// @desc    Cancel transfer request (requester only)
// @access  Protected
router.delete('/:id', protect, async (req, res) => {
    try {
        const request = await TransferRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Transfer request not found',
            });
        }

        // Only requester or admin can cancel
        if (req.user.role !== 'admin' && request.requestedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this request',
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel request with status: ${request.status}`,
            });
        }

        request.status = 'cancelled';
        await request.save();

        res.json({
            success: true,
            message: 'Transfer request cancelled successfully',
        });
    } catch (error) {
        console.error('Cancel transfer request error:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling transfer request',
            error: error.message,
        });
    }
});

export default router;
