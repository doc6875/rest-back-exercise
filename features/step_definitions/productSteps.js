const { Given, When, Then } = require('@cucumber/cucumber');
const request = require('supertest');
const { expect } = require('chai');
const app = require('../../app');
const Product = require('../../models/product');

let response;
let productId;

// Background steps
Given('the API is running', function() {
  // This step is implicit since we're using supertest
});

Given('the database is clean', async function() {
  await Product.deleteMany({});
});

// Product-specific steps
Given('there are products in the database', async function() {
  await Product.create([
    { name: 'Product 1', description: 'Description 1', price: 19.99, stock: 100 },
    { name: 'Product 2', description: 'Description 2', price: 24.99, stock: 50 }
  ]);
});

Given('there are no products in the database', async function() {
  await Product.deleteMany({});
});

Given('there is a product with ID {string} in the database', async function(id) {
  const product = await Product.create({
    name: `Product ${id}`,
    description: `Description for product ${id}`,
    price: 19.99,
    stock: 100
  });
  productId = product._id;
});

Given('there is no product with ID {string} in the database', async function(id) {
  await Product.deleteMany({ _id: id });
});

// Request steps
When('I send a GET request to {string}', async function(url) {
  response = await request(app).get(url);
});

When('I send a POST request to {string} with the following data:', async function(url, data) {
  response = await request(app)
    .post(url)
    .send(JSON.parse(data))
    .set('Content-Type', 'application/json');
});

When('I send a PUT request to {string} with the following data:', async function(url, data) {
  response = await request(app)
    .put(url)
    .send(JSON.parse(data))
    .set('Content-Type', 'application/json');
});

When('I send a DELETE request to {string}', async function(url) {
  response = await request(app).delete(url);
});

// Response validation steps
Then('the response status code should be {int}', function(statusCode) {
  expect(response.status).to.equal(statusCode);
});

Then('the response should contain a list of products', function() {
  expect(response.body).to.be.an('array');
  expect(response.body.length).to.be.at.least(1);
  expect(response.body[0]).to.have.property('name');
  expect(response.body[0]).to.have.property('price');
});

Then('the response should contain an empty list', function() {
  expect(response.body).to.be.an('array');
  expect(response.body.length).to.equal(0);
});

Then('the response should contain the product details', function() {
  expect(response.body).to.be.an('object');
  expect(response.body).to.have.property('name');
  expect(response.body).to.have.property('description');
  expect(response.body).to.have.property('price');
  expect(response.body).to.have.property('stock');
});

Then('the response should contain an error message', function() {
  expect(response.body).to.have.property('message');
});

Then('the response should contain the created product details', function() {
  expect(response.body).to.be.an('object');
  expect(response.body).to.have.property('_id');
  expect(response.body).to.have.property('name');
  expect(response.body).to.have.property('description');
  expect(response.body).to.have.property('price');
  expect(response.body).to.have.property('stock');
});

Then('the product should be stored in the database', async function() {
  const productId = response.body._id;
  const product = await Product.findById(productId);
  expect(product).to.not.be.null;
  expect(product.name).to.equal(response.body.name);
});

Then('the response should contain validation errors', function() {
  expect(response.body).to.have.property('errors');
});

Then('the response should contain the updated product details', function() {
  expect(response.body).to.be.an('object');
  expect(response.body).to.have.property('_id');
  expect(response.body).to.have.property('name');
  expect(response.body).to.have.property('price');
  expect(response.body).to.have.property('stock');
});

Then('the product should be updated in the database', async function() {
  const product = await Product.findById(productId);
  expect(product).to.not.be.null;
  expect(product.price).to.equal(response.body.price);
  expect(product.stock).to.equal(response.body.stock);
});

Then('the response should contain a confirmation message', function() {
  expect(response.body).to.have.property('message');
  expect(response.body.message).to.include('success');
});

Then('the product should be removed from the database', async function() {
  const product = await Product.findById(productId);
  expect(product).to.be.null;
});