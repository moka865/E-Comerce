const express = require('express');
const router = express.Router();
const { validationResult, param } = require('express-validator');
const testimonialCtrl = require('../controllers/testimonial.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const paginate = require('../middlewares/paginate.middleware');
const { submitTestimonialRules } = require('../validators/testimonial.validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

const validateId = param('id').isMongoId().withMessage('Invalid ID');

router.get('/', paginate, testimonialCtrl.getApprovedTestimonials);

router.post('/', authenticate, submitTestimonialRules, handleValidation, testimonialCtrl.submitTestimonial);

router.get('/admin', authenticate, authorize('admin'), testimonialCtrl.getAllTestimonials);
router.get('/pending', authenticate, authorize('admin'), testimonialCtrl.getPendingTestimonials);
router.patch('/:id/approve', authenticate, authorize('admin'), validateId, handleValidation, testimonialCtrl.approveTestimonial);
router.patch('/:id/decline', authenticate, authorize('admin'), validateId, handleValidation, testimonialCtrl.declineTestimonial);

module.exports = router;
