/* eslint-disable react/prop-types */
import { createAction } from "metabase/lib/redux";
import { FavoriteApi, FilterApi, RoleApi, StoryApi, NoteApi, ArtApi, HomeApi } from "./services";
import _ from "underscore";
import { createThunkAction } from "metabase/lib/redux";
import { toPng } from 'html-to-image';


// action constants

/* Artist */
export const RENDER_DRAWING_TOOL = "metabase/role/RENDER_DRAWING_TOOL";
export const renderDrawingTool = createAction(RENDER_DRAWING_TOOL);
export const GET_ARTIST_DATA = "metabase/role/GET_ARTIST_DATA";
export const SELECT_ART = "metabase/role/SELECT_ART";
export const selectArt = createAction(SELECT_ART);
export const UPDATE_SAVE_STATUS = "metabase/role/UPDATE_SAVE_STATUS";
export const setSaveStatus = createAction(UPDATE_SAVE_STATUS);
export const ADD_ART = "metabase/role/ADD_ART";
export const GET_ARTS = "metabase/role/GET_ARTS";
export const UPDATE_ART = "metabase/role/UPDATE_ART";
export const DELETE_ART = "metabase/role/DELETE_ART";
export const ADD_ART_BLOB = "metabase/role/ADD_ART_BLOB";
export const UPDATE_ART_BLOB = "metabase/role/UPDATE_ART_BLOB";
export const ADD_VIZ_BLOB = "metabase/role/ADD_ART_BLOB";

/* Detective */
export const GET_DETECTIVE_DATA = "metabase/role/GET_DETECTIVE_DATA";
export const SAVE_DETECTIVE_DATA = "metabase/role/SAVE_DETECTIVE_DATA";
export const GET_FILTERS = "metabase/role/GET_FILTERS";
export const SAVE_FILTER = "metabase/role/SAVE_FILTER";
export const DELETE_FILTER = "metabase/role/DELETE_FILTER";
export const LOAD_FILTER = "metabase/role/LOAD_FILTER";
export const loadFilter= createAction(LOAD_FILTER);
export const FAVORITE_GRP = `metabase/entities/questions/FAVORITE_GRP`;
export const UNFAVORITE_GRP = `metabase/entities/questions/UNFAVORITE_GRP`;
export const GET_FAVORITES_GRP = `metabase/entities/questions/GET_FAVORITES_GRP`;
export const ADD_NOTE = "metabase/role/ADD_NOTE";
export const GET_NOTES = "metabase/role/GET_NOTES";
export const UPDATE_NOTE = "metabase/role/UPDATE_NOTE";
export const DELETE_NOTE = "metabase/role/DELETE_NOTE";

/* Journalist */
export const ADD_STORY_ELEMENT = "metabase/role/ADD_STORY_ELEMENT";
export const SELECT_STORY_ELEMENT = "metabase/role/SELECT_STORY_ELEMENT";
export const selectStoryElement= createAction(SELECT_STORY_ELEMENT);
export const GET_STORY_ELEMENTS = "metabase/role/GET_STORY_ELEMENTS";
export const UPDATE_STORY_ELEMENT = "metabase/role/UPDATE_STORY_ELEMENT";
export const UPDATE_STORY_ELEMENT_POS = "metabase/role/UPDATE_STORY_ELEMENT_POS";
export const DELETE_STORY_ELEMENT = "metabase/role/DELETE_STORY_ELEMENT";

/* Home */

export const GET_DOC_ID = "metabase/role/GET_DOC_ID";

/* RRWeb */
export const JOIN_ROOM = "metabase/role/JOIN_ROOM";
export const joinRoom= createAction(JOIN_ROOM);
export const LEAVE_ROOM = "metabase/role/LEAVE_ROOM";
export const leaveRoom= createAction(LEAVE_ROOM);
export const CHANGE_DRIVER = "metabase/role/CHANGE_DRIVER";
export const changeDriver= createAction(CHANGE_DRIVER);

/* Misc */
export const ROLE_DATA_ERROR = "metabase/role/ROLE_DATA_ERROR";

var checkGroup = function(fn){
  return function(){
    if(arguments[0].groupId && arguments[0].groupId == 1){
      return arguments[0]
    }else {
      return fn.apply(this, arguments);
    }
  };
};

