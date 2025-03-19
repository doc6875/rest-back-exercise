const Product = require('../models/product');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des produits', error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du produit', error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    // Valider les données
    const { name, description, price, stock } = req.body;
    
    if (!name) {
      return res.status(400).json({ errors: { name: 'Le nom du produit est requis' } });
    }
    
    if (price === undefined || price < 0) {
      return res.status(400).json({ errors: { price: 'Le prix doit être un nombre positif' } });
    }
    
    // Créer le produit
    const product = new Product({
      name,
      description,
      price,
      stock: stock || 0
    });
    
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({ errors });
    }
    res.status(500).json({ message: 'Erreur lors de la création du produit', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    // Vérifier si le produit existe
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }
    
    // Valider les données
    const { name, description, price, stock } = req.body;
    
    if (price !== undefined && price < 0) {
      return res.status(400).json({ errors: { price: 'Le prix doit être un nombre positif' } });
    }
    
    if (stock !== undefined && stock < 0) {
      return res.status(400).json({ errors: { stock: 'Le stock doit être un nombre positif' } });
    }
    
    // Mettre à jour le produit
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        name: name || product.name,
        description: description !== undefined ? description : product.description,
        price: price !== undefined ? price : product.price,
        stock: stock !== undefined ? stock : product.stock,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    res.status(200).json(updatedProduct);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({ errors });
    }
    res.status(500).json({ message: 'Erreur lors de la mise à jour du produit', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du produit', error: error.message });
  }
};