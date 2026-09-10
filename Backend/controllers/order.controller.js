const Order = require('../models/order.model');
const { ORDER_STATUS, VALID_TRANSITIONS, USER_CANCELABLE_STATUSES, REFUND_STATUS } = require('../models/order.model');
const Notification = require('../models/notification.model');
const catchAsync = require('../utilities/catchAsync.util');
const AppError = require('../utilities/appError.util');
const orderService = require('../services/order.service');

exports.createOrder = catchAsync(async (req, res) => {
  const { addressId } = req.body;
  const order = await orderService.createOrder(req.user, addressId);

  res.status(201).json({ success: true, message: 'Order placed successfully', data: order });
});

exports.getUserOrders = catchAsync(async (req, res) => {
  const { page, limit, skip, sortBy, order: sortOrder } = req.pagination;
  const filter = { user: req.user._id };

  if (req.query.status) filter.status = req.query.status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate('items.product', 'name slug image'),
    Order.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: orders,
    pagination: {
      page, limit, total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1
    }
  });
});

exports.getOrderById = catchAsync(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
    .populate('items.product', 'name slug image')
    .populate('statusHistory.changedBy', 'name');

  if (!order) throw new AppError('Order not found', 404);

  res.status(200).json({ success: true, data: order });
});

exports.cancelOrder = catchAsync(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw new AppError('Order not found', 404);

  if (!USER_CANCELABLE_STATUSES.includes(order.status)) {
    throw new AppError(`Cannot cancel order in "${order.status}" status`, 400);
  }

  const Product = require('../models/product.model');
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }

  order.status = ORDER_STATUS.CANCELED;
  order.statusHistory.push({
    status: ORDER_STATUS.CANCELED,
    changedBy: req.user._id,
    changedAt: new Date(),
    note: 'Canceled by user'
  });
  await order.save();

  res.status(200).json({ success: true, message: 'Order canceled', data: order });
});

exports.requestRefund = catchAsync(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw new AppError('Order not found', 404);

  if (order.status !== ORDER_STATUS.RECEIVED) {
    throw new AppError('Refund can only be requested for received orders', 400);
  }

  if (order.refundStatus !== REFUND_STATUS.NONE) {
    throw new AppError('Refund has already been requested', 400);
  }

  const receivedEntry = order.statusHistory.find(h => h.status === ORDER_STATUS.RECEIVED);
  const receivedDate = receivedEntry ? receivedEntry.changedAt : order.updatedAt;
  const refundWindowDays = parseInt(process.env.REFUND_WINDOW_DAYS) || 14;
  const daysSinceReceived = (Date.now() - new Date(receivedDate).getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceReceived > refundWindowDays) {
    throw new AppError(`Refund window of ${refundWindowDays} days has expired`, 400);
  }

  order.refundStatus = REFUND_STATUS.REQUESTED;
  order.refundReason = req.body.reason;
  order.refundRequestedAt = new Date();
  await order.save();

  await Notification.create({
    type: 'refund_request',
    title: 'Refund Request',
    message: `Refund requested for order #${order._id} by user ${req.user.name}`,
    referenceId: order._id,
    referenceModel: 'Order'
  });

  res.status(200).json({ success: true, message: 'Refund requested', data: order });
});

exports.getAllOrders = catchAsync(async (req, res) => {
  const { page, limit, skip, sortBy, order: sortOrder } = req.pagination;
  const filter = {};

  if (req.query.status) filter.status = req.query.status;
  if (req.query.user) filter.user = req.query.user;
  if (req.query.refundStatus) filter.refundStatus = req.query.refundStatus;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email mobilePhone')
      .populate('items.product', 'name slug image')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: orders,
    pagination: {
      page, limit, total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1
    }
  });
});

exports.updateOrderStatus = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404);

  const { status, note } = req.body;
  const validNextStatuses = VALID_TRANSITIONS[order.status];

  if (!validNextStatuses || !validNextStatuses.includes(status)) {
    throw new AppError(`Cannot transition from "${order.status}" to "${status}"`, 400);
  }

  order.status = status;
  order.statusHistory.push({
    status,
    changedBy: req.user._id,
    changedAt: new Date(),
    note
  });

  if (status === ORDER_STATUS.REJECTED || status === ORDER_STATUS.CANCELED) {
    const Product = require('../models/product.model');
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
  }

  await order.save();

  res.status(200).json({ success: true, message: 'Order status updated', data: order });
});

exports.reviewRefund = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404);

  if (order.refundStatus !== REFUND_STATUS.REQUESTED) {
    throw new AppError('No pending refund request', 400);
  }

  const { decision } = req.body;
  if (!['approved', 'rejected'].includes(decision)) {
    throw new AppError('Decision must be approved or rejected', 400);
  }

  order.refundStatus = decision;
  order.refundReviewedBy = req.user._id;
  order.refundReviewedAt = new Date();

  if (decision === 'approved') {
    const Product = require('../models/product.model');
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
  }

  await order.save();

  res.status(200).json({ success: true, message: `Refund ${decision}`, data: order });
});
