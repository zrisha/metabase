import React, { Component } from "react";
import {connect} from "react-redux";
import { getUser } from "metabase/selectors/user";
import "./Detective.css";
import _ from "underscore";
import { getFavoritesGrp, getFilters, getNotes } from "../actions";
import withToast from "metabase/hoc/Toast";
import Collections from "metabase/entities/collections";
import Dashboards from "metabase/entities/dashboards";
import DashboardApp from "metabase/role/Detective/dashboard/DetectiveDashboardApp";


@withToast
class DetectiveDo extends Component {
    constructor() {
        super();
    }

    async componentDidMount(){
        this.collection = this.props.collections.find(col => col.name.toLowerCase().includes('team'));

        this.dashboard = this.props.dashboards.find(dash => dash.collection_id == this.collection.id);

        if(this.props.groupId){
            this.props.getFavoritesGrp({groupId: this.props.groupId});
            this.props.getFilters({groupId: this.props.groupId, dashboardId: this.dashboard.id});
            this.props.getNotes({groupId: this.props.groupId});
        }
        window.addEventListener("resize", this.resizeWindow);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.resizeWindow);
    }

    render(){
        return <>
            {this.dashboard && <DashboardApp location = {this.props.location} dashboardId ={this.dashboard.id}/>}
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
    getFilters,
    getNotes
}

export default _.compose(
    Collections.loadList(),
    Dashboards.loadList(),
    connect(mapStateToProps, mapDispatchToProps),
  )(DetectiveDo);