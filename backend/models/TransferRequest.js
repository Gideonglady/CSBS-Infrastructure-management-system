import mongoose from 'mongoose';

const transferRequestSchema = new mongoose.Schema(
    {
        // For 'create' actions, this might be null until approved.
        // For 'update/delete/transfer', this targets the existing entity.
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            // Dynamic ref based on targetModel, handled in logic or loose ref
        },
        // Kept for backward compatibility, aliased to entityId in logic if needed
        equipmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'LabSystem',
        },
        actionType: {
            type: String,
            required: true,
            enum: ['create', 'update', 'delete', 'transfer'],
            default: 'transfer',
        },
        targetModel: {
            type: String,
            required: true,
            enum: ['LabSystem', 'Laboratory', 'Classroom'],
            default: 'LabSystem',
        },
        // For Create/Update actions: stores the new data payload
        data: {
            type: mongoose.Schema.Types.Mixed,
        },
        // Existing fields for Transfer
        sourceLocation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Laboratory',
        },
        sourceLabName: { type: String, trim: true }, // Backup if no ID
        destinationLocation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Laboratory',
        },
        destinationLabName: { type: String, trim: true }, // Backup if no ID
        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Requester is required'],
        },
        requestedAt: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'cancelled', 'reverted'],
            default: 'pending',
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        approvedAt: {
            type: Date,
        },
        rejectionReason: {
            type: String,
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
        },
        // Snapshot of the entity BEFORE the action (for playback/history)
        // For 'create', this is null.
        previousState: {
            type: mongoose.Schema.Types.Mixed,
        },
        // Legacy field support
        equipmentSnapshot: {
            type: mongoose.Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
transferRequestSchema.index({ status: 1, requestedAt: -1 });
transferRequestSchema.index({ requestedBy: 1 });
transferRequestSchema.index({ sourceLocation: 1, destinationLocation: 1 });

const TransferRequest = mongoose.model('TransferRequest', transferRequestSchema);

export default TransferRequest;
