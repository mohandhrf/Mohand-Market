// Liste des produits avec leurs prix et codes-barres
const products = {
    "Pommes (1kg)": { price: 2.50, barcode: "1001" },
    "Bananes (1kg)": { price: 2.00, barcode: "1002" },
    "Oranges (1kg)": { price: 3.00, barcode: "1003" },
    "Fraises (500g)": { price: 4.50, barcode: "1004" },
    "Tomates (1kg)": { price: 3.20, barcode: "1005" },
    "Pommes de terre (2,5kg)": { price: 4.00, barcode: "1006" },
    "Oignons (1kg)": { price: 2.00, barcode: "1007" },
    "Steak haché (2x125g)": { price: 4.50, barcode: "1008" },
    "Blanc de poulet (2 filets)": { price: 5.00, barcode: "1009" },
    "Poisson frais (saumon 200g)": { price: 6.50, barcode: "1010" },
    "Lait (1L)": { price: 1.20, barcode: "1011" },
    "Beurre (250g)": { price: 3.00, barcode: "1012" },
    "Œufs (12)": { price: 3.50, barcode: "1013" },
    "Fromage râpé (200g)": { price: 2.80, barcode: "1014" },
    "Riz (1kg)": { price: 2.50, barcode: "1015" },
    "Pâtes (500g)": { price: 1.80, barcode: "1016" },
    "Sucre (1kg)": { price: 1.80, barcode: "1017" },
    "Huile d’olive (1L)": { price: 7.00, barcode: "1018" },
    "Eau minérale (6x1.5L)": { price: 4.00, barcode: "1019" },
    "Jus d’orange (1L)": { price: 3.50, barcode: "1020" },
    "Soda (1.5L)": { price: 2.80, barcode: "1021" },
    "Frites surgelées (1kg)": { price: 3.00, barcode: "1022" },
    "Pizza (surgelée)": { price: 4.50, barcode: "1023" },
    "Glace en pot (500mL)": { price: 4.50, barcode: "1024" },
    "Gel douche (250mL)": { price: 3.00, barcode: "1025" },
    "Shampooing (250mL)": { price: 3.50, barcode: "1026" },
    "Lessive (1,5L)": { price: 7.00, barcode: "1027" }
};

// Stockage centralisé des transactions
let transactions = [];

// Fonction pour basculer en mode sombre
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Appliquer le mode sombre au chargement
window.onload = () => {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
};

// Fonction pour récupérer les produits depuis le backend
async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:5000/api/products');
        const data = await response.json();
        console.log("Produits récupérés:", data);
        populateProductDropdown(data); // Remplir le menu déroulant avec les produits
    } catch (error) {
        console.error("Erreur lors de la récupération des produits:", error);
    }
}

// Fonction pour remplir le menu déroulant des produits
function populateProductDropdown(products) {
    const selectElements = document.querySelectorAll('#productTable tbody select');
    selectElements.forEach(select => {
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.name;
            option.textContent = product.name;
            select.appendChild(option);
        });
    });
}

// Fonction pour ajouter un produit via le backend
async function addProductToBackend(productName, productPrice, productBarcode) {
    try {
        const response = await fetch('http://127.0.0.1:8080/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: productName,
                price: productPrice,
                barcode: productBarcode
            }),
        });

        if (response.ok) {
            const result = await response.json();
            console.log("Produit ajouté:", result);

            // Ajouter le produit à la liste des produits dans le frontend
            products[productName] = {
                price: productPrice,
                barcode: productBarcode
            };

            showNotification(`${productName} ajouté avec succès.`);
            closeAddProductModal(); // Fermer la modale après ajout
            fetchProducts(); // Mettre à jour la liste des produits
        } else {
            let errorMessage = "Erreur inconnue.";
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (parseError) {
                console.error("Réponse invalide du backend:", parseError);
            }
            console.error("Erreur lors de l'ajout du produit:", errorMessage);
            alert(`Erreur: ${errorMessage}`);
        }
    } catch (error) {
        console.error("Erreur réseau:", error);
        alert("Erreur réseau. Veuillez réessayer.");
    }
}

