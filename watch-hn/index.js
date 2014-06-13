var request = require('request'),
    URL = require('url'),
    Q = require('q'),
    Post = require('../models/post.js'),
    mongoose = require('mongoose');


var db = mongoose.connection;
db.on('error', function(err){ console.log('connection',err)} );
mongoose.connect('mongodb://192.168.56.254/tdbhn');


var Post = require('../models/post.js');

module.exports = function(html){
    this.track = function(url,cb){
        var now = Date.now();

        var options = {
            "rejectUnauthorized": false,
            "url": url
        };

        request( options, function(e,r,b){
            var domain = URL.parse(url);

            if(e){
                console.log(e);
                cb(e);
                return false;
            }

            if(r.statusCode == 200 && b){
                diff = Date.now() - now;

                Post.findOne({host:domain.host}, function(e,r){
                    r.logs.push({responseTime:diff});
                    r.save(function(err,res){
                        cb(null, diff);
                    });
                });


            }else{
                console.log(r.statusCode);
                cb(true,e);
            }
        });
    }
}
