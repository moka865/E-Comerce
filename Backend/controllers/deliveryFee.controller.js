const DeliveryFee = require('../models/deliveryFee.model');
const catchAsync = require('../utilities/catchAsync.util');
const AppError = require('../utilities/appError.util');

exports.getActiveDeliveryFees = catchAsync(async (req, res) => {
  const filter = { isActive: true, isDeleted: false };
  if (req.query.governorate) filter.governorate = req.query.governorate;

  const fees = await DeliveryFee.find(filter).sort({ governorate: 1, city: 1 });
  res.status(200).json({ success: true, data: fees });
});


exports.getAllDeliveryFees = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.isDeleted !== 'all') filter.isDeleted = req.query.isDeleted === 'true';

  const fees = await DeliveryFee.find(filter).sort({ governorate: 1, city: 1 });
  res.status(200).json({ success: true, data: fees });
});

exports.createDeliveryFee = catchAsync(async (req, res) => {
  const { governorate, city, area, fee } = req.body;
  const deliveryFee = await DeliveryFee.create({ governorate, city, area, fee });
  res.status(201).json({ success: true, message: 'Delivery fee created', data: deliveryFee });
});

exports.updateDeliveryFee = catchAsync(async (req, res) => {
  const deliveryFee = await DeliveryFee.findById(req.params.id);
  if (!deliveryFee || deliveryFee.isDeleted) throw new AppError('Delivery fee not found', 404);

  const { governorate, city, area, fee } = req.body;
  if (governorate) deliveryFee.governorate = governorate;
  if (city !== undefined) deliveryFee.city = city;
  if (area !== undefined) deliveryFee.area = area;
  if (fee !== undefined) deliveryFee.fee = fee;

  await deliveryFee.save();
  res.status(200).json({ success: true, message: 'Delivery fee updated', data: deliveryFee });
});

exports.toggleActive = catchAsync(async (req, res) => {
  const deliveryFee = await DeliveryFee.findById(req.params.id);
  if (!deliveryFee || deliveryFee.isDeleted) throw new AppError('Delivery fee not found', 404);

  deliveryFee.isActive = !deliveryFee.isActive;
  await deliveryFee.save();

  res.status(200).json({
    success: true,
    message: `Delivery fee ${deliveryFee.isActive ? 'activated' : 'deactivated'}`,
    data: deliveryFee
  });
});

exports.softDelete = catchAsync(async (req, res) => {
  const deliveryFee = await DeliveryFee.findById(req.params.id);
  if (!deliveryFee) throw new AppError('Delivery fee not found', 404);

  deliveryFee.isDeleted = true;
  deliveryFee.isActive = false;
  await deliveryFee.save();

  res.status(200).json({ success: true, message: 'Delivery fee deleted' });
});
