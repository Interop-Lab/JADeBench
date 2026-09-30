const requestState = { requests: [], selectedRequest: null };
const filterState = {
  currentFilter: 'all',
  selectedMethods: new Set(),
  starFilterActive: false,
  currentColorFilter: 'all',
  currentSearchTerm: '',
  useRegex: false
};
const historyState = { historyStack: [], currentIndex: -1 };
const undoRedoState = { undoStack: [], redoStack: [] };
const bulkReplayState = {
  bulkReplayRequests: [],
  bulkReplayMode: 'off',
  bulkReplayActive: false,
  bulkReplayPaused: false
};
const diffState = { diffLeftRequest: null, diffRightRequest: null };
const starringState = { starredPages: new Set(), starredDomains: new Set() };
const timelineState = { timelineFilter: null, timelineSelectedIndex: null };
const uiState = { sidebarCollapsed: false };
const attackSurfaceState = {
  attackSurfaceCategories: {},
  domainsWithAttackSurface: new Set(),
  isAnalyzingAttackSurface: false
};
const blockingState = { isBlocking: false, blockedQueue: [] };

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

  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    });
  }

  off(event, callback) {
    const callbacks = this.listeners.get(event) || [];
    const index = callbacks.indexOf(callback);
    index > -1 && callbacks.splice(index, 1);
  }

  registerListeners(listeners) {
    listeners ? this.listeners.set(listeners) : this.listeners.clear();
  }

  getListeners(event) {
    return (this.listeners.get(event) || []).length;
  }
}

const events = new EventBus();

const EVENT_NAMES = {
  REQUEST_ADDED: 'requestAdded',
  REQUEST_SELECTED: 'requestSelected',
  REQUEST_UPDATED: 'requestUpdated',
  REQUEST_DELETED: 'requestDeleted',
  REQUESTS_CLEARED: 'requestsCleared',
  REQUEST_STAR_TOGGLED: 'requestStarToggled',
  REQUEST_COLOR_SET: 'requestColorSet',
  REQUEST_GROUP_STAR_TOGGLED: 'requestGroupStarToggled',
  REQUEST_GROUP_DELETED: 'requestGroupDeleted',
  FILTER_CHANGED: 'filterChanged',
  METHODS_CHANGED: 'methodsChanged',
  STAR_FILTER_TOGGLED: 'starFilterToggled',
  SEARCH_CHANGED: 'searchChanged',
  COLOR_FILTER_CHANGED: 'colorFilterChanged',
  FILTERS_RESET: 'filtersReset',
  HISTORY_ADDED: 'historyAdded',
  HISTORY_INDEX_CHANGED: 'historyIndexChanged',
  TIMELINE_FILTER_CHANGED: 'timelineFilterChanged',
  TIMELINE_CLEARED: 'timelineCleared',
  BLOCKING_TOGGLED: 'blockingToggled',
  BLOCKED_QUEUE_UPDATED: 'blockedQueueUpdated',
  DIFF_LEFT_REQUEST_SET: 'diffLeftRequestSet',
  DIFF_RIGHT_REQUEST_SET: 'diffRightRequestSet',
  UNDO_REDO_UPDATED: 'undoRedoUpdated',
  BULK_REPLAY_UPDATED: 'bulkReplayUpdated',
  UI_SIDEBAR_TOGGLED: 'uiSidebarToggled',
  ATTACK_SURFACE_UPDATED: 'attackSurfaceUpdated'
};

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
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

function arrayToCSV(data, headers) {
  if (!data || data.length === 0) return headers ? headers.join(',') : '';
  const keys = headers || Object.keys(data[0]);
  const lines = [keys.map(escapeCsvField).join(',')];
  data.forEach(row => {
    const values = keys.map(key => escapeCsvField(row[key]));
    lines.push(values.join(','));
  });
  return lines.join('\n');
}

