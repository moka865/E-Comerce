const mongoose = require('mongoose');
const { ORDER_STATUS, ORDER_STATUS_VALUES, REFUND_STATUS, REFUND_STATUS_VALUES } = require('../constants/orderStatus');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  priceAtOrder: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ORDER_STATUS_VALUES,
    required: true
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  changedAt: {
    type: Date,
    default: Date.now
  },
  note: String
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: (v) => v.length > 0,
      message: 'Order must have at least one item'
    }
  },
  deliveryAddress: {
    address: { type: String, required: true },
    governorate: { type: String, required: true },
    city: { type: String, required: true },
    area: String,
    buildingDetails: String
  },
  deliveryFee: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ORDER_STATUS_VALUES,
    default: ORDER_STATUS.PENDING
  },
  statusHistory: [statusHistorySchema],
  paymentMethod: {
    type: String,
    enum: ['cash_on_delivery'],
    default: 'cash_on_delivery'
  },
  refundStatus: {
    type: String,
    enum: REFUND_STATUS_VALUES,
    default: REFUND_STATUS.NONE
  },
  refundReason: String,
  refundRequestedAt: Date,
  refundReviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  refundReviewedAt: Date
}, {
  timestamps: true
});

orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
