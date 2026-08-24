const AnalyticsEvent = require('../models/analyticsEvent.model');
const catchAsync = require('../utilities/catchAsync.util');
const analyticsService = require('../services/analytics.service');
const recommendationService = require('../services/recommendation.service');

exports.trackEvent = catchAsync(async (req, res) => {
  const { eventType, productId, categoryId, subcategoryId, sessionId, metadata } = req.body;

  await AnalyticsEvent.create({
    userId: req.user ? req.user._id : undefined,
    sessionId,
    eventType,
    productId,
    categoryId,
    subcategoryId,
    metadata
  });

  res.status(201).json({ success: true, message: 'Event tracked' });
});

exports.getRecommendations = catchAsync(async (req, res) => {
  if (!req.user) {
    const Product = require('../models/product.model');
    const products = await Product.find({ isActive: true, isDeleted: false, stock: { $gt: 0 } })
      .sort({ isTopSale: -1, createdAt: -1 })
      .limit(10)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug');
    return res.status(200).json({ success: true, data: products });
  }

  const recommendations = await recommendationService.getRecommendations(req.user._id);
  res.status(200).json({ success: true, data: recommendations });
});

// Admin
exports.getInsights = catchAsync(async (req, res) => {
  const { from, to } = req.query;
  const insights = await analyticsService.getInsights(from, to);
  res.status(200).json({ success: true, data: insights });
});

exports.getTopProducts = catchAsync(async (req, res) => {
  const { from, to } = req.query;
  const limit = parseInt(req.query.limit) || 5;
  const topProducts = await analyticsService.getTopProducts(from, to, limit);
  res.status(200).json({ success: true, data: topProducts });
});

exports.getTopCustomers = catchAsync(async (req, res) => {
  const { from, to } = req.query;
  const limit = parseInt(req.query.limit) || 5;
  const topCustomers = await analyticsService.getTopCustomers(from, to, limit);
  res.status(200).json({ success: true, data: topCustomers });
});
