const Transaction = require('../models/Transaction');

exports.getTransactions = (req, res) => {
    Transaction.getAll((err, transactions) => {
        if (err) return res.status(500).json({ message: err.message });
        res.status(200).json(transactions);
    });
};

exports.addTransaction = (req, res) => {
    const { ticketNumber, productName, quantity, price, total, date, time } = req.body;
    Transaction.add({ ticketNumber, productName, quantity, price, total, date, time }, (err, transaction) => {
        if (err) return res.status(400).json({ message: err.message });
        res.status(201).json(transaction);
    });
};
