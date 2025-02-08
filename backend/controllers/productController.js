const Product = require('../models/Product');

exports.getProducts = (req, res) => {
    Product.getAll((err, products) => {
        if (err) return res.status(500).json({ message: err.message });
        res.status(200).json(products);
    });
};

exports.addProduct = (req, res) => {
    const { name, price, barcode } = req.body;
    Product.add({ name, price, barcode }, (err, product) => {
        if (err) return res.status(400).json({ message: err.message });
        res.status(201).json(product);
    });
};
