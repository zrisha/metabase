;; arts for each group
(ns metabase.api.doc
  (:require [compojure.core :refer [GET PUT POST]]
            [medley.core :as m]
            [metabase.api.common :as api]
            [clojure.java.shell :as shell]
            [metabase.api.user :as api.user]
            [toucan.db :as db]))

(api/defendpoint GET "/work/:group-id"
  "Grab all arts based on group ID"
  [group-id]
  (shell/sh "node" "ext/google-doc/main.js" "work_doc" (str group-id)))

(api/defendpoint GET "/plan/:group-id"
  "Grab all arts based on group ID"
  [group-id]
  (shell/sh "node" "ext/google-doc/main.js" "plan_doc" (str group-id)))

(api/define-routes)