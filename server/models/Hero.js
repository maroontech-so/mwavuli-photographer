const mongoose = require("mongoose");

// A single settings document drives the homepage hero slideshow.
const heroSchema = new mongoose.Schema({
    enabled: { type: Boolean, default: true },
    autoplay: { type: Boolean, default: true },
    interval: { type: Number, default: 5000 },
    slides: [{
        image: { type: String, required: true },
        thumbnail: { type: String, default: "" },
        order: { type: Number, default: 0 }
    }]
}, { timestamps: true });

module.exports = mongoose.model("Hero", heroSchema);
