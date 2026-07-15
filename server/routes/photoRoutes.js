const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const photoController = require("../controller/photoController");
const auth = require("../middleware/auth");

// Wrap multer so size/type rejections return a clean 400 instead of a 500.
function handleUpload(req, res, next) {
    upload.array("images", 20)(req, res, (err) => {
        if (err) {
            const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
            return res.status(status).json({
                success: false,
                message: err.message || "Upload rejected"
            });
        }
        next();
    });
}

router.post(
    "/upload",
    auth,
    handleUpload,
    photoController.uploadPhoto
);

router.get("/", photoController.getPhotos);

router.put("/:id", auth, photoController.updatePhoto);

router.delete("/:id", auth, photoController.deletePhoto);

module.exports = router;
