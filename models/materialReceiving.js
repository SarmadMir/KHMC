const mongoose = require('mongoose');

const MaterialReceivingSchema = new mongoose.Schema({
    itemCode: {
        type: String,
    },
    itemName: {
        type: String,
    },
    prId: {
        type: mongoose.Schema.ObjectId,
        ref: 'PurchaseRequest'
    },
    poId: {
        type: mongoose.Schema.ObjectId,
        ref: 'PurchaseOrder'
    },
    vendorId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Vendor',
        required: [true, 'Please select Vendor']
    },
    status: {
        type: String,
        required: [true, 'Please select Status']
    },
    poSentDate: {
        type: Date
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

module.exports = mongoose.model('MaterialReceiving', MaterialReceivingSchema);
