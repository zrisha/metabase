(ns build.licenses
  "Functionality to take a classpath and generate a file containing all libraries and their respective licenses.
  Intended to be called from from the command line like:

  clj -X mb.license/process :classpath a-classpath :output-filename a-filename

  Allows for optional backfill, either edn or a filename that is edn. Backfill should be of the form

  {\"group\" {\"artifact\" \"license text\"}
   \"group\" {\"artifact\" {:resource \"filename-of-license\"}}

  :override/group {\"group\" \"license\"
                   \"group\" {:resource \"filename-of-license\"}}
  }

  At the moment assumes a leiningen classpath which is primarily jars and your own source paths, so only detects
  license information from jars. In the future a strategy and heuristics could be determined for when source is
  available from local roots and git dependencies."
  (:require [clojure.data.xml :as xml]
            [clojure.edn :as edn]
            [clojure.java.io :as io]
            [clojure.string :as str])
  (:import (java.util.jar JarFile JarFile$JarFileEntry)))

(set! *warn-on-reflection* true)

(def classpath-separator (System/getProperty "path.separator"))

(defn jar-file? [filename]
  (str/ends-with? filename "jar"))

(defn jar-files [jar-filename]
  (iterator-seq (.entries (JarFile. (io/file jar-filename)))))

(def pom-filter (filter (fn [^JarFile$JarFileEntry jar-entry]
                          (str/ends-with? (.getName jar-entry) "pom.xml"))))

(defn jar->pom
  "Given a jar filename, look for an adjacent pom file otherwise look for a pom file in the jar. Return the parsed xml."
  [jar-filename]
  (let [adjacent-pom (io/file (str/replace jar-filename #"jar$" "pom"))]
    (if (.exists adjacent-pom)
      (xml/parse (io/input-stream adjacent-pom)
                 :skip-whitespace true)
      (when-let [jar-pom (first (into [] pom-filter (jar-files jar-filename)))]
        (xml/parse (.getInputStream (JarFile. ^String jar-filename) jar-pom)
                   :skip-whitespace true)))))

(defn get-entry [^JarFile jar ^String name]
  (.getEntry jar name))

(def tag-name (comp keyword (fnil name "") :tag))
(def ^:private tag-content (juxt tag-name (comp first :content)))

(defn pom->coordinates [pom-xml]
  (let [coords (->> pom-xml
                    :content
                    (filter #(#{:groupId :artifactId :version} (tag-name %)))
                    (map tag-content)
                    (into {}))
        parent (->> pom-xml
                    :content
                    (filter #(#{:parent} (tag-name %)))
                    first
                    :content
                    (keep tag-content)
                    (into {}))]
    {:group (or (:groupId coords) (:groupId parent))
     :artifact (:artifactId coords)
     :version (or (:version coords) (:version parent))}))

(defn pom->licenses [pom-xml]
  (let [licenses (some->> pom-xml
                          :content
                          (filter #(#{:licenses} (tag-name %)))
                          first
                          :content
                          first
                          :content
                          (map tag-content)
                          (into {}))]
    licenses))

(def ^:private license-file-names
  ["LICENSE" "LICENSE.txt" "META-INF/LICENSE"
   "META-INF/LICENSE.txt" "license/LICENSE"])

(defn license-from-jar
  [^JarFile jar]
  (when-let [license-entry (some (partial get-entry jar) license-file-names)]
    (with-open [is (.getInputStream jar license-entry)]
      (slurp is))))

(defn license-from-backfill
  [{:keys [group artifact]} backfill]
  (if-let [license (some #(get-in backfill %)
                         [[group artifact]
                          [:override/group group]])]
    (if (string? license)
      license
      (slurp (io/resource (:resource license))))))

(defn discern-license-and-coords [^String jar-filename backfill]
  (try
    (let [pom-xml (jar->pom jar-filename)
          coords  (pom->coordinates pom-xml)
          license (or (license-from-jar (JarFile. jar-filename))
                      (license-from-backfill coords backfill)
                      (when-let [{:keys [name url]} (pom->licenses pom-xml)]
                        (str name ": " url)))]
      [jar-filename (cond-> {:coords coords :license license}
                      (not (and license coords))
                      (assoc :error "Error determining license or coords"))])
    (catch Exception e
      [jar-filename {:error e}])))

(defn write-license [success-os [_jar {:keys [coords license]}]]
  (let [{:keys [group artifact]} coords]
    (binding [*out* success-os]
      (println "The following software may be included in this product: "
               group ":" artifact
               ". This software contains the following license and notice below:")
      (println "\n")
      (println license)
      (println "\n\n----------\n"))))

(defn report-missing [error-os [jar {:keys [coords]}]]
  (let [{:keys [group artifact]} coords
        dep-name (or (when artifact
                       (str (when group (str group ":")) artifact))
                     jar)]
    (binding [*out* error-os]
      (println dep-name " : No license information found."))))

(defn process* [{:keys [classpath-entries backfill]}]
  (let [info     (map #(discern-license-and-coords % backfill) classpath-entries)

        categorized (group-by (comp (complement #(contains? % :error)) second) info)]
    {:with-license    (categorized true)
     :without-license (categorized false)}))

(defn process
  [{:keys [classpath backfill output-filename exit?] :or {exit? true}}]
  (let [backfill (if (string? backfill)
                   (edn/read-string (slurp backfill))
                   (or backfill {}))
        entries  (->> (str/split classpath (re-pattern classpath-separator))
                      (filter jar-file?))]
    (let [{:keys [with-license without-license] :as license-info}
          (process* {:classpath-entries     entries
                     :backfill              backfill})]
      (when (seq with-license)
        (with-open [os (io/writer output-filename)]
          (run! #(write-license os %) with-license)))
      (when (seq without-license)
        (run! #(report-missing *err* %) without-license))
      (when exit?
        (println "License information for" (count with-license) "libraries written to "
                 output-filename)
        (System/exit (if (seq without-license) 1 0)))
      license-info)))
