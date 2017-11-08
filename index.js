var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

//var uri = "127.0.0.1:27017";
var uri = "mongodb://intermsof:ApsSDZFiblNXpi47@cluster0-shard-00-00-vuqjp.mongodb.net:27017,cluster0-shard-00-01-vuqjp.mongodb.net:27017,cluster0-shard-00-02-vuqjp.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin";
var db = mongoose.connect(uri);
var app = express();
var port = process.env.PORT || 3000;

var Post = require("./models/postModel");
var User = require("./models/userModel");
var Group = require("./models/groupModel");
var Notification = require("./models/notificationModel");

app.use(bodyParser.json());

var router = require("./routes/apiRoutes")(Post,User,Group,Notification);

app.use("/api",router);

app.get("/",function (req,res) {
    res.send("welcome to my api lol");
});

var server = app.listen(port,function(){
    console.log("Listening on port " + port);
});

module.exports = server;