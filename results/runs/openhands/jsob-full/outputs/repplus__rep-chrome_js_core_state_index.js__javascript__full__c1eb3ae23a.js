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
    listeners.forEach(listener => {
      try {
        listener(payload);
      } catch (error) {
        console.error(`Error in event listener for "${eventName}":`, error);
      }
    });
  }

  off(eventName, listener) {
    const listeners = this.listeners.get(eventName) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  removeAllListeners(eventName) {
    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }
  }

  listenerCount(eventName) {
    return (this.listeners.get(eventName) || []).length;
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
  if (value == null) return "";

  const text = String(value);
  if (text.includes(",") || text.includes('"') || text.includes("\n") || text.includes("\r")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function arrayToCSV(rows, headers) {
  if (!rows || rows.length === 0) {
    return headers ? headers.join(",") : "";
  }

  const columns = headers || Object.keys(rows[0]);
  const lines = [columns.map(escapeCsvField).join(",")];
  rows.forEach(row => {
    const values = columns.map(column => escapeCsvField(row[column]));
    lines.push(values.join(","));
  });
  return lines.join("\n");
}

function downloadCSV(rows, filename, headers = null) {
  const csv = arrayToCSV(rows, headers);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const objectUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");

  downloadLink.href = objectUrl;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(objectUrl);
}

function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  const objectUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");

  downloadLink.href = objectUrl;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(objectUrl);
}

async function copyToClipboard(text, button) {
  const isDevToolsPage = window.location.protocol === "devtools:";
  if (!isDevToolsPage) {
    try {
      await navigator.clipboard.writeText(text);
      if (button) showCopySuccess(button);
      return;
    } catch (error) {
      if (!error.message?.includes("permissions policy") && !error.message?.includes("Permissions policy")) {
        console.warn("Clipboard API failed, trying fallback:", error);
      }
    }
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    if (navigator.userAgent.match(/ipad|iphone/i)) {
      const range = document.createRange();
      range.selectNodeContents(textarea);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      textarea.setSelectionRange(0, 999999);
    }

    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    if (!copied) throw new Error("execCommand copy failed");
    if (button) showCopySuccess(button);
  } catch (error) {
    console.error("Copy to clipboard failed:", error);
    if (button) {
      const errorIcon = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#f28b82"/></svg>';
      button.innerHTML = errorIcon;
      setTimeout(() => {
        if (button) button.innerHTML = errorIcon;
      }, 1500);
    }
  }
}

function showCopySuccess(button) {
  if (!button) return;

  const successIcon = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#81c995"/></svg>';
  button.innerHTML = successIcon;
  setTimeout(() => {
    if (button) button.innerHTML = successIcon;
  }, 1500);
}

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "unknown";
  }
}

function highlightHTTP(httpText) {
  if (!httpText) return "";

  const lines = httpText.split("\n");
  let highlighted = "";
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const firstSpace = line.indexOf(" ");
    if (firstSpace > -1) {
      const method = line.substring(0, firstSpace);
      const targetAndVersion = line.substring(firstSpace + 1);
      highlighted += `<span class="http-method">${escapeHtml(method)}</span> `;

      let pathAndQuery = targetAndVersion;
      let version = "";
      const versionMatch = targetAndVersion.match(/(\s*HTTP\/\d+(\.\d+)?|\s+([hH]\d+|QUIC))$/i);
      if (versionMatch) {
        pathAndQuery = targetAndVersion.substring(0, versionMatch.index);
        version = targetAndVersion.substring(versionMatch.index);
      }

      const queryIndex = pathAndQuery.indexOf("?");
      if (queryIndex > -1) {
        highlighted += `<span class="http-path">${escapeHtml(pathAndQuery.substring(0, queryIndex))}</span>?`;
        highlighted += highlightParams(pathAndQuery.substring(queryIndex + 1));
      } else {
        highlighted += `<span class="http-path">${escapeHtml(pathAndQuery)}</span>`;
      }
      if (version) highlighted += `<span class="http-version">${escapeHtml(version)}</span>`;
    } else {
      highlighted += escapeHtml(line);
    }

    if (index < lines.length - 1) highlighted += "\n";
  }
  return highlighted;
}

