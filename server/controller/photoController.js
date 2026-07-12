const Photo = require("../models/Photo");
const Project = require("../models/Project");
const path = require("path");

// Upload one or more media files
exports.uploadPhoto = async (req, res) => {
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
            return res.status(400).json({
                success: false,
                message: "Please choose a category."
            });
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

        const docs = files.map((file, i) => {
            const mediaType = file.mimetype.startsWith("video")
                ? "video"
                : "photo";

            const nameFromFile = path.parse(file.originalname).name;
            const itemTitle = baseTitle
                ? (files.length > 1 ? `${baseTitle} (${i + 1})` : baseTitle)
                : nameFromFile;

            return {
                title: itemTitle,
                category,
                file: file.filename,
                mediaType,
                project: project || null
            };
        });

        const photos = await Photo.insertMany(docs);

        res.status(201).json({
            success: true,
            message: `${photos.length} media uploaded successfully`,
            photos
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
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