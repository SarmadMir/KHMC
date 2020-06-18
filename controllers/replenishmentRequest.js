/* eslint-disable prefer-const */
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { v4: uuidv4 } = require('uuid');
const ReplenishmentRequest = require('../models/replenishmentRequest');
const WHInventory = require('../models/warehouseInventory');
const FUInventory = require('../models/fuInventory');
const BUInventory = require('../models/buInventory');
exports.getReplenishmentRequestsFU = asyncHandler(async (req, res) => {
    const replenishmentRequest = await ReplenishmentRequest.find({to:"Warehouse",from:"FU"}).populate('fuId').populate('itemId');    
    res.status(200).json({ success: true, data: replenishmentRequest });
});
exports.getReplenishmentRequestsByIdFU = asyncHandler(async (req, res) => {
    const replenishmentRequest = await ReplenishmentRequest.findOne({_id:_id,to:"Warehouse",from:"FU"}).populate('fuId').populate('itemId');    
    res.status(200).json({ success: true, data: replenishmentRequest });
});
exports.getReplenishmentRequestsBU = asyncHandler(async (req, res) => {
    const replenishmentRequest = await ReplenishmentRequest.find({to:"FU",from:"BU"}).populate('buId').populate('fuId').populate('itemId');    
    res.status(200).json({ success: true, data: replenishmentRequest });
});
exports.getReplenishmentRequestsByIdBU = asyncHandler(async (req, res) => {
    const replenishmentRequest = await ReplenishmentRequest.findOne({_id:_id,to:"FU",from:"BU"}).populate('buId').populate('fuId').populate('itemId');    
    res.status(200).json({ success: true, data: replenishmentRequest });
});
exports.addReplenishmentRequest = asyncHandler(async (req, res) => {
    const { generated,generatedBy,dateGenerated,reason,fuId,buId,to,from,comments,itemId,currentQty,requestedQty,recieptUnit,
            issueUnit,fuItemCost,description,status} = req.body;
    await ReplenishmentRequest.create({
        requestNo: uuidv4(),
        generated,
        generatedBy,
        dateGenerated,
        reason,
        fuId,
        buId,
        to,
        from,
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

    replenishmentRequest = await ReplenishmentRequest.findOneAndUpdate({_id: _id}, req.body,{new:true});
    if(req.body.status=="approved")
    {
        if((req.body.to=="Warehouse") && (req.body.from=="FU"))
        {
            await FUInventory.updateOne({fuId: req.body.fuId}, { $set: { qty: req.body.currentQty+req.body.requestedQty }})
            await WHInventory.updateOne({itemId: req.body.itemId}, { $set: { qty: req.body.currentQty-req.body.requestedQty }})
        }
        else if((req.body.to=="FU") && (req.body.from=="BU"))
        {
            await BUInventory.updateOne({buId: req.body.buId}, { $set: { qty: req.body.currentQty+req.body.requestedQty }})
            await FUInventory.updateOne({itemId: req.body.itemId,_id:req.body.fuId}, { $set: { qty: req.body.currentQty-req.body.requestedQty }})
        }
    }
    res.status(200).json({ success: true, data: replenishmentRequest });
});
