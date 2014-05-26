// ==UserScript==
// @name          ScoreBot userscript
// @namespace     http://home.shadomoonaussies.com
// @description   The client-side portion of the MLTP score tracking system
// @include       http://tagpro-*.koalabeast.com:*
// @license       GNU General Public License
// @author        BBQchicken and pooppants
// @version       1.0.0
// ==/UserScript==

function getTime() {
	var totalSecs = (new Date() - tagpro.gameEndsAt)/1000;
	var minutes = Math.floor(totalSecs / 60);
	var seconds = Math.floor(totalSecs % 60);
	return {"minutes": minutes, "seconds": seconds};
}

var scorebot = io.connect('http://home.shadomoonaussies.com:3030');

// consider moving this line into the tagpro.on('time'), if a user joins after the initial countdown it'll show the same match twice
var matchID = {"server": tagpro.host.split('.')[0].split('-')[1], "port": tagpro.host.split(':')[1], "time": tagpro.gameEndsAt};

tagpro.on('time', function(e) {
	if (tagpro.state === 1) {scorebot.emit('players', {"players" : tagpro.players, "matchID": matchID})};
	// let's reply to this with something so we know it's received?
});

// for now, we'll just put the most recent in a top left scoreboard
var scoreboard = document.createElement('div');
scoreboard.style.position = "absolute";
scoreboard.style.top = "0px";
scoreboard.style.left = "10px";

var scores = {};

scorebot.on('scores', function(e) {
	scores = e;
}); 

scorebot.on('sbScoreUpdate', function (e) {
  scoreboard.innerHTML = e.redTeam + " " + e.score.r + " - " + e.score.b + " " + e.blueTeam + "<p>" + e.time + "</p>";
}

// this will send the server a message with the score every time a cap happens, including a matchID
tagpro.socket.on('score', function (e) { 
	scorebot.emit('message', 
	{
		"match": matchID, 
		"score": { "r": e.r, "b": e.b },
		"time": getTime() 
    })
});
