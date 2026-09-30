'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  var exports = {};
  var result = {};
  (mod || __getOwnPropNames(cb).forEach(function(key) {
    var desc = Object.getOwnPropertyDescriptor(cb, key);
    Object.defineProperty(exports, key, desc.get ? desc : {
      enumerable: true,
      get: function() { return cb[key]; }
    });
  }), (mod = result)(exports, mod));
  return result.exports || exports;
};

var require_random = __commonJS({'../work/sockjs__sockjs-client/lib/utils/random.js'(exports, module) {
  'use strict';
  var crypto = require('crypto');
  var alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  module.exports = {
    'string': function(length) {
      var max = alphabet.length, bytes = crypto.randomBytes(length);
      var result = [];
      for (var i = 0; i < length; i++) {
        result.push(alphabet[bytes[i] % max]);
      }
      return result.join('');
    },
    'number': function(max) {
      return Math.floor(Math.random() * max);
    },
    'numberString': function(max) {
      var length = ('' + (max - 1)).length,
        str = new Array(length + 1).join('0');
      return (str + this['number'](max)).slice(-length);
    }
  };
}});

var require_event = __commonJS({'../work/sockjs__sockjs-client/lib/utils/event.js'(exports, module) {
  'use strict';
  var random = require_random();
  var unloadHandlers = {}, unloadCalled = false;
  var isNode = typeof process !== 'undefined' && process.versions && process.versions.node;

  module.exports = {
    'attachEvent': function(event, listener) {
      if (typeof global.addEventListener !== 'undefined') {
        global.addEventListener(event, listener, false);
      } else if (global.attachEvent && global.detachEvent) {
        global.attachEvent('on' + event, listener);
        global.attachEvent('on' + event, listener);
      }
    },
    'detachEvent': function(event, listener) {
      if (typeof global.removeEventListener !== 'undefined') {
        global.removeEventListener(event, listener, false);
      } else {
        if (global.attachEvent && global.detachEvent) {
          global.detachEvent('on' + event, listener);
          global.detachEvent('on' + event, listener);
        }
      }
    },
    'unloadAdd': function(listener) {
      if (isNode) {
        return null;
      }
      var ref = random.string(8);
      unloadHandlers[ref] = listener;
      if (unloadCalled) {
        setTimeout(this.triggerUnloadCallbacks, 0);
      }
      return ref;
    },
    'unloadDel': function(ref) {
      if (ref in unloadHandlers) {
        delete unloadHandlers[ref];
      }
    },
    'triggerUnloadCallbacks': function() {
      for (var ref in unloadHandlers) {
        unloadHandlers[ref]();
        delete unloadHandlers[ref];
      }
    }
  };

  var triggerUnload = function() {
    if (unloadCalled) {
      return;
    }
    unloadCalled = true;
    module.exports.triggerUnloadCallbacks();
  };

  var onUnload = function(event) {
    if (!event._sockjs_onunload) {
      triggerUnload();
    }
  };

  if (!isNode) {
    module.exports.attachEvent('unload', onUnload);
  }
}});

