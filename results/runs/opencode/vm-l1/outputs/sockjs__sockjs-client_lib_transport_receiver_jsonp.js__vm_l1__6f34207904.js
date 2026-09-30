'use strict';

const { EventEmitter } = require('events');
const crypto = require('crypto');
const inherits = require('inherits');

const globalObject = typeof globalThis !== 'undefined' ? globalThis : global;
const callbackPrefix = '_jp';

if (!globalObject[callbackPrefix]) {
  globalObject[callbackPrefix] = {};
}

let debug = function () {};
if (process.env.NODE_ENV !== 'production') {
  debug = require('debug')('sockjs-client:receiver:jsonp');
}

function randomString(length) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz012345';
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let index = 0; index < length; index++) {
    result += alphabet[bytes[index] & 31];
  }
  return result;
}

function addQuery(url, query) {
  return url + (url.includes('?') ? '&' : '?') + query;
}

function isOpera() {
  return typeof globalObject.opera !== 'undefined' ||
    (globalObject.navigator && /opera|opr\//i.test(globalObject.navigator.userAgent));
}

/**
 * Receives a single SockJS JSONP response by inserting a script element.
 *
 * @param {string} url URL from which the JSONP response should be loaded.
 */
function JsonpReceiver(url) {
  debug(url);
  EventEmitter.call(this);

  this.id = randomString(7);
  globalObject[callbackPrefix][this.id] = this._callback.bind(this);

  const callbackName = encodeURIComponent(`${callbackPrefix}.${this.id}`);
  this._createScript(addQuery(url, `c=${callbackName}`));

  this.timeoutId = setTimeout(() => {
    debug('timeout');
    this._abort(new Error('JSONP script loaded abnormally (timeout)'));
  }, JsonpReceiver.timeout);
}

inherits(JsonpReceiver, EventEmitter);

JsonpReceiver.timeout = 35000;
JsonpReceiver.scriptErrorTimeout = 1000;

JsonpReceiver.prototype.abort = function abort() {
  debug('abort');
  if (globalObject[callbackPrefix][this.id]) {
    const error = new Error('JSONP user aborted read');
    error.code = 1000;
    this._abort(error);
  }
};

JsonpReceiver.prototype._callback = function callback(message) {
  debug('_callback', message);
  this._cleanup();

  if (this.aborting) return;
  if (message) {
    debug('message', message);
    this.emit('message', message);
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
    script.onreadystatechange = script.onerror = script.onload = script.onclick = null;
    this.script = null;
  }

  delete globalObject[callbackPrefix][this.id];
};

JsonpReceiver.prototype._scriptError = function scriptError() {
  debug('_scriptError');
  if (this.errorTimer) return;

  this.errorTimer = setTimeout(() => {
    if (!this.loadedOkay) {
      this._abort(new Error('JSONP script loaded abnormally (onerror)'));
    }
  }, JsonpReceiver.scriptErrorTimeout);
};

JsonpReceiver.prototype._createScript = function createScript(url) {
  debug('_createScript', url);

  const receiver = this;
  const script = this.script = globalObject.document.createElement('script');
  let operaHelper;

  script.id = `a${randomString(8)}`;
  script.src = url;
  script.type = 'text/javascript';
  script.charset = 'UTF-8';
  script.onerror = this._scriptError.bind(this);
  script.onload = function onload() {
    debug('onload');
    receiver._abort(new Error('JSONP script loaded abnormally (onload)'));
  };
  script.onreadystatechange = function onReadyStateChange() {
    debug('onreadystatechange', script.readyState);
    if (/loaded|closed/.test(script.readyState)) {
      if (script && script.htmlFor && script.onclick) {
        receiver.loadedOkay = true;
        try {
          script.onclick();
        } catch (_) {}
      }
      if (script) {
        receiver._abort(new Error('JSONP script loaded abnormally (onreadystatechange)'));
      }
    }
  };

  // Old versions of Internet Explorer need an onclick-based loading trick.
  if (typeof script.async === 'undefined' && globalObject.document.attachEvent) {
    if (!isOpera()) {
      try {
        script.htmlFor = script.id;
        script.event = 'onclick';
      } catch (_) {}
      script.async = true;
    } else {
      operaHelper = this.script2 = globalObject.document.createElement('script');
      operaHelper.text = `try{var a = document.getElementById('${script.id}'); if(a)a.onerror();}catch(x){};`;
      script.async = operaHelper.async = false;
    }
  }

  if (typeof script.async !== 'undefined') {
    script.async = true;
  }

  const head = globalObject.document.getElementsByTagName('head')[0];
  head.insertBefore(script, head.firstChild);
  if (operaHelper) {
    head.insertBefore(operaHelper, head.firstChild);
  }
};

module.exports = JsonpReceiver;
