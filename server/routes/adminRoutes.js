const express = require("express");

const router = express.Router();

const adminController = require("../controller/adminController");
const auth = require("../middleware/auth");

router.post("/login", adminController.login);

// Protected: only authenticated admins can register new admins
router.post("/register", auth, adminController.register);

module.exports = router;
