const requestState = {
  requests: [],
  selectedRequest: null
};

const filterState = {
  currentFilter: "all",
  selectedMethods: new Set(),
  starFilterActive: false,
  currentColorFilter: "all",
  currentSearchTerm: "",
  useRegex: false
};

const historyState = {
  requestHistory: [],
  historyIndex: -1
};

const undoRedoState = {
  undoStack: [],
  redoStack: []
};

const bulkReplayState = {
  positionConfigs: [],
  currentAttackType: "sniper",
  shouldStopBulk: false,
  shouldPauseBulk: false
};

const diffState = {
  regularRequestBaseline: null,
  currentResponse: null
};

const starringState = {
  starredPages: new Set(),
  starredDomains: new Set()
};

const timelineState = {
  timelineFilterTimestamp: null,
  timelineFilterRequestIndex: null
};

const uiState = {
  manuallyCollapsed: false
};

const attackSurfaceState = {
  attackSurfaceCategories: {},
  domainsWithAttackSurface: new Set(),
  isAnalyzingAttackSurface: false
};

const blockingState = {
  blockRequests: false,
  blockedQueue: []
};

class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(eventName, listener) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(listener);
    return () => this.off(eventName, listener);
  }

  off(eventName, listener) {
    const listeners = this.listeners.get(eventName);
    if (!listeners) {
      return false;
    }

    const removed = listeners.delete(listener);
    if (listeners.size === 0) {
      this.listeners.delete(eventName);
    }
    return removed;
  }

  once(eventName, listener) {
    const wrapper = (...args) => {
      this.off(eventName, wrapper);
      return listener(...args);
    };
    return this.on(eventName, wrapper);
  }

  emit(eventName, ...args) {
    const listeners = this.listeners.get(eventName);
    if (!listeners) {
      return false;
    }

    for (const listener of [...listeners]) {
      listener(...args);
    }
    return true;
  }

  removeAllListeners(eventName) {
    if (eventName === undefined) {
      this.listeners.clear();
    } else {
      this.listeners.delete(eventName);
    }
  }

  listenerCount(eventName) {
    return this.listeners.get(eventName)?.size || 0;
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
  REQUESTS_IMPORTED: "requests:imported"
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
  if (value === null || value === undefined) {
    return "";
  }

  let text = typeof value === "object"
    ? JSON.stringify(value)
    : String(value);

  if (/[",\r\n]/.test(text)) {
    text = `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function arrayToCSV(rows, columns) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "";
  }

  const headers = columns
    ? columns.map(column =>
        typeof column === "string"
          ? { key: column, label: column }
          : column
      )
    : Object.keys(rows[0]).map(key => ({ key, label: key }));

  const lines = [
    headers.map(header => escapeCsvField(header.label ?? header.key)).join(",")
  ];

  for (const row of rows) {
    lines.push(
      headers
        .map(header => escapeCsvField(row?.[header.key]))
        .join(",")
    );
  }

  return lines.join("\n");
}

function downloadBlob(content, filename, type) {
  const blob = content instanceof Blob
    ? content
    : new Blob([content], { type });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function downloadCSV(rows, filename = "requests.csv") {
  const csv = Array.isArray(rows) ? arrayToCSV(rows) : String(rows);
  downloadBlob(csv, filename, "text/csv;charset=utf-8");
  events.emit(EVENT_NAMES.REQUESTS_EXPORTED, {
    format: "csv",
    filename
  });
}

function downloadJSON(value, filename = "requests.json") {
  const json = JSON.stringify(value, null, 2);
  downloadBlob(json, filename, "application/json;charset=utf-8");
  events.emit(EVENT_NAMES.REQUESTS_EXPORTED, {
    format: "json",
    filename
  });
}

async function copyToClipboard(value, successElement) {
  const text = String(value ?? "");

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  } else {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();

    if (!copied) {
      throw new Error("Unable to copy text to clipboard");
    }
  }

  if (successElement) {
    showCopySuccess(successElement);
  }
}

function showCopySuccess(element) {
  if (!element) {
    return;
  }

  const originalText = element.textContent;
  element.textContent = "Copied!";
  element.classList?.add("copy-success");

  setTimeout(() => {
    element.textContent = originalText;
    element.classList?.remove("copy-success");
  }, 1500);
}

function getHostname(value) {
  try {
    return new URL(value, globalThis.location?.href).hostname;
  } catch {
    return "";
  }
}

function highlightHTTP(value) {
  const escaped = escapeHtml(value);
  return escaped
    .replace(
      /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|CONNECT|TRACE)(\s+\S+\s+HTTP\/\d(?:\.\d)?)/gm,
      '<span class="http-method">$1</span><span class="http-request-line">$2</span>'
    )
    .replace(
      /^(HTTP\/\d(?:\.\d)?\s+)(\d{3})(.*)$/gm,
      '$1<span class="http-status">$2</span>$3'
    )
    .replace(
      /^([A-Za-z0-9!#$%&'*+.^_`|~-]+)(:\s*)(.*)$/gm,
      '<span class="http-header-name">$1</span>$2<span class="http-header-value">$3</span>'
    );
}

