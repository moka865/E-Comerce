const express = require('express');
const router = express.Router();
const { validationResult, param } = require('express-validator');
const orderCtrl = require('../controllers/order.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const paginate = require('../middlewares/paginate.middleware');
const { createOrderRules, updateStatusRules, refundRequestRules } = require('../validators/order.validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

const validateId = param('id').isMongoId().withMessage('Invalid ID');

router.post('/', authenticate, createOrderRules, handleValidation, orderCtrl.createOrder);
router.get('/my-orders', authenticate, paginate, orderCtrl.getUserOrders);
router.get('/my-orders/:id', authenticate, validateId, handleValidation, orderCtrl.getOrderById);
router.patch('/:id/cancel', authenticate, validateId, handleValidation, orderCtrl.cancelOrder);
router.post('/:id/refund', authenticate, validateId, refundRequestRules, handleValidation, orderCtrl.requestRefund);

router.get('/', authenticate, authorize('admin'), paginate, orderCtrl.getAllOrders);
router.patch('/:id/status', authenticate, authorize('admin'), validateId, updateStatusRules, handleValidation, orderCtrl.updateOrderStatus);
router.patch('/:id/refund-review', authenticate, authorize('admin'), validateId, handleValidation, orderCtrl.reviewRefund);

module.exports = router;
