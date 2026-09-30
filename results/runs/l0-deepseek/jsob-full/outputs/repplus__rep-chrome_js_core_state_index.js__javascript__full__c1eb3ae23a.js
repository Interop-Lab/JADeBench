const requestState = {
  requests: [],
  selectedRequestId: null
};

const filterState = {
  currentFilter: 'all',
  selectedMethods: new Set(),
  starFilterActive: false,
  currentColorFilter: 'all',
  currentSearchTerm: '',
  useRegex: false
};

const historyState = {
  history: [],
  historyIndex: -1
};

const undoRedoState = {
  undoStack: [],
  redoStack: []
};

const bulkReplayState = {
  bulkReplayRequests: [],
  bulkReplayMode: 'sequential',
  bulkReplayRunning: false,
  bulkReplayCancelled: false
};

const diffState = {
  diffRequestId: null,
  diffResponseId: null
};

const starringState = {
  starredPages: new Set(),
  starredDomains: new Set()
};

const timelineState = {
  timelineFilter: null,
  timelineFilterIndex: null
};

const uiState = {
  sidebarCollapsed: false
};

const attackSurfaceState = {
  attackSurfaceCategories: {},
  domainsWithAttackSurface: new Set(),
  isAnalyzingAttackSurface: false
};

const blockingState = {
  blockingEnabled: false,
  blockedQueue: []
};

