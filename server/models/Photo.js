const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({

    title:{
        type:String,
        required:true
    },

    category:{
        type:String,
        required:true
    },

    mediaType:{
        type:String,
        enum:["photo","video"],
        default:"photo"
    },

    file:{
        type:String,
        required:true
    }

},{
    timestamps:true
});

module.exports = mongoose.model("Photo", photoSchema);