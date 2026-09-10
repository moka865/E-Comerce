const User = require('../models/user.model');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utilities/catchAsync.util');
const AppError = require('../utilities/appError.util');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.SECRET_KEY,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const mergeGuestCart = async (userId, guestItems) => {
  if (!guestItems || !guestItems.length) return;

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  for (const guestItem of guestItems) {
    const product = await Product.findById(guestItem.productId);
    if (!product || product.isDeleted || !product.isActive || product.stock === 0) {
      continue;
    }

    const existingIndex = cart.items.findIndex(
      item => item.product.toString() === guestItem.productId
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += guestItem.quantity;
      cart.items[existingIndex].priceAtCart = product.price;
      cart.items[existingIndex].isPriceChanged = false;
    } else {
      cart.items.push({
        product: guestItem.productId,
        quantity: guestItem.quantity,
        priceAtCart: product.price,
        isPriceChanged: false
      });
    }
  }

  await cart.save();
  return cart;
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
    await mergeGuestCart(user._id, req.body.guestCart);
  }

  const token = generateToken(user);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: { user, token }
  });
});

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const normalizedEmail = email ? email.toLowerCase().trim() : '';
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user || !(await user.isCorrectPassword(password))) {
    throw new AppError('Invalid email or password', 401);
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
    await mergeGuestCart(user._id, req.body.guestCart);
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