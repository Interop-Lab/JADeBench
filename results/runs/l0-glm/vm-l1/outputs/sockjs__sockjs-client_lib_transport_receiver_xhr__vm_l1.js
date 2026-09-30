'use strict';

var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

var debug = function() {};

if (process.env.NODE_ENV !== 'production') {
  debug = require('debug')('sockjs-client:receiver:xhr');
}

function XhrReceiver(xhr, url) {
  debug('constructor', url);
  EventEmitter.call(this);

  var self = this;
  this._chunkHandler = function(status, text) {
    debug('_chunkHandler', status);
    if (status !== 200 || !text) {
      return;
    }
    for (var i = -1; ; self._bufferPosition += i + 1) {
      var chunk = text.slice(self._bufferPosition);
      i = chunk.indexOf('\n');
      if (i === -1) {
        break;
      }
      var line = chunk.slice(0, i);
      if (line) {
        debug('message', line);
        self.emit('message', line);
      }
    }
  };

  this._bufferPosition = 0;
  this.xo = xhr(url, null, this._chunkHandler);
}

inherits(XhrReceiver, EventEmitter);

XhrReceiver.prototype._cleanup = function() {
  debug('_cleanup');
  this.removeAllListeners();
  var xo = this.xo;
  if (xo) {
    this.xo = null;
    clearTimeout(xo.timeout);
    xo.abort();
  }
};

XhrReceiver.prototype.abort = function() {
  debug('abort');
  if (this.xo) {
    this.xo.abort();
    debug('close');
    this.emit('close', null, 'user');
    this.xo = null;
  }
  this._cleanup();
};

module.exports = XhrReceiver;
