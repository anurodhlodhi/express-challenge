const db = require("../connection");

const insertCart = db.prepare(`
    INSERT INTO carts (session_id)
    VALUES (?)
    ON CONFLICT(session_id) DO NOTHING
`);

const findCart = db.prepare(`
    SELECT id, session_id, status, created_at, updated_at
    FROM carts
    WHERE session_id = ?
`);

const listItems = db.prepare(`
    SELECT
        ci.product_id,
        ci.quantity,
        p.name,
        p.sku,
        p.price_paise,
        p.stock_quantity,
        p.active,
        ci.quantity * p.price_paise AS line_total_paise
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.cart_id = ?
    ORDER BY ci.id
`);

const findItem = db.prepare(`
    SELECT id, cart_id, product_id, quantity
    FROM cart_items
    WHERE cart_id = ? AND product_id = ?
`);

const insertOrIncrementItem = db.prepare(`
    INSERT INTO cart_items (cart_id, product_id, quantity)
    VALUES (?, ?, ?)
    ON CONFLICT(cart_id, product_id)
    DO UPDATE SET quantity = quantity + excluded.quantity
`);

const updateItemQuantity = db.prepare(`
    UPDATE cart_items
    SET quantity = ?
    WHERE cart_id = ? AND product_id = ?
`);

const deleteItem = db.prepare(`
    DELETE FROM cart_items
    WHERE cart_id = ? AND product_id = ?
`);

const updateCartTimestamp = db.prepare(`
    UPDATE carts
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
`);

function getOrCreateCart(sessionId) {
    insertCart.run(sessionId);

    const cart = findCart.get(sessionId);

    if (!cart) {
        throw new Error("Unable to create or retrieve cart.");
    }

    return cart;
}

function addItem(cartId, productId, quantity) {
    insertOrIncrementItem.run(cartId, productId, quantity);
    updateCartTimestamp.run(cartId);
}

function setItemQuantity(cartId, productId, quantity) {
    updateItemQuantity.run(quantity, cartId, productId);
    updateCartTimestamp.run(cartId);
}

function removeItem(cartId, productId) {
    const result = deleteItem.run(cartId, productId);
    updateCartTimestamp.run(cartId);
    return result.changes;
}

module.exports = {
    getOrCreateCart,
    listItems: (cartId) => listItems.all(cartId),
    findItem: (cartId, productId) => findItem.get(cartId, productId),
    addItem,
    setItemQuantity,
    removeItem,
};
