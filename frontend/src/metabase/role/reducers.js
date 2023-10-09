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
  GET_NOTES,
  ADD_ART,
  UPDATE_ART,
  DELETE_ART,
  GET_ARTS,
  SELECT_ART,
  UPDATE_SAVE_STATUS,
  GET_DOC_ID
} from "./actions";

window.Metabase.data = {};

const DEFAULT_ARTIST = { drawingTool: false, arts: false, selectedArt: null, unsaved: false };
const DEFAULT_DETECTIVE = { savedFilters: [], notes: []};
const DEFAULT_JOURNALIST = { storyElements: {}, selectedElement: null};
const DEFAULT_ROOM = {artist: {}, detective: {}, journalist: {}};
const DEFAULT_FAVORITES = {cards: []};
const DEFAULT_HOME = {docId: null};


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
    [ADD_ART]: (state, { payload }) => ({...state, arts: [...state.arts, payload.newArt ], selectedArt: {id: payload.newArt.id}}),
    [DELETE_ART]: (state, { payload }) => ({...state, arts: state.arts.filter(art => art.id != payload.artId)}),
    [UPDATE_ART]: (state, { payload }) => ({...state, arts: state.arts.map(art => art.id == payload.id ? payload : art)}),
    [GET_ARTS]: (state, { payload }) => ({...state,  arts: payload.arts, selectedArt: payload.selectedArt ? payload.selectedArt : null}),
    [SELECT_ART]: (state, {payload}) => ({...state, selectedArt: payload.selectedArt}),
    [UPDATE_SAVE_STATUS]: (state, {payload}) => ({...state, unsaved: payload.unsaved}),

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
    [DELETE_NOTE]: (state, { payload }) => {
      if(!payload.noteId){
        return state
      }else{
        return {...state, notes: state.notes.filter(note => note.id != payload.noteId)}
      }
    },
    [UPDATE_NOTE]: (state, { payload }) => {
      if(!payload.id)
        return state
      else
        return {...state, notes: state.notes.map(note => note.id == payload.id ? payload : note)}
    },
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

const home = handleActions(
  {
    [GET_DOC_ID]: (state, { payload }) => ({...state, docId: payload.id}),
  },
  DEFAULT_HOME
);

export default combineReducers({
  artist,
  detective,
  journalist,
  room,
  favorites,
  home
});