// Fonction pour fermer la fenêtre modale
function closeAddProductModal() {
    document.getElementById('addProductModal').style.display = 'none';
}

// Fonction pour supprimer un produit via le backend
async function deleteProductFromBackend(barcode) {
    try {
        const response = await fetch(`http://localhost:5000/api/products/${barcode}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            console.log("Produit supprimé:", barcode);
            showNotification("Produit supprimé via le backend.");
        }
    } catch (error) {
        console.error("Erreur lors de la suppression du produit:", error);
    }
}

// Fonction pour ajouter une nouvelle ligne dans le tableau des produits
function addNewLine() {
    const table = document.getElementById('productTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    newRow.innerHTML = `
        <td><input type="text" placeholder="Code-barres" readonly></td>
        <td>
            <select onchange="updatePrice(this)">
                <option value="">Sélectionnez un produit</option>
            </select>
        </td>
        <td>€ 0.00</td>
        <td><input type="number" value="1" min="1" onchange="updateTotals()"></td>
        <td>€ 0.00</td>
        <td><button onclick="deleteRow(this)">🗑️ Supprimer</button></td>
    `;
    fetchProducts(); // Remplir le menu déroulant avec les produits
}

// Fonction pour supprimer une ligne spécifique
function deleteRow(button) {
    if (confirm("Voulez-vous vraiment supprimer cette ligne ?")) {
        const row = button.parentElement.parentElement;
        row.remove();
        updateTotals();
        showNotification("Produit supprimé.");
    }
}

// Fonction pour réinitialiser le tableau
function resetTable() {
    if (confirm("Voulez-vous vraiment réinitialiser le tableau ?")) {
        const table = document.getElementById('productTable').getElementsByTagName('tbody')[0];
        table.innerHTML = '';
        document.getElementById('totalGeneral').textContent = '€ 0.00';
        document.getElementById('amountGiven').value = '';
        document.getElementById('changeAmount').textContent = '€ 0.00';
        showNotification("Tableau réinitialisé.");
    }
}

// Fonction pour mettre à jour le prix après sélection d'un produit
function updatePrice(selectElement) {
    const row = selectElement.parentElement.parentElement;
    const productName = selectElement.value;
    const product = products.find(p => p.name === productName);
    if (product) {
        row.cells[0].querySelector('input').value = product.barcode; // Afficher le code-barres
        row.cells[2].textContent = `€ ${product.price.toFixed(2)}`;
        updateTotals();
        showNotification(`${productName} ajouté.`);
    } else {
        row.cells[0].querySelector('input').value = ''; // Vider le champ du code-barres
        row.cells[2].textContent = '€ 0.00';
    }
}

// Fonction pour mettre à jour les totaux
function updateTotals() {
    const rows = document.getElementById('productTable').getElementsByTagName('tbody')[0].rows;
    let totalGeneral = 0;
    for (let row of rows) {
        const price = parseFloat(row.cells[2].textContent.replace('€ ', '')) || 0;
        const quantity = parseFloat(row.cells[3].querySelector('input').value) || 0;
        const total = price * quantity;
        row.cells[4].textContent = `€ ${total.toFixed(2)}`;
        totalGeneral += total;
    }
    document.getElementById('totalGeneral').textContent = `€ ${totalGeneral.toFixed(2)}`;
    calculateChange();
}

// Fonction pour calculer la monnaie à restituer
function calculateChange() {
    const totalGeneral = parseFloat(document.getElementById('totalGeneral').textContent.replace('€ ', '')) || 0;
    const amountGiven = parseFloat(document.getElementById('amountGiven').value) || 0;
    const change = amountGiven - totalGeneral;
    document.getElementById('changeAmount').textContent = `€ ${change >= 0 ? change.toFixed(2) : '0.00'}`;
}

// Fonction pour imprimer le ticket
function printReceipt() {
    const totalGeneral = parseFloat(document.getElementById('totalGeneral').textContent.replace('€ ', '')) || 0;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const amountGiven = parseFloat(document.getElementById('amountGiven').value) || 0;
    const change = amountGiven - totalGeneral;
    const now = new Date();
    const formattedDate = now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = now.toLocaleTimeString('fr-FR');
    const ticketNumber = Math.floor(Math.random() * 1000000); // Numéro de ticket aléatoire

    // Récupérer les détails des produits achetés
    const rows = document.getElementById('productTable').getElementsByTagName('tbody')[0].rows;
    let productsDetails = `
<table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse; margin: 0 auto;">
    <thead>
        <tr>
            <th>Produit</th>
            <th>Prix unitaire (€)</th>
            <th>Quantité</th>
            <th>Total (€)</th>
        </tr>
    </thead>
    <tbody>
    `;
    for (let row of rows) {
        const productName = row.cells[1].querySelector('select')?.value || row.cells[1].textContent.trim();
        const quantity = parseFloat(row.cells[3].querySelector('input').value) || 0;
        const price = parseFloat(row.cells[2].textContent.replace('€ ', '')) || 0;
        const total = price * quantity;
        if (quantity > 0) {
            productsDetails += `
        <tr>
            <td>${productName}</td>
            <td>€ ${price.toFixed(2)}</td>
            <td>${quantity}</td>
            <td>€ ${total.toFixed(2)}</td>
        </tr>
            `;
        }
    }
    productsDetails += `
    </tbody>
</table>
    `;

    // Contenu du ticket
    const receiptContent = `
<h1 style="text-align: center;">🛒 MOHAND MARKET</h1>
<p style="text-align: center;"><strong>Adresse:</strong> cité 612, Sidi Ahmed Bejaia</p>
<p style="text-align: center;"><strong>Téléphone:</strong> 0123456789</p>
<p style="text-align: center;"><strong>Date:</strong> ${formattedDate}</p>
<p style="text-align: center;"><strong>Heure:</strong> ${formattedTime}</p>
<p style="text-align: center;"><strong>Numéro de ticket:</strong> #${ticketNumber}</p>
<h2 style="text-align: center;">Détails des achats:</h2>
${productsDetails}
<p style="text-align: center;"><strong>Sous-total:</strong> €${totalGeneral.toFixed(2)}</p>
<p style="text-align: center;"><strong>Total à payer:</strong> €${totalGeneral.toFixed(2)}</p>
<p style="text-align: center;"><strong>Mode de paiement:</strong> ${paymentMethod === "card" ? "💳 Carte bancaire" : "💵 Espèces"}</p>
${paymentMethod === "cash"
            ? `<p style="text-align: center;"><strong>Montant payé:</strong> €${amountGiven.toFixed(2)}</p>
               <p style="text-align: center;"><strong>Monnaie rendue:</strong> €${change >= 0 ? change.toFixed(2) : '0.00'}</p>`
            : ''
        }
<p style="text-align: center;">Merci de votre visite ! Nous espérons vous revoir bientôt.</p>
<p style="text-align: center;">À très bientôt dans notre magasin !</p>
    `;

    // Ouvrir une nouvelle fenêtre pour imprimer
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <h1 style="text-align: center;">Ticket de caisse</h1>
        ${receiptContent}
    `);
    printWindow.document.close();
    printWindow.print();
}

// Fonction pour scanner un code-barres (simulation)
function scanBarcode() {
    const barcode = prompt("Scannez ou entrez le code-barres du produit:");
    if (barcode) {
        const product = Object.keys(products).find(p => products[p].barcode === barcode);
        if (product) {
            const table = document.getElementById('productTable').getElementsByTagName('tbody')[0];
            const newRow = table.insertRow();
            newRow.innerHTML = `
                <td>${products[product].barcode}</td>
                <td>${product}</td>
                <td>€ ${products[product].price.toFixed(2)}</td>
                <td><input type="number" value="1" oninput="updateTotals()"></td>
                <td>€ ${products[product].price.toFixed(2)}</td>
                <td><button onclick="deleteRow(this)">🗑️ Supprimer</button></td>
            `;
            updateTotals();
            showNotification(`${product} ajouté via code-barres.`);
        } else {
            alert("Produit non trouvé !");
        }
    }
}

// Fonction pour gérer le mode de paiement
function updatePaymentMethod() {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const cashPaymentSection = document.getElementById('cash-payment');
    const changeAmountSection = document.getElementById('changeAmountDiv');
    if (paymentMethod === "card") {
        cashPaymentSection.style.display = "none";
        changeAmountSection.style.display = "none";
    } else {
        cashPaymentSection.style.display = "block";
        changeAmountSection.style.display = "block";
    }
}

// Fonction pour afficher des notifications
function showNotification(message) {
    const notificationsDiv = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.padding = '10px';
    notification.style.backgroundColor = '#4caf50';
    notification.style.color = '#fff';
    notification.style.borderRadius = '5px';
    notification.style.marginBottom = '10px';
    notification.style.animation = 'fadeOut 3s ease-in-out forwards';
    notificationsDiv.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
}

// Fonction pour mettre à jour la date et l'heure dynamiquement
function updateDateTime() {
    const currentDateElement = document.getElementById('currentDate');
    const currentTimeElement = document.getElementById('currentTime');
    const now = new Date();
    const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString('fr-FR', optionsDate);
    const formattedTime = now.toLocaleTimeString('fr-FR');
    currentDateElement.textContent = `📅 ${formattedDate}`;
    currentTimeElement.textContent = `⏰ ${formattedTime}`;
}

// Initialisation de la date et de l'heure
setInterval(updateDateTime, 1000);
updateDateTime();

// Ajout rapide d'un produit
async function addProductQuickly(productName) {
    const product = products[productName];
    if (!product) {
        alert("Produit non trouvé !");
        return;
    }

    const table = document.getElementById('productTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    newRow.innerHTML = `
        <td>${product.barcode}</td>
        <td>${productName}</td>
        <td>€ ${product.price.toFixed(2)}</td>
        <td><input type="number" value="1" min="1" oninput="updateTotals()"></td>
        <td>€ ${product.price.toFixed(2)}</td>
        <td><button onclick="deleteRow(this)">🗑️ Supprimer</button></td>
    `;
    updateTotals();
    showNotification(`${productName} ajouté rapidement.`);

    try {
        const response = await fetch('http://127.0.0.1:8080/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: productName,
                price: product.price,
                barcode: product.barcode
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log("Produit ajouté:", result);
            showNotification(`${productName} ajouté avec succès.`);
        } else {
            console.error("Erreur lors de l'ajout du produit:", response.statusText);
            alert("Erreur lors de l'ajout du produit.");
        }
    } catch (error) {
        console.error("Erreur réseau:", error);
        alert("Erreur réseau. Veuillez réessayer.");
    }
}

// Validation du paiement
async function validatePurchase() {
    const rows = document.getElementById('productTable').getElementsByTagName('tbody')[0].rows;
    const ticketNumber = Math.floor(Math.random() * 1000000);
    const now = new Date();

    let purchaseDetails = [];
    for (let row of rows) {
        const productName = row.cells[1].querySelector('select')?.value || row.cells[1].textContent.trim();
        const quantity = parseFloat(row.cells[3].querySelector('input').value) || 0;
        const price = parseFloat(row.cells[2].textContent.replace('€ ', '')) || 0;
        const total = price * quantity;

        if (quantity > 0) {
            purchaseDetails.push({
                ticketNumber,
                productName,
                quantity,
                price,
                total,
                date: now.toLocaleDateString('fr-FR'),
                time: now.toLocaleTimeString('fr-FR')
            });
        }
    }

    if (purchaseDetails.length > 0) {
        try {
            const response = await fetch('http://127.0.0.1:8080/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(purchaseDetails),
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Transactions enregistrées:", result);

                // Réinitialiser le tableau
                resetTable();

                // Afficher un message de succès avec le numéro du ticket
                alert(`Achat validé avec succès ! Numéro de ticket : #${ticketNumber}`);
            } else {
                let errorMessage = "Erreur inconnue.";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (parseError) {
                    console.error("Réponse invalide du backend:", parseError);
                }
                console.error("Erreur lors de l'enregistrement des transactions:", errorMessage);
                alert(`Erreur: ${errorMessage}`);
            }
        } catch (error) {
            console.error("Erreur réseau:", error);
            alert("Erreur réseau. Veuillez réessayer.");
        }
    } else {
        alert("Aucun produit sélectionné !");
    }
}

