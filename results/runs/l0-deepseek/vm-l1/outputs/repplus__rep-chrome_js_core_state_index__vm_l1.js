const globalObject = typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : void 0;
const moduleContext = globalObject['vm_0x17c7e9_6a122f'] || (globalObject['vm_0x17c7e9_6a122f'] = {});
(function () {
  if (!moduleContext['module']) try { moduleContext['module'] = module; } catch (e) {}
  if (!moduleContext['exports']) try { moduleContext['exports'] = exports; } catch (e) {}
  if (!moduleContext['require']) try { moduleContext['require'] = require; } catch (e) {}
  if (!moduleContext['__dirname']) try { moduleContext['__dirname'] = __dirname; } catch (e) {}
  if (!moduleContext['__filename']) try { moduleContext['__filename'] = __filename; } catch (e) {}
})();

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeCsvField(field) {
  const str = String(field ?? '');
  if (/[",\n\r]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function arrayToCSV(rows, delimiter = ',') {
  if (!Array.isArray(rows) || rows.length === 0) return '';
  return rows.map(row => {
    if (!Array.isArray(row)) return escapeCsvField(row);
    return row.map(cell => escapeCsvField(cell)).join(delimiter);
  }).join('\n');
}

function downloadCSV(filename, csvContent) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadJSON(filename, jsonData) {
  const jsonString = typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function copyToClipboard(text, callback) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      if (callback) callback(true);
    }).catch(() => {
      if (callback) callback(false);
    });
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    let success = false;
    try {
      success = document.execCommand('copy');
    } catch (e) {
      success = false;
    }
    document.body.removeChild(textarea);
    if (callback) callback(success);
  }
}

function showCopySuccess(button) {
  if (!button) return;
  const originalText = button.textContent;
  button.textContent = 'Copied!';
  button.classList.add('copy-success');
  setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove('copy-success');
  }, 1500);
}

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return '';
  }
}

function highlightHTTP(requestText) {
  if (!requestText) return '';
  const lines = requestText.split('\n');
  if (lines.length === 0) return escapeHtml(requestText);
  const requestLine = lines[0];
  const match = requestLine.match(/^(\w+)\s+([^\s]+)\s+(HTTP\/[\d.]+)$/);
  if (!match) return escapeHtml(requestText);
  const method = match[1];
  const path = match[2];
  const version = match[3];
  const methodClass = {
    GET: 'http-method-get',
    POST: 'http-method-post',
    PUT: 'http-method-put',
    DELETE: 'http-method-delete',
    PATCH: 'http-method-patch',
    HEAD: 'http-method-head',
    OPTIONS: 'http-method-options'
  }[method] || 'http-method-other';
  const highlightedRequestLine = `<span class="${methodClass}">${escapeHtml(method)}</span> <span class="http-path">${escapeHtml(path)}</span> <span class="http-version">${escapeHtml(version)}</span>`;
  const headerLines = lines.slice(1).map(line => {
    if (line.trim() === '') return '';
    const headerMatch = line.match(/^([^:]+):\s*(.*)$/);
    if (headerMatch) {
      return `<span class="http-header-name">${escapeHtml(headerMatch[1])}</span>: <span class="http-header-value">${escapeHtml(headerMatch[2])}</span>`;
    }
    return escapeHtml(line);
  });
  return highlightedRequestLine + '\n' + headerLines.join('\n');
}

function highlightJSON(jsonText) {
  if (!jsonText) return '';
  try {
    const parsed = JSON.parse(jsonText);
    const formatted = JSON.stringify(parsed, null, 2);
    return escapeHtml(formatted)
      .replace(/(&quot;.*?&quot;)(\s*:)/g, '<span class="json-key">$1</span>$2')
      .replace(/: (\d+(?:\.\d+)?)/g, ': <span class="json-number">$1</span>')
      .replace(/: (&quot;.*?&quot;)/g, ': <span class="json-string">$1</span>')
      .replace(/\b(true|false)\b/g, '<span class="json-boolean">$1</span>')
      .replace(/\bnull\b/g, '<span class="json-null">null</span>');
  } catch (e) {
    return escapeHtml(jsonText);
  }
}

