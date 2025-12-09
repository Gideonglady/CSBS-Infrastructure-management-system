import mongoose from 'mongoose';

const transferRequestSchema = new mongoose.Schema(
    {
        equipmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'LabSystem',
            required: [true, 'Equipment ID is required'],
        },
        equipmentType: {
            type: String,
            enum: ['system', 'equipment'],
            default: 'system',
        },
        sourceLocation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Laboratory',
            required: [true, 'Source location is required'],
        },
        destinationLocation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Laboratory',
            required: [true, 'Destination location is required'],
        },
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
            enum: ['pending', 'approved', 'rejected', 'cancelled'],
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
        equipmentSnapshot: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
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