var require_browser = __commonJS({'../work/sockjs__sockjs-client/lib/utils/browser.js'(exports, module) {
  'use strict';
  module.exports = {
    'isOpera': function() {
      return global.navigator && /opera/i.test(global.navigator.userAgent);
    },
    'isKonqueror': function() {
      return global.navigator && /konqueror/i.test(global.navigator.userAgent);
    },
    'hasDomain': function() {
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
}});

var require_iframe = __commonJS({'../work/sockjs__sockjs-client/lib/utils/iframe.js'(exports, module) {
  'use strict';
  var eventUtils = require_event();
  var browser = require_browser();
  var debug = function() {};
  if (process.env.NODE_ENV !== 'production') {
    debug = require('debug')('sockjs-client:utils:iframe');
  }

  module.exports = {
    'WPrefix': '_jp',
    'currentWindowId': null,
    'polluteGlobalNamespace': function() {
      if (!(module.exports.WPrefix in global)) {
        global[module.exports.WPrefix] = {};
      }
    },
    'postMessage': function(type, data) {
      if (global.parent === global) {
        global.postMessage(JSON.stringify({
          windowId: module.exports.currentWindowId,
          type: type,
          data: data || ''
        }), '*');
      } else {
        debug('Cannot postMessage, parent window is not same origin');
      }
    },
    'createIframe': function(iframeUrl, errorCallback) {
      var iframe = global.document.createElement('iframe');
      var timer, ref, cleanup = function() {
        debug('iframe cleanup');
        clearTimeout(timer);
        try {
          iframe.onload = null;
        } catch (e) {}
        iframe.src = null;
      };
      var onerror = function(err) {
        debug('iframe onerror', err);
        if (iframe) {
          cleanup();
          errorCallback(err);
        }
      };
      var onload = function() {
        debug('iframe onload');
        if (iframe) {
          cleanup();
          ref = eventUtils.unloadAdd(cleanup);
        }
      };
      iframe.src = iframeUrl;
      iframe.style.display = 'none';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.tabIndex = -1;
      iframe.onload = onload;
      iframe.onerror = onerror;
      global.document.body.appendChild(iframe);
      timer = setTimeout(function() {
        onerror(new Error('iframe timeout'));
      }, 15000);
      ref = eventUtils.unloadAdd(cleanup);
      var obj = {};
      obj.iframe = iframe;
      obj.cleanup = cleanup;
      obj.onload = onload;
      return obj;
    },
    'createHtmlfile': function(htmlfileUrl, errorCallback) {
      var htmlfile = new global.ActiveXObject('htmlfile');
      var timer, ref, cleanup = function() {
        debug('htmlfile cleanup');
        clearTimeout(timer);
        if (htmlfile) {
          htmlfile.parentNode.removeChild(htmlfile);
          htmlfile = null;
          if (typeof CollectGarbage !== 'undefined') {
            CollectGarbage();
          }
        }
        eventUtils.unloadDel(ref);
      };
      var onerror = function(err) {
        debug('htmlfile onerror', err);
        if (htmlfile) {
          cleanup();
          errorCallback(err);
        }
      };
      htmlfile.open();
      htmlfile.write('<html><script>document.domain="' + global.document.domain + '";</script></html>');
      htmlfile.close();
      htmlfile.parentWindow[module.exports.WPrefix] = global[module.exports.WPrefix];
      var iframe = htmlfile.createElement('iframe');
      htmlfile.body.appendChild(iframe);
      iframe.src = htmlfileUrl;
      iframe.onerror = onerror;
      timer = setTimeout(function() {
        onerror(new Error('htmlfile timeout'));
      }, 15000);
      ref = eventUtils.unloadAdd(cleanup);
      var obj = {};
      obj.iframe = iframe;
      obj.cleanup = cleanup;
      obj.onload = function() {};
      return obj;
    }
  };

  module.exports.enabled = false;
  if (global.document) {
    module.exports.enabled = (typeof global.ActiveXObject !== 'undefined' || typeof global.ActiveXObject !== 'undefined') && !browser.isKonqueror();
  }
}});

var require_url = __commonJS({'../work/sockjs__sockjs-client/lib/utils/url.js'(exports, module) {
  'use strict';
  var URL = require('url-parse');
  var debug = function() {};
  if (process.env.NODE_ENV !== 'production') {
    debug = require('debug')('sockjs-client:utils:url');
  }

  module.exports = {
    'getOrigin': function(url) {
      if (!url) {
        return null;
      }
      var parsed = new URL(url);
      if (parsed.protocol === 'file:') {
        return null;
      }
      var port = parsed.port;
      if (!port) {
        port = parsed.protocol === 'https:' ? '443' : '80';
      }
      return parsed.protocol + '//' + parsed.hostname + ':' + port;
    },
    'isOriginEqual': function(a, b) {
      var res = this.getOrigin(a) === this.getOrigin(b);
      debug('isOriginEqual', a, b, res);
      return res;
    },
    'isSchemeEqual': function(a, b) {
      return a.split(':')[0] === b.split(':')[0];
    },
    'addPath': function(url, path) {
      var qs = url.split('?');
      return qs[0] + path + (qs[1] ? '?' + qs[1] : '');
    },
    'addQuery': function(url, q) {
      return url + (url.indexOf('?') === -1 ? '?' + q : '&' + q);
    },
    'isLoopbackAddr': function(addr) {
      return /^127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) || /^\[::1\]$/.test(addr);
    }
  };
}});

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
  debug('constructor', url);
  var self = this;
  EventEmitter.call(this);
  utils.polluteGlobalNamespace();
  this.id = 'a' + random.string(6);
  var urlWithCallback = urlUtils.addQuery(url, 'c=' + encodeURIComponent(utils.WPrefix + '.' + this.id));
  global[utils.WPrefix][this.id] = this._jsonpCallback.bind(this);
  this._script = utils.createIframe(urlWithCallback);
  this._timeoutRef = setTimeout(function() {
    debug('timeout');
    self._abort(new Error('JSONP script loaded timeout'));
  }, JsonpReceiver.timeout);
}

