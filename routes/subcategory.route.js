const express = require('express');
const router = express.Router();
const subcategoryCtrl = require('../controllers/subcategory.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { validateObjectId } = require('../validators/common.validator');
const { createSubcategoryRules, updateSubcategoryRules } = require('../validators/subcategory.validator');

router.get('/', subcategoryCtrl.getActiveSubcategories);
router.get('/category/:categoryId', subcategoryCtrl.getByCategory);

// Admin
router.get('/admin', authenticate, authorize('admin'), subcategoryCtrl.getAllSubcategories);
router.post('/', authenticate, authorize('admin'), createSubcategoryRules, validate, subcategoryCtrl.createSubcategory);
router.put('/:id', authenticate, authorize('admin'), validateObjectId(), updateSubcategoryRules, validate, subcategoryCtrl.updateSubcategory);
router.patch('/:id/toggle-active', authenticate, authorize('admin'), validateObjectId(), validate, subcategoryCtrl.toggleActive);
router.delete('/:id', authenticate, authorize('admin'), validateObjectId(), validate, subcategoryCtrl.softDelete);

module.exports = router;
