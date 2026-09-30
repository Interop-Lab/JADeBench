const SUCCESS_SUFFIX = '_SUCCESS';
const CLEAR_REQUESTS_CACHE = 'CLEAR_REQUESTS_CACHE';

const isResponseAction = action => !!action?.meta?.requestAction;
const isSuccessAction = action =>
  isResponseAction(action) && action.type.endsWith(SUCCESS_SUFFIX);

const getRequestActionFromResponse = action => action.meta.requestAction;
const getRequestKey = action =>
  action.type + (action.meta.requestKey || '');
const getRequestTypeString = requestType =>
  typeof requestType === 'function' ? requestType.toString() : requestType;
const getRequestKeys = requests =>
  requests.map(request =>
    typeof request === 'object'
      ? getRequestTypeString(request.requestType) + request.requestKey
      : getRequestTypeString(request),
  );
const getNewCacheTimeout = cacheTimeout =>
  cacheTimeout === true ? null : cacheTimeout * 1000 + Date.now();

function cacheReducer(state, action) {
  if (action.type === CLEAR_REQUESTS_CACHE) {
    if (!action.requests) return {};
    const nextState = { ...state };
    for (const requestKey of getRequestKeys(action.requests)) {
      delete nextState[requestKey];
    }
    return nextState;
  }

  if (
    isSuccessAction(action) &&
    action.meta.cache &&
    !action.meta.cacheResponse &&
    !action.meta.ssrResponse
  ) {
    const requestAction = getRequestActionFromResponse(action);
    return {
      ...state,
      [getRequestKey(requestAction)]: {
        timeout: getNewCacheTimeout(action.meta.cache),
        cacheKey: action.meta.cacheKey,
      },
    };
  }

  return state;
}

module.exports = { default: cacheReducer };
