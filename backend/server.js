const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Load environment variables
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

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files with authentication
app.use('/uploads', authMiddleware, express.static('uploads')); 

// Default route
app.get("/", (req, res) => {
    res.send("MediSync Backend is Running!");
});

// Database connection test route
app.get("/test-db", (req, res) => {
    db.query("SELECT 1", (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Database not connected!" });
        }
        res.json({ message: "Database connected successfully!" });
    });
});

// Use authentication routes
app.use("/auth", authRoutes);

// Use appointment routes
app.use("/appointments", appointmentRoutes);

// Use medical records routes
app.use("/medical-records", medicalRecordRoutes);

// Use users routes
app.use('/users', userRoutes);

// Use availability routes
app.use('/availability', availabilityRoutes); 

// Use schedule routes
app.use('/schedule', scheduleRoutes); 

// Use patient routes
app.use('/patient', patientRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error Handling Middleware (must be last)
app.use(errorHandler);

// Graceful Shutdown
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        db.end(() => {
            console.log('Database pool closed');
            process.exit(0);
        });
    });
});

process.on('SIGINT', () => {
    console.log('\nSIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        db.end(() => {
            console.log('Database pool closed');
            process.exit(0);
        });
    });
});
