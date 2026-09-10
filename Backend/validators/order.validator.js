const { body } = require('express-validator');

exports.createOrderRules = [
  body('addressId').isMongoId().withMessage('Valid address ID is required')
];

exports.updateStatusRules = [
  body('status').notEmpty().withMessage('Status is required'),
  body('note').optional().trim().isLength({ max: 500 }).withMessage('Note cannot exceed 500 characters')
];

exports.refundRequestRules = [
  body('reason').trim().notEmpty().withMessage('Refund reason is required')
    .isLength({ max: 1000 }).withMessage('Reason cannot exceed 1000 characters')
];
