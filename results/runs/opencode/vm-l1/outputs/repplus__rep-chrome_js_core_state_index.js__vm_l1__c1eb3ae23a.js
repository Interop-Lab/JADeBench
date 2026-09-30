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
    if (!this.listeners.has(eventName)) this.listeners.set(eventName, []);
    this.listeners.get(eventName).push(listener);
    return listener;
  }

  emit(eventName, data) {
    for (const listener of this.listeners.get(eventName) || []) listener(data);
  }

  off(eventName, listener) {
    const listeners = this.listeners.get(eventName);
    if (!listeners) return;
    this.listeners.set(eventName, listeners.filter((candidate) => candidate !== listener));
  }

  removeAllListeners(eventName) {
    if (eventName === undefined) this.listeners.clear();
    else this.listeners.delete(eventName);
  }

  listenerCount(eventName) {
    return this.listeners.get(eventName)?.length || 0;
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
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

function escapeCsvField(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function arrayToCSV(rows, headers) {
  const columns = headers || (rows.length ? Object.keys(rows[0]) : []);
  return [
    columns.map(escapeCsvField).join(","),
    ...rows.map((row) => columns.map((column) => escapeCsvField(row[column])).join(",")),
  ].join("\n");
}

function downloadBlob(contents, filename, type) {
  const blob = new Blob([contents], { type });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}

function downloadCSV(rows, filename) {
  downloadBlob(arrayToCSV(rows), filename, "text/csv;charset=utf-8;");
}

function downloadJSON(value, filename) {
  downloadBlob(JSON.stringify(value, null, 2), filename, "application/json;charset=utf-8;");
}

async function copyToClipboard(text, successElement) {
  if (window.isSecureContext && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
  showCopySuccess(successElement);
}

function showCopySuccess(element) {
  if (!element) return;
  element.classList.add("copy-success");
  setTimeout(() => element.classList.remove("copy-success"), 1000);
}

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "unknown";
  }
}

function highlightJSON(text) {
  const escaped = escapeHtml(text);
  return escaped.replace(
    /(&quot;(?:\\u[\da-fA-F]{4}|\\[^u]|[^\\&])*&quot;\s*:)|(&quot;(?:\\u[\da-fA-F]{4}|\\[^u]|[^\\&])*&quot;)|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g,
    (match, key, string, literal) => {
      if (key) return `<span class="json-key">${match}</span>`;
      if (string) return `<span class="json-string">${match}</span>`;
      if (literal) return `<span class="json-boolean">${match}</span>`;
      return `<span class="json-number">${match}</span>`;
    },
  );
}

function highlightParams(text) {
  return text.split("&").map((part) => {
    const separator = part.indexOf("=");
    const key = separator < 0 ? part : part.slice(0, separator);
    const value = separator < 0 ? "" : part.slice(separator + 1);
    return `<span class="param-key">${escapeHtml(key)}</span>=<span class="param-value">${escapeHtml(value)}</span>`;
  }).join("&");
}

function highlightCookies(text) {
  return text.split(";").map((part) => {
    const separator = part.indexOf("=");
    const key = separator < 0 ? part : part.slice(0, separator);
    const value = separator < 0 ? "" : part.slice(separator + 1);
    return `<span class="cookie-key">${escapeHtml(key)}</span>=<span class="cookie-value">${escapeHtml(value)}</span>`;
  }).join(";");
}

function highlightHTTP(text) {
  return String(text).split("\n").map((line, index) => {
    if (index === 0 && /^(?:HTTP\/|[A-Z]+\s)/.test(line)) {
      return `<span class="http-start-line">${escapeHtml(line)}</span>`;
    }
    const separator = line.indexOf(":");
    if (separator > 0) {
      return `<span class="http-header-name">${escapeHtml(line.slice(0, separator))}</span>:<span class="http-header-value">${escapeHtml(line.slice(separator + 1))}</span>`;
    }
    const trimmed = line.trim();
    if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
      return highlightJSON(line);
    }
    return escapeHtml(line);
  }).join("\n");
}

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

const requestActions = {
  isDuplicate(left, right) {
    return left?.method === right?.method && left?.url === right?.url && left?.body === right?.body;
  },

  normalizeHeaders(headers) {
    if (!headers) return "";
    if (typeof headers === "string") return headers;
    return Object.entries(headers).map(([name, value]) => `${name}: ${Array.isArray(value) ? value.join(", ") : value}`).join("\n");
  },

  removeDuplicates() {
    const unique = [];
    for (const request of state.requests) {
      if (!unique.some((candidate) => this.isDuplicate(candidate, request))) unique.push(request);
    }
    const removed = state.requests.length - unique.length;
    state.requests = unique;
    console.log(`removeDuplicates: ${unique.length + removed} total, ${unique.length} unique, ${removed} duplicates`);
    return removed;
  },

  add(request) {
    if (localStorage.getItem("rep_remove_duplicates") === "true" && state.requests.some((item) => this.isDuplicate(item, request))) return false;
    state.requests.push(request);
    events.emit(EVENT_NAMES.NETWORK_REQUEST_CAPTURED, request);
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
    return state.requests.length;
  },

  select(request, index) {
    state.selectedRequest = request;
    events.emit(EVENT_NAMES.REQUEST_SELECTED, { request, index });
  },

  clearAll() {
    state.requests = [];
    state.selectedRequest = null;
    events.emit(EVENT_NAMES.STATE_REQUESTS_CLEARED);
    events.emit(EVENT_NAMES.UI_CLEAR_ALL);
  },

  toggleStar(request, index) {
    request.starred = !request.starred;
    events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED, { request, index });
  },

  toggleGroupStar(hostname, method, starred) {
    if (starred) state.starredDomains.add(method);
    else state.starredDomains.delete(method);
    for (const request of state.requests) {
      if (getHostname(request.url) === hostname && request.method === method) request.starred = starred;
    }
    events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED);
  },

  setColor(request, color) {
    request.color = color;
    events.emit(EVENT_NAMES.REQUEST_COLOR_CHANGED, { request, color });
  },

  delete(index) {
    state.requests.splice(index, 1);
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
  },

  deleteGroup(hostname, method) {
    state.requests = state.requests.filter((request) => getHostname(request.url) !== hostname || request.method !== method);
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
  },
};

