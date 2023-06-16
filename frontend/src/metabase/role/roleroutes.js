import React from "react";
import { Route } from "react-router";

import {
  Archived,
  GenericError,
  NotFound,
  Unauthorized,
} from "metabase/containers/ErrorPages";
import ArtistDo from "./Artist/ArtistDo.jsx";
import ArtistDoSidebar from "./Artist/ArtistDoSidebar";
import DetectiveDo from "./Detective/DetectiveDo";
import DetectiveDoSidebar from "./Detective/DetectiveDoSidebar";
import RoleLayout from "./RoleLayout";

export default <>
      <Route component={RoleLayout}>
        <Route path="artist/do" components={{main: ArtistDo, sidebar: ArtistDoSidebar}} />
        <Route path="detective/do" components={{main: DetectiveDo, sidebar: DetectiveDoSidebar}} />
        <Route path="errors">
          <Route path="404" component={NotFound} />
          <Route path="archived" component={Archived} />
          <Route path="unauthorized" component={Unauthorized} />
          <Route path="generic" component={GenericError} />
        </Route>
      </Route>
      </>