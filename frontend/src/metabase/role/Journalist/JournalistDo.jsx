import React, { Component } from "react";
import {connect} from "react-redux";
import { getUser } from "metabase/selectors/user";
import "./JournalistDo.css";
import withToast from "metabase/hoc/Toast";
import storyData from "./story-elements.json";
import StoryElement from "./StoryElement";
import { selectStoryElement, getStoryElements, updateStoryElementPos } from '../actions';
import storyOutline from './story_outline.json';


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
    const containerWidth = this.dragCanvas.current ? this.dragCanvas.current.offsetWidth : false;
    const containerHeight = this.dragCanvas.current ? this.dragCanvas.current.offsetHeight : false;

    const {width, height, filepath} = storyOutline[0]

    const scale = containerWidth / width;

    const padding = (containerHeight - (height * (containerWidth/width))) /2;


    return <>
    <div className="journalist-do-wrapper" ref={this.dragCanvas} style={{paddingTop: padding}}>
      <img className="story-outline" src={filepath} style={{ width, transform: `scale(${scale}`}}/>
      <div style={{transform: `scale(${scale}`, transformOrigin: "0 0", width, height, position: 'relative'}}>
        {containerWidth && Object.entries(storyElements).map(([storyId, ele]) => {
          const {type, ...data} = ele;
          return <StoryElement {...storyData[ele.type]} 
            storyId={storyId} 
            type={type} 
            data={data} 
            selectStoryElement={this.props.selectStoryElement} 
            updateStoryElementPos={this.props.updateStoryElementPos} 
            scale={scale}
            dims={{containerWidth, containerHeight}}/>
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
