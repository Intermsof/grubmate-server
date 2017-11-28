var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userModel = new Schema({
    name:String,
    _id:String,
    rating:Number,
    numRating:{
        type:Number,
        default:0
    },
    posts:[String],
    subs:[{
        subtype:String,
        value:String
    }],
    groups:[String],
    friends:[String],
    valid:[{type:Boolean}],
    news:[{
        title:String,
        address:String,
        postid:String
    }],
    requests:[{
        title:String,
        address:String,
        //status should take on requested/confirmed
        status:String,
        postid:String,
        //person requesting
        personid:String
    }],
    statuses:[{
        title:String,
        //requested, confirmed, rejected or ended
        status:String,
        postid:String,
        //this variable used for rating the poster
        personid:String
    }],
    postsOfUser:[String]
});


module.exports = mongoose.model("User",userModel);