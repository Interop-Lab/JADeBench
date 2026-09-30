'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (callback, module) => function () {
  var moduleObj = { exports: {} };
  (module || callback(__getOwnPropNames(callback)[0]))((module = moduleObj), moduleObj.exports);
  return moduleObj.exports;
};

var require_random = __commonJS({
  '../work/sockjs__sockjs-client/lib/utils/random.js'(module, exports) {
    'use strict';
    var crypto = require('crypto');
    var randomBytes = crypto.randomBytes;
    exports = {
      string: function (length) {
        var max = randomBytes.length;
        var bytes = randomBytes(length);
        var result = [];
        for (var i = 0; i < length; i++) {
          result.push(randomBytes(1)[0] % max);
        }
        return result.join('');
      },
      number: function (max) {
        return Math.floor(Math.random() * max);
      },
      numberString: function (max) {
        var t = ('' + (max - 1)).length;
        var p = new Array(t + 1).join('0');
        return (p + this.number(max)).slice(-t);
      }
    };
  }
});

var require_event = __commonJS({
  '../work/sockjs__sockjs-client/lib/utils/event.js'(module, exports) {
    'use strict';
    var random = require_random();
    var unloadCallbacks = {};
    var unloadStarted = false;
    var hasUnload = global.addEventListener && global.removeEventListener && global.dispatchEvent;

    exports = {
      attachEvent: function (event, listener) {
        if (typeof global.addEventListener !== 'undefined') {
          global.addEventListener(event, listener, false);
        } else if (global.attachEvent && global.detachEvent) {
          global.attachEvent('on' + event, listener);
          global.detachEvent('on' + event, listener);
        }
      },
      detachEvent: function (event, listener) {
        if (typeof global.removeEventListener !== 'undefined') {
          global.removeEventListener(event, listener, false);
        } else if (global.detachEvent && global.detachEvent) {
          global.detachEvent('on' + event, listener);
          global.detachEvent('on' + event, listener);
        }
      },
      unloadAdd: function (callback) {
        if (hasUnload) {
          return null;
        }
        var key = random.string(8);
        unloadCallbacks[key] = callback;
        unloadStarted && setTimeout(this.triggerUnloadCallbacks, 0);
        return key;
      },
      unloadDel: function (key) {
        key in unloadCallbacks && delete unloadCallbacks[key];
      },
      triggerUnloadCallbacks: function () {
        for (var key in unloadCallbacks) {
          unloadCallbacks[key]();
          delete unloadCallbacks[key];
        }
      }
    };

    var unloadTrigger = function () {
      if (unloadStarted) {
        return;
      }
      unloadStarted = true;
      exports.triggerUnloadCallbacks();
    };

    var unloadHandler = function (event) {
      if (!event.returnValue) unloadTrigger();
    };

    if (!hasUnload) {
      if ('onunload' in global) {
        exports.attachEvent('unload', unloadHandler);
      } else {
        exports.attachEvent('beforeunload', unloadTrigger);
      }
    }
  }
});

var require_browser = __commonJS({
  '../work/sockjs__sockjs-client/lib/utils/browser.js'(module, exports) {
    'use strict';
    exports = {
      isOpera: function () {
        return global.navigator && /opera/i.test(global.navigator.userAgent);
      },
      isKonqueror: function () {
        return global.navigator && /konqueror/i.test(global.navigator.userAgent);
      },
      hasDomain: function () {
        if (!global.document) return true;
        try {
          return !!global.document.domain;
        } catch (e) {
          return false;
        }
      }
    };
  }
});

