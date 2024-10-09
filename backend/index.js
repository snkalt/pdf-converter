const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// PostgreSQL client setup
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to file name
    },
});

const upload = multer({ storage: storage, limits: { fileSize: 20 * 1024 * 1024 } }); // Limit file size to 20MB

// Middleware to check JWT
const authenticateJWT = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; // Bearer token

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ message: "Invalid token" });
            }
            req.user = user; // Store user info for later use
            next();
        });
    } else {
        res.status(401).json({ message: "Token not provided" });
    }
};

// Multiple File Uploads
app.post("/upload", upload.array("files", 10), (req, res) => { // Limit to 10 files
    if (!req.files) {
        return res.status(400).json({ message: "No files uploaded" });
    }
    res.json({ message: "Files uploaded successfully", files: req.files });
});

// User Registration
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [username, hashedPassword]);
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error registering user" });
    }
});

// User Login
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
                res.json({ token });
            } else {
                res.status(401).json({ message: "Invalid credentials" });
            }
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error logging in" });
    }
});

// Get User Profile
app.get("/profile", authenticateJWT, async (req, res) => {
    try {
        const { username } = req.user; // Get username from token
        const result = await pool.query("SELECT id, username, created_at FROM users WHERE username = $1", [username]);
        
        if (result.rows.length > 0) {
            res.json(result.rows[0]); // Return user profile
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching user profile" });
    }
});

// Update User Profile
app.put("/profile", authenticateJWT, async (req, res) => {
    try {
        const { username } = req.user;
        const { newPassword } = req.body; // Assuming you're updating the password

        if (!newPassword) {
            return res.status(400).json({ message: "New password is required" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10); // Hash the new password
        await pool.query("UPDATE users SET password = $1 WHERE username = $2", [hashedPassword, username]);

        res.json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating profile" });
    }
});

// User Logout
app.post("/logout", (req, res) => {
    // Here we can just send a response since JWT logout is handled client-side.
    res.json({ message: "Logged out successfully" });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
