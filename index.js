var Gethn = require('./get-hn'),
    Watchn = require('./watch-hn'),
    Post = require('./models/post.js'),
    request = require('request');


var watchn = new Watchn();
var hnURL = 'http://news.ycombinator.com';

var getin = setInterval( function(){
    console.log('requesting',hnURL);
    request(hnURL, function(e,r,b){
        console.log( 'recieved', hnURL);
        var gethn = new Gethn();
        gethn.setHtml(b);
        gethn.getPosts();
        gethn.savePosts();
    });
},120000);

var watchin = setInterval( function(){
    var gethn = new Gethn();

    gethn.getActive( function(e,r){
        if(r){
            trackUrls(r);
        }
    });
},60000);

function trackUrls( posts ){
    console.log('------------------------');
    if(posts){
        var post = posts[0];
        var url = 'http://' + post.host;

        console.log('tracking', url);
        watchn.track(url, function(err,res){
            posts.shift();
            console.log(url, 'response time', res);
            console.log('posts left', posts.length);
            if(posts.length > 0){
                trackUrls(posts);
            }else{
                console.log('finished tracking all posts');
            }

        });
    }else{

    }
}