const requestState = {
  requests: [],
  selectedRequest: null,
};

const filterState = {
  currentFilter: "all",
  selectedMethods: new Set(),
  starFilterActive: false,
  currentColorFilter: "all",
  currentSearchTerm: "",
  useRegex: false,
};

const historyState = {
  requestHistory: [],
  historyIndex: -1,
};

const undoRedoState = {
  undoStack: [],
  redoStack: [],
};

const bulkReplayState = {
  positionConfigs: [],
  currentAttackType: "sniper",
  shouldStopBulk: false,
  shouldPauseBulk: false,
};

const diffState = {
  regularRequestBaseline: null,
  currentResponse: null,
};

const starringState = {
  starredPages: new Set(),
  starredDomains: new Set(),
};

const timelineState = {
  timelineFilterTimestamp: null,
  timelineFilterRequestIndex: null,
};

const uiState = {
  manuallyCollapsed: false,
};

const attackSurfaceState = {
  attackSurfaceCategories: {},
  domainsWithAttackSurface: new Set(),
  isAnalyzingAttackSurface: false,
};

const blockingState = {
  blockRequests: false,
  blockedQueue: [],
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

const EVENT_NAMES = Object.freeze({
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
});

class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(eventName, listener) {
    if (!this.listeners.has(eventName)) this.listeners.set(eventName, new Set());
    this.listeners.get(eventName).add(listener);
    return () => this.off(eventName, listener);
  }

  emit(eventName, ...args) {
    for (const listener of this.listeners.get(eventName) ?? []) listener(...args);
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

function setState(slice, property, value) {
  slice[property] = value;
  state[property] = value;
}

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = String(value);
  return element.innerHTML;
}

function escapeCsvField(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function arrayToCSV(rows, columns) {
  const headers = columns ?? Object.keys(rows[0] ?? {});
  return [
    headers.map(escapeCsvField).join(","),
    ...rows.map((row) => headers.map((header) => escapeCsvField(row[header])).join(",")),
  ].join("\n");
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadCSV(rows, filename = "requests.csv") {
  downloadFile(arrayToCSV(rows), filename, "text/csv;charset=utf-8");
}

function downloadJSON(value, filename = "requests.json") {
  downloadFile(JSON.stringify(value, null, 2), filename, "application/json;charset=utf-8");
}

async function copyToClipboard(text, button) {
  await navigator.clipboard.writeText(String(text));
  if (button) showCopySuccess(button);
}

function showCopySuccess(button) {
  const originalText = button.textContent;
  button.textContent = "Copied!";
  setTimeout(() => {
    button.textContent = originalText;
  }, 2000);
}

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "unknown";
  }
}

function highlightJSON(json) {
  const source = typeof json === "string" ? json : JSON.stringify(json, null, 2);
  return escapeHtml(source).replace(
    /("(?:\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"\s*:)|("(?:\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*")|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g,
    (token, key, string, literal) => {
      const className = key ? "json-key" : string ? "json-string" : literal === "null" ? "json-null" : literal ? "json-boolean" : "json-number";
      return `<span class="${className}">${token}</span>`;
    },
  );
}

function highlightPairs(text, keyClass, valueClass, separator) {
  return String(text).split(separator).map((part) => {
    const equals = part.indexOf("=");
    if (equals < 0) return escapeHtml(part);
    return `<span class="${keyClass}">${escapeHtml(part.slice(0, equals))}</span>=<span class="${valueClass}">${escapeHtml(part.slice(equals + 1))}</span>`;
  }).join(separator);
}

function highlightParams(params) {
  return highlightPairs(params, "param-key", "param-value", "&");
}

function highlightCookies(cookies) {
  return highlightPairs(cookies, "cookie-key", "cookie-value", ";");
}

function highlightHTTP(http) {
  const [head, ...body] = String(http).split("\n\n");
  const lines = head.split("\n");
  const requestLine = lines.shift()?.replace(/^(\S+)\s+(\S+)(\s+HTTP\/\S+)$/, '<span class="http-method">$1</span> <span class="http-path">$2</span><span class="http-version">$3</span>') ?? "";
  const headers = lines.map((line) => line.replace(/^([^:]+)(:)(.*)$/, '<span class="http-header-name">$1</span><span class="http-colon">$2</span><span class="http-header-value">$3</span>'));
  return escapeHtml([requestLine, ...headers, body.length ? `\n${body.join("\n\n")}` : ""].join("\n"))
    .replace(/&lt;span class=(?:&quot;|\")([^&\"]+)(?:&quot;|\")&gt;/g, '<span class="$1">')
    .replace(/&lt;\/span&gt;/g, "</span>");
}

const requestActions = {
  isDuplicate(candidate, existing) {
    return candidate.id !== undefined && candidate.id === existing.id;
  },

  normalizeHeaders(headers = {}) {
    return Object.entries(headers).map(([name, value]) => `${name.toLowerCase()}:${value}`).join("|");
  },

  removeDuplicates() {
    const unique = requestState.requests.filter((request, index, requests) => requests.findIndex((other) => this.isDuplicate(request, other)) === index);
    requestState.requests.splice(0, requestState.requests.length, ...unique);
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST, null);
    return unique;
  },

  add(request) {
    request.starred ??= false;
    request.color ??= null;
    request.name ??= null;
    requestState.requests.push(request);
    const index = requestState.requests.length - 1;
    events.emit(EVENT_NAMES.REQUEST_RENDERED, { request, index });
    return index;
  },

  select(request, index) {
    setState(requestState, "selectedRequest", request);
    events.emit(EVENT_NAMES.REQUEST_SELECTED, { request, index });
  },

  clearAll() {
    requestState.requests.length = 0;
    setState(requestState, "selectedRequest", null);
    historyState.requestHistory.length = 0;
    setState(historyState, "historyIndex", -1);
    setState(diffState, "regularRequestBaseline", null);
    setState(diffState, "currentResponse", null);
    for (const category of Object.keys(attackSurfaceState.attackSurfaceCategories)) delete attackSurfaceState.attackSurfaceCategories[category];
    attackSurfaceState.domainsWithAttackSurface.clear();
    events.emit(EVENT_NAMES.STATE_REQUESTS_CLEARED, null);
    events.emit(EVENT_NAMES.UI_CLEAR_ALL, null);
  },

  toggleStar(request, index) {
    request.starred = !request.starred;
    events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED, { request, index });
    events.emit(EVENT_NAMES.REQUEST_FILTERED, { preserveScroll: true, scrollTop: 0 });
  },

  toggleGroupStar(hostname, path, starred) {
    for (const request of requestState.requests) {
      if (getHostname(request.url) === hostname && (!path || new URL(request.url).pathname.startsWith(path))) request.starred = starred;
    }
    events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED, { hostname, path, starred });
  },

  setColor(index, color) {
    const request = requestState.requests[index];
    if (request) request.color = color;
    events.emit(EVENT_NAMES.REQUEST_COLOR_CHANGED, { index, color });
  },

  delete(index) {
    requestState.requests.splice(index, 1);
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST, null);
  },

  deleteGroup(hostname, path) {
    const retained = requestState.requests.filter((request) => getHostname(request.url) !== hostname || (path && !new URL(request.url).pathname.startsWith(path)));
    requestState.requests.splice(0, requestState.requests.length, ...retained);
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST, null);
  },
};

