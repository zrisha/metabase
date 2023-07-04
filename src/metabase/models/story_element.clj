(ns metabase.models.story-element
  (:require [metabase.api.common :as api]
            [metabase.events :as events]
            [metabase.models.interface :as i]
            [metabase.util :as u]
            [toucan.db :as db]
            [toucan.models :as models]))


;;; ----------------------------------------------- Entity & Lifecycle -----------------------------------------------

(models/defmodel StoryElement :story_element)

(u/strict-extend (class StoryElement)
                 models/IModel
                 (merge models/IModelDefaults
                        {:types      (constantly {:data :json})
                         :properties (constantly {:timestamped? true})})
                 i/IObjectPermissions
                 (merge i/IObjectPermissionsDefaults
                        {:can-read?  (constantly true)
                         :can-write? (constantly true)
                         :can-create? (constantly true)}))