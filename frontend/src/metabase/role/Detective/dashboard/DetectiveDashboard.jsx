// TODO: merge with metabase/dashboard/containers/Dashboard.jsx
import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "underscore";

import DashboardControls from "metabase/dashboard/components/../hoc/DashboardControls";
import { DashboardSidebars } from "metabase/dashboard/components/DashboardSidebars";
import DashboardHeader from "metabase/dashboard/components/DashboardHeader";
import {
  CardsContainer,
  DashboardStyled,
  DashboardLoadingAndErrorWrapper,
  DashboardBody,
  HeaderContainer,
  ParametersAndCardsContainer,
  ParametersWidgetContainer,
} from "metabase/dashboard/components/Dashboard/Dashboard.styled";
import DashboardGrid from "metabase/role/Detective/dashboard/DetectiveDashboardGrid";
import SyncedParametersList from "metabase/parameters/components/SyncedParametersList/SyncedParametersList";
import DashboardEmptyState from "metabase/dashboard/components/Dashboard/DashboardEmptyState/DashboardEmptyState";
import { updateParametersWidgetStickiness } from "metabase/dashboard/components/Dashboard/stickyParameters";
import { getValuePopulatedParameters } from "metabase/parameters/utils/parameter-values";
import Button from "metabase/core/components/Button";

const SCROLL_THROTTLE_INTERVAL = 1000 / 24;

// NOTE: move DashboardControls HoC to container
@DashboardControls
export default class Dashboard extends Component {
  state = {
    error: null,
    isParametersWidgetSticky: false,
    isNewFilter: false,
    filterQuery: {}
  };

  static propTypes = {
    loadDashboardParams: PropTypes.func,
    location: PropTypes.object,

    isFullscreen: PropTypes.bool,
    isNightMode: PropTypes.bool,
    isSharing: PropTypes.bool,
    isEditable: PropTypes.bool,
    isEditing: PropTypes.oneOfType([PropTypes.bool, PropTypes.object])
      .isRequired,
    isEditingParameter: PropTypes.bool.isRequired,

    dashboard: PropTypes.object,
    dashboardId: PropTypes.number,
    parameters: PropTypes.array,
    parameterValues: PropTypes.object,
    editingParameter: PropTypes.object,

    editingOnLoad: PropTypes.bool,
    addCardOnLoad: PropTypes.number,
    addCardToDashboard: PropTypes.func.isRequired,
    addParameter: PropTypes.func,
    archiveDashboard: PropTypes.func.isRequired,
    cancelFetchDashboardCardData: PropTypes.func.isRequired,
    fetchDashboard: PropTypes.func.isRequired,
    fetchDashboardCardData: PropTypes.func.isRequired,
    initialize: PropTypes.func.isRequired,
    onRefreshPeriodChange: PropTypes.func,
    saveDashboardAndCards: PropTypes.func.isRequired,
    setDashboardAttributes: PropTypes.func.isRequired,
    setEditingDashboard: PropTypes.func.isRequired,
    setErrorPage: PropTypes.func,
    setSharing: PropTypes.func.isRequired,
    setParameterValue: PropTypes.func.isRequired,
    setEditingParameter: PropTypes.func.isRequired,
    setParameterIndex: PropTypes.func.isRequired,

    onUpdateDashCardVisualizationSettings: PropTypes.func.isRequired,
    onUpdateDashCardColumnSettings: PropTypes.func.isRequired,
    onReplaceAllDashCardVisualizationSettings: PropTypes.func.isRequired,

    onChangeLocation: PropTypes.func.isRequired,
    onSharingClick: PropTypes.func,
    onEmbeddingClick: PropTypes.any,
    sidebar: PropTypes.shape({
      name: PropTypes.string,
      props: PropTypes.object,
    }).isRequired,
    closeSidebar: PropTypes.func.isRequired,
    openAddQuestionSidebar: PropTypes.func.isRequired,
    showAddQuestionSidebar: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    isEditable: true,
    isSharing: false,
  };

  constructor(props) {
    super(props);
    this.parametersWidgetRef = React.createRef();
    this.parametersAndCardsContainerRef = React.createRef();
  }

