// userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Adjust path as needed
const { protect } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

// @desc    Get user profile
// @route   GET /api/users/profile (when mounted in index.js)
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                profileImageUrl: user.profileImageUrl,
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
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error while fetching profile' });
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile (when mounted in index.js)
// @access  Private
router.put('/profile', protect, async (req, res) => {
    const { name, email, dateOfBirth, gender, education, university, location, phoneNumber, bio, skillsOwned, skillsToLearn, domain, workLinks, achievements } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = name || user.name;
            user.email = email || user.email;
            
            if (dateOfBirth) {
                const parsedDate = new Date(dateOfBirth);
                if (!isNaN(parsedDate.getTime()) && parsedDate.getFullYear() > 1900 && parsedDate.getFullYear() < 2100) {
                    user.dateOfBirth = parsedDate;
                } else {
                    return res.status(400).json({ message: 'Invalid Date of Birth format or value out of bounds.' });
                }
            } else {
                user.dateOfBirth = null;
            }

            user.gender = gender || user.gender;
            user.education = education || user.education;
            user.university = university || user.university;
            user.location = location || user.location;
            user.phoneNumber = phoneNumber || user.phoneNumber;
            user.bio = bio || user.bio;
            user.skillsOwned = skillsOwned || user.skillsOwned;
            user.skillsToLearn = skillsToLearn || user.skillsToLearn;
            user.domain = domain || user.domain;
            user.workLinks = workLinks || user.workLinks;
            user.achievements = achievements || user.achievements;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                profileImageUrl: updatedUser.profileImageUrl,
                dateOfBirth: updatedUser.dateOfBirth,
                gender: updatedUser.gender,
                education: updatedUser.education,
                university: updatedUser.university,
                location: updatedUser.location,
                phoneNumber: updatedUser.phoneNumber,
                bio: updatedUser.bio,
                skillsOwned: updatedUser.skillsOwned,
                skillsToLearn: updatedUser.skillsToLearn,
                domain: updatedUser.domain,
                workLinks: updatedUser.workLinks,
                achievements: updatedUser.achievements,
                certificates: updatedUser.certificates,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Server error while updating profile' });
    }
});


// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
router.put('/change-password', protect, async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Old password and new password are required.' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    try {
        const user = await User.findById(req.user._id);

        if (user) {
            const isMatch = await user.matchPassword(oldPassword);

            if (!isMatch) {
                return res.status(401).json({ message: 'Old password does not match.' });
            }

            user.password = newPassword;
            await user.save();

            res.status(200).json({ message: 'Password updated successfully!' });
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Server error while changing password.' });
    }
});

// @desc    Delete user account
// @route   DELETE /api/users/delete-account
// @access  Private
router.delete('/delete-account', protect, async (req, res) => { // <--- ADD THIS NEW ROUTE
    try {
        const user = await User.findById(req.user._id); // Find the user by ID from the token

        if (user) {
            await User.deleteOne({ _id: req.user._id }); // Use deleteOne to remove the user
            res.status(200).json({ message: 'Account deleted successfully.' });
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'Server error while deleting account.' });
    }
});

module.exports = router;