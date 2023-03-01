import React, { Component } from "react";
import {connect} from "react-redux";
import { getUser } from "metabase/selectors/user";
import "./Do.css";

import DrawingTool from './drawing-tool.js';
import './drawing-tool.css';
import { GET } from "metabase/lib/api";
import { renderDrawingTool } from "../actions";



class ArtistDo extends Component {
    constructor() {
        super();
        this.state = {render:false};
        this.artistCanvas = React.createRef();
    }
    

    componentDidMount(){
        this.setState({render:true});
        GET("/app/assets/fa-icons/index.json")().then(icon_filenames => {
            const stamp_paths = icon_filenames.map(x => `/app/assets/fa-icons/${x}`);
            window.drawingTool = new DrawingTool("#drawing-tool-container", {
                onDrawingChanged:false,
                stamps: {
                    'Stamps': stamp_paths
                  },
                parseSVG: true,
                height: (window.innerHeight - (48 + 16)) * .85,
                width: this.artistCanvas.current.offsetWidth * .85
            });
            this.props.renderDrawingTool();
        }).catch(e => {
            window.drawingTool = new DrawingTool("#drawing-tool-container", {
                onDrawingChanged:false,
                parseSVG: true,
                height: (window.innerHeight - (48 + 16)) * .85,
                width: this.artistCanvas.current.offsetWidth * .85
            });
            console.log(e)
        });

        window.addEventListener("resize", () => window.drawingTool.setDimensions(this.artistCanvas.current.offsetWidth * .85, (window.innerHeight - (48 + 16)) * .85));
    }
    componentWillUnmount() {
        window.removeEventListener("resize", () => window.drawingTool.setDimensions(this.artistCanvas.current.offsetWidth * .85, (window.innerHeight - (48 + 16)) * .85));
    }

    render(){
        return <div className="flex artist-do-wrapper" id="drawing-tool-container" ref={this.artistCanvas}>
            
        </div>
    }

}

const mapStateToProps = (state, props) => ({
    user: getUser(state)
  });

const mapDispatchToProps = {
    renderDrawingTool
}
  
export default connect(mapStateToProps, mapDispatchToProps)(ArtistDo);
