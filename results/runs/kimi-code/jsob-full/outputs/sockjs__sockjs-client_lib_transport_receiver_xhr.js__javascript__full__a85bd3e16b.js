'use strict';

var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var debug = function() {};

if (process.env.NODE_ENV !== 'production') {
  debug = require('debug')('sockjs-client:receiver:xhr');
}

function XhrReceiver(url, AjaxObject) {
  debug(url);
  EventEmitter.call(this);

  var self = this;
  this.bufferPosition = 0;
  this.xo = new AjaxObject('POST', url, null);
  this.xo.on('chunk', this._chunkHandler.bind(this));
  this.xo.once('finish', function(status, text) {
    debug('finish', status, text);
    self._chunkHandler(status, text);
    self.xo = null;

    var reason = status === 200 ? 'network' : 'permanent';
    debug('close', reason);
    self.emit('close', null, reason);
    self._cleanup();
  });
}

inherits(XhrReceiver, EventEmitter);

XhrReceiver.prototype._chunkHandler = function(status, text) {
  debug('chunk', status);
  if (status !== 200 || !text) {
    return;
  }

  while (true) {
    var buffer = text.slice(this.bufferPosition);
    var newlinePosition = buffer.indexOf('\n');
    if (newlinePosition === -1) {
      break;
    }

    var message = buffer.slice(0, newlinePosition);
    if (message) {
      debug('message', message);
      this.emit('message', message);
    }
    this.bufferPosition += newlinePosition + 1;
  }
};

XhrReceiver.prototype._cleanup = function() {
  debug('_cleanup');
  this.removeAllListeners();
};

XhrReceiver.prototype.close = function() {
  debug('close');
  if (this.xo) {
    this.xo.abort();
    debug('close', 'user');
    this.emit('close', null, 'user');
    this.xo = null;
  }
  this._cleanup();
};

module.exports = XhrReceiver;