function highlightJSON(value) {
  let text;

  try {
    text = typeof value === "string"
      ? JSON.stringify(JSON.parse(value), null, 2)
      : JSON.stringify(value, null, 2);
  } catch {
    return escapeHtml(value);
  }

  return escapeHtml(text).replace(
    /(&quot;(?:\\.|[^\\])*?&quot;)(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (match, stringValue, colon, literal, number) => {
      if (stringValue) {
        const className = colon ? "json-key" : "json-string";
        return `<span class="${className}">${stringValue}</span>${colon || ""}`;
      }
      if (literal) {
        return `<span class="json-${literal === "null" ? "null" : "boolean"}">${literal}</span>`;
      }
      return `<span class="json-number">${number}</span>`;
    }
  );
}

function highlightParams(value) {
  const text = typeof value === "string"
    ? value
    : new URLSearchParams(value).toString();

  return text
    .split("&")
    .map(part => {
      const separator = part.indexOf("=");
      if (separator < 0) {
        return `<span class="param-key">${escapeHtml(part)}</span>`;
      }

      const key = part.slice(0, separator);
      const parameterValue = part.slice(separator + 1);
      return `<span class="param-key">${escapeHtml(key)}</span>=` +
        `<span class="param-value">${escapeHtml(parameterValue)}</span>`;
    })
    .join("&amp;");
}

function highlightCookies(value) {
  return String(value ?? "")
    .split(";")
    .map(cookie => {
      const trimmed = cookie.trim();
      const separator = trimmed.indexOf("=");

      if (separator < 0) {
        return `<span class="cookie-name">${escapeHtml(trimmed)}</span>`;
      }

      const name = trimmed.slice(0, separator);
      const cookieValue = trimmed.slice(separator + 1);
      return `<span class="cookie-name">${escapeHtml(name)}</span>=` +
        `<span class="cookie-value">${escapeHtml(cookieValue)}</span>`;
    })
    .join("; ");
}

function normalizeHeadersObject(headers) {
  if (!headers) {
    return {};
  }

  const result = {};

  if (headers instanceof Headers) {
    for (const [name, value] of headers) {
      result[name.toLowerCase()] = value;
    }
    return result;
  }

  if (Array.isArray(headers)) {
    for (const entry of headers) {
      if (Array.isArray(entry)) {
        result[String(entry[0]).toLowerCase()] = entry[1];
      } else if (entry && typeof entry === "object") {
        const name = entry.name ?? entry.key;
        if (name !== undefined) {
          result[String(name).toLowerCase()] = entry.value;
        }
      }
    }
    return result;
  }

  for (const [name, value] of Object.entries(headers)) {
    result[name.toLowerCase()] = value;
  }
  return result;
}

function resolveRequest(requestOrIndex) {
  if (typeof requestOrIndex === "number") {
    return requestState.requests[requestOrIndex] ?? null;
  }
  return requestOrIndex ?? null;
}

function sameRequest(first, second) {
  if (!first || !second) {
    return false;
  }

  const firstMethod = String(first.method || "GET").toUpperCase();
  const secondMethod = String(second.method || "GET").toUpperCase();
  const firstUrl = first.url ?? first.request?.url ?? "";
  const secondUrl = second.url ?? second.request?.url ?? "";
  const firstBody = first.body ?? first.postData ?? first.request?.body ?? "";
  const secondBody = second.body ?? second.postData ?? second.request?.body ?? "";

  return firstMethod === secondMethod &&
    firstUrl === secondUrl &&
    firstBody === secondBody;
}

const requestActions = {
  isDuplicate(request, candidate) {
    if (candidate !== undefined) {
      return sameRequest(request, candidate);
    }
    return requestState.requests.some(existing => sameRequest(existing, request));
  },

  normalizeHeaders(headers) {
    return normalizeHeadersObject(headers);
  },

  removeDuplicates() {
    const unique = [];

    for (const request of requestState.requests) {
      if (!unique.some(existing => sameRequest(existing, request))) {
        unique.push(request);
      }
    }

    requestState.requests.splice(0, requestState.requests.length, ...unique);

    if (
      requestState.selectedRequest &&
      !requestState.requests.includes(requestState.selectedRequest)
    ) {
      requestState.selectedRequest = null;
    }

    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST, requestState.requests);
    return requestState.requests;
  },

  add(request) {
    if (!request || this.isDuplicate(request)) {
      return false;
    }

    requestState.requests.push(request);
    events.emit(EVENT_NAMES.NETWORK_REQUEST_CAPTURED, request);
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST, requestState.requests);
    return request;
  },

  select(requestOrIndex, emitUiEvent = true) {
    const request = resolveRequest(requestOrIndex);
    requestState.selectedRequest = request;

    events.emit(EVENT_NAMES.REQUEST_SELECTED, request);
    if (emitUiEvent) {
      events.emit(EVENT_NAMES.UI_REQUEST_SELECTED, request);
    }
    return request;
  },

  clearAll() {
    requestState.requests.length = 0;
    requestState.selectedRequest = null;
    events.emit(EVENT_NAMES.STATE_REQUESTS_CLEARED);
    events.emit(EVENT_NAMES.UI_CLEAR_ALL);
  },

  toggleStar(requestOrIndex, starred) {
    const request = resolveRequest(requestOrIndex);
    if (!request) {
      return false;
    }

    request.starred = starred === undefined ? !request.starred : Boolean(starred);
    events.emit(EVENT_NAMES.REQUEST_STARRED, request);
    events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED, request);
    return request.starred;
  },

  toggleGroupStar(group, groupValue, starred) {
    let requests;

    if (Array.isArray(group)) {
      requests = group;
      starred = groupValue;
    } else {
      requests = requestState.requests.filter(request =>
        request[group] === groupValue
      );
    }

    const nextValue = starred === undefined
      ? !requests.every(request => request.starred)
      : Boolean(starred);

    for (const request of requests) {
      request.starred = nextValue;
    }

    events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED, requests);
    return nextValue;
  },

  setColor(requestOrIndex, color) {
    const request = resolveRequest(requestOrIndex);
    if (!request) {
      return false;
    }

    request.color = color;
    events.emit(EVENT_NAMES.REQUEST_COLOR_CHANGED, request);
    return color;
  },

  delete(requestOrIndex) {
    const request = resolveRequest(requestOrIndex);
    const index = requestState.requests.indexOf(request);

    if (index < 0) {
      return false;
    }

    requestState.requests.splice(index, 1);
    if (requestState.selectedRequest === request) {
      requestState.selectedRequest = null;
    }

    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST, requestState.requests);
    return true;
  },

  deleteGroup(group, groupValue) {
    const removed = [];

    for (let index = requestState.requests.length - 1; index >= 0; index--) {
      const request = requestState.requests[index];
      if (request[group] === groupValue) {
        removed.push(...requestState.requests.splice(index, 1));
      }
    }

    if (removed.includes(requestState.selectedRequest)) {
      requestState.selectedRequest = null;
    }

    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST, requestState.requests);
    return removed;
  }
};

