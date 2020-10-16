const { unlinkSync } = require('fs');
const { hash } = require('bcryptjs');

const Product = require('../models/Product');
const Users = require('../models/Users');
const LoadProductsService = require('../services/LoadProductService');

const { formatCpfCnpj, formatCep } = require('../../lib/utils');

module.exports = {
    registerForm(req, res) {

        return res.render('users/register');
    },

    async show(req, res) {
        try {
            const { user } = req;

            user.cpf_cnpj = formatCpfCnpj(user.cpf_cnpj);
            user.cep = formatCep(user.cep);
    
            return res.render('users/index', { user });   
        } catch (err) {
            console.error(err);
        };
    },

    async post(req, res) {
        try {
            let { name, email, password, cpf_cnpj, cep, address } = req.body;

            password = await hash(password, 8);
            cpf_cnpj.replace(/\D/g, '');
            cep = cep.replace(/\D/g, '');

            const userId = await Users.create({
                name,
                email,
                password,
                cpf_cnpj,
                cep,
                address,
            });

            req.session.userId = userId;
    
            return res.redirect('/users');  
        } catch (err) {
            console.error(err);
        };
    },

    async update(req, res) {
        const { user } = req

        try {
            let { name, email, cpf_cnpj, cep, address, } = req.body;

            cpf_cnpj = cpf_cnpj.replace(/\D/g, '');
            cep = cep.replace(/\D/g, '');

            await Users.update(user.id, {
                name,
                email,
                cpf_cnpj,
                cep,
                address,
            });

            return res.render('users/index', {
                user: req.body,
                success: 'Conta atualizada com sucesso!',
            });

        } catch(err) {
            console.error(err);
            return res.render('users/index', {
                error: 'Algo de errado ocorreu! Tente novamente mais tarde.',
            });
        };
    },

    async delete(req, res) {
        try {
            //GET ALL PRODUCTS REGISTERED ON THE USER'S ID
            const products = await Product.findAll({ where: { user_id: req.body.id } });
    
            // FROM THE OBTAINED PRODUCTS, GET ALL IMAGES' PATH
            const allFilesPromise = products.map(product =>
                Product.files(product.id));
    
            let promiseResults = await Promise.all(allFilesPromise);
            
            // DELETES THE USER
            await Users.delete(req.body.id);
            req.session.destroy();
            
            // REMOVES ALL IMAGE FILES FROM OUR SYSTEM
            promiseResults.map(files => {
                files.map(file => {
                    try {
                        unlinkSync(file.path);
                    } catch (err) {
                        console.error(err);
                    };
                });
            });

            return res.render('session/login', {
                success: 'Conta deletada com Sucesso!',
            });

        } catch (err) {
            console.error(err);
            return res.render('users/index', {
                error: 'Algum erro ocorreu ao tentar deletar seu usuário. Tente novamente mais tarde!',
            });
        };
    },

    async ads(req, res) {
        const products = await LoadProductsService.load('products', {
            where: {
                user_id: req.session.userId,
            },
        });

        return res.render('users/ads.njk', { products });
    },
};