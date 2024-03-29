import React, { Component } from "react";
import { connect } from "react-redux";
import { getUser } from "metabase/selectors/user";
import "./ArtistDo.css";
import { Absolute } from "metabase/components/Position";
import DrawingTool from "./drawing-tool.js";
import "./drawing-tool.css";
import { GET } from "metabase/lib/api";
import { trackStructEvent } from "metabase/lib/analytics";
import Button from "metabase/core/components/Button";
import ButtonBar from "metabase/components/ButtonBar";
import withToast from "metabase/hoc/Toast";
import _ from "underscore";
import {
  getFavoritesGrp,
  getArts,
  updateArt,
  addArt,
  setSaveStatus,
} from "../actions";

@withToast
class ArtistDo extends Component {
  constructor() {
    super();
    this.updateCount = 0;
    this.loaded = false
    this.artistCanvas = React.createRef();
    this.saveDrawing = this.saveDrawing.bind(this);
    this.skippedEvents = [
      'undo:possible', 'undo:impossible', 'redo:possible', 'redo:impossible'
    ]
  }

  //For keeping the canvas the proper size
  resizeWindow = () => {
    window.drawingTool.setDimensions(
      this.artistCanvas.current.offsetWidth * 0.85,
      (window.innerHeight - (48 + 16)) * 0.85,
    );
  };

  //Tracks canvas changes
  onChange = () => {
    this.updateCount += 1;
    if (this.loaded) {
      this.toggleSaveStatus(true);
    }
  };

  //Logs events from drawing tool
  onEvent = (event, value) => {
    if(!this.loaded || !event || this.skippedEvents.includes(event))
      return

    if(value){
      trackStructEvent("artist", event, "drawingTool", value)
    }
    else if(event){
      trackStructEvent("artist", event, "drawingTool")
    }
  };

  saveImage = () => {
    const url = window.drawingTool.$canvas[0].toDataURL("image/png")
    const link = document.createElement("a");
    let selectedArt = this.props.artist.arts.findIndex(
      art => art.id == this.props.artist.selectedArt.id,
    );
    selectedArt = selectedArt !== -1 ? selectedArt + 1 : false;

    link.download = selectedArt ? `sketch_${selectedArt}.png` : "sketch.png";
    link.href = url;
    link.click();
  }

  toggleSaveStatus = (status) => {
    if (this.props.artist.unsaved != status) {
      this.props.setSaveStatus({ unsaved: status });
    }
  }

  //Catch leaving before saving for router
  routerWillLeave = nextLocation => {
    if (this.props.artist.unsaved)
      return "Your work is not saved! Are you sure you want to leave?";
  };

  //Catch leaving before saving for window
  onPageLeave = event => {
    if (this.props.artist.unsaved) {
      event.preventDefault();
      event.returnValue = "";
    }
  };

  componentDidUpdate(prevProps, prevState) {
    //Checks for changes in the currently selected artwork
    if (
      prevProps.artist.selectedArt &&
      prevProps.artist.selectedArt.id != this.props.artist.selectedArt.id
    ) {
      const selectedArt = this.props.artist.arts.find(
        art => art.id == this.props.artist.selectedArt.id,
      );
      if (selectedArt && selectedArt.data) {
        const data = JSON.parse(selectedArt.data);
        this.loaded = false

        //Load in newly selected artwork
        if (data.canvas) {
          window.drawingTool.load(data);
        } else if (data.canvas == undefined) {
          window.drawingTool.clear();
        }
        this.toggleSaveStatus(false);
        this.resizeWindow();
        this.loaded = true
      }
    }
  }

  async saveDrawing() {
    try {
      const res = await this.props.updateArt({
        groupId: this.props.groupId,
        data: window.drawingTool.save(),
        artId: this.props.artist.selectedArt.id,
        blob: window.drawingTool.$canvas[0].toDataURL()
      });

      if (!res.payload.error && res.payload.data.id) {
        this.props.triggerToast(
          <div className="flex align-center">{`Your drawing was saved`}</div>,
          { icon: "pencil" },
        );
        this.toggleSaveStatus(false);
      } else if (res.payload.error || !res.payload.data.id) {
        this.props.triggerToast(
          <div className="flex align-center">
            {`Unknown Error saving your drawing`}
          </div>,
          { icon: "warning" },
        );
      }
    } catch (e) {
      console.log(e);
      this.props.triggerToast(
        <div className="flex align-center">
          {`Unknown Error saving your drawing`}
        </div>,
        { icon: "warning" },
      );
    }
  }