function downloadCSV(data, filename, headers = null) {
  const csv = arrayToCSV(data, headers);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function copyToClipboard(text, button) {
  const isSecure = window.location.protocol === 'https:';
  if (!isSecure) {
    try {
      await navigator.clipboard.writeText(text);
      button && showCopySuccess(button);
      return;
    } catch (error) {
      if (!error.name?.includes('NotAllowed') && !error.message?.includes('NotAllowed')) {
        console.error('Clipboard copy failed:', error);
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
    textarea.select();
    textarea.setSelectionRange(0, 99999);

    if (navigator.userAgent.match(/ipad|iphone/i)) {
      const range = document.createRange();
      range.selectNodeContents(textarea);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      textarea.setSelectionRange(0, 99999);
    }

    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (successful) {
      button && showCopySuccess(button);
    } else {
      throw new Error('Copy command failed');
    }
  } catch (error) {
    console.error('Clipboard copy failed:', error);
    if (button) {
      const originalText = button.innerHTML;
      button.innerHTML = 'Copy failed!';
      setTimeout(() => {
        if (button) {
          button.innerHTML = originalText;
        }
      }, 2000);
    }
  }
}

function showCopySuccess(button) {
  if (!button) return;
  const originalText = button.innerHTML;
  button.innerHTML = 'Copied!';
  setTimeout(() => {
    if (button) {
      button.innerHTML = originalText;
    }
  }, 2000);
}

function getHostname(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch (error) {
    return null;
  }
}

function highlightHTTP(text) {
  if (!text) return '';
  const lines = text.split('\n');
  let hasBody = false;
  let bodyStartIndex = -1;
  const isJsonResponse = lines.length > 0 && lines[0].trim().startsWith('{');

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '') {
      hasBody = true;
      bodyStartIndex = i;
      break;
    }
  }

  let result = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (i === 0) {
      const spaceIndex = line.indexOf(' ');
      if (spaceIndex > -1) {
        const method = line.substring(0, spaceIndex);
        const rest = line.substring(spaceIndex + 1);
        result += '<span class="http-method">' + escapeHtml(method) + '</span>';

        let urlPart = rest;
        let httpVersion = '';
        const httpRegex = /(\s*HTTP\/\d+(\.\d+)?|\s+([hH]\d+|QUIC))$/i;
        const match = rest.match(httpRegex);

        if (match) {
          urlPart = rest.substring(0, match.index);
          httpVersion = rest.substring(match.index);
        }

        const queryIndex = urlPart.indexOf('?');
        if (queryIndex > -1) {
          result += '<span class="http-url">' + escapeHtml(urlPart.substring(0, queryIndex)) + '</span>';
          result += highlightParams(urlPart.substring(queryIndex + 1));
        } else {
          result += '<span class="http-url">' + escapeHtml(urlPart) + '</span>';
        }

        if (httpVersion) {
          result += '<span class="http-version">' + escapeHtml(httpVersion) + '</span>';
        }
      } else {
        result += escapeHtml(line);
      }
    } else {
      if (!hasBody || i < bodyStartIndex) {
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1) {
          const headerName = line.substring(0, colonIndex);
          const headerValue = line.substring(colonIndex + 1);
          result += '<span class="http-header-name">' + escapeHtml(headerName) + '</span>';
          result += '<span class="http-header-separator">:</span>';

          if (headerName.toLowerCase().trim() === 'cookie') {
            result += highlightCookies(headerValue);
          } else {
            result += '<span class="http-header-value">' + escapeHtml(headerValue) + '</span>';
          }
        } else {
          result += escapeHtml(line);
        }
      } else {
        if (i === bodyStartIndex) {
          result += '';
        } else {
          const bodyContent = lines.slice(bodyStartIndex + 1).join('\n');
          let highlighted = highlightJSON(bodyContent);
          if (!isJsonResponse && highlighted === escapeHtml(bodyContent)) {
            highlighted = highlightParams(bodyContent);
          }
          result += highlighted;
          break;
        }
      }
    }

    if (i < lines.length - 1) {
      result += '\n';
    }
  }

  return result;
}

function highlightJSON(text) {
  try {
    JSON.parse(text);
    return text.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, match => {
      let cls = 'json-string';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key';
        } else {
          cls = 'json-string';
        }
      } else {
        if (/true|false/.test(match)) {
          cls = 'json-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
      }
      return '<span class="' + cls + '">' + escapeHtml(match) + '</span>';
    });
  } catch (error) {
    return escapeHtml(text);
  }
}

