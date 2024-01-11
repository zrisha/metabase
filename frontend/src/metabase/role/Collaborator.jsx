import React from "react";
import Tooltip from "metabase/components/Tooltip";
import Icon from "metabase/components/Icon";


const Collaborator = (props) => {
    const colorClass = props.driver ? "text-green-saturated" : "";

    const tooltip = props.driver ? <div>Driver: <br /> {props.name}</div> : props.name
  
    return (
      <Tooltip tooltip={tooltip}>
        <Icon className={colorClass} name="person" size={30} />
      </Tooltip>
    )
  }

  export default Collaborator