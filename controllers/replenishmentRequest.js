/* eslint-disable prefer-const */
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { v4: uuidv4 } = require('uuid');
const ReplenishmentRequest = require('../models/replenishmentRequest');
const WHInventory = require('../models/warehouseInventory');
const FUInventory = require('../models/fuInventory');
const BUInventory = require('../models/buInventory');
const PurchaseRequest = require('../models/purchaseRequest');
exports.getReplenishmentRequestsFU = asyncHandler(async (req, res) => {
    const replenishmentRequest = await ReplenishmentRequest.find({to:"Warehouse",from:"FU"}).populate('fuId').populate('itemId').populate('approvedBy');    
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
            issueUnit,fuItemCost,description,status,secondStatus,approvedBy} = req.body;
        if((req.body.to=="Warehouse") && (req.body.from=="FU"))
        {
            const wh = await WHInventory.findOne({itemId: req.body.itemId})
            if(wh.qty>=req.body.requestedQty)
            {
                req.body.secondStatus = "Can be fullfilled"
            }
            else{
                req.body.secondStatus = "Cannot be fullfilled"
            }
        }
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
        status,
        secondStatus:req.body.secondStatus,
        approvedBy
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
        if(req.body.secondStatus == "fullfilled")
        {       
        if((req.body.to=="Warehouse") && (req.body.from=="FU"))
        {
            const wh = await WHInventory.findOne({itemId: req.body.itemId})
            if(wh.qty>=req.body.requestedQty)
            {
                await FUInventory.updateOne({fuId: req.body.fuId, itemId: req.body.itemId}, { $set: { qty: req.body.currentQty+req.body.requestedQty }})
               const pr = await WHInventory.findOneAndUpdate({itemId: req.body.itemId}, { $set: { qty: req.body.currentQty-req.body.requestedQty }},{new:true}).populate('itemId')
                // if(pr.qty<=pr.itemId.reorderLevel)
                // {
                //     await PurchaseRequest.create({
                //         requestNo: uuidv4(),
                //         generated:'System',
                //         generatedBy:'System',
                //         committeeStatus: 'to_do',
                //         status:'to_do',
                //         comments,
                //         reason,
                //         item,
                //         vendorId,
                //         requesterName,
                //         department,
                //         orderType,
                //       });
                // }
            }
            else{
                req.body.status = "out_of_stock"
                req.body.secondStatus = "out_of_stock"
            }
        }
        else if((req.body.to=="FU") && (req.body.from=="BU"))
        {
            const fu = await FUInventory.findOne({itemId: req.body.itemId,fuId:req.body.fuId})
            if(fu.qty>=req.body.requestedQty)
            {
                await BUInventory.updateOne({buId: req.body.buId, itemId:req.body.itemId}, { $set: { qty: req.body.currentQty+req.body.requestedQty }})
                const fui = await FUInventory.findOneAndUpdate({itemId: req.body.itemId,fuId:req.body.fuId}, { $set: { qty: req.body.currentQty-req.body.requestedQty }},{new:true}).populate('itemId')
                // if(fui.qty<=fui.itemId.reorderLevel)
                // {
                //     await ReplenishmentRequest.create({
                //         requestNo: uuidv4(),
                //         generated:'System',
                //         generatedBy:'System',
                //         dateGenerated:Date.now(),
                //         reason,
                //         fuId:req.body.fuId,
                //         buId:req.body.buId,
                //         to:'FU',
                //         from:'BU',
                //         comments,
                //         itemId:req.body.itemId,
                //         currentQty:fui.qty,
                //         requestedQty,
                //         recieptUnit,
                //         issueUnit,
                //         fuItemCost,
                //         description,
                //         status:'pending'
                //     });
                // }
            }
            else{
                req.body.status = "out_of_stock"
                req.body.secondStatus = "out_of_stock"
            }

        } 
    }
    }
    res.status(200).json({ success: true, data: replenishmentRequest });
});
exports.getCurrentItemQuantityFU = asyncHandler(async (req, res) => {
    const fuInventory = await FUInventory.findOne(
      { itemId: req.body.itemId,fuId:req.body.fuId },
      { qty: 1 }
    );
    res.status(200).json({ success: true, data: fuInventory });
  });
  exports.getCurrentItemQuantityBU = asyncHandler(async (req, res) => {
    const buInventory = await BUInventory.findOne(
      { itemId: req.body.itemId,buId:req.body.buId },
      { qty: 1 }
    );
    res.status(200).json({ success: true, data: buInventory });
  });