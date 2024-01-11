(ns metabase.models.user-activity
  (:require [metabase.api.common :as api]
            [metabase.events :as events]
            [metabase.models.interface :as i]
            [metabase.util :as u]
            [toucan.db :as db]
            [toucan.models :as models]))


;;; ----------------------------------------------- Entity & Lifecycle -----------------------------------------------

(models/defmodel UserActivity :user_activity)

(defn- pre-insert [user_activity]
  (let [defaults {:timestamp :%now}]
    (merge defaults user_activity)))

(u/strict-extend (class UserActivity)
  models/IModel
  (merge models/IModelDefaults
         {:types      (constantly {:activity :json})
          :pre-insert pre-insert})
  i/IObjectPermissions
  (merge i/IObjectPermissionsDefaults
         {:can-read?  (constantly true)
          :can-write? (constantly true)}))


;;; ------------------------------------------------------ Etc. ------------------------------------------------------

(def badge-actions 
  #{
    :SAVE_FILTER
    :ADD_NOTE
    :UPDATE_NOTE
    :FAVORITE_GRP
    :UNFAVORITE_GRP

    :ADD_ART
    :UPDATE_ART

    :ADD_STORY_ELEMENT 
    :UPDATE_STORY_ELEMENT 
    })

(defn process-badges!
  "extracts relevant logs to badges"
  [data]
  (filter (fn [row]
    (let [action (get-in row [:activity :action])]
      (contains? badge-actions (keyword action))))
    data))
