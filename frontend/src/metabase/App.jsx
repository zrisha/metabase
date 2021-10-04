/* eslint-disable react/prop-types */
import React, { Component } from "react";
import { connect } from "react-redux";
import ScrollToTop from "metabase/hoc/ScrollToTop";
import Navbar from "metabase/nav/containers/Navbar";
import Icon from "metabase/components/Icon";

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
        content: () => (
          <div>
            {" "}
            Welcome to Metabase! <span role="img"> 👋</span> Would you like to
            take a tour?
          </div>
        ),
      },
      {
        content: () => (
          <p>
            {" "}
            Great! <span role="img"> 👍</span> We will start by selecting a
            dataset to ask a question about{" "}
          </p>
        ),
      },
      {
        selector: 'a[href="/browse/1-sample-dataset"]',
        content: () => (
          <p>
            {" "}
            Lets start by clicking the sample dataset provided by Metabase!{" "}
          </p>
        ),
      },
      {
        selector: 'a[data-metabase-event="Data Browse;Table Click"]',
        content: () => (
          <p>
            {" "}
            The sample dataset contains fake data from a made up company. Take a
            look at the{" "}
            <span style={{ color: "#0F4277" }}>
              {" "}
              <b> Orders </b>{" "}
            </span>{" "}
            data <span role="img"> 🔍</span>{" "}
          </p>
        ),
      },
      {
        content: () => (
          <p>
            Lets start with a simple question about these orders: How many
            orders have been placed with a{" "}
            <span style={{ backgroundColor: "#F3F68A", font: "verdana" }}>
              {" "}
              subtotal (before tax) greater than $30?
            </span>{" "}
          </p>
        ),
      },
      {
        selector: 'button[data-metabase-event="View Mode; Open Filter Widget"]',
        content: () => (
          <p>
            To find out, we want to{" "}
            <span style={{ color: "#8662EC" }}>
              {" "}
              <b>filter</b>{" "}
            </span>{" "}
            the data by the field we’re interested in. Click the{" "}
            <span style={{ color: "#8662EC" }}>
              {" "}
              <b>Filter</b>{" "}
            </span>
            button
          </p>
        ),
      },
      {
        selector:
          '[data-testid="sidebar-right"] div div div div:nth-child(2) div:nth-child(6)',
        content: () => (
          <p>
            The question we want to answer is: how many orders have been placed
            with a subtotal (before tax) greater than $30?{" "}
            <span style={{ color: "#8662EC" }}>
              {" "}
              <b>Filter</b>{" "}
            </span>{" "}
            the data by{" "}
            <span style={{ color: "#8662EC" }}>
              {" "}
              <b>subtotal</b>{" "}
            </span>{" "}
          </p>
        ),
      },
      {
        selector: 'aside[data-testid="sidebar-right"]',
        content: () => (
          <p>
            The question we want to answer is: how many orders have been placed
            with a subtotal (before tax) greater than $30? Choose{" "}
            <span style={{ color: "#8662EC" }}>
              {" "}
              <b>greater than</b>{" "}
            </span>{" "}
          </p>
        ),
      },
      {
        selector: 'aside[data-testid="sidebar-right"]',
        content: () => (
          <p>
            The question we want to answer is: how many orders have been placed
            with a subtotal (before tax) greater than $30? Enter the number 30
            and press{" "}
            <span style={{ color: "#8662EC" }}>
              {" "}
              <b> Add Filter </b>{" "}
            </span>{" "}
          </p>
        ),
      },
      {
        selector: ".Visualization",
        content: () => (
          <p>
            {" "}
            Metabase will filter out the data that is greater than $30! 👏{" "}
          </p>
        ),
      },
      {
        selector:
          'button[data-metabase-event="View Mode; Open Summary Widget"]',
        content: () => (
          <p>
            To find out <u> how many </u> orders are greater than $30, we have
            to{" "}
            <span style={{ color: "#0A902B" }}>
              {" "}
              <b> summarize</b>{" "}
            </span>{" "}
            the data{" "}
          </p>
        ),
      },
      {
        selector: 'aside[data-testid="sidebar-right"]',
        content: () => (
          <p>
            <span style={{ color: "#0A902B" }}>
              {" "}
              <b>Summarize by Count </b>{" "}
            </span>{" "}
            and press{" "}
            <span style={{ color: "#0A902B" }}>
              <b> Done </b>{" "}
            </span>
          </p>
        ),
      },
      {
        selector: ".Visualization",
        content: () => (
          <p>
            Here is our answer! <span role="img"> 🎉</span>{" "}
            <span style={{ backgroundColor: "#F3F68A", font: "verdana" }}>
              There are 17,971 orders with a subtotal greater than $30.{" "}
            </span>{" "}
          </p>
        ),
      },
      {
        selector: ".Visualization",
        content: () => (
          <p>
            {" "}
            Okay, so thats pretty useful, but it would be even more useful if we
            could know in <u> which months </u> our customers placed these big
            orders. <span role="img"> 🤔</span>
          </p>
        ),
      },
      {
        selector:
          'button[data-metabase-event="View Mode; Open Summary Widget"]',
        content: () => (
          <p>
            Lets{" "}
            <span style={{ color: "#0A902B" }}>
              {" "}
              <b> summarize </b>{" "}
            </span>{" "}
            the data again!{" "}
          </p>
        ),
      },
      {
        selector: 'aside[data-testid="sidebar-right"]',
        content: () => (
          <p>
            Which months did our customers place these orders? Select{" "}
            <span style={{ color: "#0A902B" }}>
              {" "}
              <b> Created At </b>{" "}
            </span>{" "}
            and press{" "}
            <span style={{ color: "#0A902B" }}>
              {" "}
              <b>Done </b>{" "}
            </span>{" "}
          </p>
        ),
      },
      {
        selector: ".Visualization",
        content: () => (
          <p>
            Metabase immediately shows us a line chart{" "}
            <span style={{ color: "#8ABFF6" }}>
              {" "}
              <b> visualization </b>{" "}
            </span>{" "}
            <span style={{ color: "#8ABFF6" }}>
              {" "}
              <Icon name="line"> </Icon>{" "}
            </span>{" "}
            of the orders over time.{" "}
          </p>
        ),
      },
      {
        selector: ".dtAxiM .bDGKmj",
        content: () => (
          <p>
            Metabase can present the answers to your questions in a variety of
            ways. To change the{" "}
            <span style={{ color: "#8ABFF6" }}>
              {" "}
              <b>visualization, </b>{" "}
            </span>
            just select one of the options from the{" "}
            <span style={{ color: "#8ABFF6" }}>
              {" "}
              <b> Visualization </b>{" "}
            </span>{" "}
            tab{" "}
          </p>
        ),
      },
      {
        selector: 'aside[data-testid="sidebar-left"]',
        content: () => (
          <p>
            Metabase will allow you to choose a possible{" "}
            <span style={{ color: "#8ABFF6" }}>
              {" "}
              <b>visualization </b>{" "}
            </span>{" "}
            based on the data{" "}
          </p>
        ),
      },
      {
        selector: 'aside[data-testid="sidebar-left"]',
        content: () => (
          <p>
            Lets try viewing this data as a bar graph{" "}
            <span style={{ color: "#8ABFF6" }}>
              {" "}
              <Icon name="bar"> </Icon>{" "}
            </span>{" "}
            Click{" "}
            <span style={{ color: "#8ABFF6" }}>
              {" "}
              <b> bar graph </b>{" "}
            </span>{" "}
            and Done{" "}
          </p>
        ),
      },
      {
        selector: ".Visualization",
        content: () => (
          <p>
            Thats it, now youre ready to start using Metabase!{" "}
            <span role="img"> 😄 </span>{" "}
          </p>
        ),
      },
    ];

    console.log(location);
    console.log(this.props);

    return (
      <ScrollToTop>
        <div className="relative" ref={this.relativeDiv}>
          <Tour
            steps={steps}
            showNavigation={false}
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
