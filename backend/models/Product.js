const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    enum: ['men', 'women'],
    required: true,
  },
  image: {
    data: {
      type: String,  // base64 encoded image data
      required: true
    },
    contentType: {
      type: String,  // e.g., 'image/jpeg', 'image/png'
      required: true
    },
    alt: {
      type: String,
      default: ''
    }
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  keywords: {
    type: [String],
    default: [],
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
