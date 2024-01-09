(ns metabase.models.room-activity
  (:require [java-time :as t]
            [metabase.models.interface :as i]
            [metabase.util :as u]
            [toucan.models :as models]))


;;; ----------------------------------------------- Entity & Lifecycle -----------------------------------------------

(models/defmodel RoomActivity :room_activity)

(defn- pre-insert [room_activity]
  (let [defaults {:timestamp :%now}]
    (merge defaults room_activity)))

(u/strict-extend (class RoomActivity)
  models/IModel
  (merge models/IModelDefaults
         {:types      (constantly {:activity :json
                                   :room_state :json})
          :pre-insert pre-insert})
  i/IObjectPermissions
  (merge i/IObjectPermissionsDefaults
         {:can-read?  (constantly true)
          :can-write? (constantly true)}))


;;; --------------------------------------------------- Helper Fns ---------------------------------------------------

(defn getDurationInSeconds
  "Returns the seconds elapsed between two logs"
  [log1 log2]
  (.getSeconds 
   (t/duration (:timestamp log1) (:timestamp log2))))

(defn aggregate-time!
  "Processes logs of changes to room state to get total time spent as driver or navigator.
  Sorted log data is first partitioned to be processed two at a time to calculate
  the duration between logs. A reducer then iterates over room state to compare changes 
  in the driver and navigators. An inner reduce assings the time each user spent
  as a navigator. The duration of driver and all navigators is then aggregated by the outer
  reducer to return total time users spent as either driver or navigator.
  "
  [data]
  (reduce
   (fn [acc [item item2]]
     (let [driver-id (:driver (:room_state item))
           navigator-ids (:navigators (:room_state item))
           time (getDurationInSeconds item item2)]
       (as-> acc a
         (cond (not= driver-id false)
            (update-in a [driver-id :driver] (fnil + 0) time)
               :else a)
         (reduce
          (fn [inner-acc navigator-id]
            (update-in inner-acc [navigator-id :navigator] (fnil + 0) time))
          a navigator-ids))))
   {} (partition 2 1 data))) 