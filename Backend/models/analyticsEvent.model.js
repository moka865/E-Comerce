const mongoose = require('mongoose');

const EVENT_TYPES = {
  PRODUCT_VIEW: 'product_view',
  PRODUCT_SEARCH: 'product_search',
  CATEGORY_VIEW: 'category_view',
  SUBCATEGORY_VIEW: 'subcategory_view',
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  PURCHASE: 'purchase'
};

const EVENT_TYPE_VALUES = Object.values(EVENT_TYPES);

const analyticsEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: {
    type: String,
    trim: true
  },
  eventType: {
    type: String,
    enum: EVENT_TYPE_VALUES,
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  subcategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

analyticsEventSchema.index({ userId: 1 });
analyticsEventSchema.index({ eventType: 1 });
analyticsEventSchema.index({ createdAt: -1 });
analyticsEventSchema.index({ productId: 1 });

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);

module.exports = AnalyticsEvent;
module.exports.EVENT_TYPES = EVENT_TYPES;
module.exports.EVENT_TYPE_VALUES = EVENT_TYPE_VALUES;
