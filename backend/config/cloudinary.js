import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage for images
const imageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'infra-stream/images',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
    },
});

// Configure storage for documents
const documentStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'infra-stream/documents',
        allowed_formats: ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx'],
        resource_type: 'raw',
    },
});

// Create multer upload instances
export const uploadImages = multer({
    storage: imageStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per image
    },
});

export const uploadDocuments = multer({
    storage: documentStorage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit per document
    },
});

// Combined upload for both images and documents
export const uploadFiles = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});

export default cloudinary;
