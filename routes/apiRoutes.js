var express = require("express");

var routes = function (Post,User,Group,Notification) {
    var router = express.Router();

    router.route("/user").post(function(req,res){
        var user = new User(req.body);
        var userFriends = user.friends;
        var done = 0;
        for(let i = 0; i < userFriends.length; ++i){
            var id = userFriends[i];
            User.findById(id,function (err,friend) {
                if (!err && friend != null) {
                    console.log("editting friend");
                    user.valid[i] = true;
                    var friendOfFriend = friend.friends;
                    //sets the user as valid for the friend of this user
                    for(let j = 0; j < friendOfFriend.length; ++j){
                        if(friendOfFriend[j] === user._id){
                            friend.valid[j] = true;
                            friend.update({ $set: {valid: friend.valid}},{},function () {
                                console.log("updated");
                            });
                        }
                    }
                } else {
                    user.valid[i] = false;
                }
                done++;
                if(done == userFriends.length){
                    user.save();
                    res.send(user);
                }
            });
        }
    }).get(function(req,res){
        var userid = req.query.userid;
        User.findById(userid,function (err,user) {
            if(err){
                console.log(err);
            }else{
                res.send(user);
            }
        })
    });

    router.route("/posts").post(function (req,res) {
        var post = new Post(req.body);
        var postUser = post.user;
        var userid = postUser.id;
        console.log(post);
        post.save();
        User.findById(userid,function (err,user) {
            if(err){
                console.log(err);
            }else{
                if(post._id){
                    console.log(user);
                    user.posts.push(post._id);
                    res.send(post);
                }
                if(post.groups.length === 0){
                    var friends = user.friends;
                    for(let friend of friends){
                        User.findById(friend,function (err,friendObj) {
                            friendObj.posts.push(post._id);
                            friendObj.update({ $set: {posts: friendObj.posts}},{},function () {
                                console.log("updated");

                            });
                        });
                    }
                }
            }
        });
    }).put(function (req,res) {
        var options = req.body;
        Post.findById(options.id,function (err,post) {
            if(err){
                console.log(err);
            }else{
                var type = options.type;
                if(type === "confirm"){
                    post.confirmed.push(options.personId);
                    post.update({$set:{confirmed:post.confirmed}},{},function () {
                        console.log("updated");
                    });
                }else if(type === "end"){
                    var index = post.confirmed.indexOf(options.personId);
                    var confirmed = post.confirmed;
                    post.confirmed = confirmed.slice(0,index).concat(confirmed.slice(index + 1));
                    post.update({$set:{confirmed:post.confirmed}},{},function () {
                        console.log("updated");
                    });
                }else if(type === "request"){
                    post.pending.push(options.personId);
                    post.update({$set:{pending:post.pending}},{},function () {
                        console.log("updated");
                    });
                }
            }
        })
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

    return router;
};

module.exports = routes;