const Photo = require("../models/Photo");
const Project = require("../models/Project");
const path = require("path");
const fs = require("fs");
const { sanitizeMedia, UPLOAD_DIR } = require("../utils/sanitize");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudStorage");

// Upload one or more media files
exports.uploadPhoto = async (req, res) => {
    const localFiles = [];   // sanitised files on disk, deleted after upload
    const cloudFiles = [];   // { url, type } stored in Cloudinary, rolled back on error
    try {
        const { title, category, project } = req.body;
        const files = req.files;

        if (!files || !files.length) {
            return res.status(400).json({
                success: false,
                message: "No files were selected."
            });
        }

        if (!category) {
            category = "General";
        }

        if (project) {
            const projectExists = await Project.findById(project);
            if (!projectExists) {
                return res.status(400).json({
                    success: false,
                    message: "Selected project does not exist."
                });
            }
        }

        const baseTitle = (title && title.trim())
            ? title.trim()
            : null;

        const docs = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Sanitise every upload: validates the real file type, strips
            // metadata, resizes/transcodes and produces a thumbnail.
            const result = await sanitizeMedia(file.path, file.originalname);

            const fullLocal = path.join(UPLOAD_DIR, result.file);
            const thumbLocal = result.thumbnail
                ? path.join(UPLOAD_DIR, result.thumbnail)
                : null;
            localFiles.push(fullLocal);
            if (thumbLocal) localFiles.push(thumbLocal);

            // Push the sanitised files to Cloudinary (survives Render restarts)
            // and keep the returned CDN URLs on the photo document.
            const fullType = result.mediaType === "video" ? "video" : "image";
            const fullUrl = await uploadToCloudinary(fullLocal, { resourceType: fullType });
            cloudFiles.push({ url: fullUrl, type: fullType });

            let thumbUrl = "";
            if (thumbLocal) {
                thumbUrl = await uploadToCloudinary(thumbLocal, { resourceType: "image" });
                cloudFiles.push({ url: thumbUrl, type: "image" });
            }

            const nameFromFile = path.parse(file.originalname).name;
            const itemTitle = baseTitle
                ? (files.length > 1 ? `${baseTitle} (${i + 1})` : baseTitle)
                : nameFromFile;

            docs.push({
                title: itemTitle,
                category,
                file: fullUrl,
                thumbnail: thumbUrl,
                mediaType: result.mediaType,
                project: project || null
            });
        }

        const photos = await Photo.insertMany(docs);

        // Local temp files are no longer needed once stored in Cloudinary.
        await Promise.all(localFiles.map(p => fs.promises.unlink(p).catch(() => {})));

        res.status(201).json({
            success: true,
            message: `${photos.length} media uploaded successfully`,
            photos
        });

    } catch (error) {
        console.error("Upload failed:", error && error.stack ? error.stack : error);
        // Roll back: remove anything already pushed to Cloudinary and any
        // local temp files left behind for this request.
        await Promise.all(
            cloudFiles.map(c => deleteFromCloudinary(c.url, { resourceType: c.type }).catch(() => {}))
        );
        await Promise.all(localFiles.map(p => fs.promises.unlink(p).catch(() => {})));
        const status = error.status || 500;
        res.status(status).json({
            success: false,
            message: error.message || "Upload failed"
        });
    }
};

// Get All Photos
exports.getPhotos = async (req, res) => {
    try {
        const photos = await Photo.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            photos
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updatePhoto = async (req, res) => {

    try {

        const { title, category, project } = req.body;

        const photo = await Photo.findByIdAndUpdate(
            req.params.id,
            {
                title,
                category,
                ...(project !== undefined ? { project } : {})
            },
            { new: true }
        );

        res.json({
            success: true,
            message: "Photo updated successfully",
            photo
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Delete Photo
exports.deletePhoto = async (req, res) => {
    try {
        const photo = await Photo.findById(req.params.id);
        if (!photo) {
            return res.status(404).json({
                success: false,
                message: "Photo not found"
            });
        }

        // Remove the stored assets from Cloudinary too.
        const fullType = photo.mediaType === "video" ? "video" : "image";
        await deleteFromCloudinary(photo.file, { resourceType: fullType }).catch(() => {});
        if (photo.thumbnail) {
            await deleteFromCloudinary(photo.thumbnail, { resourceType: "image" }).catch(() => {});
        }

        await Photo.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Photo deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};