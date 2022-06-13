(ns metabase.api.user-queries
  (:require [compojure.core :refer [GET PUT]]
            [medley.core :as m]
            [metabase.api.common :as api]
            [metabase.api.user :as api.user]
            [metabase.models.user :as user :refer [User]]
            [metabase.models.user-queries :as user_queries :refer [UserQueries]]
            [toucan.db :as db]))

(api/defendpoint PUT "/"
  [:as {{:keys [query json_query]} :body}]
  (api.user/check-self-or-superuser api/*current-user-id*)
  (db/insert! UserQueries
          :query query
          :json_query json_query
          :user_id api/*current-user-id*))

  (api/define-routes)