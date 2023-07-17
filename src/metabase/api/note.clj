;; Notes for each group
(ns metabase.api.note
  (:require [compojure.core :refer [GET PUT POST]]
            [medley.core :as m]
            [metabase.api.common :as api]
            [metabase.api.user :as api.user]
            [metabase.models.note :as note :refer [Note]]
            [toucan.db :as db]))

(api/defendpoint GET "/:group-id"
  "Grab all notes based on group ID"
  [group-id]
  (db/select [Note :id :data ] :group_id group-id))

;;; --------------------------------------------------- Favoriting ---------------------------------------------------

(api/defendpoint POST "/"
  "Add a note"
  [:as {{:keys [data, group_id]} :body}]
  (db/insert! Note :data data :group_id group_id))


(api/defendpoint PUT "/:note-id"
  "Update a note"
  [note-id :as {{:keys [data, group_id]} :body}]
  (api/write-check Note note-id)
  (api/let-404 [id (db/select-one-id Note :id note-id)]
                 (db/update! Note id :data data))
  {:status :success})

(api/defendpoint DELETE "/:note-id"
  "Remove a note"
  [note-id]
  (api/read-check Note note-id)
  (api/let-404 [id (db/select-one-id Note :id note-id)]
    (db/delete! Note, :id id))
  api/generic-204-no-content)

(api/define-routes)