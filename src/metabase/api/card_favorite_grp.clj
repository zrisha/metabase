;; Stores data specific to one of the role interfaces
(ns metabase.api.card-favorite-grp
  (:require [compojure.core :refer [GET PUT POST]]
            [medley.core :as m]
            [metabase.api.common :as api]
            [metabase.api.user :as api.user]
            [metabase.models.card :as card :refer [Card]]
            [metabase.models.card-favorite-grp :as card-favorite-grp :refer [CardFavoriteGrp]]
            [metabase.models.card-blob :as card-blob :refer [CardBlob]]
            [toucan.db :as db]))

(api/defendpoint GET "/:group-id"
  "Grab entry based on room ID"
  [group-id]
  (db/select CardFavoriteGrp :group_id group-id))

;;; --------------------------------------------------- Favoriting ---------------------------------------------------

(api/defendpoint POST "/:card-id"
  "Favorite a Card."
  [card-id :as {{:keys [group_id, hash, data]} :body}]
  (api/read-check Card card-id)
  (db/insert! CardFavoriteGrp :card_id card-id, :group_id group_id :hash hash :data data))


(api/defendpoint DELETE "/:favorite-id"
  "Unfavorite a Card."
  [favorite-id]
  (api/let-404 [id (db/select-one-id CardFavoriteGrp :id favorite-id)]
    (db/delete! CardFavoriteGrp, :id id))
  api/generic-204-no-content)

;;; -------- Blob -----------

(api/defendpoint GET "/blob/:group-id"
  "Grab all card blobs based on group ID"
  [group-id]
  (db/query {:select [:cfav.id :cfav.group_id :data :blob]
           :from   [[:report_cardfavorite_grp :cfav]]
           :left-join [[:report_cardblob :cblob] [:= :cfav.id :cblob.id]]
           :where  [:= :group_id group-id]}))

(api/defendpoint POST "/blob/:favorite-id"
  "Add a blob for a card"
  [favorite-id :as {{:keys [blob]} :body}]
  (db/insert! CardBlob :id favorite-id, :blob blob)
  {:favorite_id favorite-id})

(api/defendpoint PUT "/blob/:favorite-id"
  "Update a card blob"
  [favorite-id :as {{:keys [blob]} :body}]
  (api/write-check CardBlob favorite-id)
  (api/let-404 [card (CardBlob favorite-id)]
                 (db/update! CardBlob favorite-id :blob blob))
  {:card_id favorite-id})

(api/defendpoint DELETE "/blob/:favorite-id"
  "Remove an card blob"
  [favorite-id]
  (api/read-check CardBlob favorite-id)
  (api/let-404 [card (CardBlob favorite-id)]
    (db/delete! CardBlob, :id favorite-id))
  api/generic-204-no-content)

(api/define-routes)