function highlightParams(paramsText) {
  if (!paramsText) return '';
  return escapeHtml(paramsText).replace(/([^=&]+)=([^&]*)/g, '<span class="param-name">$1</span>=<span class="param-value">$2</span>');
}

function highlightCookies(cookieText) {
  if (!cookieText) return '';
  return escapeHtml(cookieText).replace(/([^=;]+)=([^;]*)/g, '<span class="cookie-name">$1</span>=<span class="cookie-value">$2</span>');
}

var requestState = { requests: [], selectedRequest: null };
moduleContext['requestState'] = requestState;
globalObject['requestState'] = moduleContext['requestState'];

var filterState = {
  currentFilter: 'all',
  selectedMethods: new Set(),
  starFilterActive: false,
  currentColorFilter: 'all',
  currentSearchTerm: '',
  useRegex: false
};
moduleContext['filterState'] = filterState;
globalObject['filterState'] = moduleContext['filterState'];

var historyState = { requestHistory: [], historyIndex: -1 };
moduleContext['historyState'] = historyState;
globalObject['historyState'] = moduleContext['historyState'];

var undoRedoState = { undoStack: [], redoStack: [] };
moduleContext['undoRedoState'] = undoRedoState;
globalObject['undoRedoState'] = moduleContext['undoRedoState'];

var bulkReplayState = {
  positionConfigs: [],
  currentAttackType: 'sniper',
  shouldStopBulk: false,
  shouldPauseBulk: false
};
moduleContext['bulkReplayState'] = bulkReplayState;
globalObject['bulkReplayState'] = moduleContext['bulkReplayState'];

var diffState = { regularRequestBaseline: null, currentResponse: null };
moduleContext['diffState'] = diffState;
globalObject['diffState'] = moduleContext['diffState'];

var starringState = { starredPages: new Set(), starredDomains: new Set() };
moduleContext['starringState'] = starringState;
globalObject['starringState'] = moduleContext['starringState'];

var timelineState = { timelineFilterTimestamp: null, timelineFilterRequestIndex: null };
moduleContext['timelineState'] = timelineState;
globalObject['timelineState'] = moduleContext['timelineState'];

var uiState = { manuallyCollapsed: false };
moduleContext['uiState'] = uiState;
globalObject['uiState'] = moduleContext['uiState'];

var attackSurfaceState = {
  attackSurfaceCategories: {},
  domainsWithAttackSurface: new Set(),
  isAnalyzingAttackSurface: false
};
moduleContext['attackSurfaceState'] = attackSurfaceState;
globalObject['attackSurfaceState'] = moduleContext['attackSurfaceState'];

var blockingState = { blockRequests: false, blockedQueue: [] };
moduleContext['blockingState'] = blockingState;
globalObject['blockingState'] = moduleContext['blockingState'];

class EventBus {
  constructor() {
    this.listeners = {};
  }
  on(eventName, callback) {
    if (!this.listeners[eventName]) this.listeners[eventName] = [];
    this.listeners[eventName].push(callback);
  }
  emit(eventName, payload) {
    const callbacks = this.listeners[eventName];
    if (!callbacks) return;
    for (const callback of callbacks) {
      callback(payload);
    }
  }
  off(eventName, callback) {
    const callbacks = this.listeners[eventName];
    if (!callbacks) return;
    if (callback) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) callbacks.splice(index, 1);
    } else {
      delete this.listeners[eventName];
    }
  }
  removeAllListeners(eventName) {
    if (eventName) {
      delete this.listeners[eventName];
    } else {
      this.listeners = {};
    }
  }
  listenerCount(eventName) {
    const callbacks = this.listeners[eventName];
    return callbacks ? callbacks.length : 0;
  }
}
moduleContext['EventBus'] = EventBus;
globalObject['EventBus'] = moduleContext['EventBus'];

var events = new moduleContext['EventBus']();
moduleContext['events'] = events;
globalObject['events'] = moduleContext['events'];

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
moduleContext['EVENT_NAMES'] = EVENT_NAMES;
globalObject['EVENT_NAMES'] = moduleContext['EVENT_NAMES'];