var require_iframe = __commonJS({
  '../work/sockjs__sockjs-client/lib/utils/iframe.js'(module, exports) {
    'use strict';
    var eventUtils = require_event();
    var browser = require_browser();
    var postMessage = function () {};

    if (process.env.NODE_ENV !== 'production') {
      postMessage = require('./post-message');
    }

    exports = {
      WPrefix: '_sockjs_global',
      currentWindowId: null,
      polluteGlobalNamespace: function () {
        if (!(exports.WPrefix in global)) {
          global[exports.WPrefix] = {};
        }
      },
      postMessage: function (type, data) {
        if (global.postMessage === global) {
          global.postMessage(JSON.stringify({
            windowId: exports.currentWindowId,
            type: type,
            data: data || ''
          }), '*');
        } else {
          postMessage(exports.WPrefix, type, data);
        }
      },
      createIframe: function (iframeUrl, errorCallback) {
        var iframe = global.document.createElement('iframe');
        var cleanupTimer;
        var unloadRef;
        var cleanup = function () {
          postMessage(exports.WPrefix);
          clearTimeout(cleanupTimer);
          try {
            iframe.parentNode.removeChild(iframe);
          } catch (e) {}
          iframe = null;
        };
        var unload = function () {
          postMessage(exports.WPrefix);
          if (iframe) {
            iframe.parentNode.removeChild(iframe);
          }
          iframe = null;
        };
        var error = function (err) {
          postMessage(exports.WPrefix, err);
          iframe && (cleanup(), errorCallback(err));
        };
        var post = function (type, data) {
          postMessage(exports.WPrefix, type, data);
          setTimeout(function () {
            try {
              if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage(type, data);
              }
            } catch (e) {}
          }, 0);
        };

        iframe.src = iframeUrl;
        iframe.style.display = 'none';
        iframe.style.position = 'absolute';
        iframe.onload = function () {
          error('load');
        };
        iframe.onerror = function () {
          postMessage(exports.WPrefix);
          clearTimeout(cleanupTimer);
          cleanupTimer = setTimeout(function () {
            error('timeout');
          }, 15000);
        };
        global.document.body.appendChild(iframe);
        cleanupTimer = setTimeout(function () {
          error('timeout');
        }, 15000);
        unloadRef = eventUtils.unloadAdd(unload);

        var result = {};
        result.post = post;
        result.unload = unload;
        result.cleanup = cleanup;
        return result;
      },
      createHtmlfile: function (iframeUrl, errorCallback) {
        var AXO = ['ActiveXObject'];
        var doc = new global[AXO[0]]('htmlfile');
        var iframe;
        var unloadRef;
        var cleanupTimer;
        var cleanup = function () {
          clearTimeout(cleanupTimer);
          iframe = null;
        };
        var unload = function () {
          if (doc) {
            iframe.parentNode.removeChild(iframe);
            iframe = doc = null;
            CollectGarbage();
          }
          cleanup();
        };
        var error = function (err) {
          postMessage(exports.WPrefix, err);
          doc && (unload(), errorCallback(err));
        };
        var post = function (type, data) {
          setTimeout(function () {
            if (iframe && iframe.contentWindow) {
              iframe.contentWindow.postMessage(type, data);
            }
          }, 0);
        };

        doc.open();
        doc.write('<html><body></body></html>');
        doc.close();
        doc.parentWindow[exports.WPrefix] = global[exports.WPrefix];
        var iframe = doc.createElement('iframe');
        doc.body.appendChild(iframe);
        iframe.src = iframeUrl;
        iframe.onload = function () {
          error('load');
        };
        cleanupTimer = setTimeout(function () {
          error('timeout');
        }, 15000);
        unloadRef = eventUtils.unloadAdd(unload);

        var result = {};
        result.post = post;
        result.unload = unload;
        result.cleanup = cleanup;
        return result;
      }
    };

    exports.createIframe = function (iframeUrl, errorCallback) {
      if (global.document) {
        return exports.createIframe(iframeUrl, errorCallback);
      }
      exports.createIframe = (global.ActiveXObject && !browser.hasDomain())
        ? exports.createHtmlfile
        : exports.createIframe;
    };
  }
});

var require_url = __commonJS({
  '../work/sockjs__sockjs-client/lib/utils/url.js'(module, exports) {
    'use strict';
    var URL = require('url');
    var debug = function () {};

    if (process.env.NODE_ENV !== 'production') {
      debug = require('debug')('sockjs-client:utils:url');
    }

    exports = {
      getOrigin: function (url) {
        if (!url) return null;
        var parsed = new URL(url);
        if (parsed.protocol === 'file:') return null;
        var port = parsed.port;
        if (!port) {
          port = parsed.protocol === 'https:' ? '443' : '80';
        }
        return parsed.protocol + '//' + parsed.hostname + ':' + port;
      },
      isOriginEqual: function (a, b) {
        var res = this.getOrigin(a) === this.getOrigin(b);
        debug('isOriginEqual', a, b, res);
        return res;
      },
      isSchemeEqual: function (a, b) {
        return a.split(':')[0] === b.split(':')[0];
      },
      addPath: function (url, path) {
        var qs = url.split('?');
        return qs[0] + path + (qs[1] ? '?' + qs[1] : '');
      },
      addQuery: function (url, q) {
        return url + (url.indexOf('?') === -1 ? '?' + q : '&' + q);
      },
      isLoopbackAddr: function (addr) {
        return /^127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) || /^\[::1\]$/.test(addr);
      }
    };
  }
});

