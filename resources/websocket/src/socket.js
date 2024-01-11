const { Server } = require("socket.io");
const { createServer } = require("http");
const Credentials = require('./Credentials.js')
const axios = require('axios');
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
  maxHttpBufferSize: 1e8
});

const credentials = new Credentials({
  username: process.env['MB_API_USERNAME'],
  password: process.env['MB_API_PASSWORD']
})

async function putRequest(data){
  const currentCreds = await credentials.getCredentials();
  
  const headers = { "X-Metabase-Session": currentCreds.id}
  try{
      const response = await axios.put(`${credentials.siteURL}/api/room-activity`, data, { headers });
      return response
  }catch(e){
    if(e.response){
      return e.response
    }else{
      console.log(e)
      return e
    }
  }
}

async function logData(args){
  const {auth, activity, roomState} = args;

  const { user, groupId, role } = auth;

  const data = {
    user_id: user.id,
    group_id: groupId,
    role,
    activity,
  };

  if(roomState){
    data.room_state = {
      driver: roomState['driver'],
      navigators: [...roomState['navigators'].values()]
    }
  }

  const res = await putRequest(data);

  if(res.status && res.status == 401){
    await credentials.updateCredentials()
    const retry = await putRequest(data)
    return retry
  }else{
    return res
  }
}



const socketState = {}
io.on("connection", (socket) => {
  //Initialize state of the room
  const userId = socket.handshake.auth.user.id;
  const firstName = socket.handshake.auth.user.first_name;

  if(!socketState[socket.handshake.auth.roomID]){
    socketState[socket.handshake.auth.roomID] = {
      'driver': userId,
      'navigators': new Set(),
      'names': {[userId]: socket.handshake.auth.user.first_name}
    }
  }else{
    if(socketState[socket.handshake.auth.roomID]['driver']){
      socketState[socket.handshake.auth.roomID]['navigators'].add(socket.handshake.auth.user.id)
    } else{
      socketState[socket.handshake.auth.roomID]['driver'] = socket.handshake.auth.user.id
    }
    socketState[socket.handshake.auth.roomID]['names'][userId] = firstName
  }

  //join a room instructed by client
  socket.on("new-user", function () {
    const {roomID, user } = socket.handshake.auth;
    console.log(`new user ${user.id} joining ${roomID}`)
    socket.join(roomID);
    io.to(roomID).emit("user-join", {
      roomID,
      driver: socketState[roomID]['driver'],
      navigators: Array.from(socketState[roomID]['navigators']),
      names: socketState[roomID]['names']
    });

    logData({
      auth: socket.handshake.auth,
      roomState: socketState[roomID],
      activity: {action: 'JOIN_ROOM'}
    })
  });

  //emit event from the host/driver
  socket.on("send-event", function (data) {
    const {roomID } = socket.handshake.auth;
    io.to(roomID).emit("user-event", data.event);
  });

  //emit event from the viewer/navigator
  socket.on("agent-event", function (data) {
    const {event, ...otherData} = data;

    const {roomID, user } = socket.handshake.auth;
    data.roomID = roomID;
    data.user = user;
    io.to(data.roomID).emit(data.event, data);

    if(event !== 'new-viewer'){
      logData({
        auth: socket.handshake.auth,
        activity: {action: event, ...otherData}
      })
    }
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

    logData({
      auth: socket.handshake.auth,
      roomState: socketState[roomID],
      activity: {action: 'CHANGE_DRIVER'}
    })
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
      logData({
        auth: socket.handshake.auth,
        roomState: socketState[roomID],
        activity: {action: 'CLAIM_DRIVER'}
      })
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
    delete socketState[roomID]['names'][user.id]
    io.to(roomID).emit("user-leave", {
      roomID,
      driver: socketState[roomID]['driver'],
      navigators: Array.from(socketState[roomID]['navigators']),
      names: socketState[roomID]['names']
    });
    logData({
      auth: socket.handshake.auth,
      roomState: socketState[roomID],
      activity: {action: 'LEAVE_ROOM'}
    })
 });
});



io.listen(4987);
console.log("socket io server started......");
