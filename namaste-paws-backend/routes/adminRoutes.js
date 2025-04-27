const express = require('express');
const router = express.Router();

const {
    listAdoptionRequestsHandler,
    updateAdoptionRequestStatusHandler,
} = require('../controllers/adoptionRequestController');

const { adminLogin, verifyAdminToken } = require('../controllers/adminAuthController');

// Admin login route
router.post('/login', adminLogin);

// List all adoption requests (protected)
router.get('/adoption-requests', verifyAdminToken, listAdoptionRequestsHandler);

// Update adoption request status (approve/deny) (protected)
router.put('/adoption-requests/:id/status', verifyAdminToken, updateAdoptionRequestStatusHandler);

module.exports = router;