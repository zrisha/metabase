/* eslint-disable react/prop-types */
import React from "react";
import fitViewport from "metabase/hoc/FitViewPort";
import { getUser } from "metabase/selectors/user";
import Navbar from "./Navbar";
import "./RoleLayout.css";
import {connect} from "react-redux";
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
  render(){
    const roleName = this.props.location.pathname.split("/")[2];

    if(this.props.user.id == 1){
      return <IsDriver user={this.props.user} role={roleName} >
        <Navbar location={this.props.location}/>
          <Layout sidebar = {this.props.sidebar} main={this.props.main} />
        </IsDriver>
     }else{
      return <RPlayer room={this.props.room} user={this.props.user} role={roleName}  />
     }
  }
}

const mapStateToProps = (state, props) => ({
  user: getUser(state)
});

export default connect(mapStateToProps)(RoleLayout);
