const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Route pour ajouter des transactions
router.post('/', (req, res) => {
    const transactions = req.body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
        return res.status(400).json({ message: "Les transactions doivent être un tableau non vide." });
    }

    const query = `
        INSERT INTO transactions (ticketNumber, productName, quantity, price, total, date, time)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    let errors = [];
    transactions.forEach(transaction => {
        db.run(query, [
            transaction.ticketNumber,
            transaction.productName,
            transaction.quantity,
            transaction.price,
            transaction.total,
            transaction.date,
            transaction.time
        ], function (err) {
            if (err) {
                errors.push(err.message);
            }
        });
    });

    if (errors.length > 0) {
        console.error("Erreurs lors de l'ajout des transactions:", errors);
        return res.status(500).json({ message: "Erreur lors de l'ajout des transactions.", errors });
    }

    res.status(201).json({ message: "Transactions ajoutées avec succès." });
});

// Route pour récupérer toutes les transactions
router.get('/', (req, res) => {
    const query = `SELECT * FROM transactions ORDER BY id DESC`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("Erreur lors de la récupération des transactions:", err.message);
            return res.status(500).json({ message: "Erreur lors de la récupération des transactions." });
        }
        res.status(200).json(rows);
    });
});

module.exports = router;
