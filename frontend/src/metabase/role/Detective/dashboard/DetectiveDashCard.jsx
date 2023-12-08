/* eslint-disable react/prop-types */
import React, { Component } from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import { t } from "ttag";
import visualizations, { getVisualizationRaw } from "metabase/visualizations";
import { mergeSettings } from "metabase/visualizations/lib/settings";
import Visualization, {
  ERROR_MESSAGE_GENERIC,
  ERROR_MESSAGE_PERMISSION,
} from "metabase/role/Detective/dashboard/Visualization";
import QueryDownloadWidget from "metabase/query_builder/components/QueryDownloadWidget";

import ModalWithTrigger from "metabase/components/ModalWithTrigger";
import { ChartSettingsWithState } from "metabase/visualizations/components/ChartSettings";
import WithVizSettingsData from "metabase/visualizations/hoc/WithVizSettingsData";

import Icon, { iconPropTypes } from "metabase/components/Icon";
import Tooltip from "metabase/components/Tooltip";

import { isVirtualDashCard } from "metabase/dashboard/utils";
import DashCardParameterMapper from "metabase/dashboard/components/DashCardParameterMapper";

import { IS_EMBED_PREVIEW } from "metabase/lib/embed";
import { getClickBehaviorDescription } from "metabase/lib/click-behavior";

import cx from "classnames";
import _ from "underscore";
import { getIn } from "icepick";
import { getParameterValuesBySlug } from "metabase/parameters/utils/parameter-values";
import Utils from "metabase/lib/utils";

const DATASET_USUALLY_FAST_THRESHOLD = 15 * 1000;

const HEADER_ICON_SIZE = 16;

const HEADER_ACTION_STYLE = {
  padding: 4,
};

// This is done to add the `getExtraDataForClick` prop.
// We need that to pass relevant data along with the clicked object.
const WrappedVisualization = WithVizSettingsData(
  connect(null, dispatch => ({ dispatch }))(Visualization),
);

export default class DashCard extends Component {
  static propTypes = {
    dashcard: PropTypes.object.isRequired,
    gridItemWidth: PropTypes.number.isRequired,
    dashcardData: PropTypes.object.isRequired,
    slowCards: PropTypes.object.isRequired,
    parameterValues: PropTypes.object.isRequired,
    markNewCardSeen: PropTypes.func.isRequired,
    fetchCardData: PropTypes.func.isRequired,
    navigateToNewCardFromDashboard: PropTypes.func.isRequired,
    headerIcon: PropTypes.shape(iconPropTypes),
  };

  constructor(props) {
    super(props);

    this.state = {
      isPreviewingCard: false,
    };
    this.cardRef = React.createRef();
  }

  async componentDidMount() {
    const { dashcard, markNewCardSeen } = this.props;

    // HACK: way to scroll to a newly added card
    if (dashcard.justAdded) {
      const element = ReactDOM.findDOMNode(this);
      if (element && element.scrollIntoView) {
        element.scrollIntoView({ block: "nearest" });
      }
      markNewCardSeen(dashcard.id);
    }
  }

  componentWillUnmount() {
    window.clearInterval(this.visibilityTimer);
  }

  handlePreviewToggle = () => {
    this.setState(prevState => ({
      isPreviewingCard: !prevState.isPreviewingCard,
    }));
  };

  preventDragging = e => {
    e.stopPropagation();
  };

  favoriteGrp = () => {
    const {cardId, groupId, action} = this.props.favoriteGrp;
    const vizNode = this.cardRef.current.querySelector('.CardVisualization');
    action({cardId, groupId, vizNode});
  }