var requestActions = {
  isDuplicate(requestA, requestB) {
    if (!requestA || !requestB) return false;
    return requestA.method === requestB.method && requestA.url === requestB.url && requestA.body === requestB.body;
  },
  normalizeHeaders(headers) {
    if (!headers) return {};
    const normalized = {};
    for (const key of Object.keys(headers)) {
      normalized[key.toLowerCase()] = headers[key];
    }
    return normalized;
  },
  removeDuplicates() {
    const seen = new Set();
    requestState.requests = requestState.requests.filter(request => {
      const key = request.method + ' ' + request.url + ' ' + (request.body || '');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    events.emit(EVENT_NAMES.REQUEST_FILTERED);
  },
  add(request) {
    if (!request) return;
    requestState.requests.push(request);
    events.emit(EVENT_NAMES.REQUEST_RENDERED);
  },
  select(requestId, request) {
    requestState.selectedRequest = request || requestState.requests.find(r => r.id === requestId) || null;
    events.emit(EVENT_NAMES.REQUEST_SELECTED, requestState.selectedRequest);
  },
  clearAll() {
    requestState.requests = [];
    requestState.selectedRequest = null;
    events.emit(EVENT_NAMES.STATE_REQUESTS_CLEARED);
  },
  toggleStar(requestId, request) {
    const target = request || requestState.requests.find(r => r.id === requestId);
    if (!target) return;
    target.starred = !target.starred;
    events.emit(EVENT_NAMES.REQUEST_STARRED, target);
  },
  toggleGroupStar(requestIds, starred) {
    for (const request of requestState.requests) {
      if (requestIds.includes(request.id)) {
        request.starred = starred;
      }
    }
    events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED);
  },
  setColor(requestId, color) {
    const request = requestState.requests.find(r => r.id === requestId);
    if (!request) return;
    request.color = color;
    events.emit(EVENT_NAMES.REQUEST_COLOR_CHANGED, request);
  },
  delete(requestId) {
    requestState.requests = requestState.requests.filter(r => r.id !== requestId);
    if (requestState.selectedRequest && requestState.selectedRequest.id === requestId) {
      requestState.selectedRequest = null;
    }
    events.emit(EVENT_NAMES.REQUEST_FILTERED);
  },
  deleteGroup(requestIds) {
    requestState.requests = requestState.requests.filter(r => !requestIds.includes(r.id));
    if (requestState.selectedRequest && requestIds.includes(requestState.selectedRequest.id)) {
      requestState.selectedRequest = null;
    }
    events.emit(EVENT_NAMES.REQUEST_FILTERED);
  }
};
moduleContext['requestActions'] = requestActions;
globalObject['requestActions'] = moduleContext['requestActions'];

var filterActions = {
  setFilter(filter) {
    filterState.currentFilter = filter;
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED);
  },
  setSelectedMethods(methods) {
    filterState.selectedMethods = new Set(methods);
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED);
  },
  setStarFilter(active) {
    filterState.starFilterActive = active;
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED);
  },
  setSearch(searchTerm) {
    filterState.currentSearchTerm = searchTerm;
    events.emit(EVENT_NAMES.STATE_SEARCH_CHANGED);
  },
  setColorFilter(color) {
    filterState.currentColorFilter = color;
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED);
  }
};
moduleContext['filterActions'] = filterActions;
globalObject['filterActions'] = moduleContext['filterActions'];

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
moduleContext['starringActions'] = starringActions;
globalObject['starringActions'] = moduleContext['starringActions'];

var blockingActions = {
  setBlocking(blocking) {
    blockingState.blockRequests = blocking;
  },
  addToBlockedQueue(request) {
    blockingState.blockedQueue.push(request);
  },
  clearBlockedQueue() {
    blockingState.blockedQueue = [];
  }
};
moduleContext['blockingActions'] = blockingActions;
globalObject['blockingActions'] = moduleContext['blockingActions'];

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
moduleContext['timelineActions'] = timelineActions;
globalObject['timelineActions'] = moduleContext['timelineActions'];

var historyActions = {
  add(request, state) {
    historyState.requestHistory.push({ request, state });
    historyState.historyIndex = historyState.requestHistory.length - 1;
    events.emit(EVENT_NAMES.HISTORY_UPDATED);
  },
  goBack() {
    if (historyState.historyIndex > 0) {
      historyState.historyIndex--;
      events.emit(EVENT_NAMES.HISTORY_NAVIGATED);
    }
  },
  goForward() {
    if (historyState.historyIndex < historyState.requestHistory.length - 1) {
      historyState.historyIndex++;
      events.emit(EVENT_NAMES.HISTORY_NAVIGATED);
    }
  }
};
moduleContext['historyActions'] = historyActions;
globalObject['historyActions'] = moduleContext['historyActions'];

