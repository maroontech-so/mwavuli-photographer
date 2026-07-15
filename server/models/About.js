const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema({
    image: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    alt: { type: String, default: "Photographer" }
}, { timestamps: true });

module.exports = mongoose.model("About", aboutSchema);
