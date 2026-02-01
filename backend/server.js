const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const logger = require("./utils/logger");

dotenv.config();

const db = require("./db");
const authRoutes = require("./routes/auth");
const appointmentRoutes = require("./routes/appointments");
const medicalRecordRoutes = require("./routes/medicalRecords");
const userRoutes = require('./routes/users');
const availabilityRoutes = require('./routes/availability'); 
const scheduleRoutes = require('./routes/schedule');
const patientRoutes = require('./routes/patientRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
app.set("trust proxy", 1);

// Security Headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow file serving
}));

// CORS Configuration - Restrict in production
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('CORS policy violation'), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login/register attempts per windowMs
    message: 'Too many authentication attempts, please try again later.',
    skipSuccessfulRequests: true,
});

app.use('/api/', limiter); // Apply to all API routes
app.use('/auth/', authLimiter); // Stricter limit for auth routes

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        logger.info({ method: req.method, path: req.path, status: res.statusCode, duration: Date.now() - start });
    });
    next();
});

app.use('/uploads', authMiddleware, express.static('uploads'));

app.get("/", (req, res) => res.send("MediSync Backend is Running!"));

// Health check for monitoring
app.get("/health", (req, res) => {
    db.query("SELECT 1", (err) => {
        if (err) return res.status(503).json({ status: "unhealthy", database: "disconnected" });
        res.json({ status: "healthy", database: "connected" });
    });
});

app.get("/test-db", (req, res) => {
    db.query("SELECT 1", (err, result) => {
        if (err) return res.status(500).json({ error: "Database not connected!" });
        res.json({ message: "Database connected successfully!" });
    });
});

// API v1 routes
const apiV1 = express.Router();
apiV1.use("/auth", authRoutes);
apiV1.use("/appointments", appointmentRoutes);
apiV1.use("/medical-records", medicalRecordRoutes);
apiV1.use("/users", userRoutes);
apiV1.use("/availability", availabilityRoutes);
apiV1.use("/schedule", scheduleRoutes);
apiV1.use("/patient", patientRoutes);
app.use("/api/v1", apiV1);

// Legacy routes (backward compatibility)
app.use("/auth", authRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/medical-records", medicalRecordRoutes);
app.use("/users", userRoutes);
app.use("/availability", availabilityRoutes);
app.use("/schedule", scheduleRoutes);
app.use("/patient", patientRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error Handling Middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    logger.info({ port: PORT, env: process.env.NODE_ENV || 'development' }, 'Server running');
});

process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        db.end(() => {
            logger.info('Database pool closed');
            process.exit(0);
        });
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        db.end(() => {
            logger.info('Database pool closed');
            process.exit(0);
        });
    });
});
