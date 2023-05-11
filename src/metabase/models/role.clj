(ns metabase.models.role
  (:require [metabase.api.common :as api]
            [metabase.events :as events]
            [metabase.models.interface :as i]
            [metabase.util :as u]
            [toucan.db :as db]
            [toucan.models :as models]))


;;; ----------------------------------------------- Entity & Lifecycle -----------------------------------------------

(models/defmodel Role :role)

(defn- pre-insert [role]
  (let [defaults {:timestamp :%now}]
    (merge defaults role)))

(u/strict-extend (class Role)
  models/IModel
  (merge models/IModelDefaults
         {:types      (constantly {:data :json})
          :pre-insert pre-insert})
  i/IObjectPermissions
  (merge i/IObjectPermissionsDefaults
         {:can-read?  (constantly true)
          :can-write? (constantly true)
          :can-create? (constantly true)}))
