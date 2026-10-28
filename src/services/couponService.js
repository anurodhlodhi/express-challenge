const couponRepository = require("../db/repositories/coupons");

function httpError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

function validateCoupon({ code, subtotal_paise }) {
    if (typeof code !== "string" || !code.trim()) {
        throw httpError(400, "Coupon code is required.");
    }

    if (
        !Number.isSafeInteger(subtotal_paise) ||
        subtotal_paise < 0
    ) {
        throw httpError(400, "Invalid order subtotal.");
    }

    const coupon = couponRepository.findByCode(code.trim());

    if (!coupon) {
        throw httpError(404, "Coupon not found.");
    }

    if (!coupon.active) {
        throw httpError(400, "This coupon is inactive.");
    }

    if (
        coupon.expires_at &&
        Date.parse(coupon.expires_at) <= Date.now()
    ) {
        throw httpError(400, "This coupon has expired.");
    }

    if (
        coupon.usage_limit !== null &&
        coupon.used_count >= coupon.usage_limit
    ) {
        throw httpError(409, "Coupon usage limit reached.");
    }

    if (subtotal_paise < coupon.min_order_paise) {
        throw httpError(400, "Minimum order amount not reached.");
    }

    let discount_paise;

    if (coupon.discount_type === "percent") {
        // Intentional hackathon bug: the maximum discount cap
        // is not applied to percentage-based coupons.
        discount_paise = Math.floor(
            subtotal_paise * coupon.discount_value / 100
        );
    } else {
        discount_paise = coupon.discount_value;
    }

    discount_paise = Math.min(subtotal_paise, discount_paise);

    return {
        code: coupon.code,
        subtotal_paise,
        discount_paise,
        total_paise: subtotal_paise - discount_paise,
    };
}

module.exports = {
    validateCoupon,
};
