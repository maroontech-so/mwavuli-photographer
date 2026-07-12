const Project = require("../models/Project");
const Photo = require("../models/Photo");

// Public: list all projects
exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });

        const projectsWithCovers = projects.map(project => {
            return {
                _id: project._id,
                title: project.title,
                description: project.description,
                location: project.location,
                cover: project.cover || ""
            };
        });

        res.json({ success: true, projects: projectsWithCovers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Public: get single project with all photos
exports.getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        const photos = await Photo.find({ project: project._id }).sort({ createdAt: 1 });

        res.json({
            success: true,
            project: {
                _id: project._id,
                title: project.title,
                description: project.description,
                location: project.location,
                cover: project.cover || ""
            },
            photos
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: create project
exports.createProject = async (req, res) => {
    try {
        const project = await Project.create(req.body);
        res.status(201).json({ success: true, project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: update project
exports.updateProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }
        res.json({ success: true, project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: set project cover photo
exports.setCover = async (req, res) => {
    try {
        const { coverPhotoId } = req.body;
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        const photo = await Photo.findById(coverPhotoId);
        if (!photo) {
            return res.status(404).json({ success: false, message: "Photo not found" });
        }

        if (photo.project && photo.project.toString() !== project._id.toString()) {
            return res.status(400).json({ success: false, message: "Photo does not belong to this project" });
        }

        project.cover = photo.file;
        await project.save();

        res.json({ success: true, project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: delete project
exports.deleteProject = async (req, res) => {
    try {
        await Photo.deleteMany({ project: req.params.id });
        await Project.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Project deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
