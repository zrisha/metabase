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

;;; -------- Blob -----------

(api/defendpoint GET "/blob/:group-id"
  "Grab all card blobs based on group ID"
  [group-id]
  (db/query {:select [:cfav.card_id :cfav.group_id, :blob]
           :from   [[:report_cardfavorite_grp :cfav]]
           :left-join [[:report_cardblob :cblob] [:= :cfav.card_id :cblob.id]]
           :where  [:= :group_id group-id]}))

(api/defendpoint POST "/blob/:card-id"
  "Add a blob for a card"
  [card-id :as {{:keys [blob]} :body}]
  (db/insert! CardBlob :id card-id, :blob blob)
  {:card_id card-id})

(api/defendpoint PUT "/blob/:card-id"
  "Update a card blob"
  [card-id :as {{:keys [blob]} :body}]
  (api/write-check CardBlob card-id)
  (api/let-404 [card (CardBlob card-id)]
                 (db/update! CardBlob card-id :blob blob))
  {:card_id card-id})

(api/defendpoint DELETE "/blob/:card-id"
  "Remove an card blob"
  [card-id]
  (api/read-check CardBlob card-id)
  (api/let-404 [card (CardBlob card-id)]
    (db/delete! CardBlob, :id card-id))
  api/generic-204-no-content)

(api/define-routes)