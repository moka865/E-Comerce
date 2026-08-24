const express = require('express');
const router = express.Router();
const testimonialCtrl = require('../controllers/testimonial.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const paginate = require('../middlewares/paginate.middleware');
const validate = require('../middlewares/validate.middleware');
const { validateObjectId } = require('../validators/common.validator');
const { submitTestimonialRules } = require('../validators/testimonial.validator');

// Public
router.get('/', paginate, testimonialCtrl.getApprovedTestimonials);

// User
router.post('/', authenticate, submitTestimonialRules, validate, testimonialCtrl.submitTestimonial);

// Admin
router.get('/admin', authenticate, authorize('admin'), testimonialCtrl.getAllTestimonials);
router.get('/pending', authenticate, authorize('admin'), testimonialCtrl.getPendingTestimonials);
router.patch('/:id/approve', authenticate, authorize('admin'), validateObjectId(), validate, testimonialCtrl.approveTestimonial);
router.patch('/:id/decline', authenticate, authorize('admin'), validateObjectId(), validate, testimonialCtrl.declineTestimonial);

module.exports = router;
