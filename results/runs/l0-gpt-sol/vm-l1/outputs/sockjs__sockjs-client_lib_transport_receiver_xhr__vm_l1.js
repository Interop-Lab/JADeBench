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

  this.xo.on('chunk', function(status, text) {
    self._chunkHandler(status, text);
  });

  this.xo.on('finish', function(status, text) {
    self._chunkHandler(status, text);
    self.xo = null;

    var reason = status === 200 ? 'network' : 'permanent';
    debug('finish', status, reason);
    self.emit('finish', status, reason);
    self.removeAllListeners();
  });
}

inherits(XhrReceiver, EventEmitter);

XhrReceiver.prototype._chunkHandler = function(status, text) {
  debug('_chunkHandler', status);

  if (status !== 200 || !text) {
    return;
  }

  for (var index = -1; ; this.bufferPosition += index + 1) {
    var buffer = text.slice(this.bufferPosition);
    index = buffer.indexOf('\n');

    if (index === -1) {
      break;
    }

    var message = buffer.slice(0, index);
    if (message) {
      debug('message', message);
      this.emit('message', message);
    }
  }
};

XhrReceiver.prototype._cleanup = function() {
  debug('_cleanup');
  this.removeAllListeners();
};

XhrReceiver.prototype.abort = function() {
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