const filterActions = {
  setFilter(filter) {
    filterState.currentFilter = filter;
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, filterState);
    return filter;
  },

  setSelectedMethods(methods) {
    filterState.selectedMethods = methods instanceof Set
      ? new Set(methods)
      : new Set(methods || []);
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, filterState);
    return filterState.selectedMethods;
  },

  setStarFilter(active) {
    filterState.starFilterActive = Boolean(active);
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, filterState);
    return filterState.starFilterActive;
  },

  setSearch(search) {
    filterState.currentSearchTerm = String(search ?? "");
    events.emit(EVENT_NAMES.STATE_SEARCH_CHANGED, filterState.currentSearchTerm);
    return filterState.currentSearchTerm;
  },

  setColorFilter(color) {
    filterState.currentColorFilter = color;
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, filterState);
    return color;
  }
};

const starringActions = {
  togglePageStar(page, starred) {
    const nextValue = starred === undefined
      ? !starringState.starredPages.has(page)
      : Boolean(starred);

    if (nextValue) {
      starringState.starredPages.add(page);
    } else {
      starringState.starredPages.delete(page);
    }

    events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED, {
      type: "page",
      value: page,
      starred: nextValue
    });
    return nextValue;
  },

  toggleDomainStar(domain, starred) {
    const nextValue = starred === undefined
      ? !starringState.starredDomains.has(domain)
      : Boolean(starred);

    if (nextValue) {
      starringState.starredDomains.add(domain);
    } else {
      starringState.starredDomains.delete(domain);
    }

    events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED, {
      type: "domain",
      value: domain,
      starred: nextValue
    });
    return nextValue;
  }
};

