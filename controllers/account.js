const bcrypt = require('bcryptjs');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Account = require('../models/account');
const SystemAdmin = require('../models/systemAdmin');
exports.getAccount = asyncHandler(async (req, res) => {
  const account = await Account.find().populate('mrId').populate('vendorId');
  res.status(200).json({ success: true, data: account });
});
