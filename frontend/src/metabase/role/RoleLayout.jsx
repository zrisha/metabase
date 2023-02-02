/* eslint-disable react/prop-types */
import React from "react";
import fitViewport from "metabase/hoc/FitViewPort";
import Navbar from "./Navbar";
import "./RoleLayout.css";


export const Layout = fitViewport(({ main, sidebar }) => {
  return (
    <div className="flex flex-row role-layout">
      <div style = {{width: "35%"}} className="bg-white border-right">{sidebar}</div>
      <div style = {{width: "65%"}}>{main}</div>
    </div>
  );
});



const RoleLayout = (props) => {
  console.log(props);
  return(
    <>
    <Navbar location={props.location}/>
    <Layout sidebar = {props.sidebar} main={props.main} />
    </>
  )
}

export default RoleLayout;
