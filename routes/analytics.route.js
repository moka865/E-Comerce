const express = require('express');
const router = express.Router();
const analyticsCtrl = require('../controllers/analytics.controller');
const { authenticate, optionalAuth } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

// Public / Optional auth
router.post('/events', optionalAuth, analyticsCtrl.trackEvent);
router.get('/recommendations', optionalAuth, analyticsCtrl.getRecommendations);

// Admin
router.get('/insights', authenticate, authorize('admin'), analyticsCtrl.getInsights);
router.get('/top-products', authenticate, authorize('admin'), analyticsCtrl.getTopProducts);
router.get('/top-customers', authenticate, authorize('admin'), analyticsCtrl.getTopCustomers);

module.exports = router;
