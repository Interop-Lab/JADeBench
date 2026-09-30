"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../work/sockjs__sockjs-client/lib/utils/random.js
var require_random = __commonJS({
  "../work/sockjs__sockjs-client/lib/utils/random.js"(exports2, module2) {
    "use strict";
    var crypto = require("crypto");
    var _randomStringChars = "abcdefghijklmnopqrstuvwxyz012345";
    module2.exports = {
      string: function(length) {
        var max = _randomStringChars.length;
        var bytes = crypto.randomBytes(length);
        var ret = [];
        for (var i = 0; i < length; i++) {
          ret.push(_randomStringChars.substr(bytes[i] % max, 1));
        }
        return ret.join("");
      },
      number: function(max) {
        return Math.floor(Math.random() * max);
      },
      numberString: function(max) {
        var t = ("" + (max - 1)).length;
        var p = new Array(t + 1).join("0");
        return (p + this.number(max)).slice(-t);
      }
    };
  }
});

// ../work/sockjs__sockjs-client/lib/utils/event.js
var require_event = __commonJS({
  "../work/sockjs__sockjs-client/lib/utils/event.js"(exports2, module2) {
    "use strict";
    var random2 = require_random();
    var onUnload = {}, afterUnload = false, isChromePackagedApp = global.chrome && global.chrome.app && global.chrome.app.runtime;
    module2.exports = {
      attachEvent: function(event, listener) {
        if (typeof global.addEventListener !== "undefined") {
          global.addEventListener(event, listener, false);
        } else if (global.document && global.attachEvent) {
          global.document.attachEvent("on" + event, listener);
          global.attachEvent("on" + event, listener);
        }
      },
      detachEvent: function(event, listener) {
        if (typeof global.addEventListener !== "undefined") {
          global.removeEventListener(event, listener, false);
        } else if (global.document && global.detachEvent) {
          global.document.detachEvent("on" + event, listener);
          global.detachEvent("on" + event, listener);
        }
      },
      unloadAdd: function(listener) {
        if (isChromePackagedApp) {
          return null;
        }
        var ref = random2.string(8);
        onUnload[ref] = listener;
        if (afterUnload) {
          setTimeout(this.triggerUnloadCallbacks, 0);
        }
        return ref;
      },
      unloadDel: function(ref) {
        if (ref in onUnload) {
          delete onUnload[ref];
        }
      },
      triggerUnloadCallbacks: function() {
        for (var ref in onUnload) {
          onUnload[ref]();
          delete onUnload[ref];
        }
      }
    };
    var unloadTriggered = function() {
      if (afterUnload) {
        return;
      }
      afterUnload = true;
      module2.exports.triggerUnloadCallbacks();
    };
    var pagehide = function(e) {
      if (!e.persisted) unloadTriggered();
    };
    if (!isChromePackagedApp) {
      if ("onpagehide" in global) {
        module2.exports.attachEvent("pagehide", pagehide);
      } else {
        module2.exports.attachEvent("unload", unloadTriggered);
      }
    }
  }
});

// ../work/sockjs__sockjs-client/lib/utils/browser.js
var require_browser = __commonJS({
  "../work/sockjs__sockjs-client/lib/utils/browser.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      isOpera: function() {
        return global.navigator && /opera/i.test(global.navigator.userAgent);
      },
      isKonqueror: function() {
        return global.navigator && /konqueror/i.test(global.navigator.userAgent);
      },
      hasDomain: function() {
        if (!global.document) {
          return true;
        }
        try {
          return !!global.document.domain;
        } catch (e) {
          return false;
        }
      }
    };
  }
});

