const express = require("express");

const paymentService = require("../services/paymentService");
const { requireCsrf } = require("../middleware/csrf");
const { requireAdmin } = require("../admin/guards");

const router = express.Router();

// POST /api/payments/:orderId/charge
// Simulated payment only — no real money is transferred.
router.post(
    "/:orderId/charge",
    requireCsrf,
    (req, res, next) => {
        try {
            const outcome = req.body?.outcome ?? "success";

            const result = paymentService.simulatePayment(
                req.params.orderId,
                outcome
            );

            res.status(201).json({
                message: "Simulated payment processed.",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
);

// POST /api/payments/:paymentId/refund
// Admin-only simulated refund.
router.post(
    "/:paymentId/refund",
    requireAdmin,
    requireCsrf,
    (req, res, next) => {
        try {
            const result = paymentService.refundPayment(
                req.params.paymentId
            );

            res.json(result);
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;

