import React from "react";
import { Flex, Box } from 'grid-styled';
import { Absolute } from "metabase/components/Position";
import Tooltip from "metabase/components/Tooltip";
import Card from 'metabase/components/Card';
import Icon from "metabase/components/Icon";

function StoryElementPicker(props) {
    const onClick = (ele) => {
      props.selectStoryElement({selectedElement: ele});
    };


    return <div className="story-element-picker">
    <h3>Story Elements</h3>
    <Card className="Card bg-medium">
        <Flex flexWrap="wrap">
          {Object.values(props.storyData).map(ele => {
            return (
              <Box onClick={() => onClick(ele)} key={ele.type} width={1/2} p={1}  style={{ position: "relative"}}>
                <Absolute top={15} right={15} onClick={e => e.stopPropagation()}>
                  <Tooltip tooltip={ele.tooltip}>
                  <Icon name="info"/>
                  </Tooltip>
                </Absolute>
                <div className="element-list bg-light flex flex-column justify-center align-center cursor-pointer">
                <Icon name={ele.icon} />
                <h4>{ele.name}</h4>
                </div>
              </Box>
            )
          })}
        </Flex>
    </Card>
    </div>;
  }

export default StoryElementPicker;