function highlightJSON(jsonText) {
  try {
    JSON.parse(jsonText);
    return jsonText.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      match => `<span class="json-number">${escapeHtml(match)}</span>`,
    );
  } catch {
    return escapeHtml(jsonText);
  }
}

function highlightParams(paramsText) {
  if (paramsText.trim().startsWith("<") || paramsText.indexOf("=") === -1) {
    return escapeHtml(paramsText);
  }

  return paramsText.split("&").map(param => {
    const separator = param.indexOf("=");
    if (separator === -1) return escapeHtml(param);

    const key = param.substring(0, separator);
    const value = param.substring(separator + 1);
    return `<span class="param-key">${escapeHtml(key)}</span>=<span class="param-value">${escapeHtml(value)}</span>`;
  }).join("&");
}

function highlightCookies(cookieText) {
  return cookieText.split(";").map(cookie => {
    const separator = cookie.indexOf("=");
    if (separator === -1) return escapeHtml(cookie);

    const key = cookie.substring(0, separator);
    const value = cookie.substring(separator + 1);
    return `<span class="cookie-key">${escapeHtml(key)}</span>=<span class="cookie-value">${escapeHtml(value)}</span>`;
  }).join(";");
}

const requestActions = {
  isDuplicate(candidate, existingRequests) {
    if (!candidate || !candidate.request) return false;

    const request = candidate.request;
    const method = (request.method || "GET").toUpperCase().trim();
    const url = (request.url || "").trim();
    const postData = request.postData?.text ? String(request.postData.text).trim() : "";
    const headers = this.normalizeHeaders(request.headers);
    const pageUrl = (candidate.pageUrl || "").trim();
    const signature = `${method}|${url}|${headers}|${postData}|${pageUrl}`;

    for (const existing of existingRequests) {
      if (!existing || !existing.request) continue;

      const existingRequest = existing.request;
      const existingMethod = (existingRequest.method || "GET").toUpperCase().trim();
      const existingUrl = (existingRequest.url || "").trim();
      const existingPostData = existingRequest.postData?.text
        ? String(existingRequest.postData.text).trim()
        : "";
      const existingHeaders = this.normalizeHeaders(existingRequest.headers);
      const existingPageUrl = (existing.pageUrl || "").trim();
      const existingSignature = `${existingMethod}|${existingUrl}|${existingHeaders}|${existingPostData}|${existingPageUrl}`;

      if (signature === existingSignature) return true;
    }
    return false;
  },

  normalizeHeaders(headers) {
    if (!headers) return "";

    let entries;
    if (Array.isArray(headers)) {
      entries = headers;
    } else if (typeof headers === "object") {
      entries = Object.entries(headers);
    } else {
      return "";
    }

    return entries
      .filter(header => {
        const name = (header.name || header[0] || "").toLowerCase();
        return name && !name.startsWith(":");
      })
      .map(header => {
        const name = (header.name || header[0] || "").toLowerCase().trim();
        const value = (header.value || header[1] || "").toLowerCase().trim();
        return `${name}:${value}`;
      })
      .sort()
      .join("|");
  },

  removeDuplicates() {
    const originalCount = state.requests.length;
    if (originalCount === 0) return 0;

    const uniqueRequests = [];
    const signatures = new Set();
    for (const entry of state.requests) {
      if (!entry || !entry.request) {
        uniqueRequests.push(entry);
        continue;
      }

      const request = entry.request;
      const method = (request.method || "GET").toUpperCase().trim();
      const url = (request.url || "").trim();
      const postData = request.postData?.text ? String(request.postData.text).trim() : "";
      const headers = this.normalizeHeaders(request.headers);
      const pageUrl = (entry.pageUrl || "").trim();
      const signature = `${method}|${url}|${headers}|${postData}|${pageUrl}`;

      if (signatures.size < 3) {
        console.log(`Signature ${signatures.size + 1}:`, `${signature.substring(0, 100)}...`);
      }

      if (!signatures.has(signature)) {
        signatures.add(signature);
        uniqueRequests.push(entry);
      } else {
        console.log("Duplicate found:", `${signature.substring(0, 100)}...`);
      }
    }

    console.log(
      `removeDuplicates: ${originalCount} total, ${signatures.size} unique, ${originalCount - signatures.size} duplicates`,
    );

    const removedCount = originalCount - uniqueRequests.length;
    if (removedCount > 0) {
      const selectedRequest = state.selectedRequest;
      state.requests = uniqueRequests;
      if (selectedRequest && !uniqueRequests.includes(selectedRequest)) {
        state.selectedRequest = null;
        events.emit(EVENT_NAMES.UI_CLEAR_ALL);
      } else if (selectedRequest) {
        state.selectedRequest = selectedRequest;
      }

      const requestList = document.getElementById("request-list");
      if (requestList) requestList.innerHTML = "";
      uniqueRequests.forEach((request, index) => {
        events.emit(EVENT_NAMES.REQUEST_RENDERED, { request, index });
      });
      events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
    }
    return removedCount;
  },

  add(request) {
    request.starred = false;
    request.color = null;
    request.name = null;

    const removeDuplicates = localStorage.getItem("rep_remove_duplicates") !== "false";
    if (removeDuplicates && this.isDuplicate(request, state.requests)) return null;

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
    state.requests = [];
    state.selectedRequest = null;
    state.requestHistory = [];
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
      const requestList = document.getElementById("request-list");
      events.emit("request:filtered", {
        preserveScroll: true,
        scrollTop: requestList ? requestList.scrollTop : 0,
      });
    }
  },

  toggleGroupStar(groupType, groupName, starred) {
    const isPageGroup = groupType === "page";
    const starredGroups = isPageGroup ? state.starredPages : state.starredDomains;
    if (starred) {
      starredGroups.add(groupName);
    } else {
      starredGroups.delete(groupName);
    }

    state.requests.forEach((request, index) => {
      const pageHostname = request.pageUrl ? new URL(request.pageUrl).hostname : null;
      const requestHostname = new URL(request.request.url).hostname;
      const belongsToGroup = isPageGroup
        ? pageHostname === groupName && requestHostname === groupName
        : requestHostname === groupName;

      if (belongsToGroup && request.starred !== starred) {
        request.starred = starred;
        events.emit("request:star-updated", { index, starred });
      }
    });
    events.emit(EVENT_NAMES.REQUEST_FILTERED);
  },

  setColor(index, color) {
    if (index >= 0 && index < state.requests.length) {
      state.requests[index].color = color;
      events.emit(EVENT_NAMES.REQUEST_COLOR_CHANGED, { index, color });
    }
  },

  delete(index) {
    if (index < 0 || index >= state.requests.length) return;

    const removedRequest = state.requests[index];
    state.requests.splice(index, 1);
    if (state.selectedRequest === removedRequest) {
      state.selectedRequest = null;
      events.emit(EVENT_NAMES.REQUEST_SELECTED, { request: null, index: -1 });
    }
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
  },

  deleteGroup(groupType, groupName) {
    const isPageGroup = groupType === "page";
    const indexesToDelete = [];
    state.requests.forEach((request, index) => {
      const pageHostname = getHostname(request.pageUrl || request.request.url);
      const requestHostname = getHostname(request.request.url);
      const belongsToGroup = isPageGroup
        ? pageHostname === groupName
        : requestHostname === groupName;
      if (belongsToGroup) indexesToDelete.push(index);
    });

    indexesToDelete.reverse().forEach(index => {
      state.requests.splice(index, 1);
    });

    const blockedCount = state.blockedQueue.length;
    state.blockedQueue = state.blockedQueue.filter(request => {
      const pageHostname = getHostname(request.pageUrl || request.request.url);
      const requestHostname = getHostname(request.request.url);
      return isPageGroup ? pageHostname !== groupName : requestHostname !== groupName;
    });
    const removedBlockedCount = blockedCount - state.blockedQueue.length;

    if (isPageGroup) {
      state.starredPages.delete(groupName);
    } else {
      state.starredDomains.delete(groupName);
    }
    state.domainsWithAttackSurface.delete(groupName);

    Object.keys(state.attackSurfaceCategories).forEach(key => {
      const requestIndex = parseInt(key);
      if (requestIndex >= state.requests.length) {
        delete state.attackSurfaceCategories[key];
        return;
      }

      const request = state.requests[requestIndex];
      const pageHostname = getHostname(request.pageUrl || request.request.url);
      const requestHostname = getHostname(request.request.url);
      if (isPageGroup ? pageHostname === groupName : requestHostname === groupName) {
        delete state.attackSurfaceCategories[key];
      }
    });

    const selectedIndex = state.requests.indexOf(state.selectedRequest);
    if (state.selectedRequest && (selectedIndex === -1 || indexesToDelete.includes(selectedIndex))) {
      state.selectedRequest = null;
    }

    events.emit(EVENT_NAMES.REQUEST_FILTERED);
    if (removedBlockedCount > 0) events.emit("block-queue:updated");
    if (state.selectedRequest === null) events.emit(EVENT_NAMES.UI_CLEAR_ALL);
    return removedBlockedCount;
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
    if (methods.size === 0) {
      state.currentFilter = "all";
    } else if (methods.size === 1) {
      state.currentFilter = Array.from(methods)[0];
    } else {
      state.currentFilter = "multiple";
    }
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, { methods });
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
    if (starred) {
      state.starredPages.add(page);
    } else {
      state.starredPages.delete(page);
    }
    events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED);
  },

  toggleDomainStar(domain, starred) {
    if (starred) {
      state.starredDomains.add(domain);
    } else {
      state.starredDomains.delete(domain);
    }
    events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED);
  },
};

