const Category = require('../models/category.model');
const catchAsync = require('../utilities/catchAsync.util');
const AppError = require('../utilities/appError.util');
const slugify = require('slugify');

exports.getActiveCategories = catchAsync(async (req, res) => {
  const categories = await Category.find({ isActive: true, isDeleted: false }).sort({ name: 1 });
  res.status(200).json({ success: true, data: categories });
});

exports.getAllCategories = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.isDeleted === 'true') filter.isDeleted = true;
  else if (req.query.isDeleted !== 'all') filter.isDeleted = false;

  const categories = await Category.find(filter).sort({ name: 1 });
  res.status(200).json({ success: true, data: categories });
});

exports.createCategory = catchAsync(async (req, res) => {
  const { name } = req.body;
  const slug = slugify(name, { lower: true, strict: true });

  const existing = await Category.findOne({ slug });
  if (existing) throw new AppError('Category with this name already exists', 409);

  const category = await Category.create({ name, slug });
  res.status(201).json({ success: true, message: 'Category created', data: category });
});

exports.updateCategory = catchAsync(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category || category.isDeleted) throw new AppError('Category not found', 404);

  const { name } = req.body;
  if (name) {
    category.name = name;
    category.slug = slugify(name, { lower: true, strict: true });

    const existing = await Category.findOne({ slug: category.slug, _id: { $ne: category._id } });
    if (existing) throw new AppError('Category with this name already exists', 409);
  }

  await category.save();
  res.status(200).json({ success: true, message: 'Category updated', data: category });
});

exports.toggleActive = catchAsync(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category || category.isDeleted) throw new AppError('Category not found', 404);

  category.isActive = !category.isActive;
  await category.save();

  res.status(200).json({
    success: true,
    message: `Category ${category.isActive ? 'activated' : 'deactivated'}`,
    data: category
  });
});

exports.softDelete = catchAsync(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError('Category not found', 404);

  category.isDeleted = true;
  category.isActive = false;
  await category.save();

  res.status(200).json({ success: true, message: 'Category deleted' });
});

exports.restoreCategory = catchAsync(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError('Category not found', 404);

  category.isDeleted = false;
  await category.save();

  res.status(200).json({ success: true, message: 'Category restored', data: category });
});
