const express = require('express');
const router = express.Router();
const { validationResult, param } = require('express-validator');
const productCtrl = require('../controllers/product.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { upload } = require('../middlewares/upload.middleware');
const paginate = require('../middlewares/paginate.middleware');
const { createProductRules, updateProductRules } = require('../validators/product.validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

const validateId = param('id').isMongoId().withMessage('Invalid ID');

router.get('/', paginate, productCtrl.getAllProducts);
router.get('/new-arrivals', productCtrl.getNewArrivals);
router.get('/top-sales', productCtrl.getTopSales);
router.get('/slug/:slug', productCtrl.getProductBySlug);

router.get('/admin', authenticate, authorize('admin'), paginate, productCtrl.adminGetAllProducts);
router.post('/', authenticate, authorize('admin'), upload.single('image'), createProductRules, handleValidation, productCtrl.createProduct);
router.put('/:id', authenticate, authorize('admin'), validateId, upload.single('image'), updateProductRules, handleValidation, productCtrl.updateProduct);
router.patch('/:id/toggle-active', authenticate, authorize('admin'), validateId, handleValidation, productCtrl.toggleActive);
router.delete('/:id', authenticate, authorize('admin'), validateId, handleValidation, productCtrl.softDelete);
router.patch('/:id/restore', authenticate, authorize('admin'), validateId, handleValidation, productCtrl.restoreProduct);
router.patch('/:id/top-sale', authenticate, authorize('admin'), validateId, handleValidation, productCtrl.setTopSale);
router.patch('/:id/new-arrival', authenticate, authorize('admin'), validateId, handleValidation, productCtrl.setNewArrival);

module.exports = router;
