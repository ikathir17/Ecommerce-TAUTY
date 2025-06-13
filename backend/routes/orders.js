const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, transactionId } = req.body;
    
    // Validate products and calculate total
    let subtotal = 0;
    const orderItems = [];

    if (!['upi', 'cod'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ message: 'Invalid product or insufficient stock' });
      }
      
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
      
      subtotal += product.price * item.quantity;
      
      // Update stock
      product.stock -= item.quantity;
      await product.save();
    }

    const DELIVERY_CHARGE = 10;
    const discount = paymentMethod === 'upi' ? 0.05 * subtotal : 0;
    const totalAmount = subtotal - discount + DELIVERY_CHARGE;

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      transactionId: paymentMethod === 'upi' ? transactionId : undefined,
      paymentStatus: paymentMethod === 'upi' ? 'pending' : 'confirmed',
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order' });
  }
});

// Get user orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Get all orders (admin only)
router.get('/', [auth, admin], async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Check if user has purchased a specific product
router.get('/check-purchase/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const order = await Order.findOne({
      user: req.user._id,
      status: 'delivered',
      'items.product': productId
    });
    
    res.json({ hasPurchased: !!order });
  } catch (error) {
    console.error('Error checking purchase status:', error);
    res.status(500).json({ message: 'Error checking purchase status' });
  }
});

// Update order status (admin only)
router.patch('/:id/status', [auth, admin], async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status' });
  }
});

// Cancel order (user)
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }
    order.status = 'cancelled';
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error cancelling order' });
  }
});

// Confirm UPI payment (admin)
router.patch('/:id/confirm-payment', [auth, admin], async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.paymentMethod !== 'upi') {
      return res.status(400).json({ message: 'Not a UPI order' });
    }
    order.paymentStatus = 'confirmed';
    // once confirmed move status to processing if still pending
    if (order.status === 'pending') order.status = 'processing';
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error confirming payment' });
  }
});

module.exports = router;
