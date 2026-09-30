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

const stateSlices = [
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
];

const state = {};
for (const slice of stateSlices) {
  for (const key of Object.keys(slice)) {
    Object.defineProperty(state, key, {
      enumerable: true,
      get: () => slice[key],
      set: (value) => {
        slice[key] = value;
      },
    });
  }
}

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "unknown";
  }
}

function getRequestSignature(entry) {
  if (!entry || !entry.request) {
    return null;
  }

  const request = entry.request;
  const method = (request.method || "GET").toUpperCase().trim();
  const url = (request.url || "").trim();
  const body = request.postData?.text == null ? "" : String(request.postData.text).trim();
  const headers = requestActions.normalizeHeaders(request.headers);
  const pageUrl = (entry.pageUrl || "").trim();
  return `${method}|${url}|${headers}|${body}|${pageUrl}`;
}

const requestActions = {
  isDuplicate(entry, existingEntries) {
    const signature = getRequestSignature(entry);
    if (signature === null) {
      return false;
    }
    return existingEntries.some((existingEntry) => getRequestSignature(existingEntry) === signature);
  },

  normalizeHeaders(headers) {
    if (!headers) {
      return "";
    }

    const entries = Array.isArray(headers) ? headers : typeof headers === "object" ? Object.entries(headers) : [];
    return entries
      .filter((header) => {
        const name = (header.name || header[0] || "").toLowerCase();
        return name && !name.startsWith(":");
      })
      .map((header) => {
        const name = (header.name || header[0] || "").toLowerCase().trim();
        const value = (header.value || header[1] || "").toLowerCase().trim();
        return `${name}:${value}`;
      })
      .sort()
      .join("|");
  },

  removeDuplicates() {
    const originalCount = state.requests.length;
    if (originalCount === 0) {
      return 0;
    }

    const uniqueRequests = [];
    const signatures = new Set();
    for (const entry of state.requests) {
      const signature = getRequestSignature(entry);
      if (signature === null) {
        uniqueRequests.push(entry);
        continue;
      }
      if (!signatures.has(signature)) {
        signatures.add(signature);
        uniqueRequests.push(entry);
      }
    }

    const removedCount = originalCount - uniqueRequests.length;
    if (removedCount > 0) {
      const selectedRequest = state.selectedRequest;
      state.requests = uniqueRequests;
      if (selectedRequest && !uniqueRequests.includes(selectedRequest)) {
        state.selectedRequest = null;
        events.emit(EVENT_NAMES.UI_CLEAR_ALL);
      }

      const requestList = globalThis.document?.getElementById("request-list");
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

  add(request) {
    request.starred = false;
    request.color = null;
    if (typeof request.name !== "string") {
      request.name = null;
    }

    const removeDuplicates = localStorage.getItem("rep_remove_duplicates") !== "false";
    if (removeDuplicates && this.isDuplicate(request, state.requests)) {
      return null;
    }

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
      const requestList = globalThis.document?.getElementById("request-list");
      events.emit(EVENT_NAMES.REQUEST_FILTERED, {
        preserveScroll: true,
        scrollTop: requestList?.scrollTop || 0,
      });
    }
  },

  toggleGroupStar(groupType, hostname, starred) {
    const isPageGroup = groupType === "page";
    const starredSet = isPageGroup ? state.starredPages : state.starredDomains;
    if (starred) {
      starredSet.add(hostname);
    } else {
      starredSet.delete(hostname);
    }

    state.requests.forEach((request, index) => {
      const pageHostname = request.pageUrl ? getHostname(request.pageUrl) : null;
      const requestHostname = getHostname(request.request.url);
      const belongsToGroup = isPageGroup
        ? pageHostname === hostname && requestHostname === hostname
        : requestHostname === hostname;
      if (belongsToGroup && request.starred !== starred) {
        request.starred = starred;
        events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED, { index, starred });
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
    if (index < 0 || index >= state.requests.length) {
      return;
    }

    const [deletedRequest] = state.requests.splice(index, 1);
    if (state.selectedRequest === deletedRequest) {
      state.selectedRequest = null;
      events.emit(EVENT_NAMES.REQUEST_SELECTED, { request: null, index: -1 });
    }
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
  },

  deleteGroup(groupType, hostname) {
    const isPageGroup = groupType === "page";
    const deletedIndexes = [];
    state.requests.forEach((request, index) => {
      const pageHostname = getHostname(request.pageUrl || request.request.url);
      const requestHostname = getHostname(request.request.url);
      if ((isPageGroup ? pageHostname : requestHostname) === hostname) {
        deletedIndexes.push(index);
      }
    });

    const selectedRequestWasDeleted = deletedIndexes.some(
      (index) => state.requests[index] === state.selectedRequest,
    );
    deletedIndexes.reverse().forEach((index) => state.requests.splice(index, 1));

    const blockedCount = state.blockedQueue.length;
    state.blockedQueue = state.blockedQueue.filter((request) => {
      const pageHostname = getHostname(request.pageUrl || request.request.url);
      const requestHostname = getHostname(request.request.url);
      return (isPageGroup ? pageHostname : requestHostname) !== hostname;
    });
    const removedBlockedCount = blockedCount - state.blockedQueue.length;

    if (isPageGroup) {
      state.starredPages.delete(hostname);
    } else {
      state.starredDomains.delete(hostname);
    }
    state.domainsWithAttackSurface.delete(hostname);

    for (const index of Object.keys(state.attackSurfaceCategories)) {
      const requestIndex = Number.parseInt(index, 10);
      if (requestIndex >= state.requests.length) {
        delete state.attackSurfaceCategories[index];
        continue;
      }
      const request = state.requests[requestIndex];
      const pageHostname = getHostname(request.pageUrl || request.request.url);
      const requestHostname = getHostname(request.request.url);
      if ((isPageGroup ? pageHostname : requestHostname) === hostname) {
        delete state.attackSurfaceCategories[index];
      }
    }

    if (selectedRequestWasDeleted) {
      state.selectedRequest = null;
    }

    events.emit(EVENT_NAMES.REQUEST_FILTERED);
    if (removedBlockedCount > 0) {
      events.emit("block-queue:updated");
    }
    if (state.selectedRequest === null) {
      events.emit(EVENT_NAMES.UI_CLEAR_ALL);
    }
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
  togglePageStar(hostname, starred) {
    if (starred) {
      state.starredPages.add(hostname);
    } else {
      state.starredPages.delete(hostname);
    }
    events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED);
  },

  toggleDomainStar(hostname, starred) {
    if (starred) {
      state.starredDomains.add(hostname);
    } else {
      state.starredDomains.delete(hostname);
    }
    events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED);
  },
};

const blockingActions = {
  setBlocking(enabled) {
    state.blockRequests = enabled;
    if (enabled) {
      state.blockedQueue = [];
    }
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
      if (currentEntry.rawText === rawText && currentEntry.useHttps === useHttps) {
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

  goBack() {
    if (state.historyIndex > 0) {
      state.historyIndex -= 1;
      events.emit(EVENT_NAMES.HISTORY_NAVIGATED, {
        index: state.historyIndex,
        entry: state.requestHistory[state.historyIndex],
      });
      events.emit(EVENT_NAMES.UI_UPDATE_HISTORY_BUTTONS);
    }
  },

  goForward() {
    if (state.historyIndex < state.requestHistory.length - 1) {
      state.historyIndex += 1;
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

  markDomain(hostname) {
    state.domainsWithAttackSurface.add(hostname);
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
