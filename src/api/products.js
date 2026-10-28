const express = require("express");
const productService = require("../services/productService");

const router = express.Router();

// GET /api/products
router.get("/", (req, res, next) => {
    try {
        const products = productService.listProducts();

        res.json({
            count: products.length,
            data: products,
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/products/:id
router.get("/:id", (req, res, next) => {
    try {
        const product = productService.getProductById(req.params.id);

        res.json({
            data: product,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

