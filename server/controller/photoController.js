const Photo = require("../models/Photo");
const Project = require("../models/Project");
const path = require("path");
const fs = require("fs");
const { sanitizeMedia, UPLOAD_DIR } = require("../utils/sanitize");

// Upload one or more media files
exports.uploadPhoto = async (req, res) => {
    const produced = [];
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
            produced.push(path.join(UPLOAD_DIR, result.file));
            if (result.thumbnail) {
                produced.push(path.join(UPLOAD_DIR, result.thumbnail));
            }

            const nameFromFile = path.parse(file.originalname).name;
            const itemTitle = baseTitle
                ? (files.length > 1 ? `${baseTitle} (${i + 1})` : baseTitle)
                : nameFromFile;

            docs.push({
                title: itemTitle,
                category,
                file: result.file,
                thumbnail: result.thumbnail || "",
                mediaType: result.mediaType,
                project: project || null
            });
        }

        const photos = await Photo.insertMany(docs);

        res.status(201).json({
            success: true,
            message: `${photos.length} media uploaded successfully`,
            photos
        });

    } catch (error) {
        // Roll back any media already written for this request.
        await Promise.all(
            produced.map(p => fs.promises.unlink(p).catch(() => {}))
        );
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