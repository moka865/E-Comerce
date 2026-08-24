const express = require('express');
const router = express.Router();
const contentCtrl = require('../controllers/content.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

// Public
router.get('/:key', contentCtrl.getContent);

// Admin
router.get('/', authenticate, authorize('admin'), contentCtrl.getAllContent);
router.put('/:key', authenticate, authorize('admin'), contentCtrl.updateContent);

module.exports = router;
