/* eslint-disable prefer-const */
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const ReceiveItemFU = require('../models/receiveItemFU');
const FUInventory = require('../models/fuInventory');
exports.getReceiveItemsFU = asyncHandler(async (req, res) => {
    const receiveItems = await ReceiveItemFU.find().populate('vendorId');
    const data = {
        receiveItems
    }   
    res.status(200).json({ success: true, data: data });
});

exports.addReceiveItemFU = asyncHandler(async (req, res) => {
    const { itemId,currentQty, requestedQty, receivedQty, bonusQty, batchNumber,lotNumber,
        expiryDate,unit, discount, unitDiscount, discountAmount, tax, taxAmount, finalUnitPrice, subTotal, 
        discountAmount2,totalPrice, invoice, dateInvoice,dateReceived, notes,materialId,vendorId,prId } = req.body;
    await ReceiveItemFU.create({
        itemId,
        currentQty,
        requestedQty,
        receivedQty,
        bonusQty,
        batchNumber,
        lotNumber,
        expiryDate,
        unit,
        discount,
        unitDiscount,
        discountAmount,
        tax,
        taxAmount,
        finalUnitPrice,
        subTotal,
        discountAmount2,
        totalPrice,
        invoice,
        dateInvoice,
        dateReceived,
        notes
    });
    await FUInventory.updateOne({itemId: itemId}, { $set: { qty: currentQty+receivedQty }})
    res.status(200).json({ success: true});
});

exports.deleteReceiveItemFU = asyncHandler(async (req, res, next) => {
    const { _id } = req.params;
    const receiveItem = await ReceiveItemFU.findById(_id);
    if(!receiveItem) {
        return next(
        new ErrorResponse(`Received Item not found with id of ${_id}`, 404)
        );
    }

    await ReceiveItemFU.deleteOne({_id: _id});

    res.status(200).json({ success: true, data: {} });
});

exports.updateReceiveItemFU = asyncHandler(async (req, res, next) => {
    const { _id } = req.body;

    let receiveItem = await ReceiveItemFU.findById(_id);

    if(!receiveItem) {
        return next(
        new ErrorResponse(`Received item not found with id of ${_id}`, 404)
        );
    }

    receiveItem = await ReceiveItemFU.updateOne({_id: _id}, req.body);
    res.status(200).json({ success: true, data: receiveItem });
});