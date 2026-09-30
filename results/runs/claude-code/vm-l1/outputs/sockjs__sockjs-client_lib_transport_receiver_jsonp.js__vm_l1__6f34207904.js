'use strict';

const crypto = require('crypto');
const { EventEmitter } = require('events');
const inherits = require('inherits');

const CALLBACK_PREFIX = '_jp';
const CALLBACK_ID_ALPHABET = 'abcdefghijklmnopqrstuvwxyz012345';

let debug = function () {};
if (process.env.NODE_ENV !== 'production') {
  debug = require('debug')('sockjs-client:receiver:jsonp');
}

function randomString(length) {
  const bytes = crypto.randomBytes(length);
  let value = '';

  for (let index = 0; index < length; index += 1) {
    value += CALLBACK_ID_ALPHABET[bytes[index] % CALLBACK_ID_ALPHABET.length];
  }

  return value;
}

function addQuery(url, query) {
  return url + (url.includes('?') ? '&' : '?') + query;
}

function isOpera() {
  return Boolean(global.navigator && /opera/i.test(global.navigator.userAgent));
}

function JsonpReceiver(url) {
  EventEmitter.call(this);

  if (!global[CALLBACK_PREFIX]) {
    global[CALLBACK_PREFIX] = {};
  }

  this.id = randomString(7);
  global[CALLBACK_PREFIX][this.id] = this._callback.bind(this);

  const callbackName = `${CALLBACK_PREFIX}.${this.id}`;
  this._createScript(addQuery(url, `c=${encodeURIComponent(callbackName)}`));

  this.timeoutId = setTimeout(() => {
    this._abort(new Error('JSONP script loaded abnormally (timeout)'));
  }, JsonpReceiver.timeout);
}

inherits(JsonpReceiver, EventEmitter);

JsonpReceiver.timeout = 35000;
JsonpReceiver.scriptErrorTimeout = 1000;

JsonpReceiver.prototype.abort = function abort() {
  debug('abort');

  if (global[CALLBACK_PREFIX][this.id]) {
    const error = new Error('JSONP user aborted read');
    error.code = 1000;
    this._abort(error);
  }
};

JsonpReceiver.prototype._callback = function callback(message) {
  debug('_callback', message);
  this._cleanup();

  if (this.aborting) {
    return;
  }

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
    script.onreadystatechange = null;
    script.onerror = null;
    script.onload = null;
    script.onclick = null;
    this.script = null;
  }

  delete global[CALLBACK_PREFIX][this.id];
};

JsonpReceiver.prototype._scriptError = function scriptError() {
  debug('_scriptError');

  if (this.errorTimer) {
    return;
  }

  this.errorTimer = setTimeout(() => {
    if (!this.loadedOkay) {
      this._abort(new Error('JSONP script loaded abnormally (onerror)'));
    }
  }, JsonpReceiver.scriptErrorTimeout);
};

JsonpReceiver.prototype._createScript = function createScript(url) {
  debug('_createScript', url);

  const script = (this.script = global.document.createElement('script'));
  let operaScript;

  script.id = `a${randomString(8)}`;
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
      if (script && script.htmlFor && script.event) {
        this.loadedOkay = true;
        try {
          script.onclick();
        } catch (error) {}
      }

      if (script) {
        this._abort(
          new Error('JSONP script loaded abnormally (onreadystatechange)'),
        );
      }
    }
  };

  if (typeof script.async === 'undefined' && global.document.attachEvent) {
    if (!isOpera()) {
      try {
        script.htmlFor = script.id;
        script.event = 'onclick';
      } catch (error) {}
      script.async = true;
    } else {
      operaScript = this.script2 = global.document.createElement('script');
      operaScript.text =
        `try{var a = document.getElementById('${script.id}` +
        "'); if(a)a.onerror();}catch(x){};";
      script.async = operaScript.async = false;
    }
  }

  if (typeof script.async !== 'undefined') {
    script.async = true;
  }

  const head = global.document.getElementsByTagName('head')[0];
  head.insertBefore(script, head.firstChild);
  if (operaScript) {
    head.insertBefore(operaScript, head.firstChild);
  }
};

module.exports = JsonpReceiver;
