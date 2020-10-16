const express = require('express');
const routes = express.Router();
const multer = require('../app/middlewares/multer');

const ProductController = require('../app/controllers/ProductController');
const SearchController = require('../app/controllers/SearchController');

const ProductValidator = require('../app/validators/products');

const { onlyUsers } = require('../app/middlewares/session');

// SEARCH

routes.get('/search', SearchController.index);

// PRODUCTS

routes.get('/create', onlyUsers, ProductController.create);
routes.get('/:id', ProductController.show);
routes.get('/:id/edit', onlyUsers, ProductController.edit);

routes.post('/', onlyUsers, multer.array("photos", 6), ProductValidator.post, ProductController.post);
routes.put('/', onlyUsers, multer.array("photos", 6), ProductValidator.put, ProductController.put);
routes.delete('/', onlyUsers, ProductController.delete);

module.exports = routes;
