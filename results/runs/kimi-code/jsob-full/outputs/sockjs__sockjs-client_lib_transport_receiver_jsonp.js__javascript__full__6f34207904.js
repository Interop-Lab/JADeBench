'use strict';

const crypto = require('crypto');
const inherits = require('inherits');
const EventEmitter = require('events').EventEmitter;
const Url = require('url-parse');

let debug = function () {};
if (process.env.NODE_ENV !== 'production') {
  debug = require('debug')('sockjs-client:receiver:jsonp');
}

const random = {
  string(length) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = crypto.randomBytes(length);
    let value = '';
    for (let index = 0; index < length; index++) {
      value += alphabet.charAt(bytes[index] % alphabet.length);
    }
    return value;
  },

  number(max) {
    return Math.floor(Math.random() * max);
  },

  numberString(max) {
    const width = String(max - 1).length;
    const padding = new Array(width + 1).join('0');
    return (padding + this.number(max)).slice(-width);
  },
};

const unloadCallbacks = {};
let unloading = false;
const isChromeApp = global.chrome && global.chrome.app && global.chrome.app.runtime;

const event = {
  attachEvent(name, listener) {
    if (typeof global.addEventListener !== 'undefined') {
      global.addEventListener(name, listener, false);
    } else if (global.document && global.attachEvent) {
      global.document.attachEvent(`on${name}`, listener);
      global.attachEvent(`on${name}`, listener);
    }
  },

  detachEvent(name, listener) {
    if (typeof global.addEventListener !== 'undefined') {
      global.removeEventListener(name, listener, false);
    } else if (global.document && global.detachEvent) {
      global.document.detachEvent(`on${name}`, listener);
      global.detachEvent(`on${name}`, listener);
    }
  },

  unloadAdd(listener) {
    if (isChromeApp) return null;
    const id = random.string(8);
    unloadCallbacks[id] = listener;
    if (unloading) setTimeout(this.triggerUnloadCallbacks, 0);
    return id;
  },

  unloadDel(id) {
    if (id in unloadCallbacks) delete unloadCallbacks[id];
  },

  triggerUnloadCallbacks() {
    for (const id in unloadCallbacks) {
      unloadCallbacks[id]();
      delete unloadCallbacks[id];
    }
  },
};

function triggerUnloadCallbacks() {
  if (unloading) return;
  unloading = true;
  event.triggerUnloadCallbacks();
}

function handlePageHide(eventObject) {
  if (!eventObject.persisted) triggerUnloadCallbacks();
}

if (!isChromeApp) {
  if ('onpagehide' in global) event.attachEvent('pagehide', handlePageHide);
  else event.attachEvent('unload', triggerUnloadCallbacks);
}

const browser = {
  isOpera() {
    return global.navigator && /opera/i.test(global.navigator.userAgent);
  },

  isKonqueror() {
    return global.navigator && /konqueror/i.test(global.navigator.userAgent);
  },

  hasDomain() {
    if (!global.document) return true;
    try {
      return Boolean(global.document.domain);
    } catch (error) {
      return false;
    }
  },
};

const urlUtils = {
  getOrigin(url) {
    if (!url) return null;
    const parsed = new Url(url);
    if (parsed.protocol === 'file:') return null;
    const port = parsed.port || (parsed.protocol === 'https:' ? '443' : '80');
    return `${parsed.protocol}//${parsed.hostname}:${port}`;
  },

  isOriginEqual(first, second) {
    return this.getOrigin(first) === this.getOrigin(second);
  },

  isSchemeEqual(first, second) {
    return first.split(':')[0] === second.split(':')[0];
  },

  addPath(url, path) {
    const parts = url.split('?');
    return parts[0] + path + (parts[1] ? `?${parts[1]}` : '');
  },

  addQuery(url, query) {
    return url + (url.indexOf('?') === -1 ? `?${query}` : `&${query}`);
  },

  isLoopbackAddr(address) {
    return /^127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(address) || /^\[::1\]$/.test(address);
  },
};

const iframe = {
  WPrefix: '_jp',
  currentWindowId: null,

  polluteGlobalNamespace() {
    if (!(this.WPrefix in global)) global[this.WPrefix] = {};
  },

  postMessage(type, data) {
    if (global.parent !== global) {
      global.parent.postMessage(JSON.stringify({
        windowId: this.currentWindowId,
        type,
        data: data || '',
      }), '*');
    } else {
      debug('Cannot postMessage, no parent window', type, data);
    }
  },
};