// ../work/sockjs__sockjs-client/lib/utils/iframe.js
var require_iframe = __commonJS({
  "../work/sockjs__sockjs-client/lib/utils/iframe.js"(exports2, module2) {
    "use strict";
    var eventUtils = require_event(), browser2 = require_browser();
    var debug2 = function() {
    };
    if (process.env.NODE_ENV !== "production") {
      debug2 = require("debug")("sockjs-client:utils:iframe");
    }
    module2.exports = {
      WPrefix: "_jp",
      currentWindowId: null,
      polluteGlobalNamespace: function() {
        if (!(module2.exports.WPrefix in global)) {
          global[module2.exports.WPrefix] = {};
        }
      },
      postMessage: function(type, data) {
        if (global.parent !== global) {
          global.parent.postMessage(JSON.stringify({
            windowId: module2.exports.currentWindowId,
            type,
            data: data || ""
          }), "*");
        } else {
          debug2("Cannot postMessage, no parent window.", type, data);
        }
      },
      createIframe: function(iframeUrl, errorCallback) {
        var iframe = global.document.createElement("iframe");
        var tref, unloadRef;
        var unattach = function() {
          debug2("unattach");
          clearTimeout(tref);
          try {
            iframe.onload = null;
          } catch (x) {
          }
          iframe.onerror = null;
        };
        var cleanup = function() {
          debug2("cleanup");
          if (iframe) {
            unattach();
            setTimeout(function() {
              if (iframe) {
                iframe.parentNode.removeChild(iframe);
              }
              iframe = null;
            }, 0);
            eventUtils.unloadDel(unloadRef);
          }
        };
        var onerror = function(err) {
          debug2("onerror", err);
          if (iframe) {
            cleanup();
            errorCallback(err);
          }
        };
        var post = function(msg, origin) {
          debug2("post", msg, origin);
          setTimeout(function() {
            try {
              if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage(msg, origin);
              }
            } catch (x) {
            }
          }, 0);
        };
        iframe.src = iframeUrl;
        iframe.style.display = "none";
        iframe.style.position = "absolute";
        iframe.onerror = function() {
          onerror("onerror");
        };
        iframe.onload = function() {
          debug2("onload");
          clearTimeout(tref);
          tref = setTimeout(function() {
            onerror("onload timeout");
          }, 2e3);
        };
        global.document.body.appendChild(iframe);
        tref = setTimeout(function() {
          onerror("timeout");
        }, 15e3);
        unloadRef = eventUtils.unloadAdd(cleanup);
        return {
          post,
          cleanup,
          loaded: unattach
        };
      },
      createHtmlfile: function(iframeUrl, errorCallback) {
        var axo = ["Active"].concat("Object").join("X");
        var doc = new global[axo]("htmlfile");
        var tref, unloadRef;
        var iframe;
        var unattach = function() {
          clearTimeout(tref);
          iframe.onerror = null;
        };
        var cleanup = function() {
          if (doc) {
            unattach();
            eventUtils.unloadDel(unloadRef);
            iframe.parentNode.removeChild(iframe);
            iframe = doc = null;
            CollectGarbage();
          }
        };
        var onerror = function(r) {
          debug2("onerror", r);
          if (doc) {
            cleanup();
            errorCallback(r);
          }
        };
        var post = function(msg, origin) {
          try {
            setTimeout(function() {
              if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage(msg, origin);
              }
            }, 0);
          } catch (x) {
          }
        };
        doc.open();
        doc.write('<html><script>document.domain="' + global.document.domain + '";</script></html>');
        doc.close();
        doc.parentWindow[module2.exports.WPrefix] = global[module2.exports.WPrefix];
        var c = doc.createElement("div");
        doc.body.appendChild(c);
        iframe = doc.createElement("iframe");
        c.appendChild(iframe);
        iframe.src = iframeUrl;
        iframe.onerror = function() {
          onerror("onerror");
        };
        tref = setTimeout(function() {
          onerror("timeout");
        }, 15e3);
        unloadRef = eventUtils.unloadAdd(cleanup);
        return {
          post,
          cleanup,
          loaded: unattach
        };
      }
    };
    module2.exports.iframeEnabled = false;
    if (global.document) {
      module2.exports.iframeEnabled = (typeof global.postMessage === "function" || typeof global.postMessage === "object") && !browser2.isKonqueror();
    }
  }
});

// ../work/sockjs__sockjs-client/lib/utils/url.js
var require_url = __commonJS({
  "../work/sockjs__sockjs-client/lib/utils/url.js"(exports2, module2) {
    "use strict";
    var URL = require("url-parse");
    var debug2 = function() {
    };
    if (process.env.NODE_ENV !== "production") {
      debug2 = require("debug")("sockjs-client:utils:url");
    }
    module2.exports = {
      getOrigin: function(url) {
        if (!url) {
          return null;
        }
        var p = new URL(url);
        if (p.protocol === "file:") {
          return null;
        }
        var port = p.port;
        if (!port) {
          port = p.protocol === "https:" ? "443" : "80";
        }
        return p.protocol + "//" + p.hostname + ":" + port;
      },
      isOriginEqual: function(a, b) {
        var res = this.getOrigin(a) === this.getOrigin(b);
        debug2("same", a, b, res);
        return res;
      },
      isSchemeEqual: function(a, b) {
        return a.split(":")[0] === b.split(":")[0];
      },
      addPath: function(url, path) {
        var qs = url.split("?");
        return qs[0] + path + (qs[1] ? "?" + qs[1] : "");
      },
      addQuery: function(url, q) {
        return url + (url.indexOf("?") === -1 ? "?" + q : "&" + q);
      },
      isLoopbackAddr: function(addr) {
        return /^127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) || /^\[::1\]$/.test(addr);
      }
    };
  }
});

