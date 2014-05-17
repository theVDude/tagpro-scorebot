var scorebot = io.connect('http://home.shadomoonaussies.com:3030');
scorebot.on('sbScoreUpdate', function (e) {
  // get score update from server, do something with it!
}

// this will make a call to the server to get the scores
scorebot.emit('sbGetScores');

// this will send the server a message with the score every time a cap happens, including a matchID
tagpro.socket.on('score', function (e) { scorebot.emit('message', {"match": matchID, "score": { "r": e.r, "b": e.b }); });


// Can use groupID from within game? 
// YES, tagpro.group.socket.name

// Find good way to make uniqID for matches, and auto group matches from the same client possibly?
// Still not a great way to do this, can use time, server, port, and map to get close.
