const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const photoController = require("../controller/photoController");
const auth = require("../middleware/auth");

router.post(
    "/upload",
    auth,
    upload.array("images", 20),
    photoController.uploadPhoto
);

router.get("/", photoController.getPhotos);

router.put("/:id", auth, photoController.updatePhoto);

router.delete("/:id", auth, photoController.deletePhoto);

module.exports = router;
