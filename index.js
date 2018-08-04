const express = require("express");
const app = express();
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');

let filter = require('./public/filter');
let filterInst = filter();

let PORT = process.env.PORT || 3300;

app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));

app.listen(PORT, function() {
  console.log('App starting on port', PORT);
});

app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(bodyParser.json());

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.render('home');
});

app.get('/dashboard', function(req, res){
  res.render('dashboard');
});

app.get('/moments', function(req, res){
  res.render('moments');
});

app.post('/moments', function(req, res){
  res.render('moments', filterInst(req.body.filterMoments));
});

app.get('/community', function(req, res){
  res.render('community');
});

app.get('/one-on-one', function(req, res){
  res.render('one-on-one');
});
