import React, { Component } from "react";
import {connect} from "react-redux";
import { getUser } from "metabase/selectors/user"


class ArtistDoSidebar extends Component {


    render(){
        return <div className="flex flex-column" style={{width: "100%", height: "100%", justifyContent: "space-evenly", alignItems: "center"}}>
            <div style={{height: "50%", width: "90%", paddingBottom: "5%"}}>
                empty
            </div>
            <div style={{height: "50%", width: "90%"}}>
                empty
            </div>
        </div>
    }

}

const mapStateToProps = (state, props) => ({
    user: getUser(state)
  });
  
export default connect(mapStateToProps)(ArtistDoSidebar);
