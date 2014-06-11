var mongoose = require('mongoose'),
    extend = require('node-extend');

var logSchema = new mongoose.Schema({
    'responseTime': { type: Number },
    'created': { type: Date, default: Date.now }
});

var postSchema = new mongoose.Schema({
    'host': { type: String, index: true, unique: true, dropDups: true, required: true},
    'title': { type: String },
    'link': { type: String },
    'active': { type: Boolean },
    'logs': [logSchema],
    'created': { type: Date, default: Date.now },
    'updated': { type: Date, default: Date.now }
});

postSchema.statics.findUpdateCreate = function(post, cb){
    this.findOne({host:post.host}, function(err,res){
        if(res){
            res.title = post.title;
            res.link = post.link;
            res.active = post.active;
            res.updated = Date.now();
            res.save( cb );
        }else{
            var new_post = new Post(post);
            new_post.save( cb );
        }
    });
}

/*postSchema.statics.toCountry = function(bin, cb){
 this.findOne({bin:bin}, function(err, res){

 if(res){
 console.log(res);
 cb(err,res.country_2);
 }else{
 cb(err,false);
 }
 });
 }*/

var Post = mongoose.model('posts', postSchema);

module.exports = Post;


