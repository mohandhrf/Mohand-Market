const express = require('express');
const dotenv = require('dotenv');
const db = require('./config/database'); // Importez l'objet db
const cors = require('cors');

// Charger les variables d'environnement
dotenv.config();

// Initialiser Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/transactions', require('./routes/transactions'));

// Route de test
app.get('/', (req, res) => {
  res.send('Serveur fonctionnel !');
});

// Démarrer le serveur
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
