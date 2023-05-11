import React, { Component } from "react";
import {connect} from "react-redux";
import { getUser } from "metabase/selectors/user";
import "./Do.css";
import { Absolute } from "metabase/components/Position";
import DrawingTool from './drawing-tool.js';
import './drawing-tool.css';
import { GET, POST, PUT } from "metabase/lib/api";
import { renderDrawingTool } from "../actions";
import Button from "metabase/core/components/Button";
import ButtonBar from "metabase/components/ButtonBar";
import withToast from "metabase/hoc/Toast";


@withToast
class ArtistDo extends Component {
    constructor() {
        super();
        this.state = {render:false};
        this.artistCanvas = React.createRef();
        this.saveDrawing = this.saveDrawing.bind(this);
    }

    async saveDrawing(){
        try{
            const res = await PUT('/api/role')({id: this.roomID, data: window.drawingTool.save()});
            if(res.status == 'success')
                this.props.triggerToast(
                    <div className="flex align-center">
                    {`Your drawing was saved`}
                    </div>,
                    { icon: "pencil"},
                )
        }catch(e){
            console.log(e);
            this.props.triggerToast(
                <div className="flex align-center">
                {`Unknown Error saving your drawing`}
                </div>,
                { icon: "warning"},
            )
        }

    }

    resizeWindow = () => {
        window.drawingTool.setDimensions(this.artistCanvas.current.offsetWidth * .85, (window.innerHeight - (48 + 16)) * .85);
    }

    async componentDidMount(){
        this.roomID = this.props.room && this.props.room.roomID ? this.props.room.roomID : false;

        try{
            const icon_filenames = await GET("/app/assets/fa-icons/index.json")();
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
        }catch(e){
            window.drawingTool = new DrawingTool("#drawing-tool-container", {
                onDrawingChanged:false,
                parseSVG: true,
                height: (window.innerHeight - (48 + 16)) * .85,
                width: this.artistCanvas.current.offsetWidth * .85
            });
            this.props.triggerToast(
                <div className="flex align-center">
                {`Unknown Error loading icons`}
                </div>,
                { icon: "warning"},
            )
            console.log(e)
        }
        this.setState({render:true});

        try{
            const getData = await GET(`/api/role/${this.roomID}`)();
            if(getData.status && getData.status == 202){
                const res = await POST("/api/role")({id: this.roomID, role: 'artist', data: {}});
            }else if(getData && Object.keys(getData.data).length > 0){
                //loads drawing data.
                window.drawingTool.load(getData.data)
                this.resizeWindow()
            }
        }catch(e){
            this.props.triggerToast(
                <div className="flex align-center">
                {`Unknown Error loading drawing`}
                </div>,
                { icon: "warning"},
            )
            console.log(e);
        }

        window.addEventListener("resize", this.resizeWindow);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.resizeWindow);
        PUT('/api/role')({id: this.roomID, data: window.drawingTool.save()})
    }

    render(){
        return <>
            <div className="flex artist-do-wrapper" id="drawing-tool-container" ref={this.artistCanvas}>
            </div>
            <Absolute style={{bottom: "2.5%", right: "5%"}}>
                <ButtonBar>
                    <Button primary onClick={this.saveDrawing}>Save</Button>
                </ButtonBar>
            </Absolute>
        </>
    }

}

const mapStateToProps = (state, props) => ({
    room: state.role.room['artist'],
    user: getUser(state)
  });

const mapDispatchToProps = {
    renderDrawingTool
}
  
export default connect(mapStateToProps, mapDispatchToProps)(ArtistDo);
