const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utilities/appError.util');
const catchAsync = require('../utilities/catchAsync.util');

exports.authenticate = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401);
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.SECRET_KEY);

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError('User no longer exists', 401);
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

  req.user = user;
  next();
});

exports.optionalAuth = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (user && !user.isDeleted && user.isActive && !user.isBlocked) {
      req.user = user;
    }
  } catch (_) {
  }

  next();
});