;; arts for each group
(ns metabase.api.art
  (:require [compojure.core :refer [GET PUT POST]]
            [medley.core :as m]
            [metabase.api.common :as api]
            [metabase.api.user :as api.user]
            [metabase.models.art :as art :refer [Art]]
            [metabase.models.art-blob :as art-blob :refer [ArtBlob]]
            [toucan.db :as db]))

(api/defendpoint GET "/:group-id"
  "Grab all arts based on group ID"
  [group-id]
  (db/select Art :group_id group-id))

(api/defendpoint POST "/"
  "Add a art"
  [:as {{:keys [data, group_id]} :body}]
  (db/insert! Art :data data :group_id group_id))


(api/defendpoint PUT "/:art-id"
  "Update a art"
  [art-id :as {{:keys [data, group_id]} :body}]
  (api/write-check Art art-id)
  (api/let-404 [id (db/select-one-id Art :id art-id)]
                 (db/update! Art id :data data))
  (Art :id art-id))

(api/defendpoint DELETE "/:art-id"
  "Remove a art"
  [art-id]
  (api/read-check Art art-id)
  (api/let-404 [id (db/select-one-id Art :id art-id)]
    (db/delete! Art, :id id))
  api/generic-204-no-content)


;;; -------- Blob -----------

(api/defendpoint GET "/blob/:group-id"
  "Grab all arts based on group ID"
  [group-id]
  (db/query {:select [:art.id :group_id, :blob]
           :from   [:art]
           :left-join [:art_blob [:= :art.id :art_blob.id]]
           :where  [:= :group_id group-id]}))

(api/defendpoint POST "/blob/:art-id"
  "Add a blob for an art"
  [art-id :as {{:keys [blob]} :body}]
  (db/insert! ArtBlob :id art-id, :blob blob)
  (ArtBlob art-id))

(api/defendpoint PUT "/blob/:art-id"
  "Update an art blob"
  [art-id :as {{:keys [blob]} :body}]
  (api/write-check ArtBlob art-id)
  (api/let-404 [art (ArtBlob art-id)]
                 (db/update! ArtBlob art-id :blob blob))
  (ArtBlob art-id))

(api/defendpoint DELETE "/blob/:art-id"
  "Remove an art blob"
  [art-id]
  (api/read-check ArtBlob art-id)
  (api/let-404 [art (ArtBlob art-id)]
    (db/delete! ArtBlob, :id art-id))
  api/generic-204-no-content)

(api/define-routes)