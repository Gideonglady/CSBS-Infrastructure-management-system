import express from 'express';
import mongoose from 'mongoose';
import TransferRequest from '../models/TransferRequest.js'; // This is now our generic ActionRequest model
import DeletedItem from '../models/DeletedItem.js';
import LabSystem from '../models/LabSystem.js';
import Laboratory from '../models/Laboratory.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Helper to get model by name
const getModel = (modelName) => {
    switch (modelName) {
        case 'LabSystem': return LabSystem;
        case 'Laboratory': return Laboratory;
        case 'Classroom': return Laboratory; 
        default: return null;
    }
};

// Helper: Notify Admins
const notifyAdmins = async (title, message, actionUrl, excludeUserId = null) => {
    try {
        const query = { role: 'admin', isActive: true };
        if (excludeUserId) {
            query._id = { $ne: excludeUserId };
        }
        const admins = await User.find(query);
        const notifications = admins.map(admin => ({
            userId: admin._id,
            title,
            message,
            type: 'warning', // or info
            actionUrl
        }));
        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }
    } catch (error) {
        console.error('Failed to notify admins:', error);
    }
};

// Helper: Notify User
const notifyUser = async (userId, title, message, type = 'info') => {
    try {
        await Notification.create({
            userId,
            title,
            message,
            type
        });
    } catch (error) {
         console.error('Failed to notify user:', error);
    }
};

/**
 * Execute the action (Apply changes to DB)
 */
const executeAction = async (actionRequest, userId) => {
    const Model = getModel(actionRequest.targetModel);
    if (!Model) throw new Error('Invalid target model');

    let result = null;

    switch (actionRequest.actionType) {
        case 'create':
            // Auto-increment sno for LabSystem
            if (actionRequest.targetModel === 'LabSystem') {
                const lastItem = await Model.findOne({ labName: actionRequest.data.labName })
                    .sort({ sno: -1 });
                actionRequest.data.sno = (lastItem?.sno || 0) + 1;
            }

            result = await Model.create(actionRequest.data);
            actionRequest.entityId = result._id;
            break;

        case 'update':
            // If updating a Laboratory/Classroom, we might need to be careful not to overwrite everything if not intended
            result = await Model.findByIdAndUpdate(
                actionRequest.entityId, 
                actionRequest.data, 
                { new: true, runValidators: true }
            );
            break;

        case 'delete':
            const itemToDelete = await Model.findById(actionRequest.entityId);
            if (itemToDelete) {
                // Archive it
                await DeletedItem.create({
                    originalId: itemToDelete._id,
                    collectionName: actionRequest.targetModel,
                    data: itemToDelete.toObject(),
                    deletedBy: userId,
                    reason: actionRequest.notes || 'Deleted via Action Request'
                });
                await Model.findByIdAndDelete(actionRequest.entityId);
            }
            break;

        case 'transfer':
             // For LabSystem transfer
             if (actionRequest.targetModel === 'LabSystem') {
                 // Ensure we update sno? Or keep it? keeping for now.
                 const updates = {
                     labName: actionRequest.data.destinationName, 
                 };
                 // If moving to new lab, maybe update sno to match new lab sequence?
                 // For now, let's just move it.
                 
                 await Model.findByIdAndUpdate(
                     actionRequest.entityId,
                     updates
                 );
             }
             break;
    }

    actionRequest.status = 'approved'; // Or 'executed'
    actionRequest.approvedBy = userId;
    actionRequest.approvedAt = new Date();
    await actionRequest.save();
    return result;
};

