const requestState = { requests: [], selectedRequest: null };
const filterState = {
  currentFilter: "all",
  selectedMethods: new Set(),
  starFilterActive: false,
  currentColorFilter: "all",
  currentSearchTerm: "",
  useRegex: false,
};
const historyState = { requestHistory: [], historyIndex: -1 };
const undoRedoState = { undoStack: [], redoStack: [] };
const bulkReplayState = {
  positionConfigs: [],
  currentAttackType: "sniper",
  shouldStopBulk: false,
  shouldPauseBulk: false,
};
const diffState = { regularRequestBaseline: null, currentResponse: null };
const starringState = { starredPages: new Set(), starredDomains: new Set() };
const timelineState = { timelineFilterTimestamp: null, timelineFilterRequestIndex: null };
const uiState = { manuallyCollapsed: false };
const attackSurfaceState = {
  attackSurfaceCategories: {},
  domainsWithAttackSurface: new Set(),
  isAnalyzingAttackSurface: false,
};
const blockingState = { blockRequests: false, blockedQueue: [] };

class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(eventName, listener) {
    if (!this.listeners.has(eventName)) this.listeners.set(eventName, new Set());
    this.listeners.get(eventName).add(listener);
    return () => this.off(eventName, listener);
  }

  emit(eventName, detail) {
    for (const listener of [...(this.listeners.get(eventName) ?? [])]) listener(detail);
  }

  off(eventName, listener) {
    const listeners = this.listeners.get(eventName);
    if (!listeners) return;
    listeners.delete(listener);
    if (listeners.size === 0) this.listeners.delete(eventName);
  }

  removeAllListeners(eventName) {
    if (eventName === undefined) this.listeners.clear();
    else this.listeners.delete(eventName);
  }

  listenerCount(eventName) {
    return this.listeners.get(eventName)?.size ?? 0;
  }
}

const events = new EventBus();
const EVENT_NAMES = {
  REQUEST_SELECTED: "request:selected",
  REQUEST_STARRED: "request:starred",
  REQUEST_COLOR_CHANGED: "request:color-changed",
  REQUEST_FILTERED: "request:filtered",
  REQUEST_RENDERED: "request:rendered",
  REQUEST_STAR_UPDATED: "request:star-updated",
  REQUEST_ACTION_STAR: "request:action:star",
  REQUEST_ACTION_GROUP_STAR: "request:action:group-star",
  REQUEST_ACTION_DELETE_GROUP: "request:action:delete-group",
  REQUEST_ACTION_TIMELINE: "request:action:timeline",
  REQUEST_ACTION_COLOR: "request:action:color",
  UI_RESIZE: "ui:resize",
  UI_THEME_CHANGED: "ui:theme-changed",
  UI_VIEW_SWITCHED: "ui:view-switched",
  UI_LAYOUT_TOGGLED: "ui:layout-toggled",
  UI_REQUEST_SELECTED: "ui:request-selected",
  UI_UPDATE_REQUEST_CONTENT: "ui:update-request-content",
  UI_GET_REQUEST_CONTENT: "ui:get-request-content",
  UI_UPDATE_REQUEST_LIST: "ui:update-request-list",
  UI_UPDATE_HISTORY_BUTTONS: "ui:update-history-buttons",
  UI_UPDATE_RAW_REQUEST: "ui:update-raw-request",
  UI_UPDATE_RESPONSE_VIEW: "ui:update-response-view",
  UI_UPDATE_REGEX_TOGGLE: "ui:update-regex-toggle",
  UI_UPDATE_DIFF_TOGGLE_VISIBILITY: "ui:update-diff-toggle-visibility",
  UI_CLEAR_ALL: "ui:clear-all",
  NETWORK_REQUEST_CAPTURED: "network:request-captured",
  NETWORK_RESPONSE_RECEIVED: "network:response-received",
  NETWORK_ERROR: "network:error",
  STATE_REQUESTS_CLEARED: "state:requests-cleared",
  STATE_FILTER_CHANGED: "state:filter-changed",
  STATE_SEARCH_CHANGED: "state:search-changed",
  HISTORY_UPDATED: "history:updated",
  HISTORY_NAVIGATED: "history:navigated",
  REQUESTS_EXPORTED: "requests:exported",
  REQUESTS_IMPORTED: "requests:imported",
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeCsvField(value) {
  if (value == null) return "";
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function arrayToCSV(rows, columns = Object.keys(rows[0] ?? {})) {
  return [
    columns.map(escapeCsvField).join(","),
    ...rows.map((row) => columns.map((column) => escapeCsvField(row[column])).join(",")),
  ].join("\n");
}

function downloadBlob(contents, filename, type) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([contents], { type }));
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function downloadCSV(rows, filename) {
  downloadBlob(arrayToCSV(rows), filename, "text/csv;charset=utf-8");
  events.emit(EVENT_NAMES.REQUESTS_EXPORTED, { format: "csv", filename });
}

function downloadJSON(data, filename) {
  downloadBlob(JSON.stringify(data, null, 2), filename, "application/json");
  events.emit(EVENT_NAMES.REQUESTS_EXPORTED, { format: "json", filename });
}

async function copyToClipboard(text, successElement) {
  await navigator.clipboard.writeText(text);
  if (successElement) showCopySuccess(successElement);
}

function showCopySuccess(element) {
  const originalText = element.textContent;
  element.textContent = "Copied!";
  setTimeout(() => { element.textContent = originalText; }, 1500);
}

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function highlightHTTP(text) {
  return escapeHtml(text).replace(
    /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|HTTP\/\d(?:\.\d)?)/gm,
    '<span class="http-method">$1</span>',
  );
}