const filterActions = {
  setFilter(filter) {
    state.currentFilter = filter;
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, { filter });
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
  },
  setSelectedMethods(methods) {
    state.selectedMethods = methods;
    state.currentFilter = "multiple";
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, { methods });
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
  },
  setStarFilter(active) {
    state.starFilterActive = active;
    state.currentFilter = active ? "starred" : "all";
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, { starFilter: active });
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
  },
  setSearch(term) {
    state.currentSearchTerm = term;
    events.emit(EVENT_NAMES.STATE_SEARCH_CHANGED, { term, useRegex: state.useRegex });
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
  },
  setColorFilter(color) {
    state.currentColorFilter = color;
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, { color });
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
  },
};

const starringActions = {
  togglePageStar(page, starred) {
    if (starred) state.starredPages.add(page);
    else state.starredPages.delete(page);
    events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED);
  },
  toggleDomainStar(domain, starred) {
    if (starred) state.starredDomains.add(domain);
    else state.starredDomains.delete(domain);
    events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED);
  },
};

const blockingActions = {
  setBlocking(active) {
    state.blockRequests = active;
    events.emit("block-queue:updated");
  },
  addToBlockedQueue(request) {
    state.blockedQueue.push(request);
    events.emit("block-queue:updated");
  },
  clearBlockedQueue() {
    state.blockedQueue = [];
    events.emit("block-queue:updated");
  },
};

const timelineActions = {
  setFilter(timestamp, requestIndex) {
    state.timelineFilterTimestamp = timestamp;
    state.timelineFilterRequestIndex = requestIndex;
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
  },
  clear() {
    state.timelineFilterTimestamp = null;
    state.timelineFilterRequestIndex = null;
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
  },
};

const historyActions = {
  add(rawText, useHttps) {
    state.requestHistory = state.requestHistory.slice(0, state.historyIndex + 1);
    state.requestHistory.push({ rawText, useHttps });
    state.historyIndex = state.requestHistory.length - 1;
    events.emit(EVENT_NAMES.HISTORY_UPDATED);
    events.emit(EVENT_NAMES.UI_UPDATE_HISTORY_BUTTONS);
  },
  goBack() {
    if (state.historyIndex <= 0) return;
    state.historyIndex -= 1;
    events.emit(EVENT_NAMES.HISTORY_NAVIGATED, state.requestHistory[state.historyIndex]);
  },
  goForward() {
    if (state.historyIndex >= state.requestHistory.length - 1) return;
    state.historyIndex += 1;
    events.emit(EVENT_NAMES.HISTORY_NAVIGATED, state.requestHistory[state.historyIndex]);
  },
};

const diffActions = {
  setBaseline(request) { state.regularRequestBaseline = request; },
  setCurrentResponse(response) { state.currentResponse = response; },
};

const attackSurfaceActions = {
  setCategory(category, value) { state.attackSurfaceCategories[category] = value; },
  markDomain(domain) { state.domainsWithAttackSurface.add(domain); },
  setAnalyzing(active) { state.isAnalyzingAttackSurface = active; },
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

function addToHistory(rawText, useHttps) {
  return historyActions.add(rawText, useHttps);
}

Object.assign(globalThis, {
  requestState, filterState, historyState, undoRedoState, bulkReplayState, diffState,
  starringState, timelineState, uiState, attackSurfaceState, blockingState,
  EventBus, events, EVENT_NAMES, escapeHtml, escapeCsvField, arrayToCSV, downloadCSV,
  downloadJSON, copyToClipboard, showCopySuccess, getHostname, highlightHTTP,
  highlightJSON, highlightParams, highlightCookies, requestActions, filterActions,
  starringActions, blockingActions, timelineActions, historyActions, diffActions,
  attackSurfaceActions, actions, state, addRequest, clearRequests, addToHistory,
});

export {
  actions, addRequest, addToHistory, attackSurfaceActions, attackSurfaceState,
  blockingActions, blockingState, bulkReplayState, clearRequests, diffActions,
  diffState, filterActions, filterState, historyActions, historyState,
  requestActions, requestState, starringActions, starringState, state,
  timelineActions, timelineState, uiState, undoRedoState,
};
