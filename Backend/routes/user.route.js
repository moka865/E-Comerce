const express = require('express');
const router = express.Router();
const { validationResult, param } = require('express-validator');
const userCtrl = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const paginate = require('../middlewares/paginate.middleware');
const { updateProfileRules, addAddressRules, updateAddressRules } = require('../validators/user.validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

const validateId = param('id').isMongoId().withMessage('Invalid ID');

router.patch('/profile', authenticate, updateProfileRules, handleValidation, userCtrl.updateProfile);
router.get('/addresses', authenticate, userCtrl.getAddresses);
router.post('/addresses', authenticate, addAddressRules, handleValidation, userCtrl.addAddress);
router.patch('/addresses/:addressId', authenticate, updateAddressRules, handleValidation, userCtrl.updateAddress);
router.delete('/addresses/:addressId', authenticate, userCtrl.deleteAddress);
router.patch('/addresses/:addressId/default', authenticate, userCtrl.setDefaultAddress);

router.get('/', authenticate, authorize('admin'), paginate, userCtrl.getAllUsers);
router.get('/:id', authenticate, authorize('admin'), validateId, handleValidation, userCtrl.getUserById);
router.patch('/:id/block', authenticate, authorize('admin'), validateId, handleValidation, userCtrl.blockUser);
router.patch('/:id/unblock', authenticate, authorize('admin'), validateId, handleValidation, userCtrl.unblockUser);

module.exports = router;