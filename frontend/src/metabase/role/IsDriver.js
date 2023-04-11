/* eslint-disable react/prop-types */
import React, {useEffect} from "react";
import { io } from "socket.io-client";
import {connect} from "react-redux";
import Utils from "metabase/lib/utils";
import { CSSTransitionGroup } from 'react-transition-group';
import Ping from "./Ping";
import { joinRoom, leaveRoom, changeDriver} from "./actions";

class IsDriver extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      pings: {}
    }
  }

  componentDidMount(){
    const roomName = this.props.role;
    this.socket = io("http://localhost:4987", {auth: {user: this.props.user, room:roomName}})
    this.socket.on("connect", () => {
      // instruct a room name to be joined by server
      this.socket.emit("new-user", roomName);

      this.stop = rrweb.record({
        emit: (event) => {
          // sent to room for agent
          this.socket.emit("send-event", { event: event, room: roomName });
        },
        recordCanvas: true,
        sampling: {
          canvas: 5,
        }
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

      this.socket.on("agent-click", (data) => {
        const key = Utils.uuid();
        this.setState(prevState => ({
          pings: {
              ...prevState.pings,
              [key]: data
          }
        }));

        setTimeout(() => {
          this.setState(prevState => {
            delete prevState.pings[key];
            return {
              pings: prevState.pings
            }
          });
        }, 700)
      });

      //recevied from agent side
      this.socket.on("new-viewer", (data) => {
        this.stop();
        this.stop = rrweb.record({
          emit: (event) => {
            console.log(event);
            // sent to room for agent
            this.socket.emit("send-event", { event: event, room: roomName });
          },
          recordCanvas: true,
          sampling: {
            canvas: 5,
          }
        });
      });
    });
  }

  componentWillUnmount(){
    this.stop();
  }

  render(){
    return (
      <>
        {this.props.children}
        <CSSTransitionGroup
          transitionName="example"
          transitionEnterTimeout={400}
          transitionLeaveTimeout={300}>
            {Object.entries(this.state.pings).map(([key,entry]) => <Ping key={key} x={entry.x} y={entry.y} />)}
        </CSSTransitionGroup>
      </>
    )

  }
}


const mapDispatchToProps = {
  joinRoom, leaveRoom, changeDriver
}

export default connect(null, mapDispatchToProps)(IsDriver);
