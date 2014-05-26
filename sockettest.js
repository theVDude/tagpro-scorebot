// Socket.io that listens for score updates, and sends them to clients
// Author: thevdude (rb.cubed@gmail.com)
//
// Node Modules: socket.io, mongodb

//we could assign match id's on this end by teams?

var scores = {};
// formatted as { {server: 'maptest', port: '8008', time: TIMESTAMP}: {redAbbr: "BNB", blueAbbr: "BC", redScore: 0, blueScore: 0}, ... }

var app = require('http').createServer(handler),
  io = require('socket.io').listen(app),
  fs = require('fs'),
  mdb = require('mongodb').MongoClient,
  teams,
  redAbbr = "",
  blueAbbr = ""

function updateTeams (playerList, e) {
  user = playerList.shift();
  console.log('user: ' + JSON.stringify(user));
  console.log('socket data: ' + JSON.stringify(e));
  teams.findOne({players: user.name}, function (err, d){
    if (err) { console.log(err) } // I think this might happen if a name isn't in the db
    else {
      if ( user.team === 1 ) {
        console.log('red team: ' + d.abbr);
        redAbbr = d.abbr;
      } else if ( user.team === 2 ) {
        console.log('blue team: ' + d.abbr);
        blueAbbr = d.abbr;
      }
    }
    if ( redAbbr === "" || blueAbbr === "" ){
      console.log("let's do it again! " + JSON.stringify(playerList));
      updateTeams(playerList, e);
    }
    if ( redAbbr != "" && blueAbbr != "" ) {
      console.log('red abbr: ' + redAbbr + ' blue abbr: ' + blueAbbr);
      if (!scores[e.matchID]) {
        scores[e.matchID] = {redTeam: redAbbr, blueTeam: blueAbbr, redScore: 0, blueScore: 0};
      }

      console.log('scores: ' + JSON.stringify(scores));

      // too sleepy to look up the right emit for this, I think it's socket.broadcast.emit
      socket.broadcast.emit('scores', scores);
      //io.sockets.emit('scores', scores);
    }
  });
}



app.listen(3030);


function handler (req, res) {
}

io.sockets.on('connection', function (socket) {
  //we will need to initialize the scores for each client, so we should check for repeats and 
  //initialize a new game on connection from a client.

  socket.on('message', function (data) {
    //data.redTeam = "red";
    //data.blueTeam = "blue"; //<--- obviously will take care of that.
    data.redTeam = scores[data.matchID].redAbbr
    data.blueTeam = scores[data.matchID].blueAbbr
    console.log(data);
    socket.broadcast.emit('sbScoreUpdate', data);

    scores[data.matchID] = {redScore: data.score.r, blueScore: data.score.b};
  });

  socket.on('disconnect', function() {
  });

  socket.on('players', function(e) {
    //find teams
    redAbbr = "";
    blueAbbr = "";
    var playerList = [];

    for (x in e.players) {
      playerList.push(e.players[x])
    }

    console.log('player list: ' + JSON.stringify(playerList));

    mdb.connect('mongodb://192.168.1.15/tagproteams', function (err, db){
      if (err) { return console.log(err); }
      teams = db.collection('teams');
      updateTeams(playerList, e);
    });
  });
});