const blockingActions = {
  setBlocking(enabled) {
    state.blockRequests = enabled;
    if (enabled) state.blockedQueue = [];
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
    if (state.historyIndex >= 0) {
      const currentEntry = state.requestHistory[state.historyIndex];
      if (currentEntry.rawText === rawText && currentEntry.useHttps === useHttps) return;
    }

    if (state.historyIndex < state.requestHistory.length - 1) {
      state.requestHistory = state.requestHistory.slice(0, state.historyIndex + 1);
    }
    state.requestHistory.push({ rawText, useHttps });
    state.historyIndex = state.requestHistory.length - 1;
    events.emit(EVENT_NAMES.HISTORY_UPDATED);
    events.emit(EVENT_NAMES.UI_UPDATE_HISTORY_BUTTONS);
  },

  goBack() {
    if (state.historyIndex > 0) {
      state.historyIndex--;
      events.emit(EVENT_NAMES.HISTORY_NAVIGATED, {
        index: state.historyIndex,
        entry: state.requestHistory[state.historyIndex],
      });
      events.emit(EVENT_NAMES.UI_UPDATE_HISTORY_BUTTONS);
    }
  },

  goForward() {
    if (state.historyIndex < state.requestHistory.length - 1) {
      state.historyIndex++;
      events.emit(EVENT_NAMES.HISTORY_NAVIGATED, {
        index: state.historyIndex,
        entry: state.requestHistory[state.historyIndex],
      });
      events.emit(EVENT_NAMES.UI_UPDATE_HISTORY_BUTTONS);
    }
  },
};

const diffActions = {
  setBaseline(request) {
    state.regularRequestBaseline = request;
  },

  setCurrentResponse(response) {
    state.currentResponse = response;
  },
};

const attackSurfaceActions = {
  setCategory(index, category) {
    state.attackSurfaceCategories[index] = category;
  },

  markDomain(domain) {
    state.domainsWithAttackSurface.add(domain);
  },

  setAnalyzing(analyzing) {
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
  requestActions.clearAll();
}

function addToHistory(rawText, useHttps) {
  historyActions.add(rawText, useHttps);
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
  undoRedoState,
};
