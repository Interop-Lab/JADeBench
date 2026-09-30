'use strict';

const crypto = require('crypto');
const EventEmitter = require('events').EventEmitter;
const inherits = require('inherits');

const random = {
  string(length) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz012345';
    const bytes = crypto.randomBytes(length);
    let value = '';
    for (let index = 0; index < length; index += 1) {
      value += alphabet[bytes[index] % alphabet.length];
    }
    return value;
  },

  number(maximum) {
    return Math.floor(Math.random() * maximum);
  },

  numberString(length) {
    const width = String(length - 1).length;
    return `${'0'.repeat(width)}${this.number(length)}`.slice(-width);
  }
};

const event = {
  attachEvent(name, listener) {
    if (typeof global.addEventListener !== 'undefined') {
      global.addEventListener(name, listener, false);
    } else if (global.document && global.document.attachEvent) {
      global.document.attachEvent(`on${name}`, listener);
      global.attachEvent(`on${name}`, listener);
    }
  },

  detachEvent(name, listener) {
    if (typeof global.removeEventListener !== 'undefined') {
      global.removeEventListener(name, listener, false);
    } else if (global.document && global.document.detachEvent) {
      global.document.detachEvent(`on${name}`, listener);
      global.detachEvent(`on${name}`, listener);
    }
  },

  unloadAdd(callback) {
    const id = random.string(8);
    unloadCallbacks[id] = callback;
    if (unloadCallbacksAttached) {
      setTimeout(event.triggerUnloadCallbacks, 0);
    }
    return id;
  },

  unloadDel(id) {
    delete unloadCallbacks[id];
  },

  triggerUnloadCallbacks() {
    for (const id in unloadCallbacks) {
      unloadCallbacks[id]();
      delete unloadCallbacks[id];
    }
  }
};

const unloadCallbacks = Object.create(null);
const unloadCallbacksAttached = false;

const browser = {
  isOpera() {
    return Boolean(global.navigator && /opera/i.test(global.navigator.userAgent));
  },

  isKonqueror() {
    return Boolean(global.navigator && /konqueror/i.test(global.navigator.userAgent));
  },

  hasDomain() {
    if (!global.document) return true;
    try {
      return Boolean(global.document.domain);
    } catch {
      return false;
    }
  }
};

const iframe = {
  WPrefix: '_jp',
  currentWindowId: null,

  polluteGlobalNamespace() {
    if (!global[this.WPrefix]) global[this.WPrefix] = {};
    if (global.parent && global.parent !== global) {
      try {
        global.parent.postMessage({
          windowId: this.currentWindowId,
          type: 'set',
          data: global[this.WPrefix]
        }, '*');
      } catch {}
    }
  },

  createIframe(url, unloadCallback) {
    if (!global.document) return null;
    const element = global.document.createElement('iframe');
    let timeout;
    let iframeElement = element;
    let scriptElement;

    const cleanup = () => {
      clearTimeout(timeout);
      if (scriptElement && scriptElement.parentNode) scriptElement.parentNode.removeChild(scriptElement);
      scriptElement = null;
      if (iframeElement && iframeElement.parentNode) iframeElement.parentNode.removeChild(iframeElement);
      iframeElement = null;
    };
    const post = (message, origin) => {
      if (iframeElement && iframeElement.contentWindow) {
        iframeElement.contentWindow.postMessage(message, origin);
      }
    };
    const loaded = () => {
      clearTimeout(timeout);
      element.onload = null;
    };

    element.src = url;
    element.style.display = 'none';
    element.style.position = 'absolute';
    element.onload = loaded;
    element.onerror = unloadCallback;
    global.document.body.appendChild(element);
    timeout = setTimeout(unloadCallback, 10000);
    event.unloadAdd(unloadCallback);
    return { post, cleanup, loaded };
  },

  createHtmlfile(url, unloadCallback) {
    return this.createIframe(url, unloadCallback);
  }
};

if (global.document) {
  iframe.iframeEnabled = (typeof global.postMessage === 'function' || typeof global.postMessage === 'object') && !browser.isKonqueror();
} else {
  iframe.iframeEnabled = false;
}

const urlUtils = {
  getOrigin(url) {
    if (!url) return null;
    const parsed = new URL(url);
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
    return `${parts[0]}${path}${parts[1] ? `?${parts[1]}` : ''}`;
  },

  addQuery(url, query) {
    return `${url}${url.indexOf('?') === -1 ? '?' : '&'}${query}`;
  },

  isLoopbackAddr(hostname) {
    return /^127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(hostname) || /^\[::1\]$/.test(hostname);
  }
};

let debug = () => {};
if (process.env.NODE_ENV !== 'production') {
  try {
    debug = require('debug')('sockjs-client:receiver:jsonp');
  } catch {}
}

function JsonpReceiver(url) {
  debug(url);
  EventEmitter.call(this);
  iframe.polluteGlobalNamespace();
  this.id = `a${random.string(8)}`;
  const callbackName = encodeURIComponent(`${iframe.WPrefix}.${this.id}`);
  const scriptUrl = urlUtils.addQuery(url, `c=${callbackName}`);

  global[iframe.WPrefix][this.id] = this._callback.bind(this);
  this._createScript(scriptUrl);
  this.timeoutId = setTimeout(() => {
    debug('timeout');
    this._abort(new Error('JSONP script loaded abnormally (timeout)'));
  }, JsonpReceiver.timeout);
}

inherits(JsonpReceiver, EventEmitter);

JsonpReceiver.prototype.abort = function abort() {
  debug('abort');
  if (global[iframe.WPrefix][this.id]) {
    const error = new Error('JSONP user aborted read');
    error.code = 1000;
    this._abort(error);
  }
};

JsonpReceiver.timeout = 35000;
JsonpReceiver.scriptErrorTimeout = 10000;

JsonpReceiver.prototype._callback = function callback(message) {
  debug('_callback', message);
  this._cleanup();
  if (this.aborting) return;

  if (message) {
    this.emit('message', message);
  }
  this.emit('close', null, 'network');
  this.removeAllListeners();
};

JsonpReceiver.prototype._abort = function abortReceiver(error) {
  debug('_abort', error);
  this.aborting = true;
  this._cleanup();
  this.emit('close', error.code, error.message);
  this.removeAllListeners();
};

JsonpReceiver.prototype._cleanup = function cleanup() {
  debug('_cleanup');
  clearTimeout(this.timeoutId);
  if (this.script2 && this.script2.parentNode) this.script2.parentNode.removeChild(this.script2);
  this.script2 = null;
  if (this.script && this.script.parentNode) this.script.parentNode.removeChild(this.script);
  this.script = null;
  delete global[iframe.WPrefix][this.id];
};

JsonpReceiver.prototype._scriptError = function scriptError() {
  debug('_scriptError');
  this._abort(new Error('JSONP script loaded abnormally (onerror)'));
};

JsonpReceiver.prototype._createScript = function createScript(url) {
  debug('_createScript', url);
  const script = this.script = global.document.createElement('script');
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
      this.loadedOkay = true;
      if (script.onclick) script.onclick();
    }
  };

  if (typeof script.async === 'undefined' && global.document.attachEvent) {
    if (!browser.isOpera()) {
      script.onreadystatechange = script.onload;
    } else {
      script.htmlFor = script.id;
      script.event = 'onclick';
    }
  } else {
    script.async = true;
  }

  const head = global.document.getElementsByTagName('head')[0];
  head.insertBefore(script, head.firstChild);
};

module.exports = JsonpReceiver;
