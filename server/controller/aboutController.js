const About = require("../models/About");
const { sanitizeMedia, UPLOAD_DIR } = require("../utils/sanitize");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudStorage");
const fs = require("fs");
const path = require("path");

async function getOrCreateAbout() {
    let about = await About.findOne();
    if (!about) {
        about = await About.create({ image: "", thumbnail: "", alt: "Photographer" });
    }
    return about;
}

exports.getAbout = async (req, res) => {
    try {
        const about = await getOrCreateAbout();
        res.json({ success: true, ...about.toObject() });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateAbout = async (req, res) => {
    const localFiles = [];
    const cloudFiles = [];
    try {
        const about = await getOrCreateAbout();

        if (req.file) {
            const file = req.file;
            const result = await sanitizeMedia(file.path, file.originalname);
            const fullLocal = path.join(UPLOAD_DIR, result.file);
            const thumbLocal = result.thumbnail ? path.join(UPLOAD_DIR, result.thumbnail) : null;
            localFiles.push(fullLocal);
            if (thumbLocal) localFiles.push(thumbLocal);

            const fullType = result.mediaType === "video" ? "video" : "image";
            const imageUrl = await uploadToCloudinary(fullLocal, { resourceType: fullType });
            cloudFiles.push({ url: imageUrl, type: fullType });

            let thumbUrl = "";
            if (thumbLocal) {
                thumbUrl = await uploadToCloudinary(thumbLocal, { resourceType: "image" });
                cloudFiles.push({ url: thumbUrl, type: "image" });
            }

            if (about.image && about.image !== imageUrl) {
                const oldType = about.image.includes("/video/") ? "video" : "image";
                await deleteFromCloudinary(about.image, { resourceType: oldType }).catch(() => {});
            }
            if (about.thumbnail && about.thumbnail !== thumbUrl) {
                await deleteFromCloudinary(about.thumbnail, { resourceType: "image" }).catch(() => {});
            }

            about.image = imageUrl;
            about.thumbnail = thumbUrl;
        }

        if (req.body.alt) about.alt = req.body.alt;

        await about.save();
        await Promise.all(localFiles.map(p => fs.promises.unlink(p).catch(() => {})));

        res.json({ success: true, message: "About image updated", ...about.toObject() });
    } catch (error) {
        await Promise.all(cloudFiles.map(c => deleteFromCloudinary(c.url, { resourceType: c.type }).catch(() => {})));
        await Promise.all(localFiles.map(p => fs.promises.unlink(p).catch(() => {})));
        const status = error.status || 500;
        res.status(status).json({ success: false, message: error.message || "Update failed" });
    }
};
