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
  history: [],
  currentIndex: -1
};

const undoRedoState = {
  undoStack: [],
  redoStack: []
};

const bulkReplayState = {
  selectedRequests: [],
  replayMode: "sequential",
  isReplaying: false,
  isPaused: false
};

const diffState = {
  originalRequest: null,
  modifiedRequest: null
};

const starringState = {
  starredPages: new Set(),
  starredDomains: new Set()
};

const timelineState = {
  timelineData: null,
  timelineIndex: null
};

const uiState = {
  isSidebarOpen: false
};

const attackSurfaceState = {
  attackSurfaceCategories: {},
  domainsWithAttackSurface: new Set(),
  isAnalyzingAttackSurface: false
};

const blockingState = {
  isBlocking: false,
  blockedQueue: []
};

class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(eventName, listener) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }

    this.listeners.get(eventName).push(listener);

    return () => this.off(eventName, listener);
  }

  emit(eventName, payload) {
    const listeners = this.listeners.get(eventName) || [];

    for (const listener of listeners) {
      try {
        listener(payload);
      } catch (error) {
        console.error(`Error in event listener for "${eventName}":`, error);
      }
    }
  }

  off(eventName, listener) {
    const listeners = this.listeners.get(eventName) || [];
    const index = listeners.indexOf(listener);

    if (index >= 0) {
      listeners.splice(index, 1);
    }
  }

  clear(eventName) {
    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }
  }

  listenersFor(eventName) {
    return (this.listeners.get(eventName) || []).length;
  }
}

const events = new EventBus();

const EVENT_NAMES = {
  REQUEST_ADDED: "requestAdded",
  REQUEST_DELETED: "requestDeleted",
  REQUEST_SELECTED: "requestSelected",
  REQUEST_UPDATED: "requestUpdated",
  REQUESTS_CLEARED: "requestsCleared",
  FILTER_CHANGED: "filterChanged",
  METHODS_CHANGED: "selectedMethodsChanged",
  STAR_FILTER_CHANGED: "starFilterChanged",
  SEARCH_CHANGED: "searchChanged",
  COLOR_FILTER_CHANGED: "colorFilterChanged",
  HISTORY_ADDED: "historyAdded",
  HISTORY_CHANGED: "historyChanged",
  UNDO: "undo",
  REDO: "redo",
  STAR_CHANGED: "starChanged",
  GROUP_STAR_CHANGED: "groupStarChanged",
  PAGE_STAR_CHANGED: "pageStarChanged",
  DOMAIN_STAR_CHANGED: "domainStarChanged",
  BLOCKING_CHANGED: "blockingChanged",
  BLOCKED_QUEUE_CHANGED: "blockedQueueChanged",
  TIMELINE_CHANGED: "timelineChanged",
  TIMELINE_CLEARED: "timelineCleared",
  DIFF_CHANGED: "diffChanged",
  ATTACK_SURFACE_CHANGED: "attackSurfaceChanged",
  ATTACK_SURFACE_ANALYZING: "attackSurfaceAnalyzing",
  STATE_CLEARED: "stateCleared"
};

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value == null ? "" : String(value);
  return element.innerHTML;
}

