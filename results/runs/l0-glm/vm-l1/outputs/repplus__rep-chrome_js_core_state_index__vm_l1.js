var requestState = { requests: [], selectedRequest: null };
var filterState = { currentFilter: 'all', selectedMethods: new Set(), starFilterActive: false, currentColorFilter: 'all', currentSearchTerm: '', useRegex: false };
var historyState = { requestHistory: [], historyIndex: -1 };
var undoRedoState = { undoStack: [], redoStack: [] };
var bulkReplayState = { positionConfigs: [], currentAttackType: 'sniper', shouldStopBulk: false, shouldPauseBulk: false };
var diffState = { regularRequestBaseline: null, currentResponse: null };
var starringState = { starredPages: new Set(), starredDomains: new Set() };
var timelineState = { timelineFilterTimestamp: null, timelineFilterRequestIndex: null };
var uiState = { manuallyCollapsed: false };
var attackSurfaceState = { attackSurfaceCategories: {}, domainsWithAttackSurface: new Set(), isAnalyzingAttackSurface: false };
var blockingState = { blockRequests: false, blockedQueue: [] };

var EventBus = class EventBus {
  constructor() {
    this.listeners = {};
  }
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }
  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }
  removeAllListeners(event) {
    if (event) delete this.listeners[event];
    else this.listeners = {};
  }
  listenerCount(event) {
    return this.listeners[event] ? this.listeners[event].length : 0;
  }
};

var events = new EventBus();

var EVENT_NAMES = {
  REQUEST_SELECTED: 'request:selected',
  REQUEST_STARRED: 'request:starred',
  REQUEST_COLOR_CHANGED: 'request:color-changed',
  REQUEST_FILTERED: 'request:filtered',
  REQUEST_RENDERED: 'request:rendered',
  REQUEST_STAR_UPDATED: 'request:star-updated',
  REQUEST_ACTION_STAR: 'request:action:star',
  REQUEST_ACTION_GROUP_STAR: 'request:action:group-star',
  REQUEST_ACTION_DELETE_GROUP: 'request:action:delete-group',
  REQUEST_ACTION_TIMELINE: 'request:action:timeline',
  REQUEST_ACTION_COLOR: 'request:action:color',
  UI_RESIZE: 'ui:resize',
  UI_THEME_CHANGED: 'ui:theme-changed',
  UI_VIEW_SWITCHED: 'ui:view-switched',
  UI_LAYOUT_TOGGLED: 'ui:layout-toggled',
  UI_REQUEST_SELECTED: 'ui:request-selected',
  UI_UPDATE_REQUEST_CONTENT: 'ui:update-request-content',
  UI_GET_REQUEST_CONTENT: 'ui:get-request-content',
  UI_UPDATE_REQUEST_LIST: 'ui:update-request-list',
  UI_UPDATE_HISTORY_BUTTONS: 'ui:update-history-buttons',
  UI_UPDATE_RAW_REQUEST: 'ui:update-raw-request',
  UI_UPDATE_RESPONSE_VIEW: 'ui:update-response-view',
  UI_UPDATE_REGEX_TOGGLE: 'ui:update-regex-toggle',
  UI_UPDATE_DIFF_TOGGLE_VISIBILITY: 'ui:update-diff-toggle-visibility',
  UI_CLEAR_ALL: 'ui:clear-all',
  NETWORK_REQUEST_CAPTURED: 'network:request-captured',
  NETWORK_RESPONSE_RECEIVED: 'network:response-received',
  NETWORK_ERROR: 'network:error',
  STATE_REQUESTS_CLEARED: 'state:requests-cleared',
  STATE_FILTER_CHANGED: 'state:filter-changed',
  STATE_SEARCH_CHANGED: 'state:search-changed',
  HISTORY_UPDATED: 'history:updated',
  HISTORY_NAVIGATED: 'history:navigated',
  REQUESTS_EXPORTED: 'requests:exported',
  REQUESTS_IMPORTED: 'requests:imported'
};

function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeCsvField(field) {
  if (field === null || field === undefined) return '';
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function arrayToCSV(data, headers) {
  if (!Array.isArray(data) || data.length === 0) return '';
  const keys = headers || Object.keys(data[0]);
  const headerRow = keys.map(k => escapeCsvField(k)).join(',');
  const rows = data.map(row => keys.map(k => escapeCsvField(row[k])).join(','));
  return [headerRow, ...rows].join('\n');
}

function downloadCSV(data, filename) {
  const csv = arrayToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename || 'export.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename || 'export.json');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function copyToClipboard(text, callback) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      if (callback) callback();
    }).catch(() => {
      fallbackCopyToClipboard(text, callback);
    });
  } else {
    fallbackCopyToClipboard(text, callback);
  }
}

