const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const productRoutes = require('./routes/productRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Routes
app.use('/products', productRoutes);
app.use('/invoices', invoiceRoutes);
app.use('/users', userRoutes);

// Route par défaut
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API REST de FIBRUS' });
});

// Gestion des erreurs 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur', error: err.message });
});

// Configuration de la base de données
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fibrus', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connexion à MongoDB établie');
  } catch (error) {
    console.error('Erreur de connexion à MongoDB:', error.message);
    process.exit(1);
  }
};

connectDB();

module.exports = app;