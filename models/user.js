const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de l\'utilisateur est requis'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'L\'email de l\'utilisateur est requis'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Format d\'email invalide']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'admin'],
      message: 'Le rôle doit être user ou admin'
    },
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash le mot de passe avant de sauvegarder l'utilisateur
userSchema.pre('save', async function(next) {
  // Ne pas hacher le mot de passe s'il n'a pas été modifié
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Générer un sel
    const salt = await bcrypt.genSalt(10);
    
    // Hacher le mot de passe avec le sel
    this.password = await bcrypt.hash(this.password, salt);
    
    // Mettre à jour la date de modification
    this.updatedAt = Date.now();
    
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;