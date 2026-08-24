const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utilities/catchAsync.util');
const AppError = require('../utilities/appError.util');
const cartService = require('../services/cart.service');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.SECRET_KEY,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

exports.register = catchAsync(async (req, res) => {
  const { name, email, mobilePhone, password, gender, dateOfBirth, nationalId } = req.body;

  const existingUser = await User.findOne({
    $or: [{ email }, { mobilePhone }]
  });
  if (existingUser) {
    throw new AppError('Email or mobile phone already registered', 409);
  }

  const user = await User.create({
    name, email, mobilePhone, password, gender, dateOfBirth, nationalId, role: 'user'
  });

  if (req.body.guestCart) {
    await cartService.mergeGuestCart(user._id, req.body.guestCart);
  }

  const token = generateToken(user);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: { user, token }
  });
});

exports.login = catchAsync(async (req, res) => {
  const { mobilePhone, password } = req.body;

  const user = await User.findOne({ mobilePhone }).select('+password');
  if (!user || !(await user.isCorrectPassword(password))) {
    throw new AppError('Invalid mobile number or password', 401);
  }

  if (user.isDeleted) {
    throw new AppError('Account has been deleted', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated', 403);
  }

  if (user.isBlocked) {
    throw new AppError('Account is blocked', 403, 'USER_BLOCKED');
  }

  if (req.body.guestCart) {
    await cartService.mergeGuestCart(user._id, req.body.guestCart);
  }

  const token = generateToken(user);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { user, token }
  });
});

exports.getMe = catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
});