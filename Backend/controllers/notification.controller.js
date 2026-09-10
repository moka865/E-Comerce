const Notification = require('../models/notification.model');
const catchAsync = require('../utilities/catchAsync.util');
const AppError = require('../utilities/appError.util');

exports.getNotifications = catchAsync(async (req, res) => {
  const { page, limit, skip } = req.pagination;
  const filter = {};

  if (req.query.isRead === 'true') filter.isRead = true;
  if (req.query.isRead === 'false') filter.isRead = false;
  if (req.query.type) filter.type = req.query.type;

  const [notifications, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: notifications,
    pagination: {
      page, limit, total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1
    }
  });
});

exports.getUnreadCount = catchAsync(async (req, res) => {
  const count = await Notification.countDocuments({ isRead: false });
  res.status(200).json({ success: true, data: { count } });
});

exports.markAsRead = catchAsync(async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true }
  );
  if (!notification) throw new AppError('Notification not found', 404);

  res.status(200).json({ success: true, message: 'Marked as read', data: notification });
});

exports.markAllAsRead = catchAsync(async (req, res) => {
  await Notification.updateMany({ isRead: false }, { isRead: true });
  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});
