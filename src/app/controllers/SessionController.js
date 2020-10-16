const Users = require('../models/Users');

const { hash } = require('bcryptjs');
const crypto = require('crypto');
const mailer = require('../../lib/mailer');

module.exports = {
    loginForm(req, res) {
        return res.render('session/login');
    },

    login(req, res) {
        req.session.userId = req.user.id;

        return res.redirect('/users');
    },
    
    logout(req, res) {
        req.session.destroy();
        return res.redirect('/');
    },

    forgotForm(req, res) {
        return res.render('session/forgot-password');
    },

    async forgot(req, res) {
        const user = req.user;

        // CREATING THE FORGOTTEN PASSWORD TOKEN
        const token = crypto.randomBytes(20).toString('hex');

        // DEFINE THE EXPIRATION DATE AND TIME FOR THE CREATED TOKEN
        let now = new Date();
        now = now.setHours(now.getHours() + 1);

        await Users.update(user.id, {
            reset_token: token,
            reset_token_expires: now,
        });

        // SEND AN EMAIL WITH THE LINK AND TOKEN FOR THE USER
        await mailer.sendMail({
            to: user.email,
            from: 'no-reply@launchstore.com.br',
            subject: 'Recuperação de Senha',
            html: `
            <h2>Perdeu a Chave?</h2>
            <p>Não se preocupe, clique no Link abaixo para recuperar a sua senha:</p>
            <p>
                <a href="http://localhost:3000/users/password-reset?token=${token}" target="_blank">Recuperar Senha</a>
            </p>
            `,
        });

        // INFORM THE USER THAT WE ALREADY SENT THE E-MAIL
        return res.render('session/forgot-password', {
            success: 'Enviamos um E-mail para Recuperar sua Senha',
        });
        
    },

    resetForm(req, res) {
        return res.render('session/password-reset', {
            token: req.query.token
        });
    },
    async reset(req, res) {
        const { user } = req;

        const { password, token } = req.body;

        try {
            // CREATES A NEW PASSWORD HASH
            const newPassword = await hash(password, 8);

            // UPDATES USER PASSWORD
            await Users.update(user.id, {
                password: newPassword,
                reset_token: '',
                reset_token_expires: '',
            });

            // NOTIFY USER THAT ITS PASSWORD HAS BEEN UPDATED AND REDIRECTS IT TO THE LOGIN PAGE
            return res.render('session/login', {
                user: req.body,
                success: 'Senha atualizada com Sucesso, faça Login com sua nova Senha.',
            });
            
        } catch (err) {
            console.error(err);
            return res.render('session/password-reset', {
                user: req.body,
                token,
                error: 'Erro Inesperado ... Tente novamente!'
            })            
        }

    },
};