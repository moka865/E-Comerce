const express = require('express');
const router = express.Router();
const productCtrl = require('../controllers/product.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { upload } = require('../middlewares/upload.middleware');
const paginate = require('../middlewares/paginate.middleware');
const validate = require('../middlewares/validate.middleware');
const { validateObjectId } = require('../validators/common.validator');
const { createProductRules, updateProductRules } = require('../validators/product.validator');

// Public
router.get('/', paginate, productCtrl.getAllProducts);
router.get('/new-arrivals', productCtrl.getNewArrivals);
router.get('/top-sales', productCtrl.getTopSales);
router.get('/slug/:slug', productCtrl.getProductBySlug);

// Admin
router.get('/admin', authenticate, authorize('admin'), paginate, productCtrl.adminGetAllProducts);
router.post('/', authenticate, authorize('admin'), upload.single('image'), createProductRules, validate, productCtrl.createProduct);
router.put('/:id', authenticate, authorize('admin'), validateObjectId(), upload.single('image'), updateProductRules, validate, productCtrl.updateProduct);
router.patch('/:id/toggle-active', authenticate, authorize('admin'), validateObjectId(), validate, productCtrl.toggleActive);
router.delete('/:id', authenticate, authorize('admin'), validateObjectId(), validate, productCtrl.softDelete);
router.patch('/:id/restore', authenticate, authorize('admin'), validateObjectId(), validate, productCtrl.restoreProduct);
router.patch('/:id/top-sale', authenticate, authorize('admin'), validateObjectId(), validate, productCtrl.setTopSale);
router.patch('/:id/new-arrival', authenticate, authorize('admin'), validateObjectId(), validate, productCtrl.setNewArrival);

module.exports = router;
