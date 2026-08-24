const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

exports.syncCartPrices = async (cart) => {
  let hasChanges = false;

  for (const item of cart.items) {
    const product = await Product.findById(item.product);

    if (!product || product.isDeleted || !product.isActive) {
      item.isPriceChanged = true;
      hasChanges = true;
      continue;
    }

    if (product.price !== item.priceAtCart) {
      item.isPriceChanged = true;
      hasChanges = true;
    }
  }

  if (hasChanges) {
    await cart.save();
  }

  return cart;
};

exports.mergeGuestCart = async (userId, guestItems) => {
  if (!guestItems || !guestItems.length) return;

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  for (const guestItem of guestItems) {
    const product = await Product.findById(guestItem.productId);
    if (!product || product.isDeleted || !product.isActive || product.stock === 0) {
      continue;
    }

    const existingIndex = cart.items.findIndex(
      item => item.product.toString() === guestItem.productId
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += guestItem.quantity;
      cart.items[existingIndex].priceAtCart = product.price;
      cart.items[existingIndex].isPriceChanged = false;
    } else {
      cart.items.push({
        product: guestItem.productId,
        quantity: guestItem.quantity,
        priceAtCart: product.price,
        isPriceChanged: false
      });
    }
  }

  await cart.save();
  return cart;
};

exports.calculateTotal = (items) => {
  return items.reduce((sum, item) => {
    if (!item.isPriceChanged) {
      return sum + (item.priceAtCart * item.quantity);
    }
    return sum;
  }, 0);
};

exports.hasUnresolvedPriceChanges = (cart) => {
  return cart.items.some(item => item.isPriceChanged);
};
