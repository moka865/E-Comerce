const { body } = require('express-validator');

exports.createDeliveryFeeRules = [
  body('governorate').trim().notEmpty().withMessage('Governorate is required'),
  body('city').optional().trim(),
  body('area').optional().trim(),
  body('fee').isFloat({ min: 0 }).withMessage('Fee must be a non-negative number')
];

exports.updateDeliveryFeeRules = [
  body('governorate').optional().trim().notEmpty().withMessage('Governorate cannot be empty'),
  body('city').optional().trim(),
  body('area').optional().trim(),
  body('fee').optional().isFloat({ min: 0 }).withMessage('Fee must be a non-negative number')
];
