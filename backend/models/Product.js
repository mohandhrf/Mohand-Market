const db = require('../config/db');

const Product = {
    getAll: (callback) => {
        db.all('SELECT * FROM products', [], (err, rows) => {
            if (err) return callback(err, null);
            callback(null, rows);
        });
    },
    add: (product, callback) => {
        db.run(
            'INSERT INTO products (name, price, barcode) VALUES (?, ?, ?)',
            [product.name, product.price, product.barcode],
            function (err) {
                if (err) return callback(err, null);
                callback(null, { id: this.lastID, ...product });
            }
        );
    },
};

module.exports = Product;
