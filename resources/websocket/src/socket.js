const { Server } = require("socket.io");
const { createServer } = require("http");
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
  maxHttpBufferSize: 1e8
});

const socketState = {}

io.on("connection", (socket) => {
  if(!socketState[socket.handshake.auth.room]){
    socketState[socket.handshake.auth.room] = {
      'driver': socket.handshake.auth.user.id,
      'navigators': new Set()
    }
  }else{
    if(socketState[socket.handshake.auth.room]['driver']){
      socketState[socket.handshake.auth.room]['navigators'].add(socket.handshake.auth.user.id)
    } else{
      socketState[socket.handshake.auth.room]['driver'] = socket.handshake.auth.user.id
    }
  }

  //join a room instructed by client
  socket.on("new-user", function (room) {
    console.log(`new user joining${room}`)
    socket.join(room);
    io.to(room).emit("user-join", {
      driver: socketState[room]['driver'],
      navigators: Array.from(socketState[room]['navigators'])
    });
  });

  //emit recevied message to specified room
  socket.on("send-event", function (data) {
    io.to(data.room).emit("user-event", data.event);
  });

  socket.on("agent-event", function (data) {
    const {room, user } = socket.handshake.auth;
    data.room = room;
    data.user = user;
    io.to(data.room).emit(data.event, data);
  });

  socket.on("change-driver", function (data) {
    const {room} = socket.handshake.auth;
    console.log(`driving requested by ${data.user.id} in ${room}`);
    if(socketState[room]['driver']){
      socketState[room]['navigators'].add(socketState[room]['driver']);
      socketState[room]['navigators'].delete(data.user.id);
    }
    socketState[room]['driver'] = data.user.id
    io.to(room).emit("change-driver", {
      driver: socketState[room]['driver'],
      navigators: Array.from(socketState[room]['navigators'])
    });
  });

  socket.on('disconnect', function() {
    const {room, user } = socket.handshake.auth;
    if(socketState[room]['driver'] == user.id){
      socketState[room]['driver'] = false
    } else{
      socketState[room]['navigators'].delete(user.id);
    }
    io.to(room).emit("user-leave", {
      driver: socketState[room]['driver'],
      navigators: Array.from(socketState[room]['navigators'])
    });
 });
});



io.listen(4987);
console.log("socket io server started......");
