const root = globalThis;

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
    return () => this.off(eventName, listener);
  }

  emit(eventName, data) {
    this.listeners.get(eventName)?.forEach((listener) => listener(data));
  }

  off(eventName, listener) {
    const listeners = this.listeners.get(eventName);
    if (!listeners) return;
    const index = listeners.indexOf(listener);
    if (index !== -1) listeners.splice(index, 1);
  }

  removeAllListeners(eventName) {
    if (eventName) this.listeners.delete(eventName);
    else this.listeners.clear();
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
  if (!text.includes(",") && !text.includes('"') && !text.includes("\n") && !text.includes("\r")) return text;
  return '"' + text.replace(/"/g, '""') + '"';
}

function arrayToCSV(rows, columns) {
  if (!rows?.length) return "";
  const keys = columns || Object.keys(rows[0]);
  const lines = [keys.map(escapeCsvField).join(",")];
  rows.forEach((row) => lines.push(keys.map((key) => escapeCsvField(row[key])).join(",")));
  return lines.join("\n");
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function downloadCSV(rows, filename) {
  downloadBlob(arrayToCSV(rows), filename, "text/csv;charset=utf-8;");
}

function downloadJSON(data, filename) {
  downloadBlob(JSON.stringify(data, null, 2), filename, "application/json;charset=utf-8;");
}

async function copyToClipboard(text, successElement) {
  try {
    if (window.location.protocol === "devtools:" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      await navigator.clipboard.writeText(text);
    }
    showCopySuccess(successElement);
    return true;
  } catch (error) {
    console.error("Failed to copy text:", error);
    return false;
  }
}

function showCopySuccess(element) {
  if (!element) return;
  const original = element.innerHTML;
  element.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#81c995"/></svg>';
  setTimeout(() => { element.innerHTML = original; }, 1500);
}

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "unknown";
  }
}

function highlightJSON(text) {
  try {
    JSON.parse(text);
  } catch {
    return escapeHtml(text);
  }
  return escapeHtml(text).replace(/(&quot;(?:\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\&])*&quot;\s*:|&quot;(?:\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\&])*&quot;|\b(?:true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
    let className = "json-number";
    if (/^&quot;/.test(match)) className = /:$/.test(match) ? "json-key" : "json-string";
    else if (/true|false/.test(match)) className = "json-boolean";
    else if (/null/.test(match)) className = "json-null";
    return '<span class="' + className + '">' + match + "</span>";
  });
}

function highlightParams(value) {
  const text = value.trim();
  if (text.startsWith("<")) return escapeHtml(value);
  if (!text.includes("=")) return escapeHtml(value);
  return text.split("&").map((part) => {
    const index = part.indexOf("=");
    if (index < 0) return escapeHtml(part);
    return '<span class="param-name">' + escapeHtml(part.slice(0, index)) + '</span>=<span class="param-value">' + escapeHtml(part.slice(index + 1)) + "</span>";
  }).join("&");
}

function highlightCookies(value) {
  return value.split(";").map((part) => highlightParams(part.trim())).join("; ");
}