function highlightParams(text) {
  if (text.trim().startsWith('<')) return escapeHtml(text);
  if (text.indexOf('=') === -1) return escapeHtml(text);

  return text.split('&').map(param => {
    const equalIndex = param.indexOf('=');
    if (equalIndex > -1) {
      const key = param.substring(0, equalIndex);
      const value = param.substring(equalIndex + 1);
      return '<span class="param-key">' + escapeHtml(key) + '</span><span class="param-value">' + escapeHtml(value) + '</span>';
    } else {
      return escapeHtml(param);
    }
  }).join('&');
}

function highlightCookies(text) {
  return text.split(';').map(cookie => {
    const equalIndex = cookie.indexOf('=');
    if (equalIndex > -1) {
      const name = cookie.substring(0, equalIndex);
      const value = cookie.substring(equalIndex + 1);
      return '<span class="cookie-name">' + escapeHtml(name) + '</span><span class="cookie-value">' + escapeHtml(value) + '</span>';
    } else {
      return escapeHtml(cookie);
    }
  }).join(';');
}

const requestActions = {
  isDuplicate(newRequest, existingRequests) {
    if (!newRequest || !newRequest.request) return false;
    const req = newRequest.request;
    const method = (req.method || 'GET').toUpperCase().trim();
    const url = (req.url || '').trim();
    const body = req.body && req.body.text ? String(req.body.text).trim() : '';
    const headers = this.normalizeHeaders(req.headers);
    const response = (newRequest.response || '').trim();
    const signature = method + '|' + url + '|' + headers + '|' + body + '|' + response;

    for (const existing of existingRequests) {
      if (!existing || !existing.request) continue;
      const exReq = existing.request;
      const exMethod = (exReq.method || 'GET').toUpperCase().trim();
      const exUrl = (exReq.url || '').trim();
      const exBody = exReq.body && exReq.body.text ? String(exReq.body.text).trim() : '';
      const exHeaders = this.normalizeHeaders(exReq.headers);
      const exResponse = (existing.response || '').trim();
      const exSignature = exMethod + '|' + exUrl + '|' + exHeaders + '|' + exBody + '|' + exResponse;
      if (signature === exSignature) return true;
    }
    return false;
  },

  normalizeHeaders(headers) {
    if (!headers) return '';
    let headerArray = [];
    if (Array.isArray(headers)) {
      headerArray = headers;
    } else {
      if (typeof headers === 'object') {
        headerArray = Object.entries(headers);
      } else {
        return '';
      }
    }

    const normalized = headerArray.map(header => {
      const name = (header.name || header[0] || '').toUpperCase().trim();
      const value = (header.value || header[1] || '').toString().trim();
      return name + ':' + value;
    }).join('|');

    return normalized;
  },

  removeDuplicates() {
    const initialCount = state.requests.length;
    if (initialCount === 0) return 0;

    const uniqueRequests = [];
    const seenSignatures = new Set();

    for (const request of state.requests) {
      if (!request || !request.request) {
        uniqueRequests.push(request);
        continue;
      }

      const req = request.request;
      const method = (req.method || 'GET').toUpperCase().trim();
      const url = (req.url || '').trim();
      const body = req.body && req.body.text ? String(req.body.text).trim() : '';
      const headers = this.normalizeHeaders(req.headers);
      const response = (request.response || '').trim();
      const signature = method + '|' + url + '|' + headers + '|' + body + '|' + response;

      if (!seenSignatures.has(signature)) {
        seenSignatures.add(signature);
        uniqueRequests.push(request);
      } else {
        console.log('Duplicate request removed:', signature.substring(0, 100) + '...');
      }
    }

    console.log('Remove duplicates: ' + initialCount + ' -> ' + uniqueRequests.length + ' (' + (initialCount - uniqueRequests.length) + ' removed)');

    const removedCount = initialCount - uniqueRequests.length;

    if (removedCount > 0) {
      const selectedRequest = state.selectedRequest;
      state.requests = uniqueRequests;

      if (selectedRequest && !uniqueRequests.includes(selectedRequest)) {
        state.selectedRequest = null;
        events.emit(EVENT_NAMES.REQUEST_SELECTED);
      } else if (selectedRequest) {
        state.selectedRequest = selectedRequest;
      }

      const requestList = document.getElementById('request-list');
      if (requestList) {
        requestList.innerHTML = '';
      }

      uniqueRequests.forEach((request, index) => {
        const detail = { request: request, index: index };
        events.emit(EVENT_NAMES.REQUEST_UPDATED, detail);
      });

      events.emit(EVENT_NAMES.REQUESTS_CLEARED);
    }

    return removedCount;
  },

  add(newRequest) {
    newRequest.starred = false;
    newRequest.color = null;

    if (typeof newRequest.response === 'undefined') {
      newRequest.response = null;
    }

    const removeDuplicatesEnabled = localStorage.getItem('removeDuplicates') === 'true';
    if (removeDuplicatesEnabled && this.isDuplicate(newRequest, state.requests)) {
      return null;
    }

    state.requests.push(newRequest);
    const newCount = state.requests.length;
    const detail = { request: newRequest, count: newCount };
    events.emit(EVENT_NAMES.REQUEST_ADDED, detail);
    return newCount;
  },

  select(request, index) {
    state.selectedRequest = request;
    const detail = { request: request, index: index };
    events.emit(EVENT_NAMES.REQUEST_SELECTED, detail);
  },

  clearAll() {
    state.requests = [];
    state.selectedRequest = null;
    state.historyStack = [];
    state.currentIndex = -1;
    state.undoStack = [];
    state.redoStack = [];
    state.bulkReplayRequests = [];
    state.bulkReplayMode = 'off';
    state.bulkReplayActive = false;
    state.bulkReplayPaused = false;
    state.diffLeftRequest = null;
    state.diffRightRequest = null;
    state.timelineFilter = null;
    state.timelineSelectedIndex = null;
    state.attackSurfaceCategories = {};
    state.domainsWithAttackSurface = new Set();
    state.isAnalyzingAttackSurface = false;
    state.isBlocking = false;
    state.blockedQueue = [];
    state.starredPages = new Set();
    state.starredDomains = new Set();
    events.emit(EVENT_NAMES.REQUESTS_CLEARED);
    events.emit(EVENT_NAMES.HISTORY_CLEARED);
  },

  toggleStar(request, index) {
    request.starred = !request.starred;
    const detail = { request: request, index: index };
    events.emit(EVENT_NAMES.REQUEST_STAR_TOGGLED, detail);

    if (state.starFilterActive) {
      const requestList = document.getElementById('request-list');
      const scrollTop = requestList ? requestList.scrollTop : 0;
      const filterDetail = { starFilterActive: true, scrollTop: scrollTop };
      events.emit(EVENT_NAMES.FILTER_CHANGED, filterDetail);
    }
  },

  toggleGroupStar(isDomain, hostname, starState) {
    const isStarred = isDomain ? state.starredDomains.has(hostname) : state.starredPages.has(hostname);

    if (isStarred) {
      if (starState) {
        state.starredDomains.add(hostname);
      } else {
        state.starredDomains.delete(hostname);
      }
    } else {
      if (starState) {
        state.starredPages.add(hostname);
      } else {
        state.starredPages.delete(hostname);
      }
    }

    state.requests.forEach((request, index) => {
      const requestHostname = request.referrer ? new URL(request.referrer).hostname : null;
      const urlHostname = new URL(request.request.url).hostname;
      let shouldStar = false;

      if (isDomain) {
        if (requestHostname === hostname && urlHostname === hostname) {
          shouldStar = true;
        }
      } else {
        if (urlHostname === hostname) {
          shouldStar = true;
        }
      }

      if (shouldStar && request.starred !== starState) {
        request.starred = starState;
        const detail = { index: index, starred: starState };
        events.emit(EVENT_NAMES.REQUEST_STAR_TOGGLED, detail);
      }
    });

    events.emit(EVENT_NAMES.STAR_FILTER_TOGGLED);
  },

  setColor(index, color) {
    if (index >= 0 && index < state.requests.length) {
      state.requests[index].color = color;
      const detail = { index: index, color: color };
      events.emit(EVENT_NAMES.REQUEST_COLOR_SET, detail);
    }
  },

  delete(index) {
    if (index >= 0 && index < state.requests.length) {
      const deletedRequest = state.requests[index];
      state.requests.splice(index, 1);

      if (state.selectedRequest === deletedRequest) {
        state.selectedRequest = null;
        const detail = { request: null, index: -1 };
        events.emit(EVENT_NAMES.REQUEST_SELECTED, detail);
      }

      events.emit(EVENT_NAMES.REQUESTS_CLEARED);
    }
  },

  deleteGroup(isDomain, hostname) {
    const isStarred = isDomain ? state.starredDomains.has(hostname) : state.starredPages.has(hostname);
    const indicesToRemove = [];

    state.requests.forEach((request, index) => {
      const requestHostname = getHostname(request.referrer || request.request.url);
      const urlHostname = getHostname(request.request.url);
      let shouldRemove = false;

      if (isDomain) {
        shouldRemove = requestHostname === hostname;
      } else {
        shouldRemove = urlHostname === hostname;
      }

      if (shouldRemove) {
        indicesToRemove.push(index);
      }
    });

    indicesToRemove.reverse().forEach(index => {
      state.requests.splice(index, 1);
    });

    const previousCount = state.requests.length;
    state.requests = state.requests.filter(request => {
      const requestHostname = getHostname(request.referrer || request.request.url);
      const urlHostname = getHostname(request.request.url);
      if (isDomain) {
        return requestHostname !== hostname;
      }
      return urlHostname !== hostname;
    });

    if (isDomain) {
      state.starredDomains.delete(hostname);
    } else {
      state.starredPages.delete(hostname);
    }

    Object.keys(state.attackSurfaceCategories).forEach(key => {
      const id = parseInt(key);
      if (id === state.requests.length) {
        const request = state.requests[id];
        const requestHostname = getHostname(request.referrer || request.request.url);
        const urlHostname = getHostname(request.request.url);
        if (isDomain) {
          if (requestHostname === hostname) {
            delete state.attackSurfaceCategories[key];
          }
        } else {
          if (urlHostname === hostname) {
            delete state.attackSurfaceCategories[key];
          }
        }
      } else {
        delete state.attackSurfaceCategories[key];
      }
    });

    const selectedIndex = state.requests.indexOf(state.selectedRequest);
    state.selectedRequest && (selectedIndex === -1 || indicesToRemove.includes(selectedIndex)) && (state.selectedRequest = null);

    events.emit(EVENT_NAMES.REQUEST_GROUP_DELETED);

    if (previousCount > 0) {
      events.emit(EVENT_NAMES.REQUESTS_CLEARED);
    }

    return state.selectedRequest !== null && events.emit(EVENT_NAMES.REQUEST_SELECTED), previousCount;
  }
};

