const Order = require('../models/order.model');
const catchAsync = require('../utilities/catchAsync.util');
const { REVENUE_STATUSES } = require('../constants/orderStatus');

exports.getSalesReport = catchAsync(async (req, res) => {
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

  const report = await Order.aggregate([
    { $match: { ...dateFilter } },
    {
      $facet: {
        overallStats: [
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalRevenue: {
                $sum: {
                  $cond: [{ $in: ['$status', REVENUE_STATUSES] }, '$totalPrice', 0]
                }
              },
              totalCompletedOrders: {
                $sum: {
                  $cond: [{ $in: ['$status', REVENUE_STATUSES] }, 1, 0]
                }
              }
            }
          },
          {
            $addFields: {
              avgOrderValue: {
                $cond: [
                  { $gt: ['$totalCompletedOrders', 0] },
                  { $divide: ['$totalRevenue', '$totalCompletedOrders'] },
                  0
                ]
              }
            }
          }
        ],
        topProducts: [
          { $match: { status: { $in: REVENUE_STATUSES } } },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.product',
              name: { $first: '$items.productName' },
              totalQuantity: { $sum: '$items.quantity' },
              revenue: { $sum: { $multiply: ['$items.priceAtOrder', '$items.quantity'] } }
            }
          },
          { $sort: { revenue: -1 } },
          { $limit: 5 }
        ],
        topCustomers: [
          { $match: { status: { $in: REVENUE_STATUSES } } },
          {
            $group: {
              _id: '$user',
              totalSpent: { $sum: '$totalPrice' },
              totalOrders: { $sum: 1 }
            }
          },
          { $sort: { totalSpent: -1 } },
          { $limit: 5 },
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
              totalSpent: 1,
              totalOrders: 1
            }
          }
        ],
        statusDistribution: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ],
        monthlySales: [
          { $match: { status: { $in: REVENUE_STATUSES } } },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              totalRevenue: { $sum: '$totalPrice' },
              totalOrders: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]
      }
    }
  ]);

  res.status(200).json({
    success: true,
    message: `Sales report${from ? ` from ${from}` : ''}${to ? ` to ${to}` : ''}`,
    data: report[0]
  });
});