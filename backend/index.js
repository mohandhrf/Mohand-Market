const express = require('express');
const cors = require('cors');
const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

const productsRouter = require('./routes/products');
const transactionsRouter = require('./routes/transactions');

app.use('/api/products', productsRouter);
app.use('/api/transactions', transactionsRouter);

app.listen(port, () => {
    console.log(`Serveur démarré sur http://127.0.0.1:${port}`);
});
