var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// app.get('/', function(req, res){
// 	res.sendFile(__dirname + '/index.html');
// });

app.use(express.static(__dirname));

var users = [];
var clients = [];

io.on('connection', function(socket){
  var name = gu(); //generate username for new user
  console.log('user connected and was granted the name: ' + name);
  socket.broadcast.emit('system message', 'User <' + name + '> has connected.');
  users[name]=socket.id;
  clients[socket.id] = socket;
  socket.username = name;

  socket.on('disconnect', function(){
    console.log('user <' + name + '> disconnected: freeing username');
    socket.broadcast.emit('system message', 'User <' + name + '> has disconnected.');
    free_username(name);
    delete clients[socket.id];
    delete users[socket.username];
    // console.log(clients);
    // console.log(users);
  });
  socket.on('chat message', function(msg){
    //console.log('message: ' + msg);
    //could use io.emit(someevent, {for: 'everyone'});
    //socket.broadcast.emit('hi');
    io.emit('chat message', msg);
	});
  socket.on('pm', function(msg, target){
  	console.log("Recieved pm: " + "Target: " + target + " Message: " + msg);

  });	


});



http.listen(3000, function(){
	console.log('listening on *:3000');
})

//Helper functions

function gu(){
	if(gu.numOfNames<gu.MAX_NAMES){
		while(true){
			var name =  gu.base[getRandomInt(0, gu.base.length)] + gu.suffix[getRandomInt(0, gu.suffix.length)];
			if(!gu.get[name]){
				gu.get[name]=true;
				gu.numOfNames+=1;
				return name;
			}
		}
	}else{
		console.log('failed to generate name: all names taken');
	}
}
gu.numOfNames = 0;
gu.get = new Object();
gu.base = ['bard', 'ranger', 'fighter', 'mage', 'acolyte', 'rogue']
gu.suffix = ['jade', 'ruby', 'amber','topaz', 'diamond']
gu.MAX_NAMES = gu.base.length * gu.suffix.length;

function free_username(name){
	if(gu.get[name]){
		gu.get[name]=undefined;
		gu.numOfNames-=1;
		console.log('username: ' + name + ' freed.')
		console.log('Currently there are: ' + gu.numOfNames + ' names in use.');
	}
}

function getRandomInt(min, max) { //[min, max)
  return Math.floor(Math.random() * (max - min)) + min;
}