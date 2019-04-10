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
    var flash             = require('connect-flash');
    var crypto            = require('crypto');
    var passport          = require('passport');
    var LocalStrategy     = require('passport-local').Strategy;
    var session              = require('express-session');
    var MySQLStore = require('express-mysql-session')(session);
var p = [];
const bcrypt = require('bcrypt');
const {google} = require('googleapis');
// const oauth2Client = new google.auth.OAuth2(
//   '577975357388-euj5306150gtj7p7rl54k9akt7o064bd.apps.googleusercontent.com',
//   'NP-qYGKKIfUZD9yTzpGeWioN',
//   'http://localhost:3000/'
// );
var GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: '577975357388-euj5306150gtj7p7rl54k9akt7o064bd.apps.googleusercontent.com',
    clientSecret: 'NP-qYGKKIfUZD9yTzpGeWioN',
    callbackURL: "http://localhost:3000/auth/google/callback"
  },function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    var users={
    "Name":profile.displayName,
    "id":profile.id
  }
  console.log(profile.id);
  // var query = "SELECT COUNT(*) from users where id ="+users.id;
  // con.query(query,function(err,result){
  //   console.log(result);
  // });

con.query('INSERT INTO users SET ?',users, function (error, results, fields) {
                                if (error) {
                                  console.log("error ocurred",error);
                              }else{
                                  console.log('The solution is: ', results);
                                  console.log("Registered");   
                                 }
  
  });
                            }));
const cookieParser = require('cookie-parser'),
    cookieSession = require('cookie-session');
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(cookieSession({
    name: 'session',
    keys: ['123']
}));

app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

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


    var sessionStore = new MySQLStore({   clearExpired: true,
    // How frequently expired sessions will be cleared; milliseconds:
    checkExpirationInterval: 900000,
    // The maximum age of a valid session; milliseconds:
    expiration: 86400000,
    connectionLimit: 1,
    createDatabaseTable: true,
        charset: 'utf8mb4_bin',
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    },
    endConnectionOnClose: true}/* session store options */, con);
    app.use(session({
    key:"session",
    secret:"WinterSoldier",
    store:sessionStore,
    resave: false,
    saveUninitialized: false
}));
app.get("/",function(req, res,next) {
                    let noofmovies,movies;
                    con.query("SELECT COUNT(*) AS noofmovies FROM watched",function(err,result){
                    noofmovies = result[0]["noofmovies"];
                    con.query("SELECT DISTINCT(Language) as lang ,Count(Movie) as count from watched group by lang;",function(err,result){
                    movies = result;
                       res.render("header",{noofmovies:noofmovies,movies:movies});
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
let genre = req.body.genre;
let runtime = req.body.runtime;
console.log(runtime);
runtime = parseInt(runtime,10); 
console.log(runtime);
var count = 0;
var today = yyyy + '-' + mm + '-' + dd;
console.log(today);
var movie = req.body.moviename;
var myrating = req.body.myrating;
var str = req.body.language;
if(/[,\-]/.test(str) == true)
str = str.substring(0,str.indexOf(","));
var sql = "INSERT INTO watched (Movie,Language,My_Rating,Date,Runtime,Genre) VALUES ('" + movie + "','" + str + "','" + myrating + "','" + today + "','"+runtime+"','"+genre+"')";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });
res.redirect("/app/"+iid);
});
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    // req.session.token = req.user.token;
    console.log("logged in");
    res.redirect('/');
  });

app.get("/stats",function(req, res,next) {

              var topratedmovies=0,recent,dt,yearm=0,y=0;
              let m;
                    con.query("SELECT Movie AS topratedmovies FROM watched where My_Rating=10",function(err,result){
                    topratedmovies = result;
                    con.query("SELECT Movie,Language,My_Rating FROM watched ORDER BY Date DESC LIMIT 5;",function(err,result){
                    recent = result;
                    con.query("SELECT YEAR(Date) AS y,COUNT(MOVIE) as yearmovies,SUM(Runtime) as yearruntime FROM watched where Date!='null' GROUP BY y",function(err,result){
                     y = result;
                    con.query("SELECT YEAR(Date) AS y,MONTH(Date) AS m,COUNT(MOVIE) as yearmovies ,SUM(Runtime) as monthruntime FROM watched where Date!='null' GROUP BY y,m",function(err,result){
                     m = result;               
                    res.render("stats",{topratedmovies:topratedmovies,recent:recent,yearmovies:y,monthmovies:m});
                    });
                    });
                    }); 
                    });
                    });

