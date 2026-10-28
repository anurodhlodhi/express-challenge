const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../app");
const db = require("../src/db/connection");

test("GET /health returns a healthy status", async () => {
    const response = await request(app).get("/health");

    assert.equal(response.status, 200);
    assert.equal(response.body.status, "ok");
});

test("GET /api/health confirms the API is running", async () => {
    const response = await request(app).get("/api/health");

    assert.equal(response.status, 200);
    assert.equal(response.body.status, "ok");
});

test("GET /api/products returns a product list", async () => {
    const response = await request(app).get("/api/products");

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body.data));
    assert.equal(response.body.count, response.body.data.length);
});

test("Unknown endpoints return 404", async () => {
    const response = await request(app).get("/this-route-does-not-exist");

    assert.equal(response.status, 404);
});

test.after(() => {
    db.close();
});
