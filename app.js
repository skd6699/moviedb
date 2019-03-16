var express = require("express"),
  bodyParser = require("body-parser"),
request = require("request");
var app = module.exports.app = express();
var http = require('http');
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));
var server = http.createServer(app);
server.setTimeout(10*60*1000);
//MYSQL CONNECTION
var mysql = require('mysql');
var con = mysql.createConnection({
  host: "us-cdbr-gcp-east-01.cleardb.net",
  user: "beeba6aa6dd76e",
  password: "ebe18246",
  database: "gcp_cef76366aaa521a46a5b"
});

con.connect(function(err) {
  if (err) throw err;
  con.query("SELECT * FROM watched ", function (err, result, fields) {
    if (err) throw err;
    // console.log(fields);
  });
});

app.get("/",function(req, res) {
   res.render("header"); 
});

app.get("/results",function(req,res){
    var query = req.query.search;
    res.redirect('/results/1/'+query);
});
app.get("/results/:page/:search",function(req,res){
    var query = req.params.search;
    var page = req.params.page;
    var url = "http://www.omdbapi.com/?s=" + query + "&apikey=133b8b1e&page="+page;
    request(url,function(error,response,body){
        if(!error && response.statusCode == 200)
        {
            var r = JSON.parse(body);
            console.log(r);
            res.render("result",{data:r,search:query});
        }
    });
});
app.get("/app/:iid",function(req,res){
     var imdbid = req.params.iid;
   // https://api.themoviedb.org/3/find/tt3896198?api_key=debc0368eb9aad6d905a7962423eafd6&language=en-US&external_source=imdb_id
    

    var url = "http://www.omdbapi.com/?i=" + imdbid + "&apikey=133b8b1e"; 
    request(url,function(error,response,body){
        if(!error && response.statusCode == 200)
        {
            var r = JSON.parse(body);
            console.log(r);
            res.send(r);
            // res.render("result",{data:r});
        }
    });
});


http://www.omdbapi.com/?i=tt3896198&apikey=133b8b1e

//SERVER
server.listen(3000);
console.log('movie app server started %s', server.address().port);
//debc0368eb9aad6d905a7962423eafd6
server.on('connection', function(socket) {
  socket.setTimeout(600 * 60 * 1000); // now works perfectly...
})