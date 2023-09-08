;; arts for each group
(ns metabase.api.art
  (:require [compojure.core :refer [GET PUT POST]]
            [medley.core :as m]
            [metabase.api.common :as api]
            [metabase.api.user :as api.user]
            [metabase.models.art :as art :refer [Art]]
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

(api/define-routes)