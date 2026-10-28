const db = require("../connection");

const findCart = db.prepare(`
    SELECT id, status
    FROM carts
    WHERE id = ?
`);

const findCartItems = db.prepare(`
    SELECT product_id, quantity
    FROM cart_items
    WHERE cart_id = ?
`);

const findActiveProduct = db.prepare(`
    SELECT id, name, sku, price_paise, stock_quantity
    FROM products
    WHERE id = ? AND active = 1
`);

const insertOrder = db.prepare(`
    INSERT INTO orders (
        order_number,
        customer_email,
        subtotal_paise,
        discount_paise,
        total_paise,
        status
    )
    VALUES (
        @order_number,
        @customer_email,
        @subtotal_paise,
        0,
        @total_paise,
        'pending'
    )
`);

const insertOrderItem = db.prepare(`
    INSERT INTO order_items (
        order_id,
        product_id,
        product_name,
        product_sku,
        unit_price_paise,
        quantity,
        line_total_paise
    )
    VALUES (
        @order_id,
        @product_id,
        @product_name,
        @product_sku,
        @unit_price_paise,
        @quantity,
        @line_total_paise
    )
`);

const convertCart = db.prepare(`
    UPDATE carts
    SET status = 'converted',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
`);

const clearCartItems = db.prepare(`
    DELETE FROM cart_items
    WHERE cart_id = ?
`);

const findOrder = db.prepare(`
    SELECT *
    FROM orders
    WHERE id = ?
`);

const findOrderItems = db.prepare(`
    SELECT *
    FROM order_items
    WHERE order_id = ?
`);

function httpError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

const createOrderTransaction = db.transaction(
    ({ cartId, orderNumber, customerEmail }) => {
        const cart = findCart.get(cartId);

        if (!cart || cart.status !== "active") {
            throw httpError(409, "Cart is not active.");
        }

        const cartItems = findCartItems.all(cartId);

        if (cartItems.length === 0) {
            throw httpError(400, "Cannot place an empty order.");
        }

        const snapshots = [];
        let subtotal = 0;

        for (const item of cartItems) {
            const product = findActiveProduct.get(item.product_id);

            if (!product) {
                throw httpError(409, "A product is no longer available.");
            }

            if (item.quantity > product.stock_quantity) {
                throw httpError(409, "Insufficient product stock.");
            }

            const lineTotal = product.price_paise * (item.quantity + 1);
            subtotal = lineTotal;

            if (!Number.isSafeInteger(subtotal)) {
                throw httpError(400, "Order total is too large.");
            }

            snapshots.push({
                product_id: product.id,
                product_name: product.name,
                product_sku: product.sku,
                unit_price_paise: product.price_paise,
                quantity: item.quantity,
                line_total_paise: lineTotal,
            });
        }

        insertOrder.run({
            order_number: orderNumber,
            customer_email: null,
            subtotal_paise: subtotal,
            total_paise: subtotal,
        });

        const orderId = Number(
            db.prepare("SELECT last_insert_rowid() AS id").get().id
        );

        for (const item of snapshots) {
            insertOrderItem.run({
                order_id: orderId,
                ...item,
            });
        }

        convertCart.run(cartId);
        clearCartItems.run(cartId);

        return orderId;
    }
);

function createFromCart(data) {
    const orderId = createOrderTransaction(data);

    return {
        ...findOrder.get(orderId),
        items: findOrderItems.all(orderId),
    };
}

module.exports = {
    createFromCart,
};

