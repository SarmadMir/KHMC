const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const SystemAdmin = require('../models/systemAdmin');

exports.getSystemAdmin = asyncHandler(async (req, res) => {
    const systemAdmin = await SystemAdmin.find();
    res.status(200).json({ success: true, data: systemAdmin });
});

exports.addSystemAdmin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const systemAdmin = await SystemAdmin.create({
        username,
        password
    });

    res.status(200).json({ success: true, data: systemAdmin });
});

exports.deleteSystemAdmin = asyncHandler(async (req, res, next) => {
    const { _id } = req.params;
    const systemAdmin = await SystemAdmin.findById(_id);

    if(!systemAdmin) {
      return next(
        new ErrorResponse(`System admin not found with id of ${_id}`, 404)
      );
    }

    await SystemAdmin.deleteOne({_id: _id});

    res.status(200).json({ success: true, data: {} });

});

exports.updateSystemAdmin = asyncHandler(async (req, res, next) => {
    const { _id } = req.body;

    let systemAdmin = await SystemAdmin.findById(_id);

    if(!systemAdmin) {
      return next(
        new ErrorResponse(`System admin not found with id of ${_id}`, 404)
      );
    }

    systemAdmin = await SystemAdmin.updateOne({_id: _id}, req.body);

    res.status(200).json({ success: true, data: systemAdmin });
});