function escapeCsvField(value) {
  if (value == null) {
    return "";
  }

  const stringValue = String(value);

  if (/[,"\r\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function arrayToCSV(rows, headers) {
  if (!rows || rows.length === 0) {
    return headers ? headers.join(",") : "";
  }

  const columns = headers || Object.keys(rows[0]);
  const output = [columns.map(escapeCsvField).join(",")];

  for (const row of rows) {
    output.push(columns.map(column => escapeCsvField(row[column])).join(","));
  }

  return output.join("\n");
}

function downloadCSV(rows, filename, headers = null) {
  const csv = arrayToCSV(rows, headers);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadJSON(value, filename) {
  const json = JSON.stringify(value, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function copyToClipboard(value, successElement = null) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(value);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    if (successElement) {
      showCopySuccess(successElement);
    }
  } catch (error) {
    console.error("Copy failed:", error);
  }
}

function showCopySuccess(element) {
  if (!element) {
    return;
  }

  const originalText = element.textContent;
  element.textContent = "Copied";

  setTimeout(() => {
    element.textContent = originalText;
  }, 1000);
}

function getHostname(value) {
  try {
    return new URL(value).hostname;
  } catch {
    return "";
  }
}

function highlightJSON(value) {
  try {
    JSON.parse(value);

    return value.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      match => {
        let className = "number";

        if (/^"/.test(match)) {
          className = /:$/.test(match) ? "key" : "string";
        } else if (/true|false/.test(match)) {
          className = "boolean";
        } else if (/null/.test(match)) {
          className = "null";
        }

        return `<span class="${className}">${escapeHtml(match)}</span>`;
      }
    );
  } catch {
    return escapeHtml(value);
  }
}

function highlightParams(value) {
  if (value == null) {
    return "";
  }

  const text = String(value);

  if (text.trim().startsWith("<")) {
    return escapeHtml(text);
  }

  if (!text.includes("=")) {
    return escapeHtml(text);
  }

  return text
    .split("&")
    .map(part => {
      const separator = part.indexOf("=");

      if (separator < 0) {
        return escapeHtml(part);
      }

      const name = part.slice(0, separator);
      const parameterValue = part.slice(separator + 1);

      return `<span class="param-name">${escapeHtml(name)}</span>=<span class="param-value">${escapeHtml(parameterValue)}</span>`;
    })
    .join("&");
}

function highlightCookies(value) {
  if (value == null) {
    return "";
  }

  return String(value)
    .split(";")
    .map(cookie => {
      const separator = cookie.indexOf("=");

      if (separator < 0) {
        return escapeHtml(cookie);
      }

      const name = cookie.slice(0, separator).trim();
      const cookieValue = cookie.slice(separator + 1).trim();

      return `<span class="cookie-name">${escapeHtml(name)}</span>=<span class="cookie-value">${escapeHtml(cookieValue)}</span>`;
    })
    .join(";");
}

function highlightHTTP(value) {
  if (!value) {
    return "";
  }

  const lines = String(value).split("\n");
  let output = "";
  let foundBody = false;

  for (const line of lines) {
    if (!foundBody && line.trim() === "") {
      foundBody = true;
      output += "\n";
      continue;
    }

    if (foundBody) {
      const body = line.trim();

      if (body.startsWith("{") || body.startsWith("[")) {
        const highlighted = highlightJSON(body);
        output += highlighted === escapeHtml(body) ? highlightParams(body) : highlighted;
      } else {
        output += escapeHtml(line);
      }
    } else if (line.includes(":")) {
      const separator = line.indexOf(":");
      output += `<span class="header-name">${escapeHtml(line.slice(0, separator))}</span>:${escapeHtml(line.slice(separator + 1))}`;
    } else {
      output += escapeHtml(line);
    }

    output += "\n";
  }

  return output.replace(/\n$/, "");
}

const requestActions = {
  isDuplicate(request, requests) {
    if (!request || !request.request) {
      return false;
    }

    const source = request.request;
    const method = String(source.method || "").toLowerCase();
    const url = String(source.url || "").toLowerCase();
    const headers = this.normalizeHeaders(source.headers);
    const body = String(request.body || "").trim();
    const key = `${method}|${url}|${headers}|${body}`;

    for (const existing of requests || []) {
      if (!existing || !existing.request) {
        continue;
      }

      const existingRequest = existing.request;
      const existingKey = [
        String(existingRequest.method || "").toLowerCase(),
        String(existingRequest.url || "").toLowerCase(),
        this.normalizeHeaders(existingRequest.headers),
        String(existing.body || "").trim()
      ].join("|");

      if (key === existingKey) {
        return true;
      }
    }

    return false;
  },

  normalizeHeaders(headers) {
    if (!headers) {
      return "";
    }

    let values;

    if (Array.isArray(headers)) {
      values = headers;
    } else if (typeof headers === "object") {
      values = Object.entries(headers).map(([name, value]) => ({ name, value }));
    } else {
      return "";
    }

    return values
      .map(header => {
        const name = String(header.name || header.key || "").trim().toLowerCase();
        const value = String(header.value || "").trim();
        return `${name}:${value}`;
      })
      .sort()
      .join("|");
  },

  removeDuplicates() {
    const requests = state.requests;
    const seen = new Set();
    const unique = [];

    for (const request of requests) {
      if (!request || !request.request) {
        unique.push(request);
        continue;
      }

      const source = request.request;
      const key = [
        String(source.method || "").toLowerCase(),
        String(source.url || "").toLowerCase(),
        this.normalizeHeaders(source.headers),
        String(request.body || "").trim()
      ].join("|");

      if (!seen.has(key)) {
        seen.add(key);
        unique.push(request);
      }
    }

    const removed = requests.length - unique.length;
    state.requests = unique;

    if (state.selectedRequest && !unique.includes(state.selectedRequest)) {
      state.selectedRequest = null;
    }

    events.emit(EVENT_NAMES.REQUESTS_CLEARED, { removed });
    events.emit(EVENT_NAMES.REQUEST_UPDATED, { requests: unique });

    return removed;
  },

  add(request) {
    if (!request) {
      return null;
    }

    request.isStarred = false;
    request.color = null;

    if (typeof request.timestamp === "undefined") {
      request.timestamp = Date.now();
    }

    state.requests.push(request);
    state.currentIndex = state.requests.length - 1;

    events.emit(EVENT_NAMES.REQUEST_ADDED, {
      request,
      index: state.requests.length - 1
    });

    return state.requests.length - 1;
  },

  select(request, index) {
    state.selectedRequest = request;
    state.selectedRequestIndex = index;

    events.emit(EVENT_NAMES.REQUEST_SELECTED, {
      request,
      index
    });
  },

  clearAll() {
    state.requests = [];
    state.selectedRequest = null;
    state.selectedRequestIndex = -1;
    state.currentIndex = -1;
    state.originalRequest = null;
    state.modifiedRequest = null;
    state.timelineData = null;
    state.timelineIndex = null;
    state.blockedQueue = [];

    events.emit(EVENT_NAMES.STATE_CLEARED);
    events.emit(EVENT_NAMES.REQUESTS_CLEARED);
  },

  toggleStar(request, group) {
    if (!request) {
      return;
    }

    request.isStarred = !request.isStarred;

    events.emit(EVENT_NAMES.STAR_CHANGED, {
      request,
      group
    });
  },

  toggleGroupStar(requests, starred) {
    for (const request of requests || []) {
      if (request) {
        request.isStarred = starred;
      }
    }

    events.emit(EVENT_NAMES.GROUP_STAR_CHANGED, {
      requests,
      starred
    });
  },

  setColor(index, color) {
    if (index < 0 || index >= state.requests.length) {
      return;
    }

    state.requests[index].color = color;

    events.emit(EVENT_NAMES.REQUEST_UPDATED, {
      index,
      color
    });
  },

  delete(index) {
    if (index < 0 || index >= state.requests.length) {
      return;
    }

    const deleted = state.requests[index];
    state.requests.splice(index, 1);

    if (state.selectedRequest === deleted) {
      state.selectedRequest = null;
      state.selectedRequestIndex = -1;
    }

    events.emit(EVENT_NAMES.REQUEST_DELETED, {
      request: deleted,
      index
    });
  },

  deleteGroup(hostname, matchSource = false) {
    const removed = [];

    state.requests = state.requests.filter(request => {
      if (!request) {
        return true;
      }

      const requestHostname = getHostname(
        request.url || request.request?.url || ""
      );

      const responseHostname = getHostname(
        request.response?.url || ""
      );

      const matches = matchSource
        ? requestHostname === hostname
        : responseHostname === hostname;

      if (matches) {
        removed.push(request);
        return false;
      }

      return true;
    });

    if (removed.includes(state.selectedRequest)) {
      state.selectedRequest = null;
      state.selectedRequestIndex = -1;
    }

    events.emit(EVENT_NAMES.REQUESTS_CLEARED, { removed });
    return removed.length;
  }
};

const filterActions = {
  setFilter(filter) {
    state.currentFilter = filter;
    events.emit(EVENT_NAMES.FILTER_CHANGED, { filter });
    events.emit(EVENT_NAMES.REQUEST_UPDATED);
  },

  setSelectedMethods(methods) {
    state.selectedMethods = methods;

    if (methods && methods.length === 0) {
      state.currentFilter = "all";
    } else if (methods && methods.length === 1) {
      state.currentFilter = Array.from(methods)[0];
    }

    events.emit(EVENT_NAMES.METHODS_CHANGED, { methods });
    events.emit(EVENT_NAMES.REQUEST_UPDATED);
  },

  setStarFilter(active) {
    state.starFilterActive = active;
    events.emit(EVENT_NAMES.STAR_FILTER_CHANGED, { active });
    events.emit(EVENT_NAMES.REQUEST_UPDATED);
  },

  setSearch(term, useRegex = false) {
    state.currentSearchTerm = term;
    state.useRegex = useRegex;

    events.emit(EVENT_NAMES.SEARCH_CHANGED, {
      term,
      useRegex
    });

    events.emit(EVENT_NAMES.REQUEST_UPDATED);
  },

  setColorFilter(color) {
    state.currentColorFilter = color;
    events.emit(EVENT_NAMES.COLOR_FILTER_CHANGED, { color });
    events.emit(EVENT_NAMES.REQUEST_UPDATED);
  }
};

const starringActions = {
  togglePageStar(page, starred) {
    if (starred) {
      state.starredPages.add(page);
    } else {
      state.starredPages.delete(page);
    }

    events.emit(EVENT_NAMES.PAGE_STAR_CHANGED, {
      page,
      starred
    });
  },

  toggleDomainStar(domain, starred) {
    if (starred) {
      state.starredDomains.add(domain);
    } else {
      state.starredDomains.delete(domain);
    }

    events.emit(EVENT_NAMES.DOMAIN_STAR_CHANGED, {
      domain,
      starred
    });
  }
};

const blockingActions = {
  setBlocking(enabled) {
    state.isBlocking = enabled;

    if (enabled) {
      state.blockedQueue = [];
    }

    events.emit(EVENT_NAMES.BLOCKING_CHANGED, enabled);
  },

  addToBlockedQueue(request) {
    state.blockedQueue.push(request);
    events.emit(EVENT_NAMES.BLOCKED_QUEUE_CHANGED, state.blockedQueue);
  },

  clearBlockedQueue() {
    state.blockedQueue = [];
    events.emit(EVENT_NAMES.BLOCKED_QUEUE_CHANGED, state.blockedQueue);
  }
};

const timelineActions = {
  setFilter(filter, index) {
    state.timelineFilter = filter;
    state.timelineIndex = index;
    events.emit(EVENT_NAMES.TIMELINE_CHANGED, { filter, index });
  },

  clear() {
    state.timelineData = null;
    state.timelineIndex = null;
    events.emit(EVENT_NAMES.TIMELINE_CLEARED);
  }
};

const historyActions = {
  add(request, response) {
    const last = state.history[state.history.length - 1];

    if (last && last.request === request && last.response === response) {
      return;
    }

    state.history = state.history.slice(0, state.currentIndex + 1);
    state.history.push({ request, response });
    state.currentIndex = state.history.length - 1;

    events.emit(EVENT_NAMES.HISTORY_ADDED, {
      request,
      response
    });

    return state.currentIndex;
  },

  goBack() {
    if (state.currentIndex <= 0) {
      return;
    }

    state.currentIndex--;

    const entry = state.history[state.currentIndex];
    events.emit(EVENT_NAMES.UNDO, entry);
    events.emit(EVENT_NAMES.HISTORY_CHANGED, entry);
  },

  goForward() {
    if (state.currentIndex >= state.history.length - 1) {
      return;
    }

    state.currentIndex++;

    const entry = state.history[state.currentIndex];
    events.emit(EVENT_NAMES.REDO, entry);
    events.emit(EVENT_NAMES.HISTORY_CHANGED, entry);
  }
};

const diffActions = {
  setRequest(request) {
    state.originalRequest = request;
    events.emit(EVENT_NAMES.DIFF_CHANGED, {
      originalRequest: request,
      modifiedRequest: state.modifiedRequest
    });
  },

  setResponse(response) {
    state.modifiedRequest = response;
    events.emit(EVENT_NAMES.DIFF_CHANGED, {
      originalRequest: state.originalRequest,
      modifiedRequest: response
    });
  }
};

const attackSurfaceActions = {
  setCategory(category, value) {
    state.attackSurfaceCategories[category] = value;
    events.emit(EVENT_NAMES.ATTACK_SURFACE_CHANGED, {
      category,
      value
    });
  },

  markDomain(domain) {
    state.domainsWithAttackSurface.add(domain);
    events.emit(EVENT_NAMES.ATTACK_SURFACE_CHANGED, {
      domain
    });
  },

  setAnalyzing(analyzing) {
    state.isAnalyzingAttackSurface = analyzing;
    events.emit(EVENT_NAMES.ATTACK_SURFACE_ANALYZING, analyzing);
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
  requestActions.clearAll();
}

function addToHistory(request, response) {
  return historyActions.add(request, response);
}

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
