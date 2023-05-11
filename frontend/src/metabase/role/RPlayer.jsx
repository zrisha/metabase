import React, { Component } from 'react';
import Utils from "metabase/lib/utils";
import { CSSTransitionGroup } from 'react-transition-group';
import Ping from './Ping';
import Button from "metabase/core/components/Button";

class RPlayer extends React.Component{
  constructor(props){
    super(props);
    this.wrapper = React.createRef();
    this.state = {
      pings: {}
    }
  }

  //Client side ping and socket emit
  handleClick = (e) => {
    const key = Utils.uuid();
    this.setState(prevState => ({
      pings: {
          ...prevState.pings,
          [key]: e
      }
    }));
    this.props.socket.emit("agent-event", { x: e.clientX, y: e.clientY, event: 'agent-click'});
    setTimeout(() => {
      this.setState(prevState => {
        delete prevState.pings[key];
        return {
          pings: prevState.pings
        }
      });
    }, 700)
  }
  
  userEvent = (data) => {
    this.replayer.addEvent(data);
  }

  componentDidMount() {
    //Catching missing node error for rrweb requires overriding console.warn or changing source code.
    //console.oldWarn = console.warn;
    // console.warn = (...args) => {
    //   var messages = args.filter(e => typeof e == 'string');
    //   console.log(messages);
    // }

    this.replayer = new rrweb.Replayer([], {
      root: this.wrapper.current,
      liveMode: true,
      recordCrossOriginIframes: true,
      useVirtualDom: true,
      UNSAFE_replayCanvas: true,
      logger: window.console
    });
    
    const BUFFER_MS = 500;
    this.replayer.startLive(Date.now() - BUFFER_MS);

    this.props.socket.on("user-event", this.userEvent);

    this.replayerDOM = document.querySelector('.replayer-wrapper')

    setTimeout(() => {
      this.props.socket.emit("agent-event", { event: 'new-viewer'});
    },1000)

    this.replayerDOM.addEventListener("click", this.handleClick);
  }

  componentWillUnmount(){
    this.replayerDOM.removeEventListener("click", this.handleClick);
    this.props.socket.removeListener('user-event', this.userEvent);
    this.replayer.destroy();
  }

  requestDriving = () => {
    if(this.props.room.driver){
      this.props.socket.emit("agent-event", { event: 'request-driving'});
    }else{
      this.props.socket.emit("claim-driver")
    }
  }

  render() {
    return <>
      <div className="flex" style={{height: "66px", position: 'absolute', zIndex: 1000, justifyContent:"center", width: "100%", color: 'white', backgroundColor: 'rgb(80, 158, 227)'}}>
        <div style={{width: "25%", lineHeight: '36px'}}>
          <p>Driver User ID:{this.props.room.driver}</p>
        </div>
        <div style={{width: "25%", lineHeight: '36px'}}>
          <p>Navigators User ID:{this.props.room.navigators}</p>
        </div>
        <div style={{width: "25%", lineHeight: '36px'}}>
          <p><Button purple onClick={this.requestDriving}>Request Control</Button></p>
        </div>
      </div>
      <div className="my-own-wrapper" ref={this.wrapper} onClick={this.onClick}/>
      <CSSTransitionGroup
        transitionName="example"
        transitionEnterTimeout={400}
        transitionLeaveTimeout={300}>
          {Object.entries(this.state.pings).map(([key,entry]) => <Ping key={key} x={entry.x} y={entry.y} />)}
      </CSSTransitionGroup>
    </>;
  }
}


export default RPlayer;