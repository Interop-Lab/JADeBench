'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var random = require('../utils/random');
var browser = require('../utils/browser');
var urlUtils = require('../utils/url');
var utils = require('../utils/utils');
var debug = require('debug')('sockjs-client:receiver:jsonp');

function JsonpReceiver(url) {
  EventEmitter.call(this);

  this.url = url;
  this.id = 'a' + random.string(8);
  this.timeoutId = null;
  this.script = null;
  this.script2 = null;
  this.errorTimer = null;
  this.aborting = false;

  global[utils.WPrefix][this.id] = this._callback.bind(this);
}

inherits(JsonpReceiver, EventEmitter);

JsonpReceiver.prototype.abort = function() {
  debug('abort');

  if (global[utils.WPrefix][this.id]) {
    var error = new Error('JSONP user aborted read');
    error.code = 1000;
    this._abort(error);
  }
};

JsonpReceiver.timeout = 0x88b8;
JsonpReceiver.scriptErrorTimeout = 1000;

JsonpReceiver.prototype._callback = function(data) {
  debug('callback', data);
  this._cleanup();

  if (this.aborting) {
    return;
  }

  if (data) {
    debug('message', data);
    this.emit('message', data);
  }

  this._abort(null);
  this._start();
};

JsonpReceiver.prototype._abort = function(error) {
  debug('abort', error);
  this._cleanup();
  this.aborting = true;
  this.emit('close', error.code, error.message);
  this._start();
};

JsonpReceiver.prototype._cleanup = function() {
  debug('cleanup');
  clearTimeout(this.timeoutId);

  if (this.script2) {
    this.script2.parentNode.removeChild(this.script2);
    this.script2 = null;
  }

  if (this.script) {
    var script = this.script;
    script.parentNode.removeChild(script);
    script.onload = script.onerror = script.onreadystatechange = null;
    this.script = null;
  }

  delete global[utils.WPrefix][this.id];
};

JsonpReceiver.prototype._scriptError = function() {
  debug('_scriptError');

  var receiver = this;
  if (this.errorTimer) {
    return;
  }

  this.errorTimer = setTimeout(function() {
    if (!receiver.loadedOkay) {
      receiver._abort(new Error('JSONP script loaded abnormally (onerror)'));
    }
  }, JsonpReceiver.scriptErrorTimeout);
};

JsonpReceiver.prototype.doSend = function(url) {
  debug('doSend', url);

  var receiver = this;
  var script = this.script = global.document.createElement('script');
  var script2;

  script.id = 'a' + random.string(8);
  script.src = url;
  script.type = 'text/javascript';
  script.charset = 'UTF-8';
  script.onerror = function() {
    debug('onerror');
    receiver._abort(new Error('JSONP script loaded abnormally (onerror)'));
  };

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

      if (script && !receiver.loadedOkay) {
        receiver._abort(new Error(
          'JSONP script loaded abnormally (onreadystatechange)'
        ));
      }
    }
  };

  if (typeof script.attachEvent === 'function' &&
      global.document.attachEvent) {
    if (!browser.isOpera()) {
      try {
        script.htmlFor = script.id;
        script.event = 'onclick';
      } catch (error) {}

      script.attachEvent('onclick', true);
    } else {
      script2 = this.script2 = global.document.createElement('script');
      script2.text = 'try{var a = document.getElementById(\'' +
        script.id +
        '\'); a.onload();}catch(x){};';
      script.attachEvent('onclick', true);
      script2.attachEvent('onclick', true);
    }
  }

  if (typeof script.attachEvent !== 'function') {
    script.async = true;
  }

  var head = global.document.getElementsByTagName('head')[0];
  head.insertBefore(script, head.firstChild);

  if (script2) {
    head.insertBefore(script2, head.firstChild);
  }
};

module.exports = JsonpReceiver;
