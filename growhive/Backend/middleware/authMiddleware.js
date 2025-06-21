// D:\GrowHive\GrowHive\growhive\Backend\middleware\authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust this path if your User model is elsewhere (e.g., ../User)

// This is the common structure for an Express middleware
exports.protect = async (req, res, next) => {
    let token;

    // Check if authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            // Ensure process.env.JWT_SECRET is set in your .env file
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user to the request object (excluding password)
            // findById returns a document, which you can then access properties from
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                console.error('Auth Middleware: User not found for decoded token ID:', decoded.id);
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next(); // Call next middleware/route handler in the chain
        } catch (error) {
            console.error('Auth Middleware: Token verification failed:', error.message);
            // If token is expired, invalid signature, etc.
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// You can add other middleware functions as named exports here if needed
// exports.authorizeRoles = (...roles) => {
//     return (req, res, next) => {
//         if (!roles.includes(req.user.role)) {
//             return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
//         }
//         next();
//     };
// };