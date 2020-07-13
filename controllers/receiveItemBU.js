/* eslint-disable prefer-const */
const webpush = require("web-push");
const { v4: uuidv4 } = require('uuid');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const ReceiveItemBU = require('../models/receiveItemBU');
const BUInventory = require('../models/buInventory');
const FUInventory = require('../models/fuInventory');
const PurchaseRequest = require('../models/purchaseRequest');
const ReplenishmentRequest = require('../models/replenishmentRequest');
const Item = require('../models/item');
const WHInventory = require('../models/warehouseInventory');
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
    if(req.body.replenishmentRequestStatus=="complete")
    { 
        const fUnit = await FunctionalUnit.findOne({_id:req.body.fuId})
        const fu = await FUInventory.findOne({itemId: req.body.itemId,fuId:fUnit._id})   
        const bu = await BUInventory.findOne({itemId: req.body.itemId,buId:req.body.buId})
        await BUInventory.findOneAndUpdate({itemId: req.body.itemId,buId:req.body.buId}, { $set: { qty: bu.qty+req.body.requestedQty }},{new:true})
        const rr = await FUInventory.findOneAndUpdate({itemId: req.body.itemId,_id:fu._id }, { $set: { qty: fu.qty-req.body.requestedQty }},{new:true}).populate('itemId')   
        const item = await Item.findOne({_id:req.body.itemId})
        const wh = await WHInventory.findOne({itemId:req.body.itemId})
        var st;
        var st2;
        console.log(wh.qty)
        console.log(rr.itemId.maximumLevel)
        console.log(rr.qty)
        if(wh.qty<(rr.itemId.maximumLevel-rr.qty))
        {
            console.log("here")
         st = "pending"
         st2 = "Cannot be fulfilled"
         var item2={
          itemId:req.body.itemId,
          currQty:wh.qty,
          reqQty:wh.itemId.maximumLevel-wh.qty,
          comments:'System',
          name:item.name,
          description:item.description,
          itemCode:item.itemCode
      }
          await PurchaseRequest.create({
              requestNo: uuidv4(),
              generated:'System',
              generatedBy:'System',
              committeeStatus: 'to_do',
              status:'to_do',
              comments:'System',
              reason:'reactivated_items',
              item:item2,
              vendorId:item.vendorId,
              requesterName:'System',
              department:'',
              orderType:'',
            });
            const payload1 = JSON.stringify({ title: "Purchase Request Generated",message:"Kindly check system generated purchase request" });
            const type1 = await StaffType.findOne({type:"FU Incharge"})
            const user1 = await User.find({staffTypeId:type1._id})
            for(var q = 0; q<user1.length; q++ )
            {
            Subscription.find({user:user1[q]._id}, (err, subscriptions) => {
              if (err) {
                console.error(`Error occurred while getting subscriptions`);
                res.status(500).json({
                  error: 'Technical error occurred',
                });
              } else {
                let parallelSubscriptionCalls = subscriptions.map((subscription) => {
                  return new Promise((resolve, reject) => {
                    const pushSubscription = {
                      endpoint: subscription.endpoint,
                      keys: {
                        p256dh: subscription.keys.p256dh,
                        auth: subscription.keys.auth,
                      },
                    };
                    const pushPayload = payload1;
                    webpush
                      .sendNotification(pushSubscription, pushPayload)
                      .then((value) => {
                        resolve({
                          status: true,
                          endpoint: subscription.endpoint,
                          data: value,
                        });
                      })
                      .catch((err) => {
                        reject({
                          status: false,
                          endpoint: subscription.endpoint,
                          data: err,
                        });
                      });
                  });
                });
              }
            });
          }
          const rr3 = await ReplenishmentRequest.find().populate('fuId').populate('itemId').populate('approvedBy')
          globalVariable.io.emit("get_data", rr3) 
        }
        else
        {
         st = "pending"
         st2 = "Can be fulfilled"
        }
        if(rr.qty<=rr.itemId.reorderLevel)
        {
            await ReplenishmentRequest.create({
                requestNo: uuidv4(),
                generated:'System',
                generatedBy:'System',
                reason:'reactivated_items',
                fuId:req.body.fuId,
                itemId:req.body.itemId,
                comments:'System generated Replenishment Request',
                currentQty:rr.qty,
                requestedQty:rr.itemId.maximumLevel-rr.qty,
                description:item.description,
                status: st,
                secondStatus:st2,
                requesterName:'System',
                orderType:'',
                to:'Warehouse',
                from:'FU',
                recieptUnit:item.receiptUnit,
                issueUnit:item.issueUnit,
                fuItemCost:0,
                department:'',
                rrB:req.body.rrBUId
              });
            const payload = JSON.stringify({ title: "Replenishment Request Generated",message:"Kindly check system generated replenishment request" });
            const type = await StaffType.findOne({type:"FU Incharge"})
            const user = await User.find({staffTypeId:type._id})
            for(var j = 0; j<user.length; j++ )
            {
            Subscription.find({user:user[j]._id}, (err, subscriptions) => {
              if (err) {
                console.error(`Error occurred while getting subscriptions`);
                res.status(500).json({
                  error: 'Technical error occurred',
                });
              } else {
                let parallelSubscriptionCalls = subscriptions.map((subscription) => {
                  return new Promise((resolve, reject) => {
                    const pushSubscription = {
                      endpoint: subscription.endpoint,
                      keys: {
                        p256dh: subscription.keys.p256dh,
                        auth: subscription.keys.auth,
                      },
                    };
                    const pushPayload = payload;
                    webpush
                      .sendNotification(pushSubscription, pushPayload)
                      .then((value) => {
                        resolve({
                          status: true,
                          endpoint: subscription.endpoint,
                          data: value,
                        });
                      })
                      .catch((err) => {
                        reject({
                          status: false,
                          endpoint: subscription.endpoint,
                          data: err,
                        });
                      });
                  });
                });
              }
            });
          }
          const rr2 = await ReplenishmentRequest.find().populate('fuId').populate('itemId').populate('approvedBy')
          globalVariable.io.emit("get_data", rr2)
    }
    }
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