const filterActions = {
  setFilter(filter) {
    setState(filterState, "currentFilter", filter);
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, { filter });
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST, null);
  },
  setSelectedMethods(methods) {
    const selectedMethods = new Set(methods);
    setState(filterState, "selectedMethods", selectedMethods);
    setState(filterState, "currentFilter", "multiple");
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, { methods: selectedMethods });
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST, null);
  },
  setStarFilter(active) {
    setState(filterState, "starFilterActive", active);
    setState(filterState, "currentFilter", "starred");
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, { starFilter: active });
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST, null);
  },
  setSearch(term, useRegex = filterState.useRegex) {
    setState(filterState, "currentSearchTerm", term);
    setState(filterState, "useRegex", useRegex);
    events.emit(EVENT_NAMES.STATE_SEARCH_CHANGED, { term, useRegex });
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST, null);
  },
  setColorFilter(color) {
    setState(filterState, "currentColorFilter", color);
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, { color });
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST, null);
  },
};

const starringActions = {
  togglePageStar(page, starred = !starringState.starredPages.has(page)) {
    if (starred) starringState.starredPages.add(page);
    else starringState.starredPages.delete(page);
    events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED, null);
  },
  toggleDomainStar(domain, starred = !starringState.starredDomains.has(domain)) {
    if (starred) starringState.starredDomains.add(domain);
    else starringState.starredDomains.delete(domain);
    events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED, null);
  },
};

