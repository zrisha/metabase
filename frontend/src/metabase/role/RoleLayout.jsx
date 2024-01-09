/* eslint-disable react/prop-types */
import React from "react";
import fitViewport from "metabase/hoc/FitViewPort";
import { getUser } from "metabase/selectors/user";
import Navbar from "./Navbar";
import "./RoleLayout.css";
import {connect} from "react-redux";
import { joinRoom, leaveRoom, changeDriver, setGroup} from "./actions";
import { io } from "socket.io-client";
import RPlayer from "./RPlayer";
import './animation.css';
import IsDriver from "./IsDriver";
import { GenericError } from "metabase/containers/ErrorPages";

export const Layout = fitViewport(({ main, sidebar, widths}) => {
  return (
    <div className="flex flex-row role-layout">
      <div style = {{width: widths.left}} className="bg-white border-right">{sidebar}</div>
      <div style = {{width: widths.right}} className="role-main-layout">{main}</div>
    </div>
  );
});


class RoleLayout extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      socketRendered: false,
    }

    this.roleWidths = {
      detective: {left: '25%', right: '75%'},
      journalist: {left: '30%', right: '70%'},
      artist: {left: '30%', right: '70%'},
    }
  }

  componentDidMount(){
    const groupId = this.props.user.group_ids.find(id => id != 1 && id !=2);

    //Set group or default to demo
    const currentGroup = groupId ? groupId : 1

    this.props.setGroup({groupId: currentGroup});
    this.role = this.props.location.pathname.split("/")[2];

    //Skip websocket for demo group
    if(currentGroup == 1 || !currentGroup){
      return
    }

    this.roomID = currentGroup ? this.role + groupId : this.role;
    this.socket = io("http://localhost:4987", {auth: {user: this.props.user, roomID :this.roomID, groupId, role: this.role}})
    this.socket.on("connect", () => {
      this.setState({socketRendered: true});
      //Update room with new user
      this.socket.emit("new-user");
    });

    //State updates for changes in room
    this.socket.on("user-join", (roomState) => {
      this.props.joinRoom({role: this.role, room: roomState, group: this.group})
    });

    this.socket.on("user-leave", (roomState) => {
      this.props.leaveRoom({role: this.role, room: roomState, group: this.group})
    });

    this.socket.on("change-driver", (roomState) => {
      this.props.changeDriver({role: this.role, room: roomState, group: this.group})
    });

  }

  componentWillUnmount(){
    if(this.socket){
      this.socket.disconnect();
    }
  }

  render(){
    const widths = this.roleWidths[this.role] ? this.roleWidths[this.role] : {left: '25%', right: '75%'};

    if(this.props.groupId == false){
      return <></>
    }

    if(this.props.groupId == 1){
      return <>
        <Navbar location={this.props.location} demoMode={true} />
        <Layout sidebar = {this.props.sidebar} main={this.props.main} widths = { widths}/>
      </>
    }

    if(this.state.socketRendered == false || this.props.room.driver == undefined){
      return <GenericError details="Failure to connect to the websocket server" />
    }
    
    if(this.props.user.id == this.props.room.driver){
      return <IsDriver user={this.props.user} roomID={this.roomID}  socket={this.socket}>
        <Navbar location={this.props.location} />
          <Layout sidebar = {this.props.sidebar} main={this.props.main} widths = { widths}/>
        </IsDriver>
     }else{
      return <RPlayer role={this.role} room={this.props.room} user={this.props.user} roomID={this.roomID} socket={this.socket}/>
     }
  }
}

const mapDispatchToProps = {
  joinRoom, leaveRoom, changeDriver, setGroup
}

const mapStateToProps = (state, props) => ({
  room: state.role.room[props.location.pathname.split("/")[2]],
  user: getUser(state),
  groupId: state.role.groupId
});

export default connect(mapStateToProps, mapDispatchToProps)(RoleLayout);
