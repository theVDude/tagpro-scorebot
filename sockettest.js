// Socket.io that listens for score updates, and sends them to clients
// Author: thevdude (rb.cubed@gmail.com)
//
// Node Modules: socket.io, mongodb

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
	mdb.connect('mongodb://localhost/tagproteams', function (err, db){
		if (err) { return console.log(err); }
		var teams = db.collection('teams');
		updateTeams(user);
	})
}


io.sockets.on('connection', function (socket) {
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
