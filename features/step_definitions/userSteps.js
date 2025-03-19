const { Given, When, Then } = require('@cucumber/cucumber');
const request = require('supertest');
const { expect } = require('chai');
const app = require('../../app');
const User = require('../../models/user');
const bcrypt = require('bcryptjs');

let response;
let userId;

// User-specific steps
Given('there are users in the database', async function() {
  // Hasher les mots de passe pour les tests
  const salt = await bcrypt.genSalt(10);
  const hashedPassword1 = await bcrypt.hash('password123', salt);
  const hashedPassword2 = await bcrypt.hash('password456', salt);
  
  await User.create([
    { name: 'User 1', email: 'user1@example.com', password: hashedPassword1, role: 'user' },
    { name: 'User 2', email: 'user2@example.com', password: hashedPassword2, role: 'admin' }
  ]);
});

Given('there are no users in the database', async function() {
  await User.deleteMany({});
});

Given('there is a user with ID {string} in the database', async function(id) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  
  const user = await User.create({
    name: `User ${id}`,
    email: `user${id}@example.com`,
    password: hashedPassword,
    role: 'user'
  });
  userId = user._id;
});

Given('there is no user with ID {string} in the database', async function(id) {
  await User.deleteMany({ _id: id });
});

Given('there is a user with email {string} in the database', async function(email) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  
  await User.create({
    name: 'Existing User',
    email: email,
    password: hashedPassword,
    role: 'user'
  });
});

Given('there is a user with ID {string} and email {string} in the database', async function(id, email) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  
  const user = await User.create({
    name: `User ${id}`,
    email: email,
    password: hashedPassword,
    role: 'user'
  });
  
  if (id === '1') {
    userId = user._id;
  }
});

// Response validation steps for users
Then('the response should contain a list of users', function() {
  expect(response.body).to.be.an('array');
  expect(response.body.length).to.be.at.least(1);
  expect(response.body[0]).to.have.property('name');
  expect(response.body[0]).to.have.property('email');
  expect(response.body[0]).to.have.property('role');
});

Then('the response should contain the user details', function() {
  expect(response.body).to.be.an('object');
  expect(response.body).to.have.property('name');
  expect(response.body).to.have.property('email');
  expect(response.body).to.have.property('role');
});

Then('the response should not contain the user password', function() {
  expect(response.body).to.not.have.property('password');
});

Then('the response should contain the created user details', function() {
  expect(response.body).to.be.an('object');
  expect(response.body).to.have.property('_id');
  expect(response.body).to.have.property('name');
  expect(response.body).to.have.property('email');
  expect(response.body).to.have.property('role');
});

Then('the user should be stored in the database', async function() {
  const userId = response.body._id;
  const user = await User.findById(userId);
  expect(user).to.not.be.null;
  expect(user.name).to.equal(response.body.name);
  expect(user.email).to.equal(response.body.email);
});

Then('the user should be updated in the database', async function() {
  const user = await User.findById(userId);
  expect(user).to.not.be.null;
  
  if (response.body.name) {
    expect(user.name).to.equal(response.body.name);
  }
  
  if (response.body.email) {
    expect(user.email).to.equal(response.body.email);
  }
  
  if (response.body.role) {
    expect(user.role).to.equal(response.body.role);
  }
});

Then('the user should be removed from the database', async function() {
  const user = await User.findById(userId);
  expect(user).to.be.null;
});