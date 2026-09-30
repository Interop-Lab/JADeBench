// ../work/repplus__rep-chrome/js/core/state/requests.js
var requestState = {
  requests: [],
  selectedRequest: null
};

// ../work/repplus__rep-chrome/js/core/state/filters.js
var filterState = {
  currentFilter: "all",
  // all, GET, POST, etc. (legacy, kept for compatibility)
  selectedMethods: /* @__PURE__ */ new Set(),
  // Set of selected HTTP methods (e.g., ['GET', 'POST'])
  starFilterActive: false,
  // Whether star filter is active
  currentColorFilter: "all",
  // all, red, green, blue, etc.
  currentSearchTerm: "",
  useRegex: false
};

// ../work/repplus__rep-chrome/js/core/state/history.js
var historyState = {
  requestHistory: [],
  historyIndex: -1
};

// ../work/repplus__rep-chrome/js/core/state/undo-redo.js
var undoRedoState = {
  undoStack: [],
  redoStack: []
};

// ../work/repplus__rep-chrome/js/core/state/bulk-replay.js
var bulkReplayState = {
  positionConfigs: [],
  currentAttackType: "sniper",
  shouldStopBulk: false,
  shouldPauseBulk: false
};

// ../work/repplus__rep-chrome/js/core/state/diff.js
var diffState = {
  regularRequestBaseline: null,
  currentResponse: null
};

// ../work/repplus__rep-chrome/js/core/state/starring.js
var starringState = {
  starredPages: /* @__PURE__ */ new Set(),
  starredDomains: /* @__PURE__ */ new Set()
};

// ../work/repplus__rep-chrome/js/core/state/timeline.js
var timelineState = {
  timelineFilterTimestamp: null,
  timelineFilterRequestIndex: null
};

// ../work/repplus__rep-chrome/js/core/state/ui.js
var uiState = {
  manuallyCollapsed: false
};

// ../work/repplus__rep-chrome/js/core/state/attack-surface.js
var attackSurfaceState = {
  attackSurfaceCategories: {},
  // { requestIndex: { category, confidence, reasoning, icon } }
  domainsWithAttackSurface: /* @__PURE__ */ new Set(),
  // Track which domains have been analyzed
  isAnalyzingAttackSurface: false
};

// ../work/repplus__rep-chrome/js/core/state/blocking.js
var blockingState = {
  blockRequests: false,
  blockedQueue: []
};

// ../work/repplus__rep-chrome/js/core/events.js
var EventBus = class {
  constructor() {
    this.listeners = /* @__PURE__ */ new Map();
  }
  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} - Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => this.off(event, callback);
  }
  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Data to pass to listeners
   */
  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((cb) => {
      try {
        cb(data);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    });
  }
  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function to remove
   */
  off(event, callback) {
    const callbacks = this.listeners.get(event) || [];
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }
  /**
   * Remove all listeners for an event
   * @param {string} event - Event name (optional, removes all if not provided)
   */
  removeAllListeners(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
  /**
   * Get listener count for an event
   * @param {string} event - Event name
   * @returns {number} - Number of listeners
   */
  listenerCount(event) {
    return (this.listeners.get(event) || []).length;
  }
};
var events = new EventBus();
var EVENT_NAMES = {
  // Request events
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
  // UI events
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
  // Network events
  NETWORK_REQUEST_CAPTURED: "network:request-captured",
  NETWORK_RESPONSE_RECEIVED: "network:response-received",
  NETWORK_ERROR: "network:error",
  // State events
  STATE_REQUESTS_CLEARED: "state:requests-cleared",
  STATE_FILTER_CHANGED: "state:filter-changed",
  STATE_SEARCH_CHANGED: "state:search-changed",
  // History events
  HISTORY_UPDATED: "history:updated",
  HISTORY_NAVIGATED: "history:navigated",
  // Export/Import events
  REQUESTS_EXPORTED: "requests:exported",
  REQUESTS_IMPORTED: "requests:imported"
};

