var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var notificationModel = new Schema({
    type:String,
    title:String,
    location:String,
    status:String,
    time:String
});

module.exports = mongoose.model("Notification",notificationModel);