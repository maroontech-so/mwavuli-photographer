const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({

    title:{
        type:String,
        required:true
    },

    description:{
        type:String,
        default:""
    },

    location:{
        type:String,
        default:""
    },

    cover:{
        type:String,
        default:""
    }

},{
    timestamps:true
});

module.exports = mongoose.model("Project", projectSchema);