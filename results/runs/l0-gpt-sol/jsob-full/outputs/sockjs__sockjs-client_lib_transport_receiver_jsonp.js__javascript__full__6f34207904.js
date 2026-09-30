'use strict';

var utils = require('./utils/iframe');
var random = require('./utils/random');
var browser = require('./utils/browser');
var urlUtils = require('./utils/url');
var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

var debug = function () {};
if (process.env.NODE_ENV !== 'production') {
  debug = require('debug')('sockjs-client:jsonp-receiver');
}

function JsonpReceiver(url) {
  debug('constructor', url);

  EventEmitter.call(this);
  utils.polluteGlobalNamespace();

  this.id = 'a' + random.string(32);

  var callback = utils.WPrefix + '.' + this.id;
  var scriptUrl = urlUtils.addQuery(
    url,
    'c=' + encodeURIComponent(callback)
  );

  global[utils.WPrefix][this.id] = this._callback.bind(this);

  this._script = utils.createScript(scriptUrl);
  this._timeout = setTimeout(function () {
    if (this._script) {
      this._cleanup();
      this._close(new Error('JSONP script failed to load'));
    }
  }.bind(this), JsonpReceiver.timeout);
}

inherits(JsonpReceiver, EventEmitter);

JsonpReceiver.prototype._callback = function (data) {
  debug('callback', data);

  this._cleanup();

  if (this._script) {
    try {
      this._script.parentNode.removeChild(this._script);
    } catch (error) {
      // The script may already have been removed.
    }
    this._script = null;
  }

  if (data) {
    this.emit('message', data);
  }
};

JsonpReceiver.prototype._cleanup = function () {
  clearTimeout(this._timeout);
  this._timeout = null;

  if (global[utils.WPrefix]) {
    delete global[utils.WPrefix][this.id];
  }
};

JsonpReceiver.prototype._close = function (error) {
  debug('close', error);

  this._cleanup();

  if (this._script) {
    try {
      this._script.parentNode.removeChild(this._script);
    } catch (exception) {
      // The script may already have been removed.
    }
    this._script = null;
  }

  this.emit('close', error);
};

JsonpReceiver.prototype.close = function () {
  this._close();
};

JsonpReceiver.timeout = 35000;

module.exports = JsonpReceiver;
