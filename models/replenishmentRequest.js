const mongoose = require('mongoose');

const replenishmentRequestSchema = new mongoose.Schema({
    requestNo: {
        type: String
    },
    generatedBy: {
        type: String
    },
    dateGenerated: {
        type: Date,
        default: Date.now
    },
    fuId: {
        type: mongoose.Schema.ObjectId,
        ref: 'functionalUnit'
    },
    comments:{
        type: String
    },
    itemId:{
        type: mongoose.Schema.ObjectId,
        ref: 'Item'
    },
    currentQty:{
        type:Number
    },
    requestedQty:{
        type:Number
    },
    recieptUnit:{
        type:String
    },
    issueUnit:{
        type:String
    },
    fuItemCost:{
        type:Number
    },
    description:{
        type:String
    },
    status: {
        type: String
    },
    commentNote:{
        type:String
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

module.exports = mongoose.model('ReplenishmentRequest', replenishmentRequestSchema);
