var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userModel = new Schema({
    name:String,
    rating:Number,
    posts:[String],
    requests:[String],
    subs:[String],
    groups:[String],
    friends:[String],
    valid:[Boolean]
});

module.exports = mongoose.model("User",userModel);