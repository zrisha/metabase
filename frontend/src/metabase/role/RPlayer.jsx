import React from 'react';
import Utils from "metabase/lib/utils";
import { CSSTransitionGroup } from 'react-transition-group';
import Ping from './Ping';
import Collaborator from './Collaborator';
import Button from "metabase/core/components/Button";
import EntityMenu from "metabase/components/EntityMenu";
import { color, darken } from "metabase/lib/colors";
import Icon from "metabase/components/Icon";
import Link from "metabase/components/Link";
import RoleLogo from './RoleLogo';
import { capitalize } from "metabase/lib/formatting";

class RPlayer extends React.Component{
  constructor(props){
    super(props);
    this.wrapper = React.createRef();
    this.roleName = false
    this.state = {
      pings: {},
      pingIcon: 'chevronup'
    }
  }

  //Client side ping and socket emit
  handleClick = (e) => {
    const key = Utils.uuid();
    const newPing = { x: e.clientX, y: e.clientY, event: 'agent-click', icon: this.state.pingIcon}
    this.setState(prevState => ({
      pings: {
          ...prevState.pings,
          [key]: newPing
      }
    }));
    this.props.socket.emit("agent-event", newPing);
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

    if(this.props.role){
      this.roleName = capitalize(this.props.role);
    }

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

  renderCollaborators(room){
    const {driver, navigators, names} = room;

    const fnames = names ? names : {};

    return (
      <div>
        {driver && <Collaborator driver id={driver} name={fnames[driver]}/>}
        {navigators && navigators.map(navigator => <Collaborator id={navigator} name={fnames[navigator]}/>)}
      </div>
    )
  }

  render() {
    const {room} = this.props;

    return <>
      <div className="flex justify-between align-center" style={{height: "66px", position: 'absolute', zIndex: 1000, width: "100%", color: 'white', backgroundColor: color('bg-dark')}}>
        <div className='flex align-center'>
          <RoleLogo />
          {room && this.renderCollaborators(room)}
        </div>
        <div>
          {<h2> Observing {capitalize(this.props.role)}</h2>}
        </div>
        <div className='flex align-center'>
        <div>
          <p><Button className="bg-purple-hover" primary onClick={this.requestDriving}>Request Control</Button></p>
        </div>
        <div className="flex align-center">
        <EntityMenu
            className="hide sm-show mr1"
            trigger={
              <Link
                mr={1}
                p={1}
                hover={{
                  backgroundColor: darken(color("brand")),
                }}
                className="flex align-center rounded transition-background"
                data-metabase-event={`NavBar;Create Menu Click`}
              >
                <Icon name={this.state.pingIcon} size={14} />
                <h4 className="hide sm-show ml1 text-nowrap">Icon</h4>
              </Link>
            }
            items={[
                {
                  title: 'Click',
                  icon: `chevronup`,
                  action: () => this.setState({pingIcon: 'chevronup'}),
                  event: `NavBar;New Question Click;`,
                },
                {
                  title: 'Star',
                  icon: 'insight',
                  action: () => this.setState({pingIcon: 'insight'}),
                  event: `NavBar;New SQL Query Click;`,
                },
              {
                title: 'Plus',
                icon: 'add',
                action: () => this.setState({pingIcon: 'add'}),
                event: `NavBar;New Dashboard Click;`,
              },
              {
                title: 'Close',
                icon: 'close',
                action: () => this.setState({pingIcon: 'close'}),
                event: `NavBar;New Collection Click;`,
              },
            ]}
          />
        </div>
      </div>
      </div>
      <div className="my-own-wrapper" ref={this.wrapper} onClick={this.onClick}/>
      <CSSTransitionGroup
        transitionName="example"
        transitionEnterTimeout={400}
        transitionLeaveTimeout={300}>
          {Object.entries(this.state.pings).map(([key,entry]) => <Ping key={key} x={entry.x} y={entry.y} icon={entry.icon} />)}
      </CSSTransitionGroup>
    </>;
  }
}


export default RPlayer;