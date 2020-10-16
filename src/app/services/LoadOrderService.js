const Order = require('../models/Order');
const Users = require('../models/Users');
const LoadProductServices = require('./LoadProductService');

const { formatPrice, date } = require('../../lib/utils');

async function format(order) {
    // BRINGS DETAILS FROM PRODUCT
    order.product = await LoadProductServices.load('productWithDeleted', {
        where: {
            id: order.product_id,
        },
    });

    // BRINGS DETAILS FROM BUYER
    order.buyer = await Users.findOne({ where: { id: order.buyer_id } });

    // BRINGS DETAILS FROM SELLER
    order.seller = await Users.findOne({ where: { id: order.seller_id } });

    // FORMATS PRICES
    order.formattedPrice = formatPrice(order.price);
    order.formattedTotal = formatPrice(order.total);

    // FORMATS STATUS
    const statuses = {
        open: 'Aberto',
        sold: 'Vendido',
        cancelled: 'Cancelado',
    };

    order.formattedStatus = statuses[order.status];

    // BRINGS THE "updated_at" FIELD AND FORMATS IT
    const updatedAt = date(order.updated_at);
    order.formattedUpdatedAt = `${order.formattedStatus} em ${updatedAt.day}/${updatedAt.month}/${updatedAt.year} às ${updatedAt.hour}h ${updatedAt.minutes}mins.`

    return order;
};

const LoadService = {
    async load(service, filter) {
        this.filter = filter;
        return this[service]();
    },

    async order() {
        try {      
            const order = await Order.findOne(this.filter);      
            return format(order);
        } catch (err) {
            console.error(err);
        };
    },

    async orders() {
        try {
            // GET ALL ORDERS FROM USER
            const orders = await Order.findAll(this.filter);

            const ordersPromise = orders.map(format);
            return Promise.all(ordersPromise);
        } catch (err) {
            console.log(err);
        }
    },
    format,
};

module.exports = LoadService;