// Fonction pour désactiver les interactions après validation
function disableTableInteractions() {
    const table = document.getElementById('productTable').getElementsByTagName('tbody')[0];
    const rows = table.rows;

    // Désactiver tous les champs d'entrée et boutons
    for (let row of rows) {
        row.cells[1].querySelector('select').disabled = true; // Désactiver la liste déroulante
        row.cells[3].querySelector('input').disabled = true; // Désactiver l'input de quantité
        row.cells[5].querySelector('button').disabled = true; // Désactiver le bouton Supprimer
    }

    // Désactiver les boutons d'action principaux
    document.querySelector('.action-buttons').querySelectorAll('button').forEach(button => {
        button.disabled = true;
    });

    // Masquer le panneau flottant
    document.querySelector('.floating-summary').style.display = 'none';
}

// Fonction pour réinitialiser le tableau manuellement (optionnelle)
function resetTableManually() {
    if (confirm("Voulez-vous vraiment réinitialiser le tableau ?")) {
        const table = document.getElementById('productTable').getElementsByTagName('tbody')[0];
        table.innerHTML = '';
        document.getElementById('totalGeneral').textContent = '€ 0.00';
        document.getElementById('amountGiven').value = '';
        document.getElementById('changeAmount').textContent = '€ 0.00';

        // Réactiver les interactions
        enableTableInteractions();

        // Réafficher le panneau flottant
        document.querySelector('.floating-summary').style.display = 'block';

        showNotification("Tableau réinitialisé.");
    }
}

