var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var postModel = new Schema({
    postID: String,
    location: String,
    title: String,
    images:[String],
    status:Boolean,
    user:{
        name:String,
        id:String,
        rating:Number,
        posts:[String],
        subs:[String],
        groups:[String]
    },
    category:String,
    tag:String,
    numAvailable:Number,
    pending:[String]
});

module.exports = mongoose.model("Post", postModel);