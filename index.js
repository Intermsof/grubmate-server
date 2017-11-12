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


app.use(bodyParser.json());

var userRouter = require("./routes/userRoutes")(User,Post,Group);
var postRouter = require("./routes/postRoutes")(User,Post,Group);
var groupRouter = require("./routes/groupRoutes")(User,Post,Group);
var notificationRouter = require("./routes/notificationRoutes")(User,Post,Group);
var subscriptionRouter = require("./routes/subscriptionRoutes")(User,Post,Group);

app.use("/api",userRouter);
app.use("/api",postRouter);
app.use("/api",groupRouter);
app.use("/api",notificationRouter);
app.use("/api",subscriptionRouter);

app.get("/",function (req,res) {
    res.send("welcome to my api lol");
});

var server = app.listen(port,function(){
    console.log("Listening on port " + port);
});

module.exports = server;