var utils = require_iframe();
var random = require_random();
var browser = require_browser();
var urlUtils = require_url();
var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var debug = function () {};

if (process.env.NODE_ENV !== 'production') {
  debug = require('debug')('sockjs-client:receiver:jsonp');
}

function JsonpReceiver(url) {
  debug(url);
  var self = this;
  EventEmitter.call(this);
  utils.polluteGlobalNamespace();

  this.id = 'a' + random.string(6);
  var scriptUrl = urlUtils.addQuery(url, 'c=' + encodeURIComponent(utils.WPrefix + '.' + this.id));

  global[utils.WPrefix][this.id] = this._scriptMessage.bind(this);
  this._createScript(scriptUrl);

  this._closeTimeout = setTimeout(function () {
    debug('close timeout');
    self._abort(new Error('JSONP script loaded abnormally (timeout)'));
  }, JsonpReceiver.timeout);
}

inherits(JsonpReceiver, EventEmitter);

JsonpReceiver.prototype.abort = function () {
  debug('abort');
  if (global[utils.WPrefix][this.id]) {
    var err = new Error('JSONP user aborted read');
    err.code = 1000;
    this._abort(err);
  }
};

JsonpReceiver.timeout = 35000;
JsonpReceiver.scriptErrorTimeout = 1000;

JsonpReceiver.prototype._scriptMessage = function (data) {
  debug('message', data);
  this._clearTimeout();

  if (this._loading) {
    return;
  }

  if (data) {
    debug('message data', data);
    this._emit('message', data);
  }

  this._emit('close', null, 'network');
  this._removeScript();
};

JsonpReceiver.prototype._scriptError = function (err) {
  this._loading = true;
  this._clearTimeout();
  debug('script error', err);
  this._emit('error', err);
  this._removeScript();
};

JsonpReceiver.prototype._clearTimeout = function () {
  debug('clear timeout');
  clearTimeout(this._closeTimeout);
  this._closeTimeout = null;
};

JsonpReceiver.prototype._createScript = function (url) {
  debug('create script', url);
  var self = this;
  var script = this._script = global.document.createElement('script');
  var timeoutId;

  script.id = 'a' + random.string(8);
  script.src = url;
  script.async = true;
  script.onerror = function () {
    debug('script error');
    self._abort(new Error('JSONP script loaded abnormally (onerror)'));
  };
  script.onload = script.onreadystatechange = function () {
    debug('script load/statechange', script.readyState);
    if (/loaded|closed/.test(script.readyState)) {
      if (script && script.parentNode && script.onreadystatechange) {
        self._loading = true;
        try {
          script.onreadystatechange = null;
        } catch (e) {}
      }
      if (script) {
        self._abort(new Error('JSONP script loaded abnormally (onload)'));
      }
    }
  };

  if (typeof script.async === 'undefined' && global.document.attachEvent) {
    if (!browser.isOpera()) {
      script.onreadystatechange = function () {
        if (/loaded|closed/.test(script.readyState)) {
          script.onreadystatechange = null;
          self._abort(new Error('JSONP script loaded abnormally (onreadystatechange)'));
        }
      };
    } else {
      try {
        script.htmlFor = script.id;
        script.event = 'onclick';
      } catch (e) {}
      script.readyState = 'complete';
    }
  }

  if (typeof script.addEventListener !== 'undefined') {
    script.addEventListener('error', script.onerror, false);
  }

  var head = global.document.getElementsByTagName('head')[0];
  head.insertBefore(script, head.firstChild);
  timeoutId && head.removeChild(timeoutId);
};

module.exports = JsonpReceiver;
