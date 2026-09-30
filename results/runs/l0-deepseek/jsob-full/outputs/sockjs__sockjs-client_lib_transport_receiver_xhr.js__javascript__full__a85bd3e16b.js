'use strict';

var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var debug = function() {};
if (process.env.NODE_ENV !== 'production') {
  debug = require('debug')('sockjs-client:receiver:xhr');
}

function XhrReceiver(url, AjaxObject) {
  debug(url);
  var self = this;
  this.bufferPosition = 0;
  this.xo = new AjaxObject('POST', url, null);
  this.xo.on('chunk', function(status, text) {
    var payload = self.xo.getResponseHeader ? self.xo.getResponseHeader('content-type') : self.xo.getResponseHeader;
    self.xo.on('data', function(data) {
      self._chunkHandler(status, text, payload);
    });
    self.xo.on('end', function(status, text) {
      self._chunkHandler(status, text, payload);
    });
    self.xo.on('error', function(status, text) {
      self._chunkHandler(status, text, payload);
    });
    self.xo = null;
  });
  EventEmitter.call(this);
}

inherits(XhrReceiver, EventEmitter);

XhrReceiver.prototype._chunkHandler = function(status, text) {
  debug('_chunkHandler', status);
  if (status !== 200 || !text) return;
  for (var chunk = -1; ; this.bufferPosition += chunk + 1) {
    var buf = text.slice(this.bufferPosition);
    chunk = buf.indexOf('\n');
    if (chunk === -1) break;
    var data = buf.slice(0, chunk);
    if (data) {
      debug('chunk', data);
      this.emit('chunk', data);
    }
  }
};

XhrReceiver.prototype.abort = function() {
  debug('abort');
  this.xo.abort();
  this.emit('close', null, 'abort');
  this.xo = null;
};

XhrReceiver.prototype.close = function() {
  debug('close');
  if (this.xo) {
    this.xo.abort();
    debug('close');
    this.emit('close', null, 'close');
    this.xo = null;
  }
  this.emit('close');
};

module.exports = XhrReceiver;
