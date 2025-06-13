const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const fs = require('fs');
const path = require('path');

// Get all products with optional search
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    const filter = q
      ? {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { keywords: { $regex: q, $options: 'i' } },
          ],
        }
      : {};
    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// Create product (admin only)
router.post('/', [auth, admin], async (req, res) => {
  try {
    const { image, ...rest } = req.body;
    
    // Validate image data
    if (!image || !image.data || !image.contentType) {
      return res.status(400).json({ message: 'Image data is required' });
    }

    // process keywords
    const processedKeywords = Array.isArray(rest.keywords)
      ? rest.keywords
      : (rest.keywords ? rest.keywords.split(',').map(k=>k.trim()).filter(Boolean) : []);

    // Create product with validated data
    const product = new Product({
      ...rest,
      keywords: processedKeywords,
      image: {
        data: image.data,
        contentType: image.contentType,
        alt: rest.name || ''
      }
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product' });
  }
});

// Update product (admin only)
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const { image, ...rest } = req.body;

    // Validate image data if provided
    if (image && (!image.data || !image.contentType)) {
      return res.status(400).json({ message: 'Invalid image data' });
    }

    const processedKeywordsUp = rest.keywords
      ? (Array.isArray(rest.keywords) ? rest.keywords : rest.keywords.split(',').map(k=>k.trim()).filter(Boolean))
      : undefined;

    const updateData = {
      ...rest,
      ...(processedKeywordsUp !== undefined && { keywords: processedKeywordsUp }),
      ...(image && {
        image: {
          data: image.data,
          contentType: image.contentType,
          alt: rest.name || ''
        }
      })
    };

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product' });
  }
});

// Delete product (admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product' });
  }
});

module.exports = router;