class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => this.off(event, callback);
  }

  emit(event, payload) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => {
      try {
        callback(payload);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    });
  }

  off(event, callback) {
    const callbacks = this.listeners.get(event) || [];
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  clearAllListeners(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  getListenerCount(event) {
    return (this.listeners.get(event) || []).length;
  }
}

const events = new EventBus();

const EVENT_NAMES = {
  requestAdded: 'request:added',
  requestSelected: 'request:selected',
  requestDeleted: 'request:deleted',
  requestCleared: 'requests:cleared',
  requestStarred: 'request:starred',
  requestColorChanged: 'request:color-changed',
  requestGroupStarred: 'request:group-starred',
  requestGroupDeleted: 'request:group-deleted',
  requestDuplicatesRemoved: 'request:duplicates-removed',
  filterChanged: 'filter:changed',
  methodsChanged: 'methods:changed',
  starFilterChanged: 'star-filter:changed',
  searchChanged: 'search:changed',
  colorFilterChanged: 'color-filter:changed',
  historyAdded: 'history:added',
  historyBack: 'history:back',
  historyForward: 'history:forward',
  historyChanged: 'history:changed',
  undo: 'undo',
  redo: 'redo',
  bulkReplayStarted: 'bulk-replay:started',
  bulkReplayStopped: 'bulk-replay:stopped',
  bulkReplayProgress: 'bulk-replay:progress',
  diffSelected: 'diff:selected',
  diffCleared: 'diff:cleared',
  pageStarred: 'page:starred',
  domainStarred: 'domain:starred',
  timelineFilterChanged: 'timeline:filter-changed',
  timelineCleared: 'timeline:cleared',
  sidebarToggled: 'sidebar:toggled',
  attackSurfaceCategorySet: 'attack-surface:category-set',
  attackSurfaceDomainMarked: 'attack-surface:domain-marked',
  attackSurfaceAnalyzingChanged: 'attack-surface:analyzing-changed',
  blockingChanged: 'blocking:changed',
  blockedQueueAdded: 'blocked-queue:added',
  blockedQueueCleared: 'blocked-queue:cleared'
};

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function escapeCsvField(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function arrayToCSV(data, columns) {
  if (!data || data.length === 0) return columns ? columns.join(',') : '';
  const cols = columns || Object.keys(data[0]);
  const lines = [cols.map(escapeCsvField).join(',')];
  data.forEach(row => {
    const values = cols.map(col => {
      const value = row[col];
      return escapeCsvField(value);
    });
    lines.push(values.join(','));
  });
  return lines.join('\n');
}

function downloadCSV(data, filename, columns = null) {
  const csv = arrayToCSV(data, columns);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function copyToClipboard(text, button) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      if (button) showCopySuccess(button);
      return;
    } catch (error) {
      if (!error?.name?.includes('NotAllowed') && !error?.message?.includes('permission')) {
        console.error('Clipboard write failed:', error);
      }
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
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

    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    if (successful) {
      if (button) showCopySuccess(button);
    } else {
      throw new Error('Copy command failed');
    }
  } catch (error) {
    console.error('Fallback copy failed:', error);
    if (button) {
      const originalText = button.textContent;
      button.textContent = 'Copy failed';
      setTimeout(() => {
        if (button) button.textContent = originalText;
      }, 2000);
    }
  }
}

function showCopySuccess(button) {
  if (!button) return;
  const originalText = button.textContent;
  button.textContent = 'Copied!';
  setTimeout(() => {
    if (button) button.textContent = originalText;
  }, 2000);
}

function getHostname(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch (error) {
    return '';
  }
}

function highlightHTTP(text) {
  if (!text) return '';
  const lines = text.split('\n');
  let foundBlank = false;
  let blankLineIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '') {
      foundBlank = true;
      blankLineIndex = i;
      break;
    }
  }

  let result = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === 0) {
      const parts = line.split(' ');
      if (parts.length > 1) {
        const method = line.substring(0, parts[0].length);
        const rest = line.substring(parts[0].length + 1);
        result += '<span class="http-method">' + escapeHtml(method) + '</span> ';
        let urlPart = rest;
        let protocolPart = '';
        const protocolMatch = rest.match(/(\s*HTTP\/\d+(\.\d+)?|\s+([hH]\d+|QUIC))$/i);
        if (protocolMatch) {
          urlPart = rest.substring(0, protocolMatch.index);
          protocolPart = rest.substring(protocolMatch.index);
        }
        const queryIndex = urlPart.indexOf('?');
        if (queryIndex > -1) {
          result += '<span class="http-url">' + escapeHtml(urlPart.substring(0, queryIndex)) + '</span>';
          result += highlightParams(urlPart.substring(queryIndex + 1));
        } else {
          result += '<span class="http-url">' + escapeHtml(urlPart) + '</span>';
        }
        if (protocolPart) {
          result += '<span class="http-protocol">' + escapeHtml(protocolPart) + '</span>';
        }
      } else {
        result += escapeHtml(line);
      }
    } else {
      if (!foundBlank || i < blankLineIndex) {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const headerName = line.substring(0, colonIndex);
          const headerValue = line.substring(colonIndex + 1);
          result += '<span class="http-header-name">' + escapeHtml(headerName) + '</span>: ';
          if (headerName.toLowerCase() === 'cookie') {
            result += highlightCookies(headerValue);
          } else {
            result += '<span class="http-header-value">' + escapeHtml(headerValue) + '</span>';
          }
        } else {
          result += escapeHtml(line);
        }
      } else {
        if (i === blankLineIndex) {
          result += '';
        } else {
          const bodyLines = lines.slice(blankLineIndex + 1).join('\n');
          let highlighted = highlightJSON(bodyLines);
          if (!highlighted || highlighted === escapeHtml(bodyLines)) {
            highlighted = highlightParams(bodyLines);
          }
          result += highlighted;
          break;
        }
      }
    }
    if (i < lines.length - 1) result += '\n';
  }
  return result;
}

function highlightJSON(text) {
  try {
    JSON.parse(text);
    return text.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, token => {
      let cls = 'json-number';
      if (/^"/.test(token)) {
        cls = /:$/.test(token) ? 'json-key' : 'json-string';
      } else if (/true|false/.test(token)) {
        cls = 'json-boolean';
      } else if (/null/.test(token)) {
        cls = 'json-null';
      }
      return '<span class="' + cls + '">' + escapeHtml(token) + '</span>';
    });
  } catch (error) {
    return escapeHtml(text);
  }
}

function highlightParams(params) {
  if (params.trim().startsWith('<')) return escapeHtml(params);
  if (params.indexOf('=') === -1) return escapeHtml(params);
  return params.split('&').map(pair => {
    const eqIndex = pair.indexOf('=');
    if (eqIndex > -1) {
      const key = pair.substring(0, eqIndex);
      const value = pair.substring(eqIndex + 1);
      return '<span class="param-key">' + escapeHtml(key) + '</span>=<span class="param-value">' + escapeHtml(value) + '</span>';
    }
    return escapeHtml(pair);
  }).join('&');
}

