const express = require('express');
const {
    getFuInventory,
    addFuInventory,
    deleteFuInventory,
    updateFuInventory
} = require('../controllers/fuInventory');

const router = express.Router();


router.get('/getfuinventory', getFuInventory);
router.post('/addfuinventory', addFuInventory);
router.delete('/deletefuinventory/:_id', deleteFuInventory);
router.put('/updatefuinventory', updateFuInventory);

module.exports = router;
