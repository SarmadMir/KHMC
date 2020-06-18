const express = require('express');
const {
    getReplenishmentRequestsFU,
    getReplenishmentRequestsByIdFU,
    getReplenishmentRequestsBU,
    getReplenishmentRequestsByIdBU,
    addReplenishmentRequest,
    deleteReplenishmentRequest,
    updateReplenishmentRequest,
} = require('../controllers/replenishmentRequest');

const router = express.Router();


router.get('/getreplenishmentrequestsFU', getReplenishmentRequestsFU);
router.get('/getreplenishmentrequestsFU/:_id', getReplenishmentRequestsByIdFU);
router.get('/getreplenishmentrequestsBU', getReplenishmentRequestsBU);
router.get('/getreplenishmentrequestsBU/:_id', getReplenishmentRequestsByIdBU);
router.post('/addreplenishmentrequest', addReplenishmentRequest);
router.delete('/deletereceiveitem/:_id', deleteReplenishmentRequest);
router.put('/updatereceiveitem', updateReplenishmentRequest);

module.exports = router;
