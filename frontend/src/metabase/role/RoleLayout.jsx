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
    const group = this.props.user.group_ids.find(id => id != 1 && id !=2);
    this.role = this.props.location.pathname.split("/")[2];

    this.roomID = group ? this.role + group : this.role;
  
    this.socket = io("http://localhost:4987", {auth: {user: this.props.user, roomID :this.roomID}})
    this.socket.on("connect", () => {
      this.setState({socketRendered: true});
      //Update room with new user
      this.socket.emit("new-user");
    });

    //State updates for changes in room
    this.socket.on("user-join", (roomState) => {
      this.props.joinRoom({role: this.role, room: roomState})
    });

    this.socket.on("user-leave", (roomState) => {
      this.props.leaveRoom({role: this.role, room: roomState})
    });

    this.socket.on("change-driver", (roomState) => {
      this.props.changeDriver({role: this.role, room: roomState})
    });

  }

  render(){

    if(this.state.socketRendered == false || this.props.room.driver == undefined){
      return <></>
    }
    
    if(this.props.user.id == this.props.room.driver){
      return <IsDriver user={this.props.user} roomID={this.roomID}  socket={this.socket}>
        <Navbar location={this.props.location}/>
          <Layout sidebar = {this.props.sidebar} main={this.props.main} />
        </IsDriver>
     }else{
      return <RPlayer room={this.props.room} user={this.props.user} roomID={this.roomID} socket={this.socket}/>
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
