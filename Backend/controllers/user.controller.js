const User = require('../models/user.model');
const catchAsync = require('../utilities/catchAsync.util');
const AppError = require('../utilities/appError.util');

exports.updateProfile = catchAsync(async (req, res) => {
  const { name, email, dateOfBirth } = req.body;
  const user = req.user;

  if (email && email !== user.email) {
    const existing = await User.findOne({ email });
    if (existing) throw new AppError('Email already in use', 409);
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (dateOfBirth) user.dateOfBirth = dateOfBirth;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: 'Profile updated', data: user });
});

exports.getAddresses = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, data: req.user.addresses });
});

exports.addAddress = catchAsync(async (req, res) => {
  const user = req.user;
  const { address, governorate, city, area, buildingDetails, isDefault } = req.body;

  if (isDefault) {
    user.addresses.forEach(addr => { addr.isDefault = false; });
  }

  user.addresses.push({ address, governorate, city, area, buildingDetails, isDefault: isDefault || false });
  await user.save({ validateBeforeSave: false });

  res.status(201).json({ success: true, message: 'Address added', data: user.addresses });
});

exports.updateAddress = catchAsync(async (req, res) => {
  const user = req.user;
  const addr = user.addresses.id(req.params.addressId);
  if (!addr) throw new AppError('Address not found', 404);

  const { address, governorate, city, area, buildingDetails, isDefault } = req.body;

  if (isDefault) {
    user.addresses.forEach(a => { a.isDefault = false; });
  }

  if (address) addr.address = address;
  if (governorate) addr.governorate = governorate;
  if (city) addr.city = city;
  if (area !== undefined) addr.area = area;
  if (buildingDetails !== undefined) addr.buildingDetails = buildingDetails;
  if (isDefault !== undefined) addr.isDefault = isDefault;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: 'Address updated', data: user.addresses });
});

exports.deleteAddress = catchAsync(async (req, res) => {
  const user = req.user;
  const addr = user.addresses.id(req.params.addressId);
  if (!addr) throw new AppError('Address not found', 404);

  addr.deleteOne();
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: 'Address removed', data: user.addresses });
});

exports.setDefaultAddress = catchAsync(async (req, res) => {
  const user = req.user;
  const addr = user.addresses.id(req.params.addressId);
  if (!addr) throw new AppError('Address not found', 404);

  user.addresses.forEach(a => { a.isDefault = false; });
  addr.isDefault = true;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: 'Default address set', data: user.addresses });
});


exports.getAllUsers = catchAsync(async (req, res) => {
  const { page, limit, skip, sortBy, order } = req.pagination;
  const filter = { isDeleted: false };

  if (req.query.role) filter.role = req.query.role;
  if (req.query.isBlocked !== undefined && req.query.isBlocked !== '') {
    if (req.query.isBlocked === 'true') filter.isBlocked = true;
    else if (req.query.isBlocked === 'false') filter.isBlocked = false;
  }

  if (req.query.search && typeof req.query.search === 'string') {
    const searchTerm = req.query.search.trim();
    if (searchTerm) {
      const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { name: regex },
        { email: regex }
      ];
    }
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ [sortBy]: order }).skip(skip).limit(limit),
    User.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      page, limit, total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1
    }
  });
});

exports.getUserById = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.isDeleted) throw new AppError('User not found', 404);

  res.status(200).json({ success: true, data: user });
});

exports.blockUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.isDeleted) throw new AppError('User not found', 404);
  if (user.role === 'admin') throw new AppError('Cannot block an admin', 400);

  user.isBlocked = true;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: 'User blocked' });
});

exports.unblockUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.isDeleted) throw new AppError('User not found', 404);

  user.isBlocked = false;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: 'User unblocked' });
});