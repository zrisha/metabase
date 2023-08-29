import React, { useCallback } from "react";
import PropTypes from "prop-types";
import User from "metabase/entities/users";
import { getUser } from "metabase/selectors/user";
import {connect} from "react-redux";
import Navbar from "./Navbar";

const propTypes = {
  user: PropTypes.object,
};

const UserProfileForm = ({ user, location }) => {
  const handleSaved = useCallback(
    () => {
        window.location.replace('/role/home');
    },
    [user],
  );

  return (
    <>
    <Navbar location={location}/>
    <div className="flex flex-column align-center justify-center py3">
      <h4>Please Enter Your First Name</h4>
      <div style={{maxWidth: "400px", width: "80%"}}>
        <User.Form
        user={user}
        form={User.forms.name}
        submitTitle={'Save'}
        onSaved={handleSaved}
        />
      </div>
    </div>
    </>
  )
};

UserProfileForm.propTypes = propTypes;

const mapStateToProps = (state, props) => ({
  user: getUser(state),
});

export default connect(mapStateToProps)(UserProfileForm);
