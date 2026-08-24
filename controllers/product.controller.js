const Product = require('../models/product.model');
const Category = require('../models/category.model');
const Subcategory = require('../models/subcategory.model');
const catchAsync = require('../utilities/catchAsync.util');
const AppError = require('../utilities/appError.util');
const slugify = require('slugify');

const publicFilter = { isActive: true, isDeleted: false };

// Public
exports.getAllProducts = catchAsync(async (req, res) => {
  const { page, limit, skip, sortBy, order } = req.pagination;
  const filter = { ...publicFilter };

  if (req.query.category) filter.category = req.query.category;
  if (req.query.subcategory) filter.subcategory = req.query.subcategory;
  if (req.query.season) filter.season = req.query.season;
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
  }
  if (req.query.availability === 'in_stock') filter.stock = { $gt: 0 };
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('season', 'name slug')
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: products,
    pagination: {
      page, limit, total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1
    }
  });
});

exports.getProductBySlug = catchAsync(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, ...publicFilter })
    .populate('category', 'name slug')
    .populate('subcategory', 'name slug')
    .populate('season', 'name slug');

  if (!product) throw new AppError('Product not found', 404);

  res.status(200).json({ success: true, data: product });
});

exports.getNewArrivals = catchAsync(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const products = await Product.find({ ...publicFilter, isNewArrival: true })
    .populate('category', 'name slug')
    .populate('subcategory', 'name slug')
    .sort({ createdAt: -1 })
    .limit(limit);

  res.status(200).json({ success: true, data: products });
});

exports.getTopSales = catchAsync(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const products = await Product.find({ ...publicFilter, isTopSale: true })
    .populate('category', 'name slug')
    .populate('subcategory', 'name slug')
    .limit(limit);

  res.status(200).json({ success: true, data: products });
});

// Admin
exports.createProduct = catchAsync(async (req, res) => {
  const { name, description, price, category, subcategory, season, stock } = req.body;

  const cat = await Category.findOne({ _id: category, isDeleted: false });
  if (!cat) throw new AppError('Category not found', 404);

  const subcat = await Subcategory.findOne({ _id: subcategory, category, isDeleted: false });
  if (!subcat) throw new AppError('Subcategory not found or does not belong to the category', 404);

  const slug = slugify(name, { lower: true, strict: true });
  const existingSlug = await Product.findOne({ slug });
  const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

  const image = req.file ? req.file.filename : undefined;

  const product = await Product.create({
    name, description, price, image, category, subcategory, season, stock, slug: finalSlug
  });

  res.status(201).json({ success: true, message: 'Product created', data: product });
});

exports.updateProduct = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || product.isDeleted) throw new AppError('Product not found', 404);

  const { name, description, price, category, subcategory, season, stock } = req.body;

  if (category && subcategory) {
    const subcat = await Subcategory.findOne({ _id: subcategory, category, isDeleted: false });
    if (!subcat) throw new AppError('Invalid category/subcategory relationship', 400);
  }

  if (name && name !== product.name) {
    const slug = slugify(name, { lower: true, strict: true });
    const existingSlug = await Product.findOne({ slug, _id: { $ne: product._id } });
    product.slug = existingSlug ? `${slug}-${Date.now()}` : slug;
    product.name = name;
  }

  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = price;
  if (category) product.category = category;
  if (subcategory) product.subcategory = subcategory;
  if (season !== undefined) product.season = season;
  if (stock !== undefined) product.stock = stock;
  if (req.file) product.image = req.file.filename;

  await product.save();

  res.status(200).json({ success: true, message: 'Product updated', data: product });
});

exports.toggleActive = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || product.isDeleted) throw new AppError('Product not found', 404);

  product.isActive = !product.isActive;
  await product.save();

  res.status(200).json({
    success: true,
    message: `Product ${product.isActive ? 'activated' : 'deactivated'}`,
    data: product
  });
});

exports.softDelete = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404);

  product.isDeleted = true;
  product.isActive = false;
  await product.save();

  res.status(200).json({ success: true, message: 'Product deleted' });
});

exports.restoreProduct = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404);

  product.isDeleted = false;
  await product.save();

  res.status(200).json({ success: true, message: 'Product restored', data: product });
});

exports.setTopSale = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || product.isDeleted) throw new AppError('Product not found', 404);

  product.isTopSale = !product.isTopSale;
  await product.save();

  res.status(200).json({ success: true, message: `Top sale ${product.isTopSale ? 'enabled' : 'disabled'}`, data: product });
});

exports.setNewArrival = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || product.isDeleted) throw new AppError('Product not found', 404);

  product.isNewArrival = !product.isNewArrival;
  await product.save();

  res.status(200).json({ success: true, message: `New arrival ${product.isNewArrival ? 'enabled' : 'disabled'}`, data: product });
});

exports.adminGetAllProducts = catchAsync(async (req, res) => {
  const { page, limit, skip, sortBy, order } = req.pagination;
  const filter = {};

  if (req.query.isDeleted === 'true') filter.isDeleted = true;
  else if (req.query.isDeleted === 'false') filter.isDeleted = false;
  if (req.query.isActive === 'true') filter.isActive = true;
  else if (req.query.isActive === 'false') filter.isActive = false;
  if (req.query.category) filter.category = req.query.category;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('season', 'name slug')
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: products,
    pagination: {
      page, limit, total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1
    }
  });
});