app.post("/stats",function(req, res,next) {
               var ratedmovies=0,recent,y,dates,dt,m;
                    if(req.body.rating){
                      var rating = req.body.rating;
                    con.query("SELECT Movie AS ratedmovies FROM watched where My_Rating="+rating,function(err,result){
                      ratedmovies = result;
                      con.query("SELECT Movie,Language,My_Rating FROM watched ORDER BY Date DESC LIMIT 5;",function(err,result){
                        recent = result;
                        con.query("SELECT YEAR(Date) AS y,COUNT(MOVIE)as yearmovies,SUM(Runtime) as yearruntime FROM watched where Date!='null' GROUP BY y",function(err,result){
                        y = result;
                        con.query("SELECT YEAR(Date) AS y,MONTH(Date) AS m,COUNT(MOVIE) as yearmovies,SUM(Runtime) as monthruntime FROM watched where Date!='null' GROUP BY y,m",function(err,result){
                     m = result;
                                         res.render("stats",{ratedmovies:ratedmovies,recent:recent,yearmovies:y,monthmovies:m});
                    });
                    
                             });
                      });
                      
                  });}
                    else 
                      res.redirect("/stats");
              
            }); 
                  
//http://www.omdbapi.com/?i=tt3896198&apikey=133b8b1e

//AUTH ROUTES
app.get("/register",function(req,res){
  res.render("register.ejs");
});
app.post("/register",function(req,res){
    var today = new Date();
  var users={
    "Name":req.body.name,
    "email":req.body.email,
    "password":req.body.password,
    "created":today,
    "modified":today
  
  }
     bcrypt.hash(users.password, 10, function(err, hash){
            if(err) console.log(err);
            users.password = hash;
            console.log(users.password); //shows hashed password
                              con.query('INSERT INTO users SET ?',users, function (error, results, fields) {
                                if (error) {
                                  console.log("error ocurred",error);
                                  res.send({
                                    "code":400,
                                    "failed":"error ocurred"
                                  })
                                }else{
                                  console.log('The solution is: ', results);
                                  console.log("Registered");
                                  
                              res.redirect("/");
                              }

                            });

            //>>query logic should go here.
        });
});
app.get("/login",function(req,res){
res.render("login");
});

app.post("/login",function(req,res){

   var email= req.body.email;
  var password = req.body.password;
  
  con.query('SELECT * FROM users WHERE email = ?',[email], function (error, results, fields) {
  if (error) {
    // console.log("error ocurred",error);
    res.send({
      "code":400,
      "failed":"error ocurred"
    })
  }else{
    // console.log('The solution is: ', results);
    if(results.length >0){

 bcrypt.compare(req.body.password, results[0].password, function(err, result) {
         console.log('>>>>>> ', password)
         console.log('>>>>>> ', results[0].password)
         if(result) {
           // return res.send();
  console.log("Logged in");

                                  var sessionStore = new MySQLStore({}/* session store options */, con);
res.redirect("/");
         }
         else {
           return res.status(400).send();
         }
});}
     
    else{
      res.send({
        "code":204,
        "success":"Email does not exits"
          });
    }
  }
  });
});


app.get('/logout', function(req, res) {
       req.logout();
        res.redirect('');
});








//SERVER
server.listen(3000);
console.log('movie app server started %s');
//debc0368eb9aad6d905a7962423eafd6
server.on('connection', function(socket) {
  socket.setTimeout(600 * 60 * 1000); // now works perfectly...
})
