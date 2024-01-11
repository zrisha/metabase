import { GET, PUT, POST, DELETE } from "metabase/lib/api";

export const FavoriteApi = {
    favoriteGrp: POST("/api/card-favorite-grp/:cardId"),
    unfavoriteGrp: DELETE("/api/card-favorite-grp/:cardId"),
    getFavoritesGrp: GET("/api/card-favorite-grp/:groupId"),
    addBlob: POST("/api/card-favorite-grp/blob/:cardId")
  };

export const FilterApi = {
  saveFilter: POST("/api/filter/group/:groupId/dashboard/:dashboardId"),
  deleteFilter: DELETE("/api/filter/:filterId"),
  getFilters: GET("/api/filter/group/:groupId/dashboard/:dashboardId")
};

export const NoteApi = {
  addNote: POST("/api/note"),
  updateNote: PUT("/api/note/:noteId"),
  getNotes: GET("/api/note/:groupId"),
  deleteNote: DELETE("/api/note/:noteId")
}

export const ArtApi = {
  addArt: POST("/api/art"),
  updateArt: PUT("/api/art/:artId"),
  getArts: GET("/api/art/:groupId"),
  deleteArt: DELETE("/api/art/:artId"),
  addBlob: POST("/api/art/blob/:artId"),
  updateBlob: PUT("/api/art/blob/:artId"),
}

export const StoryApi = {
  addStoryElement: POST("/api/story-element"),
  updateStoryElement: PUT("/api/story-element/:storyId"),
  updateStoryElementPos: PUT("/api/story-element/:storyId"),
  getStoryElements: GET("/api/story-element/:groupId"),
  deleteStoryElement: DELETE("/api/story-element/:storyId")
}

export const HomeApi = {
  getWorkDoc: GET("/api/doc/work/:groupId"),
  getPlanDoc: GET("/api/doc/plan/:groupId"),
  getRoleActivity: GET("/api/room-activity/:groupId"),
  getBadges: GET("/api/user-activity/badges/:groupId"),
}

