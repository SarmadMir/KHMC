const express = require('express');

const {
    getAccount,
} = require('../controllers/account');
const router = express.Router();
router.get('/getaccounts', getAccount);
module.exports = router;
