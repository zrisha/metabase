/* eslint-disable react/prop-types */
import React, { Component } from "react";
import { connect } from "react-redux";
import { push } from "react-router-redux";
import fitViewport from "metabase/hoc/FitViewPort";
import title from "metabase/hoc/Title";
import titleWithLoadingTime from "metabase/hoc/TitleWithLoadingTime";

import Dashboard from "metabase/role/Detective/dashboard/DetectiveDashboard";

import { fetchDatabaseMetadata } from "metabase/redux/metadata";
import { setErrorPage } from "metabase/redux/app";

import {
  getIsEditing,
  getIsSharing,
  getDashboardBeforeEditing,
  getIsEditingParameter,
  getIsDirty,
  getDashboardComplete,
  getCardData,
  getSlowCards,
  getEditingParameter,
  getParameters,
  getParameterValues,
  getLoadingStartTime,
  getClickBehaviorSidebarDashcard,
  getIsAddParameterPopoverOpen,
  getSidebar,
  getShowAddQuestionSidebar,
} from "metabase/dashboard/selectors";
import { getDatabases, getMetadata } from "metabase/selectors/metadata";
import { getUserIsAdmin } from "metabase/selectors/user";

import * as dashboardActions from "metabase/dashboard/actions";
import { parseHashOptions } from "metabase/lib/browser";
import * as Urls from "metabase/lib/urls";

import { favoriteGrp, unfavoriteGrp, saveDetectiveData, saveFilter } from "metabase/role/actions";

import Dashboards from "metabase/entities/dashboards";

const mapStateToProps = (state, props) => {
  return {
    dashboardId: props.dashboardId || Urls.extractEntityId(props.params.slug),
    favoriteCards: state.role.favorites.cards ? state.role.favorites.cards : [],
    groupId: state.role.groupId ? state.role.groupId : null,
    roomID: state.role.room.detective.roomID ? state.role.room.detective.roomID : null,
    savedFilters: state.role.detective.savedFilters ? state.role.detective.savedFilters : [],
    loadQuery: state.role.detective.loadQuery ? state.role.detective.loadQuery : false,
    isAdmin: getUserIsAdmin(state, props),
    isEditing: getIsEditing(state, props),
    isSharing: getIsSharing(state, props),
    dashboardBeforeEditing: getDashboardBeforeEditing(state, props),
    isEditingParameter: getIsEditingParameter(state, props),
    isDirty: getIsDirty(state, props),
    dashboard: getDashboardComplete(state, props),
    dashcardData: getCardData(state, props),
    slowCards: getSlowCards(state, props),
    databases: getDatabases(state, props),
    editingParameter: getEditingParameter(state, props),
    parameters: getParameters(state, props),
    parameterValues: getParameterValues(state, props),
    metadata: getMetadata(state),
    loadingStartTime: getLoadingStartTime(state),
    clickBehaviorSidebarDashcard: getClickBehaviorSidebarDashcard(state),
    isAddParameterPopoverOpen: getIsAddParameterPopoverOpen(state),
    sidebar: getSidebar(state),
    showAddQuestionSidebar: getShowAddQuestionSidebar(state),
  };
};

const mapDispatchToProps = {
  ...dashboardActions,
  favoriteGrp,
  unfavoriteGrp,
  saveDetectiveData,
  saveFilter,
  archiveDashboard: id => Dashboards.actions.setArchived({ id }, true),
  fetchDatabaseMetadata,
  setErrorPage,
  onChangeLocation: push,
};

@connect(mapStateToProps, mapDispatchToProps)
@fitViewport
@title(({ dashboard }) => dashboard && dashboard.name)
@titleWithLoadingTime("loadingStartTime")
// NOTE: should use DashboardControls and DashboardData HoCs here?
export default class DashboardApp extends Component {
  state = {
    addCardOnLoad: null,
  };

  UNSAFE_componentWillMount() {
    const options = parseHashOptions(window.location.hash);

    if (options) {
      this.setState({
        editingOnLoad: options.edit,
        addCardOnLoad: options.add && parseInt(options.add),
      });
    }
  }

  render() {
    const { editingOnLoad, addCardOnLoad } = this.state;

    return (
      <div className="shrink-below-content-size full-height">
        <Dashboard
          editingOnLoad={editingOnLoad}
          addCardOnLoad={addCardOnLoad}
          {...this.props}
        />
        {/* For rendering modal urls */}
        {this.props.children}
      </div>
    );
  }
}
