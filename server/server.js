const express = require("express");
const cors = require("cors");
require("dotenv").config();

console.log("MONGO_URI =", process.env.MONGO_URI);

const connectDB = require("./config/db");
const adminRoutes = require("./routes/adminRoutes");
const photoRoutes = require("./routes/photoRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const adminController = require("./controller/adminController");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded media
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api/admin", adminRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/testimonials", testimonialRoutes);

// Serve frontend files (index.html, gallery.html, admin/*, css, js, etc.)
app.use(express.static(path.join(__dirname, "..")));

const PORT = process.env.PORT || 5000;

async function start() {
    try {
        await connectDB();
        await adminController.seedAdmin();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
}

start();

