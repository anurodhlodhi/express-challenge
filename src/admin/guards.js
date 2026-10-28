function requireAdmin(req, res, next) {
    if (!req.session || !req.session.adminUserId) {
        return res.status(401).json({
            error: "Admin authentication required.",
        });
    }

    next();
}

module.exports = {
    requireAdmin,
};