function highlightCookies(cookies) {
  return cookies.split(';').map(cookie => {
    const eqIndex = cookie.indexOf('=');
    if (eqIndex > -1) {
      const name = cookie.substring(0, eqIndex);
      const value = cookie.substring(eqIndex + 1);
      return '<span class="cookie-name">' + escapeHtml(name) + '</span>=<span class="cookie-value">' + escapeHtml(value) + '</span>';
    }
    return escapeHtml(cookie);
  }).join(';');
}

const requestActions = {
  isDuplicate(request, existingRequests) {
    if (!request || !request.request) return false;
    const req = request.request;
    const method = (req.method || 'GET').toLowerCase();
    const url = (req.url || '').toLowerCase();
    const body = req.body && req.body.length ? String(req.body).toLowerCase() : '';
    const headers = this.normalizeHeaders(req.headers);
    const timestamp = (request.timestamp || '').toLowerCase();
    const key = method + '|' + url + '|' + headers + '|' + body + '|' + timestamp;

    for (const existing of existingRequests) {
      if (!existing || !existing.request) continue;
      const existingReq = existing.request;
      const existingMethod = (existingReq.method || 'GET').toLowerCase();
      const existingUrl = (existingReq.url || '').toLowerCase();
      const existingBody = existingReq.body && existingReq.body.length ? String(existingReq.body).toLowerCase() : '';
      const existingHeaders = this.normalizeHeaders(existingReq.headers);
      const existingTimestamp = (existing.timestamp || '').toLowerCase();
      const existingKey = existingMethod + '|' + existingUrl + '|' + existingHeaders + '|' + existingBody + '|' + existingTimestamp;
      if (key === existingKey) return true;
    }
    return false;
  },

  normalizeHeaders(headers) {
    if (!headers) return '';
    let entries = [];
    if (Array.isArray(headers)) {
      entries = headers;
    } else if (typeof headers === 'object') {
      entries = Object.entries(headers);
    } else {
      return '';
    }
    const normalized = entries.map(entry => {
      const name = (entry.name || entry[0] || '').toLowerCase();
      const value = (entry.value || entry[1] || '').toLowerCase();
      return name + ':' + value;
    }).sort().join('|');
    return normalized;
  },

  removeDuplicates() {
    const total = state.requests.length;
    if (total === 0) return 0;
    const unique = [];
    const seen = new Set();

    for (const request of state.requests) {
      if (!request || !request.request) {
        unique.push(request);
        continue;
      }
      const req = request.request;
      const method = (req.method || 'GET').toLowerCase();
      const url = (req.url || '').toLowerCase();
      const body = req.body && req.body.length ? String(req.body).toLowerCase() : '';
      const headers = this.normalizeHeaders(req.headers);
      const timestamp = (request.timestamp || '').toLowerCase();
      const key = method + '|' + url + '|' + headers + '|' + body + '|' + timestamp;

      if (seen.size === 0) {
        console.log('First request key:', key.substring(0, 100));
      }
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(request);
      } else {
        console.log('Duplicate removed:', key.substring(0, 100));
      }
    }

    console.log('Removed ' + total + ' duplicates: ' + seen.size + ' unique');
    const removed = total - unique.length;
    if (removed > 0) {
      const previous = state.requests;
      state.requests = unique;
      if (previous && !unique.includes(previous)) state.selectedRequestId = null;
      events.emit(EVENT_NAMES.requestDuplicatesRemoved);
    }
    return removed;
  },

  add(request) {
    request.isStarred = false;
    request.color = null;
    if (typeof request.timestamp === 'undefined') {
      request.timestamp = null;
    }
    const maxId = localStorage.getItem('maxRequestId');
    if (maxId && this.isDuplicate(request, state.requests)) {
      return null;
    }
    state.requests.push(request);
    const id = state.requests.length - 1;
    events.emit(EVENT_NAMES.requestAdded, { request, id });
    return id;
  },

  select(id, request) {
    state.selectedRequestId = id;
    events.emit(EVENT_NAMES.requestSelected, { id, request });
  },

  clearAll() {
    state.requests = [];
    state.selectedRequestId = null;
    state.selectedRequestIndex = -1;
    state.attackSurfaceCategories = {};
    state.attackSurfaceDomains = null;
    state.timelineFilter = null;
    state.timelineFilterIndex = null;
    state.diffRequestId = null;
    state.diffResponseId = null;
    state.bulkReplayRequests = [];
    state.bulkReplayMode = 'sequential';
    state.bulkReplayRunning = false;
    state.bulkReplayCancelled = false;
    events.emit(EVENT_NAMES.requestCleared);
    events.emit(EVENT_NAMES.requestDuplicatesRemoved);
  },

  toggleStar(request, index) {
    request.isStarred = !request.isStarred;
    events.emit(EVENT_NAMES.requestStarred, { request, index });
    if (state.starFilterActive) {
      const starIcon = document.querySelector('.star-icon');
      const scrollPos = starIcon ? starIcon.scrollTop : 0;
      events.emit(EVENT_NAMES.filterChanged, { scrollPos });
    }
  },

  toggleGroupStar(groupBy, domain, starValue) {
    const isDomain = groupBy === 'domain';
    if (isDomain) {
      if (starValue) {
        state.starredDomains.add(domain);
      } else {
        state.starredDomains.delete(domain);
      }
    } else {
      if (starValue) {
        state.starredPages.add(domain);
      } else {
        state.starredPages.delete(domain);
      }
    }
    state.requests.forEach((request, index) => {
      const requestDomain = request.url ? new URL(request.url).hostname : null;
      const responseDomain = new URL(request.request.url).hostname;
      let shouldStar = false;
      if (isDomain) {
        if (requestDomain === domain && responseDomain === domain) shouldStar = true;
      } else {
        if (responseDomain === domain) shouldStar = true;
      }
      if (shouldStar && request.isStarred !== starValue) {
        request.isStarred = starValue;
        events.emit(EVENT_NAMES.requestStarred, { index, starValue });
      }
    });
    events.emit(EVENT_NAMES.requestGroupStarred);
  },

  setColor(id, color) {
    if (id >= 0 && id < state.requests.length) {
      state.requests[id].color = color;
      events.emit(EVENT_NAMES.requestColorChanged, { id, color });
    }
  },

  delete(id) {
    if (id >= 0 && id < state.requests.length) {
      const deleted = state.requests[id];
      state.requests.splice(id, 1);
      if (state.selectedRequestId === deleted) {
        state.selectedRequestId = null;
        events.emit(EVENT_NAMES.requestSelected, { id: null, request: null });
      }
      events.emit(EVENT_NAMES.requestDeleted);
    }
  },

  deleteGroup(groupBy, domain) {
    const isDomain = groupBy === 'domain';
    const indicesToDelete = [];
    state.requests.forEach((request, index) => {
      const requestDomain = getHostname(request.url || request.request.url);
      const responseDomain = getHostname(request.request.url);
      let shouldDelete = false;
      if (isDomain) {
        shouldDelete = requestDomain === domain;
      } else {
        shouldDelete = responseDomain === domain;
      }
      if (shouldDelete) indicesToDelete.push(index);
    });
    indicesToDelete.sort().reverse().forEach(index => {
      state.requests.splice(index, 1);
    });
    state.requests = state.requests.filter(request => {
      const requestDomain = getHostname(request.url || request.request.url);
      const responseDomain = getHostname(request.request.url);
      if (isDomain) return requestDomain !== domain;
      return responseDomain !== domain;
    });
    state.starredDomains.delete(domain);
    Object.keys(state.attackSurfaceCategories).forEach(key => {
      const index = parseInt(key);
      if (index === state.requests.length) {
        const request = state.requests[index];
        const requestDomain = getHostname(request.url || request.request.url);
        const responseDomain = getHostname(request.request.url);
        if (isDomain) {
          if (requestDomain === domain) delete state.attackSurfaceCategories[key];
        } else {
          if (responseDomain === domain) delete state.attackSurfaceCategories[key];
        }
      } else {
        delete state.attackSurfaceCategories[key];
      }
    });
    const selectedIndex = state.requests.indexOf(state.selectedRequestId);
    if (state.selectedRequestId && (selectedIndex === -1 || indicesToDelete.includes(selectedIndex))) {
      state.selectedRequestId = null;
    }
    events.emit(EVENT_NAMES.requestGroupDeleted);
    if (indicesToDelete.length > 0) {
      events.emit(EVENT_NAMES.requestDeleted);
    }
    return indicesToDelete.length;
  }
};

