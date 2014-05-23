// Socket.io that listens for score updates, and sends them to clients
// Author: thevdude (rb.cubed@gmail.com)
//
// Node Modules: socket.io, mongodb

//we could assign match id's on this end by teams?

var scores = {};

var app = require('http').createServer(handler),
	io = require('socket.io').listen(app),
	fs = require('fs'),
  mdb = require('mongodb').MongoClient,
	redTeam = "",
  blueTeam = ""

var playerList = [];

app.listen(3030);


function handler (req, res) {
}

function updateTeams (user) {
	teams.findOne({players: user.name}, function (e, d){
		if (e) { console.log(e) } // I think this might happen if a name isn't in the db
		else {
			if ( user.team === 1 ) {
				redTeam = d.abbr;
			} else if ( user.team === 2 ) {
				blueTeam = d.abbr;
			}
		}
		if ( playerList.length && (redTeam === "" || blueTeam ==="" )){
			updateTeams(playerList.shift());
		}
	}
}

function getTeamAbbr (user) {
	mdb.connect('mongodb://192.168.1.15/tagproteams', function (err, db){
		if (err) { return console.log(err); }
		var teams = db.collection('teams');
		updateTeams(user);
	})
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

	// All we really need is for this to pass the score along, so that's all it's doing.
	socket.on('message', function (data) {
		data.redTeam = redTeam;
		data.blueTeam = blueTeam; //<--- obviously will take care of that.
		console.log(data);
		socket.broadcast.emit('sbScoreUpdate', data);
	});
	socket.on('players', function(data){
		for (x in data.players) {
			playerList.push(data.players[x]);
    }
		getTeamAbbr(playerList.shift());
	});
	socket.on('disconnect', function() {
	});
});
