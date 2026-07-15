const express = require("express");
const router = express.Router();
const aboutController = require("../controller/aboutController");
const auth = require("../middleware/auth");
const heroUpload = require("../middleware/heroUpload");

router.get("/", aboutController.getAbout);

router.put("/", auth, heroUpload.single("image"), aboutController.updateAbout);

module.exports = router;
