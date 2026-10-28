const db = require("../connection");

const findOrder = db.prepare(`
    SELECT id, order_number, total_paise, status
    FROM orders
    WHERE id = ?
`);

const insertPayment = db.prepare(`
    INSERT INTO payments (
        order_id,
        provider,
        reference,
        amount_paise,
        status
    )
    VALUES (?, 'simulated', ?, ?, ?)
`);

const findPayment = db.prepare(`
    SELECT *
    FROM payments
    WHERE id = ?
`);

const updatePaymentStatus = db.prepare(`
    UPDATE payments
    SET
        status = ?,
        updated_at = CURRENT_TIMESTAMP,
        refunded_at = CASE
            WHEN ? = 'refunded' THEN CURRENT_TIMESTAMP
            ELSE refunded_at
        END
    WHERE id = ?
`);

const updateOrderStatus = db.prepare(`
    UPDATE orders
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
`);

module.exports = {
    findOrderById: (id) => findOrder.get(id),

    createPayment({ orderId, reference, amountPaise, status }) {
        const result = insertPayment.run(
            orderId,
            reference,
            amountPaise,
            status
        );

        return findPayment.get(Number(result.lastInsertRowid));
    },

    findPaymentById: (id) => findPayment.get(id),

    updatePaymentStatus(id, status) {
        updatePaymentStatus.run(status, status, id);
        return findPayment.get(id);
    },

    updateOrderStatus: (id, status) => updateOrderStatus.run(status, id),
};

