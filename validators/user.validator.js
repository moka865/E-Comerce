const { body } = require('express-validator');

exports.updateProfileRules = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').optional().trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date of birth')
];

exports.addAddressRules = [
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('governorate').trim().notEmpty().withMessage('Governorate is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('area').optional().trim(),
  body('buildingDetails').optional().trim(),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be boolean')
];

exports.updateAddressRules = [
  body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
  body('governorate').optional().trim().notEmpty().withMessage('Governorate cannot be empty'),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('area').optional().trim(),
  body('buildingDetails').optional().trim(),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be boolean')
];
