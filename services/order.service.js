const mongoose = require('mongoose');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const Cart = require('../models/cart.model');
const DeliveryFee = require('../models/deliveryFee.model');
const { ORDER_STATUS } = require('../constants/orderStatus');
const AppError = require('../utilities/appError.util');
const notificationService = require('./notification.service');

exports.createOrder = async (user, addressId) => {
  const cart = await Cart.findOne({ user: user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    throw new AppError('Cart is empty', 400);
  }

  const priceChangedItems = cart.items.filter(item => item.isPriceChanged);
  if (priceChangedItems.length > 0) {
    throw new AppError('Please resolve price changes before checkout', 400, 'PRICE_CHANGES_PENDING');
  }

  const address = user.addresses.id(addressId);
  if (!address) {
    throw new AppError('Address not found', 404);
  }

  const deliveryFeeRecord = await DeliveryFee.findOne({
    governorate: address.governorate,
    isActive: true,
    isDeleted: false
  });
  const deliveryFee = deliveryFeeRecord ? deliveryFeeRecord.fee : 0;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = await Product.findOneAndUpdate(
        {
          _id: item.product._id || item.product,
          isActive: true,
          isDeleted: false,
          stock: { $gte: item.quantity }
        },
        { $inc: { stock: -item.quantity } },
        { new: true, session }
      );

      if (!product) {
        throw new AppError(
          `Product "${item.product.name || 'Unknown'}" is unavailable or insufficient stock`,
          400,
          'STOCK_UNAVAILABLE'
        );
      }

      orderItems.push({
        product: product._id,
        productName: product.name,
        priceAtOrder: item.priceAtCart,
        quantity: item.quantity
      });

      subtotal += item.priceAtCart * item.quantity;

      if (product.stock <= 3 && product.stock > 0) {
        await notificationService.createNotification({
          type: 'low_stock',
          title: 'Low Stock Alert',
          message: `${product.name} has only ${product.stock} units remaining`,
          referenceId: product._id,
          referenceModel: 'Product'
        });
      }
    }

    const totalPrice = subtotal + deliveryFee;

    const [order] = await Order.create([{
      user: user._id,
      items: orderItems,
      deliveryAddress: {
        address: address.address,
        governorate: address.governorate,
        city: address.city,
        area: address.area,
        buildingDetails: address.buildingDetails
      },
      deliveryFee,
      subtotal,
      totalPrice,
      status: ORDER_STATUS.PENDING,
      statusHistory: [{
        status: ORDER_STATUS.PENDING,
        changedBy: user._id,
        changedAt: new Date()
      }],
      paymentMethod: 'cash_on_delivery'
    }], { session });

    cart.items = [];
    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();

    await notificationService.createNotification({
      type: 'new_order',
      title: 'New Order',
      message: `New order #${order._id} placed by ${user.name} - Total: ${totalPrice} EGP`,
      referenceId: order._id,
      referenceModel: 'Order'
    });

    return order;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};
