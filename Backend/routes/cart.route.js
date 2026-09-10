const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const cartCtrl = require('../controllers/cart.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { addToCartRules, updateQuantityRules, mergeCartRules } = require('../validators/cart.validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

router.use(authenticate);

router.get('/', cartCtrl.getCart);
router.post('/items', addToCartRules, handleValidation, cartCtrl.addToCart);
router.patch('/items/:itemId/quantity', updateQuantityRules, handleValidation, cartCtrl.updateQuantity);
router.delete('/items/:itemId', cartCtrl.removeItem);
router.patch('/items/:itemId/accept-price', cartCtrl.acceptPriceChange);
router.post('/merge', mergeCartRules, handleValidation, cartCtrl.mergeGuestCart);
router.delete('/', cartCtrl.clearCart);

module.exports = router;
