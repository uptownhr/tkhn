var assert = require("assert"),
    fake = require("./fake.js"),
    GetHN = require('../get-hn'),
    WatchHN = require('../watch-hn'),
    Post = require('../models/post.js'),
    URL = require('url'),
    mongoose = require('mongoose');

describe('WatchHN', function(){
    describe('#track', function(){
        var url = 'http://www.codelearn.org/android-tutorial/challenges/android-http-twitter';
        var response_time;
        it('should return how long it took for a response', function(done){
            var whn = new WatchHN();

            whn.track(url, function(err,res){
                if(res > 1){
                    response_time = res;
                    done();
                }
            });
        })

        it('should record the response time in db', function(done){
            var domain = URL.parse(url);
            Post.findOne(
                {host:domain.host},
                 {'logs': {$elemMatch: { responseTime: response_time}} },
            function(err,res){
                if(err) throw err;
                if(!res) throw err;

                if(res.logs == undefined) throw err;

                if(res.logs[0].responseTime == response_time){
                    done();
                }else{
                    throw err;
                }
            });
        })
    })
})

describe('GetHN', function(){

    describe('#getter/setter html', function(){
        it("should set and get html", function(){
            var gethn = new GetHN();
            gethn.setHtml(fake.html_response);

            assert.equal(fake.html_response, gethn.getHtml() );
        })
    });

    describe('#getPosts', function(){
        var gethn = new GetHN();
        gethn.setHtml(fake.html_response);

        it("should have 28 posts", function(){
            var posts = gethn.getPosts();
            assert.equal(28, posts.length);
        });
    });

    describe('#parsePost', function(){
        it("should return a post with title and url", function(){
            var gethn = new GetHN();
            var post_html = "<a href=\"http://website.alinearestaurant.com/site/2014/06/tickets-for-restaurants/\">Tickets for Restaurants</a>";

            var post = gethn.parsePost(post_html);

            assert.equal('Tickets for Restaurants', post.title);
            assert.equal('http://website.alinearestaurant.com/site/2014/06/tickets-for-restaurants/', post.link);
        })
    })

    describe('#savePosts', function(){
        it("all should save without an error", function(done){
            var gethn = new GetHN();
            gethn.setHtml(fake.html_response);

            var posts = gethn.getPosts();
            gethn.savePosts( function(err){
                done(err);
            });
        })




    })

    describe('#savePosts update', function(){
        it("only current posts should be left active", function(done){
            var gethn = new GetHN();
            gethn.setHtml(fake.html_response2);

            var posts = gethn.getPosts();
            gethn.savePosts( function(){
                gethn.getActive(function(err,res){
                    assert.equal(26,res.length);
                    done();
                })
            });
        })
    })
});