  render() {
    const {
      dashcard,
      dashcardData,
      favorited,
      unfavoriteGrp,
      slowCards,
      isEditing,
      clickBehaviorSidebarDashcard,
      isEditingParameter,
      isFullscreen,
      onAddSeries,
      onRemove,
      navigateToNewCardFromDashboard,
      metadata,
      dashboard,
      parameterValues,
      mode,
      headerIcon,
    } = this.props;

    const mainCard = {
      ...dashcard.card,
      visualization_settings: mergeSettings(
        dashcard.card.visualization_settings,
        dashcard.visualization_settings,
      ),
    };
    const cards = [mainCard].concat(dashcard.series || []);
    const dashboardId = dashcard.dashboard_id;
    const isEmbed = Utils.isJWT(dashboardId);
    const series = cards.map(card => ({
      ...getIn(dashcardData, [dashcard.id, card.id]),
      card: card,
      isSlow: slowCards[card.id],
      isUsuallyFast:
        card.query_average_duration &&
        card.query_average_duration < DATASET_USUALLY_FAST_THRESHOLD,
    }));

    const loading = !(series.length > 0 && _.every(series, s => s.data));
    const expectedDuration = Math.max(
      ...series.map(s => s.card.query_average_duration || 0),
    );
    const usuallyFast = _.every(series, s => s.isUsuallyFast);
    const isSlow =
      loading &&
      _.some(series, s => s.isSlow) &&
      (usuallyFast ? "usually-fast" : "usually-slow");
    const errors = series.map(s => s.error).filter(e => e);

    let errorMessage, errorIcon;
    if (_.any(errors, e => e && e.status === 403)) {
      errorMessage = ERROR_MESSAGE_PERMISSION;
      errorIcon = "key";
    } else if (errors.length > 0) {
      if (IS_EMBED_PREVIEW) {
        errorMessage = (errors[0] && errors[0].data) || ERROR_MESSAGE_GENERIC;
      } else {
        errorMessage = ERROR_MESSAGE_GENERIC;
      }
      errorIcon = "warning";
    }

    const parameterValuesBySlug = getParameterValuesBySlug(
      dashboard.parameters,
      parameterValues,
    );

    const hideBackground =
      !isEditing &&
      mainCard.visualization_settings["dashcard.background"] === false;

    const isEditingDashboardLayout =
      isEditing && clickBehaviorSidebarDashcard == null && !isEditingParameter;
    
    return (
      <div
        ref={this.cardRef}
        className={cx(
          "Card bordered rounded flex flex-column hover-parent hover--visibility",
          {
            "Card--slow": isSlow === "usually-slow",
            "card-favorited": favorited
          }
        )}
        style={
          hideBackground
            ? { border: 0, background: "transparent", boxShadow: "none" }
            : null
        }
      >
        {true ? (
          <DashboardCardActionsPanel onMouseDown={this.preventDragging}>
            <DashCardActionButtons
              favorited={favorited}
              isEditing={isEditing}
              favoriteGrp={this.favoriteGrp}
              unfavoriteGrp={unfavoriteGrp}
              series={series}
              hasError={!!errorMessage}
              dashcard={dashcard}
              isVirtualDashCard={isVirtualDashCard(dashcard)}
              onRemove={onRemove}
              onAddSeries={onAddSeries}
              onReplaceAllVisualizationSettings={
                this.props.onReplaceAllVisualizationSettings
              }
              showClickBehaviorSidebar={() =>
                this.props.showClickBehaviorSidebar(dashcard.id)
              }
              isPreviewing={this.state.isPreviewingCard}
              onPreviewToggle={this.handlePreviewToggle}
            />
          </DashboardCardActionsPanel>
        ) : null}
        <WrappedVisualization
          className={cx("flex-full overflow-hidden", {
            "pointer-events-none": isEditingDashboardLayout,
          })}
          classNameWidgets={isEmbed && "text-light text-medium-hover"}
          error={errorMessage}
          headerIcon={headerIcon}
          errorIcon={errorIcon}
          isSlow={isSlow}
          expectedDuration={expectedDuration}
          rawSeries={series}
          showTitle
          isFullscreen={isFullscreen}
          isDashboard
          dispatch={this.props.dispatch}
          dashboard={dashboard}
          parameterValuesBySlug={parameterValuesBySlug}
          isEditing={isEditing}
          isPreviewing={this.state.isPreviewingCard}
          gridSize={
            this.props.isMobile
              ? undefined
              : { width: dashcard.sizeX, height: dashcard.sizeY }
          }
          actionButtons={
            isEmbed ? (
              <QueryDownloadWidget
                className="m1 text-brand-hover text-light"
                classNameClose="hover-child"
                card={dashcard.card}
                params={parameterValuesBySlug}
                dashcardId={dashcard.id}
                token={dashcard.dashboard_id}
                icon="download"
              />
            ) : null
          }
          onUpdateVisualizationSettings={
            this.props.onUpdateVisualizationSettings
          }
          replacementContent={
            (clickBehaviorSidebarDashcard != null || isEditingParameter) &&
            isVirtualDashCard(dashcard) ? (
              <div className="flex full-height align-center justify-center">
                <h4 className="text-medium">{t`Text card`}</h4>
              </div>
            ) : isEditingParameter ? (
              <DashCardParameterMapper dashcard={dashcard} />
            ) : clickBehaviorSidebarDashcard != null ? (
              <ClickBehaviorSidebarOverlay
                dashcard={dashcard}
                dashcardWidth={this.props.gridItemWidth}
                dashboard={dashboard}
                showClickBehaviorSidebar={this.props.showClickBehaviorSidebar}
                isShowingThisClickBehaviorSidebar={
                  clickBehaviorSidebarDashcard.id === dashcard.id
                }
              />
            ) : null
          }
          metadata={metadata}
          mode={mode}
          onChangeCardAndRun={
            navigateToNewCardFromDashboard
              ? ({ nextCard, previousCard }) => {
                  // navigateToNewCardFromDashboard needs `dashcard` for applying active filters to the query
                  navigateToNewCardFromDashboard({
                    nextCard,
                    previousCard,
                    dashcard,
                    embed:true
                  });
                }
              : null
          }
          onChangeLocation={this.props.onChangeLocation}
        />
      </div>
    );
  }
}

