const express = require('express');
const router = express.Router();
const cartCtrl = require('../controllers/cart.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { addToCartRules, updateQuantityRules, mergeCartRules } = require('../validators/cart.validator');

router.use(authenticate);

router.get('/', cartCtrl.getCart);
router.post('/items', addToCartRules, validate, cartCtrl.addToCart);
router.patch('/items/:itemId/quantity', updateQuantityRules, validate, cartCtrl.updateQuantity);
router.delete('/items/:itemId', cartCtrl.removeItem);
router.patch('/items/:itemId/accept-price', cartCtrl.acceptPriceChange);
router.post('/merge', mergeCartRules, validate, cartCtrl.mergeGuestCart);
router.delete('/', cartCtrl.clearCart);

module.exports = router;
