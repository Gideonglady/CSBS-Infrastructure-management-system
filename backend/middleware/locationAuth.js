// Middleware to check if user has access to specific location(s)
import User from '../models/User.js';

/**
 * Middleware to check if authenticated user has access to a specific location
 * Admins bypass all checks
 * Other users must have location in their assignedLocations array
 */
export const checkLocationAccess = async (req, res, next) => {
    try {
        // Admin has access to everything
        if (req.user.role === 'admin') {
            return next();
        }

        // Get location ID from params or body
        const locationId = req.params.id || req.params.locationId || req.body.locationId;

        if (!locationId) {
            return next(); // No specific location to check
        }

        // Check if user has this location in their assignedLocations
        const user = await User.findById(req.user._id).select('assignedLocations');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const hasAccess = user.assignedLocations.some(
            loc => loc.toString() === locationId.toString()
        );

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this location'
            });
        }

        next();
    } catch (error) {
        console.error('Location access check error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking location access'
        });
    }
};

/**
 * Helper function to filter locations based on user's assigned locations
 * Returns filter object for MongoDB queries
 */
export const getLocationFilter = (user) => {
    // Admin sees everything
    if (user.role === 'admin') {
        return {};
    }

    // Other users only see their assigned locations
    return {
        _id: { $in: user.assignedLocations || [] }
    };
};

/**
 * Helper function to check if user can access a specific lab name
 */
export const canAccessLabName = async (userId, labName) => {
    try {
        const user = await User.findById(userId)
            .populate('assignedLocations', 'name');

        if (!user) {
            return false;
        }

        // Admin has access to all
        if (user.role === 'admin') {
            return true;
        }

        // Check if any assigned location matches the lab name
        return user.assignedLocations.some(
            loc => loc.name === labName
        );
    } catch (error) {
        console.error('Error checking lab name access:', error);
        return false;
    }
};
