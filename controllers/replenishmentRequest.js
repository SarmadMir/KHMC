/* eslint-disable prefer-const */
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { v4: uuidv4 } = require('uuid');
const ReplenishmentRequest = require('../models/replenishmentRequest');
exports.getReplenishmentRequests = asyncHandler(async (req, res) => {
    const replenishmentRequest = await ReplenishmentRequest.find().populate('fuId').populate('itemId');    
    res.status(200).json({ success: true, data: replenishmentRequest });
});
exports.getReplenishmentRequestsById = asyncHandler(async (req, res) => {
    const replenishmentRequest = await ReplenishmentRequest.findOne({_id:_id}).populate('fuId').populate('itemId');    
    res.status(200).json({ success: true, data: replenishmentRequest });
});
exports.addReplenishmentRequest = asyncHandler(async (req, res) => {
    const { generatedBy,dateGenerated,fuId,comments,itemId,currentQty,requestedQty,recieptUnit,
            issueUnit,fuItemCost,description,status} = req.body;
    await ReceiveItem.create({
        requestNo: uuidv4(),
        generatedBy,
        dateGenerated,
        fuId,
        comments,
        itemId,
        currentQty,
        requestedQty,
        recieptUnit,
        issueUnit,
        fuItemCost,
        description,
        status
    });
    res.status(200).json({ success: true });
});

exports.deleteReplenishmentRequest = asyncHandler(async (req, res, next) => {
    const { _id } = req.params;
    const replenishmentRequest = await ReplenishmentRequest.findById(_id);
    if(!replenishmentRequest) {
        return next(
        new ErrorResponse(`Replenishment Request not found with id of ${_id}`, 404)
        );
    }

    await ReplenishmentRequest.deleteOne({_id: _id});

    res.status(200).json({ success: true, data: {} });
});

exports.updateReplenishmentRequest = asyncHandler(async (req, res, next) => {
    const { _id } = req.body;

    let replenishmentRequest = await ReplenishmentRequest.findById(_id);

    if(!replenishmentRequest) {
        return next(
        new ErrorResponse(`Replenishment Request not found with id of ${_id}`, 404)
        );
    }

    replenishmentRequest = await ReplenishmentRequest.updateOne({_id: _id}, req.body);
    res.status(200).json({ success: true, data: replenishmentRequest });
});
