(ns metabase.api.page-views
  (:require [compojure.core :refer [GET PUT]]
            [medley.core :as m]
            [metabase.api.common :as api]
            [metabase.api.user :as api.user]
            [metabase.models.user :as user :refer [User]]
            [metabase.models.page-views :as page_views :refer [PageViews]]
            [toucan.db :as db]))

(api/defendpoint PUT "/"
  [:as {{:keys [url]} :body}]
  (api.user/check-self-or-superuser api/*current-user-id*)
  (db/insert! PageViews
          :url url
          :user_id api/*current-user-id*))

  (api/define-routes)