/* Detective */

export const getFavoritesGrp = createAction(
    GET_FAVORITES_GRP,
    async ({ groupId }) => {
      const favorites = await FavoriteApi.getFavoritesGrp({groupId});
      return { groupId, favorites };
    },
  );

export const favoriteGrp = createThunkAction(
  FAVORITE_GRP,
  checkGroup(({ cardId, groupId, vizNode }) => async (dispatch, getState) => {
    try{
      const res = await FavoriteApi.favoriteGrp({cardId, group_id: groupId});
      dispatch(addVizBlob({cardId, vizNode}));
      return { cardId, res }; 
    }catch(error){
      console.log(error);
      return {error}
    }
  }),
);

export const unfavoriteGrp = createAction(
  UNFAVORITE_GRP,
  checkGroup(async ({ cardId, groupId }) => {
    const res = await FavoriteApi.unfavoriteGrp({cardId, group_id: groupId});
    return { cardId, res };
  }),
);

export const addVizBlob = createAction(
  ADD_VIZ_BLOB,
  checkGroup(async ({cardId, vizNode}) => {
    try{
      const blob = await toPng(vizNode);
      const res = await FavoriteApi.addBlob({cardId, blob})
      return {cardId}
    }catch(error){
      console.log(error);
      return {error}
    }
  })
);

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

export const getFilters = createAction(
  GET_FILTERS,
  async ({ groupId, dashboardId }) => {
    try{
      const res = await FilterApi.getFilters({groupId, dashboardId});
      return {res}
    }catch(error){
      return {error}
    }
  },
);

export const saveFilter = createAction(
  SAVE_FILTER,
  checkGroup(async ({ groupId, filter, dashboardId }) => {
    try{
      const res = await FilterApi.saveFilter({groupId, filter, dashboardId});
      return {filter: res.filter, id: res.id}
    }catch(error){
      return {error}
    }
  }),
);

export const deleteFilter = createAction(
  DELETE_FILTER,
  checkGroup(async ({ filterId, groupId}) => {
    try{
      const res = await FilterApi.deleteFilter({filterId});
      return {filterId}
    }catch(error){
      return {error}
    }
  }),
);

/* Note */

export const addNote = createAction(
  ADD_NOTE,
  checkGroup(async ({data, groupId}) => {
    try{
      const res = await NoteApi.addNote({data: data, group_id: groupId});
      return {data, id: res.id}
    }catch(error){
      console.log(error);
      return {error}
    }
  })
);

export const updateNote = createAction(
  UPDATE_NOTE,
  checkGroup(async ({noteId, data}) => {
    if(noteId){
      try{
        const res = await NoteApi.updateNote({noteId, data});
        return {data, id: noteId}
      }catch(error){
        console.log(error);
        return {error}
      }
    } else {
      return {error: "no note  id"};
    }
  })
)

export const deleteNote = createAction(
  DELETE_NOTE,
  checkGroup(async ({noteId, groupId}) => {
    if(noteId){
      const res = await NoteApi.deleteNote({noteId});
      return {noteId}
    } else {
      return {error: "no note id"};
    }
  })
)

export const getNotes = createAction(
  GET_NOTES,
  async ({ groupId }) => {
    if(groupId){
      try{
        const res = await NoteApi.getNotes({groupId});
        return { notes: res };
      }catch(error){
        console.log(error);
        return {error}
      }
    }else{
      return { error: "no group id"};
    }
  },
);


/* Art */

export const addArt = createThunkAction(
  ADD_ART,
  checkGroup(({data, groupId}) => async (dispatch, getState) => {
    try{
      const res = await ArtApi.addArt({data, group_id: groupId});
      dispatch(addArtBlob({artId: res.id}))
      return {newArt: {...res, data: JSON.stringify(res.data)}}
    }catch(error){
      console.log(error);
      return {error}
    }
  })
);

