(ns metabase.models.card-favorite-grp
  (:require [metabase.util :as u]
            [toucan.models :as models]))

(models/defmodel CardFavoriteGrp :report_cardfavorite_grp)

(u/strict-extend (class CardFavoriteGrp)
  models/IModel
  (merge models/IModelDefaults
         {:properties (constantly {:timestamped? true})}))
