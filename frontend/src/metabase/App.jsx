/* eslint-disable react/prop-types */
import React, { Component } from "react";
import { connect } from "react-redux";
import ScrollToTop from "metabase/hoc/ScrollToTop";
import Navbar from "metabase/nav/containers/Navbar";

import { IFRAMED, initializeIframeResizer } from "metabase/lib/dom";

import UndoListing from "metabase/containers/UndoListing";
import ErrorCard from "metabase/components/ErrorCard";
import Tour from "reactour";

import {
  Archived,
  NotFound,
  GenericError,
  Unauthorized,
} from "metabase/containers/ErrorPages";

const mapStateToProps = (state, props) => ({
  errorPage: state.app.errorPage,
  currentUser: state.currentUser,
});

const getErrorComponent = ({ status, data, context }) => {
  if (status === 403) {
    return <Unauthorized />;
  } else if (status === 404) {
    return <NotFound />;
  } else if (
    data &&
    data.error_code === "archived" &&
    context === "dashboard"
  ) {
    return <Archived entityName="dashboard" linkTo="/dashboards/archive" />;
  } else if (
    data &&
    data.error_code === "archived" &&
    context === "query-builder"
  ) {
    return <Archived entityName="question" linkTo="/questions/archive" />;
  } else {
    return <GenericError details={data && data.message} />;
  }
};

@connect(mapStateToProps)
export default class App extends Component {
  state = {
    errorInfo: undefined,
    isOpen: true,
  };

  constructor(props) {
    super(props);
    initializeIframeResizer();
    this.relativeDiv = React.createRef();
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
  }

  onRequestClose = () => {
    this.setState(() => ({ isOpen: false }));
  };

  render() {
    const { children, currentUser, location, errorPage } = this.props;
    const { errorInfo } = this.state;

    const steps = [
      {
        content: "Hello World!",
      },
      {
        content: "Hello You!",
        selector: 'a[href="/question/new"]',
      },
      {
        content: "Bye!",
      },
    ];

    return (
      <ScrollToTop>
        <div className="relative" ref={this.relativeDiv}>
          <Tour
            steps={steps}
            isOpen={this.state.isOpen}
            onRequestClose={this.onRequestClose}
          />
          {currentUser && !IFRAMED && <Navbar location={location} />}
          {errorPage ? getErrorComponent(errorPage) : children}
          <UndoListing />
        </div>
        <ErrorCard errorInfo={errorInfo} />
      </ScrollToTop>
    );
  }
}
