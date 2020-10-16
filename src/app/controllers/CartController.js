const Cart = require('../../lib/cart');
const LoadService = require('../services/LoadProductService');

module.exports = {
    async index(req, res) {
        try {
            
            let { cart } = req.session;

            // CALLS CART MANAGER AND INITIALIZES IT
            cart = Cart.init(cart);

            return res.render('cart/index.njk', { cart });

        } catch (err) {
            console.log(err);
        };
    },

    async addOne(req, res) {
        // GETS ID OF THE PRODUCT
        const { id } = req.params;

        // GETS PRODUCT BY req.params.id
        let product = await LoadService.load('product', { where: { id } });

        // GETS OLD CART FROM SESSION
        let { cart } = req.session;

        // USES THE OLD CART AND ADDS THE PRODUCT (UPDATING)
        cart = Cart.init(cart).addOne(product);

        // UPDATES SESSION CART
        req.session.cart = cart;

        res.render('cart/index.njk', { cart });
    },

    removeOne(req, res) {
        // GETS ID OF THE PRODUCT
        const { id } = req.params;

        // GETS OLD CART FROM SESSION
        let { cart } = req.session;

        // USES THE OLD CART AND REMOVES THE PRODUCT (UPDATING)
        cart = Cart.init(cart).removeOne(id);

        // UPDATES SESSION CART
        req.session.cart = cart;

        res.render('cart/index.njk', { cart });
    },

    delete(req, res) {
        let { cart } = req.session;
        let { id } = req.params;
        if (!cart) return;

        cart = Cart.init(cart).deleteAll(id);
        req.session.cart = cart;

        return res.redirect('/cart');
    },

};
