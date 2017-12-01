var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var postModel = new Schema({
    postID: String,
    location: String,
    title: String,
    startTime: String,
    endTime:String,
    kind:String,
    images:[String],
    status:Boolean,
    price:String,
    description:String,
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
    pending:[String],
    confirmed:[String],
    groups:[String],
    requestHistory:[{
        userid:String,
        time:{
            type:Date,
            default: Date.now
        }
    }],
    transactions:[{
        userid:String,
        timeRequested:Date,
        timeConfirmed:{
            type:Date,
            default: Date.now
        },
        timeEnded:Date
    }]
});

module.exports = mongoose.model("Post", postModel);