// ../work/repplus__rep-chrome/js/core/utils/dom.js
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
function escapeCsvField(value) {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
function arrayToCSV(data, headers) {
  if (!data || data.length === 0) {
    return headers ? headers.join(",") : "";
  }
  const csvHeaders = headers || Object.keys(data[0]);
  const rows = [csvHeaders.map(escapeCsvField).join(",")];
  data.forEach((item) => {
    const row = csvHeaders.map((header) => {
      const value = item[header];
      return escapeCsvField(value);
    });
    rows.push(row.join(","));
  });
  return rows.join("\n");
}
function downloadCSV(data, filename, headers = null) {
  const csvContent = arrayToCSV(data, headers);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
function downloadJSON(data, filename) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
async function copyToClipboard(text, btn) {
  const isDevToolsContext = window.location.protocol === "devtools:";
  if (!isDevToolsContext) {
    try {
      await navigator.clipboard.writeText(text);
      if (btn) {
        showCopySuccess(btn);
      }
      return;
    } catch (err) {
      if (!err.message?.includes("permissions policy") && !err.message?.includes("Permissions policy")) {
        console.warn("Clipboard API failed, trying fallback:", err);
      }
    }
  }
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    textArea.style.opacity = "0";
    textArea.style.pointerEvents = "none";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    if (navigator.userAgent.match(/ipad|iphone/i)) {
      const range = document.createRange();
      range.selectNodeContents(textArea);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      textArea.setSelectionRange(0, 999999);
    }
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    if (successful) {
      if (btn) {
        showCopySuccess(btn);
      }
    } else {
      throw new Error("execCommand copy failed");
    }
  } catch (fallbackErr) {
    console.error("Copy to clipboard failed:", fallbackErr);
    if (btn) {
      const originalHtml = btn.innerHTML;
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#f28b82"/></svg>';
      setTimeout(() => {
        if (btn) {
          btn.innerHTML = originalHtml;
        }
      }, 1500);
    }
  }
}
function showCopySuccess(btn) {
  if (!btn) return;
  const originalHtml = btn.innerHTML;
  btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#81c995"/></svg>';
  setTimeout(() => {
    if (btn) {
      btn.innerHTML = originalHtml;
    }
  }, 1500);
}

// ../work/repplus__rep-chrome/js/core/utils/network.js
function getHostname(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return "unknown";
  }
}
function highlightHTTP(text) {
  if (!text) return "";
  const lines = text.split("\n");
  let inBody = false;
  let bodyStartIndex = -1;
  const isResponse = lines[0] && lines[0].toUpperCase().startsWith("HTTP/");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "") {
      inBody = true;
      bodyStartIndex = i;
      break;
    }
  }
  let highlighted = "";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === 0) {
      const firstSpace = line.indexOf(" ");
      if (firstSpace > -1) {
        const method = line.substring(0, firstSpace);
        const rest = line.substring(firstSpace + 1);
        highlighted += `<span class="http-method">${escapeHtml(method)}</span> `;
        let path = rest;
        let version = "";
        const versionRegex = /(\s*HTTP\/\d+(\.\d+)?|\s+([hH]\d+|QUIC))$/i;
        const match = rest.match(versionRegex);
        if (match) {
          path = rest.substring(0, match.index);
          version = rest.substring(match.index);
        }
        const qIndex = path.indexOf("?");
        if (qIndex > -1) {
          highlighted += `<span class="http-path">${escapeHtml(path.substring(0, qIndex))}</span>?`;
          highlighted += highlightParams(path.substring(qIndex + 1));
        } else {
          highlighted += `<span class="http-path">${escapeHtml(path)}</span>`;
        }
        if (version) {
          highlighted += `<span class="http-version">${escapeHtml(version)}</span>`;
        }
      } else {
        highlighted += escapeHtml(line);
      }
    } else if (!inBody || i < bodyStartIndex) {
      const colonIndex = line.indexOf(":");
      if (colonIndex > 0) {
        const headerName = line.substring(0, colonIndex);
        const headerValue = line.substring(colonIndex + 1);
        highlighted += `<span class="http-header-name">${escapeHtml(headerName)}</span>`;
        highlighted += '<span class="http-colon">:</span>';
        if (headerName.trim().toLowerCase() === "cookie") {
          highlighted += highlightCookies(headerValue);
        } else {
          highlighted += `<span class="http-header-value">${escapeHtml(headerValue)}</span>`;
        }
      } else {
        highlighted += escapeHtml(line);
      }
    } else if (i === bodyStartIndex) {
      highlighted += "";
    } else {
      const bodyContent = lines.slice(bodyStartIndex + 1).join("\n");
      let bodyHighlighted = highlightJSON(bodyContent);
      if (!isResponse && bodyHighlighted === escapeHtml(bodyContent)) {
        bodyHighlighted = highlightParams(bodyContent);
      }
      highlighted += bodyHighlighted;
      break;
    }
    if (i < lines.length - 1) {
      highlighted += "\n";
    }
  }
  return highlighted;
}
function highlightJSON(text) {
  try {
    JSON.parse(text);
    return text.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = "json-number";
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "json-key";
          } else {
            cls = "json-string";
          }
        } else if (/true|false/.test(match)) {
          cls = "json-boolean";
        } else if (/null/.test(match)) {
          cls = "json-null";
        }
        return `<span class="${cls}">${escapeHtml(match)}</span>`;
      }
    );
  } catch (e) {
    return escapeHtml(text);
  }
}
function highlightParams(text) {
  if (text.trim().startsWith("<")) return escapeHtml(text);
  if (text.indexOf("=") === -1) return escapeHtml(text);
  return text.split("&").map((part) => {
    const eqIndex = part.indexOf("=");
    if (eqIndex > -1) {
      const key = part.substring(0, eqIndex);
      const value = part.substring(eqIndex + 1);
      return `<span class="param-key">${escapeHtml(key)}</span>=<span class="param-value">${escapeHtml(value)}</span>`;
    } else {
      return escapeHtml(part);
    }
  }).join("&");
}
function highlightCookies(text) {
  return text.split(";").map((part) => {
    const eqIndex = part.indexOf("=");
    if (eqIndex > -1) {
      const key = part.substring(0, eqIndex);
      const value = part.substring(eqIndex + 1);
      return `<span class="cookie-key">${escapeHtml(key)}</span>=<span class="cookie-value">${escapeHtml(value)}</span>`;
    } else {
      return escapeHtml(part);
    }
  }).join(";");
}

