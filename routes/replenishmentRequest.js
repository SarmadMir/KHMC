const express = require('express');
const {
    getReplenishmentRequests,
    getReplenishmentRequestsById,
    addReplenishmentRequest,
    deleteReplenishmentRequest,
    updateReplenishmentRequest,
} = require('../controllers/replenishmentRequest');

const router = express.Router();


router.get('/getreplenishmentrequests', getReplenishmentRequests);
router.get('/getreplenishmentrequests/:_id', getReplenishmentRequestsById);
router.post('/addreplenishmentrequest', addReplenishmentRequest);
router.delete('/deletereceiveitem/:_id', deleteReplenishmentRequest);
router.put('/updatereceiveitem', updateReplenishmentRequest);

module.exports = router;
