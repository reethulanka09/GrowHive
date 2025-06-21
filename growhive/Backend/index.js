// index.js (your main backend file)
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/uploadRoutes'); // Correct path
const userRoutes = require('./routes/userRoutes'); // UNCOMMENTED AND CORRECTED PATH
// ----------------------------------------------------
// NEW: Import hackathonRoutes
const hackathonRoutes = require('./routes/hackathonRoute');
// ----------------------------------------------------

const cors = require('cors');
const path = require('path'); // Import path module

dotenv.config();

connectDB();

const app = express();

app.use(express.json()); // For parsing application/json
app.use(cors()); // Enable CORS for all routes

// --- Serve static files from 'uploads' subdirectories ---
// IMPORTANT: The path here should be relative to where index.js is run from.
// `path.join(__dirname, 'uploads', 'profile_images')` ensures correct absolute path.
app.use('/uploads/certificates', express.static(path.join(__dirname, 'uploads', 'certificates')));
app.use('/uploads/profile_images', express.static(path.join(__dirname, 'uploads', 'profile_images')));


// API Routes
app.use('/api/auth', authRoutes); // Mount authentication routes
app.use('/api/upload', uploadRoutes); // Mount upload routes
app.use('/api/users', userRoutes); // Mount user-specific routes (profile, etc.) under /api/users
// ----------------------------------------------------
// NEW: Mount hackathon routes
app.use('/api/hackathons', hackathonRoutes);
// ----------------------------------------------------

// Root route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Middleware for handling 404 (Not Found) errors
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

// Error handling middleware (should be the last middleware)
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});