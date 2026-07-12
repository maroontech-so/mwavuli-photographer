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

// Connect Database
connectDB();
adminController.seedAdmin();

const path = require("path");

// Middleware
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/admin", adminRoutes);

// Public media + public data
app.use("/api/photos", photoRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/testimonials", testimonialRoutes);

// Test Route
app.get("/", (req, res) => {
    res.send("Mwavuli Photography API is Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

