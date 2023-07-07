(ns metabase.models.filter-grp
  (:require [metabase.api.common :as api]
            [metabase.events :as events]
            [metabase.models.interface :as i]
            [metabase.util :as u]
            [toucan.db :as db]
            [toucan.models :as models]))


;;; ----------------------------------------------- Entity & Lifecycle -----------------------------------------------

(models/defmodel FilterGrp :filter_grp)

(u/strict-extend (class FilterGrp)
                 models/IModel
                 (merge models/IModelDefaults
                        {:types      (constantly {:filter :json})
                         :properties (constantly {:timestamped? true})})
                 i/IObjectPermissions
                 (merge i/IObjectPermissionsDefaults
                        {:can-read?  (constantly true)
                         :can-write? (constantly true)
                         :can-create? (constantly true)}))
