var express = require("express");

var routes = function (Post,User,Group,Notification) {
    var router = express.Router();

    router.route("/user")
        .post(function(req,res){
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
    })
        .get(function(req,res){
        var userid = req.query.userid;
        User.findById(userid,function (err,user) {
            if(err){
                console.log(err);
            }else{
                res.send(user);
            }
        })
    });

    router.route("/posts")
        .get(function(req,res){
        var userid = req.query.userid;
        console.log(userid);
        User.findById(userid,function (err,user) {
            console.log(user);
            res.json(user.posts);
        });
    })
        .post(function (req,res) {
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
                user.postsOfUser.push(post._id);
                user.update({$set:{postsOfUser: user.postsOfUser}});
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
    })
        .put(function (req,res) {
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

    router.route("/single")
        .get(function (req,res) {
        console.log("called");
        var postId =  req.query.postid;
        Post.findById(postId,function(err,post){
            if(err){
                console.log(err);
            } else{
                res.json(post);
            }
        });
    });

    router.route("/groupsingle")
        .get(function (req,res) {
            var groupid = req.query.groupid;
            Group.findById(groupid,function (err,group) {
                res.json(group);
            })
        });

    router.route("/group")
        .get(function (req,res) {
            var userid = req.query.userid;
            User.findById(userid,function (err,user) {
                res.json(user.group);
            });
        })
        .post(function (req,res) {
            var group = new Group(req.body);
            group.save();
            var userid = group.users[0];
            console.log(userid);
            User.findById(userid,function (err,user) {
                user.groups.push(group._id);
                user.update({$set:{groups:user.groups}},{},function () {
                    console.log("updated");
                });
            });
            res.json(group);
        })
        .put(function (req,res) {
            var groupid = req.query.groupid;
            var add = req.query.add;
            var userid = req.query.userid;
            Group.findById(groupid,function (err,group) {
                if(add == 1){
                    //case: join group
                    group.users.push(userid);
                }else{
                    //case: exit group
                    var index = group.users.indexOf(userid);
                    User.findById(userid,function (err,user) {
                        console.log(userid);
                        user.groups.splice(user.groups.indexOf(groupid),1);
                        user.update({$set:{groups:user.groups}},{},function () {
                            console.log("updated");
                        })
                    });
                    group.users.splice(index, 1);
                }
                group.update({$set:{users:group.users}},{},function () {
                    console.log("updated");
                    res.json(group);
                })
            });

        });

    router.route("/subs")
        .post(function(req,res){
            var userid = req.query.userid;
            var sub = new Sub(req.body);
            sub.save();
            User.findById(userid,function (err,user) {
                user.subs.push(sub);
                user.update({$set:{subs:user.subs}},{},function () {
                   console.log("updated");
                });
            })
        })
        .put(function (req,res) {
            var index = req.query.index;
            var userid = req.query.userid;
            User.findById(userid,function (err,user){
                user.subs.splice(index,1);
            });
        });

    return router;
};

module.exports = routes;