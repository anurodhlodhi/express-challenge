const db = require("../connection");

const findCoupon = db.prepare(`
    SELECT
        id,
        code,
        discount_type,
        discount_value,
        min_order_paise,
        max_discount_paise,
        usage_limit,
        used_count,
        active,
        expires_at
    FROM coupons
    WHERE code = ? COLLATE NOCASE
`);

module.exports = {
    findByCode(code) {
        return findCoupon.get(code);
    },
};
