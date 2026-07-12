const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Seed the default admin from environment variables (run once on startup)
exports.seedAdmin = async () => {
    try {
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;

        if (!email || !password) return;

        const existing = await Admin.findOne({ email });
        if (existing) return;

        const hashedPassword = await bcrypt.hash(password, 12);
        await Admin.create({
            username: "admin",
            email,
            password: hashedPassword
        });

        console.log("✅ Default admin seeded");
    } catch (error) {
        console.error("Admin seed error:", error.message);
    }
};

// Register Admin (protected - only existing admins can create new ones)
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if admin already exists
        const adminExists = await Admin.findOne({ email });

        if (adminExists) {
            return res.status(400).json({
                message: "Admin already exists"
            });
        }

        // Encrypt password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin
        const admin = await Admin.create({
            username,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            admin
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Login Admin
exports.login = async (req, res) => {
    try {

        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { id: admin._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            success: true,
            token
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};