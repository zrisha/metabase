import React, { useState } from "react";
import {connect} from "react-redux";
import "./StoryElements.css";
import Card from 'metabase/components/Card';
import { addStoryElement, selectStoryElement, updateStoryElement, deleteStoryElement } from '../actions';
import storyData from "./story-elements.json";
import StoryElementPicker from "./StoryElementPicker";
import StoryElementForm from "./StoryElementForm";

function StoryElementSidebar(props) {

  if(props.journalist.selectedElement == null){
    return <StoryElementPicker storyData={storyData} selectStoryElement={props.selectStoryElement}/>
  }else{
    return <>
      <h3 style={{textAlign: 'center', paddingBottom:'5px'}}>Story Elements</h3>
      <Card style={{width: "100%", height: "95%", padding: "6px 12px 6px 12px", textAlign: "center", overflowX: 'scroll'}}>
        <StoryElementForm 
          group={props.room.group ? props.room.group : false}
          addStoryElement={props.addStoryElement} 
          selectStoryElement={props.selectStoryElement} 
          selectedElement={props.journalist.selectedElement} 
          storyElements={props.journalist.storyElements} 
          updateStoryElement={props.updateStoryElement}
          deleteStoryElement={props.deleteStoryElement} />
      </Card>
      </>
  }

}

const mapDispatchToProps = {
  addStoryElement,
  selectStoryElement,
  updateStoryElement,
  deleteStoryElement
};

const mapStateToProps = (state, props) => ({
    journalist: state.role.journalist,
    room: state.role.room
  });
  
export default connect(mapStateToProps, mapDispatchToProps)(StoryElementSidebar);
