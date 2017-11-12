/**
 * Created by Alex Pan on 11/10/2017.
 */
var express = require("express");

var subscriptionRoutes = function (User,Post,Group) {

    var router = express.Router();
    router.route("/subs")
        .post(function(req,res){
            var userid = req.query.userid;
            var sub = req.body;

            User.findById(userid,function (err,user) {
                console.log(user.subs);
                user.subs.push(sub);
                user.update({$set:{subs:user.subs}},{},function () {
                    console.log("added subscription to user with id " + userid);
                    res.json(user.subs);
                });

            });
        })
        .put(function (req,res) {
            var index = req.query.index;
            var userid = req.query.userid;
            User.findById(userid,function (err,user){
                if(index > 0 && index < user.subs.length){
                    user.subs.splice(index,1);
                    user.update({$set:{subs:user.subs}},{},function () {
                        console.log("removed subscription at index " + index + " from user with id " + userid);
                    });
                    res.json(user.subs);
                }
            });
        });

    return router;
};

module.exports = subscriptionRoutes;