const AppError = require('../utilities/appError.util');

exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError('Access denied', 403);
    }
    next();
  };
};