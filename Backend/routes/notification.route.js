const express = require('express');
const router = express.Router();
const { validationResult, param } = require('express-validator');
const notificationCtrl = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const paginate = require('../middlewares/paginate.middleware');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

const validateId = param('id').isMongoId().withMessage('Invalid ID');

router.use(authenticate, authorize('admin'));

router.get('/', paginate, notificationCtrl.getNotifications);
router.get('/unread-count', notificationCtrl.getUnreadCount);
router.patch('/:id/read', validateId, handleValidation, notificationCtrl.markAsRead);
router.patch('/read-all', notificationCtrl.markAllAsRead);

module.exports = router;
