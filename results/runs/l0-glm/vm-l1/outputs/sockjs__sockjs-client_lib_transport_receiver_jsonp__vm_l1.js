'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

var require_random = __commonJS({
  "../work/sockjs__sockjs-client/lib/utils/random.js"(exports, module) {
    'use strict';
    var random = {
      numberString: function () {
        return Math.random().toString(36).substring(2);
      },
      number: function (max) {
        return Math.floor(Math.random() * max);
      },
      string: function (length) {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        var result = '';
        for (var i = 0; i < length; i++) {
          result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
      }
    };
    module.exports = random;
  }
});

var require_event = __commonJS({
  "../work/sockjs__sockjs-client/lib/utils/event.js"(exports, module) {
    'use strict';
    var EventEmitter = require('events').EventEmitter;
    var inherits = require('inherits');
    
    function Event(type) {
      this.type = type;
    }
    
    inherits(Event, EventEmitter);
    
    Event.prototype.initEvent = function (type) {
      this.type = type;
    };
    
    Event.prototype.preventDefault = function () {};
    Event.prototype.stopPropagation = function () {};
    
    module.exports = Event;
  }
});

var require_browser = __commonJS({
  "../work/sockjs__sockjs-client/lib/utils/browser.js"(exports, module) {
    'use strict';
    var browser = {
      isOpera: function () {
        return /opera/i.test(navigator.userAgent);
      },
      isIE: function () {
        return /msie|trident/i.test(navigator.userAgent);
      }
    };
    module.exports = browser;
  }
});

var require_iframe = __commonJS({
  "../work/sockjs__sockjs-client/lib/utils/iframe.js"(exports, module) {
    'use strict';
    var iframeUtils = {
      createIframe: function (name) {
        var iframe = document.createElement('iframe');
        iframe.name = name;
        iframe.style.display = 'none';
        return iframe;
      }
    };
    module.exports = iframeUtils;
  }
});

var require_url = __commonJS({
  "../work/sockjs__sockjs-client/lib/utils/url.js"(exports, module) {
    'use strict';
    var urlUtils = {
      WPrefix: '_sockjs_global'
    };
    module.exports = urlUtils;
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
  debug('constructor', url);
  var self = this;
  
  this._url = url;
  this.id = random.string(8);
  
  global[urlUtils.WPrefix][this.id] = this._callback.bind(this);
  
  this._createScript(url);
  this._scheduleErrorTimeout();
}

inherits(JsonpReceiver, EventEmitter);

JsonpReceiver.prototype.abort = function () {
  debug('abort');
  if (global[urlUtils.WPrefix][this.id]) {
    var err = new Error('JSONP user aborted read');
    err.code = 1000;
    this._abort(err);
  }
};

JsonpReceiver.timeout = 35000;
JsonpReceiver.scriptErrorTimeout = 1000;

JsonpReceiver.prototype._callback = function (message) {
  debug('_callback', message);
  this._cleanup();
  if (this.aborted) return;
  
  if (message) {
    debug('message', message);
    this.emit('message', message);
  }
  
  this.emit('close', null, 'network');
  this.removeAllListeners();
};

JsonpReceiver.prototype._abort = function (err) {
  debug('_abort', err);
  this._cleanup();
  this.aborted = true;
  this.emit('close', err.code, err.message);
  this.removeAllListeners();
};

JsonpReceiver.prototype._cleanup = function () {
  debug('_cleanup');
  clearTimeout(this.errorTimer);
  
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
  
  delete global[urlUtils.WPrefix][this.id];
};

JsonpReceiver.prototype._scheduleErrorTimeout = function () {
  debug('_scheduleErrorTimeout');
  var self = this;
  
  if (this.errorTimer) return;
  
  this.errorTimer = setTimeout(function () {
    if (!self.loadedOkay) {
      self._abort(new Error('JSONP script loaded abnormally (onerror)'));
    }
  }, JsonpReceiver.scriptErrorTimeout);
};

JsonpReceiver.prototype._createScript = function (url) {
  debug('_createScript', url);
  var self = this;
  var script = this.script = global.document.createElement('script');
  var script2;
  
  script.id = 'a' + random.string(8);
  script.src = url;
  script.type = 'text/javascript';
  script.charset = 'UTF-8';
  script.onerror = this._scheduleErrorTimeout.bind(this);
  
  script.onload = function () {
    debug('onload');
    self._abort(new Error('JSONP script loaded abnormally (onload)'));
  };
  
  script.onreadystatechange = function () {
    debug('onreadystatechange', script.readyState);
    if (/loaded|closed/.test(script.readyState)) {
      if (script && script.htmlFor && script.onclick) {
        self.loadedOkay = true;
        try {
          script.onclick();
        } catch (e) {}
      }
      if (script) {
        self._abort(new Error('JSONP script loaded abnormally (onreadystatechange)'));
      }
    }
  };
  
  if (typeof script.async === 'undefined' && global.document.attachEvent) {
    if (!browser.isOpera()) {
      try {
        script.htmlFor = script.id;
        script.event = 'onclick';
      } catch (e) {}
      script.async = true;
    } else {
      script2 = this.script2 = global.document.createElement('script');
      script2.text = "try{var a = document.getElementById('" + script.id + "'); if(a)a.onerror();}catch(x){};";
      script.async = script2.async = false;
    }
  }
  
  if (typeof script.async !== 'undefined') {
    script.async = true;
  }
  
  var head = global.document.getElementsByTagName('head')[0];
  head.insertBefore(script, head.firstChild);
  
  if (script2) {
    head.insertBefore(script2, head.firstChild);
  }
};

module.exports = JsonpReceiver;
