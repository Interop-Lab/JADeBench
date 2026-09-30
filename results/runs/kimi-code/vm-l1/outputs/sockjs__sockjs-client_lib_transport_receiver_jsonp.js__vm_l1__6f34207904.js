'use strict';

const inherits = require('inherits');
const EventEmitter = require('events').EventEmitter;

const root =
  typeof globalThis !== 'undefined'
    ? globalThis
    : typeof self !== 'undefined'
      ? self
      : typeof global !== 'undefined'
        ? global
        : window;

const iframeUtils = {
  WPrefix: '_jp',
};
root[iframeUtils.WPrefix] = root[iframeUtils.WPrefix] || {};

const random = {
  string(length) {
    let value = '';
    while (value.length < length) {
      value += Math.random().toString(36).slice(2);
    }
    return value.slice(0, length);
  },
};

const browser = {
  isOpera() {
    return Boolean(root.navigator && /opera/i.test(root.navigator.userAgent));
  },
};

function addQuery(url, query) {
  return url + (url.indexOf('?') === -1 ? '?' : '&') + query;
}

let debug = function () {};
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  debug = require('debug')('sockjs-client:receiver:jsonp');
}

function JsonpReceiver(url) {
  debug(url);
  EventEmitter.call(this);

  const receiver = this;
  this.id = 'a' + random.string(6);
  const callbackName = iframeUtils.WPrefix + '.' + this.id;
  const urlWithCallback = addQuery(
    url,
    'c=' + encodeURIComponent(callbackName),
  );

  this.timeoutId = setTimeout(function () {
    receiver._abort(new Error('JSONP receive timeout'));
  }, JsonpReceiver.timeout);

  root[iframeUtils.WPrefix][this.id] = this._callback.bind(this);
  this._createScript(urlWithCallback);
}

inherits(JsonpReceiver, EventEmitter);

JsonpReceiver.prototype.abort = function () {
  debug('abort');
  if (root[iframeUtils.WPrefix][this.id]) {
    const error = new Error('JSONP user aborted read');
    error.code = 1000;
    this._abort(error);
  }
};

JsonpReceiver.timeout = 35000;
JsonpReceiver.scriptErrorTimeout = 1000;

JsonpReceiver.prototype._callback = function (data) {
  debug('_callback', data);
  this._cleanup();

  if (this.aborting) {
    return;
  }

  if (data) {
    debug('message', data);
    this.emit('message', data);
  }
  this.emit('close', null, 'network');
  this.removeAllListeners();
};

JsonpReceiver.prototype._abort = function (error) {
  debug('_abort', error);
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

  delete root[iframeUtils.WPrefix][this.id];
};

JsonpReceiver.prototype._scriptError = function () {
  debug('_scriptError');
  const receiver = this;
  if (this.errorTimer) {
    return;
  }

  this.errorTimer = setTimeout(function () {
    if (!receiver.loadedOkay) {
      receiver._abort(new Error('JSONP script loaded abnormally (onerror)'));
    }
  }, JsonpReceiver.scriptErrorTimeout);
};

JsonpReceiver.prototype._createScript = function (url) {
  debug('_createScript', url);
  const receiver = this;
  const script = (this.script = root.document.createElement('script'));
  let script2;

  script.id = 'a' + random.string(8);
  script.src = url;
  script.type = 'text/javascript';
  script.charset = 'UTF-8';
  script.onerror = this._scriptError.bind(this);
  script.onload = function () {
    debug('onload');
    receiver._abort(new Error('JSONP script loaded abnormally (onload)'));
  };
  script.onreadystatechange = function () {
    debug('onreadystatechange', script.readyState);
    if (/loaded|closed/.test(script.readyState)) {
      if (script && script.htmlFor && script.onclick) {
        receiver.loadedOkay = true;
        try {
          script.onclick();
        } catch (_) {}
      }
      if (script) {
        receiver._abort(
          new Error('JSONP script loaded abnormally (onreadystatechange)'),
        );
      }
    }
  };

  if (typeof script.async === 'undefined' && root.document.attachEvent) {
    if (!browser.isOpera()) {
      try {
        script.htmlFor = script.id;
        script.event = 'onclick';
      } catch (_) {}
      script.async = true;
    } else {
      script2 = this.script2 = root.document.createElement('script');
      script2.text =
        "try{var a = document.getElementById('" +
        script.id +
        "'); if(a)a.onerror();}catch(x){};";
      script.async = script2.async = false;
    }
  }

  if (typeof script.async !== 'undefined') {
    script.async = true;
  }

  const head = root.document.getElementsByTagName('head')[0];
  head.insertBefore(script, head.firstChild);
  if (script2) {
    head.insertBefore(script2, head.firstChild);
  }
};

module.exports = JsonpReceiver;
