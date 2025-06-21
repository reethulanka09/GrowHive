// Path: Backend/models/hackathonModel.js

const mongoose = require('mongoose');

const participantSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Assuming you have a User model
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    },
    message: { // Optional message from the participant
        type: String,
        default: ''
    },
}, {
    timestamps: true, // To track when the request was made
});

const hackathonSchema = mongoose.Schema(
    {
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', // Assuming you have a User model
        },
        title: {
            type: String,
            required: [true, 'Please add a title'],
        },
        org: {
            type: String,
            required: [true, 'Please add an organization'],
        },
        desc: {
            type: String,
            required: [true, 'Please add a description'],
        },
        date: {
            type: String, // You might want to use Date type for better date handling
            required: [true, 'Please add a date'],
        },
        location: {
            type: String,
            required: [true, 'Please add a location'],
        },
        roomLimit: {
            type: Number,
            required: [true, 'Please add a room limit'],
        },
        rolesWanted: {
            type: [String], // Array of strings
            required: [true, 'Please add desired roles'],
        },
        participants: [participantSchema], // Array of participant objects
        // avatars: { // This might be dynamically generated from participants
        //     type: [String],
        // },
        color: {
            type: String,
            default: '#6A5ACD', // Default color
        },
        icon: {
            type: String,
            default: '💡', // Default icon
        },
        btnColor: {
            type: String,
            default: '#3366ff', // Default join button color
        },
    },
    {
        timestamps: true, // For createdAt and updatedAt
    }
);

module.exports = mongoose.model('Hackathon', hackathonSchema);