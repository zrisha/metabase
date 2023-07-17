import { handleActions, combineReducers } from "metabase/lib/redux";

import {
  CHANGE_DRIVER,
  JOIN_ROOM,
  LEAVE_ROOM,
  RENDER_DRAWING_TOOL,
  GET_FAVORITES_GRP,
  FAVORITE_GRP,
  UNFAVORITE_GRP,
  GET_FILTERS,
  SAVE_FILTER,
  DELETE_FILTER,
  LOAD_FILTER,
  ADD_STORY_ELEMENT,
  SELECT_STORY_ELEMENT,
  GET_STORY_ELEMENTS,
  UPDATE_STORY_ELEMENT_POS,
  UPDATE_STORY_ELEMENT,
  DELETE_STORY_ELEMENT,
  ADD_NOTE,
  UPDATE_NOTE,
  DELETE_NOTE,
  GET_NOTES
} from "./actions";

const DEFAULT_ARTIST = { drawingTool: false };
const DEFAULT_DETECTIVE = { savedFilters: [], notes: []};
const DEFAULT_JOURNALIST = { storyElements: {}, selectedElement: null};
const DEFAULT_ROOM = {artist: {}, detective: {}, journalist: {}};
const DEFAULT_FAVORITES = {cards: []};


const favorites = handleActions(
  {
    [GET_FAVORITES_GRP]: (state, { payload }) => ({...state, cards: payload.favorites.map(x => x.card_id)}),
    [FAVORITE_GRP]: (state, { payload }) => ({...state, cards: [...state.cards, payload.cardId]}),
    [UNFAVORITE_GRP]: (state, { payload }) => ({...state, cards: state.cards.filter(item => item !== payload.cardId)})
  },
  DEFAULT_FAVORITES,
)

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

const detective = handleActions(
  {
    [GET_FILTERS]: (state, { payload }) => ({...state, savedFilters: payload.res, dashboardId: payload.dashboardId}),
    [SAVE_FILTER]: (state, { payload }) => ({...state, savedFilters: [...state.savedFilters, payload ]}),
    [DELETE_FILTER]: (state, { payload }) => ({...state, savedFilters: state.savedFilters.filter(entry => entry.id != payload.filterId)}),
    [LOAD_FILTER]: (state, { payload }) => ({...state, loadQuery: payload.loadQuery}),
    [ADD_NOTE]: (state, { payload }) => ({...state, notes: [...state.notes, payload ]}),
    [DELETE_NOTE]: (state, { payload }) => ({...state, notes: state.notes.filter(note => note.id != payload.noteId)}),
    [UPDATE_NOTE]: (state, { payload }) => ({...state, notes: state.notes.map(note => note.id == payload.id ? payload : note)}),
    [GET_NOTES]: (state, { payload }) => ({...state,  notes: payload.notes}),
  },
  DEFAULT_DETECTIVE,
);

const journalist = handleActions(
  {
    [ADD_STORY_ELEMENT]: (state, { payload }) => ({...state, storyElements: {...state.storyElements, [payload.id]: payload}, selectedElement: null}),
    [UPDATE_STORY_ELEMENT_POS]: (state, { payload }) => {
      const update = {...state.storyElements[payload.storyId], x: payload.x, y:payload.y};
      if(payload.status){
        return state
      }
      return ({...state, storyElements: {...state.storyElements, [payload.storyId]: update}})
    },
    [UPDATE_STORY_ELEMENT]: (state, { payload }) => {
      const update = {...state.storyElements[payload.storyId], ...payload.data};
      if(payload.status){
        return state
      }
      return ({...state, storyElements: {...state.storyElements, [payload.storyId]: update}})
    },
    [SELECT_STORY_ELEMENT]: (state, { payload }) => ({...state, selectedElement: payload.selectedElement}),
    [GET_STORY_ELEMENTS]: (state, { payload }) => ({...state, storyElements: payload.storyElements}),
    [DELETE_STORY_ELEMENT]: (state, { payload }) => {
      const { [payload.storyId]: value, ...update } = state.storyElements;
      return ({...state, storyElements: update, selectedElement: null})
    }
  },
  DEFAULT_JOURNALIST,
);

const room = handleActions(
  {
    [JOIN_ROOM]: (state, { payload }) => ({...state, [payload.role]: payload.room, group: payload.group}),
    [LEAVE_ROOM]: (state, { payload }) => ({...state, [payload.role]: payload.room, group: payload.group}),
    [CHANGE_DRIVER]: (state, { payload }) => ({...state, [payload.role]: payload.room, group: payload.group}),
  },
  DEFAULT_ROOM,
);

export default combineReducers({
  artist,
  detective,
  journalist,
  room,
  favorites,
});
