const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true
    },
    role:{
        type:String,
        default:"user"
    },
    photoUrl:{
        type:String,
    }
},{timestamps:true});

const userModel = mongoose.model("user",userSchema);
module.exports = userModel;