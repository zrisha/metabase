/* eslint-disable react/prop-types */
import React, {useEffect} from "react";
import Utils from "metabase/lib/utils";
import { CSSTransitionGroup } from 'react-transition-group';
import Ping from "./Ping";
import Modal from "metabase/components/Modal";
import ModalContent from "metabase/components/ModalContent";
import Button from "metabase/core/components/Button";

class IsDriver extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      pings: {},
      modal: null
    }
  }

  renderModal() {
    const { modal } = this.state;

    const Buttons = <div>
      <Button style={{marginRight: '20px'}}onClick={() => this.setState({ modal: null })} danger>No</Button>
      <Button onClick={() => this.props.socket.emit("change-driver", {user:{id:modal.userId}})}>Yes</Button>
    </div>

    //Modal for requesting driving
    if (modal) {
      return (
        <Modal className="driver-modal" small onClose={() => this.setState({ modal: null })}>
          <ModalContent
            title={`Allow User ${modal.userId} to take control?`}
            footer={Buttons}
            className="rr-block"
          >
            {`User ${modal.userId} is requesting control`}
          </ModalContent>
        </Modal>
      );
    } else {
      return null;
    }
  }

  //Restarts rrweb streaming when a new user joins (otherwise won't update properly)
  newViewer = (data) => {
    setTimeout(() =>{
      this.stop();
      this.stop = rrweb.record({
        emit: (event) => {
          // sent to room for agent
          this.props.socket.emit("send-event", { event: event });
        },
        recordCanvas: true,
        sampling: {
          canvas: 5,
        }
      });
    }, 1000)

  }

  handleRequestDriving = (data) => {
    this.setState({modal: {userId: data.user.id}})
  }

  //For pings from viewer
  agentClick = (data) => {
    const key = Utils.uuid();
    this.setState(prevState => ({
      pings: {
          ...prevState.pings,
          [key]: data
      }
    }));

    setTimeout(() => {
      this.setState(prevState => {
        delete prevState.pings[key];
        return {
          pings: prevState.pings
        }
      });
    }, 700)
  }

  componentDidMount(){
    this.stop = rrweb.record({
      emit: (event) => {
        // sent to room for agent
        this.props.socket.emit("send-event", { event: event });
      },
      recordCanvas: true,
      sampling: {
        canvas: 5,
      }
    });

    this.props.socket.on("agent-click", this.agentClick);

    this.props.socket.on("request-driving", this.handleRequestDriving);

    //recevied from agent side
    this.props.socket.on("new-viewer", this.newViewer);
  }

  componentWillUnmount(){
    this.stop();
    this.props.socket.removeListener("request-driving", this.handleRequestDriving);
    this.props.socket.removeListener("new-viewer", this.newViewer);
    this.props.socket.removeListener("agent-click", this.agentClick);
  }

  render(){
    return (
      <>
        {this.props.children}
        {this.renderModal()}
        <CSSTransitionGroup
          transitionName="example"
          transitionEnterTimeout={400}
          transitionLeaveTimeout={300}>
            {Object.entries(this.state.pings).map(([key,entry]) => <Ping key={key} x={entry.x} y={entry.y} icon={entry.icon} />)}
        </CSSTransitionGroup>
      </>
    )

  }
}

export default IsDriver;
