import React, { Component } from "react";
import {connect} from "react-redux";
import { getUser } from "metabase/selectors/user"


class ArtistLearn extends Component {

    render(){
        return <div style={{width: "100%", height: "100%", textAlign: "center", paddingTop: "5%"}}>
            <iframe width="80%" height="80%" src="https://www.youtube.com/embed/videoseries?list=PLJicmE8fK0EgI__8e2HP-EZDJuvIF3RsT" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
        </div>
    }

}

const mapStateToProps = (state, props) => ({
    user: getUser(state)
  });
  
export default connect(mapStateToProps)(ArtistLearn);
