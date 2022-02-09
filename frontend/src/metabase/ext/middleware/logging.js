import {getSafe} from 'metabase/ext/util';
import { getUser } from "metabase/selectors/user";


export const logging = store => next => action => {
  if(!action){ return}
  switch(action.type) {
    case "metabase/qb/QUERY_COMPLETED":
      logQuery(action, store);
      break;
    default:
      break;
  }

  let result = next(action)
  return result
} 

function logQuery(action, store){
  const query = getSafe(() => action.payload.queryResults[0].data.native_form.query);
  const json_query = getSafe(() => action.payload.queryResults[0].json_query)
  if(!query || !json_query) {return}
  
  const user = getUser(store.getState());
  const user_id = user ? user.id : undefined;
  fetch('/log/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id,
      json_query,
      query
    })
  }).catch(error => {
    console.log(error);
  });
}

