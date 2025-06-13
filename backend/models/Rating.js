const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: 500
  },
  images: [{
    type: String // URLs to review images
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add a compound index to ensure one rating per user per product per order
ratingSchema.index({ user: 1, product: 1, order: 1 }, { unique: true });

// Static method to get average rating for a product
ratingSchema.statics.getAverageRating = async function(productId) {
  const result = await this.aggregate([
    {
      $match: { product: productId }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  try {
    await this.model('Product').findByIdAndUpdate(productId, {
      rating: result[0] ? result[0].averageRating.toFixed(1) : 0,
      ratingCount: result[0]?.count || 0
    });
  } catch (err) {
    console.error('Error updating product rating:', err);
  }
};

// Call getAverageRating after save
ratingSchema.post('save', function() {
  this.constructor.getAverageRating(this.product);
});

// Call getAverageRating after remove
ratingSchema.post('remove', function() {
  this.constructor.getAverageRating(this.product);
});

module.exports = mongoose.model('Rating', ratingSchema);
