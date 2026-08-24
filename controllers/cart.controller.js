const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const catchAsync = require('../utilities/catchAsync.util');
const AppError = require('../utilities/appError.util');
const cartService = require('../services/cart.service');

exports.getCart = catchAsync(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product', 'name slug price image stock isActive isDeleted');

  if (!cart) {
    return res.status(200).json({ success: true, data: { items: [], totalPrice: 0 } });
  }

  cart = await cartService.syncCartPrices(cart);
  await cart.populate('items.product', 'name slug price image stock isActive isDeleted');

  const validItems = [];
  const priceChangedItems = [];

  for (const item of cart.items) {
    if (item.isPriceChanged) {
      priceChangedItems.push(item);
    } else {
      validItems.push(item);
    }
  }

  res.status(200).json({
    success: true,
    data: {
      _id: cart._id,
      items: validItems,
      priceChangedItems,
      totalPrice: cart.totalPrice,
      hasPriceChanges: priceChangedItems.length > 0
    }
  });
});

exports.addToCart = catchAsync(async (req, res) => {
  const { productId, quantity } = req.body;

  const product = await Product.findOne({ _id: productId, isActive: true, isDeleted: false });
  if (!product) throw new AppError('Product not found', 404);
  if (product.stock === 0) throw new AppError('Product is out of stock', 400);

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const existingIndex = cart.items.findIndex(
    item => item.product.toString() === productId
  );

  if (existingIndex > -1) {
    cart.items[existingIndex].quantity += quantity;
    cart.items[existingIndex].priceAtCart = product.price;
    cart.items[existingIndex].isPriceChanged = false;
  } else {
    cart.items.push({
      product: productId,
      quantity,
      priceAtCart: product.price,
      isPriceChanged: false
    });
  }

  await cart.save();
  await cart.populate('items.product', 'name slug price image stock isActive isDeleted');

  res.status(200).json({ success: true, message: 'Added to cart', data: cart });
});

exports.updateQuantity = catchAsync(async (req, res) => {
  const { quantity } = req.body;
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new AppError('Cart not found', 404);

  const item = cart.items.id(itemId);
  if (!item) throw new AppError('Cart item not found', 404);

  item.quantity = quantity;
  await cart.save();
  await cart.populate('items.product', 'name slug price image stock isActive isDeleted');

  res.status(200).json({ success: true, message: 'Quantity updated', data: cart });
});

exports.removeItem = catchAsync(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new AppError('Cart not found', 404);

  const item = cart.items.id(req.params.itemId);
  if (!item) throw new AppError('Cart item not found', 404);

  item.deleteOne();
  await cart.save();
  await cart.populate('items.product', 'name slug price image stock isActive isDeleted');

  res.status(200).json({ success: true, message: 'Item removed', data: cart });
});

exports.acceptPriceChange = catchAsync(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new AppError('Cart not found', 404);

  const item = cart.items.id(req.params.itemId);
  if (!item) throw new AppError('Cart item not found', 404);

  const product = await Product.findById(item.product);
  if (!product || product.isDeleted || !product.isActive) {
    throw new AppError('Product is no longer available', 400);
  }

  item.priceAtCart = product.price;
  item.isPriceChanged = false;
  await cart.save();
  await cart.populate('items.product', 'name slug price image stock isActive isDeleted');

  res.status(200).json({ success: true, message: 'Price change accepted', data: cart });
});

exports.mergeGuestCart = catchAsync(async (req, res) => {
  const { items } = req.body;
  await cartService.mergeGuestCart(req.user._id, items);

  const cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product', 'name slug price image stock isActive isDeleted');

  res.status(200).json({ success: true, message: 'Cart merged', data: cart });
});

exports.clearCart = catchAsync(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.status(200).json({ success: true, message: 'Cart cleared' });
});
