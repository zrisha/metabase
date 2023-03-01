
import React from "react";

export default function Sidebar({top, bottom, heights}){
    if(!heights)
      heights = [50,50]
    return (
      <div className="flex flex-column role-sidebar-layout">
          <section style={{height: `${heights[0]}%`}}>{top}</section>
          <section style={{height: `${heights[1]}%`}}>{bottom}</section>
      </div>
    )
  }