const filterActions = {
  setFilter(filter) {
    state.currentFilter = filter;
    events.emit(EVENT_NAMES.filterChanged, { filter });
    events.emit(EVENT_NAMES.requestDuplicatesRemoved);
  },

  setSelectedMethods(methods) {
    state.selectedMethods = methods;
    if (methods.size === 0) {
      state.currentFilter = 'all';
    } else if (methods.size === 1) {
      state.currentFilter = Array.from(methods)[0];
    } else {
      state.currentFilter = 'multiple';
    }
    events.emit(EVENT_NAMES.methodsChanged, { methods });
    events.emit(EVENT_NAMES.filterChanged);
  },

  setStarFilter(active) {
    state.starFilterActive = active;
    if (active) {
      state.currentFilter = 'starred';
    } else {
      state.currentFilter = 'all';
    }
    events.emit(EVENT_NAMES.starFilterChanged, { active });
    events.emit(EVENT_NAMES.filterChanged);
  },

  setSearch(term, useRegex = false) {
    state.currentSearchTerm = term;
    state.useRegex = useRegex;
    events.emit(EVENT_NAMES.searchChanged, { term, useRegex });
    events.emit(EVENT_NAMES.filterChanged);
  },

  setColorFilter(color) {
    state.currentColorFilter = color;
    events.emit(EVENT_NAMES.colorFilterChanged, { color });
    events.emit(EVENT_NAMES.filterChanged);
  }
};

