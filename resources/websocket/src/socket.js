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
  const firstName = socket.handshake.auth.user.first_name;
  const {roomID, user } = socket.handshake.auth;

  //join a room instructed by client
  socket.on("new-user", function () {
    socket.join(roomID);
    console.log(`new user ${user.id} joining ${roomID}`)
    //for ensuring an update occurs before logging
    //refactor later
    let stateChange;
    if(!socketState[roomID]){
      socketState[roomID] = {
        'driver': user.id,
        'navigators': new Set(),
        'names': {[user.id]: user.first_name}
      }
      stateChange = true;
    }else{
      if(socketState[roomID]['driver'] && socketState[roomID]['driver'] != user.id){
        if(!socketState[roomID]['navigators'].has(user.id)){
          socketState[roomID]['navigators'].add(user.id)
          stateChange = true;
        }
      } else if(!socketState[roomID]['driver']){
        socketState[roomID]['driver'] = user.id
        stateChange = true;
      }
      socketState[roomID]['names'][user.id] = firstName
    }

    io.to(roomID).emit("user-join", {
      roomID,
      driver: socketState[roomID]['driver'],
      navigators: Array.from(socketState[roomID]['navigators']),
      names: socketState[roomID]['names']
    });

    if(stateChange){
      logData({
        auth: socket.handshake.auth,
        roomState: socketState[roomID],
        activity: {action: 'JOIN_ROOM'}
      })
    }
  });

  //emit event from the host/driver
  socket.on("send-event", function (data) {
    io.to(roomID).emit("user-event", data.event);
  });

  //emit event from the viewer/navigator
  socket.on("agent-event", function (data) {
    const {event, ...otherData} = data;

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
    let stateChange = false;

    if(socketState[roomID]['driver'] == user.id){
      socketState[roomID]['driver'] = false;
      stateChange = true;
    } else if(socketState[roomID]['navigators'].has(user.id)){
      socketState[roomID]['navigators'].delete(user.id);
      stateChange = true;
    }

    io.to(roomID).emit("user-leave", {
      roomID,
      driver: socketState[roomID]['driver'],
      navigators: Array.from(socketState[roomID]['navigators']),
      names: socketState[roomID]['names']
    });
    delete socketState[roomID]['names'][user.id];

    if(stateChange){
      logData({
        auth: socket.handshake.auth,
        roomState: socketState[roomID],
        activity: {action: 'LEAVE_ROOM'}
      })
    }
 });
});

const port = process.env['MB_WS_PORT'] ? process.env['MB_WS_PORT'] : 4987;

io.listen(port);
console.log("socket io server started on port " + port);
