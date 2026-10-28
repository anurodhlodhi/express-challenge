const db = require("../connection");

const listActiveProducts = db.prepare(`
    SELECT
        id,
        name,
        sku,
        description,
        price_paise,
        stock_quantity,
        active,
        created_at,
        updated_at
    FROM products
    WHERE active = 1
    ORDER BY id DESC
`);

const findActiveProductById = db.prepare(`
    SELECT
        id,
        name,
        sku,
        description,
        price_paise,
        stock_quantity,
        active,
        created_at,
        updated_at
    FROM products
    WHERE id = ? AND active = 1
`);

module.exports = {
    listActiveProducts: () => listActiveProducts.all(),
    findActiveProductById: (id) => findActiveProductById.get(id),
};

