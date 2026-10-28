const config = require("./config");
const db = require("./db/connection");
const app = require("../app");

const server = app.listen(config.port, () => {
    console.log(
        `FaultLine server running at http://localhost:${config.port}`
    );

    console.log(
        `Health check: http://localhost:${config.port}/health`
    );
});

function shutdown(signal) {
    console.log(`\n${signal} received. Shutting down...`);

    server.close(() => {
        db.close();
        console.log("Server and database connection closed.");
        process.exit(0);
    });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

