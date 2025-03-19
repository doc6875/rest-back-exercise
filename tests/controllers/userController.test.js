const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = chai;

const User = require('../../models/user');
const userController = require('../../controllers/userController');

chai.use(chaiHttp);

describe('User Controller', () => {
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

  describe('getAllUsers', () => {
    it('should return all users without passwords', async () => {
      const users = [
        { _id: '1', name: 'User 1', email: 'user1@example.com', role: 'user' },
        { _id: '2', name: 'User 2', email: 'user2@example.com', role: 'admin' }
      ];
      
      const selectStub = sinon.stub().returns(users);
      sinon.stub(User, 'find').returns({ select: selectStub });

      await userController.getAllUsers(req, res);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledWith(users)).to.be.true;
      expect(selectStub.calledWith('-password')).to.be.true;
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      sinon.stub(User, 'find').throws(error);

      await userController.getAllUsers(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWithMatch({ message: 'Erreur lors de la récupération des utilisateurs' })).to.be.true;
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID without password', async () => {
      const user = { _id: '1', name: 'User 1', email: 'user1@example.com', role: 'user' };
      
      const selectStub = sinon.stub().returns(user);
      sinon.stub(User, 'findById').returns({ select: selectStub });
      
      req.params.id = '1';

      await userController.getUserById(req, res);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledWith(user)).to.be.true;
      expect(selectStub.calledWith('-password')).to.be.true;
    });

    it('should return 404 if user not found', async () => {
      const selectStub = sinon.stub().returns(null);
      sinon.stub(User, 'findById').returns({ select: selectStub });
      
      req.params.id = '999';

      await userController.getUserById(req, res);

      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWithMatch({ message: 'Utilisateur non trouvé' })).to.be.true;
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      sinon.stub(User, 'findById').throws(error);
      
      req.params.id = '1';

      await userController.getUserById(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWithMatch({ message: 'Erreur lors de la récupération de l\'utilisateur' })).to.be.true;
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'user'
      };
      
      const savedUser = {
        _id: '3',
        ...userData,
        toObject: () => ({ _id: '3', ...userData })
      };
      
      sinon.stub(User, 'findOne').resolves(null);
      sinon.stub(User.prototype, 'save').resolves(savedUser);
      
      req.body = userData;

      await userController.createUser(req, res);

      expect(statusStub.calledWith(201)).to.be.true;
      const responseUser = jsonStub.args[0][0];
      expect(responseUser).to.have.property('name', 'New User');
      expect(responseUser).to.have.property('email', 'newuser@example.com');
      expect(responseUser).to.not.have.property('password');
    });

    it('should return 400 if required fields are missing', async () => {
      req.body = { name: 'New User' };

      await userController.createUser(req, res);

      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.args[0][0].errors).to.have.property('email');
      expect(jsonStub.args[0][0].errors).to.have.property('password');
    });

    it('should return 400 if email already exists', async () => {
      sinon.stub(User, 'findOne').resolves({ _id: '1', email: 'existing@example.com' });
      
      req.body = {
        name: 'New User',
        email: 'existing@example.com',
        password: 'password123'
      };

      await userController.createUser(req, res);

      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledWithMatch({ errors: { email: 'Cet email est déjà utilisé' } })).to.be.true;
    });

    it('should handle validation errors', async () => {
      const validationError = new mongoose.Error.ValidationError();
      validationError.errors = { email: { message: 'Format d\'email invalide' } };
      
      sinon.stub(User, 'findOne').resolves(null);
      sinon.stub(User.prototype, 'save').rejects(validationError);
      
      req.body = {
        name: 'New User',
        email: 'invalid-email',
        password: 'password123'
      };

      await userController.createUser(req, res);

      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledWithMatch({ errors: { email: 'Format d\'email invalide' } })).to.be.true;
    });
  });

  describe('updateUser', () => {
    it('should update an existing user', async () => {
      const user = {
        _id: '1',
        name: 'Original Name',
        email: 'original@example.com',
        role: 'user'
      };
      
      const updatedUser = {
        ...user,
        name: 'Updated Name',
        email: 'updated@example.com'
      };
      
      sinon.stub(User, 'findById').resolves(user);
      sinon.stub(User, 'findOne').resolves(null);
      
      const selectStub = sinon.stub().returns(updatedUser);
      sinon.stub(User, 'findByIdAndUpdate').returns({ select: selectStub });
      
      req.params.id = '1';
      req.body = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      await userController.updateUser(req, res);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledWith(updatedUser)).to.be.true;
      expect(selectStub.calledWith('-password')).to.be.true;
    });

    it('should return 404 if user not found', async () => {
      sinon.stub(User, 'findById').resolves(null);
      
      req.params.id = '999';
      req.body = { name: 'Updated Name' };

      await userController.updateUser(req, res);

      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWithMatch({ message: 'Utilisateur non trouvé' })).to.be.true;
    });

    it('should return 400 if email already exists', async () => {
      sinon.stub(User, 'findById').resolves({
        _id: '1',
        name: 'Original Name',
        email: 'original@example.com'
      });
      
      sinon.stub(User, 'findOne').resolves({
        _id: '2',
        email: 'existing@example.com'
      });
      
      req.params.id = '1';
      req.body = { email: 'existing@example.com' };

      await userController.updateUser(req, res);

      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledWithMatch({ errors: { email: 'Cet email est déjà utilisé' } })).to.be.true;
    });
  });

  describe('deleteUser', () => {
    it('should delete an existing user', async () => {
      sinon.stub(User, 'findById').resolves({ _id: '1', name: 'User 1' });
      sinon.stub(User, 'findByIdAndDelete').resolves();
      
      req.params.id = '1';

      await userController.deleteUser(req, res);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledWithMatch({ message: 'Utilisateur supprimé avec succès' })).to.be.true;
    });

    it('should return 404 if user not found', async () => {
      sinon.stub(User, 'findById').resolves(null);
      
      req.params.id = '999';

      await userController.deleteUser(req, res);

      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWithMatch({ message: 'Utilisateur non trouvé' })).to.be.true;
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      
      sinon.stub(User, 'findById').resolves({ _id: '1' });
      sinon.stub(User, 'findByIdAndDelete').rejects(error);
      
      req.params.id = '1';

      await userController.deleteUser(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWithMatch({ message: 'Erreur lors de la suppression de l\'utilisateur' })).to.be.true;
    });
  });
});