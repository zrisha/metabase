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