// ../work/repplus__rep-chrome/js/core/state/actions.js
var requestActions = {
  /**
   * Check if a request is a duplicate of an existing request
   * @param {Object} newRequest - New request to check
   * @param {Array} existingRequests - Array of existing requests
   * @returns {boolean} True if duplicate found
   */
  isDuplicate(newRequest, existingRequests) {
    if (!newRequest || !newRequest.request) return false;
    const newReq = newRequest.request;
    const newMethod = (newReq.method || "GET").toUpperCase().trim();
    const newUrl = (newReq.url || "").trim();
    const newBody = newReq.postData && newReq.postData.text ? String(newReq.postData.text).trim() : "";
    const newHeaders = this.normalizeHeaders(newReq.headers);
    const newPageUrl = (newRequest.pageUrl || "").trim();
    const newSignature = `${newMethod}|${newUrl}|${newHeaders}|${newBody}|${newPageUrl}`;
    for (const existing of existingRequests) {
      if (!existing || !existing.request) continue;
      const existingReq = existing.request;
      const existingMethod = (existingReq.method || "GET").toUpperCase().trim();
      const existingUrl = (existingReq.url || "").trim();
      const existingBody = existingReq.postData && existingReq.postData.text ? String(existingReq.postData.text).trim() : "";
      const existingHeaders = this.normalizeHeaders(existingReq.headers);
      const existingPageUrl = (existing.pageUrl || "").trim();
      const existingSignature = `${existingMethod}|${existingUrl}|${existingHeaders}|${existingBody}|${existingPageUrl}`;
      if (newSignature === existingSignature) {
        return true;
      }
    }
    return false;
  },
  /**
   * Normalize headers for comparison
   * @param {Array|Object} headers - Headers in array or object format
   * @returns {string} Normalized header string
   */
  normalizeHeaders(headers) {
    if (!headers) return "";
    let headerArray = [];
    if (Array.isArray(headers)) {
      headerArray = headers;
    } else if (typeof headers === "object") {
      headerArray = Object.entries(headers);
    } else {
      return "";
    }
    const normalized = headerArray.filter((h) => {
      const name = (h.name || h[0] || "").toLowerCase();
      return name && !name.startsWith(":");
    }).map((h) => {
      const name = (h.name || h[0] || "").toLowerCase().trim();
      const value = (h.value || h[1] || "").toLowerCase().trim();
      return `${name}:${value}`;
    }).sort().join("|");
    return normalized;
  },
  /**
   * Remove duplicate requests from state
   * @returns {number} Number of duplicates removed
   */
  removeDuplicates() {
    const originalLength = state.requests.length;
    if (originalLength === 0) return 0;
    const uniqueRequests = [];
    const seen = /* @__PURE__ */ new Set();
    for (const request of state.requests) {
      if (!request || !request.request) {
        uniqueRequests.push(request);
        continue;
      }
      const req = request.request;
      const method = (req.method || "GET").toUpperCase().trim();
      const url = (req.url || "").trim();
      const body = req.postData && req.postData.text ? String(req.postData.text).trim() : "";
      const headers = this.normalizeHeaders(req.headers);
      const pageUrl = (request.pageUrl || "").trim();
      const signature = `${method}|${url}|${headers}|${body}|${pageUrl}`;
      if (seen.size < 3) {
        console.log(`Signature ${seen.size + 1}:`, signature.substring(0, 100) + "...");
      }
      if (!seen.has(signature)) {
        seen.add(signature);
        uniqueRequests.push(request);
      } else {
        console.log("Duplicate found:", signature.substring(0, 100) + "...");
      }
    }
    console.log(`removeDuplicates: ${originalLength} total, ${seen.size} unique, ${originalLength - seen.size} duplicates`);
    const removedCount = originalLength - uniqueRequests.length;
    if (removedCount > 0) {
      const selectedRequestRef = state.selectedRequest;
      state.requests = uniqueRequests;
      if (selectedRequestRef && !uniqueRequests.includes(selectedRequestRef)) {
        state.selectedRequest = null;
        events.emit(EVENT_NAMES.UI_CLEAR_ALL);
      } else if (selectedRequestRef) {
        state.selectedRequest = selectedRequestRef;
      }
      const requestList = document.getElementById("request-list");
      if (requestList) {
        requestList.innerHTML = "";
      }
      uniqueRequests.forEach((request, index) => {
        events.emit(EVENT_NAMES.REQUEST_RENDERED, { request, index });
      });
      events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
    }
    return removedCount;
  },
  /**
   * Add a new request to state
   * @param {Object} request - Request object to add
   * @returns {number|null} Index of the added request, or null if duplicate was skipped
   */
  add(request) {
    request.starred = false;
    request.color = null;
    if (typeof request.name !== "string") {
      request.name = null;
    }
    const removeDuplicatesEnabled = localStorage.getItem("rep_remove_duplicates") !== "false";
    if (removeDuplicatesEnabled && this.isDuplicate(request, state.requests)) {
      return null;
    }
    state.requests.push(request);
    const index = state.requests.length - 1;
    events.emit(EVENT_NAMES.REQUEST_RENDERED, { request, index });
    return index;
  },
  /**
   * Select a request
   * @param {Object|null} request - Request object to select, or null to deselect
   * @param {number} index - Index of the request
   */
  select(request, index) {
    state.selectedRequest = request;
    events.emit(EVENT_NAMES.REQUEST_SELECTED, { request, index });
  },
  /**
   * Clear all requests and reset related state
   */
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
  /**
   * Toggle star status of a request
   * @param {Object} request - Request object to toggle
   * @param {number} index - Index of the request
   */
  toggleStar(request, index) {
    request.starred = !request.starred;
    events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED, { request, index });
    if (state.starFilterActive) {
      const requestList = document.getElementById("request-list");
      const scrollTop = requestList ? requestList.scrollTop : 0;
      events.emit("request:filtered", { preserveScroll: true, scrollTop });
    }
  },
  /**
   * Toggle star for all requests in a group
   * @param {string} type - 'page' or 'domain'
   * @param {string} hostname - Hostname to match
   * @param {boolean} starred - Whether to star or unstar
   */
  toggleGroupStar(type, hostname, starred) {
    const isPage = type === "page";
    if (isPage) {
      if (starred) {
        state.starredPages.add(hostname);
      } else {
        state.starredPages.delete(hostname);
      }
    } else {
      if (starred) {
        state.starredDomains.add(hostname);
      } else {
        state.starredDomains.delete(hostname);
      }
    }
    state.requests.forEach((req, index) => {
      const reqPageHostname = req.pageUrl ? new URL(req.pageUrl).hostname : null;
      const reqHostname = new URL(req.request.url).hostname;
      let shouldUpdate = false;
      if (isPage) {
        if (reqPageHostname === hostname && reqHostname === hostname) shouldUpdate = true;
      } else {
        if (reqHostname === hostname) shouldUpdate = true;
      }
      if (shouldUpdate && req.starred !== starred) {
        req.starred = starred;
        events.emit("request:star-updated", { index, starred });
      }
    });
    events.emit(EVENT_NAMES.REQUEST_FILTERED);
  },
  /**
   * Set color for a request
   * @param {number} index - Index of the request
   * @param {string|null} color - Color to set, or null to remove
   */
  setColor(index, color) {
    if (index >= 0 && index < state.requests.length) {
      state.requests[index].color = color;
      events.emit(EVENT_NAMES.REQUEST_COLOR_CHANGED, { index, color });
    }
  },
  /**
   * Delete a request
   * @param {number} index - Index of the request to delete
   */
  delete(index) {
    if (index >= 0 && index < state.requests.length) {
      const request = state.requests[index];
      state.requests.splice(index, 1);
      if (state.selectedRequest === request) {
        state.selectedRequest = null;
        events.emit(EVENT_NAMES.REQUEST_SELECTED, { request: null, index: -1 });
      }
      events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
    }
  },
  /**
   * Delete all requests in a group
   * @param {string} type - 'page' or 'domain'
   * @param {string} hostname - Hostname to match
   * @returns {number} Number of requests removed from blocked queue
   */
  deleteGroup(type, hostname) {
    const isPage = type === "page";
    const requestsToRemove = [];
    state.requests.forEach((req, index) => {
      const reqPageHostname = getHostname(req.pageUrl || req.request.url);
      const reqHostname = getHostname(req.request.url);
      let shouldRemove = false;
      if (isPage) {
        shouldRemove = reqPageHostname === hostname;
      } else {
        shouldRemove = reqHostname === hostname;
      }
      if (shouldRemove) {
        requestsToRemove.push(index);
      }
    });
    requestsToRemove.reverse().forEach((index) => {
      state.requests.splice(index, 1);
    });
    const beforeQueue = state.blockedQueue.length;
    state.blockedQueue = state.blockedQueue.filter((req) => {
      const reqPageHostname = getHostname(req.pageUrl || req.request.url);
      const reqHostname = getHostname(req.request.url);
      if (isPage) {
        return reqPageHostname !== hostname;
      }
      return reqHostname !== hostname;
    });
    const removedFromQueue = beforeQueue - state.blockedQueue.length;
    if (isPage) {
      state.starredPages.delete(hostname);
    } else {
      state.starredDomains.delete(hostname);
    }
    state.domainsWithAttackSurface.delete(hostname);
    Object.keys(state.attackSurfaceCategories).forEach((key) => {
      const reqIndex = parseInt(key);
      if (reqIndex < state.requests.length) {
        const req = state.requests[reqIndex];
        const reqPageHostname = getHostname(req.pageUrl || req.request.url);
        const reqHostname = getHostname(req.request.url);
        if (isPage) {
          if (reqPageHostname === hostname) {
            delete state.attackSurfaceCategories[key];
          }
        } else {
          if (reqHostname === hostname) {
            delete state.attackSurfaceCategories[key];
          }
        }
      } else {
        delete state.attackSurfaceCategories[key];
      }
    });
    const selectedIndex = state.requests.indexOf(state.selectedRequest);
    if (state.selectedRequest && (selectedIndex === -1 || requestsToRemove.includes(selectedIndex))) {
      state.selectedRequest = null;
    }
    events.emit(EVENT_NAMES.REQUEST_FILTERED);
    if (removedFromQueue > 0) {
      events.emit("block-queue:updated");
    }
    if (state.selectedRequest === null) {
      events.emit(EVENT_NAMES.UI_CLEAR_ALL);
    }
    return removedFromQueue;
  }
};
var filterActions = {
  /**
   * Set the current filter
   * @param {string} filter - Filter value ('all', 'GET', 'POST', 'starred', etc.)
   */
  setFilter(filter) {
    state.currentFilter = filter;
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, { filter });
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
  },
  /**
   * Set selected HTTP methods
   * @param {Set<string>} methods - Set of HTTP methods
   */
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
  /**
   * Toggle star filter
   * @param {boolean} active - Whether star filter is active
   */
  setStarFilter(active) {
    state.starFilterActive = active;
    if (active) {
      state.currentFilter = "starred";
    } else {
      state.currentFilter = "all";
    }
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, { starFilter: active });
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
  },
  /**
   * Set search term
   * @param {string} term - Search term
   * @param {boolean} useRegex - Whether to use regex
   */
  setSearch(term, useRegex = false) {
    state.currentSearchTerm = term;
    state.useRegex = useRegex;
    events.emit(EVENT_NAMES.STATE_SEARCH_CHANGED, { term, useRegex });
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
  },
  /**
   * Set color filter
   * @param {string} color - Color to filter by, or 'all'
   */
  setColorFilter(color) {
    state.currentColorFilter = color;
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, { color });
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
  }
};
var starringActions = {
  /**
   * Toggle star for a page
   * @param {string} hostname - Page hostname
   * @param {boolean} starred - Whether to star or unstar
   */
  togglePageStar(hostname, starred) {
    if (starred) {
      state.starredPages.add(hostname);
    } else {
      state.starredPages.delete(hostname);
    }
    events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED);
  },
  /**
   * Toggle star for a domain
   * @param {string} hostname - Domain hostname
   * @param {boolean} starred - Whether to star or unstar
   */
  toggleDomainStar(hostname, starred) {
    if (starred) {
      state.starredDomains.add(hostname);
    } else {
      state.starredDomains.delete(hostname);
    }
    events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED);
  }
};
var blockingActions = {
  /**
   * Toggle request blocking
   * @param {boolean} enabled - Whether blocking is enabled
   */
  setBlocking(enabled) {
    state.blockRequests = enabled;
    if (enabled) {
      state.blockedQueue = [];
    }
    events.emit("block-queue:updated");
  },
  /**
   * Add request to blocked queue
   * @param {Object} request - Request to add to queue
   */
  addToBlockedQueue(request) {
    state.blockedQueue.push(request);
    events.emit("block-queue:updated");
  },
  /**
   * Clear blocked queue
   */
  clearBlockedQueue() {
    state.blockedQueue = [];
    events.emit("block-queue:updated");
  }
};
var timelineActions = {
  /**
   * Set timeline filter
   * @param {number} timestamp - Timestamp to filter by
   * @param {number} requestIndex - Request index at that timestamp
   */
  setFilter(timestamp, requestIndex) {
    state.timelineFilterTimestamp = timestamp;
    state.timelineFilterRequestIndex = requestIndex;
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
  },
  /**
   * Clear timeline filter
   */
  clear() {
    state.timelineFilterTimestamp = null;
    state.timelineFilterRequestIndex = null;
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
  }
};
var historyActions = {
  /**
   * Add entry to request history
   * @param {string} rawText - Raw request text
   * @param {boolean} useHttps - Whether to use HTTPS
   */
  add(rawText, useHttps) {
    if (state.historyIndex >= 0) {
      const current = state.requestHistory[state.historyIndex];
      if (current.rawText === rawText && current.useHttps === useHttps) {
        return;
      }
    }
    if (state.historyIndex < state.requestHistory.length - 1) {
      state.requestHistory = state.requestHistory.slice(0, state.historyIndex + 1);
    }
    state.requestHistory.push({ rawText, useHttps });
    state.historyIndex = state.requestHistory.length - 1;
    events.emit(EVENT_NAMES.HISTORY_UPDATED);
    events.emit(EVENT_NAMES.UI_UPDATE_HISTORY_BUTTONS);
  },
  /**
   * Navigate history backward
   */
  goBack() {
    if (state.historyIndex > 0) {
      state.historyIndex--;
      events.emit(EVENT_NAMES.HISTORY_NAVIGATED, {
        index: state.historyIndex,
        entry: state.requestHistory[state.historyIndex]
      });
      events.emit(EVENT_NAMES.UI_UPDATE_HISTORY_BUTTONS);
    }
  },
  /**
   * Navigate history forward
   */
  goForward() {
    if (state.historyIndex < state.requestHistory.length - 1) {
      state.historyIndex++;
      events.emit(EVENT_NAMES.HISTORY_NAVIGATED, {
        index: state.historyIndex,
        entry: state.requestHistory[state.historyIndex]
      });
      events.emit(EVENT_NAMES.UI_UPDATE_HISTORY_BUTTONS);
    }
  }
};
var diffActions = {
  /**
   * Set baseline for diff view
   * @param {string} baseline - Baseline response text
   */
  setBaseline(baseline) {
    state.regularRequestBaseline = baseline;
  },
  /**
   * Set current response for diff
   * @param {string} response - Current response text
   */
  setCurrentResponse(response) {
    state.currentResponse = response;
  }
};
var attackSurfaceActions = {
  /**
   * Set attack surface category for a request
   * @param {number} requestIndex - Index of the request
   * @param {Object} categoryData - Category data
   */
  setCategory(requestIndex, categoryData) {
    state.attackSurfaceCategories[requestIndex] = categoryData;
  },
  /**
   * Mark domain as having attack surface
   * @param {string} domain - Domain name
   */
  markDomain(domain) {
    state.domainsWithAttackSurface.add(domain);
  },
  /**
   * Set analyzing flag
   * @param {boolean} analyzing - Whether analysis is in progress
   */
  setAnalyzing(analyzing) {
    state.isAnalyzingAttackSurface = analyzing;
  }
};
var actions = {
  request: requestActions,
  filter: filterActions,
  starring: starringActions,
  blocking: blockingActions,
  timeline: timelineActions,
  history: historyActions,
  diff: diffActions,
  attackSurface: attackSurfaceActions
};

// ../work/repplus__rep-chrome/js/core/state/index.js
var state = {
  // Request state
  ...requestState,
  // Filter state
  ...filterState,
  // History state
  ...historyState,
  // Undo/Redo state
  ...undoRedoState,
  // Bulk Replay state
  ...bulkReplayState,
  // Diff state
  ...diffState,
  // Starring state
  ...starringState,
  // Timeline state
  ...timelineState,
  // UI state
  ...uiState,
  // Attack Surface state
  ...attackSurfaceState,
  // Blocking state
  ...blockingState
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
  undoRedoState
};
