const LoadProductServices = require('../services/LoadProductService');

module.exports = {
    async index(req, res) {
        try {
            const allProducts = await LoadProductServices.load('products');
            allProducts.map(product => {
                product.img = product.img.replace(/\\/g, '/');
            });
            const products = allProducts
            .filter((products, index) => index > 2 ? false : true);
            
            return res.render('home/index.njk', { products });
        } catch (err) {
            console.log(err);
        };
    },
};
