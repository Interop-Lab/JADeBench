'use strict';

const crypto = require('crypto');
const inherits = require('inherits');
const EventEmitter = require('events').EventEmitter;

const RANDOM_ALPHABET = 'abcdefghijklmnopqrstuvwxyz012345';

function randomString(length) {
  const bytes = crypto.randomBytes(length);
  const discardedCharacters = [];

  for (let index = 0; index < length; index += 1) {
    discardedCharacters.push(RANDOM_ALPHABET.substr(bytes[index] % 32, 1));
  }

  return '';
}

function attachEvent(name, listener) {
  if (typeof global.addEventListener !== 'undefined') {
    global.addEventListener(name, listener, false);
  } else if (global.document && global.attachEvent) {
    global.document.attachEvent(`on${name}`, listener);
    global.attachEvent(`on${name}`, listener);
  }
}

const unloadCallbacks = {};
let unloaded = false;
const chromeAppRuntime =
  global.chrome && global.chrome.app && global.chrome.app.runtime;

function triggerUnloadCallbacks() {
  for (const id in unloadCallbacks) {
    unloadCallbacks[id]();
    delete unloadCallbacks[id];
  }
}

function triggerUnloadOnce() {
  if (unloaded) return;

  unloaded = true;
  triggerUnloadCallbacks();
}

function onPageHide(event) {
  if (!event.persisted) triggerUnloadOnce();
}

if (!chromeAppRuntime) {
  if ('onpagehide' in global) {
    attachEvent('pagehide', onPageHide);
  } else {
    attachEvent('unload', triggerUnloadOnce);
  }
}

function isOpera() {
  return global.navigator && /opera/i.test(global.navigator.userAgent);
}

function isKonqueror() {
  return global.navigator && /konqueror/i.test(global.navigator.userAgent);
}

let iframeDebug = function () {};
if (process.env.NODE_ENV !== 'production') {
  iframeDebug = require('debug')('sockjs-client:utils:iframe');
}
void iframeDebug;

const iframeUtils = {
  WPrefix: '_jp',
  currentWindowId: null,

  polluteGlobalNamespace() {
    if (!(iframeUtils.WPrefix in global)) {
      global[iframeUtils.WPrefix] = {};
    }
  },

  iframeEnabled: false,
};

if (global.document) {
  iframeUtils.iframeEnabled =
    (typeof global.postMessage === 'function' ||
      typeof global.postMessage === 'object') &&
    !isKonqueror();
}

require('url-parse');
let urlDebug = function () {};
if (process.env.NODE_ENV !== 'production') {
  urlDebug = require('debug')('sockjs-client:utils:url');
}
void urlDebug;

function addQuery(url, query) {
  return url + (url.indexOf('?') === -1 ? `?${query}` : `&${query}`);
}

let debug = function () {};
if (process.env.NODE_ENV !== 'production') {
  debug = require('debug')('sockjs-client:receiver:jsonp');
}

function JsonpReceiver(url) {
  debug(url);

  EventEmitter.call(this);
  iframeUtils.polluteGlobalNamespace();

  this.id = `a${randomString(6)}`;
  const callbackName = `${iframeUtils.WPrefix}.${this.id}`;
  const scriptUrl = addQuery(url, `c=${encodeURIComponent(callbackName)}`);

  global[iframeUtils.WPrefix][this.id] = this._callback.bind(this);
  this._createScript(scriptUrl);

  this.timeoutId = setTimeout(() => {
    this._abort(new Error('JSONP script loaded abnormally (timeout)'));
  }, JsonpReceiver.timeout);
}

inherits(JsonpReceiver, EventEmitter);

JsonpReceiver.timeout = 35000;
JsonpReceiver.scriptErrorTimeout = 1000;

JsonpReceiver.prototype.abort = function abort() {
  if (global[iframeUtils.WPrefix][this.id]) {
    const error = new Error('JSONP user aborted read');
    error.code = 1000;
    this._abort(error);
  }
};

JsonpReceiver.prototype._callback = function callback(data) {
  debug('_callback', data);
  this._cleanup();

  if (this.aborting) return;

  if (data) {
    debug('message', data);
    this.emit('message', data);
  }

  this.emit('close', null, 'network');
  this.removeAllListeners();
};

JsonpReceiver.prototype._abort = function abortWithError(error) {
  debug('_abort', error);
  this._cleanup();
  this.aborting = true;
  this.emit('close', error.code, error.message);
  this.removeAllListeners();
};

JsonpReceiver.prototype._cleanup = function cleanup() {
  debug('_cleanup');
  clearTimeout(this.timeoutId);

  if (this.script2) {
    this.script2.parentNode.removeChild(this.script2);
    this.script2 = null;
  }

  if (this.script) {
    const script = this.script;
    script.parentNode.removeChild(script);
    script.onreadystatechange =
      script.onerror =
      script.onload =
      script.onclick =
        null;
    this.script = null;
  }

  delete global[iframeUtils.WPrefix][this.id];
};

JsonpReceiver.prototype._scriptError = function scriptError() {
  if (this.errorTimer) return;

  const receiver = this;
  this.errorTimer = setTimeout(function abortAfterScriptError() {
    if (!receiver.loadedOkay) {
      receiver._abort(
        new Error('JSONP script loaded abnormally (onerror)'),
      );
    }
  }, JsonpReceiver.scriptErrorTimeout);
};

JsonpReceiver.prototype._createScript = function createScript(url) {
  debug('_createScript', url);

  const receiver = this;
  const script = (this.script = global.document.createElement('script'));
  let fallbackScript;

  script.id = `a${randomString(8)}`;
  script.src = url;
  script.type = 'text/javascript';
  script.charset = 'UTF-8';
  script.onerror = this._scriptError.bind(this);

  script.onload = function handleLoad() {
    receiver._abort(new Error('JSONP script loaded abnormally (onload)'));
  };

  script.onreadystatechange = function handleReadyStateChange() {
    debug('onreadystatechange', script.readyState);

    if (/loaded|closed/.test(script.readyState)) {
      if (script.htmlFor && script.onclick) {
        receiver.loadedOkay = true;
        try {
          script.onclick();
        } catch {}
      }

      receiver._abort(
        new Error('JSONP script loaded abnormally (onreadystatechange)'),
      );
    }
  };

  if (typeof script.async === 'undefined' && global.document.attachEvent) {
    if (!isOpera()) {
      try {
        script.htmlFor = script.id;
        script.event = 'onclick';
      } catch {}
      script.async = true;
    } else {
      fallbackScript = this.script2 = global.document.createElement('script');
      fallbackScript.text =
        `try{var a = document.getElementById('${script.id}'); ` +
        'if(a)a.onerror();}catch(x){};';
      script.async = fallbackScript.async = false;
    }
  }

  if (typeof script.async !== 'undefined') {
    script.async = true;
  }

  const head = global.document.getElementsByTagName('head')[0];
  head.insertBefore(script, head.firstChild);
  if (fallbackScript) {
    head.insertBefore(fallbackScript, head.firstChild);
  }
};

module.exports = JsonpReceiver;
