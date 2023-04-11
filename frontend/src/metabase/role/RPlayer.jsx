import React, { Component } from 'react';
import { io } from "socket.io-client";
import {connect} from "react-redux";
import Utils from "metabase/lib/utils";
import { CSSTransitionGroup } from 'react-transition-group';
import Ping from './Ping';
import { joinRoom, leaveRoom, changeDriver} from "./actions";
import Button from "metabase/core/components/Button";

class RPlayer extends React.Component{
  constructor(props){
    super(props);
    this.wrapper = React.createRef();
    this.state = {
      pings: {}
    }
  }

  componentDidMount() {
    this.replayer = new rrweb.Replayer([], {
      liveMode: true,
      recordCrossOriginIframes: true,
      useVirtualDom: true,
      UNSAFE_replayCanvas: true,
    });
    
    const BUFFER_MS = 500;
    this.replayer.startLive(Date.now() - BUFFER_MS);

    const replayer = document.querySelector('.replayer-wrapper')

    const roomName = this.props.role;
    this.socket = io("http://localhost:4987", {auth: {user: this.props.user, room:roomName}})
    this.socket.on("connect", () => {
      this.socket.emit("new-user", roomName);

      this.socket.emit("agent-event", { event: 'new-viewer', room: roomName});
    
      // received from user side
      this.socket.on("user-event", (data) => {
        this.replayer.addEvent(data);
      });
    
      // sent to server room for agent
      this.socket.emit("receive-event", { event: "new", room: roomName });
    });
    
    this.socket.on("user-join", (roomState) => {
      this.props.joinRoom({role: roomName, room: roomState})
    });

    this.socket.on("user-leave", (roomState) => {
      this.props.leaveRoom({role: roomName, room: roomState})
    });

    this.socket.on("change-driver", (roomState) => {
      this.props.changeDriver({role: roomName, room: roomState})
    });

    replayer.addEventListener("click", (e) => {
      const key = Utils.uuid();
      this.setState(prevState => ({
        pings: {
            ...prevState.pings,
            [key]: e
        }
      }));
      this.socket.emit("agent-event", { x: e.clientX, y: e.clientY, event: 'agent-click', room: roomName});
      setTimeout(() => {
        this.setState(prevState => {
          delete prevState.pings[key];
          return {
            pings: prevState.pings
          }
        });
      }, 700)
    });
  }

  componentWillUnmount(){
    this.replayer.destroy();
  }

  requestDriving = () => {
    console.log('requesting');
    this.socket.emit("request-driving", {});
  }

  render() {
    return <>
      <div className="my-own-wrapper" ref={this.wrapper} onClick={this.onClick}/>
      <div className="flex" style={{position: 'absolute', zIndex: 1000, justifyContent:"center", width: "100%", color: 'white'}}>
        <div style={{width: "25%", lineHeight: '35px'}}>
          <p>Driver User ID:{this.props.room.driver}</p>
        </div>
        <div style={{width: "25%", lineHeight: '35px'}}>
          <p>Navigators User ID:{this.props.room.navigators}</p>
        </div>
        <div style={{width: "25%", lineHeight: '35px'}}>
          <p><Button purple onClick={this.requestDriving}>Request Control</Button></p>
        </div>
      </div>
      <CSSTransitionGroup
        transitionName="example"
        transitionEnterTimeout={400}
        transitionLeaveTimeout={300}>
          {Object.entries(this.state.pings).map(([key,entry]) => <Ping key={key} x={entry.x} y={entry.y} />)}
      </CSSTransitionGroup>
    </>;
  }
}

const mapDispatchToProps = {
  joinRoom, leaveRoom, changeDriver
}

const mapStateToProps = (state, props) => ({
  room: state.role.room[props.role]
});

export default connect(mapStateToProps, mapDispatchToProps)(RPlayer);