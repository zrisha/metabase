import React from "react";
import Card from 'metabase/components/Card';
import Icon from "metabase/components/Icon";
import Tooltip from "metabase/components/Tooltip";


const FilterRow = (props) => {

  const roomID = props.room && props.room.roomID ? props.room.roomID : false;
  const deleteFilter = roomID ? () => props.deleteFilter({deletedFilter: props.filter, roomID}) : null;

  const onClick = () => props.loadFilter({loadQuery: props.filter});

  return <tr className="filter-row" style={{backgroundColor: 'unset'}}>
    <td onClick={onClick} className="cursor-pointer drag-disabled">
      {Object.keys(props.filter)} 
    </td>
    <td onClick={onClick} className="cursor-pointer drag-disabled">
      {Object.values(props.filter)} 
    </td>
    <td className="text-medium" style={{width: '.01%', whiteSpace: 'nowrap'}}>
      <Tooltip tooltip={'Remove'}>
        <RemoveButton  deleteFilter={deleteFilter}/>
      </Tooltip>
    </td>
  </tr>
}

const RemoveButton = ({ deleteFilter }) => (
  <a
    className="text-dark-hover drag-disabled"
    data-metabase-event="Detective;Remove Saved Filter"
  >
    <Icon name="close" size={16} onClick={deleteFilter}/>
  </a>
);

export default function SavedFilters(props) {
  return <Card style={{width: "100%", height: "95%", textAlign: "center", overflowX: 'scroll'}}>
    <table className="Table">
    <thead>
      <tr>
        <th>Category</th>
        <th>Equals</th>
      </tr>
    </thead>
      <tbody>
      {props.savedFilters.map(filter => <FilterRow filter={filter} deleteFilter={props.deleteFilter} loadFilter={props.loadFilter} room={props.room}/>)}
      </tbody>
    </table>
  </Card>;
}
