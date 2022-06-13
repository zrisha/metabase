(ns metabase.models.page-views
  (:require [metabase.api.common :as api]
            [metabase.events :as events]
            [metabase.models.interface :as i]
            [metabase.util :as u]
            [toucan.db :as db]
            [toucan.models :as models]))


;;; ----------------------------------------------- Entity & Lifecycle -----------------------------------------------

(models/defmodel PageViews :page_views)

(defn- pre-insert [page_views]
  (let [defaults {:timestamp :%now}]
    (merge defaults page_views)))

(u/strict-extend (class PageViews)
  models/IModel
  (merge models/IModelDefaults
         {:pre-insert pre-insert})
  i/IObjectPermissions
  (merge i/IObjectPermissionsDefaults
         {:can-read?  (constantly true)
          :can-write? (constantly true)}))


;;; ------------------------------------------------------ Etc. ------------------------------------------------------

;; ## Persistence Functions

;; TODO - this is probably the exact wrong way to have written this functionality.
;; This could have been a multimethod or protocol, and various entity classes could implement it;
;; Furthermore, we could have just used *current-user-id* to get the responsible user, instead of leaving it open to
;; user error.

(defn record-page-views!
  "Inserts a new `PageViews` entry.

   Takes the following kwargs:
     :activity       Required.  details of the activity.
     :user-id        Required.  ID of the `User` responsible for the activity.  defaults to (events/object->user-id object)"
  {:style/indent 0}
  [& {:keys [url]}]
    (db/insert! PageViews
      :url    url
      ))
