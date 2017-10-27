var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userModel = new Schema({
    name:String,
    _id:String,
    rating:Number,
    posts:[String],
    requests:[String],
    subs:[{
        type:String,
        value:String
    }],
    groups:[String],
    friends:[String],
    valid:[{type:Boolean}],
    notifications:[String],
    postsOfUser:[String]
});


module.exports = mongoose.model("User",userModel);