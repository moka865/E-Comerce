const AnalyticsEvent = require('../models/analyticsEvent.model');
const Order = require('../models/order.model');
const Product = require('../models/product.model');

exports.getRecommendations = async (userId, limit = 10) => {
  const userEvents = await AnalyticsEvent.find({
    userId,
    eventType: { $in: ['product_view', 'purchase', 'add_to_cart'] }
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const viewedProductIds = [...new Set(userEvents
    .filter(e => e.productId)
    .map(e => e.productId.toString()))];

  if (viewedProductIds.length === 0) {
    return await Product.find({ isActive: true, isDeleted: false, stock: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('category subcategory season');
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
    .limit(limit)
    .populate('category subcategory season');

  return recommendations;
};
