var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var async = require('async');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'data',
	password : 'data',
	database : 'data'
});

var app = express();
app.set('view engine', 'ejs');
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.use(express.static('public'));
app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/account', function (request, response) {
	if(request.session.loggedin)
		response.sendFile( __dirname + "/" + "public/code.html" );
	else
		response.sendFile( __dirname + "/" + "public/account.html" );
});

app.post('/authentication', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM logic_ac WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect("http://localhost:3000/code.html");
				response.end();
			}
			else{
				connection.query('insert into logic_ac values(?,?)',[username,password], function(error, results, fields) {
					if(error)
						response.send('you have already account!');
					else{
						request.session.loggedin = true;
						request.session.username = username;
						response.redirect("http://localhost:3000/code.html");
						response.end();
					}
				});
			}			
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.post('/code_upload', function (request, response) {
	if(request.session.loggedin){
		response.redirect("http://localhost:3000/code_upload.html");
	}
	else
        response.redirect("http://localhost:3000/account.html");
});

app.post('/code_purchase', function (request, response) {
	if(request.session.loggedin){
		response.redirect("http://localhost:3000/code.html");
	}
	else
        response.redirect("http://localhost:3000/account.html");
});

app.post('/course_upload', function (request, response) {
	if(request.session.loggedin){
		response.redirect("http://localhost:3000/code_upload.html");
	}
	else
        response.redirect("http://localhost:3000/account.html");
});

app.post('/course_purchase', function (request, response) {
	if(request.session.loggedin){
		response.redirect("http://localhost:3000/code.html");
	}
	else
        response.redirect("http://localhost:3000/account.html");
});

app.get('/code/:subject', function (request, response) {
	if(request.session.loggedin){
		connection.query("SELECT * FROM codes where subject = ?",[request.params.subject], function (error, rows, fields) {
			if (!!error) {
				console.log('Error in the query');
			} else {
				response.render('codes', { page_title: "Item",data: rows });
			}
		});
	}
	else
        response.redirect("http://localhost:3000/account.html");
});

app.get('/code_info/:id', function (request, response) {
	if(request.session.loggedin){
		connection.query("SELECT * FROM codes where id = ?",[request.params.id], function (error, rows, fields) {
			if (!!error) {
				console.log('Error in the query');
			} else {
				response.render('code_info', { page_title: "Item",data: rows });
			}
		});
	}
	else
        response.redirect("http://localhost:3000/account.html");
});

app.listen(3000);