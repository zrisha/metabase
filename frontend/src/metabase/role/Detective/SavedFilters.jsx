import React from "react";
import Card from 'metabase/components/Card';
import Icon from "metabase/components/Icon";
import Tooltip from "metabase/components/Tooltip";


const FilterRow = (props) => {
  
  const deleteFilter = props.filterId ? () => props.deleteFilter({filterId: props.filterId}) : null;

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
      {props.savedFilters.map(entry => <FilterRow filter={entry.filter} filterId={entry.id} deleteFilter={props.deleteFilter} loadFilter={props.loadFilter} room={props.room}/>)}
      </tbody>
    </table>
  </Card>;
}
