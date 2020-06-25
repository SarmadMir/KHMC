const mongoose = require('mongoose');
const internalReturnRequestSchema = new mongoose.Schema({
    returnRequestNo: {
        type: String
    },
    generatedBy: {
        type: String
    },
    dateGenerated: {
        type: Date,
        default: Date.now
    },
    expiryDate:{
        type:Date
    },
    to:{
        type:String
    },
    from:{
        type:String
    },
    currentQty:{
        type:Number
    },
    itemId:{
        type: mongoose.Schema.ObjectId,
        ref: 'Item'
    },
    description:{
        type:String
    },
    fuId: {
        type: mongoose.Schema.ObjectId,
        ref: 'functionalUnit'
    },
    reason:{
        type:String
    },
    reasonDetail:{
        type:String
    },
    buId:{
        type: mongoose.Schema.ObjectId,
        ref: 'businessUnit'
    },
    damageReport:{
        causedBy:{
            type:String
        },
        totalDamageCost:{
            type:Number
        },
        date:{
            type:Date
        }
    },
    status: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('InternalReturnRequest', internalReturnRequestSchema);
