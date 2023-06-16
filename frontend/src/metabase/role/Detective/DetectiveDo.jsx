import React, { Component } from "react";
import {connect} from "react-redux";
import { getUser } from "metabase/selectors/user";
import "./Detective.css";
import { getFavoritesGrp, getRoleData } from "../actions";
import withToast from "metabase/hoc/Toast";
import DashboardApp from "metabase/role/Detective/dashboard/DetectiveDashboardApp";


@withToast
class DetectiveDo extends Component {
    constructor() {
        super();
    }

    async componentDidMount(){
        
        this.roomID = this.props.room && this.props.room.roomID ? this.props.room.roomID : false;
        this.groupId = this.props.room && this.props.room.group ? this.props.room.group : false;
        if(this.props.groupId){
            this.props.getFavoritesGrp({groupId: this.props.groupId});
        }

        this.props.getRoleData({roomID: this.roomID, role: 'detective'});
        window.addEventListener("resize", this.resizeWindow);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.resizeWindow);
    }

    render(){
        return <>
            <DashboardApp location = {this.props.location} dashboardId ={3}/>
        </>
    }

}

const mapStateToProps = (state, props) => ({
    room: state.role.room['detective'],
    groupId: state.role.room.group,
    user: getUser(state)
  });

const mapDispatchToProps = {
    getFavoritesGrp,
    getRoleData
}
  
export default connect(mapStateToProps, mapDispatchToProps)(DetectiveDo);
