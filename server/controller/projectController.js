const Project = require("../models/Project");
const Photo = require("../models/Photo");

// Public: list all projects
exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });

        const projectsWithCovers = await Promise.all(
            projects.map(async (project) => {
                const cover = await Photo.findOne({ project: project._id }).sort({ createdAt: 1 });
                return {
                    _id: project._id,
                    title: project.title,
                    description: project.description,
                    location: project.location,
                    cover: cover ? cover.file : null
                };
            })
        );

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
        const cover = photos[0] || null;

        res.json({
            success: true,
            project: {
                _id: project._id,
                title: project.title,
                description: project.description,
                location: project.location,
                cover: cover ? cover.file : null
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

// Admin: delete project
exports.deleteProject = async (req, res) => {
    try {
        await Photo.updateMany({ project: req.params.id }, { $unset: { project: 1 } });
        await Project.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Project deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};