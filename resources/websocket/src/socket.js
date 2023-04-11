const { Server } = require("socket.io");
const { createServer } = require("http");
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
  maxHttpBufferSize: 1e8
});
const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");

const { InMemorySessionStore } = require("./sessionStore");
const sessionStore = new InMemorySessionStore();

// io.use((socket, next) => {
//   const sessionID = socket.handshake.auth.sessionID;
//   console.log(sessionID);
//   if (sessionID) {
//     const session = sessionStore.findSession(sessionID);
//     if (session) {
//       socket.sessionID = sessionID;
//       socket.userID = session.userID;
//       socket.username = session.username;
//       return next();
//     }
//   }
//   const username = socket.handshake.auth.username;
//   if (!username) {
//     return next(new Error("invalid username"));
//   }
//   socket.sessionID = randomId();
//   socket.userID = randomId();
//   socket.username = username;
//   next();
// });

const socketState = {}

io.on("connection", (socket) => {
  // // persist session
  // sessionStore.saveSession(socket.sessionID, {
  //   userID: socket.userID,
  //   username: socket.username,
  //   connected: true,
  // });

  // socket.emit("session", {
  //   sessionID: socket.sessionID,
  //   userID: socket.userID,
  // });

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
  console.log(socketState);

  //join a room instructed by client
  socket.on("new-user", function (room) {
    socket.join(room);
    io.to(room).emit("user-join", {
      driver: socketState[room]['driver'],
      navigators: Array.from(socketState[room]['navigators'])
    });
  });

  //emit recevied message to specified room
  socket.on("send-event", function (data) {
    //console.log("message from user in room... " + data.room);
    io.to(data.room).emit("user-event", data.event);
  });

  socket.on("agent-event", function (data) {
    console.log('agent-event');
    console.log(data);
    io.to(data.room).emit(data.event, data);
  });

  socket.on("request-driving", function (data) {
    const {room, user } = socket.handshake.auth;
    console.log(`driving requested by ${user.id} in ${room}`);
    if(socketState[room]['driver']){
      socketState[room]['navigators'].add(socketState[room]['driver']);
      socketState[room]['navigators'].delete(user.id);
    }
    socketState[room]['driver'] = user.id
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

  // receive event from one client and send to other
  // socket.on("event", (data) => {
  //   //console.log(data);
  //   socket.broadcast.emit("event", data);
  // });
});



io.listen(4987);
console.log("socket io server started......");
