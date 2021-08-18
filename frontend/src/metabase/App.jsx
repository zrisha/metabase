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

    let steps_old = [
      {
        content: "Welcome to metabase",
      },
      {
        content: "Start by clicking on a dataset",
        selector: 'a[href="/browse/1-sample-dataset"]',
      },
      {
        content: "Pick a table to ask a question about",
        selector: 'a[data-metabase-event="Data Browse;Table Click"]',
      },
      {
        content: "First lets filter out less relevant data",
        selector: 'button[data-metabase-event="View Mode; Open Filter Widget"]',
      },
      {
        content: "Lets filter out orders based on their subtotal!",
        selector:
          '[data-testid="sidebar-right"] div div div div:nth-child(2) div:nth-child(6)',
      },
      {
        content: "Bye!",
      },
    ];

    // {
    //   content: "There are several ways to ask a question in Metabase, but we'll click on the Simple Question option for now.",
    // selector: 'a[href="/question#eyJkYXRhc2V0X3F1ZXJ5Ijp7ImRhdGFiYXNlIjpudWxsLCJxdWVyeSI6eyJzb3VyY2UtdGFibGUiOm51bGx9LCJ0eXBlIjoicXVlcnkifSwiZGlzcGxheSI6InRhYmxlIiwidmlzdWFsaXphdGlvbl9zZXR0aW5ncyI6e319"]',
    // },

    const steps = [
      {
        content: "Welcome to Metabase! Would you like to take a tour?",
      },
      {
        content:
          "Great! We will start by selecting a dataset to ask a question about",
      },
      {
        content:
          "Let's start by clicking the sample dataset provided by Metabase!",
        selector: 'a[href="/browse/1-sample-dataset"]',
      },
      {
        content:
          "The sample dataset contains fake data from a made up company. Take a look at the Orders data",
        selector: 'a[data-metabase-event="Data Browse;Table Click"]',
      },
      {
        content:
          "Let’s start with a simple question about these orders: how many orders have been placed with a subtotal (before tax) greater than $30?",
      },
      {
        content:
          "To find out, we want to filter the data by the field we’re interested in. Click the Filter button",
        selector: 'button[data-metabase-event="View Mode; Open Filter Widget"]',
      },
      {
        content:
          "The question we want to answer is: how many orders have been placed with a subtotal (before tax) greater than $30? Filter the data by subtotal",

        selector:
          '[data-testid="sidebar-right"] div div div div:nth-child(2) div:nth-child(6)',
      },
      {
        content:
          "The question we want to answer is: how many orders have been placed with a subtotal (before tax) greater than $30? Choose 'greater than'",
        selector: 'aside[data-testid="sidebar-right"]',
      },
      {
        content:
          "The question we want to answer is: how many orders have been placed with a subtotal (before tax) greater than $30? Enter the number 30 and press 'Add filter'",
        selector: 'aside[data-testid="sidebar-right"]',
      },
      {
        content: "Metabase will filter out the data that is greater than $30!",
      },
      {
        content:
          "To find out how many orders are greater than $30, we have to summarize the data",
        selector:
          'button[data-metabase-event="View Mode; Open Summary Widget"]',
      },
      {
        content: "Summarize by Count and press 'Done'",
        selector: 'aside[data-testid="sidebar-right"]',
      },
      {
        content:
          "Here's our answer! There are 17,971 orders with a subtotal greater than $30. Okay, so that’s pretty useful, but it would be even more useful if we could know in which months our customers placed these big orders. Let's summarize the data again!",
        selector:
          'button[data-metabase-event="View Mode; Open Summary Widget"]',
      },
      {
        content:
          "Which months did our customers place these orders? Select 'Created At' and press done",
        selector: 'aside[data-testid="sidebar-right"]',
      },
      {
        content:
          "Metabase immediately shows us a line chart visualization of the orders over time.",
        selector: ".Visualization",
      },
      {
        content:
          "Metabase can present the answers to your questions in a variety of ways. To change the visualization, just select one of the options from the Visualization tab",
        selector: ".dtAxiM .bDGKmj",
      },
      {
        content:
          "Metabase will allow you to choose a possible visualization based on the data",
        selector: 'aside[data-testid="sidebar-left"]',
      },
      {
        content:
          "Let's try viewing this data as a bar graph. Click bar graph and Done",
        selector: 'aside[data-testid="sidebar-left"]',
      },
      {
        content: "That's it, now you're ready to start using Metabase!",
        selector: ".Visualization",
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
