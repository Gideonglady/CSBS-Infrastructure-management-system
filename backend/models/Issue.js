import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    isInternal: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const issueSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: ['equipment', 'infrastructure', 'safety', 'cleanliness', 'security', 'other'],
        },
        priority: {
            type: String,
            required: [true, 'Priority is required'],
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium',
        },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'in_progress', 'resolved', 'closed'],
            default: 'pending',
        },
        location: {
            locationType: {
                type: String,
                required: true,
                enum: ['classroom', 'laboratory', 'other'],
            },
            id: {
                type: String,
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            building: {
                type: String,
                required: true,
            },
            floor: {
                type: String,
                required: false,
            },
        },
        reporterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        reporterName: {
            type: String,
            required: true,
        },
        assignedTo: {
            type: String,
            default: 'admin',
        },
        assignedToName: {
            type: String,
            default: 'Administrator',
        },
        urgency: {
            type: String,
            enum: ['not_urgent', 'somewhat_urgent', 'urgent', 'critical'],
        },
        estimatedImpact: {
            type: String,
            enum: ['minimal', 'moderate', 'significant', 'severe'],
        },
        attachments: [{
            type: String,
        }],
        images: [{
            type: String,
        }],
        notifyAdmin: {
            type: Boolean,
            default: true,
        },
        allowPublicView: {
            type: Boolean,
            default: false,
        },
        comments: [commentSchema],
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
issueSchema.index({ status: 1, createdAt: -1 });
issueSchema.index({ reporterId: 1 });
issueSchema.index({ category: 1, priority: 1 });

const Issue = mongoose.model('Issue', issueSchema);

export default Issue;