function highlightJSON(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  return escapeHtml(text).replace(
    /(&quot;(?:\\.|[^&])*?&quot;)(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/gi,
    (match, string, key, literal, number) => {
      if (key) return `<span class="json-key">${string}</span>${key}`;
      if (string) return `<span class="json-string">${string}</span>`;
      if (literal) return `<span class="json-literal">${literal}</span>`;
      if (number) return `<span class="json-number">${number}</span>`;
      return match;
    },
  );
}

function highlightParams(text) {
  return escapeHtml(text).replace(
    /(^|&amp;)([^=]+)=([^&]*)/g,
    '$1<span class="param-name">$2</span>=<span class="param-value">$3</span>',
  );
}

function highlightCookies(text) {
  return escapeHtml(text).replace(
    /(^|;\s*)([^=;]+)=([^;]*)/g,
    '$1<span class="cookie-name">$2</span>=<span class="cookie-value">$3</span>',
  );
}

function replaceSetContents(target, values) {
  target.clear();
  for (const value of values) target.add(value);
}

const requestActions = {
  isDuplicate(first, second) {
    return first?.method === second?.method &&
      first?.url === second?.url &&
      (first?.body ?? first?.requestBody) === (second?.body ?? second?.requestBody);
  },

  normalizeHeaders(headers) {
    if (!headers) return {};
    if (Array.isArray(headers)) {
      return Object.fromEntries(headers.map(({ name, value }) => [name.toLowerCase(), value]));
    }
    return Object.fromEntries(
      Object.entries(headers).map(([name, value]) => [name.toLowerCase(), value]),
    );
  },

  removeDuplicates() {
    requestState.requests = requestState.requests.filter(
      (request, index, requests) =>
        requests.findIndex((candidate) => this.isDuplicate(request, candidate)) === index,
    );
    state.requests = requestState.requests;
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST, requestState.requests);
    return requestState.requests;
  },

  add(request) {
    if (!request || requestState.requests.some((item) => this.isDuplicate(item, request))) return false;
    requestState.requests.push(request);
    events.emit(EVENT_NAMES.NETWORK_REQUEST_CAPTURED, request);
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST, requestState.requests);
    return true;
  },

  select(request, index) {
    requestState.selectedRequest = request ?? requestState.requests[index] ?? null;
    state.selectedRequest = requestState.selectedRequest;
    const detail = { request: requestState.selectedRequest, index };
    events.emit(EVENT_NAMES.REQUEST_SELECTED, detail);
    events.emit(EVENT_NAMES.UI_REQUEST_SELECTED, detail);
    return requestState.selectedRequest;
  },

  clearAll() {
    requestState.requests.length = 0;
    requestState.selectedRequest = null;
    state.selectedRequest = null;
    events.emit(EVENT_NAMES.STATE_REQUESTS_CLEARED);
    events.emit(EVENT_NAMES.UI_CLEAR_ALL);
  },

  toggleStar(request, starred = !request.starred) {
    request.starred = starred;
    events.emit(EVENT_NAMES.REQUEST_STARRED, request);
    events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED, request);
    return starred;
  },

  toggleGroupStar(hostname, starred, requests = requestState.requests) {
    const matching = requests.filter((request) => getHostname(request.url) === hostname);
    for (const request of matching) request.starred = starred;
    events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED, { hostname, starred, requests: matching });
    return matching;
  },

  setColor(request, color) {
    request.color = color;
    events.emit(EVENT_NAMES.REQUEST_COLOR_CHANGED, { request, color });
    return request;
  },

  delete(request) {
    const index = typeof request === "number" ? request : requestState.requests.indexOf(request);
    if (index < 0) return undefined;
    const [removed] = requestState.requests.splice(index, 1);
    if (requestState.selectedRequest === removed) this.select(null);
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST, requestState.requests);
    return removed;
  },

  deleteGroup(hostname, requests = requestState.requests) {
    const removed = requests.filter((request) => getHostname(request.url) === hostname);
    requestState.requests = requests.filter((request) => getHostname(request.url) !== hostname);
    state.requests = requestState.requests;
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST, requestState.requests);
    return removed;
  },
};

