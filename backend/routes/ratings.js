const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const ratingController = require('../controllers/ratingController');

// @route   POST api/ratings
// @desc    Add or update a product rating
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('productId', 'Product ID is required').not().isEmpty(),
      check('orderId', 'Order ID is required').not().isEmpty(),
      check('rating', 'Rating is required and must be between 1 and 5')
        .isInt({ min: 1, max: 5 })
    ]
  ],
  ratingController.addRating
);

// @route   GET api/ratings/product/:productId
// @desc    Get product ratings
// @access  Public
router.get('/product/:productId', ratingController.getProductRatings);

// @route   GET api/ratings/me
// @desc    Get current user's ratings
// @access  Private
router.get('/me', auth, ratingController.getMyRatings);

// @route   GET api/ratings
// @desc    Get all ratings (Admin)
// @access  Private/Admin
router.get('/', [auth, admin], ratingController.getAllRatings);

module.exports = router;
