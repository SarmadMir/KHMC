const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    mrId: {
        type: mongoose.Schema.ObjectId,
        ref: 'MaterialRequest'
    },
    vendorId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Vendor'
  },
    status: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('account', accountSchema);
