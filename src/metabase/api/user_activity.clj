(ns metabase.api.user-activity
  (:require [compojure.core :refer [GET PUT]]
            [medley.core :as m]
            [metabase.api.common :as api]
            [metabase.api.user :as api.user]
            [metabase.models.user :as user :refer [User]]
            [metabase.models.user-activity :as user_activity :refer [UserActivity]]
            [toucan.db :as db]))

(api/defendpoint PUT "/"
  [:as {:keys [body, cookies]}]
  (api.user/check-self-or-superuser api/*current-user-id*)
  (db/insert! UserActivity
          :activity (:activity body)
          :session_id (get-in cookies ["metabase.SESSION" :value])
          :user_id api/*current-user-id*))

  (api/define-routes)