import React from "react";
import { Route, IndexRedirect } from "react-router";

import {
  Archived,
  GenericError,
  NotFound,
  Unauthorized,
} from "metabase/containers/ErrorPages";
import ArtistLearn from "./Artist/Learn";
import ArtistLearnSidebar from "./Artist/LearnSidebar";
import ArtistGallery from "./Artist/Gallery";
import ArtistDo from "./Artist/Do";
import ArtistDoSidebar from "./Artist/DoSidebar";
import RoleLayout from "./RoleLayout";

export default <>
      <Route component={RoleLayout}>
        <IndexRedirect to="artist/learn" />
        <Route path="artist/learn" components={{main: ArtistLearn, sidebar: ArtistLearnSidebar}} />
        <Route path="artist/learn/gallery" components={{main: ArtistGallery, sidebar: ArtistLearnSidebar}} />
        <Route path="artist/do" components={{main: ArtistDo, sidebar: ArtistDoSidebar}} />
        <Route path="errors">
          <Route path="404" component={NotFound} />
          <Route path="archived" component={Archived} />
          <Route path="unauthorized" component={Unauthorized} />
          <Route path="generic" component={GenericError} />
        </Route>
      </Route>
      </>