function highlightHTTP(text) {
  return text.split("\n").map((line, index) => {
    if (index === 0 || line.toUpperCase().startsWith("HTTP/")) return escapeHtml(line);
    const colon = line.indexOf(":");
    if (colon < 0) return escapeHtml(line);
    const name = line.slice(0, colon);
    const value = line.slice(colon + 1);
    const highlighted = name.toLowerCase() === "cookie" ? highlightCookies(value) : escapeHtml(value);
    return '<span class="http-header-name">' + escapeHtml(name) + '</span><span class="http-colon">:</span><span class="http-header-value">' + highlighted + "</span>";
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

function normalizeHeaders(headers) {
  if (!headers || typeof headers !== "object") return "";
  const entries = Array.isArray(headers)
    ? headers.map((header) => [header?.name, header?.value])
    : Object.entries(headers);
  return entries
    .filter(([name]) => typeof name === "string")
    .map(([name, value]) => name.toLowerCase().trim() + ":" + String(value ?? "").trim())
    .sort()
    .join("|");
}

function requestSignature(entry) {
  const request = entry?.request || entry || {};
  return [
    String(request.method || "GET").toUpperCase().trim(),
    String(request.url || "").trim(),
    String(request.postData?.text || ""),
    normalizeHeaders(request.headers),
    String(entry?.pageUrl || entry?.page || ""),
  ].join("|");
}

const requestActions = {
  isDuplicate(first, second) {
    return requestSignature(first) === requestSignature(second);
  },

  normalizeHeaders,

  removeDuplicates() {
    if (!state.requests.length) return;
    const seen = new Set();
    const unique = [];
    for (const request of state.requests) {
      const signature = requestSignature(request);
      if (!seen.has(signature)) {
        seen.add(signature);
        unique.push(request);
      }
    }
    const removed = state.requests.length - unique.length;
    state.requests = unique;
    if (state.selectedRequest && !unique.includes(state.selectedRequest)) state.selectedRequest = null;
    if (removed) {
      const list = typeof document !== "undefined" && document.getElementById("request-list");
      if (list) list.innerHTML = "";
      events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
    }
  },

  add(request) {
    request.starred = request.starred || false;
    request.color = request.color || null;
    request.name = typeof request.name === "string" ? request.name : null;
    const removeDuplicates = typeof localStorage === "undefined" || localStorage.getItem("rep_remove_duplicates") !== "false";
    if (removeDuplicates && state.requests.some((existing) => this.isDuplicate(existing, request))) return -1;
    state.requests.push(request);
    const index = state.requests.length - 1;
    events.emit(EVENT_NAMES.REQUEST_RENDERED, { request, index });
    return index;
  },

  select(request, index) {
    state.selectedRequest = request;
    events.emit(EVENT_NAMES.REQUEST_SELECTED, { request, index });
  },

  clearAll() {
    state.requests.length = 0;
    state.selectedRequest = null;
    state.requestHistory.length = 0;
    state.historyIndex = -1;
    state.regularRequestBaseline = null;
    state.currentResponse = null;
    state.timelineFilterTimestamp = null;
    state.timelineFilterRequestIndex = null;
    state.attackSurfaceCategories = {};
    state.domainsWithAttackSurface.clear();
    events.emit(EVENT_NAMES.STATE_REQUESTS_CLEARED);
    events.emit(EVENT_NAMES.UI_CLEAR_ALL);
  },

  toggleStar(request, index) {
    request.starred = !request.starred;
    events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED, { request, index });
    if (state.starFilterActive) {
      const list = typeof document !== "undefined" && document.getElementById("request-list");
      const scrollTop = list?.scrollTop || 0;
      events.emit(EVENT_NAMES.REQUEST_FILTERED, { preserveScroll: true });
      if (list) list.scrollTop = scrollTop;
    }
  },

  toggleGroupStar(page, domain, starred) {
    if (page) starred ? state.starredPages.add(page) : state.starredPages.delete(page);
    if (domain) starred ? state.starredDomains.add(domain) : state.starredDomains.delete(domain);
    state.requests.forEach((entry) => {
      const entryPage = entry.page || entry.pageUrl;
      const entryDomain = getHostname(entry.request?.url || entry.url || "");
      if ((page && entryPage === page) || (domain && entryDomain === domain)) entry.starred = starred;
    });
    events.emit(EVENT_NAMES.REQUEST_FILTERED);
  },

  setColor(index, color) {
    if (index < 0 || index >= state.requests.length) return;
    state.requests[index].color = color;
    events.emit(EVENT_NAMES.REQUEST_COLOR_CHANGED, { index, color });
  },

  delete(index) {
    if (index < 0 || index >= state.requests.length) return;
    const [removed] = state.requests.splice(index, 1);
    if (state.selectedRequest === removed) {
      state.selectedRequest = null;
      events.emit(EVENT_NAMES.REQUEST_SELECTED, { request: null, index: -1 });
    }
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
  },

  deleteGroup(page, domain) {
    const removed = state.requests.filter((entry) => {
      const entryPage = entry.page || entry.pageUrl;
      const entryDomain = getHostname(entry.request?.url || entry.url || "");
      return (page && entryPage === page) || (domain && entryDomain === domain);
    });
    state.requests = state.requests.filter((entry) => !removed.includes(entry));
    state.blockedQueue = state.blockedQueue.filter((entry) => !removed.includes(entry));
    if (page) state.starredPages.delete(page);
    if (domain) state.starredDomains.delete(domain);
    state.domainsWithAttackSurface.delete(domain);
    if (domain) {
      Object.keys(state.attackSurfaceCategories).forEach((key) => {
        if (key.includes(domain)) delete state.attackSurfaceCategories[key];
      });
    }
    if (removed.includes(state.selectedRequest)) state.selectedRequest = null;
    events.emit(EVENT_NAMES.REQUEST_FILTERED);
    events.emit(EVENT_NAMES.UI_CLEAR_ALL);
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
    state.currentFilter = methods.size === 0 ? "all" : methods.size === 1 ? Array.from(methods)[0] : "multiple";
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, { methods: Array.from(methods) });
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
  },
  setStarFilter(active) {
    state.starFilterActive = active;
    state.currentFilter = active ? "starred" : "all";
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, { starFilter: active });
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
  },
  setSearch(term, useRegex = false) {
    state.currentSearchTerm = term;
    state.useRegex = useRegex;
    events.emit(EVENT_NAMES.STATE_SEARCH_CHANGED, { term, useRegex });
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
    starred ? state.starredPages.add(page) : state.starredPages.delete(page);
    events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED);
  },
  toggleDomainStar(domain, starred) {
    starred ? state.starredDomains.add(domain) : state.starredDomains.delete(domain);
    events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED);
  },
};