const blockingActions = {
  setBlocking(blockRequests) {
    setState(blockingState, "blockRequests", blockRequests);
  },
  addToBlockedQueue(request) {
    blockingState.blockedQueue.push(request);
  },
  clearBlockedQueue() {
    blockingState.blockedQueue.length = 0;
  },
};

const timelineActions = {
  setFilter(timestamp, requestIndex) {
    setState(timelineState, "timelineFilterTimestamp", timestamp);
    setState(timelineState, "timelineFilterRequestIndex", requestIndex);
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST, null);
  },
  clear() {
    setState(timelineState, "timelineFilterTimestamp", null);
    setState(timelineState, "timelineFilterRequestIndex", null);
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST, null);
  },
};

const historyActions = {
  add(rawText, useHttps) {
    if (historyState.historyIndex < historyState.requestHistory.length - 1) historyState.requestHistory.splice(historyState.historyIndex + 1);
    historyState.requestHistory.push({ rawText, useHttps });
    setState(historyState, "historyIndex", historyState.requestHistory.length - 1);
    events.emit(EVENT_NAMES.HISTORY_UPDATED, null);
    events.emit(EVENT_NAMES.UI_UPDATE_HISTORY_BUTTONS, null);
  },
  goBack() {
    if (historyState.historyIndex <= 0) return;
    setState(historyState, "historyIndex", historyState.historyIndex - 1);
    const entry = historyState.requestHistory[historyState.historyIndex];
    events.emit(EVENT_NAMES.HISTORY_NAVIGATED, entry, historyState.historyIndex);
    return entry;
  },
  goForward() {
    if (historyState.historyIndex >= historyState.requestHistory.length - 1) return;
    setState(historyState, "historyIndex", historyState.historyIndex + 1);
    const entry = historyState.requestHistory[historyState.historyIndex];
    events.emit(EVENT_NAMES.HISTORY_NAVIGATED, entry, historyState.historyIndex);
    return entry;
  },
};

const diffActions = {
  setBaseline(response) {
    setState(diffState, "regularRequestBaseline", response);
  },
  setCurrentResponse(response) {
    setState(diffState, "currentResponse", response);
  },
};

const attackSurfaceActions = {
  setCategory(category, value) {
    attackSurfaceState.attackSurfaceCategories[category] = value;
  },
  markDomain(domain) {
    attackSurfaceState.domainsWithAttackSurface.add(domain);
  },
  setAnalyzing(isAnalyzing) {
    setState(attackSurfaceState, "isAnalyzingAttackSurface", isAnalyzing);
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

function addRequest(request) {
  return requestActions.add(request);
}

function clearRequests() {
  return requestActions.clearAll();
}

function addToHistory(request, content) {
  return historyActions.add(request, content);
}

Object.assign(globalThis, {
  EventBus,
  events,
  EVENT_NAMES,
  escapeHtml,
  escapeCsvField,
  arrayToCSV,
  downloadCSV,
  downloadJSON,
  copyToClipboard,
  showCopySuccess,
  getHostname,
  highlightHTTP,
  highlightJSON,
  highlightParams,
  highlightCookies,
  requestState,
  filterState,
  historyState,
  undoRedoState,
  bulkReplayState,
  diffState,
  starringState,
  timelineState,
  uiState,
  attackSurfaceState,
  blockingState,
  requestActions,
  filterActions,
  starringActions,
  blockingActions,
  timelineActions,
  historyActions,
  diffActions,
  attackSurfaceActions,
  actions,
  state,
  addRequest,
  clearRequests,
  addToHistory,
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
