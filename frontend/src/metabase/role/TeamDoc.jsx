import React, { useEffect, useMemo } from "react";
import {connect} from "react-redux";
import { getWorkDoc} from "./actions";

function TeamDoc(props) {
  useEffect(() => {
    const {groupId} = props;
    if (groupId) {
      props.getWorkDoc({ groupId });
    } else {
      props.getWorkDoc({ groupId: 1 });
    }
  }, [props.getWorkDoc]);

  return (
    <div className="flex justify-center my3 role-doc align-center">
      <div className="relative">
        <div className="blocker"></div>
        {props.workDoc && (
          <iframe
            className="bordered"
            src={`https://docs.google.com/document/d/${props.workDoc}/edit`}
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
  getWorkDoc,
  onChangeTab: tab => push(`/role/home/${tab}`),
}

const mapStateToProps = (state, props) => ({
  workDoc: state.role.home.workDoc,
  groupId: state.role.groupId 
});

export default connect(mapStateToProps, mapDispatchToProps)(TeamDoc);