const DashboardCardActionsPanel = styled.div`
  padding: 0.125em 0.25em;
  position: absolute;
  background: white;
  transform: translateY(-50%);
  top: 0;
  right: 20px;
  border-radius: 8px;
  box-shadow: 0px 1px 3px rgb(0 0 0 / 13%);
  z-index: 3;
  cursor: default;
  transition: opacity 200ms;
  opacity: 0;
  pointer-events: none;

  .Card:hover & {
    opacity: 1;
    pointer-events: all;
  }

  .Dash--dragging & {
    display: none;
  }
`;

const DashCardActionButtons = ({
  favorited,
  favoriteGrp,
  unfavoriteGrp,
  series,
  dashcard,
  isVirtualDashCard,
  hasError,
  onRemove,
  isEditing
}) => {
  const buttons = [];

  if(dashcard.card_id && dashcard.card.display !== 'scalar'){
    buttons.push(
      <FavoriteButton
        cardId={dashcard.card_id}
        favorited={favorited}
        favoriteGrp={favoriteGrp}
        unfavoriteGrp={unfavoriteGrp}
        key="favorite"
      />
    )
  }

  if(isEditing){
    buttons.push(
      <Tooltip key="remove" tooltip={t`Remove`}>
        <RemoveButton className="ml1" onRemove={onRemove} />
      </Tooltip>
    )
  }

  return (
    <span className="flex align-center text-medium" style={{ lineHeight: 1 }}>
      {buttons}
    </span>
  );
};

const RemoveButton = ({ onRemove }) => (
  <a
    className="text-dark-hover drag-disabled"
    data-metabase-event="Dashboard;Remove Card Modal"
    onClick={onRemove}
    style={HEADER_ACTION_STYLE}
  >
    <Icon name="close" size={HEADER_ICON_SIZE} />
  </a>
);


const FavoriteButton = ({cardId, favorited = false, favoriteGrp, unfavoriteGrp}) => {

  const onClick = () => {
    if(favorited)
      unfavoriteGrp();
    else
      favoriteGrp();
  }
  return (<a
  className="text-dark-hover drag-disabled"
  data-metabase-event="Dashboard;Favorite Card"
  onClick={onClick}
  style={HEADER_ACTION_STYLE}
  >
    <Icon name={favorited ? "star" : "star_outline"} size={HEADER_ICON_SIZE} />
  </a>
  )
}

function getSeriesIconName(series) {
  try {
    const display = series[0].card.display;
    return visualizations.get(display === "scalar" ? "bar" : display).iconName;
  } catch (e) {
    return "bar";
  }
}

const MIN_WIDTH_FOR_ON_CLICK_LABEL = 330;

const ClickBehaviorSidebarOverlay = ({
  dashcard,
  dashcardWidth,
  showClickBehaviorSidebar,
  isShowingThisClickBehaviorSidebar,
}) => {
  return (
    <div className="flex align-center justify-center full-height">
      <div
        className={cx("text-bold flex py1 px2 mb2 rounded cursor-pointer", {
          "bg-brand text-white": isShowingThisClickBehaviorSidebar,
          "bg-light text-medium": !isShowingThisClickBehaviorSidebar,
        })}
        onClick={() =>
          showClickBehaviorSidebar(
            isShowingThisClickBehaviorSidebar ? null : dashcard.id,
          )
        }
      >
        <Icon
          name="click"
          className={cx("mr1", {
            "text-light": !isShowingThisClickBehaviorSidebar,
          })}
        />
        {dashcardWidth > MIN_WIDTH_FOR_ON_CLICK_LABEL && (
          <div className="mr2">{t`On click`}</div>
        )}
        <div
          className={cx({ "text-brand": !isShowingThisClickBehaviorSidebar })}
        >
          {getClickBehaviorDescription(dashcard)}
        </div>
      </div>
    </div>
  );
};
