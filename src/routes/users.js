const express = require('express');
const routes = express.Router();

const SessionController = require('../app/controllers/SessionController');
const UserController = require('../app/controllers/UserController');

const UserValidator = require('../app/validators/users');
const SessionValidator = require('../app/validators/session');

const { alreadyLogged, onlyUsers } = require('../app/middlewares/session');

// SESSION LOGIN-LOGOUT

routes.get('/login', alreadyLogged, SessionController.loginForm);
routes.post('/login', SessionValidator.login, SessionController.login);
routes.post('/logout', SessionController.logout);

// RESET-FORGOT PASSWORD

routes.get('/forgot-password', SessionController.forgotForm);
routes.post('/forgot-password', SessionValidator.forgot, SessionController.forgot);
routes.get('/password-reset', SessionController.resetForm);
routes.post('/password-reset', SessionValidator.reset, SessionController.reset);

// USER REGISTERING

routes.get('/register', UserController.registerForm);
routes.post('/register', UserValidator.post, UserController.post);

routes.get('/', onlyUsers, UserValidator.show, UserController.show);
routes.put('/', UserValidator.update, UserController.update);
routes.delete('/', UserController.delete);

// Anúncios do Usuário

routes.get('/ads', UserController.ads);

module.exports = routes;