function JsonpReceiver(url) {
  debug(url);
  EventEmitter.call(this);
  iframe.polluteGlobalNamespace();

  this.id = `a${random.string(6)}`;
  const callback = encodeURIComponent(`${iframe.WPrefix}.${this.id}`);
  const scriptUrl = urlUtils.addQuery(url, `c=${callback}`);
  global[iframe.WPrefix][this.id] = this._callback.bind(this);
  this._createScript(scriptUrl);

  this.timeoutId = setTimeout(() => {
    debug('JSONP script loaded abnormally (timeout)');
    this._abort(new Error('JSONP script loaded abnormally (timeout)'));
  }, JsonpReceiver.timeout);
}

inherits(JsonpReceiver, EventEmitter);

JsonpReceiver.timeout = 35000;
JsonpReceiver.scriptErrorTimeout = 1000;

JsonpReceiver.prototype.abort = function () {
  debug('abort');
  if (global[iframe.WPrefix][this.id]) {
    const error = new Error('JSONP user aborted read');
    error.code = 1000;
    this._abort(error);
  }
};

JsonpReceiver.prototype._callback = function (payload) {
  debug('_callback', payload);
  this._cleanup();
  if (this.aborting) return;

  if (payload) {
    if (global.parent !== global) {
      iframe.postMessage('message', payload);
    } else {
      debug('message', payload);
      this.emit('message', payload);
    }
  }
  this.emit('close', null, 'network');
  this.removeAllListeners();
};

JsonpReceiver.prototype._abort = function (error) {
  debug('aborting', error);
  this._cleanup();
  this.aborting = true;
  this.emit('close', error.code, error.message);
  this.removeAllListeners();
};

JsonpReceiver.prototype._cleanup = function () {
  debug('_cleanup');
  clearTimeout(this.timeoutId);

  if (this.script2) {
    this.script2.parentNode.removeChild(this.script2);
    this.script2 = null;
  }
  if (this.script) {
    const script = this.script;
    script.parentNode.removeChild(script);
    script.onreadystatechange = script.onerror = script.onload = script.onclick = null;
    this.script = null;
  }
  delete global[iframe.WPrefix][this.id];
};

JsonpReceiver.prototype._scriptError = function () {
  debug('_scriptError');
  if (this.errorTimer) return;
  this.errorTimer = setTimeout(() => {
    this._abort(new Error('JSONP script loaded abnormally (onerror)'));
  }, JsonpReceiver.scriptErrorTimeout);
};

JsonpReceiver.prototype._createScript = function (url) {
  const document = global.document;
  const script = this.script = document.createElement('script');
  script.id = `a${random.string(8)}`;
  script.src = url;
  script.type = 'text/javascript';
  script.charset = 'UTF-8';
  script.onerror = this._scriptError.bind(this);
  script.onload = () => {
    debug('onload');
    this._abort(new Error('JSONP script loaded abnormally (onload)'));
  };
  script.onreadystatechange = () => {
    debug('onreadystatechange', script.readyState);
    if (/loaded|closed/.test(script.readyState)) {
      if (script && script.htmlFor && script.onclick) {
        this.loadedOkay = true;
        try {
          script.onclick();
        } catch (error) {}
      }
      if (script) {
        this._abort(new Error('JSONP script loaded abnormally (onreadystatechange)'));
      }
    }
  };

  if (typeof script.async === 'undefined' && document.attachEvent) {
    if (!browser.isOpera()) {
      try {
        script.htmlFor = script.id;
        script.event = 'onclick';
      } catch (error) {}
      script.async = true;
    } else {
      this.script2 = document.createElement('script');
      this.script2.text = `try{var a = document.getElementById('${script.id}');\n if(a)a.onerror();\n}catch(x){};\n`;
      script.async = this.script2.async = false;
    }
  }
  if (typeof script.async !== 'undefined') script.async = true;

  const head = document.getElementsByTagName('head')[0];
  head.insertBefore(script, head.firstChild);
  if (this.script2) head.insertBefore(this.script2, head.firstChild);
};

module.exports = JsonpReceiver;
