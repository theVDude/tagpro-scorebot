var app = require('http').createServer(handler),
  io = require('socket.io').listen(app),
  fs = require('fs'),
  mongoose = require('mongoose'),
  db = mongoose.connect('mongodb://localhost/test'),
  Schema = mongoose.Schema,
  Match = new Schema({
    match: {
      server: String,
      map: String,
      port: Number,
      time: Number
    },
    score: {
      red: Number,
      redTeam: String,
      blue: Number,
      blueTeam: String
    },

app.listen(3030);


function handler (req, res) {
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
  socket.on('message', function (data) {
    console.log(data);
    //check if there is NOT matching matchID already
    //if not data.matchID in db
    //create match with 0 - 0 score
      //mongodb.insert({"match": data.match, "score": data.score});
    //else
      //mongodb.update({"match": data.match, "score": data.score});
  });
  socket.on('getScore', function() {
    io.sockets.emit('curScores', 'this is a test');
  });
  socket.on('disconnect', function() {
  });
});
