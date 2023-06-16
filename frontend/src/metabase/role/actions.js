/* eslint-disable react/prop-types */
import { createAction } from "metabase/lib/redux";
import { FavoriteApi, RoleApi } from "./services";
import _ from "underscore";


// action constants

export const RENDER_DRAWING_TOOL = "metabase/role/RENDER_DRAWING_TOOL";
export const renderDrawingTool = createAction(RENDER_DRAWING_TOOL);

export const GET_ARTIST_DATA = "metabase/role/GET_ARTIST_DATA";

export const GET_DETECTIVE_DATA = "metabase/role/GET_DETECTIVE_DATA";
export const SAVE_DETECTIVE_DATA = "metabase/role/SAVE_DETECTIVE_DATA";
export const SAVE_FILTER = "metabase/role/SAVE_FILTER";
export const DELETE_FILTER = "metabase/role/DELETE_FILTER";
export const LOAD_FILTER = "metabase/role/LOAD_FILTER";
export const loadFilter= createAction(LOAD_FILTER);

export const ROLE_DATA_ERROR = "metabase/role/ROLE_DATA_ERROR";

export const JOIN_ROOM = "metabase/role/JOIN_ROOM";
export const joinRoom= createAction(JOIN_ROOM);

export const LEAVE_ROOM = "metabase/role/LEAVE_ROOM";
export const leaveRoom= createAction(LEAVE_ROOM);

export const CHANGE_DRIVER = "metabase/role/CHANGE_DRIVER";
export const changeDriver= createAction(CHANGE_DRIVER);

export const FAVORITE_GRP = `metabase/entities/questions/FAVORITE_GRP`;

export const UNFAVORITE_GRP = `metabase/entities/questions/UNFAVORITE_GRP`;

export const GET_FAVORITES_GRP = `metabase/entities/questions/GET_FAVORITES_GRP`;

export const getFavoritesGrp = createAction(
    GET_FAVORITES_GRP,
    async ({ groupId }) => {
      const favorites = await FavoriteApi.getFavoritesGrp({groupId});
      return { groupId, favorites };
    },
  );

export const favoriteGrp = createAction(
  FAVORITE_GRP,
  async ({ cardId, groupId }) => {
    const res = await FavoriteApi.favoriteGrp({cardId, group_id: groupId});
    return { cardId, res };
  },
);

export const unfavoriteGrp = createAction(
  UNFAVORITE_GRP,
  async ({ cardId, groupId }) => {
    const res = await FavoriteApi.unfavoriteGrp({cardId, group_id: groupId});
    return { cardId, res };
  },
);

export const getRoleData = ({roomID, role}) => {
  return async function(dispatch, getState) {
    const getResponse = await RoleApi.getRoleData({roomID, role});
    let payload = {}
    if(getResponse.status && getResponse.status == 202){
      try{
        const res = await RoleApi.addRoleData({id: roomID, role, data: {}});
          payload = {id: roomID, role, data: {}, res}
      }catch(error){
        payload = {error}
      }
    }else{
      payload = getResponse
    }
    switch(role){
      case 'artist':
        dispatch(createAction(GET_ARTIST_DATA)(payload));
      case 'detective':
        dispatch(createAction(GET_DETECTIVE_DATA)(payload));
      default:
        dispatch(createAction(ROLE_DATA_ERROR)(payload));
    }
  }
}


export const saveDetectiveData = createAction(
  SAVE_DETECTIVE_DATA,
  async ({ roomID, data }) => {
    try{
      const res = await RoleApi.updateRoleData({id: roomID, data});
      return {res}
    }catch(error){
      return {error}
    }
  },
);

export const saveFilter= ({newFilter, roomID}) => {
  return async function(dispatch, getState) {
    const {detective} = getState().role
    const data = {...detective}
    data.savedFilters = [...data.savedFilters, newFilter]
    try{
      const res = await RoleApi.updateRoleData({id: roomID, data});
      dispatch(createAction(SAVE_FILTER)({newFilter, res}));
    }catch(error){
      return {error}
    }
  }
}

export const deleteFilter= ({deletedFilter, roomID}) => {
  return async function(dispatch, getState) {
    const {detective} = getState().role;
    const savedFilters = detective.savedFilters.filter(filter => _.isEqual(filter, deletedFilter) == false)
    const data = {...detective, savedFilters};

    try{
      const res = await RoleApi.updateRoleData({id: roomID, data});
      dispatch(createAction(DELETE_FILTER)({savedFilters, res}));
    }catch(error){
      return {error}
    }
  }
}
