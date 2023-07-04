import { GET, PUT, POST, DELETE } from "metabase/lib/api";

export const FavoriteApi = {
    favoriteGrp: POST("/api/card-favorite-grp/:cardId"),
    unfavoriteGrp: DELETE("/api/card-favorite-grp/:cardId"),
    getFavoritesGrp: GET("/api/card-favorite-grp/:groupId")
  };

export const RoleApi = {
  addRoleData: POST("/api/role"),
  updateRoleData: PUT("/api/role"),
  getRoleData: GET("/api/role/:roomID")
};

export const StoryApi = {
  addStoryElement: POST("/api/story-element"),
  updateStoryElement: PUT("/api/story-element/:storyId"),
  updateStoryElementPos: PUT("/api/story-element/:storyId"),
  getStoryElements: GET("/api/story-element/:groupId"),
  deleteStoryElement: DELETE("/api/story-element/:storyId")
}