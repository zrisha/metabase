;; Stores data specific to one of the role interfaces
(ns metabase.api.card-favorite-grp
  (:require [compojure.core :refer [GET PUT POST]]
            [medley.core :as m]
            [metabase.api.common :as api]
            [metabase.api.user :as api.user]
            [metabase.models.card :as card :refer [Card]]
            [metabase.models.card-favorite-grp :as card-favorite-grp :refer [CardFavoriteGrp]]
            [toucan.db :as db]))

(api/defendpoint GET "/:group-id"
  "Grab entry based on room ID"
  [group-id]
  (db/select [CardFavoriteGrp :card_id] :group_id group-id))

;;; --------------------------------------------------- Favoriting ---------------------------------------------------

(api/defendpoint POST "/:card-id"
  "Favorite a Card."
  [card-id :as {{:keys [group_id]} :body}]
  (api/read-check Card card-id)
  (db/insert! CardFavoriteGrp :card_id card-id, :group_id group_id))


(api/defendpoint DELETE "/:card-id"
  "Unfavorite a Card."
  [card-id, group_id]
  (api/read-check Card card-id)
  (api/let-404 [id (db/select-one-id CardFavoriteGrp :card_id card-id, :group_id group_id)]
    (db/delete! CardFavoriteGrp, :id id))
  api/generic-204-no-content)

(api/define-routes)