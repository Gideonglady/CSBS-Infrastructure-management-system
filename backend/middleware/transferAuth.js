// Middleware to check if user has permission to transfer equipment from a location
import User from '../models/User.js';
import LabSystem from '../models/LabSystem.js';
import Laboratory from '../models/Laboratory.js';

/**
 * Middleware to validate user can transfer equipment from source location
 */
export const canTransferFromLocation = async (req, res, next) => {
    try {
        const { sourceLocation, equipmentId } = req.body;

        // Admin can transfer from any location
        if (req.user.role === 'admin') {
            return next();
        }

        // Check if user has access to source location
        const user = await User.findById(req.user._id).select('assignedLocations');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const hasAccess = user.assignedLocations.some(
            loc => loc.toString() === sourceLocation.toString()
        );

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to transfer equipment from this location'
            });
        }

        // Verify equipment exists in source location
        if (equipmentId) {
            const equipment = await LabSystem.findById(equipmentId);

            if (!equipment) {
                return res.status(404).json({
                    success: false,
                    message: 'Equipment not found'
                });
            }

            // Get source location details
            const sourceLab = await Laboratory.findById(sourceLocation);

            if (!sourceLab) {
                return res.status(404).json({
                    success: false,
                    message: 'Source location not found'
                });
            }

            // Check if equipment belongs to source location
            if (equipment.labName !== sourceLab.name) {
                return res.status(400).json({
                    success: false,
                    message: 'Equipment does not belong to the source location'
                });
            }
        }

        next();
    } catch (error) {
        console.error('Transfer authorization error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking transfer permissions'
        });
    }
};

/**
 * Middleware to validate destination location exists
 */
export const validateDestinationLocation = async (req, res, next) => {
    try {
        const { destinationLocation } = req.body;

        const destination = await Laboratory.findById(destinationLocation);

        if (!destination || !destination.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Destination location not found or inactive'
            });
        }

        next();
    } catch (error) {
        console.error('Destination validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating destination location'
        });
    }
};
