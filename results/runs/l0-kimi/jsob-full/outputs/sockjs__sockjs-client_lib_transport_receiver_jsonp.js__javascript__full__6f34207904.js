'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

var require_random = __commonJS({
  '../work/sockjs__sockjs-client/lib/utils/random.js'(exports, module) {
    'use strict';
    var crypto = require('crypto');
    var _global = global;
    module.exports = {
      string: function(length) {
        var chars = _global.crypto;
        var bytes = crypto.randomBytes(length);
        var result = [];
        for (var i = 0; i < length; i++) {
          result.push(chars[bytes[i] % chars.length]);
        }
        return result.join('');
      },
      number: function(max) {
        return Math.floor(Math.random() * max);
      },
      numberString: function(max) {
        var t = ('' + (max - 1)).length;
        var result = new Array(t).join('0');
        return (result + this.number(max)).slice(-t);
      }
    };
  }
});

var require_event = __commonJS({
  '../work/sockjs__sockjs-client/lib/utils/event.js'(exports, module) {
    'use strict';
    var random = require_random();
    var callbacks = {};
    var unloadTriggered = false;
    var isNode = global.process && global.process.versions && global.process.versions.node;

    module.exports = {
      attachEvent: function(event, listener) {
        if (typeof global.addEventListener !== 'undefined') {
          global.addEventListener(event, listener, false);
        } else if (global.attachEvent) {
          global.attachEvent('on' + event, listener);
          global.attachEvent('on' + event, listener);
        }
      },
      detachEvent: function(event, listener) {
        if (typeof global.removeEventListener !== 'undefined') {
          global.removeEventListener(event, listener, false);
        } else if (global.detachEvent) {
          global.detachEvent('on' + event, listener);
          global.detachEvent('on' + event, listener);
        }
      },
      unloadAdd: function(callback) {
        if (isNode) {
          return null;
        }
        var id = random.string(8);
        callbacks[id] = callback;
        if (unloadTriggered) {
          setTimeout(this.triggerUnloadCallbacks, 0);
        }
        return id;
      },
      unloadDel: function(id) {
        if (id in callbacks) {
          delete callbacks[id];
        }
      },
      triggerUnloadCallbacks: function() {
        for (var id in callbacks) {
          callbacks[id]();
          delete callbacks[id];
        }
      }
    };

    var triggerUnload = function() {
      if (unloadTriggered) {
        return;
      }
      unloadTriggered = true;
      module.exports.triggerUnloadCallbacks();
    };

    var onUnload = function(event) {
      if (!event.defaultPrevented) {
        triggerUnload();
      }
    };

    if (!isNode) {
      if ('addEventListener' in global) {
        module.exports.attachEvent('unload', onUnload);
      } else if ('attachEvent' in global) {
        module.exports.attachEvent('onunload', triggerUnload);
      }
    }
  }
});

