import React from "react";
import { Flex, Box } from 'grid-styled';
import { Absolute } from "metabase/components/Position";
import Tooltip from "metabase/components/Tooltip";
import "./StoryElements.css";
import Card from 'metabase/components/Card';
import Icon from "metabase/components/Icon";

function StoryElements(props) {
    const onClick = (ele) => {
      props.selectStoryElement({selectedElement: ele});
    };


    return <>
    <h3 style={{textAlign: 'center', paddingBottom:'5px'}}>Story Elements</h3>
    <Card className="bg-medium" style={{width: "100%", height: "95%", padding: "6px 12px 6px 12px", textAlign: "center", overflowX: 'scroll'}}>
        <Flex flexWrap="wrap">
          {Object.values(props.storyData).map(ele => {
            return (
              <Box onClick={() => onClick(ele)} key={ele.type} width={1/2} p={1}  style={{ position: "relative"}}>
                <Absolute top={15} right={15} onClick={e => e.stopPropagation()}>
                  <Tooltip tooltip={ele.tooltip}>
                  <Icon name="info"/>
                  </Tooltip>
                </Absolute>
                <div className="story-element-picker bg-light flex flex-column justify-center align-center cursor-pointer">
                <Icon name={ele.icon} />
                <h4>{ele.name}</h4>
                </div>
              </Box>
            )
          })}
        </Flex>
    </Card>
    </>;
  }

export default StoryElements;