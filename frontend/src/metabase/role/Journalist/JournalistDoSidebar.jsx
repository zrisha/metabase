import React, { Component } from "react";
import {connect} from "react-redux";
import { getUser } from "metabase/selectors/user";
import SidebarLayout from "../SidebarLayout";
import StoryElementSidebar from "./StoryElementSidebar";


const JournalistDoSidebar = (props) => {
    return <>
    <SidebarLayout top={<StoryElementSidebar />} bottom = {<div>bottom</div>} heights={[60,40]}/>
    </>
}

const mapStateToProps = (state, props) => ({
    user: getUser(state),
  });
  
export default connect(mapStateToProps)(JournalistDoSidebar);
