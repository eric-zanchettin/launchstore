const { formatPrice } = require('./utils');

const Cart = {
    init(oldCart) {
        if (oldCart) {
            this.items = oldCart.items;
            this.total = oldCart.total;
        } else {
            this.items = [];
            this.total = {
                quantity: 0,
                price: 0,
                formattedPrice: formatPrice(0),
            };
        };

        return this;
    },

    addOne(product) {
        // IF IN CART
        let inCart = this.getProduct(product.id);
        
        // IF NOT IN CART
        if (!inCart) {
            inCart = {
                product: {
                    ...product,
                    formattedPrice: formatPrice(product.price),
                },
                quantity: 0,
                price: 0,
                formattedPrice: formatPrice(0),
            };
            
            this.items.push(inCart);
        };

        // IF inCart QUANTITY EXCEEDS PRODUCT QUANTITY
        if (inCart.quantity >= product.quantity) return this;
    
        // UPDATES inCart
        inCart.quantity++;
        inCart.price = inCart.product.price * inCart.quantity;
        inCart.formattedPrice = formatPrice(inCart.price);

        // UPDATES this [Object]
        this.total.quantity++;
        this.total.price += inCart.product.price;
        this.total.formattedPrice = formatPrice(this.total.price);

        return this;
    },

    removeOne(productId) {
        let inCart = this.getProduct(productId);

        if (!inCart) return this;

        inCart.quantity--;
        inCart.price = inCart.product.price * inCart.quantity;
        inCart.formattedPrice = formatPrice(inCart.price);

        this.total.quantity--;
        this.total.price -= inCart.product.price;
        this.total.formattedPrice = formatPrice(this.total.price);

        if (inCart.quantity < 1) {
            this.items = this.items.filter(item => item.product.id != productId);
        };

        return this;
    },

    deleteAll(productId) {
        let inCart = this.getProduct(productId);

        if (!inCart) return this;

        if (this.items.length > 0) {
            this.total.quantity -= inCart.quantity;
            this.total.price -= (inCart.product.price * inCart.quantity);
            this.total.formattedPrice = formatPrice(this.total.price);
        };

        this.items = this.items.filter(item => item.product.id != productId);

        return this;
    },

    getProduct(productId) {
        let inCart = this.items.find(item => item.product.id == productId);
        return inCart;
    },
};

module.exports = Cart;

//  const product = {
//      id: 1,
//      price: 199,
//      quantity: 2,
//  };

//  const product2 = {
//      id: 2,
//      price: 100,
//      quantity: 2,
//  };

//  console.log('First Product');
//  let oldCart = Cart.init().addOne(product);
//  console.log(oldCart);

//  console.log('Second Product');
//  oldCart = Cart.init(oldCart).addOne(product);
//  console.log(oldCart);

//  console.log('Third Product');
//  oldCart = Cart.init(oldCart).addOne(product2);
//  console.log(oldCart);

//  console.log('Remove one Product');
//  oldCart = Cart.init(oldCart).removeOne(1);
//  console.log(oldCart);

//  console.log('Remove First Product');
//  oldCart = Cart.init(oldCart).deleteAll(1);
//  console.log(oldCart);