const sqlite3 = require('sqlite3').verbose();

// Créer ou ouvrir une base de données SQLite
const db = new sqlite3.Database('./mohand-market.db', (err) => {
    if (err) {
        console.error('Erreur lors de la connexion à la base de données SQLite:', err.message);
    } else {
        console.log('Connexion réussie à la base de données SQLite.');
        initializeDatabase();
    }
});

// Fonction pour initialiser les tables
function initializeDatabase() {
    db.serialize(() => {
        // Créer la table des produits
        db.run(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                barcode TEXT UNIQUE NOT NULL
            )
        `);

        // Créer la table des transactions
        db.run(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticketNumber INTEGER NOT NULL,
                productName TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                price REAL NOT NULL,
                total REAL NOT NULL,
                date TEXT NOT NULL,
                time TEXT NOT NULL
            )
        `);
    });
}

// Exporter l'objet db directement
module.exports = db;
