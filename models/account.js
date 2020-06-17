const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    mrId: {
        type: mongoose.Schema.ObjectId,
        ref: 'MaterialReceiving'
    },
    vendorId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Vendor'
  },
    status: {
      type: String,
    },
    comments:{
      type:String
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Account', accountSchema);
