var requestState = {
  requests: [],
  selectedRequest: null
};
var filterState = {
  currentFilter: "all",
  selectedMethods: new Set(),
  starFilterActive: false,
  currentColorFilter: "all",
  currentSearchTerm: "",
  useRegex: false
};
const _0x5677cc = {
  requestHistory: [],
  historyIndex: -1
};
var historyState = _0x5677cc;
var undoRedoState = {
  undoStack: [],
  redoStack: []
};
var bulkReplayState = {
  positionConfigs: [],
  currentAttackType: "sniper",
  shouldStopBulk: false,
  shouldPauseBulk: false
};
var diffState = {
  regularRequestBaseline: null,
  currentResponse: null
};
var starringState = {
  starredPages: new Set(),
  starredDomains: new Set()
};
var timelineState = {
  timelineFilterTimestamp: null,
  timelineFilterRequestIndex: null
};
var uiState = {
  manuallyCollapsed: false
};
var attackSurfaceState = {
  attackSurfaceCategories: {},
  domainsWithAttackSurface: new Set(),
  isAnalyzingAttackSurface: false
};
var blockingState = {
  blockRequests: false,
  blockedQueue: []
};
var EventBus = class {
  constructor() {
    this.listeners = new Map();
  }
  on(_0x3650d4, _0x3cbf58) {
    if (!this.listeners.has(_0x3650d4)) {
      this.listeners.set(_0x3650d4, []);
    }
    this.listeners.get(_0x3650d4).push(_0x3cbf58);
    return () => this.off(_0x3650d4, _0x3cbf58);
  }
  emit(_0x4509ac, _0x5c0bdd) {
    const _0x4c7ffa = this.listeners.get(_0x4509ac) || [];
    _0x4c7ffa.forEach(_0x1cc1a4 => {
      try {
        _0x1cc1a4(_0x5c0bdd);
      } catch (_0x3571d3) {
        console.error("Error in event listener for \"" + _0x4509ac + "\":", _0x3571d3);
      }
    });
  }
  off(_0x3d12c7, _0xe32304) {
    const _0x3cb4e4 = this.listeners.get(_0x3d12c7) || [];
    const _0x3f4e79 = _0x3cb4e4.indexOf(_0xe32304);
    if (_0x3f4e79 > -1) {
      _0x3cb4e4.splice(_0x3f4e79, 1);
    }
  }
  removeAllListeners(_0x4aac10) {
    if (_0x4aac10) {
      this.listeners.delete(_0x4aac10);
    } else {
      this.listeners.clear();
    }
  }
  listenerCount(_0x4548eb) {
    return (this.listeners.get(_0x4548eb) || []).length;
  }
};
var events = new EventBus();
var EVENT_NAMES = {
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
function escapeHtml(_0x19eb0f) {
  const _0x5cb7c7 = document.createElement("div");
  _0x5cb7c7.textContent = _0x19eb0f;
  return _0x5cb7c7.innerHTML;
}
function escapeCsvField(_0x18d16c) {
  if (_0x18d16c == null) {
    return "";
  }
  const _0x5c92a3 = String(_0x18d16c);
  if (_0x5c92a3.includes(",") || _0x5c92a3.includes("\"") || _0x5c92a3.includes("\n") || _0x5c92a3.includes("\r")) {
    return "\"" + _0x5c92a3.replace(/"/g, "\"\"") + "\"";
  }
  return _0x5c92a3;
}
function arrayToCSV(_0x5d2bb2, _0x2123c8) {
  if (!_0x5d2bb2 || _0x5d2bb2.length === 0) {
    if (_0x2123c8) {
      return _0x2123c8.join(",");
    } else {
      return "";
    }
  }
  const _0x41f747 = _0x2123c8 || Object.keys(_0x5d2bb2[0]);
  const _0x1bfeb1 = [_0x41f747.map(escapeCsvField).join(",")];
  _0x5d2bb2.forEach(_0x3be7c1 => {
    const _0x43e29a = _0x41f747.map(_0x324354 => {
      const _0x265a08 = _0x3be7c1[_0x324354];
      return escapeCsvField(_0x265a08);
    });
    _0x1bfeb1.push(_0x43e29a.join(","));
  });
  return _0x1bfeb1.join("\n");
}
function downloadCSV(_0x27a684, _0x2b0f46, _0x25958c = null) {
  const _0x34c333 = arrayToCSV(_0x27a684, _0x25958c);
  const _0x5147a6 = new Blob([_0x34c333], {
    type: "text/csv;charset=utf-8;"
  });
  const _0x160ed6 = URL.createObjectURL(_0x5147a6);
  const _0x153283 = document.createElement("a");
  _0x153283.href = _0x160ed6;
  _0x153283.download = _0x2b0f46;
  document.body.appendChild(_0x153283);
  _0x153283.click();
  document.body.removeChild(_0x153283);
  URL.revokeObjectURL(_0x160ed6);
}
function downloadJSON(_0x339c6c, _0x2816b4) {
  const _0x42a024 = JSON.stringify(_0x339c6c, null, 2);
  const _0x570faf = new Blob([_0x42a024], {
    type: "application/json;charset=utf-8;"
  });
  const _0x570363 = URL.createObjectURL(_0x570faf);
  const _0x6d2b63 = document.createElement("a");
  _0x6d2b63.href = _0x570363;
  _0x6d2b63.download = _0x2816b4;
  document.body.appendChild(_0x6d2b63);
  _0x6d2b63.click();
  document.body.removeChild(_0x6d2b63);
  URL.revokeObjectURL(_0x570363);
}
async function copyToClipboard(_0x4c328f, _0x49c2b4) {
  const _0x3b6306 = window.location.protocol === "devtools:";
  if (!_0x3b6306) {
    try {
      await navigator.clipboard.writeText(_0x4c328f);
      if (_0x49c2b4) {
        showCopySuccess(_0x49c2b4);
      }
      return;
    } catch (_0x33eae2) {
      if (!_0x33eae2.message?.includes("permissions policy") && !_0x33eae2.message?.includes("Permissions policy")) {
        console.warn("Clipboard API failed, trying fallback:", _0x33eae2);
      }
    }
  }
  try {
    const _0x5e339d = document.createElement("textarea");
    _0x5e339d.value = _0x4c328f;
    _0x5e339d.style.position = "fixed";
    _0x5e339d.style.left = "-9999px";
    _0x5e339d.style.top = "0";
    _0x5e339d.style.opacity = "0";
    _0x5e339d.style.pointerEvents = "none";
    document.body.appendChild(_0x5e339d);
    _0x5e339d.focus();
    _0x5e339d.select();
    if (navigator.userAgent.match(/ipad|iphone/i)) {
      const _0xc5bd34 = document.createRange();
      _0xc5bd34.selectNodeContents(_0x5e339d);
      const _0x165de8 = window.getSelection();
      _0x165de8.removeAllRanges();
      _0x165de8.addRange(_0xc5bd34);
      _0x5e339d.setSelectionRange(0, 999999);
    }
    const _0x5ccdb2 = document.execCommand("copy");
    document.body.removeChild(_0x5e339d);
    if (_0x5ccdb2) {
      if (_0x49c2b4) {
        showCopySuccess(_0x49c2b4);
      }
    } else {
      throw new Error("execCommand copy failed");
    }
  } catch (_0x5b39fd) {
    console.error("Copy to clipboard failed:", _0x5b39fd);
    if (_0x49c2b4) {
      const _0x428589 = _0x49c2b4.innerHTML;
      _0x49c2b4.innerHTML = "<svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z\" fill=\"#f28b82\"/></svg>";
      setTimeout(() => {
        if (_0x49c2b4) {
          _0x49c2b4.innerHTML = _0x428589;
        }
      }, 1500);
    }
  }
}
function showCopySuccess(_0x3f6058) {
  if (!_0x3f6058) {
    return;
  }
  const _0xefea7e = _0x3f6058.innerHTML;
  _0x3f6058.innerHTML = "<svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\"><path d=\"M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z\" fill=\"#81c995\"/></svg>";
  setTimeout(() => {
    if (_0x3f6058) {
      _0x3f6058.innerHTML = _0xefea7e;
    }
  }, 1500);
}
function getHostname(_0x122541) {
  try {
    const _0x4a85ee = new URL(_0x122541);
    return _0x4a85ee.hostname;
  } catch (_0x13bea4) {
    return "unknown";
  }
}
function highlightHTTP(_0x2689c8) {
  if (!_0x2689c8) {
    return "";
  }
  const _0x2a5ef4 = _0x2689c8.split("\n");
  let _0x21104b = false;
  let _0x2b7ac6 = -1;
  const _0x121348 = _0x2a5ef4[0] && _0x2a5ef4[0].toUpperCase().startsWith("HTTP/");
  for (let _0xe806 = 0; _0xe806 < _0x2a5ef4.length; _0xe806++) {
    if (_0x2a5ef4[_0xe806].trim() === "") {
      _0x21104b = true;
      _0x2b7ac6 = _0xe806;
      break;
    }
  }
  let _0x5d31b0 = "";
  for (let _0x3101dd = 0; _0x3101dd < _0x2a5ef4.length; _0x3101dd++) {
    const _0x363a95 = _0x2a5ef4[_0x3101dd];
    if (_0x3101dd === 0) {
      const _0x5022c8 = _0x363a95.indexOf(" ");
      if (_0x5022c8 > -1) {
        const _0x5de6da = _0x363a95.substring(0, _0x5022c8);
        const _0x30dfe9 = _0x363a95.substring(_0x5022c8 + 1);
        _0x5d31b0 += "<span class=\"http-method\">" + escapeHtml(_0x5de6da) + "</span> ";
        let _0x2ad6c8 = _0x30dfe9;
        let _0x244f20 = "";
        const _0x3d1d62 = /(\s*HTTP\/\d+(\.\d+)?|\s+([hH]\d+|QUIC))$/i;
        const _0x4d1bd5 = _0x30dfe9.match(_0x3d1d62);
        if (_0x4d1bd5) {
          _0x2ad6c8 = _0x30dfe9.substring(0, _0x4d1bd5.index);
          _0x244f20 = _0x30dfe9.substring(_0x4d1bd5.index);
        }
        const _0x375229 = _0x2ad6c8.indexOf("?");
        if (_0x375229 > -1) {
          _0x5d31b0 += "<span class=\"http-path\">" + escapeHtml(_0x2ad6c8.substring(0, _0x375229)) + "</span>?";
          _0x5d31b0 += highlightParams(_0x2ad6c8.substring(_0x375229 + 1));
        } else {
          _0x5d31b0 += "<span class=\"http-path\">" + escapeHtml(_0x2ad6c8) + "</span>";
        }
        if (_0x244f20) {
          _0x5d31b0 += "<span class=\"http-version\">" + escapeHtml(_0x244f20) + "</span>";
        }
      } else {
        _0x5d31b0 += escapeHtml(_0x363a95);
      }
    } else if (!_0x21104b || _0x3101dd < _0x2b7ac6) {
      const _0x16ddb1 = _0x363a95.indexOf(":");
      if (_0x16ddb1 > 0) {
        const _0x4b0688 = _0x363a95.substring(0, _0x16ddb1);
        const _0x11bf35 = _0x363a95.substring(_0x16ddb1 + 1);
        _0x5d31b0 += "<span class=\"http-header-name\">" + escapeHtml(_0x4b0688) + "</span>";
        _0x5d31b0 += "<span class=\"http-colon\">:</span>";
        if (_0x4b0688.trim().toLowerCase() === "cookie") {
          _0x5d31b0 += highlightCookies(_0x11bf35);
        } else {
          _0x5d31b0 += "<span class=\"http-header-value\">" + escapeHtml(_0x11bf35) + "</span>";
        }
      } else {
        _0x5d31b0 += escapeHtml(_0x363a95);
      }
    } else if (_0x3101dd === _0x2b7ac6) {
      _0x5d31b0 += "";
    } else {
      const _0x3f9f30 = _0x2a5ef4.slice(_0x2b7ac6 + 1).join("\n");
      let _0x18b35e = highlightJSON(_0x3f9f30);
      if (!_0x121348 && _0x18b35e === escapeHtml(_0x3f9f30)) {
        _0x18b35e = highlightParams(_0x3f9f30);
      }
      _0x5d31b0 += _0x18b35e;
      break;
    }
    if (_0x3101dd < _0x2a5ef4.length - 1) {
      _0x5d31b0 += "\n";
    }
  }
  return _0x5d31b0;
}
function highlightJSON(_0x383f22) {
  try {
    JSON.parse(_0x383f22);
    return _0x383f22.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, _0x2736fd => {
      let _0x6cf6db = "json-number";
      if (/^"/.test(_0x2736fd)) {
        if (/:$/.test(_0x2736fd)) {
          _0x6cf6db = "json-key";
        } else {
          _0x6cf6db = "json-string";
        }
      } else if (/true|false/.test(_0x2736fd)) {
        _0x6cf6db = "json-boolean";
      } else if (/null/.test(_0x2736fd)) {
        _0x6cf6db = "json-null";
      }
      return "<span class=\"" + _0x6cf6db + "\">" + escapeHtml(_0x2736fd) + "</span>";
    });
  } catch (_0x137532) {
    return escapeHtml(_0x383f22);
  }
}
function highlightParams(_0x3382a3) {
  if (_0x3382a3.trim().startsWith("<")) {
    return escapeHtml(_0x3382a3);
  }
  if (_0x3382a3.indexOf("=") === -1) {
    return escapeHtml(_0x3382a3);
  }
  return _0x3382a3.split("&").map(_0x10f8a3 => {
    const _0x10e7f6 = _0x10f8a3.indexOf("=");
    if (_0x10e7f6 > -1) {
      const _0x1330d1 = _0x10f8a3.substring(0, _0x10e7f6);
      const _0x28936d = _0x10f8a3.substring(_0x10e7f6 + 1);
      return "<span class=\"param-key\">" + escapeHtml(_0x1330d1) + "</span>=<span class=\"param-value\">" + escapeHtml(_0x28936d) + "</span>";
    } else {
      return escapeHtml(_0x10f8a3);
    }
  }).join("&");
}
function highlightCookies(_0x4d2cf8) {
  return _0x4d2cf8.split(";").map(_0x582117 => {
    const _0x107797 = _0x582117.indexOf("=");
    if (_0x107797 > -1) {
      const _0x209534 = _0x582117.substring(0, _0x107797);
      const _0x10cce1 = _0x582117.substring(_0x107797 + 1);
      return "<span class=\"cookie-key\">" + escapeHtml(_0x209534) + "</span>=<span class=\"cookie-value\">" + escapeHtml(_0x10cce1) + "</span>";
    } else {
      return escapeHtml(_0x582117);
    }
  }).join(";");
}
var requestActions = {
  isDuplicate(_0x342025, _0x8a831b) {
    if (!_0x342025 || !_0x342025.request) {
      return false;
    }
    const _0x27a4d9 = _0x342025.request;
    const _0x712d78 = (_0x27a4d9.method || "GET").toUpperCase().trim();
    const _0x308a20 = (_0x27a4d9.url || "").trim();
    const _0x57bdda = _0x27a4d9.postData && _0x27a4d9.postData.text ? String(_0x27a4d9.postData.text).trim() : "";
    const _0x41dfee = this.normalizeHeaders(_0x27a4d9.headers);
    const _0x1f0db3 = (_0x342025.pageUrl || "").trim();
    const _0x53f9de = _0x712d78 + "|" + _0x308a20 + "|" + _0x41dfee + "|" + _0x57bdda + "|" + _0x1f0db3;
    for (const _0x553514 of _0x8a831b) {
      if (!_0x553514 || !_0x553514.request) {
        continue;
      }
      const _0x15ef0a = _0x553514.request;
      const _0x482e17 = (_0x15ef0a.method || "GET").toUpperCase().trim();
      const _0x2cdd98 = (_0x15ef0a.url || "").trim();
      const _0x1d27fc = _0x15ef0a.postData && _0x15ef0a.postData.text ? String(_0x15ef0a.postData.text).trim() : "";
      const _0xe16b17 = this.normalizeHeaders(_0x15ef0a.headers);
      const _0x36dbf5 = (_0x553514.pageUrl || "").trim();
      const _0x5d3a0e = _0x482e17 + "|" + _0x2cdd98 + "|" + _0xe16b17 + "|" + _0x1d27fc + "|" + _0x36dbf5;
      if (_0x53f9de === _0x5d3a0e) {
        return true;
      }
    }
    return false;
  },
  normalizeHeaders(_0x5e9d05) {
    if (!_0x5e9d05) {
      return "";
    }
    let _0x2ee330 = [];
    if (Array.isArray(_0x5e9d05)) {
      _0x2ee330 = _0x5e9d05;
    } else if (typeof _0x5e9d05 === "object") {
      _0x2ee330 = Object.entries(_0x5e9d05);
    } else {
      return "";
    }
    const _0x4ec0d5 = _0x2ee330.filter(_0x477de8 => {
      const _0x56e01e = (_0x477de8.name || _0x477de8[0] || "").toLowerCase();
      return _0x56e01e && !_0x56e01e.startsWith(":");
    }).map(_0x182350 => {
      const _0xedc835 = (_0x182350.name || _0x182350[0] || "").toLowerCase().trim();
      const _0x19a089 = (_0x182350.value || _0x182350[1] || "").toLowerCase().trim();
      return _0xedc835 + ":" + _0x19a089;
    }).sort().join("|");
    return _0x4ec0d5;
  },
  removeDuplicates() {
    const _0x365b13 = state.requests.length;
    if (_0x365b13 === 0) {
      return 0;
    }
    const _0x3d7434 = [];
    const _0x577074 = new Set();
    for (const _0x38905d of state.requests) {
      if (!_0x38905d || !_0x38905d.request) {
        _0x3d7434.push(_0x38905d);
        continue;
      }
      const _0x383f04 = _0x38905d.request;
      const _0x2960bd = (_0x383f04.method || "GET").toUpperCase().trim();
      const _0x1fbcb5 = (_0x383f04.url || "").trim();
      const _0x2734bc = _0x383f04.postData && _0x383f04.postData.text ? String(_0x383f04.postData.text).trim() : "";
      const _0x20c7b1 = this.normalizeHeaders(_0x383f04.headers);
      const _0x1bc2b4 = (_0x38905d.pageUrl || "").trim();
      const _0x530a1a = _0x2960bd + "|" + _0x1fbcb5 + "|" + _0x20c7b1 + "|" + _0x2734bc + "|" + _0x1bc2b4;
      if (_0x577074.size < 3) {
        console.log("Signature " + (_0x577074.size + 1) + ":", _0x530a1a.substring(0, 100) + "...");
      }
      if (!_0x577074.has(_0x530a1a)) {
        _0x577074.add(_0x530a1a);
        _0x3d7434.push(_0x38905d);
      } else {
        console.log("Duplicate found:", _0x530a1a.substring(0, 100) + "...");
      }
    }
    console.log("removeDuplicates: " + _0x365b13 + " total, " + _0x577074.size + " unique, " + (_0x365b13 - _0x577074.size) + " duplicates");
    const _0x4a4e7a = _0x365b13 - _0x3d7434.length;
    if (_0x4a4e7a > 0) {
      const _0x47f303 = state.selectedRequest;
      state.requests = _0x3d7434;
      if (_0x47f303 && !_0x3d7434.includes(_0x47f303)) {
        state.selectedRequest = null;
        events.emit(EVENT_NAMES.UI_CLEAR_ALL);
      } else if (_0x47f303) {
        state.selectedRequest = _0x47f303;
      }
      const _0x2b0caa = document.getElementById("request-list");
      if (_0x2b0caa) {
        _0x2b0caa.innerHTML = "";
      }
      _0x3d7434.forEach((_0x34f855, _0xa02717) => {
        const _0x253136 = {
          request: _0x34f855,
          index: _0xa02717
        };
        events.emit(EVENT_NAMES.REQUEST_RENDERED, _0x253136);
      });
      events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
    }
    return _0x4a4e7a;
  },
  add(_0x3fdcba) {
    _0x3fdcba.starred = false;
    _0x3fdcba.color = null;
    if (typeof _0x3fdcba.name !== "string") {
      _0x3fdcba.name = null;
    }
    const _0x14ee01 = localStorage.getItem("rep_remove_duplicates") !== "false";
    if (_0x14ee01 && this.isDuplicate(_0x3fdcba, state.requests)) {
      return null;
    }
    state.requests.push(_0x3fdcba);
    const _0x3d2bbb = state.requests.length - 1;
    const _0x23f225 = {
      request: _0x3fdcba,
      index: _0x3d2bbb
    };
    events.emit(EVENT_NAMES.REQUEST_RENDERED, _0x23f225);
    return _0x3d2bbb;
  },
  select(_0x200902, _0x3617b8) {
    state.selectedRequest = _0x200902;
    const _0x530121 = {
      request: _0x200902,
      index: _0x3617b8
    };
    events.emit(EVENT_NAMES.REQUEST_SELECTED, _0x530121);
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
  toggleStar(_0x243b48, _0x5a2e0c) {
    _0x243b48.starred = !_0x243b48.starred;
    const _0x22b7ac = {
      request: _0x243b48,
      index: _0x5a2e0c
    };
    events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED, _0x22b7ac);
    if (state.starFilterActive) {
      const _0x5a6cdf = document.getElementById("request-list");
      const _0xe8adc1 = _0x5a6cdf ? _0x5a6cdf.scrollTop : 0;
      const _0x50af19 = {
        preserveScroll: true,
        scrollTop: _0xe8adc1
      };
      events.emit("request:filtered", _0x50af19);
    }
  },
  toggleGroupStar(_0x36619b, _0x101566, _0x520e3f) {
    const _0x578aa3 = _0x36619b === "page";
    if (_0x578aa3) {
      if (_0x520e3f) {
        state.starredPages.add(_0x101566);
      } else {
        state.starredPages.delete(_0x101566);
      }
    } else if (_0x520e3f) {
      state.starredDomains.add(_0x101566);
    } else {
      state.starredDomains.delete(_0x101566);
    }
    state.requests.forEach((_0x4e8e0e, _0x4b620f) => {
      const _0x3ab3e4 = _0x4e8e0e.pageUrl ? new URL(_0x4e8e0e.pageUrl).hostname : null;
      const _0x58cad9 = new URL(_0x4e8e0e.request.url).hostname;
      let _0x101d1d = false;
      if (_0x578aa3) {
        if (_0x3ab3e4 === _0x101566 && _0x58cad9 === _0x101566) {
          _0x101d1d = true;
        }
      } else if (_0x58cad9 === _0x101566) {
        _0x101d1d = true;
      }
      if (_0x101d1d && _0x4e8e0e.starred !== _0x520e3f) {
        _0x4e8e0e.starred = _0x520e3f;
        const _0x513df4 = {
          index: _0x4b620f,
          starred: _0x520e3f
        };
        events.emit("request:star-updated", _0x513df4);
      }
    });
    events.emit(EVENT_NAMES.REQUEST_FILTERED);
  },
  setColor(_0x50fe3c, _0x4d8589) {
    if (_0x50fe3c >= 0 && _0x50fe3c < state.requests.length) {
      state.requests[_0x50fe3c].color = _0x4d8589;
      const _0x124499 = {
        index: _0x50fe3c,
        color: _0x4d8589
      };
      events.emit(EVENT_NAMES.REQUEST_COLOR_CHANGED, _0x124499);
    }
  },
  delete(_0x4c5c89) {
    if (_0x4c5c89 >= 0 && _0x4c5c89 < state.requests.length) {
      const _0x28dfef = state.requests[_0x4c5c89];
      state.requests.splice(_0x4c5c89, 1);
      if (state.selectedRequest === _0x28dfef) {
        state.selectedRequest = null;
        const _0x556474 = {
          request: null,
          index: -1
        };
        events.emit(EVENT_NAMES.REQUEST_SELECTED, _0x556474);
      }
      events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
    }
  },
  deleteGroup(_0x4ca184, _0x4cf42d) {
    const _0x548b9c = _0x4ca184 === "page";
    const _0x2edcdb = [];
    state.requests.forEach((_0x188f91, _0x51fe2f) => {
      const _0x685760 = getHostname(_0x188f91.pageUrl || _0x188f91.request.url);
      const _0x2c45de = getHostname(_0x188f91.request.url);
      let _0x30004d = false;
      if (_0x548b9c) {
        _0x30004d = _0x685760 === _0x4cf42d;
      } else {
        _0x30004d = _0x2c45de === _0x4cf42d;
      }
      if (_0x30004d) {
        _0x2edcdb.push(_0x51fe2f);
      }
    });
    _0x2edcdb.reverse().forEach(_0x3640b8 => {
      state.requests.splice(_0x3640b8, 1);
    });
    const _0x236e5e = state.blockedQueue.length;
    state.blockedQueue = state.blockedQueue.filter(_0x487d36 => {
      const _0xdcc944 = getHostname(_0x487d36.pageUrl || _0x487d36.request.url);
      const _0x52947e = getHostname(_0x487d36.request.url);
      if (_0x548b9c) {
        return _0xdcc944 !== _0x4cf42d;
      }
      return _0x52947e !== _0x4cf42d;
    });
    const _0x116e76 = _0x236e5e - state.blockedQueue.length;
    if (_0x548b9c) {
      state.starredPages.delete(_0x4cf42d);
    } else {
      state.starredDomains.delete(_0x4cf42d);
    }
    state.domainsWithAttackSurface.delete(_0x4cf42d);
    Object.keys(state.attackSurfaceCategories).forEach(_0x43d819 => {
      const _0x193641 = parseInt(_0x43d819);
      if (_0x193641 < state.requests.length) {
        const _0x13b043 = state.requests[_0x193641];
        const _0x4935d8 = getHostname(_0x13b043.pageUrl || _0x13b043.request.url);
        const _0x1747a0 = getHostname(_0x13b043.request.url);
        if (_0x548b9c) {
          if (_0x4935d8 === _0x4cf42d) {
            delete state.attackSurfaceCategories[_0x43d819];
          }
        } else if (_0x1747a0 === _0x4cf42d) {
          delete state.attackSurfaceCategories[_0x43d819];
        }
      } else {
        delete state.attackSurfaceCategories[_0x43d819];
      }
    });
    const _0x4b75c9 = state.requests.indexOf(state.selectedRequest);
    if (state.selectedRequest && (_0x4b75c9 === -1 || _0x2edcdb.includes(_0x4b75c9))) {
      state.selectedRequest = null;
    }
    events.emit(EVENT_NAMES.REQUEST_FILTERED);
    if (_0x116e76 > 0) {
      events.emit("block-queue:updated");
    }
    if (state.selectedRequest === null) {
      events.emit(EVENT_NAMES.UI_CLEAR_ALL);
    }
    return _0x116e76;
  }
};
var filterActions = {
  setFilter(_0x43018f) {
    state.currentFilter = _0x43018f;
    const _0x521b14 = {
      filter: _0x43018f
    };
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, _0x521b14);
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
  },
  setSelectedMethods(_0x5105a2) {
    state.selectedMethods = _0x5105a2;
    if (_0x5105a2.size === 0) {
      state.currentFilter = "all";
    } else if (_0x5105a2.size === 1) {
      state.currentFilter = Array.from(_0x5105a2)[0];
    } else {
      state.currentFilter = "multiple";
    }
    const _0x4f762f = {
      methods: _0x5105a2
    };
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, _0x4f762f);
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
  },
  setStarFilter(_0x4c23cd) {
    state.starFilterActive = _0x4c23cd;
    if (_0x4c23cd) {
      state.currentFilter = "starred";
    } else {
      state.currentFilter = "all";
    }
    const _0x34c530 = {
      starFilter: _0x4c23cd
    };
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, _0x34c530);
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
  },
  setSearch(_0x7adabd, _0xd31c02 = false) {
    state.currentSearchTerm = _0x7adabd;
    state.useRegex = _0xd31c02;
    const _0xff4843 = {
      term: _0x7adabd,
      useRegex: _0xd31c02
    };
    events.emit(EVENT_NAMES.STATE_SEARCH_CHANGED, _0xff4843);
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
  },
  setColorFilter(_0x21d8d3) {
    state.currentColorFilter = _0x21d8d3;
    const _0x2cdb10 = {
      color: _0x21d8d3
    };
    events.emit(EVENT_NAMES.STATE_FILTER_CHANGED, _0x2cdb10);
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
  }
};
var starringActions = {
  togglePageStar(_0x3cce86, _0x40c2a4) {
    if (_0x40c2a4) {
      state.starredPages.add(_0x3cce86);
    } else {
      state.starredPages.delete(_0x3cce86);
    }
    events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED);
  },
  toggleDomainStar(_0xfe8c6, _0x50a4d5) {
    if (_0x50a4d5) {
      state.starredDomains.add(_0xfe8c6);
    } else {
      state.starredDomains.delete(_0xfe8c6);
    }
    events.emit(EVENT_NAMES.REQUEST_STAR_UPDATED);
  }
};
var blockingActions = {
  setBlocking(_0x57ab70) {
    state.blockRequests = _0x57ab70;
    if (_0x57ab70) {
      state.blockedQueue = [];
    }
    events.emit("block-queue:updated");
  },
  addToBlockedQueue(_0xf61255) {
    state.blockedQueue.push(_0xf61255);
    events.emit("block-queue:updated");
  },
  clearBlockedQueue() {
    state.blockedQueue = [];
    events.emit("block-queue:updated");
  }
};
var timelineActions = {
  setFilter(_0x2c9017, _0x673ddd) {
    state.timelineFilterTimestamp = _0x2c9017;
    state.timelineFilterRequestIndex = _0x673ddd;
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
  },
  clear() {
    state.timelineFilterTimestamp = null;
    state.timelineFilterRequestIndex = null;
    events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_LIST);
  }
};
var historyActions = {
  add(_0x40c487, _0x19a788) {
    if (state.historyIndex >= 0) {
      const _0x492c13 = state.requestHistory[state.historyIndex];
      if (_0x492c13.rawText === _0x40c487 && _0x492c13.useHttps === _0x19a788) {
        return;
      }
    }
    if (state.historyIndex < state.requestHistory.length - 1) {
      state.requestHistory = state.requestHistory.slice(0, state.historyIndex + 1);
    }
    const _0x30cc5b = {
      rawText: _0x40c487,
      useHttps: _0x19a788
    };
    state.requestHistory.push(_0x30cc5b);
    state.historyIndex = state.requestHistory.length - 1;
    events.emit(EVENT_NAMES.HISTORY_UPDATED);
    events.emit(EVENT_NAMES.UI_UPDATE_HISTORY_BUTTONS);
  },
  goBack() {
    if (state.historyIndex > 0) {
      state.historyIndex--;
      const _0x4fd816 = {
        index: state.historyIndex,
        entry: state.requestHistory[state.historyIndex]
      };
      events.emit(EVENT_NAMES.HISTORY_NAVIGATED, _0x4fd816);
      events.emit(EVENT_NAMES.UI_UPDATE_HISTORY_BUTTONS);
    }
  },
  goForward() {
    if (state.historyIndex < state.requestHistory.length - 1) {
      state.historyIndex++;
      const _0x493009 = {
        index: state.historyIndex,
        entry: state.requestHistory[state.historyIndex]
      };
      events.emit(EVENT_NAMES.HISTORY_NAVIGATED, _0x493009);
      events.emit(EVENT_NAMES.UI_UPDATE_HISTORY_BUTTONS);
    }
  }
};
const _0x1ba751 = {
  setBaseline: function (_0x1474e7) {
    state.regularRequestBaseline = _0x1474e7;
  },
  setCurrentResponse: function (_0x4dbd35) {
    state.currentResponse = _0x4dbd35;
  }
};
var diffActions = _0x1ba751;
var attackSurfaceActions = {
  setCategory(_0x4aa3cb, _0x6aecf3) {
    state.attackSurfaceCategories[_0x4aa3cb] = _0x6aecf3;
  },
  markDomain(_0x2c3532) {
    state.domainsWithAttackSurface.add(_0x2c3532);
  },
  setAnalyzing(_0x3af682) {
    state.isAnalyzingAttackSurface = _0x3af682;
  }
};
const _0x1800da = {
  request: requestActions,
  filter: filterActions,
  starring: starringActions,
  blocking: blockingActions,
  timeline: timelineActions,
  history: historyActions,
  diff: diffActions,
  attackSurface: attackSurfaceActions
};
var actions = _0x1800da;
const _0x2798bd = {
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
var state = _0x2798bd;
function addRequest(_0x19eaad) {
  return requestActions.add(_0x19eaad);
}
function clearRequests() {
  requestActions.clearAll();
}
function addToHistory(_0x3a465d, _0x335adb) {
  historyActions.add(_0x3a465d, _0x335adb);
}
export { actions, addRequest, addToHistory, attackSurfaceActions, attackSurfaceState, blockingActions, blockingState, bulkReplayState, clearRequests, diffActions, diffState, filterActions, filterState, historyActions, historyState, requestActions, requestState, starringActions, starringState, state, timelineActions, timelineState, uiState, undoRedoState };