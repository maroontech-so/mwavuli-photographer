const express = require("express");

const router = express.Router();

const adminController = require("../controller/adminController");
const auth = require("../middleware/auth");

router.post("/login", adminController.login);

// Protected: only authenticated admins can register new admins
router.post("/register", auth, adminController.register);

// Protected: change the signed-in admin's password
router.patch("/password", auth, adminController.changePassword);

module.exports = router;
