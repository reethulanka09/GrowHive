// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const { uploadCertificates, uploadProfileImage } = require('../controllers/uploadController'); // Import new profile image upload
const { protect } = require('../middleware/authMiddleware');

router.post('/certificates', protect, uploadCertificates);
router.put('/profile-image', protect, uploadProfileImage); // <-- NEW: Route for profile image upload

module.exports = router;
