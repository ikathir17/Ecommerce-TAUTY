const Rating = require('../models/Rating');
const Order = require('../models/Order');
const { validationResult } = require('express-validator');

// @desc    Add or update a product rating
// @route   POST /api/ratings
// @access  Private
exports.addRating = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { productId, orderId, rating, review, images } = req.body;
    const userId = req.user.id;

    // Verify that the order exists and belongs to the user
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
      status: 'delivered'
    });

    if (!order) {
      return res.status(404).json({ msg: 'Order not found or not delivered' });
    }

    // Check if product exists in the order
    const productInOrder = order.items.some(
      item => item.product.toString() === productId
    );

    if (!productInOrder) {
      return res.status(400).json({ msg: 'Product not found in this order' });
    }

    // Create or update rating
    let ratingDoc = await Rating.findOneAndUpdate(
      { user: userId, product: productId, order: orderId },
      { rating, review, images },
      { new: true, upsert: true, runValidators: true }
    );

    // Populate user info
    ratingDoc = await ratingDoc.populate('user', 'name');

    res.json(ratingDoc);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get product ratings
// @route   GET /api/ratings/product/:productId
// @access  Public
exports.getProductRatings = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const [ratings, total] = await Promise.all([
      Rating.find({ product: productId })
        .populate('user', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Rating.countDocuments({ product: productId })
    ]);

    res.json({
      ratings,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get user's ratings
// @route   GET /api/ratings/me
// @access  Private
exports.getMyRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ user: req.user.id })
      .populate('product', 'name image')
      .sort({ createdAt: -1 });
    
    res.json(ratings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all ratings (Admin)
// @route   GET /api/ratings
// @access  Private/Admin
exports.getAllRatings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [ratings, total] = await Promise.all([
      Rating.find()
        .populate('user', 'name email')
        .populate('product', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Rating.countDocuments()
    ]);

    res.json({
      ratings,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
