const Subcategory = require('../models/subcategory.model');
const Category = require('../models/category.model');
const catchAsync = require('../utilities/catchAsync.util');
const AppError = require('../utilities/appError.util');
const slugify = require('slugify');

exports.getActiveSubcategories = catchAsync(async (req, res) => {
  const filter = { isActive: true, isDeleted: false };
  if (req.query.category) filter.category = req.query.category;

  const subcategories = await Subcategory.find(filter)
    .populate('category', 'name slug')
    .sort({ name: 1 });

  res.status(200).json({ success: true, data: subcategories });
});

exports.getByCategory = catchAsync(async (req, res) => {
  const subcategories = await Subcategory.find({
    category: req.params.categoryId,
    isActive: true,
    isDeleted: false
  }).sort({ name: 1 });

  res.status(200).json({ success: true, data: subcategories });
});

exports.getAllSubcategories = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.isDeleted !== 'all') filter.isDeleted = req.query.isDeleted === 'true';
  if (req.query.category) filter.category = req.query.category;

  const subcategories = await Subcategory.find(filter)
    .populate('category', 'name slug')
    .sort({ name: 1 });

  res.status(200).json({ success: true, data: subcategories });
});

exports.createSubcategory = catchAsync(async (req, res) => {
  const { name, category } = req.body;

  const cat = await Category.findOne({ _id: category, isDeleted: false });
  if (!cat) throw new AppError('Category not found', 404);

  const slug = slugify(name, { lower: true, strict: true });
  const existing = await Subcategory.findOne({ slug });
  if (existing) throw new AppError('Subcategory with this name already exists', 409);

  const subcategory = await Subcategory.create({ name, slug, category });
  res.status(201).json({ success: true, message: 'Subcategory created', data: subcategory });
});

exports.updateSubcategory = catchAsync(async (req, res) => {
  const subcategory = await Subcategory.findById(req.params.id);
  if (!subcategory || subcategory.isDeleted) throw new AppError('Subcategory not found', 404);

  const { name, category } = req.body;

  if (category) {
    const cat = await Category.findOne({ _id: category, isDeleted: false });
    if (!cat) throw new AppError('Category not found', 404);
    subcategory.category = category;
  }

  if (name) {
    subcategory.name = name;
    subcategory.slug = slugify(name, { lower: true, strict: true });

    const existing = await Subcategory.findOne({ slug: subcategory.slug, _id: { $ne: subcategory._id } });
    if (existing) throw new AppError('Subcategory with this name already exists', 409);
  }

  await subcategory.save();
  res.status(200).json({ success: true, message: 'Subcategory updated', data: subcategory });
});

exports.toggleActive = catchAsync(async (req, res) => {
  const subcategory = await Subcategory.findById(req.params.id);
  if (!subcategory || subcategory.isDeleted) throw new AppError('Subcategory not found', 404);

  subcategory.isActive = !subcategory.isActive;
  await subcategory.save();

  res.status(200).json({
    success: true,
    message: `Subcategory ${subcategory.isActive ? 'activated' : 'deactivated'}`,
    data: subcategory
  });
});

exports.softDelete = catchAsync(async (req, res) => {
  const subcategory = await Subcategory.findById(req.params.id);
  if (!subcategory) throw new AppError('Subcategory not found', 404);

  subcategory.isDeleted = true;
  subcategory.isActive = false;
  await subcategory.save();

  res.status(200).json({ success: true, message: 'Subcategory deleted' });
});
