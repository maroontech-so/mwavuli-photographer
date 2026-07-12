const express = require("express");
const router = express.Router();

const bookingController = require("../controller/bookingController");
const auth = require("../middleware/auth");

router.post("/", bookingController.createBooking);

router.get("/", auth, bookingController.getBookings);

router.delete("/:id", auth, bookingController.deleteBooking);

module.exports = router;
