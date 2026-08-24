const { body } = require('express-validator');

exports.createProductRules = [
  body('name').trim().notEmpty().withMessage('Product name is required')
    .isLength({ max: 200 }).withMessage('Name cannot exceed 200 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('category').isMongoId().withMessage('Valid category ID is required'),
  body('subcategory').isMongoId().withMessage('Valid subcategory ID is required'),
  body('season').optional().isMongoId().withMessage('Valid season ID is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
];

exports.updateProductRules = [
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty')
    .isLength({ max: 200 }).withMessage('Name cannot exceed 200 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('category').optional().isMongoId().withMessage('Valid category ID is required'),
  body('subcategory').optional().isMongoId().withMessage('Valid subcategory ID is required'),
  body('season').optional().isMongoId().withMessage('Valid season ID is required'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
];
