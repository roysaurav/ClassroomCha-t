var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var chat = require('./routes/chat');
var profile = require('./routes/profile');
var registration = require('./routes/registration');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/chat', chat);
app.use('/profile', profile);
app.use('/registration', registration);

// Chat room stuff

var numUsers = 0;

/*
 *
 * Socket is essentially a user
 *
 */

io.sockets.on('connection', function (socket) {
  var addedUser = false;
  let userRoom = '';

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    newMessage(socket, data);
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    addUser(socket, username, addedUser);
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    disconnect(socket, addedUser);
  });

  socket.on('join-room', function(room){
    socket.join(room);
    userRoom = room;
  });

});


function newMessage(socket, data){

    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });

}

function addUser(socket, username, user){
 
    if (user) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });

}

function disconnect(socket, user){
  
    if (user) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }

}  

http.listen(3000, function(){
    console.log('listening on *:3000');
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;