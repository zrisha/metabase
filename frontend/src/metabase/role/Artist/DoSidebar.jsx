import React, { Component } from "react";
import {connect} from "react-redux";
import { getUser } from "metabase/selectors/user";
import IconGallery from "./IconGallery";
import SidebarLayout from "../SidebarLayout";
import QuestionViewer from './QuestionViewer';


const Top = (props) => {
    return ( 
            <QuestionViewer />
    )
}

const ArtistDoSidebar = (props) => {
    return <>
    <SidebarLayout top={<Top/>} bottom = {<IconGallery />} heights={[60,40]}/>
    </>
}

const mapStateToProps = (state, props) => ({
    user: getUser(state)
  });
  
export default connect(mapStateToProps)(ArtistDoSidebar);
