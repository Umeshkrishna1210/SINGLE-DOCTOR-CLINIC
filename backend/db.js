const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingEnvVars.length > 0) {
    console.error("❌ Missing env vars:", missingEnvVars.join(", "));
    process.exit(1);
}

// Create pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
});

// --- TEST CONNECTION + RUN SCHEMA ---
pool.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Database connection failed:", err.message);
        process.exit(1);
    }

    console.log("✅ Connected to MySQL Database!");

    try {
        const schemaPath = path.join(process.cwd(), "mediSyncDB.sql");
        const schema = fs.readFileSync(schemaPath, "utf8");

        pool.query(schema, (schemaErr) => {
            if (schemaErr) {
                console.error("❌ Schema execution failed:", schemaErr.message);
            } else {
                console.log("✅ Database schema initialized");
            }
        });
    } catch (e) {
        console.error("❌ Failed to load schema.sql:", e.message);
    }

    connection.release();
});

module.exports = pool;