// Fonction pour réactiver les interactions
function enableTableInteractions() {
    const table = document.getElementById('productTable').getElementsByTagName('tbody')[0];
    const rows = table.rows;

    // Réactiver tous les champs d'entrée et boutons
    for (let row of rows) {
        row.cells[1].querySelector('select').disabled = false;
        row.cells[3].querySelector('input').disabled = false;
        row.cells[5].querySelector('button').disabled = false;
    }

    // Réactiver les boutons d'action principaux
    document.querySelector('.action-buttons').querySelectorAll('button').forEach(button => {
        button.disabled = false;
    });
}

// Sélectionner les éléments du DOM
const historyButton = document.getElementById('historyButton');
const historyModal = document.getElementById('historyModal');
const closeModal = document.querySelector('.close');
const historyTableBody = document.querySelector('#historyTable tbody');

// Ouvrir la fenêtre modale
historyButton.addEventListener('click', () => {
    // Effacer le contenu précédent du tableau
    historyTableBody.innerHTML = '';

    // Remplir le tableau avec les transactions
    if (transactions.length > 0) {
        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.ticketNumber}</td>
                <td>€ ${transaction.total.toFixed(2)}</td>
                <td>${transaction.date}</td>
                <td>${transaction.time}</td>
            `;
            historyTableBody.appendChild(row);
        });
    } else {
        // Si aucune transaction n'est disponible
        historyTableBody.innerHTML = `
            <tr>
                <td colspan="4">Aucun achat enregistré.</td>
            </tr>
        `;
    }

    // Afficher la fenêtre modale
    historyModal.style.display = 'flex';
});

// Fermer la fenêtre modale
closeModal.addEventListener('click', () => {
    historyModal.style.display = 'none';
});

// Fermer la fenêtre modale si l'utilisateur clique en dehors
window.addEventListener('click', (event) => {
    if (event.target === historyModal) {
        historyModal.style.display = 'none';
    }
});

// Sélectionner les éléments du DOM
const guideButton = document.getElementById('guideButton');
const guideModal = document.getElementById('guideModal');
const guideTableBody = document.querySelector('#guideTable tbody');

// Ouvrir la fenêtre modale
guideButton.addEventListener('click', () => {
    // Effacer le contenu précédent du tableau
    guideTableBody.innerHTML = '';

    // Remplir le tableau avec les produits et leurs informations
    Object.keys(products).forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product}</td>
            <td>€ ${products[product].price.toFixed(2)}</td>
            <td>${products[product].barcode}</td>
        `;
        guideTableBody.appendChild(row);
    });

    // Afficher la fenêtre modale
    guideModal.style.display = 'flex';
});

