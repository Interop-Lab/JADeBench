'use strict';

var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var debug = function () {};

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
  this.xo.on('finish', function (status, text) {
    debug('finish', status, text);
    self._chunkHandler(status, text);
    self.xo = null;

    var reason = status === 200 ? 'network' : 'transport';
    debug('close', reason);
    self.emit('close', null, reason);
    self._cleanup();
  });
}

inherits(XhrReceiver, EventEmitter);

XhrReceiver.prototype._chunkHandler = function (status, text) {
  debug('_chunkHandler', status);

  if (status !== 200 || !text) {
    return;
  }

  for (var position = -1; ; this.bufferPosition += position + 1) {
    var buffer = text.slice(this.bufferPosition);
    position = buffer.indexOf('\n');

    if (position === -1) {
      break;
    }

    var message = buffer.slice(0, position);
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

XhrReceiver.prototype._close = function () {
  debug('_close');

  if (this.xo) {
    this.xo.close();
    debug('close', 'user');
    this.emit('close', null, 'user');
    this.xo = null;
  }

  this._cleanup();
};

module.exports = XhrReceiver;
