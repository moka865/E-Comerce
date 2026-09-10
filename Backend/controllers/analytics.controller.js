const AnalyticsEvent = require('../models/analyticsEvent.model');
const Order = require('../models/order.model');
const { REVENUE_STATUSES } = require('../models/order.model');
const Product = require('../models/product.model');
const catchAsync = require('../utilities/catchAsync.util');

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
    const products = await Product.find({ isActive: true, isDeleted: false, stock: { $gt: 0 } })
      .sort({ isTopSale: -1, createdAt: -1 })
      .limit(10)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug');
    return res.status(200).json({ success: true, data: products });
  }

  const userEvents = await AnalyticsEvent.find({
    userId: req.user._id,
    eventType: { $in: ['product_view', 'purchase', 'add_to_cart'] }
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const viewedProductIds = [...new Set(userEvents
    .filter(e => e.productId)
    .map(e => e.productId.toString()))];

  if (viewedProductIds.length === 0) {
    const products = await Product.find({ isActive: true, isDeleted: false, stock: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('category subcategory season');
    return res.status(200).json({ success: true, data: products });
  }

  const viewedProducts = await Product.find({
    _id: { $in: viewedProductIds }
  }).lean();

  const categories = [...new Set(viewedProducts.map(p => p.category?.toString()).filter(Boolean))];
  const subcategories = [...new Set(viewedProducts.map(p => p.subcategory?.toString()).filter(Boolean))];
  const seasons = [...new Set(viewedProducts.map(p => p.season?.toString()).filter(Boolean))];

  const recommendations = await Product.find({
    _id: { $nin: viewedProductIds },
    isActive: true,
    isDeleted: false,
    stock: { $gt: 0 },
    $or: [
      { category: { $in: categories } },
      { subcategory: { $in: subcategories } },
      ...(seasons.length > 0 ? [{ season: { $in: seasons } }] : [])
    ]
  })
    .sort({ isTopSale: -1, createdAt: -1 })
    .limit(10)
    .populate('category subcategory season');

  res.status(200).json({ success: true, data: recommendations });
});

exports.getInsights = catchAsync(async (req, res) => {
  const { from, to } = req.query;
  const dateFilter = {};
  if (from || to) {
    dateFilter.createdAt = {};
    if (from) dateFilter.createdAt.$gte = new Date(from);
    if (to) {
      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);
      dateFilter.createdAt.$lte = endDate;
    }
  }

  const [viewStats, orderStats] = await Promise.all([
    AnalyticsEvent.aggregate([
      { $match: { ...dateFilter } },
      {
        $facet: {
          totalEvents: [{ $count: 'count' }],
          byType: [{ $group: { _id: '$eventType', count: { $sum: 1 } } }],
          mostViewedProducts: [
            { $match: { eventType: 'product_view', productId: { $ne: null } } },
            { $group: { _id: '$productId', views: { $sum: 1 } } },
            { $sort: { views: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'product'
              }
            },
            { $unwind: '$product' },
            {
              $project: {
                _id: '$product._id',
                name: '$product.name',
                slug: '$product.slug',
                views: 1
              }
            }
          ]
        }
      }
    ]),

    Order.aggregate([
      { $match: { ...dateFilter } },
      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: {
                  $sum: {
                    $cond: [{ $in: ['$status', REVENUE_STATUSES] }, '$totalPrice', 0]
                  }
                }
              }
            }
          ],
          statusDistribution: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          revenueOrders: [
            { $match: { status: { $in: REVENUE_STATUSES } } },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                totalSales: { $sum: '$totalPrice' },
                avgOrderValue: { $avg: '$totalPrice' }
              }
            }
          ]
        }
      }
    ])
  ]);

  res.status(200).json({
    success: true,
    data: {
      analytics: viewStats[0],
      orders: orderStats[0]
    }
  });
});

exports.getTopProducts = catchAsync(async (req, res) => {
  const { from, to } = req.query;
  const limit = parseInt(req.query.limit) || 5;
  const dateFilter = {};
  if (from || to) {
    dateFilter.createdAt = {};
    if (from) dateFilter.createdAt.$gte = new Date(from);
    if (to) {
      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);
      dateFilter.createdAt.$lte = endDate;
    }
  }

  const topProducts = await Order.aggregate([
    { $match: { status: { $in: REVENUE_STATUSES }, ...dateFilter } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        name: { $first: '$items.productName' },
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.priceAtOrder', '$items.quantity'] } }
      }
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: limit }
  ]);

  res.status(200).json({ success: true, data: topProducts });
});

exports.getTopCustomers = catchAsync(async (req, res) => {
  const { from, to } = req.query;
  const limit = parseInt(req.query.limit) || 5;
  const dateFilter = {};
  if (from || to) {
    dateFilter.createdAt = {};
    if (from) dateFilter.createdAt.$gte = new Date(from);
    if (to) {
      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);
      dateFilter.createdAt.$lte = endDate;
    }
  }

  const topCustomers = await Order.aggregate([
    { $match: { status: { $in: REVENUE_STATUSES }, ...dateFilter } },
    {
      $group: {
        _id: '$user',
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$totalPrice' },
        totalItems: { $sum: { $sum: '$items.quantity' } }
      }
    },
    { $sort: { totalSpent: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: '$user._id',
        name: '$user.name',
        email: '$user.email',
        totalOrders: 1,
        totalSpent: 1,
        totalItems: 1
      }
    }
  ]);

  res.status(200).json({ success: true, data: topCustomers });
});
