const Testimonial = require("../models/Testimonial");

// Public: list testimonials (used by the website)
exports.getTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({ createdAt: -1 });
        res.json({ success: true, testimonials });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: create testimonial
exports.createTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.create(req.body);
        res.status(201).json({ success: true, testimonial });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: delete testimonial
exports.deleteTestimonial = async (req, res) => {
    try {
        await Testimonial.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Testimonial deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
