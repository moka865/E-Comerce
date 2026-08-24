const mongoose = require('mongoose');
const { EVENT_TYPE_VALUES } = require('../constants/eventTypes');

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

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
