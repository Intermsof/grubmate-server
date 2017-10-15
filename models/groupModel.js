var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var groupModel = new Schema({
    name:String,
    users:[String]
});

module.exports = mongoose.model("Group",groupModel);