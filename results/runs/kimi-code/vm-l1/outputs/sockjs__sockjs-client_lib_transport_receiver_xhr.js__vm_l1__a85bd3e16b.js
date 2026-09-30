'use strict';

var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('sockjs-client:receiver:xhr');

function XhrReceiver(xhrObject) {
  debug('new', xhrObject);
  EventEmitter.call(this);
  this.bufferPosition = 0;
  this.xo = xhrObject;
  xhrObject.on('chunk', this._chunkHandler.bind(this));
  xhrObject.once('finish', this._cleanup.bind(this));
  xhrObject.once('close', this._cleanup.bind(this));
}

inherits(XhrReceiver, EventEmitter);

XhrReceiver.prototype._chunkHandler = function (status, text) {
  debug('_chunkHandler', status);
  if (status !== 200 || !text) {
    return;
  }

  for (var newlineIndex = -1; ; this.bufferPosition += newlineIndex + 1) {
    var remainingText = text.slice(this.bufferPosition);
    newlineIndex = remainingText.indexOf('\n');
    if (newlineIndex === -1) {
      break;
    }

    var message = remainingText.slice(0, newlineIndex);
    if (message) {
      debug('message', message);
      this.emit('message', message);
    }
  }
};

XhrReceiver.prototype._cleanup = function () {
  debug('_cleanup');
  this.removeAllListeners();
};

XhrReceiver.prototype.abort = function () {
  debug('abort');
  if (this.xo) {
    this.xo.close();
    debug('close');
    this.emit('close', null, 'user');
    this.xo = null;
  }
  this._cleanup();
};

module.exports = XhrReceiver;
