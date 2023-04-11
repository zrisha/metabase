/* eslint-disable react/prop-types */
import React, { Component } from "react";
import PropTypes from "prop-types";

import { connect } from "react-redux";
import { push } from "react-router-redux";

import { t } from "ttag";
import { Flex, Box } from "grid-styled";

import * as Urls from "metabase/lib/urls";
import { color, darken } from "metabase/lib/colors";

import EntityMenu from "metabase/components/EntityMenu";
import Icon from "metabase/components/Icon";
import Tooltip from "metabase/components/Tooltip";
import Link from "metabase/components/Link";
import LogoIcon from "metabase/components/LogoIcon";
import Modal from "metabase/components/Modal";
import Radio from "metabase/components/Radio";

import ProfileLink from "metabase/nav/components/ProfileLink";

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

const ModeToggle = (props) => {
  const OPTIONS = [
    { name: "Learn", value: "learn" },
    { name: "Do", value: "do" },
  ];

  const value = props.location.pathname.includes("do") ? "do" : 
  props.location.pathname.includes("learn") ? "learn" : false;

  return (
    <Radio
      {...props}
      options={OPTIONS}
      value={value}
      onChange={props.onChange}
    />
  );
}

@Database.loadList({
  // set this to false to prevent a potential spinner on the main nav
  loadingAndErrorWrapper: false,
})
@connect(mapStateToProps, mapDispatchToProps)
export default class Navbar extends Component {
  state = {
    modal: null,
    mode: 0
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

  toggleMode = () => {
    const path = this.props.location.pathname.split("/");
    const ind = path.findIndex(elem => elem == "role")
    const role = path[ind + 1];
    if(this.props.location.pathname.includes("learn")){
      this.props.onChangeLocation(`/role/${role}/do`);
    }
    else if(this.props.location.pathname.includes("do")){
      this.props.onChangeLocation(`/role/${role}/learn`);
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
              to="/"
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
    const { hasDataAccess, hasNativeWrite, location } = this.props;

    const roleName = capitalize(location.pathname.split("/")[2]);


    return (
      <Flex
        // NOTE: DO NOT REMOVE `Nav` CLASS FOR NOW, USED BY MODALS, FULLSCREEN DASHBOARD, ETC
        // TODO: hide nav using state in redux instead?
        className="Nav relative bg-brand text-white z3 flex-no-shrink rr-block"
        align="center"
        style={{ backgroundColor: color("nav"), position: this.props.position }}
        py={1}
        pr={2}
      >
        <Flex style={{ minWidth: 64 }} align="center" justify="center">
          <Link
            to="/"
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
            >
              <LogoIcon dark height={32} />
            </Flex>
          </Link>
        </Flex>
        <Flex className="flex-full z1" pr={2} align="center">
          <Flex align="center" style={{ maxWidth: 500 }}>
            <ModeToggle location={this.props.location} variant="bubble" onChange={this.toggleMode}/>
            <Box px={1}>
            <Tooltip tooltip="This action is locked until reaching Level 3">
              <Icon name="lock"/>
            </Tooltip>
            </Box>
          </Flex>
        </Flex>
        <Flex className="flex-full z1" pr={2} align="center">
          <Flex align="center" style={{ maxWidth: 500 }}>
            <h2>{roleName}</h2>
          </Flex>
        </Flex>
        <Flex ml="auto" align="center" pl={[1, 2]} className="relative z2">
          <ProfileLink {...this.props} />
        </Flex>
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
