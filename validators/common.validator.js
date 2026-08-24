const { param, query } = require('express-validator');
const mongoose = require('mongoose');

exports.validateObjectId = (paramName = 'id') => {
  return param(paramName)
    .custom(value => mongoose.Types.ObjectId.isValid(value))
    .withMessage(`Invalid ${paramName}`);
};

exports.validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
];
