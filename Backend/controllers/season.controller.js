const Season = require('../models/season.model');
const catchAsync = require('../utilities/catchAsync.util');
const AppError = require('../utilities/appError.util');
const slugify = require('slugify');

exports.getActiveSeasons = catchAsync(async (req, res) => {
  const seasons = await Season.find({ isActive: true, isDeleted: false }).sort({ name: 1 });
  res.status(200).json({ success: true, data: seasons });
});

exports.getAllSeasons = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.isDeleted !== 'all') filter.isDeleted = req.query.isDeleted === 'true';

  const seasons = await Season.find(filter).sort({ name: 1 });
  res.status(200).json({ success: true, data: seasons });
});

exports.createSeason = catchAsync(async (req, res) => {
  const { name } = req.body;
  const slug = slugify(name, { lower: true, strict: true });

  const existing = await Season.findOne({ slug });
  if (existing) throw new AppError('Season with this name already exists', 409);

  const season = await Season.create({ name, slug });
  res.status(201).json({ success: true, message: 'Season created', data: season });
});

exports.updateSeason = catchAsync(async (req, res) => {
  const season = await Season.findById(req.params.id);
  if (!season || season.isDeleted) throw new AppError('Season not found', 404);

  const { name } = req.body;
  if (name) {
    season.name = name;
    season.slug = slugify(name, { lower: true, strict: true });

    const existing = await Season.findOne({ slug: season.slug, _id: { $ne: season._id } });
    if (existing) throw new AppError('Season with this name already exists', 409);
  }

  await season.save();
  res.status(200).json({ success: true, message: 'Season updated', data: season });
});

exports.toggleActive = catchAsync(async (req, res) => {
  const season = await Season.findById(req.params.id);
  if (!season || season.isDeleted) throw new AppError('Season not found', 404);

  season.isActive = !season.isActive;
  await season.save();

  res.status(200).json({
    success: true,
    message: `Season ${season.isActive ? 'activated' : 'deactivated'}`,
    data: season
  });
});

exports.softDelete = catchAsync(async (req, res) => {
  const season = await Season.findById(req.params.id);
  if (!season) throw new AppError('Season not found', 404);

  season.isDeleted = true;
  season.isActive = false;
  await season.save();

  res.status(200).json({ success: true, message: 'Season deleted' });
});
