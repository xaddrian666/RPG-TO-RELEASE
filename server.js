var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var online_players = [];

app.use(express.static(path.join(__dirname, '/')));

app.get('/',function(req,res){

     res.sendFile('game.html');

});

entity = {name:"cow", x:300, y:300};

io.on('connection', function(socket){
  socket.on('player joined', function(txt) {
    console.log(txt);
    io.emit('test', entity);
    io.emit('chat message', txt);
  });
  socket.on('chat message', function(txt) {
    io.emit('chat message', txt);
  });
  // socket.on('new player', function(player){
  //   console.log(player.name+' connected');
  //   online_players.push(player);
  //   io.emit('update players', online_players);
  //   socket.on('player moving', function(name, nx, ny){
  //     socket.broadcast.emit('update player', name, nx, ny);
  //   });
  //   socket.on('turn lighter', function(name, state){
  //     socket.broadcast.emit('update lighter', name, state);
  //   });
  //   socket.on('disconnect', function(){
  //     var pl = online_players.map(function(x){ return x.name; }).indexOf(player.name);
  //     online_players.splice(pl, 1);
  //     io.emit('update players', online_players);
  //   });
  // });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
