const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

/**
 * Connecte à la base de données en mémoire pour les tests
 */
const connect = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  };

  await mongoose.connect(uri, mongooseOpts);
};

/**
 * Déconnecte de la base de données et arrête le serveur MongoDB en mémoire
 */
const close = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};

/**
 * Nettoie toutes les collections
 */
const clear = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

module.exports = { connect, close, clear };