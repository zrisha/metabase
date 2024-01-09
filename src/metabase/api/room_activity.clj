(ns metabase.api.room-activity
  (:require [compojure.core :refer [GET PUT]]
            [medley.core :as m]
            [java-time :as t]
            [metabase.api.common :as api]
            [metabase.models.room-activity :as room_activity :refer [RoomActivity]]
            [toucan.db :as db]))

(api/defendpoint PUT "/"
  "Log room activity from socket"
  [:as {{:keys [user_id, group_id, role, activity, room_state]} :body}]
  (db/insert! RoomActivity
        :user_id user_id
        :group_id group_id
        :role role
        :room_state room_state
        :activity activity))


(api/defendpoint GET "/:group-id"
  "Grab today's room log data based on group ID, grouped by role"
  [group-id]
  (let [logs (db/select RoomActivity
                :room_state [:not= nil]
                :timestamp [:> (.atStartOfDay (t/local-date))] 
                :group_id group-id
                {:order-by [[:timestamp :asc]]})]
    (map
      (fn [[name, group]]
      {:role name :durations (room_activity/aggregate-time! group)})
      (group-by :role logs))
    )
  )

(api/define-routes)