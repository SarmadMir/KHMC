/* eslint-disable prefer-const */
const webpush = require("web-push");
const { v4: uuidv4 } = require('uuid');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const ReceiveItemBU = require('../models/receiveItemBU');
const BUInventory = require('../models/buInventory');
const FUInventory = require('../models/fuInventory');
const ReplenishmentRequest = require('../models/replenishmentRequest');
const ReplenishmentRequestBU = require('../models/replenishmentRequestBU');
const FunctionalUnit = require('../models/functionalUnit')
const StaffType = require('../models/staffType');
const User = require('../models/user')
const Subscription = require('../models/subscriber')
const privateVapidKey = "s92YuYXxjJ38VQhRSuayTb9yjN_KnVjgKfbpsHOLpjc";
const publicVapidKey = "BOHtR0qVVMIA-IJEru-PbIKodcux05OzVVIJoIBKQu3Sp1mjvGkjaT-1PIzkEwAiAk6OuSCZfNGsgYkJJjOyV7k"
webpush.setVapidDetails(
  "mailto:hannanbutt1995@gmail.com",
  publicVapidKey,
  privateVapidKey
);
exports.getReceiveItemsBU = asyncHandler(async (req, res) => {
    const receiveItems = await ReceiveItemBU.find().populate('vendorId');
    const data = {
        receiveItems
    }   
    res.status(200).json({ success: true, data: data });
});

exports.addReceiveItemBU = asyncHandler(async (req, res) => {
    const { itemId,currentQty, requestedQty, receivedQty, bonusQty, batchNumber,lotNumber,
        expiryDate,unit, discount, unitDiscount, discountAmount, tax, taxAmount, finalUnitPrice, subTotal, 
        discountAmount2,totalPrice, invoice, dateInvoice,dateReceived, notes,replenishmentRequestId,replenishmentRequestStatus,fuId } = req.body;
    await ReceiveItemBU.create({
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
        notes,
        replenishmentRequestId
    });
    await ReplenishmentRequestBU.findOneAndUpdate({_id: replenishmentRequestId},{ $set: { status:req.body.replenishmentRequestStatus,secondStatus:req.body.replenishmentRequestStatus }},{new:true});
    // if((req.body.replenishmentRequestStatus=="Received")||(req.body.replenishmentRequestStatus=="Partially Received"))
    // {       
    //     const bui = await FunctionalUnit.findOne({buId:req.body.buId})//wrong logic change when more data
    //     const fui = await FUInventory.findOne({itemId: req.body.itemId,fuId:bui._id})   
    //     const bu = await BUInventory.findOne({itemId: req.body.itemId,buId:req.body.buId})
    //     const fu = await FUInventory.findOne({itemId: req.body.itemId,_id:fui._id})
    //     await BUInventory.findOneAndUpdate({itemId: req.body.itemId,buId:req.body.buId}, { $set: { qty: bu.qty+req.body.requestedQty }},{new:true})
    //     const rr = await FUInventory.findOneAndUpdate({itemId: req.body.itemId}, { $set: { qty: fu.qty-req.body.requestedQty }},{new:true}).populate('itemId')   
    //     if(rr.qty<=rr.itemId.reorderLevel)
    //         {
    //             await ReplenishmentRequest.create({
    //                 requestNo: uuidv4(),
    //                 generated:'System',
    //                 generatedBy:'System',
    //                 reason:'Item quantity in Functional Unit is low then reorder level',
    //                 fuId:fu._id,//Wrong logic should be dynamic
    //                 comments:'System generated Replenishment Request',
    //                 currentQty:rr.qty,
    //                 requestedQty:rr.itemId.maximumLevel-rr.qty,
    //                 description:'System generated Replenishment Request',
    //                 status: 'to_do',
    //                 secondStatus:'to_do',
    //               });
    //             const payload = JSON.stringify({ title: "Replenishment Request Generated",message:"Kindly check system generated replenishment request" });
    //             const type = await StaffType.findOne({type:"FU Incharge"})
    //             const user = await User.find({staffTypeId:type._id})
    //             for(var i = 0; i<user.length; i++ )
    //             {
    //             Subscription.find({user:user[i]._id}, (err, subscriptions) => {
    //               if (err) {
    //                 console.error(`Error occurred while getting subscriptions`);
    //                 res.status(500).json({
    //                   error: 'Technical error occurred',
    //                 });
    //               } else {
    //                 let parallelSubscriptionCalls = subscriptions.map((subscription) => {
    //                   return new Promise((resolve, reject) => {
    //                     const pushSubscription = {
    //                       endpoint: subscription.endpoint,
    //                       keys: {
    //                         p256dh: subscription.keys.p256dh,
    //                         auth: subscription.keys.auth,
    //                       },
    //                     };
    //                     const pushPayload = payload;
    //                     webpush
    //                       .sendNotification(pushSubscription, pushPayload)
    //                       .then((value) => {
    //                         resolve({
    //                           status: true,
    //                           endpoint: subscription.endpoint,
    //                           data: value,
    //                         });
    //                       })
    //                       .catch((err) => {
    //                         reject({
    //                           status: false,
    //                           endpoint: subscription.endpoint,
    //                           data: err,
    //                         });
    //                       });
    //                   });
    //                 });
    //               }
    //             });
    //           }
    //           const rr2 = await ReplenishmentRequest.find().populate('fuId').populate('itemId').populate('approvedBy')
    //           globalVariable.io.emit("get_data", rr2)
    //     }
    // }

    res.status(200).json({ success: true});
});

exports.deleteReceiveItemBU = asyncHandler(async (req, res, next) => {
    const { _id } = req.params;
    const receiveItem = await ReceiveItemBU.findById(_id);
    if(!receiveItem) {
        return next(
        new ErrorResponse(`Received Item not found with id of ${_id}`, 404)
        );
    }
    await ReceiveItemBU.deleteOne({_id: _id});
    res.status(200).json({ success: true, data: {} });
});

exports.updateReceiveItemBU = asyncHandler(async (req, res, next) => {
    const { _id } = req.body;

    let receiveItem = await ReceiveItemBU.findById(_id);

    if(!receiveItem) {
        return next(
        new ErrorResponse(`Received item not found with id of ${_id}`, 404)
        );
    }

    receiveItem = await ReceiveItemBU.updateOne({_id: _id}, req.body);
    res.status(200).json({ success: true, data: receiveItem });
});