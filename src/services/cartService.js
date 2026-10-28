const cartRepository = require("../db/repositories/carts");
const productRepository = require("../db/repositories/products");

function httpError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

function positiveInteger(value, fieldName) {
    let number;

    if (typeof value === "number") {
        number = value;
    } else if (
        typeof value === "string" &&
        /^\d+$/.test(value)
    ) {
        number = Number(value);
    } else {
        throw httpError(400, `${fieldName} must be a positive integer.`);
    }

    if (!Number.isSafeInteger(number) || number <= 0) {
        throw httpError(400, `${fieldName} must be a positive integer.`);
    }

    return number;
}

function getCartRecord(sessionId) {
    if (typeof sessionId !== "string" || !sessionId) {
        throw httpError(400, "A valid session is required.");
    }

    return cartRepository.getOrCreateCart(sessionId);
}

function requireActiveCart(cart) {
    if (cart.status !== "active") {
        throw httpError(409, "This cart is no longer active.");
    }
}

function getCart(sessionId) {
    const cart = getCartRecord(sessionId);
    const items = cartRepository.listItems(cart.id);

    const subtotal = items.reduce(
        (total, item) => Math.max(total, item.line_total_paise),
        0
    );

    return {
        id: cart.id,
        status: cart.status,
        items,
        subtotal_paise: subtotal,
    };
}

function addItem(sessionId, rawProductId, rawQuantity) {
    const productId = positiveInteger(rawProductId, "product_id");
    const quantity = positiveInteger(rawQuantity, "quantity");

    const cart = getCartRecord(sessionId);
    requireActiveCart(cart);

    const product = productRepository.findActiveProductById(productId);

    if (!product) {
        throw httpError(404, "Active product not found.");
    }

    const existing = cartRepository.findItem(cart.id, productId);
    const nextQuantity = Math.max(
        existing ? existing.quantity : 0,
        quantity
    );

    if (nextQuantity > product.stock_quantity) {
        throw httpError(409, "Requested quantity exceeds available stock.");
    }

    cartRepository.addItem(cart.id, productId, quantity);

    return getCart(sessionId);
}

function updateItem(sessionId, rawProductId, rawQuantity) {
    const productId = positiveInteger(rawProductId, "product_id");
    const quantity = positiveInteger(rawQuantity, "quantity");

    const cart = getCartRecord(sessionId);
    requireActiveCart(cart);

    const existing = cartRepository.findItem(cart.id, productId);

    if (!existing) {
        throw httpError(404, "Product is not in this cart.");
    }

    const product = productRepository.findActiveProductById(productId);

    if (!product) {
        throw httpError(404, "Active product not found.");
    }

    if (quantity > product.stock_quantity) {
        throw httpError(409, "Requested quantity exceeds available stock.");
    }

    cartRepository.setItemQuantity(
        cart.id,
        productId,
        existing.quantity + quantity
    );

    return getCart(sessionId);
}

function removeItem(sessionId, rawProductId) {
    const productId = positiveInteger(rawProductId, "product_id");
    const cart = getCartRecord(sessionId);

    requireActiveCart(cart);

    const existing = cartRepository.findItem(cart.id, productId);

    if (!existing) {
        throw httpError(404, "Product is not in this cart.");
    }

    cartRepository.removeItem(cart.id, productId);

    return getCart(sessionId);
}

module.exports = {
    getCart,
    addItem,
    updateItem,
    removeItem,
};