const blockingActions = {
  setBlocking(enabled) {
    blockingState.blockRequests = Boolean(enabled);
    return blockingState.blockRequests;
  },

  addToBlockedQueue(request) {
    blockingState.blockedQueue.push(request);
    return request;
  },

  clearBlockedQueue() {
    blockingState.blockedQueue.length = 0;
  }
};

const timelineActions = {
  setFilter(timestamp, requestIndex) {
    timelineState.timelineFilterTimestamp = timestamp;
    timelineState.timelineFilterRequestIndex = requestIndex;
    events.emit(EVENT_NAMES.REQUEST_ACTION_TIMELINE, {
      timestamp,
      requestIndex
    });
  },

  clear() {
    timelineState.timelineFilterTimestamp = null;
    timelineState.timelineFilterRequestIndex = null;
  }
};

const historyActions = {
  add(request, content) {
    if (historyState.historyIndex < historyState.requestHistory.length - 1) {
      historyState.requestHistory.splice(historyState.historyIndex + 1);
    }

    const entry = content === undefined ? request : { request, content };
    historyState.requestHistory.push(entry);
    historyState.historyIndex = historyState.requestHistory.length - 1;
    events.emit(EVENT_NAMES.HISTORY_UPDATED, historyState);
    return entry;
  },

  goBack() {
    if (historyState.historyIndex <= 0) {
      return null;
    }

    historyState.historyIndex--;
    const entry = historyState.requestHistory[historyState.historyIndex];
    events.emit(EVENT_NAMES.HISTORY_NAVIGATED, entry, historyState.historyIndex);
    return entry;
  },

  goForward() {
    if (historyState.historyIndex >= historyState.requestHistory.length - 1) {
      return null;
    }

    historyState.historyIndex++;
    const entry = historyState.requestHistory[historyState.historyIndex];
    events.emit(EVENT_NAMES.HISTORY_NAVIGATED, entry, historyState.historyIndex);
    return entry;
  }
};

const diffActions = {
  setBaseline(response) {
    diffState.regularRequestBaseline = response;
    return response;
  },

  setCurrentResponse(response) {
    diffState.currentResponse = response;
    return response;
  }
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
    attackSurfaceState.isAnalyzingAttackSurface = Boolean(analyzing);
    return attackSurfaceState.isAnalyzingAttackSurface;
  }
};

const actions = {
  request: requestActions,
  filter: filterActions,
  starring: starringActions,
  blocking: blockingActions,
  timeline: timelineActions,
  history: historyActions,
  diff: diffActions,
  attackSurface: attackSurfaceActions
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
  ...blockingState
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
  addRequest,
  clearRequests,
  addToHistory,
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
  EventBus,
  events,
  EVENT_NAMES,
  requestActions,
  filterActions,
  starringActions,
  blockingActions,
  timelineActions,
  historyActions,
  diffActions,
  attackSurfaceActions,
  actions,
  state
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
  undoRedoState
};
