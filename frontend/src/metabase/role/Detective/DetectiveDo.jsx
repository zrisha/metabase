import React, { Component } from "react";
import {connect} from "react-redux";
import { getUser } from "metabase/selectors/user";
import fitViewport from "metabase/hoc/FitViewPort";
import "./Detective.css";
import _ from "underscore";
import { getFavoritesGrp, getFilters, getNotes } from "../actions";
import withToast from "metabase/hoc/Toast";
import Collections from "metabase/entities/collections";
import Dashboards from "metabase/entities/dashboards";
import DashboardApp from "metabase/role/Detective/dashboard/DetectiveDashboardApp";


const Iframe =   fitViewport((props) => {
    return <iframe style={{height: "99%", width: "100%", border: "none"}} src={props.src}></iframe>
})

@withToast 
class DetectiveDo extends Component {
    constructor() {
        super();
    }

    async componentDidMount(){
        if(this.props.groupId != 1){
            this.collection = this.props.collections.find(col => col.name.toLowerCase().includes(`team ${this.props.groupId}`));
        }else{
            this.collection = this.props.collections.find(col => col.name.toLowerCase().includes('example'));
        }

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
        const urlParams = new URLSearchParams(window.location.search);
        if(urlParams.has('embed')){
            return <Iframe src={urlParams.get('embed')} />
        }else{
        return <>
            {this.dashboard && <DashboardApp location = {this.props.location} dashboardId ={this.dashboard.id}/>}
        </>
        }
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