// @route   POST /api/actions
// @desc    Submit an action request (Create, Update, Delete, Transfer)
// @access  Protected (All roles can submit, logic determines if pending or executed)
router.post('/', protect, async (req, res) => {
    try {
        const { actionType, targetModel, data, entityId, notes, sourceLocation, destinationLocation } = req.body;
        const user = req.user;

        // Snapshot current state if applicable
        let previousState = null;
        if (entityId && (actionType === 'update' || actionType === 'delete' || actionType === 'transfer')) {
            const Model = getModel(targetModel);
            if (Model) {
                 const currentEntity = await Model.findById(entityId);
                 if (currentEntity) previousState = currentEntity.toObject();
            }
        }

        // Resolve Source and Destination by Lab Name if IDs are missing
        let resolvedSource = sourceLocation;
        let resolvedDestination = destinationLocation;

        // Capture names for explicit storage
        const sourceName = previousState?.labName || data?.labName;
        const destName = data?.destinationName;

        if (!resolvedSource || !mongoose.Types.ObjectId.isValid(resolvedSource)) {
            if (sourceName) {
                const sourceLab = await Laboratory.findOne({ name: sourceName });
                if (sourceLab) resolvedSource = sourceLab._id;
            }
        }

        if (!resolvedDestination || !mongoose.Types.ObjectId.isValid(resolvedDestination)) {
            if (destName) {
                const destLab = await Laboratory.findOne({ name: destName });
                if (destLab) resolvedDestination = destLab._id;
            }
        }

        const newRequest = new TransferRequest({
            actionType,
            targetModel,
            data,
            entityId,
            notes,
            sourceLocation: resolvedSource,
            destinationLocation: resolvedDestination,
            sourceLabName: sourceName,
            destinationLabName: destName,
            requestedBy: user._id,
            previousState
        });

        // 1. If Admin -> Execute immediately
        if (user.role === 'admin') {
            await executeAction(newRequest, user._id);
            // newRequest is saved inside executeAction
            


             return res.status(200).json({
                success: true,
                message: 'Action executed successfully',
                data: newRequest
            });
        }

        // 2. If Staff/Other -> Create Pending Request
        await newRequest.save();

        // Notify Admin
        await notifyAdmins(
            'New Action Request', 
            `${user.name} requested to ${actionType} a ${targetModel}.`,
            '/digital-registers/laboratories' // Direct link concept
        );

        res.status(201).json({
            success: true,
            message: 'Action request submitted for approval',
            data: newRequest
        });

    } catch (error) {
        console.error('Error submitting action:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   GET /api/actions/pending
// @desc    Get all pending action requests
// @access  Protected (Admin only usually, or maybe user's own)
router.get('/pending', protect, authorize('admin'), async (req, res) => {
    try {
        const requests = await TransferRequest.find({ status: 'pending' })
            .populate('requestedBy', 'name email role')
            .populate('sourceLocation', 'name')
            .populate('destinationLocation', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: requests.length, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/actions/history
// @desc    Get action history (all statuses)
// @access  Protected
router.get('/history', protect, async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'admin') {
            query.requestedBy = req.user._id;
        }

        const requests = await TransferRequest.find(query)
            .populate('requestedBy', 'name email')
            .populate('approvedBy', 'name email')
            .populate('sourceLocation', 'name')
            .populate('destinationLocation', 'name')
             .sort({ createdAt: -1 });

         res.json({ success: true, count: requests.length, data: requests });
    } catch (error) {
         res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/actions/:id/approve
// @desc    Approve a pending action
// @access  Protected (Admin only)
router.put('/:id/approve', protect, authorize('admin'), async (req, res) => {
    try {
        const request = await TransferRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Request is not pending' });
        }

        await executeAction(request, req.user._id);

        // Notify Requester
        await notifyUser(
            request.requestedBy,
            'Request Approved',
            `Your request to ${request.actionType} ${request.targetModel} has been approved.`,
            'success'
        );

        res.json({ success: true, message: 'Request approved and executed', data: request });
    } catch (error) {
         console.error('Error approving action:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/actions/:id/reject
// @desc    Reject a pending action
// @access  Protected (Admin only)
router.put('/:id/reject', protect, authorize('admin'), async (req, res) => {
    try {
        const { rejectionReason } = req.body;
        const request = await TransferRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        if (request.status !== 'pending') {
             return res.status(400).json({ success: false, message: 'Request is not pending' });
        }

        request.status = 'rejected';
        request.approvedBy = req.user._id; // Rejected by
        request.approvedAt = new Date(); // Rejected at
        request.rejectionReason = rejectionReason;
        await request.save();

        // Notify Requester
        await notifyUser(
            request.requestedBy,
            'Request Rejected',
            `Your request was rejected: ${rejectionReason}`,
            'error'
        );

        res.json({ success: true, message: 'Request rejected', data: request });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/actions/:id/revert
// @desc    Revert an executed action
// @access  Protected (Admin only)
router.post('/:id/revert', protect, authorize('admin'), async (req, res) => {
    try {
        const request = await TransferRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
        
        if (request.status !== 'approved') return res.status(400).json({ success: false, message: 'Only executed actions can be reverted' });

        const Model = getModel(request.targetModel);
        if (!Model) return res.status(400).json({ success: false, message: 'Invalid model' });

        if (request.actionType === 'create') {
             // Undo Create -> Delete
             await Model.findByIdAndDelete(request.entityId);
        } else if (request.actionType === 'delete') {
             // Undo Delete -> Restore
             if (request.previousState) {
                 await Model.create(request.previousState);
             }
        } else {
             // Undo Update/Transfer -> Restore previousState
             if (request.previousState) {
                 await Model.findByIdAndUpdate(request.entityId, request.previousState, { new: true });
             }
        }

        request.status = 'reverted';
        await request.save();
        
        await notifyAdmins('Action Reverted', `Action ${request._id} was reverted`, '/', req.user._id);

        res.json({ success: true, message: 'Action reverted successfully' });
    } catch (error) {
        console.error('Revert failed', error);
        res.status(500).json({ success: false, message: 'Revert failed' });
    }
});

export default router;
