import React from "react";
import {connect} from "react-redux";
import { getUser } from "metabase/selectors/user"
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import Button from "metabase/core/components/Button";
import ButtonBar from "metabase/components/ButtonBar";
import Link from "metabase/components/Link";
import "./LearnSidebar.css";
import SidebarLayout from "../SidebarLayout";


const Top = (props) => {
    return <>
        <ButtonBar
            className="gallery-btn-bar"
            right={<Link to="/role/artist/learn/gallery"><Button round icon="add"/></Link>}
            center={<h3>Saved Visualizations</h3>}
        />
        <Carousel 
            autoPlay={true}
            dynamicHeight={true}
            infiniteLoop={true}
            showThumbs={false}
            interval={15000}
            showStatus={false}
            >
            <div className="carousel-img">
                <img src="/app/assets/role/female_leader.jpeg" />
            </div>
            <div className="carousel-img">
                <img src="/app/assets/role/field_of_commereation.jpeg" />
            </div>
            <div className="carousel-img">
                <img src="/app/assets/role/she_said_creative2.png" />
            </div>
        </Carousel>
        </>
}

const Bottom = (props) => {
    return <>
    <div className="role-model-row">
        <div className="role-model" >
            <img src="/app/assets/role/Lupi.png"/>
            <p style={{textAlign: 'center'}}>Giorgia Lupi</p>
        </div>
        <div className="role-model" >
            <img src="/app/assets/role/du_bois.jpg"/>
            <p style={{textAlign: 'center'}}>W. E. B. Du Bois</p>
        </div>
    </div>
    <div className="role-model-row">
        <div className="role-model">
            <img src="/app/assets/role/wu.jpeg" />
            <p style={{textAlign: 'center'}}>Shirley Wu</p>
        </div>
        <div className="role-model">
            <img src="/app/assets/role/fragapane.png" />
            <p style={{textAlign: 'center'}}>Federica Fragapane</p>
        </div>
    </div>
    </>
}

const ArtistLearnSidebar = (props) => {
    return <>
    <SidebarLayout top={<Top/>} bottom = {<Bottom />}/>
    </>
}

const mapStateToProps = (state, props) => ({
    user: getUser(state)
  });
  
export default connect(mapStateToProps)(ArtistLearnSidebar);
