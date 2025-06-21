const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
};

exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }
        user = new User({ name, email, password });
        await user.save();
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
            message: 'User registered successfully. Please complete your profile.',
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

exports.completeProfile = async (req, res) => {
    const userId = req.user._id;
    const updates = req.body;

    try {
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        for (const key in updates) {
            if (
                Object.hasOwnProperty.call(updates, key) &&
                Object.hasOwnProperty.call(user.schema.paths, key) &&
                !['password', '_id', 'createdAt', '__v'].includes(key)
            ) {
                if (Array.isArray(user[key]) && Array.isArray(updates[key])) {
                    user[key] = updates[key];
                } else {
                    user[key] = updates[key];
                }
            }
        }
        await user.save();

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            education: user.education,
            university: user.university,
            location: user.location,
            phoneNumber: user.phoneNumber,
            bio: user.bio,
            skillsOwned: user.skillsOwned,
            skillsToLearn: user.skillsToLearn,
            domain: user.domain,
            workLinks: user.workLinks,
            achievements: user.achievements,
            certificates: user.certificates,
            profileImageUrl: user.profileImageUrl, // <-- NEW: Include profile image URL
            message: 'Profile updated successfully!',
        });
    } catch (error) {
        console.error('Profile update error:', error.message);
        res.status(500).send('Server error during profile update.');
    }
};

exports.authUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            education: user.education,
            university: user.university,
            location: user.location,
            phoneNumber: user.phoneNumber,
            bio: user.bio,
            skillsOwned: user.skillsOwned,
            skillsToLearn: user.skillsToLearn,
            domain: user.domain,
            workLinks: user.workLinks,
            achievements: user.achievements,
            certificates: user.certificates,
            profileImageUrl: user.profileImageUrl, // <-- NEW: Include profile image URL
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

// --- NEW: getProfile endpoint (if you don't already have one) ---
// This endpoint is crucial for fetching user data when ProfileScreen loads.
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user._id; // Get user ID from the protect middleware (authenticated user)
        // If you prefer to get by ID from URL: const userId = req.params.id;

        const user = await User.findById(userId).select('-password'); // Exclude password

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user); // Return the full user object
    } catch (error) {
        console.error('Error fetching profile:', error.message);
        res.status(500).send('Server error fetching profile');
    }
};
