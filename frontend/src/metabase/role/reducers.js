import { handleActions, combineReducers } from "metabase/lib/redux";

import {
  CHANGE_DRIVER,
  JOIN_ROOM,
  LEAVE_ROOM,
  RENDER_DRAWING_TOOL,
} from "./actions";

const DEFAULT_ARTIST = { drawingTool: false };
const DEFAULT_ROOM = {artist: {}, detective: {}};

const artist = handleActions(
  {
    [RENDER_DRAWING_TOOL]: {
      next: () => ({
        drawingTool: window.drawingTool ? window.drawingTool : false
      }),
    },
  },
  DEFAULT_ARTIST,
);

const room = handleActions(
  {
    [JOIN_ROOM]: (state, { payload }) => ({...state, [payload.role]: payload.room}),
    [LEAVE_ROOM]: (state, { payload }) => ({...state, [payload.role]: payload.room}),
    [CHANGE_DRIVER]: (state, { payload }) => ({...state, [payload.role]: payload.room}),
  },
  DEFAULT_ROOM,
);

export default combineReducers({
  artist,
  room
});
