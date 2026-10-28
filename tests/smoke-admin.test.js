const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../app");
const db = require("../src/db/connection");

test("Unauthenticated users cannot create products", async () => {
    const response = await request(app)
        .post("/api/products")
        .send({
            name: "Test Product",
            sku: "TEST-001",
            description: "Security test",
            price_paise: 10000,
            stock_quantity: 5,
            active: 1,
        });

    assert.equal(response.status, 401);
});

test.after(() => {
    db.close();
});