const filterActions = {
  setFilter(filter) {
    filterState.currentFilter = filter;
    state.currentFilter = filter;
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, filter);
  },
  setSelectedMethods(methods) {
    replaceSetContents(filterState.selectedMethods, methods);
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, filterState);
  },
  setStarFilter(active) {
    filterState.starFilterActive = active;
    state.starFilterActive = active;
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, filterState);
  },
  setSearch(search) {
    if (typeof search === "object") {
      filterState.currentSearchTerm = search.term ?? "";
      filterState.useRegex = Boolean(search.useRegex);
    } else filterState.currentSearchTerm = search;
    state.currentSearchTerm = filterState.currentSearchTerm;
    state.useRegex = filterState.useRegex;
    events.emit(EVENT_NAMES.STATE_SEARCH_CHANGED, filterState.currentSearchTerm);
  },
  setColorFilter(color) {
    filterState.currentColorFilter = color;
    state.currentColorFilter = color;
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, filterState);
  },
};

const starringActions = {
  togglePageStar(page, starred = !starringState.starredPages.has(page)) {
    if (starred) starringState.starredPages.add(page);
    else starringState.starredPages.delete(page);
    return starred;
  },
  toggleDomainStar(domain, starred = !starringState.starredDomains.has(domain)) {
    if (starred) starringState.starredDomains.add(domain);
    else starringState.starredDomains.delete(domain);
    return starred;
  },
};

const blockingActions = {
  setBlocking(enabled) {
    blockingState.blockRequests = enabled;
    state.blockRequests = enabled;
  },
  addToBlockedQueue(request) {
    blockingState.blockedQueue.push(request);
    return blockingState.blockedQueue.length;
  },
  clearBlockedQueue() {
    blockingState.blockedQueue.length = 0;
  },
};

const timelineActions = {
  setFilter(timestamp, requestIndex) {
    timelineState.timelineFilterTimestamp = timestamp;
    timelineState.timelineFilterRequestIndex = requestIndex;
    state.timelineFilterTimestamp = timestamp;
    state.timelineFilterRequestIndex = requestIndex;
  },
  clear() {
    this.setFilter(null, null);
  },
};

const historyActions = {
  add(request, metadata) {
    historyState.requestHistory.splice(historyState.historyIndex + 1);
    historyState.requestHistory.push(metadata === undefined ? request : { request, metadata });
    historyState.historyIndex = historyState.requestHistory.length - 1;
    state.historyIndex = historyState.historyIndex;
    events.emit(EVENT_NAMES.HISTORY_UPDATED, historyState);
    return historyState.historyIndex;
  },
  goBack() {
    if (historyState.historyIndex <= 0) return null;
    const entry = historyState.requestHistory[--historyState.historyIndex];
    state.historyIndex = historyState.historyIndex;
    events.emit(EVENT_NAMES.HISTORY_NAVIGATED, entry);
    return entry;
  },
  goForward() {
    if (historyState.historyIndex >= historyState.requestHistory.length - 1) return null;
    const entry = historyState.requestHistory[++historyState.historyIndex];
    state.historyIndex = historyState.historyIndex;
    events.emit(EVENT_NAMES.HISTORY_NAVIGATED, entry);
    return entry;
  },
};

const diffActions = {
  setBaseline(request) {
    diffState.regularRequestBaseline = request;
    state.regularRequestBaseline = request;
  },
  setCurrentResponse(response) {
    diffState.currentResponse = response;
    state.currentResponse = response;
  },
};

const attackSurfaceActions = {
  setCategory(category, value) {
    attackSurfaceState.attackSurfaceCategories[category] = value;
    return value;
  },
  markDomain(domain) {
    attackSurfaceState.domainsWithAttackSurface.add(domain);
    return domain;
  },
  setAnalyzing(analyzing) {
    attackSurfaceState.isAnalyzingAttackSurface = analyzing;
    state.isAnalyzingAttackSurface = analyzing;
  },
};

const actions = {
  request: requestActions,
  filter: filterActions,
  starring: starringActions,
  blocking: blockingActions,
  timeline: timelineActions,
  history: historyActions,
  diff: diffActions,
  attackSurface: attackSurfaceActions,
};

const state = {
  ...requestState,
  ...filterState,
  ...historyState,
  ...undoRedoState,
  ...bulkReplayState,
  ...diffState,
  ...starringState,
  ...timelineState,
  ...uiState,
  ...attackSurfaceState,
  ...blockingState,
};

function addRequest(request) {
  return requestActions.add(request);
}
function clearRequests() {
  return requestActions.clearAll();
}
function addToHistory(request, metadata) {
  return historyActions.add(request, metadata);
}

Object.assign(globalThis, {
  requestState, filterState, historyState, undoRedoState, bulkReplayState, diffState,
  starringState, timelineState, uiState, attackSurfaceState, blockingState,
  EventBus, events, EVENT_NAMES, requestActions, filterActions, starringActions,
  blockingActions, timelineActions, historyActions, diffActions, attackSurfaceActions,
  actions, state,
});

export {
  actions,
  addRequest,
  addToHistory,
  attackSurfaceActions,
  attackSurfaceState,
  blockingActions,
  blockingState,
  bulkReplayState,
  clearRequests,
  diffActions,
  diffState,
  filterActions,
  filterState,
  historyActions,
  historyState,
  requestActions,
  requestState,
  starringActions,
  starringState,
  state,
  timelineActions,
  timelineState,
  uiState,
  undoRedoState,
};
