const { body } = require('express-validator');

exports.createCategoryRules = [
  body('name').trim().notEmpty().withMessage('Category name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters')
];

exports.updateCategoryRules = [
  body('name').optional().trim().notEmpty().withMessage('Category name cannot be empty')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters')
];
