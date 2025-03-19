const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = chai;

const Invoice = require('../../models/invoice');
const User = require('../../models/user');
const Product = require('../../models/product');
const invoiceController = require('../../controllers/invoiceController');

chai.use(chaiHttp);

describe('Invoice Controller', () => {
  let req, res, statusStub, jsonStub;

  beforeEach(() => {
    statusStub = sinon.stub();
    jsonStub = sinon.stub();
    res = {
      status: statusStub,
      json: jsonStub
    };
    statusStub.returns(res);
    req = {
      params: {},
      body: {}
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getAllInvoices', () => {
    it('should return all invoices', async () => {
      const invoices = [
        { _id: '1', userId: '1', totalAmount: 50 },
        { _id: '2', userId: '2', totalAmount: 100 }
      ];
      sinon.stub(Invoice, 'find').resolves(invoices);

      await invoiceController.getAllInvoices(req, res);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledWith(invoices)).to.be.true;
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      sinon.stub(Invoice, 'find').rejects(error);

      await invoiceController.getAllInvoices(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWithMatch({ message: 'Erreur lors de la récupération des factures' })).to.be.true;
    });
  });

  describe('getInvoiceById', () => {
    it('should return an invoice by ID', async () => {
      const invoice = { _id: '1', userId: '1', totalAmount: 50 };
      sinon.stub(Invoice, 'findById').resolves(invoice);
      req.params.id = '1';

      await invoiceController.getInvoiceById(req, res);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledWith(invoice)).to.be.true;
    });

    it('should return 404 if invoice not found', async () => {
      sinon.stub(Invoice, 'findById').resolves(null);
      req.params.id = '999';

      await invoiceController.getInvoiceById(req, res);

      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWithMatch({ message: 'Facture non trouvée' })).to.be.true;
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      sinon.stub(Invoice, 'findById').rejects(error);
      req.params.id = '1';

      await invoiceController.getInvoiceById(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWithMatch({ message: 'Erreur lors de la récupération de la facture' })).to.be.true;
    });
  });

  describe('createInvoice', () => {
    it('should create a new invoice', async () => {
      const invoiceData = {
        userId: '1',
        items: [
          { productId: '1', quantity: 2, price: 10 },
          { productId: '2', quantity: 1, price: 20 }
        ],
        totalAmount: 40,
        status: 'pending'
      };
      const savedInvoice = { _id: '3', ...invoiceData };
      
      sinon.stub(User, 'findById').resolves({ _id: '1', name: 'User 1' });
      sinon.stub(Product, 'findById').resolves({ _id: '1', name: 'Product 1', price: 10 });
      sinon.stub(Invoice.prototype, 'save').resolves(savedInvoice);
      
      req.body = invoiceData;

      await invoiceController.createInvoice(req, res);

      expect(statusStub.calledWith(201)).to.be.true;
      expect(jsonStub.calledWith(savedInvoice)).to.be.true;
    });

    it('should return 400 if user not found', async () => {
      sinon.stub(User, 'findById').resolves(null);
      
      req.body = {
        userId: '999',
        items: [{ productId: '1', quantity: 1 }],
        totalAmount: 10
      };

      await invoiceController.createInvoice(req, res);

      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledWithMatch({ errors: { userId: 'Utilisateur non trouvé' } })).to.be.true;
    });

    it('should return 400 if items are empty', async () => {
      req.body = {
        userId: '1',
        items: [],
        totalAmount: 0
      };

      await invoiceController.createInvoice(req, res);

      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledWithMatch({ errors: { items: 'Au moins un article est requis' } })).to.be.true;
    });

    it('should return 400 if product not found', async () => {
      sinon.stub(User, 'findById').resolves({ _id: '1', name: 'User 1' });
      sinon.stub(Product, 'findById').resolves(null);
      
      req.body = {
        userId: '1',
        items: [{ productId: '999', quantity: 1 }],
        totalAmount: 10
      };

      await invoiceController.createInvoice(req, res);

      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledWithMatch({ errors: { productId: 'Produit avec l\'ID 999 non trouvé' } })).to.be.true;
    });
  });

  describe('updateInvoice', () => {
    it('should update an existing invoice', async () => {
      const invoice = { 
        _id: '1', 
        userId: '1', 
        totalAmount: 50, 
        status: 'pending',
        paymentDate: null
      };
      const updatedInvoice = { 
        ...invoice, 
        status: 'paid',
        paymentDate: new Date()
      };
      
      sinon.stub(Invoice, 'findById').resolves(invoice);
      sinon.stub(Invoice, 'findByIdAndUpdate').resolves(updatedInvoice);
      
      req.params.id = '1';
      req.body = { status: 'paid' };

      await invoiceController.updateInvoice(req, res);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledWith(updatedInvoice)).to.be.true;
    });

    it('should return 404 if invoice not found', async () => {
      sinon.stub(Invoice, 'findById').resolves(null);
      
      req.params.id = '999';
      req.body = { status: 'paid' };

      await invoiceController.updateInvoice(req, res);

      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWithMatch({ message: 'Facture non trouvée' })).to.be.true;
    });

    it('should return 400 if status is invalid', async () => {
      const invoice = { _id: '1', userId: '1', totalAmount: 50, status: 'pending' };
      
      sinon.stub(Invoice, 'findById').resolves(invoice);
      
      req.params.id = '1';
      req.body = { status: 'invalid_status' };

      await invoiceController.updateInvoice(req, res);

      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledWithMatch({ errors: { status: 'Statut invalide. Utilisez pending, paid ou cancelled' } })).to.be.true;
    });

    it('should handle validation errors', async () => {
      const invoice = { _id: '1', userId: '1', totalAmount: 50, status: 'pending' };
      
      const validationError = new mongoose.Error.ValidationError();
      validationError.errors = { status: { message: 'Status validation failed' } };
      
      sinon.stub(Invoice, 'findById').resolves(invoice);
      sinon.stub(Invoice, 'findByIdAndUpdate').rejects(validationError);
      
      req.params.id = '1';
      req.body = { status: 'paid' };

      await invoiceController.updateInvoice(req, res);

      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledWithMatch({ errors: { status: 'Status validation failed' } })).to.be.true;
    });
  });

  describe('deleteInvoice', () => {
    it('should delete an existing invoice', async () => {
      const invoice = { _id: '1', userId: '1', totalAmount: 50 };
      
      sinon.stub(Invoice, 'findById').resolves(invoice);
      sinon.stub(Invoice, 'findByIdAndDelete').resolves();
      
      req.params.id = '1';

      await invoiceController.deleteInvoice(req, res);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledWithMatch({ message: 'Facture supprimée avec succès' })).to.be.true;
    });

    it('should return 404 if invoice not found', async () => {
      sinon.stub(Invoice, 'findById').resolves(null);
      
      req.params.id = '999';

      await invoiceController.deleteInvoice(req, res);

      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWithMatch({ message: 'Facture non trouvée' })).to.be.true;
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      
      sinon.stub(Invoice, 'findById').resolves({ _id: '1' });
      sinon.stub(Invoice, 'findByIdAndDelete').rejects(error);
      
      req.params.id = '1';

      await invoiceController.deleteInvoice(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWithMatch({ message: 'Erreur lors de la suppression de la facture' })).to.be.true;
    });
  });
});