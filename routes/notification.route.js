const express = require('express');
const router = express.Router();
const notificationCtrl = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const paginate = require('../middlewares/paginate.middleware');
const { validateObjectId } = require('../validators/common.validator');
const validate = require('../middlewares/validate.middleware');

router.use(authenticate, authorize('admin'));

router.get('/', paginate, notificationCtrl.getNotifications);
router.get('/unread-count', notificationCtrl.getUnreadCount);
router.patch('/:id/read', validateObjectId(), validate, notificationCtrl.markAsRead);
router.patch('/read-all', notificationCtrl.markAllAsRead);

module.exports = router;
