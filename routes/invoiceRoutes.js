const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

/**
 * @route   GET /invoices
 * @desc    Récupérer toutes les factures
 * @access  Private
 */
router.get('/', invoiceController.getAllInvoices);

/**
 * @route   GET /invoices/:id
 * @desc    Récupérer une facture par son ID
 * @access  Private
 */
router.get('/:id', invoiceController.getInvoiceById);

/**
 * @route   POST /invoices
 * @desc    Créer une nouvelle facture
 * @access  Private
 */
router.post('/', invoiceController.createInvoice);

/**
 * @route   PUT /invoices/:id
 * @desc    Mettre à jour une facture
 * @access  Private
 */
router.put('/:id', invoiceController.updateInvoice);

/**
 * @route   DELETE /invoices/:id
 * @desc    Supprimer une facture
 * @access  Private
 */
router.delete('/:id', invoiceController.deleteInvoice);

module.exports = router;