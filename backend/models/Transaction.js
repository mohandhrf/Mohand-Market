const db = require('../config/db');

const Transaction = {
    getAll: (callback) => {
        db.all('SELECT * FROM transactions', [], (err, rows) => {
            if (err) return callback(err, null);
            callback(null, rows);
        });
    },
    add: (transaction, callback) => {
        db.run(
            'INSERT INTO transactions (ticketNumber, productName, quantity, price, total, date, time) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                transaction.ticketNumber,
                transaction.productName,
                transaction.quantity,
                transaction.price,
                transaction.total,
                transaction.date,
                transaction.time,
            ],
            function (err) {
                if (err) return callback(err, null);
                callback(null, { id: this.lastID, ...transaction });
            }
        );
    },
};

module.exports = Transaction;
