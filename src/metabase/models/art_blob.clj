(ns metabase.models.art-blob
  (:require [metabase.api.common :as api]
            [metabase.events :as events]
            [metabase.models.interface :as i]
            [metabase.util :as u]
            [toucan.db :as db]
            [toucan.models :as models]))


;;; ----------------------------------------------- Entity & Lifecycle -----------------------------------------------

(models/defmodel ArtBlob :art_blob)

(u/strict-extend (class ArtBlob)
                 models/IModel
                 (merge models/IModelDefaults
                        {:properties (constantly {:timestamped? true})})
                 i/IObjectPermissions
                 (merge i/IObjectPermissionsDefaults
                        {:can-read?  (constantly true)
                         :can-write? (constantly true)
                         :can-create? (constantly true)}))