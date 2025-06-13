const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
  }],
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'cod'],
    required: true,
  },
  transactionId: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'confirmed'],
    default: 'confirmed',
  },
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    altPhone: String,
    addressLine1: { type: String, required: true },
    addressLine2: String,
    landmark: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    addressType: { type: String, enum: ['home', 'office', 'other'], default: 'home' },
    deliveryInstructions: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