var diffActions = {
  setBaseline(request) {
    diffState.regularRequestBaseline = request;
  },
  setCurrentResponse(response) {
    diffState.currentResponse = response;
  }
};
moduleContext['diffActions'] = diffActions;
globalObject['diffActions'] = moduleContext['diffActions'];

var attackSurfaceActions = {
  setCategory(category, data) {
    attackSurfaceState.attackSurfaceCategories[category] = data;
  },
  markDomain(domain) {
    attackSurfaceState.domainsWithAttackSurface.add(domain);
  },
  setAnalyzing(analyzing) {
    attackSurfaceState.isAnalyzingAttackSurface = analyzing;
  }
};
moduleContext['attackSurfaceActions'] = attackSurfaceActions;
globalObject['attackSurfaceActions'] = moduleContext['attackSurfaceActions'];

var actions = {
  request: moduleContext['requestActions'],
  filter: moduleContext['filterActions'],
  starring: moduleContext['starringActions'],
  blocking: moduleContext['blockingActions'],
  timeline: moduleContext['timelineActions'],
  history: moduleContext['historyActions'],
  diff: moduleContext['diffActions'],
  attackSurface: moduleContext['attackSurfaceActions']
};
moduleContext['actions'] = actions;
globalObject['actions'] = moduleContext['actions'];

var state = {
  ...moduleContext['requestState'],
  ...moduleContext['filterState'],
  ...moduleContext['historyState'],
  ...moduleContext['undoRedoState'],
  ...moduleContext['bulkReplayState'],
  ...moduleContext['diffState'],
  ...moduleContext['starringState'],
  ...moduleContext['timelineState'],
  ...moduleContext['uiState'],
  ...moduleContext['attackSurfaceState'],
  ...moduleContext['blockingState']
};
moduleContext['state'] = state;
globalObject['state'] = moduleContext['state'];

function addRequest(request) {
  requestActions.add(request);
}
moduleContext['addRequest'] = addRequest;
globalObject['addRequest'] = moduleContext['addRequest'];

function clearRequests() {
  requestActions.clearAll();
}
moduleContext['clearRequests'] = clearRequests;
globalObject['clearRequests'] = moduleContext['clearRequests'];

function addToHistory(request, stateSnapshot) {
  historyActions.add(request, stateSnapshot);
}
moduleContext['addToHistory'] = addToHistory;
globalObject['addToHistory'] = moduleContext['addToHistory'];

moduleContext['escapeHtml'] = escapeHtml;
globalObject['escapeHtml'] = moduleContext['escapeHtml'];
moduleContext['escapeCsvField'] = escapeCsvField;
globalObject['escapeCsvField'] = moduleContext['escapeCsvField'];
moduleContext['arrayToCSV'] = arrayToCSV;
globalObject['arrayToCSV'] = moduleContext['arrayToCSV'];
moduleContext['downloadCSV'] = downloadCSV;
globalObject['downloadCSV'] = moduleContext['downloadCSV'];
moduleContext['downloadJSON'] = downloadJSON;
globalObject['downloadJSON'] = moduleContext['downloadJSON'];
moduleContext['copyToClipboard'] = copyToClipboard;
globalObject['copyToClipboard'] = moduleContext['copyToClipboard'];
moduleContext['showCopySuccess'] = showCopySuccess;
globalObject['showCopySuccess'] = moduleContext['showCopySuccess'];
moduleContext['getHostname'] = getHostname;
globalObject['getHostname'] = moduleContext['getHostname'];
moduleContext['highlightHTTP'] = highlightHTTP;
globalObject['highlightHTTP'] = moduleContext['highlightHTTP'];
moduleContext['highlightJSON'] = highlightJSON;
globalObject['highlightJSON'] = moduleContext['highlightJSON'];
moduleContext['highlightParams'] = highlightParams;
globalObject['highlightParams'] = moduleContext['highlightParams'];
moduleContext['highlightCookies'] = highlightCookies;
globalObject['highlightCookies'] = moduleContext['highlightCookies'];

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