  async componentDidMount() {
    //Listeners for navigation and resizing
    this.props.router.setRouteLeaveHook(this.props.route, this.routerWillLeave);
    window.addEventListener("beforeunload", this.onPageLeave);
    window.addEventListener("resize", this.resizeWindow);

    this.roomID =
      this.props.room && this.props.room.roomID
        ? this.props.room.roomID
        : false;

    //Grab favorite visualizations
    if (this.props.groupId) {
      this.props.getFavoritesGrp({ groupId: this.props.groupId });
    }

    try {
      //Load icons
      const icon_filenames = await GET("/app/assets/fa-icons/index.json")();
      const stamp_paths = icon_filenames.map(x => `/app/assets/fa-icons/${x}`);
      window.drawingTool = new DrawingTool("#drawing-tool-container", {
        onDrawingChanged: this.onChange,
        onAnyEvent: this.onEvent,
        stamps: {
          Stamps: stamp_paths,
        },
        parseSVG: true,
        height: (window.innerHeight - (48 + 16)) * 0.85,
        width: this.artistCanvas.current.offsetWidth * 0.85,
      });
    } catch (e) {
      window.drawingTool = new DrawingTool("#drawing-tool-container", {
        onDrawingChanged: this.onChange,
        onAnyEvent: this.onEvent,
        parseSVG: true,
        height: (window.innerHeight - (48 + 16)) * 0.85,
        width: this.artistCanvas.current.offsetWidth * 0.85,
      });

      this.props.triggerToast(
        <div className="flex align-center">
          {`Unknown Error loading icons`}
        </div>,
        { icon: "warning" },
      );
      console.log(e);
    }

    try {
      //Get saved artwork
      const savedArts = await this.props.getArts({
        groupId: this.props.groupId,
        updateCurrent: true,
      });

      if (savedArts.payload && savedArts.payload.arts.length < 1) {
        //Add new art if empty
        const newArt = await this.props.addArt({
          groupId: this.props.groupId,
          data: {},
        });
      } else if (
        savedArts.payload.arts.length > 0 &&
        savedArts.payload.selectedArt
      ) {
        //Load most recently updated art
        const loadArt = savedArts.payload.arts.find(
          art => art.id == savedArts.payload.selectedArt.id,
        );
        
        const data = loadArt.data ? JSON.parse(loadArt.data) : null;
        if (data && data.canvas) {
          window.drawingTool.load(data);
          this.resizeWindow();
          this.loaded = true
        }
      }
    } catch (e) {
      this.props.triggerToast(
        <div className="flex align-center">
          {`Unknown Error loading drawing`}
        </div>,
        { icon: "warning" },
      );
      console.log(e);
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeWindow);
    window.removeEventListener("beforeunload", this.onPageLeave);
  }

  render() {
    return (
      <>
        <div
          className="flex artist-do-wrapper"
          id="drawing-tool-container"
          ref={this.artistCanvas}
        ></div>
        <Absolute style={{ bottom: "2.5%", right: "5%" }}>
          <ButtonBar>
            <Button primary onClick={this.saveDrawing}>
              Save
            </Button>
            <Button  onClick={this.saveImage}>
              Export
            </Button>
          </ButtonBar>
        </Absolute>
      </>
    );
  }
}

const mapStateToProps = (state, props) => ({
  room: state.role.room["artist"],
  artist: state.role.artist,
  groupId: state.role.groupId,
  user: getUser(state),
});

const mapDispatchToProps = {
  getFavoritesGrp,
  addArt,
  updateArt,
  getArts,
  setSaveStatus,
};

export default connect(mapStateToProps, mapDispatchToProps)(ArtistDo);
