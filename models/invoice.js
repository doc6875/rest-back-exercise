const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'La quantité doit être d\'au moins 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Le prix ne peut pas être négatif']
  }
});

const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'ID de l\'utilisateur est requis']
  },
  items: {
    type: [invoiceItemSchema],
    required: [true, 'Au moins un article est requis'],
    validate: {
      validator: function(items) {
        return items.length > 0;
      },
      message: 'La facture doit contenir au moins un article'
    }
  },
  totalAmount: {
    type: Number,
    required: [true, 'Le montant total est requis'],
    min: [0, 'Le montant total ne peut pas être négatif']
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['pending', 'paid', 'cancelled'],
      message: 'Le statut doit être pending, paid ou cancelled'
    },
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  paymentDate: {
    type: Date
  }
});

// Middleware pre-save pour mettre à jour la date de modification
invoiceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;