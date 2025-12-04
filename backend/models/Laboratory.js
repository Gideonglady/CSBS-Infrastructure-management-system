import mongoose from 'mongoose';

const laboratorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Laboratory/Classroom name is required'],
            trim: true,
        },
        type: {
            type: String,
            required: [true, 'Type is required'],
            enum: ['laboratory', 'classroom'],
            default: 'laboratory',
        },
        serialNumber: {
            type: Number,
            required: true,
        },
        numberOfSystems: {
            type: Number,
            default: 0,
        },
        systemConfiguration: {
            type: String,
            trim: true,
        },
        software: [{
            type: String,
            trim: true,
        }],
        additionalEquipment: [{
            type: String,
            trim: true,
        }],
        department: {
            type: String,
            default: 'CSBS',
            trim: true,
        },
        building: {
            type: String,
            trim: true,
        },
        floor: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
laboratorySchema.index({ type: 1, department: 1 });
laboratorySchema.index({ serialNumber: 1 });
laboratorySchema.index({ name: 'text' });

const Laboratory = mongoose.model('Laboratory', laboratorySchema);

export default Laboratory;
