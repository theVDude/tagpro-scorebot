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


app.listen(3030);


function handler (req, res) {
}

function getTeamAbbr (user) {
	mdb.connect('mongodb://localhost/tagproteams', function (err, db){
		if (err) { return console.log(err); }
		var teams = db.collection('teams');
		teams.findOne({players: user.name}, function (e, d){
			if ( user.team === 1 ) {
				redTeam = d.abbr;
			} else if ( user.team === 2 ) {
				blueTeam = d.abbr;
			}
		})
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
			if (redTeam === "" || blueTeam === "") {
				getTeamAbbr(data.players[x]);
			}
    }
	});
	socket.on('disconnect', function() {
	});
});
