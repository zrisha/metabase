/* eslint-disable react/prop-types */
import React, { Component } from "react";
import PropTypes from "prop-types";

import { connect } from "react-redux";
import { push } from "react-router-redux";

import { Flex } from "grid-styled";

import * as Urls from "metabase/lib/urls";
import { color, darken } from "metabase/lib/colors";

import Link from "metabase/components/Link";
import LogoIcon from "metabase/components/LogoIcon";
import Modal from "metabase/components/Modal";

import ProfileLink from "./ProfileLink";
import Tooltip from "metabase/components/Tooltip";
import Icon from "metabase/components/Icon";

import CollectionCreate from "metabase/collections/containers/CollectionCreate";
import CreateDashboardModal from "metabase/components/CreateDashboardModal";
import { AdminNavbar } from "metabase/nav/components/AdminNavbar";

import { getPath, getContext, getUser } from "metabase/nav/selectors";
import {
  getHasDataAccess,
  getHasNativeWrite,
  getPlainNativeQuery,
} from "metabase/new_query/selectors";
import Database from "metabase/entities/databases";
import { capitalize } from "metabase/lib/formatting";


const mapStateToProps = (state, props) => ({
  path: getPath(state, props),
  context: getContext(state, props),
  user: getUser(state),
  plainNativeQuery: getPlainNativeQuery(state),
  hasDataAccess: getHasDataAccess(state),
  hasNativeWrite: getHasNativeWrite(state),
});

import { getDefaultSearchColor } from "metabase/nav/constants";

const mapDispatchToProps = {
  onChangeLocation: push,
};

const MODAL_NEW_DASHBOARD = "MODAL_NEW_DASHBOARD";
const MODAL_NEW_COLLECTION = "MODAL_NEW_COLLECTION";

@Database.loadList({
  // set this to false to prevent a potential spinner on the main nav
  loadingAndErrorWrapper: false,
})
@connect(mapStateToProps, mapDispatchToProps)
export default class Navbar extends Component {
  state = {
    modal: null,
  };

  static propTypes = {
    context: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    user: PropTypes.object,
  };

  isActive(path) {
    return this.props.path.startsWith(path);
  }

  setModal(modal) {
    this.setState({ modal });
    if (this._newPopover) {
      this._newPopover.close();
    }
  }

  renderAdminNav() {
    return (
      <>
        <AdminNavbar path={this.props.path} />
        {this.renderModal()}
      </>
    );
  }

  renderEmptyNav() {
    return (
      // NOTE: DO NOT REMOVE `Nav` CLASS FOR NOW, USED BY MODALS, FULLSCREEN DASHBOARD, ETC
      // TODO: hide nav using state in redux instead?
      <nav className="Nav sm-py1 relative">
        <ul className="wrapper flex align-center">
          <li>
            <Link
              to="/role/home"
              data-metabase-event={"Navbar;Logo"}
              className="NavItem cursor-pointer flex align-center"
            >
              <LogoIcon className="text-brand my2" />
            </Link>
          </li>
        </ul>
        {this.renderModal()}
      </nav>
    );
  }

  renderMainNav() {
    const { hasDataAccess, hasNativeWrite, location,  demoMode} = this.props;

    const roleName = capitalize(location.pathname.split("/")[2]);


    return (
      <Flex
        // NOTE: DO NOT REMOVE `Nav` CLASS FOR NOW, USED BY MODALS, FULLSCREEN DASHBOARD, ETC
        // TODO: hide nav using state in redux instead?
        className="Nav relative bg-brand text-white z3 flex-no-shrink rr-block"
        align="center"
        justify="space-between"
        style={{ backgroundColor: color("nav"), position: this.props.position }}
        py={1}
        pr={2}
      >
        {demoMode && <div className="demo">
          <div className="bar bg-gold text-dark"><Tooltip tooltip='You are in example mode because you are not part of a group. Saving and other actions are unavailable.'><Icon size={12} name="info" /></Tooltip> <span>You are in example mode, you cannot save work</span></div>
        </div>}
        <div className="role-menu">
          <Link
            to="/role/home"
            data-metabase-event={"Navbar;Logo"}
            className="relative cursor-pointer z2 rounded flex justify-center transition-background"
            p={1}
            mx={1}
            hover={{ backgroundColor: getDefaultSearchColor() }}
          >
            <Flex
              style={{ minWidth: 32, height: 32 }}
              align="center"
              justify="center"
              flexDirection="column"
            >
              <div><h3>Data Roles</h3></div>
              <div>Spin-off of <LogoIcon dark height={16} />etabase</div>
            </Flex>
          </Link>
        </div>
        <div>
          <Flex align="center">
            <h2>{roleName}</h2>
          </Flex>
        </div>
        <div className="role-menu">
          <Flex
            justify="flex-end"
          >
            <ProfileLink {...this.props} />
          </Flex>
        </div>
        {this.renderModal()}
      </Flex>
    );
  }

  renderModalContent() {
    const { modal } = this.state;
    const { onChangeLocation } = this.props;

    switch (modal) {
      case MODAL_NEW_COLLECTION:
        return (
          <CollectionCreate
            onClose={() => this.setState({ modal: null })}
            onSaved={collection => {
              this.setState({ modal: null });
              onChangeLocation(Urls.collection(collection));
            }}
          />
        );
      case MODAL_NEW_DASHBOARD:
        return (
          <CreateDashboardModal
            onClose={() => this.setState({ modal: null })}
          />
        );
      default:
        return null;
    }
  }

  renderModal() {
    const { modal } = this.state;

    if (modal) {
      return (
        <Modal onClose={() => this.setState({ modal: null })}>
          {this.renderModalContent()}
        </Modal>
      );
    } else {
      return null;
    }
  }

  render() {
    const { context, user } = this.props;

    if (!user) {
      return null;
    }

    switch (context) {
      case "admin":
        return this.renderAdminNav();
      case "auth":
        return null;
      case "none":
        return this.renderEmptyNav();
      case "setup":
        return null;
      default:
        return this.renderMainNav();
    }
  }
}
