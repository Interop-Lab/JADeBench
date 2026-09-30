'use strict';

var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

function XhrReceiver(url, AjaxObject) {
  EventEmitter.call(this);
  this.url = url;
  this.AjaxObject = AjaxObject;
  this._chunkHandler = this._chunkHandler.bind(this);
  this.xo = null;
  this._cleanup();
}

inherits(XhrReceiver, EventEmitter);

XhrReceiver.prototype._cleanup = function() {
  debug('_cleanup');
  this._chunkHandler = null;
};

XhrReceiver.prototype._chunkHandler = function(status, text) {
  debug('_chunkHandler', status);
  if (status !== 200 || !text) return;
  
  var idx = -1;
  while (true) {
    var chunk = text.slice(this._chunkHandler.idx || 0);
    idx = chunk.indexOf('\n');
    if (idx === -1) break;
    var message = chunk.slice(0, idx);
    if (message) {
      debug('message', message);
      this.emit('message', message);
    }
    this._chunkHandler.idx = (this._chunkHandler.idx || 0) + idx + 1;
  }
};

XhrReceiver.prototype.abort = function() {
  debug('abort');
  if (this.xo) {
    this.xo.abort();
    debug('close');
    this.emit('close', null, 'network');
    this.xo = null;
  }
  this._cleanup();
};

module.exports = XhrReceiver;

var debug = function() {};
if (process.env.NODE_ENV !== 'production') {
  debug = require('debug')('sockjs-client:receiver:xhr');
}
