const express = require('express');
const router = express.Router();
const { validationResult, param } = require('express-validator');
const seasonCtrl = require('../controllers/season.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

const validateId = param('id').isMongoId().withMessage('Invalid ID');

router.get('/', seasonCtrl.getActiveSeasons);

router.get('/admin', authenticate, authorize('admin'), seasonCtrl.getAllSeasons);
router.post('/', authenticate, authorize('admin'), seasonCtrl.createSeason);
router.put('/:id', authenticate, authorize('admin'), validateId, handleValidation, seasonCtrl.updateSeason);
router.patch('/:id/toggle-active', authenticate, authorize('admin'), validateId, handleValidation, seasonCtrl.toggleActive);
router.delete('/:id', authenticate, authorize('admin'), validateId, handleValidation, seasonCtrl.softDelete);

module.exports = router;
