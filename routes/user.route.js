const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const paginate = require('../middlewares/paginate.middleware');
const validate = require('../middlewares/validate.middleware');
const { validateObjectId } = require('../validators/common.validator');
const { updateProfileRules, addAddressRules, updateAddressRules } = require('../validators/user.validator');

// Authenticated user profile
router.patch('/profile', authenticate, updateProfileRules, validate, userCtrl.updateProfile);
router.get('/addresses', authenticate, userCtrl.getAddresses);
router.post('/addresses', authenticate, addAddressRules, validate, userCtrl.addAddress);
router.patch('/addresses/:addressId', authenticate, updateAddressRules, validate, userCtrl.updateAddress);
router.delete('/addresses/:addressId', authenticate, userCtrl.deleteAddress);
router.patch('/addresses/:addressId/default', authenticate, userCtrl.setDefaultAddress);

// Admin
router.get('/', authenticate, authorize('admin'), paginate, userCtrl.getAllUsers);
router.get('/:id', authenticate, authorize('admin'), validateObjectId(), validate, userCtrl.getUserById);
router.patch('/:id/block', authenticate, authorize('admin'), validateObjectId(), validate, userCtrl.blockUser);
router.patch('/:id/unblock', authenticate, authorize('admin'), validateObjectId(), validate, userCtrl.unblockUser);

module.exports = router;