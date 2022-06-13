(ns metabase.analytics.local
  "Middleware related to enforcing authentication/API keys (when applicable). Unlike most other middleware most of this
  is not used as part of the normal `app`; it is instead added selectively to appropriate routes."
  (:require [metabase.models.setting :refer [defsetting]]
            [metabase.public-settings :as public-settings]
            [metabase.config :as config]
            [metabase.util.i18n :as i18n :refer [deferred-tru trs]]))

(defsetting logging-url
  (deferred-tru "The URL of local logging to send analytics events to.")
  :default    (if config/is-prod?
                "/log"
                ;; See the iglu-schema-registry repo for instructions on how to run Snowplow Micro locally for development
                "http://localhost:4987")
  :visibility :public)