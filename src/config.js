const path = require("node:path");

require("dotenv").config({
    path: path.resolve(__dirname, "../.env"),
});

const port = Number.parseInt(process.env.PORT || "3000", 10);
const nodeEnv = process.env.NODE_ENV || "development";

if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid port number.");
}

module.exports = {
    port,
    nodeEnv,
    sessionSecret: process.env.SESSION_SECRET,
};
