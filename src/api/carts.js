const express = require("express");

const cartService = require("../services/cartService");
const { requireCsrf } = require("../middleware/csrf");

const router = express.Router();

// Ensure this browser session is saved.
router.use((req, res, next) => {
    req.session.cartInitialized = true;
    next();
});

// GET /api/carts
router.get("/", (req, res, next) => {
    try {
        res.json({
            data: cartService.getCart(req.sessionID),
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/carts/items
router.post("/items", requireCsrf, (req, res, next) => {
    try {
        const cart = cartService.addItem(
            req.sessionID,
            req.body?.product_id,
            req.body?.quantity
        );

        res.status(201).json({
            message: "Product added to cart.",
            data: cart,
        });
    } catch (error) {
        next(error);
    }
});

// PATCH /api/carts/items/:productId
router.patch("/items/:productId", requireCsrf, (req, res, next) => {
    try {
        const cart = cartService.updateItem(
            req.sessionID,
            req.params.productId,
            req.body?.quantity
        );

        res.json({
            message: "Cart quantity updated.",
            data: cart,
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/carts/items/:productId
router.delete("/items/:productId", requireCsrf, (req, res, next) => {
    try {
        const cart = cartService.removeItem(
            req.sessionID,
            req.params.productId
        );

        res.json({
            message: "Product removed from cart.",
            data: cart,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

