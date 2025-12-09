import express from 'express';
import LabSystem from '../models/LabSystem.js';
import Laboratory from '../models/Laboratory.js';
import { protect } from '../middleware/auth.js';
import { canAccessLabName } from '../middleware/locationAuth.js';

const router = express.Router();

// @route   GET /api/lab-systems/labs
// @desc    Get lab summary (lab name, system count, equipment)
// @access  Protected (filtered by user's assigned locations)
router.get('/labs', protect, async (req, res) => {
    try {
        // Get user's accessible lab names
        let accessibleLabNames = [];

        if (req.user.role === 'admin') {
            // Admin can see all labs - get all lab names from Laboratory collection
            const allLabs = await Laboratory.find({ type: 'laboratory', isActive: true }).select('name');
            accessibleLabNames = allLabs.map(lab => lab.name);
        } else {
            // Get user's assigned locations and extract lab names
            const user = await req.user.populate('assignedLocations', 'name type');
            accessibleLabNames = user.assignedLocations
                .filter(loc => loc.type === 'laboratory')
                .map(loc => loc.name);
        }

        // Aggregate to get lab summary, filtered by accessible labs
        const labSummary = await LabSystem.aggregate([
            {
                $match: {
                    labName: { $in: accessibleLabNames }
                }
            },
            {
                $group: {
                    _id: '$labName',
                    systemCount: { $sum: 1 },
                    equipment: { $addToSet: '$equipment' },
                    systems: { $push: '$$ROOT' }
                }
            },
            {
                $project: {
                    labName: '$_id',
                    systemCount: 1,
                    equipment: {
                        $reduce: {
                            input: '$equipment',
                            initialValue: '',
                            in: {
                                $concat: [
                                    '$$value',
                                    {
                                        $cond: [
                                            { $eq: ['$$value', ''] },
                                            '',
                                            ', '
                                        ]
                                    },
                                    '$$this'
                                ]
                            }
                        }
                    },
                    _id: 0
                }
            },
            { $sort: { labName: 1 } }
        ]);

        res.json({
            success: true,
            count: labSummary.length,
            data: labSummary,
        });
    } catch (error) {
        console.error('Error fetching lab summary:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching lab summary',
            error: error.message,
        });
    }
});

// @route   GET /api/lab-systems
// @desc    Get all lab systems with search and filter
// @access  Protected
router.get('/', protect, async (req, res) => {
    try {
        const { search, labName, page = 1, limit = 50 } = req.query;

        // Build filter
        const filter = {};

        if (search) {
            filter.$or = [
                { labName: { $regex: search, $options: 'i' } },
                { sysID: { $regex: search, $options: 'i' } },
            ];
        }

        if (labName) {
            filter.labName = labName;
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const systems = await LabSystem.find(filter)
            .sort({ sno: 1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await LabSystem.countDocuments(filter);

        res.json({
            success: true,
            count: systems.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: systems,
        });
    } catch (error) {
        console.error('Error fetching lab systems:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching lab systems',
            error: error.message,
        });
    }
});

// @route   GET /api/lab-systems/lab/:labName
// @desc    Get all systems for a specific lab
// @access  Protected (requires access to the lab)
router.get('/lab/:labName', protect, async (req, res) => {
    try {
        // Check if user has access to this lab
        const hasAccess = await canAccessLabName(req.user._id, req.params.labName);

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this laboratory'
            });
        }

        const systems = await LabSystem.find({ labName: req.params.labName })
            .sort({ sno: 1 })
            .lean();

        res.json({
            success: true,
            count: systems.length,
            labName: req.params.labName,
            data: systems,
        });
    } catch (error) {
        console.error('Error fetching lab systems:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching lab systems',
            error: error.message,
        });
    }
});

// @route   GET /api/lab-systems/:id
// @desc    Get specific system by ID
// @access  Protected
router.get('/:id', protect, async (req, res) => {
    try {
        const system = await LabSystem.findById(req.params.id);

        if (!system) {
            return res.status(404).json({
                success: false,
                message: 'System not found',
            });
        }

        res.json({
            success: true,
            data: system,
        });
    } catch (error) {
        console.error('Error fetching system:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching system',
            error: error.message,
        });
    }
});

export default router;
