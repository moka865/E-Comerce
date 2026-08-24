const { body } = require('express-validator');

exports.createSubcategoryRules = [
  body('name').trim().notEmpty().withMessage('Subcategory name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('category').isMongoId().withMessage('Valid category ID is required')
];

exports.updateSubcategoryRules = [
  body('name').optional().trim().notEmpty().withMessage('Subcategory name cannot be empty')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('category').optional().isMongoId().withMessage('Valid category ID is required')
];
