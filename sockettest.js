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
  mdb = require('mongodb').MongoClient

function onPlayers (e) {
    //find teams
    var redAbbr = "";
    var blueAbbr = "";
    var playerList = [];

    for (x in e.players) {
      playerList.push(e.players[x])
    }

    getTeamAbbr(playerList.shift());
}

function getTeamAbbr (user) {
  mdb.connect('mongodb://192.168.1.15/tagproteams', function (err, db){
    if (err) { return console.log(err); }
    var teams = db.collection('teams');
    updateTeams(user);
  });
}


function updateTeams (user) {
  // teams not defined fuk u
  teams.findOne({players: user.name}, function (e, d){
    if (e) { console.log(e) } // I think this might happen if a name isn't in the db
    else {
      if ( user.team === 1 ) {
        redAbbr = d.abbr;
      } else if ( user.team === 2 ) {
        blueAbbr = d.abbr;
      }
    }
    if ( playerList.length && (redAbbr === "" || blueAbbr === "" )){
      updateTeams(playerList.shift());
    } else if ( redAbbr != "" && blueAbbr != "" ) {

      // this shit has to be at the end of the call backs, or it'll happen before the abbr gets set
      if (!scores[e.matchID]) {
        scores[e.matchID] = {redTeam: redAbbr, blueTeam: blueAbbr, redScore: 0, blueScore: 0};
      }

      // too sleepy to look up the right emit for this, I think it's socket.broadcast.emit
      // not that it matters, socket not defined. callbacks are too fucking annoying!
      socket.emit('scores', scores);
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

  socket.on('players', onPlayers);

});

