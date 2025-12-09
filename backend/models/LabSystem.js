import mongoose from 'mongoose';

const labSystemSchema = new mongoose.Schema(
    {
        sno: {
            type: Number,
            required: true,
        },
        labName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        sysID: {
            type: String,
            required: true,
            trim: true,
        },
        processor: {
            type: String,
            trim: true,
        },
        ram: {
            type: String,
            trim: true,
        },
        hdd: {
            type: String,
            trim: true,
        },
        softwareAvailable: {
            type: String,
            trim: true,
        },
        equipment: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
labSystemSchema.index({ labName: 1, sysID: 1 });
labSystemSchema.index({ sno: 1 });

const LabSystem = mongoose.model('LabSystem', labSystemSchema);

export default LabSystem;
