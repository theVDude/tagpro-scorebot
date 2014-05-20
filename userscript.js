var scorebot = io.connect('http://home.shadomoonaussies.com:3030');
var matchID = {"server": tagpro.host.split('.')[0].split('-')[1], "port": tagpro.host.split(':')[1], "time": tagpro.gameEndsAt};

// for now, we'll just put the most recent in a top left scoreboard
// I'm going to talk to omicron about using prettyText to match all of the rest
// of the text on the page, possibly replacing the FPS/PING/LOSS
var scoreboard = document.createElement('div');
scoreboard.style.position = "absolute";
scoreboard.style.top = "0px";
scoreboard.style.left = "10px";


scorebot.on('sbScoreUpdate', function (e) {
  scoreboard.innerHTML = e.score.r + " - " + e.score.b;
}

// this will send the server a message with the score every time a cap happens, including a matchID
tagpro.socket.on('score', function (e) { scorebot.emit('message', {"match": matchID, "score": { "r": e.r, "b": e.b }); });

// TODO: Loop through players and determine teams from that, this will let us
// set up the ticker like "BNB 2 - 1 TA" and have them properly colored, as well.
//
// We only have to check for one player from each team matching, as well. Once
// we have one from each team, we'll know colors and team names.

// for (x in tagpro.players) {
//   console.log(tagpro.players[x].name);
// }

// we'll want a roster object/array of some sort, I'll think over this at work
