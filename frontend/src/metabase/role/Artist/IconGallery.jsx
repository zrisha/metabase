import React from "react";
import {connect} from "react-redux";
import { Flex, Box } from 'grid-styled';
import "./IconGallery.css";
import Card from 'metabase/components/Card';


function IconGallery(props) {

    const onClick = (index) => {
      window.drawingTool.tools.stamp.loadImage(index, function (fabricObj, img) {
        window.drawingTool.setStampObject(fabricObj, index);
        window.drawingTool.chooseTool('stamp');
      }.bind(window.drawingTool.tools.stamp), null, 'anonymous');
    };

    return <>
    <Card style={{width: "100%", height: "95%", textAlign: "center", overflowX: 'scroll', backgroundColor: "#EDF2F5"}}>
        <Flex flexWrap="wrap">
          {window.drawingTool && window.drawingTool.options.stamps.Stamps.map(k => {
            return (
              <Box key={k} width={1/5} p={1}  style={{ position: "relative"}}>
                <img src={k} className="icon-in-gallery bg-light"
                  onClick={() => onClick(k)}
                />
              </Box>
            )
          })}
        </Flex>
    </Card>
    </>;
  }

const mapStateToProps = (state, props) => ({
    artist: state.role.artist
  });
  
export default connect(mapStateToProps)(IconGallery);
