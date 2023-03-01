/* eslint-disable react/prop-types */
import { createAction, createThunkAction } from "metabase/lib/redux";



// action constants

export const RENDER_DRAWING_TOOL = "metabase/role/RENDER_DRAWING_TOOL";

export const renderDrawingTool = createAction(RENDER_DRAWING_TOOL);