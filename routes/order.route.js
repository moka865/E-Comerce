const express = require('express');
const router = express.Router();
const orderCtrl = require('../controllers/order.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const paginate = require('../middlewares/paginate.middleware');
const validate = require('../middlewares/validate.middleware');
const { validateObjectId } = require('../validators/common.validator');
const { createOrderRules, updateStatusRules, refundRequestRules } = require('../validators/order.validator');

// User
router.post('/', authenticate, createOrderRules, validate, orderCtrl.createOrder);
router.get('/my-orders', authenticate, paginate, orderCtrl.getUserOrders);
router.get('/my-orders/:id', authenticate, validateObjectId(), validate, orderCtrl.getOrderById);
router.patch('/:id/cancel', authenticate, validateObjectId(), validate, orderCtrl.cancelOrder);
router.post('/:id/refund', authenticate, validateObjectId(), refundRequestRules, validate, orderCtrl.requestRefund);

// Admin
router.get('/', authenticate, authorize('admin'), paginate, orderCtrl.getAllOrders);
router.patch('/:id/status', authenticate, authorize('admin'), validateObjectId(), updateStatusRules, validate, orderCtrl.updateOrderStatus);
router.patch('/:id/refund-review', authenticate, authorize('admin'), validateObjectId(), validate, orderCtrl.reviewRefund);

module.exports = router;
