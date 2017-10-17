var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userModel = new Schema({
    name:String,
    _id:String,
    rating:Number,
    posts:[String],
    requests:[String],
    subs:[String],
    groups:[String],
    friends:[String],
    valid:[{type:Boolean}],
    notifications:[String],
});

userModel.pre('save', function (next) {
    if ('invalid' == this.name) {
        return next(new Error('#sadpanda'));
    }
    next();
});

module.exports = mongoose.model("User",userModel);