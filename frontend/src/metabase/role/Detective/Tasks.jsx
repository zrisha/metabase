import React, {useState} from "react";
import Card from 'metabase/components/Card';
import Label from "metabase/components/type/Label";
import Text from "metabase/components/type/Text";
import Icon from "metabase/components/Icon";
import Tooltip from "metabase/components/Tooltip";


const TaskRow = (props) => {
  const icon = props.completed ? "check" : "close"

  return(
    <tr style={{backgroundColor: 'unset'}}>
      <td>
        <Icon name={icon} style={{color: icon == 'check' ? "green" : "red"}}/>
      </td>
      <td>
        <Label>{props.label}</Label>
        <Text>{props.text}</Text>
      </td>
      <td style={{textAlign: 'center'}}>
        <Tooltip
          tooltip={props.tooltip}>
          <Icon name="question"/>
        </Tooltip>
        <Label>{props.progress}</Label>
      </td>
    </tr>
  )
}

export default function Tasks(props) {
  const numFavorited = props.favoriteCards ? props.favoriteCards.length : false;
  const numFilters = props.savedFilters ? props.savedFilters.length : false;
  const taskData = [
    {
      completed: numFavorited & numFavorited >= 3 ? true : false,
      label: 'Favorite 3 Visualizations',
      text: 'Pick the most important visualizations for your team',
      tooltip: <span>You can favorite visualizations by hovering over them and clicking the star <Icon name="star_outline"/> button</span>,
      progress: `${numFavorited}/3`
    },
    {
      completed: numFilters & numFilters >= 3 ? true : false,
      label: 'Save 3 Filters',
      text: 'Filter out less relevant data to highlight others',
      tooltip: <span>You can apply filters at the top of the dashboard by selecting a field. Then, click the Save Filter button</span>,
      progress: `${numFilters}/3`
    },
  ]

  return <Card style={{width: "100%", height: "95%", textAlign: "center", overflowX: 'scroll'}}>
      <table className="Table">
      <tbody>
        {taskData.map(props => <TaskRow {...props} />)}
        </tbody>
      </table>
  </Card>;
}
