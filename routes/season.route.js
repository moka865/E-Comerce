const express = require('express');
const router = express.Router();
const seasonCtrl = require('../controllers/season.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { validateObjectId } = require('../validators/common.validator');

// Public
router.get('/', seasonCtrl.getActiveSeasons);

// Admin
router.get('/admin', authenticate, authorize('admin'), seasonCtrl.getAllSeasons);
router.post('/', authenticate, authorize('admin'), seasonCtrl.createSeason);
router.put('/:id', authenticate, authorize('admin'), validateObjectId(), validate, seasonCtrl.updateSeason);
router.patch('/:id/toggle-active', authenticate, authorize('admin'), validateObjectId(), validate, seasonCtrl.toggleActive);
router.delete('/:id', authenticate, authorize('admin'), validateObjectId(), validate, seasonCtrl.softDelete);

module.exports = router;
