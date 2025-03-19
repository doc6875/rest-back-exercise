const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = chai;

const Product = require('../../models/product');
const productController = require('../../controllers/productController');

chai.use(chaiHttp);

describe('Product Controller', () => {
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

  describe('getAllProducts', () => {
    it('should return all products', async () => {
      const products = [
        { _id: '1', name: 'Product 1', price: 10 },
        { _id: '2', name: 'Product 2', price: 20 }
      ];
      sinon.stub(Product, 'find').resolves(products);

      await productController.getAllProducts(req, res);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledWith(products)).to.be.true;
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      sinon.stub(Product, 'find').rejects(error);

      await productController.getAllProducts(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWithMatch({ message: 'Erreur lors de la récupération des produits' })).to.be.true;
    });
  });

  describe('getProductById', () => {
    it('should return a product by ID', async () => {
      const product = { _id: '1', name: 'Product 1', price: 10 };
      sinon.stub(Product, 'findById').resolves(product);
      req.params.id = '1';

      await productController.getProductById(req, res);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledWith(product)).to.be.true;
    });

    it('should return 404 if product not found', async () => {
      sinon.stub(Product, 'findById').resolves(null);
      req.params.id = '999';

      await productController.getProductById(req, res);

      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWithMatch({ message: 'Produit non trouvé' })).to.be.true;
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      sinon.stub(Product, 'findById').rejects(error);
      req.params.id = '1';

      await productController.getProductById(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWithMatch({ message: 'Erreur lors de la récupération du produit' })).to.be.true;
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const productData = { name: 'New Product', description: 'Test', price: 15, stock: 10 };
      const savedProduct = { _id: '3', ...productData };
      
      const saveStub = sinon.stub().resolves(savedProduct);
      sinon.stub(Product.prototype, 'save').callsFake(saveStub);
      
      req.body = productData;

      await productController.createProduct(req, res);

      expect(statusStub.calledWith(201)).to.be.true;
      expect(jsonStub.calledWith(savedProduct)).to.be.true;
    });

    it('should return 400 if name is missing', async () => {
      req.body = { description: 'Test', price: 15 };

      await productController.createProduct(req, res);

      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledWithMatch({ errors: { name: 'Le nom du produit est requis' } })).to.be.true;
    });

    it('should return 400 if price is invalid', async () => {
      req.body = { name: 'New Product', price: -5 };

      await productController.createProduct(req, res);

      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledWithMatch({ errors: { price: 'Le prix doit être un nombre positif' } })).to.be.true;
    });

    it('should handle validation errors', async () => {
      const validationError = new mongoose.Error.ValidationError();
      validationError.errors = { name: { message: 'Name is required' } };
      
      sinon.stub(Product.prototype, 'save').rejects(validationError);
      
      req.body = { name: '', price: 15 };

      await productController.createProduct(req, res);

      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledWithMatch({ errors: { name: 'Name is required' } })).to.be.true;
    });
  });

  describe('updateProduct', () => {
    it('should update an existing product', async () => {
      const product = { _id: '1', name: 'Product 1', description: 'Old desc', price: 10, stock: 5 };
      const updatedProduct = { ...product, price: 15, stock: 10 };
      
      sinon.stub(Product, 'findById').resolves(product);
      sinon.stub(Product, 'findByIdAndUpdate').resolves(updatedProduct);
      
      req.params.id = '1';
      req.body = { price: 15, stock: 10 };

      await productController.updateProduct(req, res);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledWith(updatedProduct)).to.be.true;
    });

    it('should return 404 if product not found', async () => {
      sinon.stub(Product, 'findById').resolves(null);
      
      req.params.id = '999';
      req.body = { price: 15 };

      await productController.updateProduct(req, res);

      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWithMatch({ message: 'Produit non trouvé' })).to.be.true;
    });

    it('should return 400 if price is invalid', async () => {
      const product = { _id: '1', name: 'Product 1', price: 10 };
      
      sinon.stub(Product, 'findById').resolves(product);
      
      req.params.id = '1';
      req.body = { price: -5 };

      await productController.updateProduct(req, res);

      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledWithMatch({ errors: { price: 'Le prix doit être un nombre positif' } })).to.be.true;
    });
  });

  describe('deleteProduct', () => {
    it('should delete an existing product', async () => {
      const product = { _id: '1', name: 'Product 1', price: 10 };
      
      sinon.stub(Product, 'findById').resolves(product);
      sinon.stub(Product, 'findByIdAndDelete').resolves();
      
      req.params.id = '1';

      await productController.deleteProduct(req, res);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledWithMatch({ message: 'Produit supprimé avec succès' })).to.be.true;
    });

    it('should return 404 if product not found', async () => {
      sinon.stub(Product, 'findById').resolves(null);
      
      req.params.id = '999';

      await productController.deleteProduct(req, res);

      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWithMatch({ message: 'Produit non trouvé' })).to.be.true;
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      
      sinon.stub(Product, 'findById').resolves({ _id: '1' });
      sinon.stub(Product, 'findByIdAndDelete').rejects(error);
      
      req.params.id = '1';

      await productController.deleteProduct(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWithMatch({ message: 'Erreur lors de la suppression du produit' })).to.be.true;
    });
  });
});