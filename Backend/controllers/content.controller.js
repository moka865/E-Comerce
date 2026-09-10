const Content = require('../models/content.model');
const catchAsync = require('../utilities/catchAsync.util');
const AppError = require('../utilities/appError.util');

exports.getContent = catchAsync(async (req, res) => {
  const { key } = req.params;

  if (!['faq', 'about', 'policies', 'delivery_info'].includes(key)) {
    throw new AppError('Invalid content key', 400);
  }

  const content = await Content.findOne({ key });
  if (!content) {
    return res.status(200).json({ success: true, data: { key, title: '', body: '' } });
  }

  res.status(200).json({ success: true, data: content });
});

exports.getAllContent = catchAsync(async (req, res) => {
  const content = await Content.find().sort({ key: 1 });
  res.status(200).json({ success: true, data: content });
});

exports.updateContent = catchAsync(async (req, res) => {
  const { key } = req.params;
  const { title, body } = req.body;

  if (!['faq', 'about', 'policies', 'delivery_info'].includes(key)) {
    throw new AppError('Invalid content key', 400);
  }

  const content = await Content.findOneAndUpdate(
    { key },
    { key, title, body, updatedBy: req.user._id },
    { upsert: true, new: true, runValidators: true }
  );

  res.status(200).json({ success: true, message: 'Content updated', data: content });
});
