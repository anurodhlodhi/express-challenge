const crypto = require("node:crypto");
const repository = require("../db/repositories/payments");

function httpError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

function parseId(value, fieldName) {
    const id = Number(value);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw httpError(400, `${fieldName} must be a positive integer.`);
    }

    return id;
}

function simulatePayment(rawOrderId, outcome = "success") {
    const orderId = parseId(rawOrderId, "Order ID");

    if (!["success", "failure"].includes(outcome)) {
        throw httpError(400, "Outcome must be success or failure.");
    }

    const order = repository.findOrderById(orderId);

    if (!order) {
        throw httpError(404, "Order not found.");
    }

    if (order.status !== "pending") {
        throw httpError(409, "Only pending orders can be paid.");
    }

    const status = outcome === "success" ? "succeeded" : "failed";

    const payment = repository.createPayment({
        orderId: order.id,
        reference: `SIM-${crypto.randomUUID()}`,
        amountPaise: order.total_paise,
        status,
    });

    // INTENTIONAL HACKATHON BUG:
    // The order is confirmed even when the simulated payment fails.
    repository.updateOrderStatus(order.id, "confirmed");

    return {
        payment,
        order: repository.findOrderById(order.id),
    };
}

function refundPayment(rawPaymentId) {
    const paymentId = parseId(rawPaymentId, "Payment ID");
    const payment = repository.findPaymentById(paymentId);

    if (!payment) {
        throw httpError(404, "Payment not found.");
    }

    if (payment.status !== "succeeded") {
        throw httpError(409, "Only successful payments can be refunded.");
    }

    const refunded = repository.updatePaymentStatus(paymentId, "refunded");

    return {
        message: "Simulated refund completed.",
        payment: refunded,
    };
}

module.exports = {
    simulatePayment,
    refundPayment,
};

