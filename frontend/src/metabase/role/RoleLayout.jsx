/* eslint-disable react/prop-types */
import React from "react";
import fitViewport from "metabase/hoc/FitViewPort";
import { getUser } from "metabase/selectors/user";
import Navbar from "./Navbar";
import "./RoleLayout.css";
import {connect} from "react-redux";
import { joinRoom, leaveRoom, changeDriver} from "./actions";
import { io } from "socket.io-client";
import RPlayer from "./RPlayer";
import './animation.css';
import IsDriver from "./IsDriver";


export const Layout = fitViewport(({ main, sidebar }) => {
  return (
    <div className="flex flex-row role-layout">
      <div style = {{width: "35%"}} className="bg-white border-right">{sidebar}</div>
      <div style = {{width: "65%"}}>{main}</div>
    </div>
  );
});


class RoleLayout extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      socketRendered: false
    }
  }

  componentDidMount(){
    const roomName = this.props.location.pathname.split("/")[2];
    this.socket = io("http://localhost:4987", {auth: {user: this.props.user, room:roomName}})
    this.socket.on("connect", () => {
      this.setState({socketRendered: true});

      this.socket.emit("new-user", roomName);
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

  }

  render(){
    const roleName = this.props.location.pathname.split("/")[2];

    if(this.state.socketRendered == false || this.props.room.driver == undefined){
      return <></>
    }
    
    if(this.props.user.id == this.props.room.driver){
      return <IsDriver user={this.props.user} role={roleName}  socket={this.socket}>
        <Navbar location={this.props.location}/>
          <Layout sidebar = {this.props.sidebar} main={this.props.main} />
        </IsDriver>
     }else{
      return <RPlayer room={this.props.room} user={this.props.user} role={roleName} socket={this.socket}/>
     }
  }
}

const mapDispatchToProps = {
  joinRoom, leaveRoom, changeDriver
}

const mapStateToProps = (state, props) => ({
  room: state.role.room[props.location.pathname.split("/")[2]],
  user: getUser(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(RoleLayout);
