const express = require("express");
const router = express.Router();

const heroController = require("../controller/heroController");
const auth = require("../middleware/auth");
const heroUpload = require("../middleware/heroUpload");

// Public
router.get("/", heroController.getHero);

// Admin (protected)
router.post("/slide", auth, heroUpload.single("image"), heroController.addSlide);
router.put("/order", auth, heroController.reorderSlides);
router.put("/", auth, heroController.updateHero);
router.delete("/slide/:id", auth, heroController.deleteSlide);

module.exports = router;
