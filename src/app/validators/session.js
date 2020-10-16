const Users = require('../models/Users');
const { compare } = require('bcryptjs');

async function login(req, res, next) {
    const { email, password } = req.body;
    
    const user = await Users.findOne({ where: { email } });

    if (!user) {
        return res.render('session/login', {
            user: req.body,
            error: 'Usuário não Cadastrado!',
        });
    };

    const passed = await compare(password, user.password);

    if (!passed) {
        return res.render('session/login', {
            user: req.body,
            error: 'Senha Incorreta!',
        });
    };

    req.user = user;

    next();
};

async function forgot(req, res, next) {
    const { email } = req.body;

    try {
        let user = await Users.findOne({ where: { email } });

        if (!user) {
            return res.render('session/forgot-password', {
                user: req.body,
                error: 'E-mail não Cadastrado!',
            });
        };
    
        req.user = user;
    
        next();
    } catch(err) {
        console.error(err);
    };
};

async function reset(req, res, next) {
    const { email, password, passwordRepeat, token } = req.body;

    // SEARCH FOR THE CORRESPONDING USER    
    const user = await Users.findOne({ where: { email } });

    if (!user) {
        return res.render('session/password-reset', {
            user: req.body,
            token,
            error: 'Usuário não Cadastrado!',
        });
    };
 
    // CHECK IF PASSWORDS MATCH
    if (password != passwordRepeat) {
        return res.render('session/password-reset', {
            user: req.body,
            token,
            error: 'As senhas digitadas não coincidem!'
        });
    };

    // CHECK IF THE TOKEN IS CORRECT
    if (token != user.reset_token) {
        return res.render('session/password-reset', {
            user: req.body,
            token,
            error: 'Token Inválido. Solicite a Recuperação de Senha novamente para gerar um novo Token válido!',
        });
    };

    // CHECK IF TOKEN HASN'T EXPIRED
    let now = new Date();
    now = now.setHours(now.getHours());

    if (now > user.reset_token_expires) {
        return res.render('session/password-reset', {
            user: req.body,
            token,
            error: 'Sinto muito, parece que seu Token expirou ... Solicite a Recuperação de Senha novamente para gerar um novo Token!',
        });
    };

    req.user = user;
    
    next();
};

module.exports = {
    login,
    forgot,
    reset,
};
