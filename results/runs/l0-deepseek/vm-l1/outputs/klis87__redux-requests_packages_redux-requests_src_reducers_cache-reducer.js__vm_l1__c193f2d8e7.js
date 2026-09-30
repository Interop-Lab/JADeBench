const SUCCESS_SUFFIX = '_SUCCESS';
const ERROR_SUFFIX = '_ERROR';
const ABORT_SUFFIX = '_ABORT';
const CLEAR_REQUESTS_CACHE = 'CLEAR_REQUESTS_CACHE';
const RESET_REQUESTS = 'RESET_REQUESTS';
const ABORT_REQUESTS = 'ABORT_REQUESTS';
const SET_DOWNLOAD_PROGRESS = 'SET_DOWNLOAD_PROGRESS';
const SET_UPLOAD_PROGRESS = 'SET_UPLOAD_PROGRESS';
const ADD_WATCHER = 'ADD_WATCHER';
const REMOVE_WATCHER = 'REMOVE_WATCHER';
const JOIN_REQUEST = 'JOIN_REQUEST';
const STOP_POLLING = 'STOP_POLLING';
const WEBSOCKET_OPENED = 'WEBSOCKET_OPENED';
const WEBSOCKET_CLOSED = 'WEBSOCKET_CLOSED';
const GET_WEBSOCKET = 'GET_WEBSOCKET';
const OPEN_WEBSOCKET = 'OPEN_WEBSOCKET';
const CLOSE_WEBSOCKET = 'CLOSE_WEBSOCKET';
const STOP_SUBSCRIPTIONS = 'STOP_SUBSCRIPTIONS';

const getActionWithSuffix = (suffix) => (action) => action + suffix;

const success = getActionWithSuffix(SUCCESS_SUFFIX);
const error = getActionWithSuffix(ERROR_SUFFIX);
const abort = getActionWithSuffix(ABORT_SUFFIX);

const isFSA = (action) => action && typeof action === 'object' && typeof action.type === 'string';

const createSuccessAction = (type, response) => ({ type: success(type), payload: response });
const createErrorAction = (type, error) => ({ type: error(type), payload: error });
const createAbortAction = (type) => ({ type: abort(type) });

const getActionPayload = (action) => action.payload;
const getResponseFromSuccessAction = (action) => action.payload;

const isRequestAction = (action) => isFSA(action) && action.type.endsWith('_REQUEST');
const isResponseAction = (action) => isFSA(action) && (action.type.endsWith(SUCCESS_SUFFIX) || action.type.endsWith(ERROR_SUFFIX));
const getRequestActionFromResponse = (action) => ({ type: action.type.replace(/(_SUCCESS|_ERROR)$/, '_REQUEST') });

const isSuccessAction = (action) => isFSA(action) && action.type.endsWith(SUCCESS_SUFFIX);
const isErrorAction = (action) => isFSA(action) && action.type.endsWith(ERROR_SUFFIX);
const isAbortAction = (action) => isFSA(action) && action.type.endsWith(ABORT_SUFFIX);

const isRequestQuery = (action) => isFSA(action) && action.type.endsWith('_REQUEST');
const isRequestActionQuery = (action) => isFSA(action) && action.type.endsWith('_REQUEST');

const clearRequestsCache = (action) => ({ type: CLEAR_REQUESTS_CACHE, payload: action });
const resetRequests = (action, payload, meta) => ({ type: RESET_REQUESTS, payload, meta });
const abortRequests = (action) => ({ type: ABORT_REQUESTS, payload: action });
const stopPolling = (action) => ({ type: STOP_POLLING, payload: action });
const setDownloadProgress = (action, progress) => ({ type: SET_DOWNLOAD_PROGRESS, payload: { action, progress } });
const setUploadProgress = (action, progress) => ({ type: SET_UPLOAD_PROGRESS, payload: { action, progress } });
const addWatcher = (action) => ({ type: ADD_WATCHER, payload: action });
const removeWatcher = (action) => ({ type: REMOVE_WATCHER, payload: action });
const joinRequest = (action, payload) => ({ type: JOIN_REQUEST, payload: { action, payload } });
const websocketOpened = () => ({ type: WEBSOCKET_OPENED });
const websocketClosed = (payload) => ({ type: WEBSOCKET_CLOSED, payload });
const getWebsocket = () => ({ type: GET_WEBSOCKET });
const openWebsocket = (payload) => ({ type: OPEN_WEBSOCKET, payload });
const closeWebsocket = (payload) => ({ type: CLOSE_WEBSOCKET, payload });
const stopSubscriptions = (payload) => ({ type: STOP_SUBSCRIPTIONS, payload });

const getNewCacheTimeout = (timeout) => timeout;
const getRequestKey = (action) => action.type;
const getRequestTypeString = (action) => action.type;
const getRequestKeys = (action) => [action.type];

const cache_reducer_default = (state = {}, action) => {
  if (!isFSA(action)) return state;
  switch (action.type) {
    case CLEAR_REQUESTS_CACHE:
      return {};
    case RESET_REQUESTS:
      return {};
    case ABORT_REQUESTS:
      return {};
    case SET_DOWNLOAD_PROGRESS:
      return state;
    case SET_UPLOAD_PROGRESS:
      return state;
    case ADD_WATCHER:
      return state;
    case REMOVE_WATCHER:
      return state;
    case JOIN_REQUEST:
      return state;
    case STOP_POLLING:
      return state;
    case WEBSOCKET_OPENED:
      return state;
    case WEBSOCKET_CLOSED:
      return state;
    case GET_WEBSOCKET:
      return state;
    case OPEN_WEBSOCKET:
      return state;
    case CLOSE_WEBSOCKET:
      return state;
    case STOP_SUBSCRIPTIONS:
      return state;
    default:
      if (isRequestAction(action)) {
        return { ...state, [action.type]: { request: action } };
      }
      if (isResponseAction(action)) {
        const requestAction = getRequestActionFromResponse(action);
        return { ...state, [requestAction.type]: { ...state[requestAction.type], response: action } };
      }
      return state;
  }
};

module.exports = cache_reducer_default;
