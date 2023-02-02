import React, { Component } from "react";
import {connect} from "react-redux";
import { getUser } from "metabase/selectors/user";



class ArtistDo extends Component {

    render(){
        return <div style={{width: "100%", height: "100%", textAlign: "center", paddingTop: "5%"}}>
            empty
        </div>
    }

}

const mapStateToProps = (state, props) => ({
    user: getUser(state)
  });
  
export default connect(mapStateToProps)(ArtistDo);
