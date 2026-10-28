const db = require("../src/db/connection");

const demoProducts = [
    {
        name: "College Notebook",
        sku: "NOTEBOOK-001",
        description: "A notebook for everyday college use.",
        price_paise: 4500,
        stock_quantity: 50,
        active: 1,
    },
    {
        name: "Water Bottle",
        sku: "BOTTLE-001",
        description: "Reusable water bottle.",
        price_paise: 12000,
        stock_quantity: 30,
        active: 1,
    },
    {
        name: "USB-C Cable",
        sku: "CABLE-001",
        description: "USB-C charging and data cable.",
        price_paise: 19900,
        stock_quantity: 25,
        active: 1,
    },
];

const insertProduct = db.prepare(`
    INSERT INTO products (
        name,
        sku,
        description,
        price_paise,
        stock_quantity,
        active
    )
    VALUES (
        @name,
        @sku,
        @description,
        @price_paise,
        @stock_quantity,
        @active
    )
    ON CONFLICT(sku) DO NOTHING
`);

try {
    const seedProducts = db.transaction(() => {
        for (const product of demoProducts) {
            insertProduct.run(product);
        }
    });

    seedProducts();

    const result = db.prepare(`
        SELECT COUNT(*) AS count
        FROM products
        WHERE active = 1
    `).get();

    console.log(`Demo seed completed. Active products: ${result.count}`);
} catch (error) {
    console.error("Failed to seed demo products:", error.message);
    process.exitCode = 1;
} finally {
    db.close();
}
