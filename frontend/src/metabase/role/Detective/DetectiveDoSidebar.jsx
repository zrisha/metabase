import React, { useState } from "react";
import {connect} from "react-redux";
import { getUser } from "metabase/selectors/user";
import SidebarLayout from "../SidebarLayout";
import Tasks from "./Tasks";
import Saved from "./SavedFilters";
import Radio from "metabase/components/Radio";
import Notes from "./Notes";
import { deleteFilter, loadFilter, deleteNote, addNote, updateNote } from "../actions";

const ModeToggle = (props) => {
  const OPTIONS = [
    { name: "Tasks", value: "tasks" },
    { name: "Filters", value: "filters" },
  ];

  const onChange = () => props.mode == 'tasks' ? props.setMode('filters') : props.setMode('tasks');

  return (
    <Radio
      {...props}
      options={OPTIONS}
      value={props.mode}
      onChange={onChange}
    />
  );
}


const Top = (props) => {
    const [mode, setMode] = useState("tasks");

    return ( 
        <div className="flex flex-column" style={{height: '100%'}}>
            <div className="flex justify-center" style={{paddingBottom:'5px', paddingTop:'5px'}}>
                <ModeToggle variant="bubble" mode={mode} setMode={setMode}/>
            </div>
            {mode == 'tasks' ? <Tasks {...props} /> : <Saved {...props} />}
        </div>
    )
}


const Bottom = (props) => {
    return ( 
      <Notes {...props} />
    )
}

const DetectiveDoSidebar = (props) => {
    return <>
        <SidebarLayout top={<Top {...props}/>} bottom = {<Bottom {...props} />} heights={[55,45]}/>
    </>
}

const mapStateToProps = (state, props) => ({
    user: getUser(state),
    groupId: state.role.room.group,
    room: state.role.room['detective'],
    notes: state.role.detective ? state.role.detective.notes : false,
    favoriteCards: state.role.favorites ? state.role.favorites.cards : false,
    savedFilters : state.role.detective ? state.role.detective.savedFilters : false
  });

const mapDispatchToProps = {
  deleteFilter,
  loadFilter,
  deleteNote,
  addNote,
  updateNote
}
  
export default connect(mapStateToProps,mapDispatchToProps)(DetectiveDoSidebar);
