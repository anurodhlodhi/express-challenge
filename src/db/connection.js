const Database = require("better-sqlite3");
const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config();

const projectRoot = path.resolve(__dirname, "../..");
const defaultDatabasePath = path.join(
    projectRoot,
    "data",
    "faultline.sqlite"
);

const configuredPath = process.env.DB_PATH || defaultDatabasePath;

const databasePath = path.isAbsolute(configuredPath)
    ? configuredPath
    : path.resolve(projectRoot, configuredPath);

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);

db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");
db.pragma("busy_timeout = 5000");

const schemaPath = path.join(__dirname, "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");

db.exec(schema);

console.log(`SQLite database initialized: ${databasePath}`);

module.exports = db;

