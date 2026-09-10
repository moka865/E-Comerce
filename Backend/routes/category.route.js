const express = require('express');
const router = express.Router();
const { validationResult, param } = require('express-validator');
const categoryCtrl = require('../controllers/category.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { createCategoryRules, updateCategoryRules } = require('../validators/category.validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

const validateId = param('id').isMongoId().withMessage('Invalid ID');

router.get('/', categoryCtrl.getActiveCategories);

router.get('/admin', authenticate, authorize('admin'), categoryCtrl.getAllCategories);
router.post('/', authenticate, authorize('admin'), createCategoryRules, handleValidation, categoryCtrl.createCategory);
router.put('/:id', authenticate, authorize('admin'), validateId, updateCategoryRules, handleValidation, categoryCtrl.updateCategory);
router.patch('/:id/toggle-active', authenticate, authorize('admin'), validateId, handleValidation, categoryCtrl.toggleActive);
router.delete('/:id', authenticate, authorize('admin'), validateId, handleValidation, categoryCtrl.softDelete);
router.patch('/:id/restore', authenticate, authorize('admin'), validateId, handleValidation, categoryCtrl.restoreCategory);

module.exports = router;
