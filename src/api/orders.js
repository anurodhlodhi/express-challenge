const express = require("express");

const orderService = require("../services/orderService");
const { requireCsrf } = require("../middleware/csrf");

const router = express.Router();

// POST /api/orders
router.post("/", requireCsrf, (req, res, next) => {
    try {
        const order = orderService.createOrder(
            req.sessionID,
            req.body?.customer_email
        );

        res.status(201).json({
            message: "Order created successfully.",
            data: order,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