const filterActions = {
  setFilter(filter) {
    state.currentFilter = filter;
    const detail = { filter: filter };
    events.emit(EVENT_NAMES.FILTER_CHANGED, detail);
    events.emit(EVENT_NAMES.FILTERS_RESET);
  },

  setSelectedMethods(methods) {
    state.selectedMethods = methods;
    if (methods.size === 1) {
      state.currentFilter = 'method';
    } else if (methods.size > 1) {
      state.currentFilter = Array.from(methods)[0];
    } else {
      state.currentFilter = 'all';
    }
    const detail = { methods: methods };
    events.emit(EVENT_NAMES.METHODS_CHANGED, detail);
    events.emit(EVENT_NAMES.FILTERS_RESET);
  },

  setStarFilter(active) {
    state.starFilterActive = active;
    if (active) {
      state.currentFilter = 'starred';
    } else {
      state.currentFilter = 'all';
    }
    const detail = { starFilterActive: active };
    events.emit(EVENT_NAMES.STAR_FILTER_TOGGLED, detail);
    events.emit(EVENT_NAMES.FILTERS_RESET);
  },

  setSearch(term, useRegex = false) {
    state.currentSearchTerm = term;
    state.useRegex = useRegex;
    const detail = { term: term, useRegex: useRegex };
    events.emit(EVENT_NAMES.SEARCH_CHANGED, detail);
    events.emit(EVENT_NAMES.FILTERS_RESET);
  },

  setColorFilter(color) {
    state.currentColorFilter = color;
    const detail = { color: color };
    events.emit(EVENT_NAMES.COLOR_FILTER_CHANGED, detail);
    events.emit(EVENT_NAMES.FILTERS_RESET);
  }
};

