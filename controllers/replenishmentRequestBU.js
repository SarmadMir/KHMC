/* eslint-disable prefer-const */
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const webpush = require("web-push");
const { v4: uuidv4 } = require('uuid');
const ReplenishmentRequestBU = require('../models/replenishmentRequestBU');
const FunctionalUnit = require('../models/functionalUnit');
const FUInventory = require('../models/fuInventory');
const BUInventory = require('../models/buInventory');
const WHInventory = require('../models/warehouseInventory');
const ReplenishmentRequest = require('../models/replenishmentRequest');
const PurchaseRequest = require('../models/purchaseRequest');
const StaffType = require('../models/staffType');
const User = require('../models/user')
const Item = require('../models/item');
const Subscription = require('../models/subscriber')
const privateVapidKey = "s92YuYXxjJ38VQhRSuayTb9yjN_KnVjgKfbpsHOLpjc";
const publicVapidKey = "BOHtR0qVVMIA-IJEru-PbIKodcux05OzVVIJoIBKQu3Sp1mjvGkjaT-1PIzkEwAiAk6OuSCZfNGsgYkJJjOyV7k"
webpush.setVapidDetails(
  "mailto:hannanbutt1995@gmail.com",
  publicVapidKey,
  privateVapidKey
);
exports.getReplenishmentRequestsBU = asyncHandler(async (req, res) => {
    const replenishmentRequest = await ReplenishmentRequestBU.find().populate('buId').populate('fuId').populate('itemId');    
    res.status(200).json({ success: true, data: replenishmentRequest });
});
exports.getReplenishmentRequestsByIdBU = asyncHandler(async (req, res) => {
    const replenishmentRequest = await ReplenishmentRequestBU.findOne({_id:req.body._id}).populate('buId').populate('fuId').populate('itemId');
    res.status(200).json({ success: true, data: replenishmentRequest });
});
exports.addReplenishmentRequestBU = asyncHandler(async (req, res) => {
    const { generated,generatedBy,dateGenerated,buId,comments,itemId,currentQty,requestedQty,
           description,status,patientReferenceNo,secondStatus, requesterName, department, orderType, reason} = req.body;
           const func = await FunctionalUnit.findOne({_id:req.body.fuId})
            // const bu = await FunctionalUnit.findOne({buId:req.body.buId})//wrong logic change when more data
            const fui = await FUInventory.findOne({itemId: req.body.itemId,fuId:func._id}).populate('itemId')
            if(fui.qty<parseInt(req.body.requestedQty))
            {
            req.body.secondStatus = "Cannot be fulfilled"
            const wh = await WHInventory.findOne({itemId:req.body.itemId}).populate('itemId')
            const item = await Item.findOne({_id:req.body.itemId})
            var st;
            var st2;    
            if(wh.qty<(parseInt(req.body.requestedQty)-fui.qty))
            {
            st = "pending"
            st2 = "Cannot be fulfilled"
            var item2={
              itemId:req.body.itemId,
              currQty:wh.qty,
              reqQty:req.body.requestedQty-wh.qty,
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
                for(var k = 0; k<user1.length; k++ )
                {
                Subscription.find({user:user1[k]._id}, (err, subscriptions) => {
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
            }
            else
            {
                req.body.secondStatus = "Can be fulfilled"
            }
    const test = await ReplenishmentRequestBU.create({
        requestNo: uuidv4(),
        generated,
        generatedBy,
        dateGenerated,        
        fuId:func._id,
        buId,
        comments,
        itemId,
        currentQty,
        requestedQty,
        description,
        status,
        requesterName,
        orderType,
        department,
        reason,
        patientReferenceNo,
        // secondStatus,
        secondStatus:req.body.secondStatus,
    });
    if(test.secondStatus == "Cannot be fulfilled")
    {
      const item2 = await Item.findOne({_id:req.body.itemId})
      await ReplenishmentRequest.create({
        requestNo: uuidv4(),
        generated:'System',
        generatedBy:'System',
        reason:'reactivated_items',
        fuId:req.body.fuId,
        itemId:req.body.itemId,
        comments:'System generated Replenishment Request',
        currentQty:fui.qty,
        requestedQty:fui.itemId.maximumLevel-fui.qty,
        description:item2.description,
        status: st,
        secondStatus:st2,
        requesterName:'System',
        orderType:'',
        to:'Warehouse',
        from:'FU',
        recieptUnit:item2.receiptUnit,
        issueUnit:item2.issueUnit,
        fuItemCost:0,
        department:'',
        rrB:test._id
      });
        const payload = JSON.stringify({ title: "Replenishment Request Generated",message:"Kindly check system generated replenishment request" });
      const type = await StaffType.findOne({type:"FU Incharge"})
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
    const rr5 = await ReplenishmentRequest.find().populate('fuId').populate('itemId').populate('approvedBy')
    globalVariable.io.emit("get_data", rr5)
    }
    res.status(200).json({ success: true });
});

exports.deleteReplenishmentRequestBU = asyncHandler(async (req, res, next) => {
    const { _id } = req.params;
    const replenishmentRequest = await ReplenishmentRequestBU.findById(_id);
    if(!replenishmentRequest) {
        return next(
        new ErrorResponse(`Replenishment Request not found with id of ${_id}`, 404)
        );
    }

    await ReplenishmentRequest.deleteOne({_id: _id});

    res.status(200).json({ success: true, data: {} });
});

exports.updateReplenishmentRequestBU = asyncHandler(async (req, res, next) => {
    const { _id } = req.body;
    let replenishmentRequest = await ReplenishmentRequestBU.findById(_id);
    if(!replenishmentRequest) {
        return next(
        new ErrorResponse(`Replenishment Request not found with id of ${_id}`, 404)
        );
    }
    if(req.body.status=="complete")
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
        if(wh.qty<(rr.itemId.maximumLevel-rr.qty))
        {
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
                rrB:req.body._id
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
    replenishmentRequest = await ReplenishmentRequestBU.findOneAndUpdate({_id: _id}, req.body,{new:true});
    res.status(200).json({ success: true, data: replenishmentRequest });
});
  exports.getCurrentItemQuantityBU = asyncHandler(async (req, res) => {
    const buInventory = await BUInventory.findOne(
      { itemId: req.body.itemId,buId:req.body.buId },
      { qty: 1 }
    );
    res.status(200).json({ success: true, data: buInventory });
  });