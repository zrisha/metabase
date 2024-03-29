import React, { Component } from "react";
import {connect} from "react-redux";
import { getUser } from "metabase/selectors/user";
import "./JournalistDo.css";
import withToast from "metabase/hoc/Toast";
import storyData from "./story-elements.json";
import StoryElement from "./StoryElement";
import { selectStoryElement, getStoryElements, updateStoryElementPos, getFavoritesGrp } from '../actions';
import storyOutline from './story_outline.json';


@withToast
class JournalistDo extends Component {
  constructor() {
    super();
    this.state = {render:false, containerWidth: false, containerHeight: false};
    this.dragCanvas = React.createRef()
  }

  setWindowSize = () => {
    this.setState({
      containerWidth: this.dragCanvas.current ? this.dragCanvas.current.offsetWidth : false,
      containerHeight: this.dragCanvas.current ? this.dragCanvas.current.offsetHeight : false
    })
  }

  componentDidUpdate(prevProps, prevState, snapshot){
    if(prevState.render != this.state.render){
      this.setWindowSize();
    }

  }

  componentDidMount(){
    if(this.props.groupId){
      this.props.getStoryElements({groupId: this.props.groupId})
      this.props.getFavoritesGrp({groupId: this.props.groupId});
    }
    window.addEventListener("resize", this.setWindowSize);

    this.setState({render: true});
  }

  render(){
    const {storyElements} = this.props.journalist;

    const {containerWidth, containerHeight} = this.state;

    const {width, height, filepath} = storyOutline[3]

    const scale = (containerWidth / width) - .05;

    const marginTop = (containerHeight - (height * scale)) > 0 ?  (containerHeight - (height * scale)) /2 : 0;
    const marginLeft = (containerWidth - (width * scale)) > 0 ?  (containerWidth - (width * scale)) /2 : 0;

    return <div className="journalist-do-wrapper" ref={this.dragCanvas}>
      {this.state.render && <div style={{marginTop, marginLeft, transform: `scale(${scale}`, transformOrigin: "0 0", width, height, position: 'relative', backgroundImage: `url(${filepath})`}}>
        {containerWidth && Object.entries(storyElements).map(([storyId, ele]) => {
          const id = parseInt(storyId)
          const {type, ...data} = ele;
          if(storyData[ele.type]){
            return <StoryElement {...storyData[ele.type]} 
              storyId={id != NaN ? id : storyId}
              key={storyId} 
              type={type} 
              data={data} 
              selectStoryElement={this.props.selectStoryElement} 
              updateStoryElementPos={this.props.updateStoryElementPos} 
              scale={scale}
              groupId={this.props.groupId}
              dims={{containerWidth, containerHeight}}/>
          }
        })}
      </div>}
    </div>
  }
}

const mapStateToProps = (state, props) => ({
    room: state.role.room['journalist'],
    groupId: state.role.groupId,
    user: getUser(state),
    journalist: state.role.journalist
  });

const mapDispatchToProps = {
  selectStoryElement,
  getStoryElements,
  updateStoryElementPos,
  getFavoritesGrp
}
  
export default connect(mapStateToProps, mapDispatchToProps)(JournalistDo);
