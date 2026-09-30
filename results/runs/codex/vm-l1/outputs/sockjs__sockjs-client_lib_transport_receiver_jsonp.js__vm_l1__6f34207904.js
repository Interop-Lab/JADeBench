'use strict';

var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

var root = typeof globalThis !== 'undefined' ? globalThis : global;
var callbackPrefix = '_jp';
root[callbackPrefix] = root[callbackPrefix] || {};

var debug = function() {};
if (process.env.NODE_ENV !== 'production') {
  debug = require('debug')('sockjs-client:receiver:jsonp');
}

function randomString(length) {
  var alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var value = '';
  for (var index = 0; index < length; index++) {
    value += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return value;
}

function addQuery(url, query) {
  return url + (url.indexOf('?') === -1 ? '?' : '&') + query;
}

function isOpera() {
  return typeof navigator !== 'undefined' && /opera/i.test(navigator.userAgent);
}

function JsonpReceiver(url) {
  debug(url);
  EventEmitter.call(this);

  this.id = 'a' + randomString(6);
  root[callbackPrefix][this.id] = this._callback.bind(this);
  this._createScript(addQuery(url, 'c=' + callbackPrefix + '.' + this.id));

  var receiver = this;
  this.timeoutId = setTimeout(function() {
    receiver._abort(new Error('JSONP script loaded abnormally (timeout)'));
  }, JsonpReceiver.timeout);
}

inherits(JsonpReceiver, EventEmitter);

JsonpReceiver.prototype.abort = function() {
  debug('abort');
  if (root[callbackPrefix][this.id]) {
    var error = new Error('JSONP user aborted read');
    error.code = 1000;
    this._abort(error);
  }
};

JsonpReceiver.timeout = 35000;
JsonpReceiver.scriptErrorTimeout = 1000;

JsonpReceiver.prototype._callback = function(message) {
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

JsonpReceiver.prototype._abort = function(error) {
  debug('_abort', error);
  this._cleanup();
  this.aborting = true;
  this.emit('close', error.code, error.message);
  this.removeAllListeners();
};

JsonpReceiver.prototype._cleanup = function() {
  debug('_cleanup');
  clearTimeout(this.timeoutId);

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

  delete root[callbackPrefix][this.id];
};

JsonpReceiver.prototype._scriptError = function() {
  debug('_scriptError');
  var receiver = this;
  if (this.errorTimer) return;

  this.errorTimer = setTimeout(function() {
    if (!receiver.loadedOkay) {
      receiver._abort(new Error('JSONP script loaded abnormally (onerror)'));
    }
  }, JsonpReceiver.scriptErrorTimeout);
};

JsonpReceiver.prototype._createScript = function(url) {
  debug('_createScript', url);
  var receiver = this;
  var script = this.script = root.document.createElement('script');
  var script2;

  script.id = 'a' + randomString(8);
  script.src = url;
  script.type = 'text/javascript';
  script.charset = 'UTF-8';
  script.onerror = this._scriptError.bind(this);
  script.onload = function() {
    debug('onload');
    receiver._abort(new Error('JSONP script loaded abnormally (onload)'));
  };
  script.onreadystatechange = function() {
    debug('onreadystatechange', script.readyState);
    if (/loaded|closed/.test(script.readyState)) {
      if (script && script.htmlFor && script.onclick) {
        receiver.loadedOkay = true;
        try {
          script.onclick();
        } catch (error) {}
      }
      if (script) {
        receiver._abort(new Error('JSONP script loaded abnormally (onreadystatechange)'));
      }
    }
  };

  if (typeof script.async === 'undefined' && root.document.attachEvent) {
    if (!isOpera()) {
      try {
        script.htmlFor = script.id;
        script.event = 'onclick';
      } catch (error) {}
      script.async = true;
    } else {
      script2 = this.script2 = root.document.createElement('script');
      script2.text = "try{var a = document.getElementById('" + script.id + "'); if(a)a.onerror();}catch(x){};";
      script.async = script2.async = false;
    }
  }

  if (typeof script.async !== 'undefined') {
    script.async = true;
  }

  var head = root.document.getElementsByTagName('head')[0];
  head.insertBefore(script, head.firstChild);
  if (script2) {
    head.insertBefore(script2, head.firstChild);
  }
};

module.exports = JsonpReceiver;
