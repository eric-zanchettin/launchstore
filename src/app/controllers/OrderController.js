const LoadProductServices = require('../services/LoadProductService');
const LoadOrderService = require('../services/LoadOrderService');
const Users = require('../models/Users');
const Order = require('../models/Order');

const Cart = require('../../lib/cart');
const mailer = require('../../lib/mailer');

const email = (seller, product, buyer) => `
    <h2>Olá, ${seller.name}</h2>
    <p>Você possui um novo pedido de compra para o produto:</p>
    <p>${product.name} no preço de ${product.formattedPrice}</p>
    <p><br/><br/></p>
    <h3>Dados do Comprador:</h3>
    <p>Nome: ${buyer.name}</p>
    <p>E-mail: ${buyer.email}</p>
    <p>Endereço: ${buyer.address}</p>
    <p>${buyer.cep}</p>
    <p><br/><br/></p>
    <p><strong>Entre em contato com o vendedor para finalizar a sua venda!</strong></p>
    <p><br/><br/></p>
    <p>Atenciosamente, Equipe Launchstore.</p>
`

module.exports = {
    async index(req, res) {
        const orders = await LoadOrderService.load('orders', { where: { buyer_id: req.session.userId } });

        return res.render('users/orders/index.njk', { orders });
    },

    async sales(req, res) {
        const sales = await LoadOrderService.load('orders', { where: { seller_id: req.session.userId } });

        return res.render('users/orders/sales.njk', { sales });
    },

    async show(req, res) {
        const order = await LoadOrderService.load('order', {
            where: { id: req.params.id },
        });

        return res.render('users/orders/details.njk', { order });
    },

    async post(req, res) {
        try {
            // GET ALL PRODUCTS FROM CART
            const cart = Cart.init(req.session.cart);

            const buyer_id = req.session.userId;

            // BLOCKS THE SELLER FROM PURCHASING HIS OWN PRODUCT
            const filteredItems = cart.items.filter(item =>
                item.product.user_id != buyer_id                
            );

            // CREATES ORDER
            const createOrdersPromise = filteredItems.map(async item => {
                let { product, price: total, quantity, } = item;
                const { price, id: product_id, user_id: seller_id, } = product;
                const status = 'open';

                const order = await Order.create({
                    seller_id,
                    buyer_id,
                    product_id,
                    price,
                    quantity,
                    total,
                    status,
                });

                // GET ALL DATA FROM THE PRODUCT
                product = await LoadProductServices.load('product', {
                    where: {
                        id: product_id,
                    },
                });

                // GET DATA FROM SELLER
                const seller = await Users.findOne({
                    where: {
                        id: seller_id,
                    },
                });

                // GET DATA FROM BUYER
                const buyer = await Users.findOne({
                    where: {
                        id: buyer_id,
                    },
                });
                
                // SEND MAIL TO THE SELLER
                await mailer.sendMail({
                    to: seller.email,
                    from: 'no-reply@launchstore.com.br',
                    subject: 'Novo Pedido de Compra',
                    html: email(seller, product, buyer),
                });

                return order;
            });

            await Promise.all(createOrdersPromise);

            // CLEAN CART
            delete req.session.cart;
            Cart.init();
            
            // NOTIFY THE USER WITH SUCCESS/ERROR MESSAGE
            return res.render('users/orders/success.njk');
        } catch (err) {
            console.log(err);
            return res.render('users/orders/error.njk');
        };
    },

    async update(req, res) {
        try {
            const { id, action } = req.params;
            const acceptedActions = ['close', 'cancel'];

            if (!acceptedActions.includes(action)) return res.send(`Cannot perform this action.`);

            // GET ORDER
            const order = await Order.findOne({
                where: {
                    id,
                },
            });

            if (!order) return res.render('users/orders/sales.njk', { error: 'Pedido não encontrado!' });

            // CHECK IF THE ORDER IS REALLY OPEN
            if (order.status != 'open') return res.render('users/orders/sales.njk', { error: 'A ação não pode ser desempenhada!' });

            // UPDATES THE ORDER
            const statuses = {
                close: 'sold',
                cancel: 'cancelled',
            };

            order.status = statuses[action];

            await Order.update(id, {
                status: order.status,
            });

            // REDIRECTS
            return res.redirect('/orders/sales');

        } catch (err) {
            console.log(err);
        };
    },
};