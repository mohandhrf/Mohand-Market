const express = require('express');
const cors = require('cors');
const productsRoute = require('./routes/products');
const transactionsRoute = require('./routes/transactions');

const app = express();
const PORT = 8080;

// Middleware
app.use(cors()); // Autoriser les requêtes CORS
app.use(express.json()); // Parser les requêtes JSON

// Routes
app.use('/api/products', productsRoute);
app.use('/api/transactions', transactionsRoute);

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://127.0.0.1:${PORT}`);
});
