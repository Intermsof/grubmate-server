/**
 * Created by Alex Pan on 10/30/2017.
 */
var assert = require("assert");
var request = require('supertest');

describe('user route works', function () {
    var server = require('../index');
    var randomId = Math.floor(Math.random() * 1000);

    it('server responds to post user requests at route /api/user', function testSlash(done) {
        request(server)
            .post('/api/user')
            .send({
                name:"xingyu chen",
                _id:randomId,
                friends:["1583333221705311"]
            })
            .end(function(err, res) {
                if (err) {
                    throw err;
                }else{
                    assert.equal(res.body._id,randomId.toString());
                    assert.equal(res.body.name,"xingyu chen");
                }
                done();
            });
    });

    it('get a user we just posted', function testSlash(done) {
        request(server)
            .get('/api/user?userid=' + randomId)
            .end(function(err, res) {
                if (err) {
                    throw err;
                }else{
                    assert.equal(res.body._id,randomId.toString());
                    assert.equal(res.body.name,"xingyu chen");
                }
                done();
            });
    });


    it('server responds to get user requests that was already in database', function testSlash(done) {
        request(server)
            .get('/api/user?userid=1583333221705311')
            .end(function(err, res) {
                if (err) {
                    throw err;
                }else{
                    assert.equal(res.body._id,"1583333221705311");
                    assert.equal(res.body.name,"Alex Pan");
                }
                done();
            });
    });
});

describe('post route works', function () {
    var server = require('../index');
    var postid;

    it('server responds to posting a post requests at route /api/posts', function testSlash(done) {
        request(server)
            .post('/api/posts')
            .send({
                title:"free food for all TAs and CPs if you give us good grades!",
                location:"some random street in LA",
                price:"$0.000",
                description:"in celebration of 'finishing' our csci 310 assignment, we shall be giving away free food",
                user:{
                    id:"2"
                }

            })
            .end(function(err, res) {
                if (err) {
                    throw err;
                }else{
                    assert.equal(res.body.title,"free food for all TAs and CPs if you give us good grades!");
                    assert.equal(res.body.location,"some random street in LA");
                    assert.equal(res.body.price,"$0.000");
                    assert.equal(res.body.description,"in celebration of 'finishing' our csci 310 assignment, we shall be giving away free food");
                    postid = res.body._id;
                }
                done();
            });
    });

    it('postid of the post we just made is pushed into the user object', function testSlash(done) {
        request(server)
            .get('/api/user?userid=2')
            .end(function(err, res) {
                if (err) {
                    throw err;
                }else{
                    assert.equal(res.body.postsOfUser[res.body.postsOfUser.length - 1],postid);
                }
                done();
            });
    });

    it('friends of the user that just made the post receives the postid', function testSlash(done) {
        request(server)
            .get('/api/user?userid=1583333221705311')
            .end(function(err, res) {
                if (err) {
                    throw err;
                }else{
                    assert.equal(res.body.posts[res.body.posts.length - 1],postid);
                }
                done();
            });
    });

    it('friends of the user that just made the post receives the notification about the postid', function testSlash(done) {
        request(server)
            .get('/api/notifications?userid=1583333221705311')
            .end(function(err, res) {
                var notifid = res.body[res.body.length - 1];
                request(server)
                    .get("/api/singlenotif?notifid=" + notifid)
                    .end(function (err,res2) {
                        assert.equal(res2.body.type,"news");
                        assert.equal(res2.body.title,"free food for all TAs and CPs if you give us good grades!");
                        assert.equal(res2.body.address,"some random street in LA");
                        done();
                    });

            });
    });

    it('get a posts we just posted', function testSlash(done) {
        request(server)
            .get('/api/single?postid=' + postid)
            .end(function(err, res) {
                if (err) {
                    throw err;
                }else{
                    assert.equal(res.body.title,"free food for all TAs and CPs if you give us good grades!");
                    assert.equal(res.body.location,"some random street in LA");
                    assert.equal(res.body.price,"$0.000");
                    assert.equal(res.body.description,"in celebration of 'finishing' our csci 310 assignment, we shall be giving away free food");
                }
                done();
            });
    });




    it('server responds to get posts requests that was already in database', function testSlash(done) {
        request(server)
            .get('/api/single?postid=59f675251571510012e17a67')
            .end(function(err, res) {
                if (err) {
                    throw err;
                }else{
                    assert.equal(res.body.title,"Molly he is giving away tons of free food");
                    assert.equal(res.body.location,"some random street in LA");
                    assert.equal(res.body.price,"$50000.00");
                    assert.equal(res.body.description,"come get my food for the aforementioned price");
                }
                done();
            });
    });
});


describe('notification route works', function () {
    var server = require('../index');

    it('server responds to getting a notification requests at route /api/singlenotif', function testSlash(done) {
        request(server)
            .get('/api/singlenotif?notifid=59f7d84980345812f801727a')
            .end(function(err, res) {
                if (err) {
                    throw err;
                }else{
                    assert.equal(res.body.type,"news");
                    assert.equal(res.body.title,"free food for all TAs and CPs if you give us good grades!");
                    assert.equal(res.body.address,"some random street in LA");
                    assert.equal(res.body.postid,"59f7d84880345812f8017279");
                }
                done();
            });
    });
});

describe('requesting, confirming, ending posts works',function () {
    var server = require('../index');
    it('requesting a post works', function testSlash(done) {
        request(server)
            .put('/api/posts?type=request&personid=2&postid=59f675251571510012e17a67&location=xyz')
            .end(function(err, res) {
                if (err) {
                    throw err;
                }else{
                    assert.equal(res.body.type,"request");
                    assert.equal(res.body.postid,"59f675251571510012e17a67");
                }
                done();
            });
    });

    it('confirming a post works', function testSlash(done) {
        request(server)
            .put('/api/posts?type=confirm&personid=2&postid=59f675251571510012e17a67&location=xyz')
            .end(function(err, res) {
                if (err) {
                    throw err;
                }else{
                    assert.equal(res.body.type,"status");
                    assert.equal(res.body.postid,"59f675251571510012e17a67");
                }
                done();
            });
    });

    it('ending a post works', function testSlash(done) {
        request(server)
            .put('/api/posts?type=end&personid=2&postid=59f675251571510012e17a67&location=xyz')
            .end(function(err, res) {
                if (err) {
                    throw err;
                }else{
                    assert.equal(res.body.postid,"59f675251571510012e17a67");
                }
                done();
            });
    });
});

describe('make group and edit group works',function () {
    var server = require('../index');
    it('making a group works', function testSlash(done) {
        request(server)
            .post('/api/group')
            .send({
                name:"group 3",
                users:["1"]
            })
            .end(function(err, res) {
                if (err) {
                    throw err;
                }else{
                    assert.equal(res.body.name,"group 3");
                    assert.equal(res.body.users[0],"1");
                }
                done();
            });
    });

    it('modifying a group works', function testSlash(done) {
        request(server)
            .post('/api/group')
            .send({
                name:"group 3",
                users:["1"]
            })
            .end(function(err, res) {
                if (err) {
                    throw err;
                }else{
                    assert.equal(res.body.name,"group 3");
                    assert.equal(res.body.users[0],"1");
                }
                done();
            });
    });
});