import React, { useState } from "react";
import {connect} from "react-redux";
import { getUser } from "metabase/selectors/user";
import SidebarLayout from "../SidebarLayout";
import Tasks from "./Tasks";
import Saved from "./SavedFilters";
import Radio from "metabase/components/Radio";
import { deleteFilter, loadFilter } from "../actions";

const ModeToggle = (props) => {
  const OPTIONS = [
    { name: "Tasks", value: "tasks" },
    { name: "Saved", value: "saved" },
  ];

  const onChange = () => props.mode == 'tasks' ? props.setMode('saved') : props.setMode('tasks');

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
      <div>bottom</div>
    )
}

const DetectiveDoSidebar = (props) => {
    return <>
        <SidebarLayout top={<Top {...props}/>} bottom = {<Bottom {...props} />} heights={[55,45]}/>
    </>
}

const mapStateToProps = (state, props) => ({
    user: getUser(state),
    room: state.role.room['detective'],
    favoriteCards: state.role ? state.role.favorites.cards : false,
    savedFilters : state.role.detective ? state.role.detective.savedFilters : false
  });

const mapDispatchToProps = {
  deleteFilter,
  loadFilter
}
  
export default connect(mapStateToProps,mapDispatchToProps)(DetectiveDoSidebar);
