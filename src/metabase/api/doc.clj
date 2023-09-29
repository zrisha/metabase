;; arts for each group
(ns metabase.api.doc
  (:require [compojure.core :refer [GET PUT POST]]
            [medley.core :as m]
            [metabase.api.common :as api]
            [clojure.java.shell :as shell]
            [metabase.api.user :as api.user]
            [toucan.db :as db]))

(api/defendpoint GET "/:group-id"
  "Grab all arts based on group ID"
  [group-id]
  (shell/sh "node" "resources/google-doc/sync_doc.js" (str group-id)))

(api/define-routes)