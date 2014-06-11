var request = require('request'),
    Q = require('q'),
    cheerio = require('cheerio'),
    url = require('url'),
    mongoose = require('mongoose');

var Post = require('../models/post.js');

var db = mongoose.connection;
db.on('error', function(err){ console.log(err)} );
mongoose.connect('mongodb://192.168.56.254/tdbhn');

var $ = cheerio.load("<html></html>");

module.exports = function(html){
    this.html = null;
    this.posts = null;
    this.setHtml = function(html){
        this.html = html;
    }
    this.getHtml = function(){
        return this.html;
    }
    this.getPosts = function(){
        var t = this;
        $ = cheerio.load(this.html);

        var $titles = $('.title a');

        var posts = [];

        $titles.each( function(k,v){
            var post = t.parsePost(v);
            if( post.host != undefined ){
                posts.push(post);
            }
        });

        this.posts = posts;
        return posts;
    }

    this.parsePost = function(post){

        var post = {
            title: $(post).text(),
            link: $(post).attr('href')
        }

        var domain = url.parse(post.link);


        if(domain.host != null){
            post.host = domain.host;
        }

        return post;
    }

    this.savePosts = function(cb){
        if(cb == undefined){ cb = function(){}; }
        var t = this;
        var counter = 0;

        Post.update({},{active:0},{multi: true}, function(err,res){
            t.posts.forEach( function(v,k){
                v.active = 1;
                Post.findUpdateCreate(v,function(err,res){
                    if(err){ cb(err,res); }
                    counter++;
                    if(counter == t.posts.length){
                        cb(err)
                    }
                });
            });
        })
    }

    this.getActive = function(cb){
        Post.find({active:true}, function(err,res){
            cb(err,res);
        });
    }
}
