const { body } = require('express-validator');

exports.registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('mobilePhone').trim().notEmpty().withMessage('Mobile phone is required')
    .matches(/^01[0125][0-9]{8}$/).withMessage('Invalid Egyptian mobile number'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('gender').isIn(['male', 'female']).withMessage('Gender must be male or female'),
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date of birth')
];

exports.loginRules = [
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];
