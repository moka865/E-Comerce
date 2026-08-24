const express = require('express');
const router = express.Router();
const deliveryFeeCtrl = require('../controllers/deliveryFee.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { validateObjectId } = require('../validators/common.validator');
const { createDeliveryFeeRules, updateDeliveryFeeRules } = require('../validators/deliveryFee.validator');

// Public
router.get('/', deliveryFeeCtrl.getActiveDeliveryFees);

// Admin
router.get('/admin', authenticate, authorize('admin'), deliveryFeeCtrl.getAllDeliveryFees);
router.post('/', authenticate, authorize('admin'), createDeliveryFeeRules, validate, deliveryFeeCtrl.createDeliveryFee);
router.put('/:id', authenticate, authorize('admin'), validateObjectId(), updateDeliveryFeeRules, validate, deliveryFeeCtrl.updateDeliveryFee);
router.patch('/:id/toggle-active', authenticate, authorize('admin'), validateObjectId(), validate, deliveryFeeCtrl.toggleActive);
router.delete('/:id', authenticate, authorize('admin'), validateObjectId(), validate, deliveryFeeCtrl.softDelete);

module.exports = router;
