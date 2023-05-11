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
  //Initialize state of the room
  if(!socketState[socket.handshake.auth.roomID]){
    socketState[socket.handshake.auth.roomID] = {
      'driver': socket.handshake.auth.user.id,
      'navigators': new Set()
    }
  }else{
    if(socketState[socket.handshake.auth.roomID]['driver']){
      socketState[socket.handshake.auth.roomID]['navigators'].add(socket.handshake.auth.user.id)
    } else{
      socketState[socket.handshake.auth.roomID]['driver'] = socket.handshake.auth.user.id
    }
  }

  //join a room instructed by client
  socket.on("new-user", function () {
    const {roomID, user } = socket.handshake.auth;
    console.log(`new user ${user.id} joining ${roomID}`)
    socket.join(roomID);
    io.to(roomID).emit("user-join", {
      roomID,
      driver: socketState[roomID]['driver'],
      navigators: Array.from(socketState[roomID]['navigators'])
    });
  });

  //emit event from the host/driver
  socket.on("send-event", function (data) {
    const {roomID } = socket.handshake.auth;
    io.to(roomID).emit("user-event", data.event);
  });

  //emit event from the viewer/navigator
  socket.on("agent-event", function (data) {
    const {roomID, user } = socket.handshake.auth;
    data.roomID = roomID;
    data.user = user;
    io.to(data.roomID).emit(data.event, data);
  });

  //Fufill request to change the driver
  socket.on("change-driver", function (data) {
    const {roomID} = socket.handshake.auth;
    console.log(`driving requested by ${data.user.id} in ${roomID}`);
    if(socketState[roomID]['driver']){
      socketState[roomID]['navigators'].add(socketState[roomID]['driver']);
      socketState[roomID]['navigators'].delete(data.user.id);
    }
    socketState[roomID]['driver'] = data.user.id
    io.to(roomID).emit("change-driver", {
      roomID,
      driver: socketState[roomID]['driver'],
      navigators: Array.from(socketState[roomID]['navigators'])
    });
  });

  //Claim driver if none present
  socket.on("claim-driver", function(data) {
    const {roomID, user} = socket.handshake.auth;
    if(!socketState[roomID]['driver']){
      socketState[roomID]['navigators'].delete(user.id);
      socketState[roomID]['driver'] = user.id
      io.to(roomID).emit("change-driver", {
        roomID,
        driver: socketState[roomID]['driver'],
        navigators: Array.from(socketState[roomID]['navigators'])
      });
    }
  });

  //Remove users on disconnect
  socket.on('disconnect', function() {
    const {roomID, user } = socket.handshake.auth;
    if(socketState[roomID]['driver'] == user.id){
      socketState[roomID]['driver'] = false
    } else{
      socketState[roomID]['navigators'].delete(user.id);
    }
    io.to(roomID).emit("user-leave", {
      roomID,
      driver: socketState[roomID]['driver'],
      navigators: Array.from(socketState[roomID]['navigators'])
    });
 });
});



io.listen(4987);
console.log("socket io server started......");
