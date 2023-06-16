import React from "react";
import Icon from "metabase/components/Icon";
import './Ping.css';

const Ping = (props) => {
    const style = {
      width: "25px",
      height: "25px",
      position: "fixed",
      zIndex: "100000",
      left: props.x - 12,
      top: props.y - 12
    }
  
    return <div key={props.key} style={style} className="rr-block">
      <Icon name={props.icon} size={20} />
    </div>
  }

  export default Ping