var LoginApi = require('../jws/login');
var winston = require('winston');
var _ = require('underscore');

// online users
var users = {
  /*
  [userId]: {
    user: user,
    clients: [c1, c2, ...]
  }
  */
};

function addSocketToUser(user, socket) {
  var userId = user.userId;
  var u = users[userId] = users[userId] || {
    user: user,
    clients: []
  }
  u.clients.push(socket);
}

function removeSocketFromUser(userId, socket) {
  var u = users[userId];
  if (!u || !u.clients) {
    winston.error('user', userId, 'not exists in message clients');
    return;
  }

  var found = false;
  for (var i = 0; i < u.clients.length ; ++i) {
    if (!found && u.clients[i] == socket) {
      found = true;
    }
    if (found && i < u.clients.length - 1) {
      u.clients[i] = u.clients[i + 1];
    }
  }
  if (found) {
    u.clients.pop();  // remove last one
  }
}

function getOnlines() {
  var rs = [];
  _.each(users, function (u) {
    rs.push(u.user);
  });
  return rs;
}

function sendMessageToUser(userId, message) {
  var u = users[userId];
  if (!u || !u.clients) {
    return false;
  }
  _.each(u.clients, function (c) {
    c.emit('message', message);
  })
  return true;
}

function onconnection (socket) {
  console.log('socket ip', socket.request.connection.remoteAddress);
  socket.emit('sendverify');


  socket.on('myevent', function (data) {
    console.log(data);
  })
  socket.on('disconnect', function () {
    console.log('client leave');
    removeSocketFromUser(socket._novaUserId, socket);
  })

  socket.on('verify', function (data) {
    console.log(data.tgt);
    var tgt = data.tgt;
    var req = {
      _novaRequestId: 0,
      _novaLogs: [],
      _novaStart: Date.now(),
      generalArgument: {
        ip: socket.request.connection.remoteAddress
      }
    };
    LoginApi(req).loginVerify({
      tgt: tgt
    })
    .then(function(rsp) {
      // add socket to users
      var user = rsp.data;
      socket._novaUserId = user.userId;
      addSocketToUser(user, socket);
    })
    .catch(function(rsp) {
      console.log('verify error', rsp);
    });
  })
}

module.exports = {
  onconnection: onconnection,
  getOnlines: getOnlines,
  sendMessageToUser: sendMessageToUser
}
