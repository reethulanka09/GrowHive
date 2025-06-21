// Path: Backend/controllers/hackathonController.js

const asyncHandler = require('express-async-handler');
const Hackathon = require('../models/hackathonModel');
const User = require('../models/User'); // Assuming you have a User model for populating

// @desc    Get all hackathons
// @route   GET /api/hackathons
// @access  Public
const getHackathons = asyncHandler(async (req, res) => {
    // Populate participants' user details (e.g., username, avatar for frontend display)
    // We only populate 'user' field, as 'status' and 'message' are directly on participantSchema
    const hackathons = await Hackathon.find({})
        .populate('creator', 'name email') // Populate creator details
        .populate('participants.user', 'name avatar'); // Populate participant user details
    res.status(200).json(hackathons);
});

// @desc    Create a new hackathon
// @route   POST /api/hackathons
// @access  Private (but temporarily unprotected for testing)
const createHackathon = asyncHandler(async (req, res) => {
    console.log('Received request body for creating hackathon:', req.body);

    const {
        title,
        org,
        desc,
        date,
        location,
        roomLimit,
        rolesWanted,
        color,
        icon,
        btnColor,
        creatorId,
    } = req.body;

    if (!title || !org || !desc || !date || !location || !roomLimit || !rolesWanted || !creatorId) {
        res.status(400);
        throw new Error('Please fill in all hackathon fields, including creator ID.');
    }

    if (isNaN(roomLimit) || roomLimit <= 0) {
        res.status(400);
        throw new Error('Room Limit must be a positive number.');
    }

    let parsedRolesWanted = rolesWanted;
    if (typeof rolesWanted === 'string') {
        parsedRolesWanted = rolesWanted.split(',').map(role => role.trim()).filter(role => role);
    }
    if (!Array.isArray(parsedRolesWanted)) {
        res.status(400);
        throw new Error('Roles Wanted must be a comma-separated string or an array of strings.');
    }

    const hackathon = await Hackathon.create({
        creator: creatorId,
        title,
        org,
        desc,
        date,
        location,
        roomLimit,
        rolesWanted: parsedRolesWanted,
        color: color || '#6A5ACD',
        icon: icon || '💡',
        btnColor: btnColor || '#3366ff',
    });

    res.status(201).json(hackathon);
});

// @desc    Request to join a hackathon
// @route   POST /api/hackathons/:id/request-join
// @access  Temporarily Public (was Private, due to 'protect' being commented out in routes)
const requestToJoinHackathon = asyncHandler(async (req, res) => {
    const { message, userId } = req.body;
    const hackathonId = req.params.id;

    if (!userId) {
        res.status(400);
        throw new Error('User ID is required in the request body to send a join request (temporary bypass).');
    }

    const hackathon = await Hackathon.findById(hackathonId);

    if (!hackathon) {
        res.status(404);
        throw new Error('Hackathon not found');
    }

    // Check if the user is already a participant or has a pending request
    const existingParticipant = hackathon.participants.find(
        p => p.user && p.user.toString() === userId.toString()
    );

    if (existingParticipant) {
        if (existingParticipant.status === 'accepted') {
            res.status(400);
            throw new Error('You are already an accepted participant in this hackathon.');
        } else if (existingParticipant.status === 'pending') {
            res.status(400);
            throw new Error('You already have a pending join request for this hackathon.');
        }
    }

    // Add new participant with pending status
    hackathon.participants.push({ user: userId, status: 'pending', message: message || 'No message provided' });

    await hackathon.save();

    res.status(200).json({ message: 'Join request sent successfully!', hackathon });
});


// NEW: @desc    Get all pending join requests for a creator's hackathons
// NEW: @route   GET /api/hackathons/my-requests/:creatorId
// NEW: @access  Private (should be protected by creator's ID, bypassing for now)
const getJoinRequestsForCreator = asyncHandler(async (req, res) => {
    // In a real app, you'd get creatorId from req.user.id after authentication
    const creatorId = req.params.creatorId; // TEMPORARY: Getting creatorId from URL for testing

    if (!creatorId) {
        res.status(400);
        throw new Error('Creator ID is required.');
    }

    // Find hackathons created by this creator
    const hackathons = await Hackathon.find({ creator: creatorId })
        .populate('participants.user', 'name email avatar'); // Populate requesting user details

    if (!hackathons) {
        res.status(404);
        throw new Error('No hackathons found for this creator.');
    }

    // Filter out only pending requests from all hackathons
    let allPendingRequests = [];
    hackathons.forEach(hackathon => {
        hackathon.participants.forEach(participant => {
            if (participant.status === 'pending') {
                allPendingRequests.push({
                    hackathonId: hackathon._id,
                    hackathonTitle: hackathon.title,
                    requestId: participant._id, // The _id of the specific participant entry
                    requestingUser: participant.user, // Populated user object
                    message: participant.message,
                    requestedAt: participant.createdAt,
                    status: participant.status,
                });
            }
        });
    });

    res.status(200).json(allPendingRequests);
});


// NEW: @desc    Accept or reject a join request
// NEW: @route   PUT /api/hackathons/:id/requests/:requestId/status
// NEW: @access  Private (should be protected by creator's ID)
const updateJoinRequestStatus = asyncHandler(async (req, res) => {
    const hackathonId = req.params.id;
    const requestId = req.params.requestId; // The _id of the specific participant entry
    const { status, creatorId } = req.body; // status: 'accepted' or 'rejected'
    // TEMPORARY: creatorId to verify ownership

    if (!['accepted', 'rejected'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status. Must be "accepted" or "rejected".');
    }

    if (!creatorId) {
        res.status(400);
        throw new Error('Creator ID is required in the request body for verification (temporary bypass).');
    }

    const hackathon = await Hackathon.findById(hackathonId);

    if (!hackathon) {
        res.status(404);
        throw new Error('Hackathon not found');
    }

    // Verify if the person making the request is the hackathon creator
    // In a real app, this would be req.user.id === hackathon.creator.toString()
    if (hackathon.creator.toString() !== creatorId.toString()) {
        res.status(403); // Forbidden
        throw new Error('Not authorized to update this request. Only the hackathon creator can do this.');
    }

    const participantIndex = hackathon.participants.findIndex(
        p => p._id.toString() === requestId.toString()
    );

    if (participantIndex === -1) {
        res.status(404);
        throw new Error('Join request not found.');
    }

    // Update the status of the specific participant
    hackathon.participants[participantIndex].status = status;

    await hackathon.save();

    // You might want to send a notification to the requesting user here (next step!)

    res.status(200).json({
        message: `Join request ${status} successfully!`,
        updatedParticipant: hackathon.participants[participantIndex]
    });
});


module.exports = {
    getHackathons,
    createHackathon,
    requestToJoinHackathon,
    getJoinRequestsForCreator, // Export new function
    updateJoinRequestStatus,   // Export new function
};