import React, { useState } from "react";
import {connect} from "react-redux";
import { getUser } from "metabase/selectors/user"
import { Gallery } from "react-grid-gallery";
import Button from "metabase/core/components/Button";
import ButtonBar from "metabase/components/ButtonBar";
import Link from "metabase/components/Link";
import { Absolute } from "metabase/components/Position";

const imagetest = [
   {
      src: "/app/assets/role/female_leader.jpeg",
      width: 320,
      height: 174,
      caption: "",
      tags: [
        { value: "Gender", title: "Gender" }
     ],
   },
   {
      src: "/app/assets/role/field_of_commereation.jpeg",
      width: 320,
      height: 212,
      tags: [
         { value: "Flowers", title: "Flowers" },
         { value: "War", title: "War" },
      ],
      alt: "Boats (Jeshu John - designerspics.com)",
   },

   {
      src: "/app/assets/role/she_said_creative2.png",
      width: 320,
      height: 212,
   },
];



function ArtistGallery() {
    const [images, setImages] = useState(imagetest);
  
    const handleSelect = (index) => {
      const nextImages = images.map((image, i) =>
        i === index ? { ...image, isSelected: !image.isSelected } : image
      );
      setImages(nextImages);
    };
  
  
    return (
      <div style={{width: "100%", height: "100%", textAlign: "center", paddingTop: "5%"}}>
        <Gallery images={images} onSelect={handleSelect} />
        <ButtonBar
          style={{padding: "2% 5%"}}
        />
        <Absolute style={{bottom: "5%", right: "2%"}}>
          <Link to="/role/artist/learn">
            <Button primary>Done</Button>
          </Link>
        </Absolute>
      </div>
    );
  }

const mapStateToProps = (state, props) => ({
    user: getUser(state)
  });
  
export default connect(mapStateToProps)(ArtistGallery);
