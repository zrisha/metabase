import { getSafe } from "metabase/ext/util";
import { getParameters, getDashboardId } from "metabase/dashboard/selectors";
import { PUT } from "metabase/lib/api";

export const logging = store => next => action => {
  if (!action) {
    return;
  }
  switch (action.type) {
    case "metabase/qb/QUERY_COMPLETED": {
      const query = logQuery(action, store);
      query
        .then(
          value => {
            // fulfillment
          },
          reason => {
            // rejection
            console.log(reason);
          },
        )
        .catch(err => console.log(err));
      break;
    }
    case "metabase/dashboard/SET_PARAMETER_VALUE": {
      const filter = logFilter(action, store);
      filter
        .then(
          value => {
            // fulfillment
          },
          reason => {
            // rejection
            console.log(reason);
          },
        )
        .catch(err => console.log(err));
      break;
    }
    default:
      break;
  }

  const result = next(action);
  return result;
};

async function logQuery(action, store) {
  const query = getSafe(
    () => action.payload.queryResults[0].data.native_form.query,
  );
  const json_query = getSafe(() => action.payload.queryResults[0].json_query);
  if (!query || !json_query) {
    return;
  }

  const call = await PUT("/api/user-queries")({
    query,
    json_query,
  });
  return call;
}

async function logFilter(action, store) {
  const parameterId = getSafe(() => action.payload.id);
  const parameters = getParameters(store.getState());
  const { name, id, type } = parameters.find(x => x.id === parameterId);

  const call = await PUT("/api/user-activity")({
    activity: {
      action: action.payload.value ? "set filter" : "clear filter",
      category: "filter",
      dashboardId: getDashboardId(store.getState()),
      name,
      id,
      type,
      value: action.payload.value ? action.payload.value : "clear",
    },
  });
  return call;
}