const starringActions = {
  togglePageStar(page, starred) {
    if (starred) {
      state.starredPages.add(page);
    } else {
      state.starredPages.delete(page);
    }
    events.emit(EVENT_NAMES.pageStarred);
  },

  toggleDomainStar(domain, starred) {
    if (starred) {
      state.starredDomains.add(domain);
    } else {
      state.starredDomains.delete(domain);
    }
    events.emit(EVENT_NAMES.domainStarred);
  }
};

const blockingActions = {
  setBlocking(enabled) {
    state.blockingEnabled = enabled;
    if (enabled) {
      state.blockedQueue = [];
    }
    events.emit(EVENT_NAMES.blockingChanged);
  },

  addToBlockedQueue(request) {
    state.blockedQueue.push(request);
    events.emit(EVENT_NAMES.blockedQueueAdded);
  },

  clearBlockedQueue() {
    state.blockedQueue = [];
    events.emit(EVENT_NAMES.blockedQueueCleared);
  }
};

const timelineActions = {
  setFilter(filter, index) {
    state.timelineFilter = filter;
    state.timelineFilterIndex = index;
    events.emit(EVENT_NAMES.timelineFilterChanged);
  },

  clear() {
    state.timelineFilter = null;
    state.timelineFilterIndex = null;
    events.emit(EVENT_NAMES.timelineCleared);
  }
};

const historyActions = {
  add(request, response) {
    if (state.historyIndex >= 0) {
      const current = state.history[state.historyIndex];
      if (current.request === request && current.response === response) {
        return;
      }
    }
    if (state.historyIndex < state.history.length - 1) {
      state.history = state.history.slice(0, state.historyIndex + 1);
    }
    state.history.push({ request, response });
    state.historyIndex = state.history.length - 1;
    events.emit(EVENT_NAMES.historyAdded);
    events.emit(EVENT_NAMES.historyChanged);
  },

  goBack() {
    if (state.historyIndex > 0) {
      state.historyIndex--;
      events.emit(EVENT_NAMES.historyBack, {
        index: state.historyIndex,
        entry: state.history[state.historyIndex]
      });
      events.emit(EVENT_NAMES.historyChanged);
    }
  },

  goForward() {
    if (state.historyIndex < state.history.length - 1) {
      state.historyIndex++;
      events.emit(EVENT_NAMES.historyForward, {
        index: state.historyIndex,
        entry: state.history[state.historyIndex]
      });
      events.emit(EVENT_NAMES.historyChanged);
    }
  }
};

const diffActions = {
  setDiffRequest(requestId) {
    state.diffRequestId = requestId;
  },

  setDiffResponse(responseId) {
    state.diffResponseId = responseId;
  }
};

const attackSurfaceActions = {
  setCategory(category, value) {
    state.attackSurfaceCategories[category] = value;
  },

  markDomain(domain) {
    state.domainsWithAttackSurface.add(domain);
  },

  setAnalyzing(analyzing) {
    state.isAnalyzingAttackSurface = analyzing;
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
  historyActions.add(request, response);
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
