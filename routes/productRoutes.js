const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

/**
 * @route   GET /products
 * @desc    Récupérer tous les produits
 * @access  Public
 */
router.get('/', productController.getAllProducts);

/**
 * @route   GET /products/:id
 * @desc    Récupérer un produit par son ID
 * @access  Public
 */
router.get('/:id', productController.getProductById);

/**
 * @route   POST /products
 * @desc    Créer un nouveau produit
 * @access  Private
 */
router.post('/', productController.createProduct);

/**
 * @route   PUT /products/:id
 * @desc    Mettre à jour un produit
 * @access  Private
 */
router.put('/:id', productController.updateProduct);

/**
 * @route   DELETE /products/:id
 * @desc    Supprimer un produit
 * @access  Private
 */
router.delete('/:id', productController.deleteProduct);

module.exports = router;