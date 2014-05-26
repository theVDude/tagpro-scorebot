// Socket.io that listens for score updates, and sends them to clients
// Author: thevdude (rb.cubed@gmail.com)
//
// Node Modules: socket.io

//we could assign match id's on this end by teams?

var scores = {};

var app = require('http').createServer(handler),
  io = require('socket.io').listen(app),
  fs = require('fs')


app.listen(3030);


function handler (req, res) {
}

io.sockets.on('connection', function (socket) {
  // All we really need is for this to pass the score along, so that's all it's doing.
  //we will need to initialize the scores for each client, so we should check for repeats and 
  //initialize a new game on connection from a client.
  socket.on('message', function (data) {
  	data.redTeam = "red";
  	data.blueTeam = "blue"; //<--- obviously will take care of that.
    console.log(data);
    socket.broadcast.emit('sbScoreUpdate', data);

    scores[data.matchId] = {data.redTeam: data.score.r, data.blueTeam: data.score.b};
  });

  socket.on('disconnect', function() {
  });

  socket.on('players', function(e) {
    //find teams
    var redTeam = "red";
    var blueTeam = "blue";
    if (!scores[e.matchId]) {
      scores[e.matchId] = {redTeam: 0, blueTeam: 0};
    }
    socket.emit('scores', scores);
  });

});
