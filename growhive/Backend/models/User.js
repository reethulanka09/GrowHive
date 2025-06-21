const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    dateOfBirth: {
        type: Date,
        default: null,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Non-binary', 'Prefer not to say', null],
        default: null,
    },
    education: {
        type: String,
        default: null,
    },
    university: {
        type: String,
        default: null,
    },
    location: {
        type: String,
        default: null,
    },
    phoneNumber: {
        type: String,
        default: null,
    },
    bio: {
        type: String,
        default: null,
        maxlength: 500,
    },
    skillsOwned: {
        type: [{
            skill: { type: String, required: true },
            proficiency: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], required: true },
        }],
        default: [],
    },
    skillsToLearn: {
        type: [String],
        default: [],
    },
    domain: {
        type: String,
        enum: [
            'Artificial Intelligence', 'Machine Learning', 'Data Science', 'Cybersecurity',
            'Web Development', 'Mobile Development', 'Blockchain', 'Game Development',
            'UI/UX Design', 'Cloud Computing', 'Select', null
        ],
        default: null,
    },
    workLinks: {
        type: String,
        default: null,
    },
    achievements: {
        type: String,
        default: null,
    },
    certificates: {
        type: [{
            name: String,
            url: String,
            uploadedAt: { type: Date, default: Date.now },
        }],
        default: [],
    },
    // --- THIS IS THE CORRECT FIELD ADDITION ---
    profileImageUrl: {
        type: String,
        default: null, // Stores the relative path (e.g., 'profile_images/some_image.jpg')
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);