const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du produit est requis'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Le prix du produit est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  stock: {
    type: Number,
    required: [true, 'La quantité en stock est requise'],
    min: [0, 'La quantité en stock ne peut pas être négative'],
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware pre-save pour mettre à jour la date de modification
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;