function fallbackCopyToClipboard(text, callback) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.top = '-9999px';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    if (callback) callback();
  } catch (err) {}
  document.body.removeChild(textArea);
}

function showCopySuccess(element) {
  if (!element) return;
  const originalText = element.textContent || element.innerText;
  element.textContent = 'Copied!';
  element.classList.add('copy-success');
  setTimeout(() => {
    element.textContent = originalText;
    element.classList.remove('copy-success');
  }, 2000);
}

function getHostname(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch (e) {
    return '';
  }
}

function highlightHTTP(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/("(?:[^"\\]|\\.)*")/g, '<span class="http-string">$1</span>')
    .replace(/(\b(?:GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|CONNECT|TRACE)\b)/g, '<span class="http-method">$1</span>')
    .replace(/(HTTP\/[0-9.]+)/g, '<span class="http-version">$1</span>')
    .replace(/([A-Za-z-]+)(?=:)/g, '<span class="http-header-name">$1</span>')
    .replace(/(#[0-9a-fA-F]{3,8})/g, '<span class="http-color">$1</span>');
}

function highlightJSON(json) {
  if (typeof json !== 'string') {
    try {
      json = JSON.stringify(json, null, 2);
    } catch (e) {
      return String(json);
    }
  }
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
      let cls = 'json-number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key';
        } else {
          cls = 'json-string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
}

function highlightParams(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/([a-zA-Z0-9_-]+)(=)([^&]*)/g, '<span class="param-key">$1</span><span class="param-eq">$2</span><span class="param-value">$3</span>')
    .replace(/(&)/g, '<span class="param-sep">$1</span>');
}

function highlightCookies(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/([a-zA-Z0-9_-]+)(=)([^;]*)/g, '<span class="cookie-key">$1</span><span class="cookie-eq">$2</span><span class="cookie-value">$3</span>')
    .replace(/(;)/g, '<span class="cookie-sep">$1</span>');
}

var requestActions = {
  isDuplicate(request1, request2) {
    if (!request1 || !request2) return false;
    return request1.method === request2.method &&
           request1.url === request2.url &&
           JSON.stringify(request1.headers || {}) === JSON.stringify(request2.headers || {}) &&
           (request1.body || '') === (request2.body || '');
  },
  normalizeHeaders(headers) {
    if (!headers || typeof headers !== 'object') return {};
    const normalized = {};
    for (const [key, value] of Object.entries(headers)) {
      normalized[key.toLowerCase()] = value;
    }
    return normalized;
  },
  removeDuplicates() {
    const seen = new Set();
    requestState.requests = requestState.requests.filter(req => {
      const key = req.method + '|' + req.url + '|' + JSON.stringify(this.normalizeHeaders(req.headers)) + '|' + (req.body || '');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    events.emit(EVENT_NAMES.REQUEST_FILTERED, requestState.requests);
    return requestState.requests;
  },
  add(request) {
    requestState.requests.push(request);
    events.emit(EVENT_NAMES.NETWORK_REQUEST_CAPTURED, request);
    return request;
  },
  select(request, index) {
    requestState.selectedRequest = request;
    events.emit(EVENT_NAMES.REQUEST_SELECTED, { request, index });
    return request;
  },
  clearAll() {
    requestState.requests = [];
    requestState.selectedRequest = null;
    events.emit(EVENT_NAMES.STATE_REQUESTS_CLEARED);
    events.emit(EVENT_NAMES.UI_CLEAR_ALL);
  },
  toggleStar(index, starred) {
    if (requestState.requests[index]) {
      requestState.requests[index].starred = starred !== undefined ? starred : !requestState.requests[index].starred;
      events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED, { index, starred: requestState.requests[index].starred });
    }
  },
  toggleGroupStar(startIndex, endIndex, starred) {
    for (let i = startIndex; i <= endIndex && i < requestState.requests.length; i++) {
      if (requestState.requests[i]) {
        requestState.requests[i].starred = starred !== undefined ? starred : !requestState.requests[i].starred;
      }
    }
    events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED, { startIndex, endIndex, starred });
  },
  setColor(index, color) {
    if (requestState.requests[index]) {
      requestState.requests[index].color = color;
      events.emit(EVENT_NAMES.REQUEST_COLOR_CHANGED, { index, color });
    }
  },
  delete(index) {
    if (index >= 0 && index < requestState.requests.length) {
      requestState.requests.splice(index, 1);
      if (requestState.selectedRequest === requestState.requests[index]) {
        requestState.selectedRequest = null;
      }
      events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST, requestState.requests);
    }
  },
  deleteGroup(startIndex, endIndex) {
    if (startIndex >= 0 && endIndex < requestState.requests.length) {
      requestState.requests.splice(startIndex, endIndex - startIndex + 1);
      requestState.selectedRequest = null;
      events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST, requestState.requests);
    }
  }
};

