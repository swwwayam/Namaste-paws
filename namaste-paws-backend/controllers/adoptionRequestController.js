const {
    listAdoptionRequests,
    updateAdoptionRequestStatus,
    createAdoptionRequest,
} = require('../models/adoptionRequestModel');

const createAdoptionRequestHandler = async(req, res) => {
    const { petId, userId } = req.body;
    if (!petId || !userId) {
        return res.status(400).json({ error: 'petId and userId are required' });
    }
    try {
        const adoptionRequest = await createAdoptionRequest(petId, userId);
        res.status(201).json(adoptionRequest);
    } catch (error) {
        console.error('Error creating adoption request:', error);
        res.status(500).json({ error: 'Failed to create adoption request' });
    }
};

const listAdoptionRequestsHandler = async(req, res) => {
    try {
        const requests = await listAdoptionRequests();
        res.json(requests);
    } catch (error) {
        console.error('Error listing adoption requests:', error);
        res.status(500).json({ error: 'Failed to list adoption requests' });
    }
};

const updateAdoptionRequestStatusHandler = async(req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!['approved', 'denied'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
    }
    try {
        const updatedRequest = await updateAdoptionRequestStatus(id, status);
        if (!updatedRequest) {
            return res.status(404).json({ error: 'Adoption request not found' });
        }
        res.json(updatedRequest);
    } catch (error) {
        console.error('Error updating adoption request status:', error);
        res.status(500).json({ error: 'Failed to update adoption request status' });
    }
};

module.exports = {
    createAdoptionRequestHandler,
    listAdoptionRequestsHandler,
    updateAdoptionRequestStatusHandler,
};