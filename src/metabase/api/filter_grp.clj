;; Stores elements of stories for each group
(ns metabase.api.filter-grp
  (:require [compojure.core :refer [GET PUT POST DELETE]]
            [medley.core :as m]
            [metabase.api.common :as api]
            [metabase.api.user :as api.user]
            [metabase.models.dashboard :as dashboard :refer [Dashboard]]
            [metabase.models.filter-grp :as filter-grp :refer [FilterGrp]]
            [toucan.db :as db]))

(api/defendpoint GET "/group/:group-id/dashboard/:dashboard-id"
  "Grab all entries based on group ID"
  [group-id dashboard-id]
  (db/select [FilterGrp :id :filter] :group_id group-id :dashboard_id dashboard-id))

;;; --------------------------------------------------- Favoriting ---------------------------------------------------

(api/defendpoint POST "/group/:group-id/dashboard/:dashboard-id"
  "Save a filter"
  [dashboard-id group-id :as {{:keys [filter]} :body}]
  (api/read-check Dashboard dashboard-id)
  (db/insert! FilterGrp :filter filter :dashboard_id dashboard-id :group_id group-id))

(api/defendpoint DELETE "/:filter-id"
  "Remove a story element"
  [filter-id]
  (api/read-check FilterGrp filter-id)
  (api/let-404 [id (db/select-one-id FilterGrp :id filter-id)]
    (db/delete! FilterGrp, :id id))
  api/generic-204-no-content)

(api/define-routes)