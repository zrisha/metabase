import React, {useState} from "react";
import Card from 'metabase/components/Card';
import Label from "metabase/components/type/Label";
import Text from "metabase/components/type/Text";
import Icon from "metabase/components/Icon";
import Tooltip from "metabase/components/Tooltip";


const TaskRow = (props) => {
  const iconColor = props.completed ? "green" : "lightgrey";

  return(
    <tr style={{backgroundColor: 'unset'}}>
      <td>
        <Icon name="check" style={{color: iconColor}}/>
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
  const numFavorited = props.favoriteCards ? Object.keys(props.favoriteCards).length : false;
  const numFilters = props.savedFilters ? props.savedFilters.length : false;
  const numNotes = props.notes ? props.notes.length : false;

  const taskData = [
    {
      completed: numFavorited != false & numFavorited >= 1 ? true : false,
      label: 'Favorite Visualizations',
      text: 'Pick the most important visualizations for your team',
      tooltip: <span>You can favorite visualizations by hovering over them and clicking the star <Icon name="star_outline"/> button</span>,
      progress: `${numFavorited}`
    },
    {
      completed: numFilters != false & numFilters >= 1 ? true : false,
      label: 'Save Filters',
      text: 'Filter out less relevant data to highlight others',
      tooltip: <span>You can apply filters at the top of the dashboard by selecting a field. Then, click the Save Filter button</span>,
      progress: `${numFilters}`
    },
    {
      completed: numNotes != false & numNotes >= 1 ? true : false,
      label: 'Write Notes',
      text: 'Write down the key findings of your analysis',
      tooltip: <span>You can write notes below. Click the plus sign to add a new note, then click it in the list to bring up the editor.</span>,
      progress: `${numNotes}`
    }
  ]

  return <Card style={{width: "100%", height: "95%", textAlign: "center", overflowX: 'scroll'}}>
      <table className="Table">
      <tbody>
        <tr className="text-medium" style={{backgroundColor: 'unset', fontSize: '14px', fontWeight: 700}}>
          <td></td>
          <td>Task</td>
          <td>#of</td>
        </tr>
        {taskData.map(props => <TaskRow key={props.label} {...props} />)}
        </tbody>
      </table>
  </Card>;
}
