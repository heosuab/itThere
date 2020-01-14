var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.set('views', __dirname + '/views');

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', function(request, response){
    response.render('index');
});

http.createServer(app).listen(8080, function(){
    console.log('Express listening on port 8080');
});