// Path: Backend/routes/hackathonRoutes.js

const express = require('express');
const router = express.Router();
const {
    getHackathons,
    createHackathon,
    requestToJoinHackathon,
    getJoinRequestsForCreator, // Import new function
    updateJoinRequestStatus,   // Import new function
} = require('../controllers/hackathonController');

const { protect } = require('../middleware/authMiddleware'); // For protecting routes

// Public routes
router.get('/', getHackathons);

// Hackathon creation and join request (temporarily unprotected)
router.post('/', /* protect, */ createHackathon);
router.post('/:id/request-join', /* protect, */ requestToJoinHackathon);

// NEW ROUTES for Creator to manage requests (temporarily unprotected)
// GET /api/hackathons/my-requests/:creatorId
router.get('/my-requests/:creatorId', /* protect, */ getJoinRequestsForCreator);

// PUT /api/hackathons/:id/requests/:requestId/status
router.put('/:id/requests/:requestId/status', /* protect, */ updateJoinRequestStatus);


module.exports = router;