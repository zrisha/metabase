;; Stores data specific to one of the role interfaces
(ns metabase.api.role
  (:require [compojure.core :refer [GET PUT POST]]
            [medley.core :as m]
            [metabase.api.common :as api]
            [metabase.api.user :as api.user]
            [metabase.models.role :as role :refer [Role]]
            [toucan.db :as db]))

;; For creating a new entry based on room ID
(api/defendpoint POST "/"
  [:as {{:keys [id, role, data], :as body} :body}]
  (api/create-check Role body)
  (db/insert! Role
      :id    id
      :role    role
      :data    data)
  {:status :success})

;; Updates existing entry
(api/defendpoint PUT "/"
  [:as {{:keys [id, role, data], :as body} :body}]
  (api/write-check Role id)
  (db/update! Role id :data data)
  {:status :success})

;; Grab entry based on room ID
(api/defendpoint GET "/:room"
  [room]
  (if (db/exists? Role :id room)
  (api/write-check Role room)
  {:status 202 :body {:room room, :status 202, :response "Not found"}}
  ))

(api/define-routes)