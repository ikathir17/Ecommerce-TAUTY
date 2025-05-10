const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Product = require('../models/Product');

// Get cart (from localStorage, we'll just validate products)
router.post('/validate', auth, async (req, res) => {
  try {
    const cartItems = req.body.items;
    const validatedItems = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      if (product && product.stock >= item.quantity) {
        validatedItems.push({
          product,
          quantity: item.quantity,
          total: product.price * item.quantity
        });
      }
    }

    const total = validatedItems.reduce((sum, item) => sum + item.total, 0);
    res.json({ items: validatedItems, total });
  } catch (error) {
    res.status(500).json({ message: 'Error validating cart' });
  }
});

module.exports = router;
