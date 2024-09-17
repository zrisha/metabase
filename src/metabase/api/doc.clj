;; arts for each group
(ns metabase.api.doc
  (:require [compojure.core :refer [GET PUT POST]]
            [medley.core :as m]
            [metabase.api.common :as api]
            [metabase.public-settings :as public-settings]
            [clojure.java.shell :as shell]
            [metabase.api.user :as api.user]
            [toucan.db :as db])) 

(api/defendpoint GET "/work/:group-id"
  "Generate work doc and get link"
  [group-id]
  (let [current-env (into {} (System/getenv))]
    (shell/sh "node" "ext/google-doc/main.js" "work_doc" (str group-id) :env (assoc current-env :SITE_URL (public-settings/site-url)))))

(api/defendpoint GET "/plan/:group-id"
  "Get groups plan doc link"
  [group-id]
  (shell/sh "node" "ext/google-doc/main.js" "plan_doc" (str group-id)))

(api/define-routes)