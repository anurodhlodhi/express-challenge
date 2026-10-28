const express = require("express");
const couponService = require("../services/couponService");

const router = express.Router();

router.post("/validate", (req, res, next) => {
    try {
        const result = couponService.validateCoupon(req.body || {});

        res.json({
            message: "Coupon validated successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