const starringActions = {
  togglePageStar(page, starState) {
    if (starState) {
      state.starredPages.add(page);
    } else {
      state.starredPages.delete(page);
    }
    events.emit(EVENT_NAMES.REQUEST_STAR_TOGGLED);
  },

  toggleDomainStar(domain, starState) {
    if (starState) {
      state.starredDomains.add(domain);
    } else {
      state.starredDomains.delete(domain);
    }
    events.emit(EVENT_NAMES.REQUEST_GROUP_STAR_TOGGLED);
  }
};

const blockingActions = {
  setBlocking(isBlocking) {
    state.isBlocking = isBlocking;
    if (isBlocking) {
      state.blockedQueue = [];
    }
    events.emit(EVENT_NAMES.BLOCKING_TOGGLED);
  },

  addToBlockedQueue(request) {
    state.blockedQueue.push(request);
    events.emit(EVENT_NAMES.BLOCKED_QUEUE_UPDATED);
  },

  clearBlockedQueue() {
    state.blockedQueue = [];
    events.emit(EVENT_NAMES.BLOCKED_QUEUE_UPDATED);
  }
};

const timelineActions = {
  setFilter(filter, selectedIndex) {
    state.timelineFilter = filter;
    state.timelineSelectedIndex = selectedIndex;
    events.emit(EVENT_NAMES.TIMELINE_FILTER_CHANGED);
  },

  clear() {
    state.timelineFilter = null;
    state.timelineSelectedIndex = null;
    events.emit(EVENT_NAMES.TIMELINE_CLEARED);
  }
};

