'use strict';

// Action types used by the cache reducer and by the request middleware.
const SUCCESS_SUFFIX = '_SUCCESS';
const ERROR_SUFFIX = '_ERROR';
const ABORT_SUFFIX = '_ABORT';
const CLEAR_REQUESTS_CACHE = 'CLEAR_REQUESTS_CACHE';
const RESET_REQUESTS = 'RESET_REQUESTS';

const getActionWithSuffix = suffix => type => `${type}${suffix}`;
const success = getActionWithSuffix(SUCCESS_SUFFIX);
const error = getActionWithSuffix(ERROR_SUFFIX);
const abort = getActionWithSuffix(ABORT_SUFFIX);

const isFSA = action => {
  const validKeys = ['type', 'payload', 'error', 'meta'];
  return typeof action.payload !== 'undefined' &&
    Object.keys(action).every(key => validKeys.includes(key));
};

const getActionPayload = action => action.payload;
const getRequestActionFromResponse = action => action.meta.requestAction;

const isRequestAction = action =>
  isFSA(action) &&
  Boolean(getActionPayload(action).request) &&
  !getActionPayload(action).response;

const isResponseAction = action =>
  Boolean(getRequestActionFromResponse(action));

const isSuccessAction = action =>
  isResponseAction(action) && action.type === success(getRequestActionFromResponse(action).type);

const isErrorAction = action =>
  isResponseAction(action) && action.type === error(getRequestActionFromResponse(action).type);

const isAbortAction = action =>
  isResponseAction(action) && action.type === abort(getRequestActionFromResponse(action).type);

const getResponseFromSuccessAction = action =>
  isSuccessAction(action) ? getActionPayload(action) : undefined;

function createResponseAction(requestAction, payload, suffix, isError) {
  const action = {
    type: suffix(requestAction.type),
    payload,
    meta: Object.assign({}, requestAction.meta, { requestAction }),
  };
  if (isError) action.error = true;
  return action;
}

const createSuccessAction = (requestAction, response) =>
  createResponseAction(requestAction, response, success, false);
const createErrorAction = (requestAction, response) =>
  createResponseAction(requestAction, response, error, true);
const createAbortAction = requestAction =>
  createResponseAction(requestAction, undefined, abort, false);

const isRequestQuery = request => !request.query;
const isRequestActionQuery = action => isRequestQuery(action.payload.request);

const getRequestTypeString = requestType =>
  Array.isArray(requestType) ? requestType.join(',') : requestType;

const getRequestKey = action =>
  `${getRequestTypeString(action.type)}${action.meta.requestKey}`;

const getRequestKeys = requests => requests.map(request =>
  Array.isArray(request) ? request.reduce((sum, value) => sum + value, 0) : request
);

const getNewCacheTimeout = cache => {
  if (cache === true) return null;
  return Date.now() + cache * 1000;
};

/*
 * The source module only publishes this reducer.  It intentionally leaves an
 * uninitialised state unchanged; a cache-management action creates the cache.
 */
function cacheReducer(state, action) {
  if (action.type === CLEAR_REQUESTS_CACHE) {
    const requests = action.requests;
    if (requests == null) return {};

    const keys = getRequestKeys(requests);
    const nextState = Object.assign({}, state);
    keys.forEach(key => { delete nextState[key]; });
    return nextState;
  }

  if (!isResponseActionSafe(action) || !isSuccessAction(action)) return state;

  const requestAction = getRequestActionFromResponse(action);
  const requestKey = getRequestKey(requestAction);
  const nextState = Object.assign({}, state);

  if (!requestAction.meta || !requestAction.meta.cache) return state;
  nextState[requestKey] = {
    timeout: getNewCacheTimeout(requestAction.meta.cache),
    cacheKey: requestAction.meta.cacheKey,
  };
  return nextState;
}

function isResponseActionSafe(action) {
  return Boolean(action && action.meta && action.meta.requestAction);
}

Object.defineProperty(exports, '__esModule', { value: true });
exports.default = cacheReducer;
