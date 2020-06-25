/* eslint-disable prefer-const */
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { v4: uuidv4 } = require('uuid');
const InternalReturnRequest = require('../models/internalReturnRequest');
const ReplenishmentRequestBU = require('../models/replenishmentRequestBU');
const WHInventory = require('../models/warehouseInventory');
const FunctionalUnit = require('../models/functionalUnit');
const FUInventory = require('../models/fuInventory');
const BUInventory = require('../models/buInventory');
const PurchaseRequest = require('../models/purchaseRequest');
const Item = require('../models/item');
exports.getInternalReturnRequestsFU = asyncHandler(async (req, res) => {
    const internalRequestFU = await InternalReturnRequest.find({to:"Warehouse",from:"FU"}).populate('fuId').populate('itemId').populate('replenismentRequestFU');
    res.status(200).json({ success: true, data: internalRequestFU });
});
exports.getInternalReturnRequestsBU = asyncHandler(async (req, res) => {
    const internalRequestBU = await InternalReturnRequest.find({to:"FU",from:"BU"}).populate('buId').populate('fuId').populate('itemId').populate('replenismentRequestBU');
    res.status(200).json({ success: true, data: internalRequestBU });
});
exports.getInternalReturnRequestsById = asyncHandler(async (req, res) => {
    const internalRequest = await (await InternalReturnRequest.findOne({_id:_id,}).populate('buId').populate('fuId').populate('itemId').populate('replenismentRequestBU').populate('replenismentRequestFU'));
    res.status(200).json({ success: true, data: internalRequest });
});
exports.deleteInternalReturnRequests = asyncHandler(async (req, res, next) => {
    const { _id } = req.params;
    const internalReturn = await InternalReturnRequest.findById(_id);
    if(!internalReturn) {
        return next(
        new ErrorResponse(`Internal Return not found with id of ${_id}`, 404)
        );
    }
    await InternalReturnRequest.deleteOne({_id: _id});
    res.status(200).json({ success: true, data: {} });
});

exports.addInternalReturnRequest = asyncHandler(async (req, res) => {
    const { generatedBy,dateGenerated,expiryDate,to,from,buId,itemId,currentQty,reason,
           reasonDetail,description,status,damageReport,replenismentRequestBU,replenismentRequestFU} = req.body;
    await InternalReturnRequest.create({
        returnRequestNo: uuidv4(),
        generatedBy,
        dateGenerated,
        expiryDate,
        to,
        from,
        fuId,
        buId,
        itemId,
        currentQty,
        description,
        reason,
        reasonDetail,
        damageReport,
        status,
        replenismentRequestBU,replenismentRequestFU
    });
    res.status(200).json({ success: true });
});


exports.updateInternalRequest = asyncHandler(async (req, res, next) => {
    const { _id } = req.body;
    let internalReturn = await InternalReturnRequest.findById(_id);
    if(!internalReturn) {
        return next(
        new ErrorResponse(`Internal Return not found with id of ${_id}`, 404)
        );
    }

    internalReturn = await InternalReturnRequest.findOneAndUpdate({_id: _id}, req.body,{new:true});
    res.status(200).json({ success: true, data: internalReturn });
});