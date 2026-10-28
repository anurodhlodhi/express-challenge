const express = require("express");
const path = require("node:path");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const config = require("./src/config");
const csrf = require("./src/middleware/csrf");

const productRoutes = require("./src/api/products");
const cartRoutes = require("./src/api/carts");
const couponRoutes = require("./src/api/coupons");
const orderRoutes = require("./src/api/orders");
const paymentRoutes = require("./src/api/payments");

const app = express();

app.disable("x-powered-by");

if (config.nodeEnv === "production") {
    app.set("trust proxy", 1);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

app.use(helmet());

app.use(
    express.static(path.join(__dirname, "src", "public"))
);

app.use(express.json({ limit: "100kb" }));

app.use(
    express.urlencoded({
        extended: false,
        limit: "100kb",
    })
);

app.use(cookieParser());

app.use(
    session({
        name: "faultline.sid",
        secret:
            config.sessionSecret ||
            "development-only-secret-change-before-deploying",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: config.nodeEnv === "production",
            maxAge: 2 * 60 * 60 * 1000,
        },
    })
);

// Main page
app.get("/", (req, res) => {
    res.json({
        name: "FaultLine Express Challenge",
        status: "running",
        message: "Express server is working!",
        health: "/health",
    });
});

// Health-check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "faultline-express-challenge",
    });
});

// API health-check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        database: "initialized",
    });
});

// Issue CSRF token
app.get("/api/csrf", csrf.issueToken);

// Products API
app.use("/api/products", productRoutes);

// Shopping cart API
app.use("/api/carts", cartRoutes);

// Coupons API
app.use("/api/coupons", couponRoutes);

// Orders API
app.use("/api/orders", orderRoutes);

// Payments and simulated refunds API
app.use("/api/payments", paymentRoutes);

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        error: "Not Found",
        path: req.originalUrl,
    });
});

// Central error handler
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    console.error(err);

    const status = Number.isInteger(err.status)
        ? err.status
        : 500;

    res.status(status).json({
        error:
            config.nodeEnv === "production"
                ? "Internal server error"
                : err.message || "Internal server error",
    });
});

module.exports = app;