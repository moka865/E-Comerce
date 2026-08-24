const AnalyticsEvent = require('../models/analyticsEvent.model');
const Order = require('../models/order.model');
const { REVENUE_STATUSES } = require('../constants/orderStatus');

const buildDateFilter = (from, to, field = 'createdAt') => {
  const filter = {};
  if (from || to) {
    filter[field] = {};
    if (from) filter[field].$gte = new Date(from);
    if (to) {
      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);
      filter[field].$lte = endDate;
    }
  }
  return filter;
};

exports.getInsights = async (from, to) => {
  const dateFilter = buildDateFilter(from, to);

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

  return {
    analytics: viewStats[0],
    orders: orderStats[0]
  };
};

exports.getTopProducts = async (from, to, limit = 5) => {
  const dateFilter = buildDateFilter(from, to);

  return await Order.aggregate([
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
};

exports.getTopCustomers = async (from, to, limit = 5) => {
  const dateFilter = buildDateFilter(from, to);

  return await Order.aggregate([
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
};
