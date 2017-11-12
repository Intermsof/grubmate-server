/**
 * Created by Alex Pan on 11/10/2017.
 */
var express = require("express");

var notificationRoutes = function (User,Post,Group) {
    var router = express.Router();
    router.route("/notifications")
        .get(function (req,res) {
            var userid = req.query.userid;
            User.findById(userid,function (err,user) {
                if(err){
                    console.log("got fucked");
                }else{
                    var response = [];
                    response.push(user.news);
                    response.push(user.requests);
                    response.push(user.statuses);
                    res.json(response);
                }
            });
        });

    return router;
};

module.exports = notificationRoutes;