import React, {useMemo, useEffect} from "react";
import Card from "metabase/components/Card";
import {connect} from "react-redux";
import { Box, Flex } from "grid-styled";
import Visualization from "metabase/visualizations/components/Visualization";
import ExplicitSize from "metabase/components/ExplicitSize";
import {getRoleActivity} from "./actions";

const columns = [
  {
    base_type: "type/Text",
    display_name: "Role",
    name: "role",
    field_ref: "nil",
  },
  {
    base_type: "type/Number",
    display_name: "Driving",
    name: "driving",
    field_ref: "nil",
  },
  {
    base_type: "type/Number",
    display_name: "Navigating",
    name: "navigating",
    field_ref: "nil",
  },
]

const formatData = (data) => {
  const payload = {
    journalist: [0,0],
    detective: [0,0],
    artist: [0,0]
  }
  data.forEach((row) => {
    const totalTime = Object.entries(row.durations).reduce((acc, value) => {
      const [userId, durations] = value;
      acc[0] = (acc[0] || 0) + (durations.driver || 0);
      acc[1] = (acc[1] || 0) + (durations.navigator || 0);
      return acc
    }, []);

    payload[row.role] = totalTime.map(time => Math.round(time/60 * 10) / 10);
  })
  return Object.entries(payload).map(([k,v]) => [k, ...v])
}

const TeamAnalytics = (props) => {
  useEffect(() => {
    if(props.groupId){
      props.getRoleActivity({groupId: props.groupId})
    }
  }, [props.groupId]);

  const data = useMemo(() => {
    if(props.roleActivity){
      return [{
        card: {
          //Fix before commiting, restructure data (e.g. ['journalist' 'navigator' 100])
          display: "bar",
          name: "How your team is spending its time today",
          description: "This shows the total time (in minutes) your team has spent in each role as either a driver or navigator.",
          visualization_settings: {'graph.y_axis.auto_split': false}
        },
        data: {
          cols: columns,
          rows:formatData(props.roleActivity) 
        }
      }]
    }
  }, [props.roleActivity]);

  return (
    <Flex justifyContent="center">
      <Box m={[ 1, 2]} p={1} width={[1 / 3, 1 / 4]}>
        {data && <VizCard data={data} width={props.width}/>}
      </Box>
      <Box m={[ 1, 2]}  p={1} width={[1 / 3, 1 / 4]}>
      </Box>
      <Box m={[ 1, 2 ]} p={1} width={[1 / 3, 1 / 4]}>
      </Box>
    </Flex>
  )
}


@ExplicitSize()
class VizCard extends React.Component {
  render(){
    return(
      <Card style={{height: '300px'}}>
        {this.props.width && <Visualization
          showTitle
          rawSeries={this.props.data}
          style={{
            width: this.props.width,
          }}
        />}
      </Card>
    )
  }
}

const mapDispatchToProps = {
  getRoleActivity
}

const mapStateToProps = (state, props) => ({
  groupId: state.role.groupId,
  roleActivity: state.role.home.roleActivity
});

export default connect(mapStateToProps, mapDispatchToProps)(TeamAnalytics);

