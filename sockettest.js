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
  teams

function updateTeams (playerList, e, socket) {
  user = playerList.shift();
  console.log('user: ' + JSON.stringify(user));
  console.log('socket data: ' + JSON.stringify(e));
  console.log('scores before: ' + JSON.stringify(scores[e.matchID]));
  teams.findOne({players: user.name}, function (err, d){
    if (err) { console.log(err) } // I think this might happen if a name isn't in the db
    else {
      if ( user.team === 1 ) {
        console.log('red team: ' + d.abbr);
        console.log('matchID: ' + e.matchID);
        scores[e.matchID].redAbbr = d.abbr;
      } else if ( user.team === 2 ) {
        console.log('blue team: ' + d.abbr);
        console.log('matchID: ' + e.matchID);
        scores[e.matchID].blueAbbr = d.abbr;
      }
    }
    if ( scores[e.matchID].redAbbr != "" && scores[e.matchID].blueAbbr != "" ) {
      console.log('scores: ' + JSON.stringify(scores));

      socket.broadcast.emit('scores', scores);
      //io.sockets.emit('scores', scores);
      return;
    }
    if ( playerList.length && (scores[e.matchID].redAbbr == "" || scores[e.matchID].blueAbbr == "") ) {
      console.log("let's do it again! " + JSON.stringify(playerList));
      updateTeams(playerList, e, socket);
    }
  });
}

app.listen(3030);

function handler (req, res) {
  // test page!
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
  //we will need to initialize the scores for each client, so we should check for repeats and 
  //initialize a new game on connection from a client.

  socket.on('scoreUpdate', function (data) {
    //data.redTeam = "red";
    //data.blueTeam = "blue"; //<--- obviously will take care of that.
    console.log(scores[data.matchID]);
    data.redAbbr = scores[data.matchID].redAbbr
    data.blueAbbr = scores[data.matchID].blueAbbr
    console.log(data);
    socket.broadcast.emit('sbScoreUpdate', data);

    scores[data.matchID].redScore = data.score.r;
    scores[data.matchID].blueScore = data.score.b;
  });

  socket.on('disconnect', function() {
  });

  socket.on('players', function(e) {
    //find teams
    var playerList = [];
    if (!scores[e.matchID]) {
      scores[e.matchID] = {redScore: 0, blueScore: 0};
      scores[e.matchID].redAbbr = '';
      scores[e.matchID].blueAbbr = '';
    }

    for (x in e.players) {
      playerList.push(e.players[x])
    }

    console.log('player list: ' + JSON.stringify(playerList));

    mdb.connect('mongodb://localhost/tagproteams', function (err, db){
      if (err) { return console.log(err); }
      teams = db.collection('teams');
      updateTeams(playerList, e, socket);
    });
  });
});

