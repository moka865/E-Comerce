const mongoose = require('mongoose');

const deliveryFeeSchema = new mongoose.Schema({
  governorate: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  area: {
    type: String,
    trim: true
  },
  fee: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

deliveryFeeSchema.index({ governorate: 1, city: 1, area: 1 });

module.exports = mongoose.model('DeliveryFee', deliveryFeeSchema);
