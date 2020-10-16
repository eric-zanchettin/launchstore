const Users = require('../models/Users');
const { compare } = require('bcryptjs');

function checkAllFields(body) {
    // CHECK IF ALL FIELDS WERE FILLED

    const keys = Object.keys(body);

    for (key of keys) {
        if (body[key] == '') {
            return {
                user: body,
                error: 'Por favor, preencha todos os campos antes de continuar.',
            };
        };
    }; 
};

async function post(req, res, next) {
    const fillAllFields = checkAllFields(req.body);
    
    if (fillAllFields) {
        return res.render('users/register', fillAllFields);
    };

    // CHECK IF EMAIL, CPF/CNPJ ALREADY EXISTS

    let {email, cpf_cnpj, password, passwordRepeat } = req.body;

    cpf_cnpj = cpf_cnpj.replace(/\D/g, '');

    const user = await Users.findOne({
        where: { email },
        or: { cpf_cnpj },
    });

    if (user) {
        return res.render('users/register', {
            user: req.body,
            error: 'Usuário já Cadastrado!',
        });
    };

    // CHECK IF PASSWORDS ARE MATCHING

    if (password != passwordRepeat) {
        return res.render('users/register', {
            user: req.body,
            error: 'As senhas digitadas não coincidem!'
        });
    };

    next();
};

async function show(req, res, next) {
    
    const { userId: id } = req.session;
    const user = await Users.findOne({ where: { id } });

    if (!user) {
        return res.render('users/register', {
            error: 'Usuário não Encontrado!',
        });
    };

    req.user = user;

    next();
};

async function update(req, res, next) {
    // ALL FIELDS

    const fillAllFields = checkAllFields(req.body);
    
    if (fillAllFields) {
        return res.render('users/index', fillAllFields);
    };

    // HAS PASSWORD

    const { id, password } = req.body;

    if (!password) {
        return res.render('users/index', {
            user: req.body,
            error: 'Informe sua senha para concluir a atualização do seu Cadastro!',
        });
    };

    // PASSWORD MATCHING

    const user = await Users.findOne({ where: { id } });

    const passed = await compare(password, user.password);

    if (!passed) {
        return res.render('users/index', {
            user: req.body,
            error: 'Senha Incorreta!',
        });
    };

    req.user = user;

    next();
};

module.exports = {
    post,
    show,
    update,
};