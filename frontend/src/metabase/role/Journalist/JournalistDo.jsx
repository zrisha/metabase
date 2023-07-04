import React, { Component } from "react";
import {connect} from "react-redux";
import { getUser } from "metabase/selectors/user";
import "./JournalistDo.css";
import withToast from "metabase/hoc/Toast";
import storyData from "./story-elements.json";
import StoryElement from "./StoryElement";
import { selectStoryElement, getStoryElements, updateStoryElementPos } from '../actions';


@withToast
class JournalistDo extends Component {
  constructor() {
    super();
    this.state = {render:false};
    this.dragCanvas = React.createRef()
  }

  componentDidMount(){
    if(this.props.groupId){
      this.props.getStoryElements({groupId: this.props.groupId})
    }
  }

  render(){
    const {storyElements} = this.props.journalist;
    const width = this.dragCanvas.current ? this.dragCanvas.current.offsetWidth : false;
    const height = this.dragCanvas.current ? this.dragCanvas.current.offsetHeight : false;
    console.log({width, height});

    const imgHeight = 487 * (width/1051);
    console.log(height)

    const padding = (height - (637 * (width/1051))) /2;


    return <>
    <div ref={this.dragCanvas} style={{width: "100%", height: "100%", paddingTop: padding}}>
    <img src='/app/assets/story_outlines/story_outline_1.svg' style={{position: 'absolute', width: 1051, transform: `scale(${width/1051}`, transformOrigin: "0 0"}}/>
    <div style={{transform: `scale(${width/1051}`, transformOrigin: "0 0", width: 1051, height: 637, position: 'relative'}}>
      {width && Object.entries(storyElements).map(([storyId, ele]) => {
        const {type, ...data} = ele;
        return <StoryElement {...storyData[ele.type]} 
          storyId={storyId} 
          type={type} 
          data={data} 
          selectStoryElement={this.props.selectStoryElement} 
          updateStoryElementPos={this.props.updateStoryElementPos} 
          scale={width/1051}
          dims={{width, height}}/>
      })}
    </div>
    </div>
    </>
  }
}

const mapStateToProps = (state, props) => ({
    room: state.role.room['journalist'],
    groupId: state.role.room.group,
    user: getUser(state),
    journalist: state.role.journalist
  });

const mapDispatchToProps = {
  selectStoryElement,
  getStoryElements,
  updateStoryElementPos
}
  
export default connect(mapStateToProps, mapDispatchToProps)(JournalistDo);
