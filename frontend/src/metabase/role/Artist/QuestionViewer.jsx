import React from "react";
import QuestionAndResultLoader from "metabase/containers/QuestionAndResultLoader";
import Visualization from "metabase/role/Detective/dashboard/Visualization";
import Card from "metabase/components/Card";
import Select from "metabase/components/Select";
import _ from "underscore";
import { Flex } from "grid-styled";
import EmptyState from "metabase/components/EmptyState";
import { trackStructEvent } from "metabase/lib/analytics";
import {
  getIconForVisualizationType,
} from "metabase/visualizations";

export default class QuestionApp extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            selectedQuestion: false,
        }
    }

    onChange = (id) => {
        this.setState({selectedQuestion: id})
        //log action
        trackStructEvent(this.props.role, "Select Question", "question_id", id)
    }

    parseFavorites = (cards) => {
      return Object.entries(cards).map(([key, card], i) => {
        const {data, ...otherVals} = card
        return {...otherVals, ...data, key, value: i}
      });
    }

    render() {
      const favs = this.parseFavorites(this.props.favoriteCards);
      const selected = favs[this.state.selectedQuestion]

      return <div className="QuestionViewer">
        <Select
          placeholder="Select one of your team's visualizations to view"
          value={this.state.selectedQuestion}
          onChange={e => this.onChange(e.target.value)}
          options={favs.map(question => ({
              name: question.hash ? `${question.name} ${JSON.stringify(question.filterQuery)}` : question.name, 
              icon: getIconForVisualizationType(question.display), 
              value: question.value
          }))}/>

          {favs && <Card style={{height: "90%"}}>
              {selected ? 
              <QuestionAndResultLoader
                  questionId={selected.hash ? null : parseInt(selected.key)}
                  questionHash={selected.hash ? selected.key : null}
                  >
                  {({ question, rawSeries }) => 
                      rawSeries && (
                      <Visualization 
                        className="flex-full" 
                        rawSeries={rawSeries} 
                        showTitle
                        description={selected.hash ? `This data is filtered. Current filter = ${JSON.stringify(selected.filterQuery)}` : null}
                        headerIcon={selected.hash ? {name: 'filter'} : null}/>
                      )
                  }
              </QuestionAndResultLoader> :
              <Flex justifyContent='center' alignItems='center' style={{height:'100%'}}>
              <EmptyState
                title={`No results`}
                icon="bar"
              />
              </Flex>}
          </Card>}
      </div>
  }
}