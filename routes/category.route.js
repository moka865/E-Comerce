const express = require('express');
const router = express.Router();
const categoryCtrl = require('../controllers/category.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { validateObjectId } = require('../validators/common.validator');
const { createCategoryRules, updateCategoryRules } = require('../validators/category.validator');

router.get('/', categoryCtrl.getActiveCategories);

// Admin
router.get('/admin', authenticate, authorize('admin'), categoryCtrl.getAllCategories);
router.post('/', authenticate, authorize('admin'), createCategoryRules, validate, categoryCtrl.createCategory);
router.put('/:id', authenticate, authorize('admin'), validateObjectId(), updateCategoryRules, validate, categoryCtrl.updateCategory);
router.patch('/:id/toggle-active', authenticate, authorize('admin'), validateObjectId(), validate, categoryCtrl.toggleActive);
router.delete('/:id', authenticate, authorize('admin'), validateObjectId(), validate, categoryCtrl.softDelete);
router.patch('/:id/restore', authenticate, authorize('admin'), validateObjectId(), validate, categoryCtrl.restoreCategory);

module.exports = router;
