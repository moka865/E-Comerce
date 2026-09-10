const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  priceAtCart: {
    type: Number,
    required: true,
    min: 0
  },
  isPriceChanged: {
    type: Boolean,
    default: false
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

cartSchema.virtual('totalPrice').get(function () {
  return this.items.reduce((sum, item) => {
    if (!item.isPriceChanged) {
      return sum + (item.priceAtCart * item.quantity);
    }
    return sum;
  }, 0);
});



module.exports = mongoose.model('Cart', cartSchema);