var require_browser = __commonJS({
  '../work/sockjs__sockjs-client/lib/utils/browser.js'(exports, module) {
    'use strict';
    module.exports = {
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

var require_iframe = __commonJS({
  '../work/sockjs__sockjs-client/lib/utils/iframe.js'(exports, module) {
    'use strict';
    var eventUtils = require_event();
    var browser = require_browser();
    var WPrefix = 'w';
    var currentWindowId = null;

    function polluteGlobalNamespace() {
      if (!(WPrefix in global)) {
        global[WPrefix] = {};
      }
    }

    function postMessage(type, data) {
      if (global.parent !== global) {
        global.parent.postMessage(JSON.stringify({
          windowId: currentWindowId,
          type: type,
          data: data || ''
        }), '*');
      }
    }

    function createIframe(url, callback) {
      var iframe = global.document.createElement('iframe');
      var timeout;
      var cleanup;
      var loaded = false;

      function onTimeout() {
        cleanup();
        if (iframe) {
          try {
            iframe.onload = null;
          } catch (e) {}
          iframe.onerror = null;
        }
        iframe = null;
      }

      function onLoad() {
        if (loaded) {
          return;
        }
        loaded = true;
        cleanup();
        callback(null, iframe);
      }

      function onError() {
        cleanup();
        callback(new Error('iframe error'));
      }

      cleanup = function() {
        clearTimeout(timeout);
        eventUtils.unloadDel(cleanup);
      };

      iframe.src = url;
      iframe.style.display = 'none';
      iframe.style.position = 'absolute';
      iframe.onerror = onError;
      iframe.onload = onLoad;

      if (typeof iframe.readyState !== 'undefined' && global.document.documentElement.doScroll) {
        iframe.onreadystatechange = function() {
          if (iframe.readyState === 'complete' || iframe.readyState === 'loaded') {
            onLoad();
          }
        };
      }

      timeout = setTimeout(onTimeout, 8000);
      eventUtils.unloadAdd(cleanup);

      var container = global.document.body || global.document.documentElement;
      container.appendChild(iframe);

      return {
        iframe: iframe,
        cleanup: cleanup,
        loaded: onLoad
      };
    }

    function createHtmlfile(url, callback) {
      var doc = new global.ActiveXObject('htmlfile');
      var timeout;
      var cleanup;
      var loaded = false;

      function onTimeout() {
        cleanup();
        if (doc) {
          try {
            doc.parentWindow.opener = null;
          } catch (e) {}
          CollectGarbage();
        }
        doc = null;
      }

      function onLoad() {
        if (loaded) {
          return;
        }
        loaded = true;
        cleanup();
        callback(null, doc);
      }

      cleanup = function() {
        clearTimeout(timeout);
        eventUtils.unloadDel(cleanup);
      };

      doc.open();
      doc.write('<html><script>document.domain="' + global.document.domain + '"</script></html>');
      doc.close();
      doc.parentWindow.opener = global;

      var iframe = doc.createElement('iframe');
      iframe.src = url;
      iframe.id = 'a' + random.string(8);
      iframe.style.display = 'none';
      iframe.onerror = onError;
      iframe.onload = onLoad;

      function onError() {
        cleanup();
        callback(new Error('iframe error'));
      }

      if (typeof iframe.readyState !== 'undefined') {
        iframe.onreadystatechange = function() {
          if (iframe.readyState === 'complete' || iframe.readyState === 'loaded') {
            onLoad();
          }
        };
      }

      timeout = setTimeout(onTimeout, 8000);
      eventUtils.unloadAdd(cleanup);

      doc.body.appendChild(iframe);

      return {
        iframe: iframe,
        cleanup: cleanup,
        loaded: onLoad
      };
    }

    module.exports = {
      WPrefix: WPrefix,
      currentWindowId: null,
      polluteGlobalNamespace: polluteGlobalNamespace,
      postMessage: postMessage,
      createIframe: createIframe,
      createHtmlfile: createHtmlfile
    };

    if (global.window) {
      module.exports.currentWindowId = (typeof global.window.postMessage === 'function' || typeof global.window.postMessage === 'object') && !browser.isKonqueror();
    }
  }
});

var require_url = __commonJS({
  '../work/sockjs__sockjs-client/lib/utils/url.js'(exports, module) {
    'use strict';
    var URL = require('url');
    var debug = function() {};

    if (process.env.NODE_ENV !== 'production') {
      debug = require('debug')('sockjs-client:url');
    }

    module.exports = {
      getOrigin: function(urlStr) {
        if (!urlStr) {
          return null;
        }
        var url = new URL(urlStr);
        if (url.protocol === 'file:') {
          return null;
        }
        var port = url.port;
        if (!port) {
          port = url.protocol === 'https:' ? '443' : '80';
        }
        return url.protocol + '//' + url.hostname + ':' + port;
      },
      isOriginEqual: function(a, b) {
        var res = this.getOrigin(a) === this.getOrigin(b);
        debug('same', a, b, res);
        return res;
      },
      isSchemeEqual: function(a, b) {
        return a.split(':')[0] === b.split(':')[0];
      },
      addPath: function(url, path) {
        var qs = url.split('?');
        return qs[0] + path + (qs[1] ? '?' + qs[1] : '');
      },
      addQuery: function(url, q) {
        return url + (url.indexOf('?') === -1 ? '?' + q : '&' + q);
      },
      isLoopbackAddr: function(addr) {
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
var debug = function() {};

if (process.env.NODE_ENV !== 'production') {
  debug = require('debug')('sockjs-client:receiver:jsonp');
}

function JsonpReceiver(url) {
  debug(url);
  var self = this;
  EventEmitter.call(this);
  utils.polluteGlobalNamespace();
  this.id = 'a' + random.string(8);
  var fullUrl = urlUtils.addQuery(url, 'c=' + encodeURIComponent(utils.WPrefix + '.' + this.id));
  global[utils.WPrefix][this.id] = this._callback.bind(this);
  this._createScript(fullUrl);
  this._timeoutId = setTimeout(function() {
    debug('timeout');
    self._abort(new Error('JSONP script loaded timeout'));
  }, JsonpReceiver.timeout);
}

inherits(JsonpReceiver, EventEmitter);

JsonpReceiver.prototype._callback = function(data) {
  debug('_callback', data);
  this._cleanup();
  if (this._aborting) {
    return;
  }
  if (data) {
    debug('message', data);
    this.emit('message', data);
  }
  this.emit('close', null, 'network');
  this._cleanup();
};

JsonpReceiver.prototype._abort = function(err) {
  debug('_abort', err);
  this._cleanup();
  this._aborting = true;
  this.emit('close', err.code || 1006, err.message);
};

JsonpReceiver.prototype._cleanup = function() {
  debug('_cleanup');
  clearTimeout(this._timeoutId);
  if (this._script) {
    this._script.parentNode.removeChild(this._script);
    this._script = null;
  }
  if (this._iframe) {
    var iframe = this._iframe;
    iframe.parentNode.removeChild(iframe);
    iframe.onload = iframe.onerror = iframe.onreadystatechange = iframe.onmessage = null;
    this._iframe = null;
  }
  delete global[utils.WPrefix][this.id];
};

JsonpReceiver.prototype._createScript = function(url) {
  debug('_createScript', url);
  var self = this;
  if (this._script) {
    return;
  }
  this._script = global.document.createElement('script');
  this._script.id = 'a' + random.string(8);
  this._script.src = url;
  this._script.onerror = function() {
    debug('onerror');
    self._abort(new Error('JSONP script error'));
  };
  this._script.onload = function() {
    debug('onload');
    if (!self._aborting) {
      self._abort(new Error('JSONP script loaded without callback'));
    }
  };
  var head = global.document.getElementsByTagName('head')[0];
  head.insertBefore(this._script, head.firstChild);
};

JsonpReceiver.timeout = 35000;
JsonpReceiver.scriptErrorTimeout = 5000;

module.exports = JsonpReceiver;
