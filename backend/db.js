const mysql = require("mysql2");
require("dotenv").config(); // Load environment variables from .env file

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error("❌ Missing required environment variables:", missingEnvVars.join(', '));
    console.error("Please check your .env file");
    process.exit(1);
}

// --- Create MySQL Connection Pool (Better for production) ---
const pool = mysql.createPool({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test the connection pool
pool.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Database connection failed: " + err.message);
        console.error("➡️ Host:", process.env.DB_HOST);
        console.error("➡️ User:", process.env.DB_USER);
        console.error("➡️ DB Name:", process.env.DB_NAME);
        console.error("➡️ Port:", process.env.DB_PORT || 3306);
        console.error("Exiting application...");
        process.exit(1);
    }
    console.log("✅ Connected to MySQL Database!");
    connection.release(); // Release the test connection back to the pool
});

// Handle pool errors
pool.on('error', (err) => {
    console.error('❌ Database pool error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('Database connection was closed.');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
        console.error('Database has too many connections.');
    }
    if (err.code === 'ECONNREFUSED') {
        console.error('Database connection was refused.');
    }
});

// --- Export the connection pool ---
module.exports = pool; 
