var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");

var uri = "mongodb://intermsof:ApsSDZFiblNXpi47@cluster0-shard-00-00-vuqjp.mongodb.net:27017,cluster0-shard-00-01-vuqjp.mongodb.net:27017,cluster0-shard-00-02-vuqjp.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin";
var db = mongoose.connect(uri);
var app = express();
var port = process.env.PORT || 3000;
var router = express.Router();
var Post = require("./models/postModel");
var User = require("./models/userModel");
var Group = require("./models/groupModel");
var Notification = require("./models/notificationModel");

app.use(bodyParser.json());

router.route("/user").post(function(req,res){
   var user = new User(req.body);
   console.log(user);
   res.send(user)
});

router.route("/posts").get(function (req,res) {
    var name = req.query.userid;
    User.findById(function (err,user) {

    });

    Post.find(function (err,posts) {
        if(err){
            console.log(err);
        }else{
            res.json(posts);
        }
    });
});

router.route("posts/single/:postId").get(function (req,res) {
   Post.findById(req.params.postId,function(err,post){
      if(err){
          console.log(err);
      } else{
          res.json(post);
      }
   });


});

app.use("/api",router);

app.get("/",function (req,res) {
    res.send("welcome to my api lol");
});

app.listen(port,function(){
    console.log("Listening on port " + port);
});