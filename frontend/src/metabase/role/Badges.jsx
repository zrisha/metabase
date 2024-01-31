import React from "react";
import Icon from "metabase/components/Icon";


const badges = {
    NEW_STORY: {text: 'New Story', icon: "edit_document"},
    NEW_ART: {text: 'New Art', icon: "palette"},
    NEW_NOTE: {text: 'New Note', icon: "reference"},
    NEW_FILTER: {text: 'New Filter', icon: "filter"},
    UPDATE_ART: {text: 'Updated Art', icon: "palette"},
    UPDATE_NOTE: {text: 'Updated Note', icon: "reference"},
    UPDATE_STORY: {text: 'Updated Story', icon: "edit_document"},
    NEW_FAV_VIZ: {text: 'New Favorite', icon: "lineandbar"},
}

const Badge = (props) => {
  const icon = badges[props.data].icon;
  const name = badges[props.data].text;
  return(
    <div className="text-centered my2">
      {name && <h4>{name}</h4>}
      <div className="relative py1">
        <Icon name="shield" size={100} style={{paddingLeft: '10px'}}/>
        <div style={{left: "43px", top: "40%"}} className="absolute text-brand-light">
          {icon && <Icon size={24} name={icon} />}
        </div>
      </div>
    </div>
  )
}

const Badges = (props) => {
    return (
      <div className="flex flex-wrap">
        {props.data.map(badgeData => <Badge data={badgeData} />)}
      </div>
    )
  }


  export default Badges