const historyActions = {
  add(request, response) {
    if (state.currentIndex >= 0) {
      const current = state.historyStack[state.currentIndex];
      if (current.request === request && current.response === response) {
        return;
      }
    }

    if (state.currentIndex < state.historyStack.length - 1) {
      state.historyStack = state.historyStack.slice(0, state.currentIndex + 1);
    }

    const entry = { request: request, response: response };
    state.historyStack.push(entry);
    state.currentIndex = state.historyStack.length - 1;
    events.emit(EVENT_NAMES.HISTORY_ADDED);
    events.emit(EVENT_NAMES.UNDO_REDO_UPDATED);
  },

  goBack() {
    if (state.currentIndex > 0) {
      state.currentIndex--;
      const detail = { index: state.currentIndex, entry: state.historyStack[state.currentIndex] };
      events.emit(EVENT_NAMES.HISTORY_INDEX_CHANGED, detail);
      events.emit(EVENT_NAMES.UNDO_REDO_UPDATED);
    }
  },

  goForward() {
    if (state.currentIndex < state.historyStack.length - 1) {
      state.currentIndex++;
      const detail = { index: state.currentIndex, entry: state.historyStack[state.currentIndex] };
      events.emit(EVENT_NAMES.HISTORY_INDEX_CHANGED, detail);
      events.emit(EVENT_NAMES.UNDO_REDO_UPDATED);
    }
  }
};

const diffActions = {
  setLeftRequest(request) {
    state.diffLeftRequest = request;
  },
  setRightRequest(request) {
    state.diffRightRequest = request;
  }
};

const attackSurfaceActions = {
  setCategory(category, value) {
    state.attackSurfaceCategories[category] = value;
  },

  markDomain(domain) {
    state.domainsWithAttackSurface.add(domain);
  },

  setAnalyzing(isAnalyzing) {
    state.isAnalyzingAttackSurface = isAnalyzing;
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
