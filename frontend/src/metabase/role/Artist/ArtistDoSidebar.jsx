import React, { Component } from "react";
import {connect} from "react-redux";
import { getUser } from "metabase/selectors/user";
import IconGallery from "./IconGallery";
import SidebarLayout from "../SidebarLayout";
import QuestionViewer from './QuestionViewer';


const Top = (props) => {
    return ( 
            <QuestionViewer favoriteCards={props.favoriteCards} />
    )
}

const ArtistDoSidebar = (props) => {
    return <>
    <SidebarLayout top={<Top favoriteCards={props.favoriteCards} />} bottom = {<IconGallery />} heights={[60,40]}/>
    </>
}

const mapStateToProps = (state, props) => ({
    user: getUser(state),
    favoriteCards: state.role ? state.role.favorites.cards : []
  });
  
export default connect(mapStateToProps)(ArtistDoSidebar);