const blockingActions = {
  setBlocking(blocked) {
    state.blockRequests = blocked;
    if (!blocked) state.blockedQueue = [];
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
    if (state.historyIndex < state.requestHistory.length - 1) state.requestHistory = state.requestHistory.slice(0, state.historyIndex + 1);
    state.requestHistory.push({ rawText, useHttps });
    state.historyIndex = state.requestHistory.length - 1;
    events.emit(EVENT_NAMES.HISTORY_UPDATED);
    events.emit(EVENT_NAMES.UI_UPDATE_HISTORY_BUTTONS);
  },
  goBack() {
    if (state.historyIndex <= 0) return;
    state.historyIndex--;
    events.emit(EVENT_NAMES.HISTORY_NAVIGATED, { index: state.historyIndex, entry: state.requestHistory[state.historyIndex] });
    events.emit(EVENT_NAMES.UI_UPDATE_HISTORY_BUTTONS);
  },
  goForward() {
    if (state.historyIndex >= state.requestHistory.length - 1) return;
    state.historyIndex++;
    events.emit(EVENT_NAMES.HISTORY_NAVIGATED, { index: state.historyIndex, entry: state.requestHistory[state.historyIndex] });
    events.emit(EVENT_NAMES.UI_UPDATE_HISTORY_BUTTONS);
  },
};

const diffActions = {
  setBaseline(response) { state.regularRequestBaseline = response; },
  setCurrentResponse(response) { state.currentResponse = response; },
};

const attackSurfaceActions = {
  setCategory(category, value) { state.attackSurfaceCategories[category] = value; },
  markDomain(domain) { state.domainsWithAttackSurface.add(domain); },
  setAnalyzing(analyzing) { state.isAnalyzingAttackSurface = analyzing; },
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

function addRequest(request) { return requestActions.add(request); }
function clearRequests() { return requestActions.clearAll(); }
function addToHistory(rawText, useHttps) { return historyActions.add(rawText, useHttps); }

Object.assign(root, {
  requestState, filterState, historyState, undoRedoState, bulkReplayState, diffState,
  starringState, timelineState, uiState, attackSurfaceState, blockingState,
  EventBus, events, EVENT_NAMES, escapeHtml, escapeCsvField, arrayToCSV, downloadCSV,
  downloadJSON, copyToClipboard, showCopySuccess, getHostname, highlightHTTP, highlightJSON,
  highlightParams, highlightCookies, requestActions, filterActions, starringActions,
  blockingActions, timelineActions, historyActions, diffActions, attackSurfaceActions,
  actions, state, addRequest, clearRequests, addToHistory,
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
