var request = require('request'),
    Q = require('q');
    cheerio = require('cheerio'),
    url = require('url'),
    mongoose = require('mongoose');


var db = mongoose.connection;
db.on('error', function(err){ console.log(err)} );
mongoose.connect('mongodb://localhost/tdbhn');


var Post = require('../models/post.js')(mongoose);

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
        var t = this;
        var counter = 0;
        this.posts.forEach( function(v,k){
            Post.findUpdateCreate(v,function(err,res){
                if(err){ cb(err,res); }
                counter++;

                if(counter == t.posts.length){
                    cb(err)
                }
            });
        });
    }

}
