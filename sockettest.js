// Socket.io that listens for score updates, and sends them to clients
// Author: thevdude (rb.cubed@gmail.com)
//
// Node Modules: socket.io

var app = require('http').createServer(handler),
  io = require('socket.io').listen(app),
  fs = require('fs')


app.listen(3030);


function handler (req, res) {
}

io.sockets.on('connection', function (socket) {
  // All we really need is for this to pass the score along, so that's all it's doing.
  socket.on('message', function (data) {
    console.log(data);
    socket.broadcast.emit('sbScoreUpdate', data);
  });
  socket.on('disconnect', function() {
  });
});
