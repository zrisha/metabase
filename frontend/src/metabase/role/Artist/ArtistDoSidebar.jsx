import React, { useState } from "react";
import { connect } from "react-redux";
import Radio from "metabase/components/Radio";
import IconGallery from "./IconGallery";
import SidebarLayout from "../SidebarLayout";
import QuestionViewer from "./QuestionViewer";
import SavedArt from "./SavedArt";
import "./ArtistDoSidebar.css";
import { selectArt, deleteArt, addArt } from "../actions";

const ModeToggle = props => {
  const OPTIONS = [
    { name: "Icons", value: "icons" },
    { name: "Saved Art", value: "saved" },
  ];

  const onChange = () =>
    props.mode == "icons" ? props.setMode("saved") : props.setMode("icons");

  return (
    <Radio
      {...props}
      options={OPTIONS}
      value={props.mode}
      onChange={onChange}
    />
  );
};

const Top = props => {
  const [mode, setMode] = useState("icons");

  return (
    <div className="flex flex-column" style={{ height: "100%" }}>
      <div
        className="flex justify-center"
        style={{ paddingBottom: "5px", paddingTop: "5px" }}
      >
        {props.arts && <ModeToggle variant="bubble" mode={mode} setMode={setMode} />}
      </div>
      {mode == "icons" ? <IconGallery /> : <SavedArt {...props} />}
    </div>
  );
};

const ArtistDoSidebar = props => {
  return (
    <>
      <SidebarLayout
        top={<Top {...props} />}
        bottom={<QuestionViewer favoriteCards={props.favoriteCards} />}
        heights={[45, 55]}
      />
    </>
  );
};

const mapDispatchToProps = {
  selectArt,
  deleteArt,
  addArt,
};

const mapStateToProps = (state, props) => ({
  favoriteCards: state.role ? state.role.favorites.cards : [],
  groupId: state.role ? state.role.room.group : null,
  arts: state.role ? state.role.artist.arts : [],
  selectedArt: state.role ? state.role.artist.selectedArt : null,
});

export default connect(mapStateToProps, mapDispatchToProps)(ArtistDoSidebar);
