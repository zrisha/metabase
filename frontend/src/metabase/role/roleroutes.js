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
import JournalistDo from "./Journalist/JournalistDo.jsx";
import JournalistDoSidebar from "./Journalist/JournalistDoSidebar.jsx";
import RoleLayout from "./RoleLayout";
import RoleHome from "./RoleHome";
import TeamReflect from "./TeamReflect.jsx";
import TeamDoc from "./TeamDoc.jsx";
import TeamPlan from "./TeamPlan.jsx";


export default <>
      <Route path="home" component={RoleHome}>
        <Route path="plan" component={TeamPlan} />
        <Route path="reflect" component={TeamReflect} />
        <Route path="work" component={TeamDoc} />
      </Route>
      <Route component={RoleLayout}>
        <Route path="artist/do" components={{main: ArtistDo, sidebar: ArtistDoSidebar}} />
        <Route path="detective/do" components={{main: DetectiveDo, sidebar: DetectiveDoSidebar}} />
        <Route path="journalist/do" components={{main: JournalistDo, sidebar: JournalistDoSidebar}} />
        <Route path="errors">
          <Route path="404" component={NotFound} />
          <Route path="archived" component={Archived} />
          <Route path="unauthorized" component={Unauthorized} />
          <Route path="generic" component={GenericError} />
        </Route>
      </Route>
      </>