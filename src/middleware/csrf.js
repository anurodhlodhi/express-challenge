const crypto = require("node:crypto");

function issueToken(req, res, next) {
    if (!req.session) {
        return next(new Error("Session middleware is not configured."));
    }

    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(32).toString("hex");
    }

    res.json({
        token: req.session.csrfToken,
    });
}

function requireCsrf(req, res, next) {
    const sessionToken = req.session?.csrfToken;
    const requestToken = req.get("x-csrf-token");

    if (
        typeof sessionToken !== "string" ||
        typeof requestToken !== "string"
    ) {
        return res.status(403).json({
            error: "Missing or invalid CSRF token.",
        });
    }

    const expected = Buffer.from(sessionToken);
    const supplied = Buffer.from(requestToken);

    if (
        expected.length !== supplied.length ||
        !crypto.timingSafeEqual(expected, supplied)
    ) {
        return res.status(403).json({
            error: "Invalid CSRF token.",
        });
    }

    next();
}

module.exports = {
    issueToken,
    requireCsrf,
};

