var express = require("express"),
  bodyParser = require("body-parser"),
request = require("request");
var unirest = require('unirest');
var methodOverride = require('method-override');
var app = module.exports.app = express();
var http = require('http');
var mysql = require('mysql');
const Tmdb = require('tmdb-v3');
const tmdb = new Tmdb({ apiKey: 'debc0368eb9aad6d905a7962423eafd6' });
var p = [];

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));

var server = http.createServer(app);
server.setTimeout(10*60*1000);

//MYSQL CONNECTION
var db_config = {
  host: "us-cdbr-gcp-east-01.cleardb.net",
  user: "beeba6aa6dd76e",
  password: "ebe18246",
  database: "gcp_cef76366aaa521a46a5b"
};

var con;
function handleDisconnect() {
  con = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  con.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    } 
    console.log("Connected");                                    // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  con.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}
handleDisconnect();


app.get("/",function(req, res,next) {
            con.query("SELECT * FROM watched ", function (err, result, fields) {

              var noofmovies=0,hinm=0,telm=0,engm=0;
                    con.query("SELECT COUNT(*) AS noofmovies FROM watched",function(err,result){
                    noofmovies = result[0]["noofmovies"];
                    con.query("SELECT COUNT(Language) AS noofengmovies FROM watched where Language='English'",function(err,result){
                    engm = result[0]["noofengmovies"];
                    con.query("SELECT COUNT(Language) AS nooftelmovies FROM watched where Language='Telugu'",function(err,result){
                    telm = result[0]["nooftelmovies"];
                    con.query("SELECT COUNT(Language) AS noofhinmovies FROM watched where Language='Hindi'",function(err,result){
                    hinm = result[0]["noofhinmovies"];
                       res.render("header",{watched:result,noofmovies:noofmovies,engm:engm,hinm:hinm,telm:telm});
                    });
                    }); 
                    });
                    });
            });
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

            res.render("result",{data:r,search:query,});
        }
    });    
});

app.get("/app/:iid",function(req,res){
     var imdbid = req.params.iid;
   // https://api.themoviedb.org/3/find/tt3896198?api_key=debc0368eb9aad6d905a7962423eafd6&language=en-US&external_source=imdb_id
    

    var url = "http://www.omdbapi.com/?i=" + imdbid + "&apikey=133b8b1e&plot=full"; 
    request(url,function(error,response,body){
        if(!error && response.statusCode == 200)
        {
            var r = JSON.parse(body);
            // console.log(r);
            con.query("SELECT * FROM watched ", function (err, result, fields) {
            // console.log(result);    
            res.render("moviedata",{data:r,watched:result});
            });
            
        }
    });
});
app.post("/app/:iid",function(req,res){
  var today = new Date();
  var iid = req.params.iid;
var dd = today.getDate();
var mm = today.getMonth() + 1; //January is 0!
var yyyy = today.getFullYear();
if (dd < 10) {
  dd = '0' + dd;
} 
if (mm < 10) {
  mm = '0' + mm;
} 
var count = 0;
var today = yyyy + '-' + mm + '-' + dd;
console.log(today);
var movie = req.body.moviename;
var myrating = req.body.myrating;
console.log(typeof(req.body.myrating));
var str = req.body.language;
if(/[,\-]/.test(str) == true)
str.substring(0,str.indexOf(","));
var sql = "INSERT INTO watched (Movie,Language,My_Rating,Date) VALUES ('" + movie + "','" + str + "','" + myrating + "','" + today + "')";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });
res.redirect("/app/"+iid);
});


//http://www.omdbapi.com/?i=tt3896198&apikey=133b8b1e


//SERVER
server.listen(3000);
console.log('movie app server started %s');
//debc0368eb9aad6d905a7962423eafd6
server.on('connection', function(socket) {
  socket.setTimeout(600 * 60 * 1000); // now works perfectly...
})