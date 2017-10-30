var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var notificationModel = new Schema({
    type:String,
    title:String,
    address:String,
    status:String,
    postid:String
});

module.exports = mongoose.model("Notification",notificationModel);