import React from "react";
import {connect} from "react-redux";
import { addStoryElement, selectStoryElement, clearStoryElement, updateStoryElement, deleteStoryElement } from '../actions';
import storyData from "./story-elements.json";
import StoryElementPicker from "./StoryElementPicker";
import StoryElementForm from "./StoryElementForm";

function StoryElementSidebar(props) {

  if(props.journalist.selectedElement == null){
    return <StoryElementPicker 
              storyData={storyData} 
              selectStoryElement={props.selectStoryElement} />
  }else{
    return <StoryElementForm 
              group={props.group ? props.group : false}
              addStoryElement={props.addStoryElement} 
              selectStoryElement={props.selectStoryElement} 
              clearStoryElement={props.clearStoryElement} 
              selectedElement={props.journalist.selectedElement} 
              storyElements={props.journalist.storyElements} 
              updateStoryElement={props.updateStoryElement}
              deleteStoryElement={props.deleteStoryElement} />
  }

}

const mapDispatchToProps = {
  addStoryElement,
  selectStoryElement,
  updateStoryElement,
  clearStoryElement,
  deleteStoryElement
};

const mapStateToProps = (state, props) => ({
    journalist: state.role.journalist,
    room: state.role.room,
    group: state.role.groupId
  });
  
export default connect(mapStateToProps, mapDispatchToProps)(StoryElementSidebar);
