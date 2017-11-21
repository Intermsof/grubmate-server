/**
 * Created by Alex Pan on 11/10/2017.
 */
var express = require("express");

var groupRoutes = function (User,Post,Group) {
    var router = express.Router();
    router.route("/group")
        .get(function (req,res) {
            var userid = req.query.userid;
            User.findById(userid,function (err,user) {
                res.json(user.groups);
                console.log(user.groups);
            });
        })
        .post(function (req,res) {
            var group = new Group(req.body);
            group.save();
            var users = group.users;
            console.log(group);
            for(let userid of users){
                User.findById(userid,function (err,user) {
                    user.groups.push(group._id);
                    user.update({$set:{groups:user.groups}},{},function () {
                        console.log("updated");
                    });
                });
            }

            res.json(group);
        })
        .put(function (req,res) {
            var groupid = req.query.groupid;
            var type = req.query.type;
            var userid = req.query.userid;
            Group.findById(groupid,function (err,group) {
                if(type === "add"){
                    //case: join group
                    //verifies that the user isn't already in the group
                    console.log(group.users.indexOf(userid));
                    if(group.users.indexOf(userid) == -1){
                        group.users.push(userid);
                        console.log(group);
                        group.update({$set:{users:group.users}},{},function () {
                            console.log("added user the userid " + userid + " to group with id " + groupid);
                        });
                    }
                    User.findById(userid,function (err,user) {
                        //verifies that the group isn't already in the group
                        if(user != null){
                            if(user.groups.indexOf(groupid) == -1){
                                //add user object to group
                                user.groups.push(groupid);
                                user.update({$set:{groups:user.groups}},{},function () {
                                    console.log("added the group id " + groupid + " to the user with id " + userid);
                                });
                            }
                        }

                    });

                }else{
                    //case: exit group
                    var index = group.users.indexOf(userid);
                    if(index != -1){
                        //delete the group from the user
                        User.findById(userid,function (err,user) {
                            if(user != null){
                                user.groups.splice(user.groups.indexOf(groupid),1);
                                user.update({$set:{groups:user.groups}},{},function () {
                                    console.log("removed group id " + groupid + " from user with id " + userid);
                                });
                            }

                        });

                        //remove the user from the group
                        group.users.splice(index, 1);
                        group.update({$set:{users:group.users}},{},function () {
                            console.log("removed userid " + userid + " from group with id " + groupid);
                        });
                    }


                }
                res.json(group);
            });
        });

    router.route("/singlegroup")
        .get(function(req,res){
            var groupid = req.query.groupid;
            Group.findById(groupid,function (err,group) {
                res.json(group);
            });
        });

    return router;
};

module.exports = groupRoutes;