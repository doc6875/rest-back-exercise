const User = require('../models/user');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclure le mot de passe
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur', error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    // Valider les données
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        errors: { 
          name: name ? undefined : 'Le nom est requis',
          email: email ? undefined : 'L\'email est requis',
          password: password ? undefined : 'Le mot de passe est requis'
        } 
      });
    }
    
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ errors: { email: 'Cet email est déjà utilisé' } });
    }
    
    // Créer l'utilisateur
    const user = new User({
      name,
      email,
      password,
      role: role || 'user'
    });
    
    const savedUser = await user.save();
    
    // Exclure le mot de passe de la réponse
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({ errors });
    }
    res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    // Vérifier si l'utilisateur existe
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Valider les données
    const { name, email, password, role } = req.body;
    
    // Si l'email est modifié, vérifier qu'il n'existe pas déjà
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ errors: { email: 'Cet email est déjà utilisé' } });
      }
    }
    
    // Préparer les données à mettre à jour
    const updateData = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = password; // Le hachage sera fait par le middleware pre-save
    if (role && ['user', 'admin'].includes(role)) updateData.role = role;
    
    updateData.updatedAt = Date.now();
    
    // Mettre à jour l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json(updatedUser);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({ errors });
    }
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur', error: error.message });
  }
};