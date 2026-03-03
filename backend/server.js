import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import issueRoutes from './routes/issues.js';
import laboratoryRoutes from './routes/laboratories.js';
import notificationRoutes from './routes/notifications.js';
import uploadRoutes from './routes/upload.js';
import usersRoutes from './routes/users.js';
import labSystemsRoutes from './routes/labSystems.js';
import transferRequestsRoutes from './routes/transferRequests.js';
import actionRoutes from './routes/actions.js';

// Initialize Express app
const app = express();

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:5173', 'http://localhost:8080'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || !process.env.NODE_ENV || process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        } else {
            console.log('CORS blocked for origin:', origin);
            console.log('Allowed origins:', allowedOrigins);
            return callback(new Error('Not allowed by CORS'), false);
        }
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Headers:', req.headers.authorization ? 'Has Auth Token' : 'No Auth Token');
    next();
});


// Routes
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'DIMS API is live',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/laboratories', laboratoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/lab-systems', labSystemsRoutes);
app.use('/api/transfer-requests', transferRequestsRoutes);
app.use('/api/actions', actionRoutes);


// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'DIMS Backend API is running',
        timestamp: new Date().toISOString(),
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

// Start server
const PORT = process.env.PORT || 5000;

// Connect to MongoDB before listening
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📡 API URL: http://localhost:${PORT}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    });
}).catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
});
