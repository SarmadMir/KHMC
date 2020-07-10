/* eslint-disable prefer-const */
const webpush = require("web-push");
const { v4: uuidv4 } = require('uuid');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const PurchaseRequest = require('../models/purchaseRequest');
const ReceiveItemFU = require('../models/receiveItemFU');
const FUInventory = require('../models/fuInventory');
const ReplenishmentRequest = require('../models/replenishmentRequest');
const WHInventory = require('../models/warehouseInventory');
const Item = require('../models/item');
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
        discountAmount2,totalPrice, invoice, dateInvoice,dateReceived, notes,replenishmentRequestId,replenishmentRequestStatus,fuId } = req.body;
        const pRequest = await WHInventory.findOne({itemId: itemId}).populate('itemId')
        const fuTest = await FUInventory.findOne({itemId: itemId})
        if(pRequest && fuTest)
        {
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
        notes,
        replenishmentRequestId
    });}
    if((req.body.replenishmentRequestStatus=="Received")||(req.body.replenishmentRequestStatus=="Partially Received"))
    {
            const fu = await FUInventory.findOne({itemId: itemId})
            const wh = await WHInventory.findOne({itemId: itemId})
            await FUInventory.findOneAndUpdate({itemId: itemId}, { $set: { qty: fu.qty+parseInt(receivedQty) }},{new:true})
            const pr = await WHInventory.findOneAndUpdate({itemId: itemId}, { $set: { qty: wh.qty-parseInt(receivedQty) }},{new:true}).populate('itemId')
            if(fu && pr)
            {
            await ReplenishmentRequest.findOneAndUpdate({_id: replenishmentRequestId},{ $set: { status:req.body.replenishmentRequestStatus,secondStatus:req.body.replenishmentRequestStatus }},{new:true});
            if(pr.qty<=pr.itemId.reorderLevel)
            {
            const j =await Item.findOne({_id:req.body.itemId}) 
            var item={
                itemId:req.body.itemId,
                currQty:pr.qty,
                reqQty:pr.itemId.maximumLevel-pr.qty,
                comments:'System',
                name:j.name,
                description:j.description,
                itemCode:j.itemCode
            }
                await PurchaseRequest.create({
                    requestNo: uuidv4(),
                    generated:'System',
                    generatedBy:'System',
                    committeeStatus: 'to_do',
                    status:'to_do',
                    comments:'System',
                    reason:'System',
                    item,
                    vendorId:j.vendorId,
                    requesterName:'System',
                    department:'System',
                    orderType:'System',
                  });
                const payload = JSON.stringify({ title: "Purchase Request Generated",message:"Kindly check system generated purchase request" });
                const type = await StaffType.findOne({type:"Warehouse Incharge"})
                const user = await User.find({staffTypeId:type._id})
                for(var i = 0; i<user.length; i++ )
                {
                Subscription.find({user:user[i]._id}, (err, subscriptions) => {
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
              const pr2 = await PurchaseRequest.find()
              .populate('item.itemId')
              .populate('vendorId');
              globalVariable.io.emit("get_data", pr2)
        }
      }
    }

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



// exports.addReceiveItemFU = asyncHandler(async (req, res) => {
//   const { itemId,currentQty, requestedQty, receivedQty, bonusQty, batchNumber,lotNumber,
//       expiryDate,unit, discount, unitDiscount, discountAmount, tax, taxAmount, finalUnitPrice, subTotal,
//       discountAmount2,totalPrice, invoice, dateInvoice,dateReceived, notes,replenishmentRequestId,replenishmentRequestStatus,fuId } = req.body;
//       await ReceiveItemFU.create({
//       itemId,
//       currentQty,
//       requestedQty,
//       receivedQty,
//       bonusQty,
//       batchNumber,
//       lotNumber,
//       expiryDate,
//       unit,
//       discount,
//       unitDiscount,
//       discountAmount,
//       tax,
//       taxAmount,
//       finalUnitPrice,
//       subTotal,
//       discountAmount2,
//       totalPrice,
//       invoice,
//       dateInvoice,
//       dateReceived,
//       notes,
//       replenishmentRequestId
//   });
//   if((req.body.replenishmentRequestStatus=="Received")||(req.body.replenishmentRequestStatus=="Partially Received"))
//   {
//           await ReplenishmentRequest.findOneAndUpdate({_id: replenishmentRequestId},{ $set: { status:req.body.replenishmentRequestStatus,secondStatus:req.body.replenishmentRequestStatus }},{new:true});
//           const fu = await FUInventory.findOne({itemId: itemId})
//           const wh = await WHInventory.findOne({itemId: itemId})
//           await FUInventory.findOneAndUpdate({itemId: itemId}, { $set: { qty: fu.qty+parseInt(receivedQty) }},{new:true})
//           const pr = await WHInventory.findOneAndUpdate({itemId: itemId}, { $set: { qty: wh.qty-parseInt(receivedQty) }},{new:true}).populate('itemId')
//           if(pr.qty<=pr.itemId.reorderLevel)
//           {
//           const j =await Item.findOne({_id:req.body.itemId})
//           var item={
//               itemId:req.body.itemId,
//               currQty:pr.qty,
//               reqQty:pr.itemId.maximumLevel-pr.qty,
//               comments:'System',
//               name:j.name,
//               description:j.description,
//               itemCode:j.itemCode
//           }
//               await PurchaseRequest.create({
//                   requestNo: uuidv4(),
//                   generated:'System',
//                   generatedBy:'System',
//                   committeeStatus: 'to_do',
//                   status:'to_do',
//                   comments:'System',
//                   reason:'System',
//                   item,
//                   vendorId:j.vendorId,
//                   requesterName:'System',
//                   department:'System',
//                   orderType:'System',
//                 });
//               const payload = JSON.stringify({ title: "Purchase Request Generated",message:"Kindly check system generated purchase request" });
//               const type = await StaffType.findOne({type:"Warehouse Incharge"})
//               const user = await User.find({staffTypeId:type._id})
//               for(var i = 0; i<user.length; i++ )
//               {
//               Subscription.find({user:user[i]._id}, (err, subscriptions) => {
//                 if (err) {
//                   console.error(`Error occurred while getting subscriptions`);
//                   res.status(500).json({
//                     error: 'Technical error occurred',
//                   });
//                 } else {
//                   let parallelSubscriptionCalls = subscriptions.map((subscription) => {
//                     return new Promise((resolve, reject) => {
//                       const pushSubscription = {
//                         endpoint: subscription.endpoint,
//                         keys: {
//                           p256dh: subscription.keys.p256dh,
//                           auth: subscription.keys.auth,
//                         },
//                       };
//                       const pushPayload = payload;
//                       webpush
//                         .sendNotification(pushSubscription, pushPayload)
//                         .then((value) => {
//                           resolve({
//                             status: true,
//                             endpoint: subscription.endpoint,
//                             data: value,
//                           });
//                         })
//                         .catch((err) => {
//                           reject({
//                             status: false,
//                             endpoint: subscription.endpoint,
//                             data: err,
//                           });
//                         });
//                     });
//                   });
//                 }
//               });
//             }
//             const pr2 = await PurchaseRequest.find()
//             .populate('item.itemId')
//             .populate('vendorId');
//             globalVariable.io.emit("get_data", pr2)
//       }
//   }
//   res.status(200).json({ success: true});
// });