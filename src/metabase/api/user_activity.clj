(ns metabase.api.user-activity
  (:require [compojure.core :refer [GET PUT]]
            [medley.core :as m]
            [java-time :as t]
            [metabase.api.common :as api]
            [metabase.api.user :as api.user]
            [metabase.models.user :as user :refer [User]]
            [metabase.models.permissions-group-membership :refer [PermissionsGroupMembership]]
            [metabase.models.user-activity :as user_activity :refer [UserActivity]]
            [toucan.db :as db]))

(api/defendpoint PUT "/"
  [:as {:keys [body, cookies]}]
  (api.user/check-self-or-superuser api/*current-user-id*)
  (db/insert! UserActivity
          :activity (:activity body)
          :session_id (get-in cookies ["metabase.SESSION" :value])
          :user_id api/*current-user-id*))


(api/defendpoint GET "/badges/:group-id"
  "Grab all entries based on group ID"
  [group-id]
  (let [users (map :user_id (db/select [PermissionsGroupMembership :user_id] :group_id group-id))]
    (let [logs (db/select UserActivity 
            :user_id [:in (set users)] 
            :timestamp [:> (.atStartOfDay (t/local-date))])]
        (map :activity (user_activity/process-badges! logs)))))

  (api/define-routes)