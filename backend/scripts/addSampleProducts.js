require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const sampleProducts = [
    {
        name: "Men's Classic T-Shirt",
        description: "Comfortable cotton t-shirt for everyday wear",
        price: 29.99,
        category: "men",
        image: "https://via.placeholder.com/300",
        stock: 100
    },
    {
        name: "Men's Denim Jeans",
        description: "Classic fit denim jeans",
        price: 59.99,
        category: "men",
        image: "https://via.placeholder.com/300",
        stock: 50
    },
    {
        name: "Women's Summer Dress",
        description: "Light and flowy summer dress",
        price: 49.99,
        category: "women",
        image: "https://via.placeholder.com/300",
        stock: 75
    },
    {
        name: "Women's Blouse",
        description: "Elegant blouse for any occasion",
        price: 39.99,
        category: "women",
        image: "https://via.placeholder.com/300",
        stock: 60
    }
];

async function addSampleProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Clear existing products
        await Product.deleteMany({});
        
        // Add new products
        await Product.insertMany(sampleProducts);
        
        console.log('Sample products added successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error adding sample products:', error);
        process.exit(1);
    }
}

addSampleProducts();