inherits(JsonpReceiver, EventEmitter);

JsonpReceiver.prototype._abort = function(err) {
  debug('_abort', err);
  this._cleanup();
  if (this._timeoutRef) {
    return;
  }
  err.code = 1002;
  this.emit('error', err);
};

JsonpReceiver.prototype._cleanup = function() {
  debug('_cleanup');
  clearTimeout(this._timeoutRef);
  if (this._script) {
    this._script.parentNode.removeChild(this._script);
    this._script = null;
  }
  delete global[utils.WPrefix][this.id];
};

JsonpReceiver.prototype._jsonpCallback = function(message) {
  debug('_jsonpCallback', message);
  this._cleanup();
  if (this._timeoutRef) {
    return;
  }
  if (message) {
    debug('message', message);
    this.emit('message', message);
  }
  this.emit('close', null, 'network');
  this.triggerUnloadCallbacks();
};

JsonpReceiver.prototype._scriptCallback = function(err) {
  debug('_scriptCallback', err);
  this._cleanup();
  if (this._timeoutRef) {
    return;
  }
  this._timeoutRef = setTimeout(function() {
    if (!self._aborted) {
      self._abort(new Error('JSONP script loaded timeout'));
    }
  }, JsonpReceiver.timeout);
};

JsonpReceiver.timeout = 5000;
JsonpReceiver.scriptLoadTimeout = 5000;

JsonpReceiver.prototype._jsonpCallback = function(message) {
  debug('_jsonpCallback', message);
  this._cleanup();
  if (this._timeoutRef) {
    return;
  }
  if (message) {
    debug('message', message);
    this.emit('message', message);
  }
  this.emit('close', null, 'network');
  this.triggerUnloadCallbacks();
};

JsonpReceiver.prototype._scriptCallback = function(err) {
  debug('_scriptCallback', err);
  this._cleanup();
  if (this._timeoutRef) {
    return;
  }
  this._timeoutRef = setTimeout(function() {
    if (!self._aborted) {
      self._abort(new Error('JSONP script loaded timeout'));
    }
  }, JsonpReceiver.timeout);
};

JsonpReceiver.prototype._createScript = function(url) {
  debug('_createScript', url);
  var self = this;
  var script = this._script = global.document.createElement('script');
  script.id = 'a' + random.number(1000);
  script.src = url;
  script.type = 'text/javascript';
  script.async = true;
  script.onload = function() {
    debug('script.onload');
    self._abort(new Error('JSONP script loaded (onload)'));
  };
  script.onerror = function() {
    debug('script.onerror', script.readyState);
    if (/loaded|closed/.test(script.readyState)) {
      if (script && script.onload && script.onerror) {
        self._aborted = true;
        try {
          script.parentNode.removeChild(script);
        } catch (e) {}
        script = null;
        self._abort(new Error('JSONP script loaded (onreadystatechange)'));
      }
    }
  };
  if (typeof script.readyState !== 'undefined' && global.attachEvent) {
    if (!browser.isKonqueror()) {
      try {
        script.htmlFor = script.id;
        script.event = 'onclick';
      } catch (e) {}
      script.async = true;
    } else {
      var helper = this._helper = global.document.createElement('ins');
      helper.htmlFor = 'a' + script.id;
      script.async = helper.async = false;
    }
  }
  if (typeof script.readyState !== 'undefined') {
    script.readyState = true;
  }
  var head = global.document.getElementsByTagName('head')[0];
  head.insertBefore(script, head.firstChild);
  if (helper) {
    head.insertBefore(helper, head.firstChild);
  }
};

module.exports = JsonpReceiver;
