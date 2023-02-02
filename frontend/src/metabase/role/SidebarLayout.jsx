
import React from "react";

export default function Sidebar({top, bottom}){
    return (
      <div className="flex flex-column role-sidebar-layout">
          <section>{top}</section>
          <section>{bottom}</section>
      </div>
    )
  }