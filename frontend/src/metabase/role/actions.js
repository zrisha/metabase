/* eslint-disable react/prop-types */
import { createAction, createThunkAction } from "metabase/lib/redux";



// action constants

export const RENDER_DRAWING_TOOL = "metabase/role/RENDER_DRAWING_TOOL";
export const renderDrawingTool = createAction(RENDER_DRAWING_TOOL);

export const JOIN_ROOM = "metabase/role/JOIN_ROOM";
export const joinRoom= createAction(JOIN_ROOM);

export const LEAVE_ROOM = "metabase/role/LEAVE_ROOM";
export const leaveRoom= createAction(LEAVE_ROOM);

export const CHANGE_DRIVER = "metabase/role/CHANGE_DRIVER";
export const changeDriver= createAction(CHANGE_DRIVER);