var filterActions = {
  setFilter(filter) {
    filterState.currentFilter = filter;
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, filterState);
  },
  setSelectedMethods(methods) {
    filterState.selectedMethods = new Set(methods);
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, filterState);
  },
  setStarFilter(active) {
    filterState.starFilterActive = active;
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, filterState);
  },
  setSearch(searchTerm) {
    filterState.currentSearchTerm = searchTerm;
    events.emit(EVENT_NAMES.STATE_SEARCH_CHANGED, searchTerm);
  },
  setColorFilter(color) {
    filterState.currentColorFilter = color;
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, filterState);
  }
};

var starringActions = {
  togglePageStar(page, starred) {
    if (starred) starringState.starredPages.add(page);
    else starringState.starredPages.delete(page);
  },
  toggleDomainStar(domain, starred) {
    if (starred) starringState.starredDomains.add(domain);
    else starringState.starredDomains.delete(domain);
  }
};

var blockingActions = {
  setBlocking(block) {
    blockingState.blockRequests = block;
  },
  addToBlockedQueue(request) {
    blockingState.blockedQueue.push(request);
  },
  clearBlockedQueue() {
    blockingState.blockedQueue = [];
  }
};

var timelineActions = {
  setFilter(timestamp, requestIndex) {
    timelineState.timelineFilterTimestamp = timestamp;
    timelineState.timelineFilterRequestIndex = requestIndex;
  },
  clear() {
    timelineState.timelineFilterTimestamp = null;
    timelineState.timelineFilterRequestIndex = null;
  }
};

var historyActions = {
  add(action, description) {
    if (historyState.historyIndex < historyState.requestHistory.length - 1) {
      historyState.requestHistory = historyState.requestHistory.slice(0, historyState.historyIndex + 1);
    }
    historyState.requestHistory.push({ action, description, timestamp: Date.now() });
    historyState.historyIndex = historyState.requestHistory.length - 1;
    events.emit(EVENT_NAMES.HISTORY_UPDATED, historyState);
  },
  goBack() {
    if (historyState.historyIndex > 0) {
      historyState.historyIndex--;
      events.emit(EVENT_NAMES.HISTORY_NAVIGATED, historyState);
    }
  },
  goForward() {
    if (historyState.historyIndex < historyState.requestHistory.length - 1) {
      historyState.historyIndex++;
      events.emit(EVENT_NAMES.HISTORY_NAVIGATED, historyState);
    }
  }
};

var diffActions = {
  setBaseline(request) {
    diffState.regularRequestBaseline = request;
  },
  setCurrentResponse(response) {
    diffState.currentResponse = response;
  }
};

var attackSurfaceActions = {
  setCategory(domain, category) {
    if (!attackSurfaceState.attackSurfaceCategories[domain]) {
      attackSurfaceState.attackSurfaceCategories[domain] = [];
    }
    if (!attackSurfaceState.attackSurfaceCategories[domain].includes(category)) {
      attackSurfaceState.attackSurfaceCategories[domain].push(category);
    }
  },
  markDomain(domain) {
    attackSurfaceState.domainsWithAttackSurface.add(domain);
  },
  setAnalyzing(isAnalyzing) {
    attackSurfaceState.isAnalyzingAttackSurface = isAnalyzing;
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

var state = {
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
  requestActions.add(request);
  addToHistory('add', 'Added request: ' + (request.method || '') + ' ' + (request.url || ''));
}

function clearRequests() {
  requestActions.clearAll();
  addToHistory('clear', 'Cleared all requests');
}

function addToHistory(action, description) {
  historyActions.add(action, description);
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
