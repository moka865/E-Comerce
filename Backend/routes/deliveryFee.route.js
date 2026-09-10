const express = require('express');
const router = express.Router();
const { validationResult, param } = require('express-validator');
const deliveryFeeCtrl = require('../controllers/deliveryFee.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { createDeliveryFeeRules, updateDeliveryFeeRules } = require('../validators/deliveryFee.validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

const validateId = param('id').isMongoId().withMessage('Invalid ID');

router.get('/', deliveryFeeCtrl.getActiveDeliveryFees);

router.get('/admin', authenticate, authorize('admin'), deliveryFeeCtrl.getAllDeliveryFees);
router.post('/', authenticate, authorize('admin'), createDeliveryFeeRules, handleValidation, deliveryFeeCtrl.createDeliveryFee);
router.put('/:id', authenticate, authorize('admin'), validateId, updateDeliveryFeeRules, handleValidation, deliveryFeeCtrl.updateDeliveryFee);
router.patch('/:id/toggle-active', authenticate, authorize('admin'), validateId, handleValidation, deliveryFeeCtrl.toggleActive);
router.delete('/:id', authenticate, authorize('admin'), validateId, handleValidation, deliveryFeeCtrl.softDelete);

module.exports = router;
