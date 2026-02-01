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
    keepAliveInitialDelay: 0,
    multipleStatements: true
});

// Connection retry logic
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

function testConnection(retries = 0) {
    pool.getConnection((err, connection) => {
        if (err) {
            if (retries < MAX_RETRIES) {
                console.warn(`❌ Database connection failed (attempt ${retries + 1}/${MAX_RETRIES}): ${err.message}. Retrying in ${RETRY_DELAY_MS / 1000}s...`);
                setTimeout(() => testConnection(retries + 1), RETRY_DELAY_MS);
            } else {
                console.error("❌ Database connection failed after max retries. Exiting...");
                process.exit(1);
            }
            return;
        }
        console.log("✅ Connected to MySQL Database!");
        connection.release();
    });
}
testConnection();

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
