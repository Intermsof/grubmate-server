/**
 * Created by Alex Pan on 11/10/2017.
 */
var express = require("express");



var postRoutes = function(User,Post,Group){
    var router = express.Router();
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
            var postUser = req.body.user;
            //id of the user that made the post
            var userid = postUser.id;
            post.save();

            User.findById(userid,function (err,user) {
                if(err){
                    console.log(err);
                }else{
                    res.json(post);
                    //pushes the id of the post into the history of the user that posted
                    user.postsOfUser.push(post._id);
                    user.update({$set:{postsOfUser: user.postsOfUser}},{},function () {
                        console.log("added the post with id " + post._id + " to the history of user with id " + userid);
                    });


                    //case: no groups specified in the post, so the post will be shown to all friends of the user
                    if(post.groups.length === 0){
                        var friends = user.friends;
                        for(let friend of friends){
                            User.findById(friend,function (err,friendObj) {
                                //push the post to that friend
                                friendObj.posts.push(post._id);
                                friendObj.update({ $set: {posts: friendObj.posts}},{},function () {
                                    console.log("added the post with id " + post._id + " to the newsfeed of user with id " + friend);
                                });

                                //loop through the subscriptions of the friend
                                var subscriptions = friendObj.subs;
                                var match = false;
                                for(let sub of subscriptions){
                                    if(sub.subtype === "category" && sub.value === post.category){
                                        match = true;
                                    }else if(sub.subtype === "tag" && sub.value === post.tag){
                                        match = true;
                                    }else if(sub.subtype === "keyword" && post.title.includes(sub.value)){
                                        match = true;
                                    }
                                }

                                if(match){
                                    var news = {
                                        title: user.name + " made a post called \"" + post.title +"\"",
                                        address: post.address,
                                        postid: post._id
                                    };
                                    friendObj.news.push(news);
                                    friendObj.update({$set: {news:friendObj.news}},{},function () {
                                        console.log("Added a news object to user with id " + friendObj._id);
                                    });
                                }
                            });
                        }
                    }else{
                        var groups = post.groups;
                        for(let groupid of groups){
                            Group.findById(groupid,function (err,group) {
                                var usersOfGroup = group.users;
                                console.log(usersOfGroup);
                                for(let userid2 of usersOfGroup){
                                    console.log(userid2);
                                    if(userid2 != userid){
                                        User.findById(userid2,function (err,friendObj) {
                                            //push the post to that friend
                                            friendObj.posts.push(post._id);
                                            friendObj.update({ $set: {posts: friendObj.posts}},{},function () {
                                                console.log("added the post with id " + post._id + " to the newsfeed of user with id " + userid2);
                                            });

                                            //loop through the subscriptions of the friend
                                            var subscriptions = friendObj.subs;
                                            var match = false;
                                            for(let sub of subscriptions){
                                                console.log(sub);
                                                if(sub.subtype === "category" && sub.value === post.category){
                                                    match = true;
                                                }else if(sub.subtype === "tag" && sub.value === post.tag){
                                                    match = true;
                                                }else if(sub.subtype === "keyword" && post.title.includes(sub.value)){
                                                    match = true;
                                                }
                                            }

                                            console.log("am i matching?" , userid2,match);

                                            if(match){
                                                var news = {
                                                    title: user.name + " made a post called \"" + post.title +"\"",
                                                    address: post.address,
                                                    postid: post._id
                                                };
                                                friendObj.news.push(news);
                                                friendObj.update({$set: {news:friendObj.news}},{},function () {
                                                    console.log("Added a news object to user with id " + friendObj._id);
                                                });
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                }
            });
        })
        .delete(function (req,res) {
            var postid = req.query.postid;
            Post.findById(postid,function (err,post) {
                console.log(post);
                console.log(post.transactions);
                if(post.transactions.length === 0){
                    post.remove(function () {
                        console.log("successfully removed the post with id " + postid);
                        res.send("1");
                    });
                }else{
                    res.send("0");
                }
            });
        })
        .put(function (req,res) {
            var type = req.query.type;
            var personid = req.query.personid;
            var postid = req.query.postid;
            var location = req.query.location;
            console.log(type, personid, postid, location);
            Post.findById(postid,function (err,post) {
                if(err){
                    console.log(err);
                }else if(post !== null){
                    if(type === "confirm"){
                        console.log("confirming");
                        //check the person is has requested and isn't confirmed yet
                        if(post.pending.indexOf(personid) !== -1 && post.confirmed.indexOf(personid) === -1){
                            post.confirmed.push(personid);
                            post.pending.splice(post.pending.indexOf(personid),1);
                            post.update({$set:{confirmed:post.confirmed,numAvailable:(post.numAvailable - 1)}},{},function () {
                                console.log("The request of the user with id " + personid
                                    + " on post " + post._id + " has been confirmed.");
                            });

                            post.update({$set:{pending:post.pending}},{},function () {
                                console.log("The request of the user with id " + personid
                                    + " on post " + post._id + " has been removed from pending.");
                            });

                            var timeRequested;
                            for(let i = post.requestHistory.length; i > -1; --i){
                                if(post.requestHistory[i].userid === personid){
                                    timeRequested = post.requestHistory[i].time;
                                    console.log("found matching request; time =  " +  timeRequested);
                                    break;
                                }
                            }
                            var transaction = {
                                userid:personid,
                                timeRequested: timeRequested,
                                timeConfirmed: Date.now()
                            };

                            post.update({$push:{transactions:transaction}},{},function () {
                                console.log("Saved a transaction variable for the post with id " + post._id);
                            });

                            //update the status for the requester
                            User.findById(personid,function (err,user) {
                                //find the correct status object
                                for(let status of user.statuses){
                                    if(status.postid === post._id.toString()){
                                        status.status = "confirmed";
                                        console.log(user.statuses);
                                        break;
                                    }
                                }
                                user.update({$set:{statuses:user.statuses}},{},function () {
                                    console.log("The status of the user with id " + personid
                                        + " for post with id " + post._id + "has been updated to confirmed");
                                });
                            });

                            //update the request notification for the poster
                            User.findById(post.user.id,function (err,user) {
                                //find the correct request object
                                for(let request of user.requests){
                                    console.log(request.personid , personid);
                                    if(request.postid === post._id.toString() && request.personid === personid){
                                        request.status = "confirmed";
                                        break;
                                    }
                                }

                                user.update({$set:{requests:user.requests}},{},function () {
                                    console.log("The poster with id " + user._id
                                        + " has confirmed the post with id " + post._id + " by person " + personid);
                                });
                            });
                        }
                    }else if(type === "end"){
                        var index = post.confirmed.indexOf(personid);
                        var confirmed = post.confirmed;
                        if(index !== -1){
                            //remove the user from the confirmed list
                            post.confirmed = confirmed.slice(0,index).concat(confirmed.slice(index + 1));
                            post.update({$set:{confirmed:post.confirmed}},{},function () {
                                console.log("The confirmed user with id " + personid + " has been terminated");
                            });

                            //find location of most frequest transaction matching id
                            var index = post.transactions.length;
                            for(; index > -1; --index){
                                if(post.transactions[index].userid === personid){
                                    post.transactions[index].timeEnded = Date.now();
                                }
                            }

                            //create a time for request history ending
                            var queryString = ("transactions." + index + ".timeEnded");
                            if( index != -1){
                                post.update({$set:{ transactions: post.transactions}},{},function () {
                                    console.log("updated the end time of transaction variable for the post with id " + post._id);
                                });
                            }


                            //update status object for requester
                            User.findById(personid,function (err,user) {
                                for(let status of user.statuses){
                                    if(status.postid === post._id.toString()){
                                        status.status = "ended";
                                        break;
                                    }
                                }

                                user.update({$set:{statuses:user.statuses}},{},function () {
                                    console.log("The status of the user with id " + personid
                                        + " for post with id " + post._id + " has been updated to ended");
                                });
                            });

                            //remove the request object for poster
                            User.findById(post.user.id,function (err,user) {
                                var requests = user.requests;
                                for(let i = 0; i < requests.length; ++i){
                                    var request = requests[i];
                                    if(request.postid === post._id.toString() && request.personid === personid){
                                        requests.splice(i,1);
                                        user.update({$set:{requests:user.requests}},{},function () {
                                            console.log("The poster with id " + user._id + " has finished a request");
                                        });
                                        break;
                                    }
                                }
                            });
                        }

                    }else if(type === "request"){
                        //check whether the person has already requested
                        if(post.pending.indexOf(personid) === -1 && post.confirmed.indexOf(personid) === -1){
                            //put the user into the pending array of the post
                            post.pending.push(personid);
                            post.update({$set:{pending:post.pending}},{},function () {
                                console.log("user with the id " + personid + " has requested the post with id " + post._id);
                            });

                            //give a news notification to the requester
                            User.findById(personid,function (err,user) {
                                var name = user.name;
                                var status = {
                                    title: "Your request for the post " + post.title,
                                    status: "requested",
                                    postid: post._id,
                                    //this variable used for rating the poster
                                    personid: post.user.id
                                };
                                user.statuses.push(status);
                                user.update({$set:{statuses:user.statuses}},{},function () {
                                    console.log("Added a status to the requester with id " + personid);
                                });

                                //give a request notification to the poster
                                User.findById(post.user.id,function (err,user) {
                                    var request = {
                                        title: "Your friend " + name + " requested your post \"" + post.title + "\"",
                                        address:location,
                                        status:"requested",
                                        personid:personid,
                                        postid:post._id
                                    };
                                    user.requests.push(request);
                                    user.update({$set:{requests:user.requests}},{},function () {
                                        console.log("The poster with id " + user._id + " received a new request from  user with id " + personid);
                                    });
                                });

                            });
                        }
                    }else if(type === "reject"){
                        var index = post.pending.indexOf(personid);
                        if(index !== -1){
                            post.pending.splice(index,1);
                            post.update({$set:{pending:post.pending}},{},function () {
                                console.log("Poster with id " + post.user.id + " has rejected a request");
                            });

                            //update the status of the rejected user
                            User.findById(personid,function (err,user) {
                                for(let i = 0; i < user.statuses.length; ++i){
                                    console.log(user.statuses[i].postid, post._id, user.statuses[i].postid == post._id);
                                    if(user.statuses[i].postid == post._id){
                                        console.log("im here222");
                                        user.statuses[i].status = "rejected";
                                        break;
                                    }
                                }
                                for(let status of user.statuses){
                                    if(status.postid === post._id){
                                        console.log("im here");
                                        status.status = "rejected";
                                        break;
                                    }
                                }
                                console.log(user.statuses);
                                user.update({$set:{statuses:user.statuses}},{},function () {
                                    console.log("User with id" + personid + " was rejected, and their status has been updated" );
                                });
                            });

                            //remove request from poster
                            User.findById(post.user.id,function (err,user) {
                                user.update({
                                    $pull:{
                                        requests:{
                                            postid:postid,
                                            personid:personid
                                        }
                                    }
                                },{},function () {
                                    console.log("removed request from user with id " + post.user.id );
                                });
                            });


                        }
                    }else if(type === "edit"){
                        var edits = req.body;
                        var properties = Object.keys(edits);
                        for(let property of properties){
                            if(property !== "user" && property !== "groups"
                                &&  property !== "pending" && property !== "confirmed"
                                && property in post){
                                post[property] = edits[property];
                            }
                        }

                        post.save();
                    }else if(type === "remove"){
                        User.findById(personid,function (err,user) {
                            if(user != null){
                                var statuses = user.statuses;
                                for(let i = 0; i < statuses.length; ++i){
                                    var status = statuses[i];
                                    if(status.postid === postid){
                                        user.statuses.splice(i,1);
                                        user.update({$set:{statuses:user.statuses}},{},function () {
                                            console.log("Removed status from user with id " + personid);
                                        });
                                    }
                                }
                            }else{
                                console.log("could not find the user with is " + personid);
                            }

                        });
                    }
                }
                res.json(post);
            });
        });

    router.route("/singlepost")
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

    return router;
};

module.exports = postRoutes;