import express from 'express';
import { uploadImages, uploadDocuments } from '../config/cloudinary.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/upload/images
// @desc    Upload images to Cloudinary
// @access  Protected
router.post('/images', protect, uploadImages.array('images', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No images provided',
            });
        }

        // Extract URLs from uploaded files
        const imageUrls = req.files.map(file => file.path);

        res.json({
            success: true,
            message: 'Images uploaded successfully',
            data: imageUrls,
        });
    } catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading images',
            error: error.message,
        });
    }
});

// @route   POST /api/upload/documents
// @desc    Upload documents to Cloudinary
// @access  Protected
router.post('/documents', protect, uploadDocuments.array('documents', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No documents provided',
            });
        }

        // Extract URLs from uploaded files
        const documentUrls = req.files.map(file => file.path);

        res.json({
            success: true,
            message: 'Documents uploaded successfully',
            data: documentUrls,
        });
    } catch (error) {
        console.error('Error uploading documents:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading documents',
            error: error.message,
        });
    }
});

export default router;