  // NOTE: all of these lifecycle methods should be replaced with DashboardData HoC in container
  componentDidMount() {
    this.loadDashboard(this.props.dashboardId);

    const throttleParameterWidgetStickiness = _.throttle(
      () => updateParametersWidgetStickiness(this),
      SCROLL_THROTTLE_INTERVAL,
    );

    window.addEventListener("scroll", throttleParameterWidgetStickiness, {
      passive: true,
    });
    window.addEventListener("resize", throttleParameterWidgetStickiness, {
      passive: true,
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.dashboardId !== nextProps.dashboardId) {
      this.loadDashboard(nextProps.dashboardId);
    } else if (
      !_.isEqual(this.props.parameterValues, nextProps.parameterValues) ||
      !this.props.dashboard
    ) {
      this.props.fetchDashboardCardData({ reload: false, clear: true });
    }
  }

  componentWillUnmount() {
    this.props.cancelFetchDashboardCardData();

    window.removeEventListener("scroll", updateParametersWidgetStickiness);
    window.removeEventListener("resize", updateParametersWidgetStickiness);
  }

  componentDidUpdate(prevProps){
    //Update filter query and whether it is new
    const newParam = _.isEqual(prevProps.parameterValues,this.props.parameterValues) == false;
    const newSavedFilter = _.isEqual(prevProps.savedFilters,this.props.savedFilters) == false;

    if(newParam || newSavedFilter){
      const filterQuery = this.convertToQuery();
      let isNewFilter;
      if(_.isEmpty(this.props.savedFilters) & !_.isEmpty(filterQuery)){
        isNewFilter = true
      }else{
        isNewFilter = _.isEmpty(filterQuery)  ? false : this.props.savedFilters.find(filter => _.isEqual(filter,filterQuery)) == undefined; 
      }
      console.log({isNewFilter, filterQuery, savedFilters: this.props.savedFilters});
      this.setState({ isNewFilter, filterQuery });
    }

    //Load filter
    if(this.props.loadQuery &&
      (_.isEqual(this.props.loadQuery, prevProps.loadQuery) == false) &&
      (_.isEqual(this.props.loadQuery, this.state.filterQuery) == false)){
      this.loadDashboard(this.props.dashboardId, this.props.loadQuery);
    }
  }

  convertToQuery = () => {
    const {parameters, parameterValues} = this.props;
    const params =  getValuePopulatedParameters(parameters, parameterValues);
    return params.filter(param => param.value).reduce(
      (acc, param) => {
        acc[param.slug] = Array.isArray(param.value) && param.value.length == 1 ? param.value[0] : param.value;
        return acc
      }, {});
  }

  async loadDashboard(dashboardId, query = null) {
    const {
      editingOnLoad,
      addCardOnLoad,
      addCardToDashboard,
      fetchDashboard,
      initialize,
      loadDashboardParams,
      location,
      setErrorPage,
    } = this.props;

    initialize();
    loadDashboardParams();

    query = query ? query: location.query;

    try {
      await fetchDashboard(dashboardId, query);
      if (editingOnLoad) {
        this.setEditing(this.props.dashboard);
      }
      if (addCardOnLoad != null) {
        addCardToDashboard({ dashId: dashboardId, cardId: addCardOnLoad });
      }
    } catch (error) {
      if (error.status === 404) {
        setErrorPage({ ...error, context: "dashboard" });
      } else {
        console.error(error);
        this.setState({ error });
      }
    }
  }

  setEditing = isEditing => {
    this.props.onRefreshPeriodChange(null);
    this.props.setEditingDashboard(isEditing);
  };

  setDashboardAttribute = (attribute, value) => {
    this.props.setDashboardAttributes({
      id: this.props.dashboard.id,
      attributes: { [attribute]: value },
    });
  };

  onToggleAddQuestionSidebar = () => {
    if (this.props.showAddQuestionSidebar) {
      this.props.closeSidebar();
    } else {
      this.props.openAddQuestionSidebar();
    }
  };

  onCancel = () => {
    this.props.setSharing(false);
  };

  onSharingClick = () => {
    this.props.setSharing(true);
  };

  onSaveFilter = () => {
    if(this.state.isNewFilter)
      this.props.saveFilter({newFilter: this.state.filterQuery, roomID: this.props.roomID});
  }

  render() {
    const {
      addParameter,
      dashboard,
      isEditing,
      isEditingParameter,
      isFullscreen,
      isNightMode,
      isSharing,
      parameters,
      savedFilters,
      showAddQuestionSidebar,
      parameterValues,
      editingParameter,
      setParameterValue,
      setParameterIndex,
      setEditingParameter,
    } = this.props;

    const { error, isParametersWidgetSticky } = this.state;

    const shouldRenderAsNightMode = isNightMode && isFullscreen;
    const dashboardHasCards = dashboard => dashboard.ordered_cards.length > 0;

    const parametersWidget = (
      <SyncedParametersList
        parameters={getValuePopulatedParameters(parameters, parameterValues)}
        editingParameter={editingParameter}
        dashboard={dashboard}
        isFullscreen={isFullscreen}
        isNightMode={shouldRenderAsNightMode}
        isEditing={isEditing}
        setParameterValue={setParameterValue}
        setParameterIndex={setParameterIndex}
        setEditingParameter={setEditingParameter}
      />
    );
    
    const shouldRenderParametersWidgetInViewMode =
      !isEditing && !isFullscreen && parameters.length > 0;

    const shouldRenderParametersWidgetInEditMode =
      isEditing && parameters.length > 0;

    const cardsContainerShouldHaveMarginTop =
      !shouldRenderParametersWidgetInViewMode &&
      (!isEditing || isEditingParameter);

    return (
      <DashboardLoadingAndErrorWrapper
        isFullHeight={isEditing || isSharing}
        isFullscreen={isFullscreen}
        isNightMode={shouldRenderAsNightMode}
        loading={!dashboard}
        error={error}
      >
        {() => (
          <DashboardStyled>
            <HeaderContainer
              isFullscreen={isFullscreen}
              isNightMode={shouldRenderAsNightMode}
            >
              <DashboardHeader
                {...this.props}
                onEditingChange={this.setEditing}
                setDashboardAttribute={this.setDashboardAttribute}
                addParameter={addParameter}
                parametersWidget={parametersWidget}
                onSharingClick={this.onSharingClick}
                onToggleAddQuestionSidebar={this.onToggleAddQuestionSidebar}
                showAddQuestionSidebar={showAddQuestionSidebar}
              />

              {shouldRenderParametersWidgetInEditMode && (
                <ParametersWidgetContainer isEditing={isEditing}>
                  {parametersWidget}
                </ParametersWidgetContainer>
              )}
            </HeaderContainer>

            <DashboardBody isEditingOrSharing={isEditing || isSharing}>
              <ParametersAndCardsContainer
                data-testid="dashboard-parameters-and-cards"
                innerRef={element =>
                  (this.parametersAndCardsContainerRef = element)
                }
              >
                {shouldRenderParametersWidgetInViewMode && (
                  <ParametersWidgetContainer
                    innerRef={element => (this.parametersWidgetRef = element)}
                    isSticky={isParametersWidgetSticky}
                  >
                    <div className="flex justify-between">
                    <div>{parametersWidget}</div>
                    <Button onClick={() => this.onSaveFilter()} disabled={!this.state.isNewFilter} primary small round style={{maxHeight:'38px'}}>Save Filter</Button>
                    </div>
                  </ParametersWidgetContainer>
                )}

                <CardsContainer
                  addMarginTop={cardsContainerShouldHaveMarginTop}
                >
                  {dashboardHasCards(dashboard) ? (
                    <DashboardGrid
                      {...this.props}
                      onEditingChange={this.setEditing}
                    />
                  ) : (
                    <DashboardEmptyState
                      isNightMode={shouldRenderAsNightMode}
                    />
                  )}
                </CardsContainer>
              </ParametersAndCardsContainer>

              <DashboardSidebars
                {...this.props}
                onCancel={this.onCancel}
                showAddQuestionSidebar={showAddQuestionSidebar}
              />
            </DashboardBody>
          </DashboardStyled>
        )}
      </DashboardLoadingAndErrorWrapper>
    );
  }
}
