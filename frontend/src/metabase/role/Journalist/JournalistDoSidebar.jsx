import React, { Component } from "react";
import {connect} from "react-redux";
import { getUser } from "metabase/selectors/user";
import SidebarLayout from "../SidebarLayout";
import StoryElementSidebar from "./StoryElementSidebar";
import QuestionViewer from '../Artist/QuestionViewer';


const JournalistDoSidebar = (props) => {
    return <>
    <SidebarLayout top={<StoryElementSidebar />} bottom = {<QuestionViewer role="journalist" favoriteCards={props.favoriteCards} />} heights={[45,55]}/>
    </>
}

const mapStateToProps = (state, props) => ({
    user: getUser(state),
    favoriteCards: state.role ? state.role.favorites.cards : {},
  });
  
export default connect(mapStateToProps)(JournalistDoSidebar);
