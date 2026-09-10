const { body } = require('express-validator');

exports.addToCartRules = [
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

exports.updateQuantityRules = [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

exports.mergeCartRules = [
  body('items').isArray({ min: 1 }).withMessage('Items array is required'),
  body('items.*.productId').isMongoId().withMessage('Valid product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];
