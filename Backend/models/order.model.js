const mongoose = require('mongoose');

const ORDER_STATUS = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  RECEIVED: 'received',
  CANCELED: 'canceled',
  REJECTED: 'rejected'
};

const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS);

const VALID_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELED, ORDER_STATUS.REJECTED],
  [ORDER_STATUS.PREPARING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELED, ORDER_STATUS.REJECTED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.REJECTED],
  [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.RECEIVED],
  [ORDER_STATUS.RECEIVED]: [],
  [ORDER_STATUS.CANCELED]: [],
  [ORDER_STATUS.REJECTED]: []
};

const USER_CANCELABLE_STATUSES = [ORDER_STATUS.PENDING, ORDER_STATUS.PREPARING];

const REVENUE_STATUSES = [ORDER_STATUS.RECEIVED];

const REFUND_STATUS = {
  NONE: 'none',
  REQUESTED: 'requested',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

const REFUND_STATUS_VALUES = Object.values(REFUND_STATUS);

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

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
module.exports.ORDER_STATUS = ORDER_STATUS;
module.exports.ORDER_STATUS_VALUES = ORDER_STATUS_VALUES;
module.exports.VALID_TRANSITIONS = VALID_TRANSITIONS;
module.exports.USER_CANCELABLE_STATUSES = USER_CANCELABLE_STATUSES;
module.exports.REVENUE_STATUSES = REVENUE_STATUSES;
module.exports.REFUND_STATUS = REFUND_STATUS;
module.exports.REFUND_STATUS_VALUES = REFUND_STATUS_VALUES;
