const { BeforeAll, AfterAll, Before, After } = require('@cucumber/cucumber');
const db = require('../../config/database-test');

// Avant tous les tests
BeforeAll(async function() {
  console.log('Connecting to the in-memory database...');
  await db.connect();
});

// Après tous les tests
AfterAll(async function() {
  console.log('Disconnecting from the in-memory database...');
  await db.close();
});

// Avant chaque scénario
Before(async function() {
  await db.clear();
});

// Après chaque scénario
After(async function() {
  // Nettoyage supplémentaire si nécessaire
});