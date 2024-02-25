(ns metabase.server.middleware.proxy
  (:require [clj-http.client :as client]
            [metabase.config :as config]))

(defn- host-from-url [url]
  (when url
    (clojure.string/replace url #"http://" "")))
    
(defn- build-url [host path query-string]
  (let [url (.toString (java.net.URL. (java.net.URL. host) path))]
    (if (not-empty query-string)
      (str url "?" query-string)
      url)))

(defn proxy-request
  "code that alters the request to the proxy"
  [request opts]
  (let [identifier-fn (get opts :identifier-fn identity)
        server-mapping (get opts :host-fn {})]
    (let [request-key (identifier-fn request)
          host (server-mapping request-key)
          stripped-headers (dissoc (:headers request) "content-length")
          replaced-host-headers (assoc stripped-headers "host" (host-from-url host))]
        (select-keys (client/request {:url              (build-url host (:uri request) (:query-string request))
                                      :method           (:request-method request)
                                      :body             (:body request)
                                      :headers          replaced-host-headers
                                      :throw-exceptions false
                                      :decompress-body  false
                                      :as               :stream})
                      [:status :headers :body]))))

(defn proxy-ws
  "Proxies websocket requests to the node server if matches the uri"
  [handler]
  (fn [request respond raise]
    (if (.startsWith (:uri request) "/socket.io")
      (respond (proxy-request request {:identifier-fn :server-name
                                   :host-fn (fn [server-name] (str "http://localhost:" (config/config-str :mb-ws-port)))}))
     (handler request respond raise)
    )))





