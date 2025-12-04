import express from 'express';
import Laboratory from '../models/Laboratory.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/laboratories
// @desc    Get all laboratories/classrooms with optional filters
// @access  Public (anyone can view)
router.get('/', async (req, res) => {
    try {
        const { type, department, search } = req.query;

        // Build filter object
        const filter = { isActive: true };
        if (type) filter.type = type;
        if (department) filter.department = department;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { software: { $regex: search, $options: 'i' } },
            ];
        }

        const laboratories = await Laboratory.find(filter)
            .sort({ serialNumber: 1 })
            .lean();

        res.json({
            success: true,
            count: laboratories.length,
            data: laboratories,
        });
    } catch (error) {
        console.error('Error fetching laboratories:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching laboratories',
            error: error.message,
        });
    }
});

// @route   GET /api/laboratories/stats
// @desc    Get laboratory statistics
// @access  Public
router.get('/stats', async (req, res) => {
    try {
        const totalLabs = await Laboratory.countDocuments({ type: 'laboratory', isActive: true });
        const totalClassrooms = await Laboratory.countDocuments({ type: 'classroom', isActive: true });

        const labsWithSystems = await Laboratory.find({ type: 'laboratory', isActive: true });
        const totalSystems = labsWithSystems.reduce((sum, lab) => sum + (lab.numberOfSystems || 0), 0);

        res.json({
            success: true,
            data: {
                totalLaboratories: totalLabs,
                totalClassrooms: totalClassrooms,
                totalSystems: totalSystems,
                totalLocations: totalLabs + totalClassrooms,
            },
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message,
        });
    }
});

// @route   GET /api/laboratories/:id
// @desc    Get specific laboratory by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const laboratory = await Laboratory.findById(req.params.id);

        if (!laboratory) {
            return res.status(404).json({
                success: false,
                message: 'Laboratory not found',
            });
        }

        res.json({
            success: true,
            data: laboratory,
        });
    } catch (error) {
        console.error('Error fetching laboratory:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching laboratory',
            error: error.message,
        });
    }
});

// @route   POST /api/laboratories
// @desc    Create a new laboratory/classroom
// @access  Protected (Admin only)
router.post('/', protect, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can create laboratories',
            });
        }

        const {
            name,
            type,
            serialNumber,
            numberOfSystems,
            systemConfiguration,
            software,
            additionalEquipment,
            department,
            building,
            floor,
        } = req.body;

        // Validate required fields
        if (!name || !type || serialNumber === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, type, and serial number',
            });
        }

        // Create new laboratory
        const laboratory = await Laboratory.create({
            name,
            type,
            serialNumber,
            numberOfSystems: numberOfSystems || 0,
            systemConfiguration: systemConfiguration || '',
            software: software || [],
            additionalEquipment: additionalEquipment || [],
            department: department || 'CSBS',
            building: building || '',
            floor: floor || '',
            isActive: true,
        });

        res.status(201).json({
            success: true,
            message: 'Laboratory created successfully',
            data: laboratory,
        });
    } catch (error) {
        console.error('Error creating laboratory:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating laboratory',
            error: error.message,
        });
    }
});

// @route   PUT /api/laboratories/:id
// @desc    Update laboratory/classroom
// @access  Protected (Admin only)
router.put('/:id', protect, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can update laboratories',
            });
        }

        const laboratory = await Laboratory.findById(req.params.id);

        if (!laboratory) {
            return res.status(404).json({
                success: false,
                message: 'Laboratory not found',
            });
        }

        // Update fields
        const allowedFields = [
            'name',
            'type',
            'serialNumber',
            'numberOfSystems',
            'systemConfiguration',
            'software',
            'additionalEquipment',
            'department',
            'building',
            'floor',
            'isActive',
        ];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                laboratory[field] = req.body[field];
            }
        });

        await laboratory.save();

        res.json({
            success: true,
            message: 'Laboratory updated successfully',
            data: laboratory,
        });
    } catch (error) {
        console.error('Error updating laboratory:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating laboratory',
            error: error.message,
        });
    }
});

// @route   DELETE /api/laboratories/:id
// @desc    Delete laboratory/classroom (soft delete)
// @access  Protected (Admin only)
router.delete('/:id', protect, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can delete laboratories',
            });
        }

        const laboratory = await Laboratory.findById(req.params.id);

        if (!laboratory) {
            return res.status(404).json({
                success: false,
                message: 'Laboratory not found',
            });
        }

        // Soft delete
        laboratory.isActive = false;
        await laboratory.save();

        res.json({
            success: true,
            message: 'Laboratory deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting laboratory:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting laboratory',
            error: error.message,
        });
    }
});

export default router;
