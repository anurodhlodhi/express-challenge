const crypto = require("node:crypto");

const cartRepository = require("../db/repositories/carts");
const orderRepository = require("../db/repositories/orders");

function httpError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

function createOrder(sessionId, customerEmail) {
    if (typeof sessionId !== "string" || !sessionId) {
        throw httpError(400, "A valid session is required.");
    }

    let email = null;

    if (customerEmail !== undefined && customerEmail !== null &&
        customerEmail !== "") {
        if (
            typeof customerEmail !== "string" ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())
        ) {
            throw httpError(400, "A valid customer email is required.");
        }

        email = customerEmail.trim().toLowerCase();
    }

    const cart = cartRepository.getOrCreateCart(sessionId);

    const orderNumber =
        `FL-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    return orderRepository.createFromCart({
        cartId: cart.id,
        orderNumber,
        customerEmail: email,
    });
}

module.exports = {
    createOrder,
};

