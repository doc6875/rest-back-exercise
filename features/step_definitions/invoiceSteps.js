const { Given, When, Then } = require('@cucumber/cucumber');
const request = require('supertest');
const { expect } = require('chai');
const app = require('../../app');
const Invoice = require('../../models/invoice');
const User = require('../../models/user');
const Product = require('../../models/product');

let response;
let invoiceId;

// User-specific steps
Given('there is a user with ID {string} in the database', async function(id) {
  await User.create({
    _id: id,
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedpassword'
  });
});

// Invoice-specific steps
Given('there are invoices in the database', async function() {
  await Invoice.create([
    {
      userId: '1',
      items: [
        { productId: '1', quantity: 2, price: 19.99 },
        { productId: '2', quantity: 1, price: 24.99 }
      ],
      totalAmount: 64.97,
      status: 'pending',
      createdAt: new Date()
    },
    {
      userId: '2',
      items: [
        { productId: '1', quantity: 1, price: 19.99 }
      ],
      totalAmount: 19.99,
      status: 'paid',
      createdAt: new Date(),
      paymentDate: new Date()
    }
  ]);
});

Given('there are no invoices in the database', async function() {
  await Invoice.deleteMany({});
});

Given('there is an invoice with ID {string} in the database', async function(id) {
  const invoice = await Invoice.create({
    userId: '1',
    items: [
      { productId: '1', quantity: 2, price: 19.99 },
      { productId: '2', quantity: 1, price: 24.99 }
    ],
    totalAmount: 64.97,
    status: 'pending',
    createdAt: new Date()
  });
  invoiceId = invoice._id;
});

Given('there is no invoice with ID {string} in the database', async function(id) {
  await Invoice.deleteMany({ _id: id });
});

// Response validation steps for invoices
Then('the response should contain a list of invoices', function() {
  expect(response.body).to.be.an('array');
  expect(response.body.length).to.be.at.least(1);
  expect(response.body[0]).to.have.property('userId');
  expect(response.body[0]).to.have.property('items');
  expect(response.body[0]).to.have.property('totalAmount');
  expect(response.body[0]).to.have.property('status');
});

Then('the response should contain the invoice details', function() {
  expect(response.body).to.be.an('object');
  expect(response.body).to.have.property('userId');
  expect(response.body).to.have.property('items');
  expect(response.body).to.have.property('totalAmount');
  expect(response.body).to.have.property('status');
});

Then('the response should contain the created invoice details', function() {
  expect(response.body).to.be.an('object');
  expect(response.body).to.have.property('_id');
  expect(response.body).to.have.property('userId');
  expect(response.body).to.have.property('items');
  expect(response.body).to.have.property('totalAmount');
  expect(response.body).to.have.property('status');
});

Then('the invoice should be stored in the database', async function() {
  const invoiceId = response.body._id;
  const invoice = await Invoice.findById(invoiceId);
  expect(invoice).to.not.be.null;
  expect(invoice.totalAmount).to.equal(response.body.totalAmount);
});

Then('the response should contain the updated invoice details', function() {
  expect(response.body).to.be.an('object');
  expect(response.body).to.have.property('_id');
  expect(response.body).to.have.property('status');
});

Then('the invoice should be updated in the database', async function() {
  const invoice = await Invoice.findById(invoiceId);
  expect(invoice).to.not.be.null;
  expect(invoice.status).to.equal(response.body.status);
});

Then('the invoice should be removed from the database', async function() {
  const invoice = await Invoice.findById(invoiceId);
  expect(invoice).to.be.null;
});