export const updateArt = createThunkAction(
  UPDATE_ART,
  checkGroup(({artId, data, blob, groupId}) => async (dispatch, getState) => {
    if(artId){
      try{
        const res = await ArtApi.updateArt({artId, data});
        dispatch(updateArtBlob({artId, blob}));
        return {...res, data: JSON.stringify(res.data)} 
      }catch(error){
        console.log(error);
        return {error}
      }
    } else {
      return {error: "no art  id"};
    }
  })
)

export const deleteArt = createAction(
  DELETE_ART,
  checkGroup(async ({artId}) => {
    if(artId){
      const res = await ArtApi.deleteArt({artId});
      return {artId}
    } else {
      return {error: "no art id"};
    }
  })
)


export const getArts = createAction(
  GET_ARTS,
  async ({ groupId, updateCurrent }) => {
    if(groupId){
      try{
        const res = await ArtApi.getArts({groupId});
        const arts = res.map(x => ({...x, data: JSON.stringify(x.data)}));
        if(arts.length ==0){
          return {arts}
        }
        const latestArt = arts.reduce((a, b) => {
          return new Date(a.updated_at) > new Date(b.updated_at) ? a : b;
        });

        const payload = { arts, latestArt }
        if(updateCurrent){
          payload.selectedArt = {id: latestArt.id}
        }
        return payload;
      }catch(error){
        console.log(error);
        return {error}
      }
    }else{
      return { error: "no group id"};
    }
  },
);

export const addArtBlob = createAction(
  ADD_ART_BLOB,
  checkGroup(async ({artId}) => {
    try{
      const res = await ArtApi.addBlob({artId, blob: ''})
      return {artId}
    }catch(error){
      console.log(error);
      return {error}
    }
  })
);

export const updateArtBlob = createAction(
  UPDATE_ART_BLOB,
  checkGroup(async ({artId, blob}) => {
    try{
      const res = await ArtApi.updateBlob({artId, blob})
      return {artId}
    }catch(error){
      console.log(error);
      return {error}
    }
  })
);

/* Misc */

export const getRoleData = ({roomID, role, dashboardId = false}) => {
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
      payload = {data: getResponse.data, dashboardId}
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

/* Journalist */

export const addStoryElement= checkGroup(({data, type, groupId}) => {
  return async function(dispatch, getState) {
    try{
      const res = await StoryApi.addStoryElement({data: data, type, group_id: groupId});
      dispatch(createAction(ADD_STORY_ELEMENT)({...data, type, id: res.id}));
    }catch(error){
      console.log(error);
      return {error}
    }
  }
})

export const updateStoryElementPos = createAction(
  UPDATE_STORY_ELEMENT_POS,
  checkGroup(async ({storyId, data, groupId}) => {
    if(storyId){
      const res = await StoryApi.updateStoryElementPos({storyId, data});
      return {storyId, x:data.x, y:data.y}
    } else {
      return {error: "no story element id"};
    }
  })
)

export const updateStoryElement = createAction(
  UPDATE_STORY_ELEMENT,
  checkGroup(async ({storyId, data, groupId}) => {
    if(storyId){
      const res = await StoryApi.updateStoryElement({storyId, data});
      return {storyId, data}
    } else {
      return {error: "no story element id"};
    }
  })
)

export const deleteStoryElement = createAction(
  DELETE_STORY_ELEMENT,
  checkGroup(async ({storyId, data, groupId}) => {
    if(storyId){
      const res = await StoryApi.deleteStoryElement({storyId});
      return {storyId}
    } else {
      return {error: "no story element id"};
    }
  })
)

export const getStoryElements = createAction(
  GET_STORY_ELEMENTS,
  async ({ groupId }) => {
    if(groupId){
      const res = await StoryApi.getStoryElements({groupId});
      const storyElements = formatStoryElement(res);
      return { storyElements };
    }else{
      return { error: "no group id"};
    }
  },
);

const formatStoryElement = (res) => {
  const storyElements = {}
  for(let ele of res){
    if(ele.id){
      storyElements[ele.id] = {...ele.data, type: ele.type}
    }
  }
  return storyElements
}

/* Home */

export const getDocId = createAction(
  GET_DOC_ID,
  async ({groupId}) => {
    try{
      const res = await HomeApi.getDocId({groupId})
      return JSON.parse(res.out);
    }catch(error){
      console.log(error);
      return {error}
    }
  }
);

