const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { registerValidation, loginValidation } = require("../middleware/validation");
const { addToBlacklist } = require("../utils/tokenBlacklist");
require("dotenv").config();

const router = express.Router();
const ACCESS_TOKEN_EXPIRY = "1h";
const REFRESH_TOKEN_EXPIRY = "7d";

function generateTokens(user) {
    const accessToken = jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
    const refreshToken = jwt.sign(
        { id: user.id, type: "refresh" },
        process.env.JWT_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
    return { accessToken, refreshToken };
}

// REGISTER
router.post("/register", registerValidation, async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role)
        return res.status(400).json({ error: "All fields are required!" });

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length > 0) return res.status(400).json({ error: "Email already exists!" });

        const hashedPassword = await bcrypt.hash(password, 10);
        db.query(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            [name, email, hashedPassword, role],
            (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                const user = { id: result.insertId, name, email, role };
                const { accessToken, refreshToken } = generateTokens(user);
                res.status(201).json({
                    message: "User registered successfully!",
                    token: accessToken,
                    refreshToken,
                    expiresIn: 3600,
                    user
                });
            }
        );
    });
});

// LOGIN
router.post("/login", loginValidation, (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ error: "Email and password are required!" });

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
        if (err) return res.status(500).json({ error: "Database error!" });
        if (result.length === 0) return res.status(401).json({ error: "Invalid email or password!" });

        const user = result[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid email or password!" });

        const userData = { id: user.id, name: user.name, email: user.email, role: user.role };
        const { accessToken, refreshToken } = generateTokens(userData);

        res.json({
            message: "Login successful!",
            token: accessToken,
            refreshToken,
            expiresIn: 3600,
            user: userData
        });
    });
});

// REFRESH TOKEN - Exchange refresh token for new access token
router.post("/refresh", (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: "Refresh token is required." });

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        if (decoded.type !== "refresh") return res.status(401).json({ error: "Invalid refresh token." });

        db.query("SELECT id, name, email, role FROM users WHERE id = ?", [decoded.id], (err, result) => {
            if (err || result.length === 0) return res.status(401).json({ error: "User not found." });
            const user = result[0];
            const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
            res.json({ token: accessToken, refreshToken: newRefreshToken, expiresIn: 3600, user });
        });
    } catch (e) {
        return res.status(401).json({ error: "Invalid or expired refresh token." });
    }
});

// LOGOUT - Blacklist current access token (requires auth)
const authMiddleware = require("../middleware/authMiddleware");
router.post("/logout", authMiddleware, (req, res) => {
    const authHeader = req.header("Authorization");
    const token = authHeader?.split(" ")[1];
    if (token) addToBlacklist(token);
    res.json({ message: "Logged out successfully." });
});

module.exports = router;
