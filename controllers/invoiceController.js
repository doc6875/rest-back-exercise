const Invoice = require('../models/invoice');
const Product = require('../models/product');
const User = require('../models/user');

exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des factures', error: error.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la facture', error: error.message });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    // Valider les données
    const { userId, items, totalAmount, status } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ errors: { userId: 'Utilisateur non trouvé' } });
    }
    
    // Vérifier si les produits existent
    if (!items || items.length === 0) {
      return res.status(400).json({ errors: { items: 'Au moins un article est requis' } });
    }
    
    // Vérifier chaque produit
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ errors: { productId: `Produit avec l'ID ${item.productId} non trouvé` } });
      }
      if (item.quantity <= 0) {
        return res.status(400).json({ errors: { quantity: 'La quantité doit être supérieure à zéro' } });
      }
    }
    
    // Créer la facture
    const invoice = new Invoice({
      userId,
      items,
      totalAmount,
      status: status || 'pending'
    });
    
    const savedInvoice = await invoice.save();
    res.status(201).json(savedInvoice);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({ errors });
    }
    res.status(500).json({ message: 'Erreur lors de la création de la facture', error: error.message });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    // Vérifier si la facture existe
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }
    
    // Valider les données
    const { status, paymentDate } = req.body;
    
    // Mettre à jour la facture
    const updateData = {};
    
    if (status) {
      if (!['pending', 'paid', 'cancelled'].includes(status)) {
        return res.status(400).json({ errors: { status: 'Statut invalide. Utilisez pending, paid ou cancelled' } });
      }
      updateData.status = status;
    }
    
    if (status === 'paid' && !invoice.paymentDate) {
      updateData.paymentDate = paymentDate || new Date();
    }
    
    updateData.updatedAt = Date.now();
    
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json(updatedInvoice);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({ errors });
    }
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la facture', error: error.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }
    
    await Invoice.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Facture supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la facture', error: error.message });
  }
};