import React, {useState} from "react";
import { Absolute } from "metabase/components/Position";
import Tooltip from "metabase/components/Tooltip";
import Icon from "metabase/components/Icon";
import Draggable from "react-draggable";
import { Flex } from 'grid-styled';
import Popover from "metabase/components/Popover";
import cx from "classnames";

function StoryElement(props) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [pos, setPos] = useState({x: props.data.x ? props.data.x : 100, y: props.data.y ? props.data.y : 200});


  const onEdit = (e) => {
    props.selectStoryElement({data: props, storyId: props.storyId});
    e.stopPropagation();
  }

  const handleDrag = (e, ui) => {
    setPos({
      x: pos.x + ui.deltaX,
      y: pos.y + ui.deltaY,
    });
  }

  const handleStop = (e) => {
    props.updateStoryElementPos({data: {...props.data, x: pos.x, y: pos.y}, storyId: props.storyId, groupId: props.groupId});
  }

  return (
  <Draggable 
    handle=".cursor-grab" 
    bounds="parent"
    onDrag={handleDrag}
    position={{x: pos.x, y:pos.y}}
    onStop={handleStop}
    scale={props.scale}
    >
    <div className="story-element">
    <div className="drag cursor-grab flex align-center justify-center py1">
      <Icon  name="drag"/>
    </div>
    <div style={{position: 'relative'}}>
      <Absolute top={10} right={10}>
        <Tooltip tooltip="Edit">
        <Icon size={22} className="cursor-pointer text-brand-hover" name="pencil" onClick={onEdit}/>
        </Tooltip>
      </Absolute>
    <Flex 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      alignItems="center" 
      justifyContent="center" 
      className={cx("bg-white element bordered cursor-pointer transition-border", {
        "clicked": clicked,
      })}
      onClick={() => setClicked(!clicked)}
    >
      <Icon name={props.icon} />
      <h4>{props.data.user_title}</h4>
    </Flex>
    </div>
    <Popover
        isOpen={hovered || clicked}
        hasArrow={true}
        hasBackground={true}
      >
        <div className="p2">
        {props.fields && props.fields.map(ele => <React.Fragment key={ele.name}>
          <h4>{ele.title}</h4>
          <p>{props.data[ele.name]}</p>
        </React.Fragment>)}
        </div>
      </Popover>
    </div>
  </Draggable>
  )
}
  
export default StoryElement;
