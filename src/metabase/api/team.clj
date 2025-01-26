(ns metabase.api.team
  "/api/team endpoints."
  (:require [clojure.spec.alpha :as spec]
            [compojure.core :refer [DELETE GET POST PUT]]
            [honeysql.helpers :as hh]
            [metabase.api.common :as api]
            [metabase.api.permission-graph :as pg]
            [metabase.models.dashboard :as dashboard :refer [Dashboard]]
            [metabase.models.collection :as collection :refer [Collection]]
            [metabase.models.collection.graph :as collection.graph]
            [metabase.models.collection.root :as collection.root]
            [metabase.models.permissions :as perms]
            [metabase.models.permissions-group :as group :refer [PermissionsGroup]]
            [metabase.models.permissions-group-membership :refer [PermissionsGroupMembership]]
            [metabase.server.middleware.offset-paging :as offset-paging]
            [metabase.util :as u]
            [metabase.util.i18n :refer [tru]]
            [metabase.util.schema :as su]
            [toucan.db :as db]
            [toucan.hydrate :refer [hydrate]]))

;;; +----------------------------------------------------------------------------------------------------------------+
;;; |                                          PERMISSIONS GRAPH ENDPOINTS                                           |
;;; +----------------------------------------------------------------------------------------------------------------+

(declare get-or-create-root-container-collection!)

(defn- create-collection!
  ([collection-name color description location]
   (create-collection! collection-name color description location nil))
  ([collection-name color description location group_owner_id]
   (u/the-id
    (db/insert! Collection
      {:name        collection-name
       :color       color
       :description description
       :location    location
       :group_owner_id group_owner_id}))))

(defn get-or-create-root-container-collection!
  "Get or create container collection for automagic dashboards in the root collection."
  []
  (or (db/select-one-id Collection
        :name     "Teams"
        :location "/")
      (create-collection! "Teams" "#AA4A44" nil "/")))


(defn- grant-group-collection-perms! 
  "Adds read permission of collection for group"
  [group-id collection-id]
   (let [current-graph (collection.graph/graph)
        new-graph (-> current-graph 
                      (assoc-in [:groups group-id collection-id] :read)
                      (assoc-in [:groups 1 collection-id] :none))]
        (collection.graph/update-graph! new-graph)))

(defn- create-team-dashboard! 
  "Create a new `Dashboard` for the team."
  [team-name collection-id]
  (collection/check-write-perms-for-collection collection-id)
  (let [dashboard-data {:name              (format "Team %s's Detective Dashboard" team-name)
                      :description         (format "The dashboard displayed for team %s when using the detective role" team-name)
                      :parameters          []
                      :creator_id          api/*current-user-id*
                      :collection_id       collection-id}]
    (db/insert! Dashboard dashboard-data)))

(api/defendpoint POST "/"
  "Create a new Team."
  [:as {{:keys [name]} :body}]
  {name su/NonBlankString}
  (api/check-superuser)
  (db/transaction
   (let [group  (db/insert! PermissionsGroup :name name)
         collection (create-collection! 
                      name 
                      "#AA4A44" 
                      nil 
                      (format "/%s/" (get-or-create-root-container-collection!))
                      (:id group))]
      (grant-group-collection-perms! (:id group) collection)
      (create-team-dashboard! name collection)
   )))


(api/define-routes)