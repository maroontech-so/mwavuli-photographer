const express = require("express");
const router = express.Router();
const testimonialController = require("../controller/testimonialController");
const auth = require("../middleware/auth");

router.get("/", testimonialController.getTestimonials);
router.post("/", auth, testimonialController.createTestimonial);
router.delete("/:id", auth, testimonialController.deleteTestimonial);

module.exports = router;
