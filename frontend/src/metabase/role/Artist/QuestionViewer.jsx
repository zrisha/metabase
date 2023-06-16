import React from "react";
import QuestionAndResultLoader from "metabase/containers/QuestionAndResultLoader";
import Visualization from "metabase/visualizations/components/Visualization";
import Card from "metabase/components/Card";
import Select from "metabase/components/Select";
import { Flex } from "grid-styled";
import EmptyState from "metabase/components/EmptyState";
import EntityListLoader from "metabase/entities/containers/EntityListLoader";
  import {
    getIconForVisualizationType,
  } from "metabase/visualizations";

export default class QuestionApp extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            selectedQuestion: '',
        }
    }

    onChange = (id) => {
        this.setState({selectedQuestion: id})
    }
    render() {
        return <div style={{height: "100%"}}>
          <EntityListLoader entityType="questions">
            {({ list }) => {
                const cards = list.filter(x=> this.props.favoriteCards.includes(x.id))
                return <>
                <Select
                    placeholder="Select one of your team's visualizations to view"
                    value={this.state.selectedQuestion}
                    onChange={e => this.onChange(e.target.value)}
                    options={cards.map(question => ({
                        name: question.name, 
                        icon: getIconForVisualizationType(question.display), 
                        value: question.id
                    }))}/>
            {cards && <Card style={{height: "90%"}}>
                {this.state.selectedQuestion ? 
                <QuestionAndResultLoader
                    questionId={this.state.selectedQuestion}
                    >
                    {({ question, rawSeries }) =>
                        rawSeries && (
                        <Visualization className="flex-full" rawSeries={rawSeries} />
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
            </>}
            }
          </EntityListLoader>
        </div>
  }
}