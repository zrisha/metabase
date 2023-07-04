;; Stores elements of stories for each group
(ns metabase.api.story-element
  (:require [compojure.core :refer [GET PUT POST]]
            [medley.core :as m]
            [metabase.api.common :as api]
            [metabase.api.user :as api.user]
            [metabase.models.story-element :as story-element :refer [StoryElement]]
            [toucan.db :as db]))

(api/defendpoint GET "/:group-id"
  "Grab all entries based on group ID"
  [group-id]
  (db/select [StoryElement :id :data :type] :group_id group-id))

;;; --------------------------------------------------- Favoriting ---------------------------------------------------

(api/defendpoint POST "/"
  "Add a story element"
  [:as {{:keys [data, type, group_id]} :body}]
  (db/insert! StoryElement :data data :type type :group_id group_id))


(api/defendpoint PUT "/:story-id"
  "Update a story element"
  [story-id :as {{:keys [data, type, group_id]} :body}]
  (api/write-check StoryElement story-id)
  (api/let-404 [id (db/select-one-id StoryElement :id story-id)]
                 (db/update! StoryElement id :data data))
  api/generic-204-no-content)

(api/defendpoint DELETE "/:story-id"
  "Remove a story element"
  [story-id]
  (api/read-check StoryElement story-id)
  (api/let-404 [id (db/select-one-id StoryElement :id story-id)]
    (db/delete! StoryElement, :id id))
  api/generic-204-no-content)

(api/define-routes)