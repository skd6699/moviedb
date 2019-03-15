var    express = require("express");
var app = express();
var http = require('http');
var server = http.createServer(app);


app.set("view engine","ejs");
app.use(express.static("public"));

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
    console.log(fields);
  });
});



//ROUTES
app.get('/', function(req, res) {
    res.render("header");
});









server.listen(3000, 'localhost');
server.on('listening', function() {
    console.log('Express server started on port %s at %s', server.address().port, server.address().address);
});