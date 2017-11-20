/**
 * Created by Alex Pan on 11/10/2017.
 */
var express = require("express");

var userRoutes = function(User,Post,Group){
    var router = express.Router();

    router.route("/user").post(function(req,res){
        var user = new User(req.body);
        var userFriends = user.friends;
        var done = 0;

        //we must notify each friend that the user has
        //that the user has signed up. Concretely, this means
        //setting the "valid" array index to be true.
        for(let i = 0; i < userFriends.length; ++i){
            var id = userFriends[i];
            //gets the friend object from the database
            User.findById(id,function (err,friend) {
                 if (!err && friend != null) {
                      //we found an existing user object with the
                      //matching id
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
                     //this is the case that we do not find an existing user
                     //object with the matching id
                     user.valid[i] = false;
                 }
                 //once we have finished looping through the friends array,
                 //save the user into the database and send the user object back
                 done++;
                 if(done == userFriends.length){
                     user.save();
                     res.json(user);
                 }
            });
        }
    }).get(function(req,res){
        var userid = req.query.userid;
        User.findById(userid,function (err,user) {
            if(err){
                console.log(err);
                res.send("Error occured");
            }else{
                res.json(user);
            }
        });
    }).put(function (req,res) {
        //this function is for updating ratings
        var userid = req.query.userid;
        var rating = req.query.rate;
        User.findById(userid,function (err,user) {
            user.rating = ((user.rating * user.numRating) + parseFloat(rating)) / (user.numRating + 1);
            user.numRating += 1;

            res.json(user.rating);
            user.update({
                $set:{
                    rating:user.rating,
                    numRating:user.numRating
                }
            },{},function () {
                console.log("updated the rating of the user with id " + userid);
            });
        });
    });

    return router;
};

module.exports = userRoutes;