import React, { useEffect, useMemo } from "react";
import {connect} from "react-redux";
import { getPlanDoc} from "./actions";
import { getUser } from "metabase/selectors/user";

function TeamPlan(props) {
  useEffect(() => {
    const {groupId} = props;
    
    if (groupId) {
      props.getPlanDoc({ groupId });
    }
  }, [props.groupId]);

  return (
    <div className="flex justify-center my3 role-doc align-center">
      <div className="relative">
        <div className="blocker"></div>
        {props.planDoc && (
          <iframe
            className="bordered"
            src={`https://docs.google.com/document/d/${props.planDoc}/edit`}
            frameborder="0"
            width="90%"
            height="700"
            allowFullScreen="true"
            mozallowfullscreen="true"
            webkitallowfullscreen="true"
          ></iframe>
        )}
      </div>
    </div>
  );
}

const mapDispatchToProps = {
  getPlanDoc,
  onChangeTab: tab => push(`/role/home/${tab}`),
}

const mapStateToProps = (state, props) => ({
  planDoc: state.role.home.planDoc,
  user: getUser(state),
  groupId: state.role.groupId 
});

export default connect(mapStateToProps, mapDispatchToProps)(TeamPlan);
