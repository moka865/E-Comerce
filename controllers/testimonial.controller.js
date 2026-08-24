const Testimonial = require('../models/testimonial.model');
const catchAsync = require('../utilities/catchAsync.util');
const AppError = require('../utilities/appError.util');
const notificationService = require('../services/notification.service');

exports.submitTestimonial = catchAsync(async (req, res) => {
  const { rating, message } = req.body;

  const testimonial = await Testimonial.create({
    user: req.user._id,
    clientName: req.user.name,
    rating,
    message
  });

  await notificationService.createNotification({
    type: 'new_testimonial',
    title: 'New Testimonial',
    message: `New testimonial from ${req.user.name} (Rating: ${rating}/5)`,
    referenceId: testimonial._id,
    referenceModel: 'Testimonial'
  });

  res.status(201).json({ success: true, message: 'Testimonial submitted for review', data: testimonial });
});

exports.getApprovedTestimonials = catchAsync(async (req, res) => {
  const { page, limit, skip } = req.pagination;

  const [testimonials, total] = await Promise.all([
    Testimonial.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Testimonial.countDocuments({ status: 'approved' })
  ]);

  res.status(200).json({
    success: true,
    data: testimonials,
    pagination: {
      page, limit, total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1
    }
  });
});

// Admin
exports.getPendingTestimonials = catchAsync(async (req, res) => {
  const testimonials = await Testimonial.find({ status: 'pending' })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: testimonials });
});

exports.getAllTestimonials = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const testimonials = await Testimonial.find(filter)
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: testimonials });
});

exports.approveTestimonial = catchAsync(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) throw new AppError('Testimonial not found', 404);

  if (testimonial.status !== 'pending') {
    throw new AppError('Testimonial has already been reviewed', 400);
  }

  testimonial.status = 'approved';
  testimonial.reviewedBy = req.user._id;
  testimonial.reviewedAt = new Date();
  await testimonial.save();

  res.status(200).json({ success: true, message: 'Testimonial approved', data: testimonial });
});

exports.declineTestimonial = catchAsync(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) throw new AppError('Testimonial not found', 404);

  if (testimonial.status !== 'pending') {
    throw new AppError('Testimonial has already been reviewed', 400);
  }

  testimonial.status = 'declined';
  testimonial.reviewedBy = req.user._id;
  testimonial.reviewedAt = new Date();
  await testimonial.save();

  res.status(200).json({ success: true, message: 'Testimonial declined', data: testimonial });
});
