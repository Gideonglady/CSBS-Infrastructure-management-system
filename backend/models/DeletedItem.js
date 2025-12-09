import mongoose from 'mongoose';

const deletedItemSchema = new mongoose.Schema(
    {
        originalId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        collectionName: {
            type: String,
            required: true,
            trim: true,
        },
        data: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        deletedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        deletedAt: {
            type: Date,
            default: Date.now,
        },
        reason: {
            type: String,
            trim: true,
        }
    },
    {
        timestamps: true,
    }
);

deletedItemSchema.index({ collectionName: 1 });
deletedItemSchema.index({ deletedAt: -1 });

const DeletedItem = mongoose.model('DeletedItem', deletedItemSchema);

export default DeletedItem;
