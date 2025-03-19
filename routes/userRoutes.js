const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/**
 * @route   GET /users
 * @desc    Récupérer tous les utilisateurs
 * @access  Private (Admin)
 */
router.get('/', userController.getAllUsers);

/**
 * @route   GET /users/:id
 * @desc    Récupérer un utilisateur par son ID
 * @access  Private
 */
router.get('/:id', userController.getUserById);

/**
 * @route   POST /users
 * @desc    Créer un nouvel utilisateur
 * @access  Public pour l'inscription, Private (Admin) pour la création d'autres utilisateurs
 */
router.post('/', userController.createUser);

/**
 * @route   PUT /users/:id
 * @desc    Mettre à jour un utilisateur
 * @access  Private
 */
router.put('/:id', userController.updateUser);

/**
 * @route   DELETE /users/:id
 * @desc    Supprimer un utilisateur
 * @access  Private (Admin)
 */
router.delete('/:id', userController.deleteUser);

module.exports = router;