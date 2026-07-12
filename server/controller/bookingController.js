const Booking = require("../models/Booking");

// Create Booking
exports.createBooking = async (req, res) => {

    try {

        const booking = await Booking.create(req.body);

        res.status(201).json({
            success: true,
            message: "Booking submitted successfully!",
            booking
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Get All Bookings
exports.getBookings = async (req, res) => {

    try {

        const bookings = await Booking.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            bookings
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Delete Booking
exports.deleteBooking = async (req, res) => {

    try {

        await Booking.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Booking deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

