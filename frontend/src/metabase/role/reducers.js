import { handleActions, combineReducers } from "metabase/lib/redux";

import {
  RENDER_DRAWING_TOOL,
} from "./actions";

const DEFAULT_ARTIST = { drawingTool: false };
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

export default combineReducers({
  artist,
});