// ../work/sockjs__sockjs-client/lib/transport/receiver/jsonp.js
var utils = require_iframe(), random = require_random(), browser = require_browser(), urlUtils = require_url(), inherits = require("inherits"), EventEmitter = require("events").EventEmitter;
var debug = function() {
};
if (process.env.NODE_ENV !== "production") {
  debug = require("debug")("sockjs-client:receiver:jsonp");
}
function JsonpReceiver(url) {
  debug(url);
  var self = this;
  EventEmitter.call(this);
  utils.polluteGlobalNamespace();
  this.id = "a" + random.string(6);
  var urlWithId = urlUtils.addQuery(url, "c=" + encodeURIComponent(utils.WPrefix + "." + this.id));
  global[utils.WPrefix][this.id] = this._callback.bind(this);
  this._createScript(urlWithId);
  this.timeoutId = setTimeout(function() {
    debug("timeout");
    self._abort(new Error("JSONP script loaded abnormally (timeout)"));
  }, JsonpReceiver.timeout);
}
inherits(JsonpReceiver, EventEmitter);
JsonpReceiver.prototype.abort = function() {
  debug("abort");
  if (global[utils.WPrefix][this.id]) {
    var err = new Error("JSONP user aborted read");
    err.code = 1e3;
    this._abort(err);
  }
};
JsonpReceiver.timeout = 35e3;
JsonpReceiver.scriptErrorTimeout = 1e3;
JsonpReceiver.prototype._callback = function(data) {
  debug("_callback", data);
  this._cleanup();
  if (this.aborting) {
    return;
  }
  if (data) {
    debug("message", data);
    this.emit("message", data);
  }
  this.emit("close", null, "network");
  this.removeAllListeners();
};
JsonpReceiver.prototype._abort = function(err) {
  debug("_abort", err);
  this._cleanup();
  this.aborting = true;
  this.emit("close", err.code, err.message);
  this.removeAllListeners();
};
JsonpReceiver.prototype._cleanup = function() {
  debug("_cleanup");
  clearTimeout(this.timeoutId);
  if (this.script2) {
    this.script2.parentNode.removeChild(this.script2);
    this.script2 = null;
  }
  if (this.script) {
    var script = this.script;
    script.parentNode.removeChild(script);
    script.onreadystatechange = script.onerror = script.onload = script.onclick = null;
    this.script = null;
  }
  delete global[utils.WPrefix][this.id];
};
JsonpReceiver.prototype._scriptError = function() {
  debug("_scriptError");
  var self = this;
  if (this.errorTimer) {
    return;
  }
  this.errorTimer = setTimeout(function() {
    if (!self.loadedOkay) {
      self._abort(new Error("JSONP script loaded abnormally (onerror)"));
    }
  }, JsonpReceiver.scriptErrorTimeout);
};
JsonpReceiver.prototype._createScript = function(url) {
  debug("_createScript", url);
  var self = this;
  var script = this.script = global.document.createElement("script");
  var script2;
  script.id = "a" + random.string(8);
  script.src = url;
  script.type = "text/javascript";
  script.charset = "UTF-8";
  script.onerror = this._scriptError.bind(this);
  script.onload = function() {
    debug("onload");
    self._abort(new Error("JSONP script loaded abnormally (onload)"));
  };
  script.onreadystatechange = function() {
    debug("onreadystatechange", script.readyState);
    if (/loaded|closed/.test(script.readyState)) {
      if (script && script.htmlFor && script.onclick) {
        self.loadedOkay = true;
        try {
          script.onclick();
        } catch (x) {
        }
      }
      if (script) {
        self._abort(new Error("JSONP script loaded abnormally (onreadystatechange)"));
      }
    }
  };
  if (typeof script.async === "undefined" && global.document.attachEvent) {
    if (!browser.isOpera()) {
      try {
        script.htmlFor = script.id;
        script.event = "onclick";
      } catch (x) {
      }
      script.async = true;
    } else {
      script2 = this.script2 = global.document.createElement("script");
      script2.text = "try{var a = document.getElementById('" + script.id + "'); if(a)a.onerror();}catch(x){};";
      script.async = script2.async = false;
    }
  }
  if (typeof script.async !== "undefined") {
    script.async = true;
  }
  var head = global.document.getElementsByTagName("head")[0];
  head.insertBefore(script, head.firstChild);
  if (script2) {
    head.insertBefore(script2, head.firstChild);
  }
};
module.exports = JsonpReceiver;