// Fermer la fenêtre modale
closeModal.addEventListener('click', () => {
    guideModal.style.display = 'none';
});

// Fermer la fenêtre modale si l'utilisateur clique en dehors
window.addEventListener('click', (event) => {
    if (event.target === guideModal) {
        guideModal.style.display = 'none';
    }
});

// Ouvrir la fenêtre modale
function openAddProductModal() {
    document.getElementById('addProductModal').style.display = 'flex';
}

// Fermer la fenêtre modale
function closeAddProductModal() {
    document.getElementById('addProductModal').style.display = 'none';
}

// Ajouter un produit via le backend
async function addProductToBackend() {
    const productName = document.getElementById('productName').value.trim();
    const productPrice = parseFloat(document.getElementById('productPrice').value);
    const productBarcode = document.getElementById('productBarcode').value.trim();

    if (!productName || !productPrice || !productBarcode) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    console.log("Nom du produit:", productName);
    console.log("Prix:", productPrice);
    console.log("Code-barres:", productBarcode);

    try {
        const response = await fetch('http://127.0.0.1:8080/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: productName,
                price: productPrice,
                barcode: productBarcode
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Réponse du serveur:", errorData);
            alert(`Erreur: ${errorData.message || "Erreur inconnue."}`);
            return;
        }

        const result = await response.json();
        console.log("Produit ajouté:", result);
        showNotification(`${productName} ajouté avec succès.`);
        closeAddProductModal(); // Fermer la modale après ajout
        fetchProducts(); // Mettre à jour la liste des produits
    } catch (error) {
        console.error("Erreur réseau:", error);
        alert("Erreur réseau. Veuillez réessayer.");
    }
}

// Fonction pour afficher l'historique des achats
async function showHistory() {
    try {
        const response = await fetch('http://127.0.0.1:8080/api/transactions');
        const transactions = await response.json();

        if (transactions.length === 0) {
            alert("Aucune transaction disponible.");
            return;
        }

        // Ouvrir une nouvelle fenêtre pour afficher l'historique
        const historyWindow = window.open('', '_blank');
        historyWindow.document.write(`
            <h1>Historique des Achats</h1>
            <table border="1">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Heure</th>
                        <th>Produit</th>
                        <th>Quantité</th>
                        <th>Prix Unit.</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactions.map(t => `
                        <tr>
                            <td>${t.date}</td>
                            <td>${t.time}</td>
                            <td>${t.productName}</td>
                            <td>${t.quantity}</td>
                            <td>€ ${t.price.toFixed(2)}</td>
                            <td>€ ${t.total.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `);
        historyWindow.document.close();
    } catch (error) {
        console.error("Erreur lors de la récupération de l'historique:", error);
        alert("Erreur réseau. Veuillez réessayer.");
    }
}