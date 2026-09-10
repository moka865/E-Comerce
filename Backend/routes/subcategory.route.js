const express = require('express');
const router = express.Router();
const { validationResult, param } = require('express-validator');
const subcategoryCtrl = require('../controllers/subcategory.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { createSubcategoryRules, updateSubcategoryRules } = require('../validators/subcategory.validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

const validateId = param('id').isMongoId().withMessage('Invalid ID');

router.get('/', subcategoryCtrl.getActiveSubcategories);
router.get('/category/:categoryId', subcategoryCtrl.getByCategory);

router.get('/admin', authenticate, authorize('admin'), subcategoryCtrl.getAllSubcategories);
router.post('/', authenticate, authorize('admin'), createSubcategoryRules, handleValidation, subcategoryCtrl.createSubcategory);
router.put('/:id', authenticate, authorize('admin'), validateId, updateSubcategoryRules, handleValidation, subcategoryCtrl.updateSubcategory);
router.patch('/:id/toggle-active', authenticate, authorize('admin'), validateId, handleValidation, subcategoryCtrl.toggleActive);
router.delete('/:id', authenticate, authorize('admin'), validateId, handleValidation, subcategoryCtrl.softDelete);

module.exports = router;
