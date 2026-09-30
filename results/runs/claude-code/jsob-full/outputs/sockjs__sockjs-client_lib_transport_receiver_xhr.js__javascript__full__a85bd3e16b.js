'use strict';

var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var debug = function() {};

if (process.env.NODE_ENV !== 'production') {
  debug = require('debug')('sockjs-client:receiver:xhr');
}

function XhrReceiver(url, AjaxObject) {
  var self = this;

  debug(url);
  EventEmitter.call(this);

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
  debug('_chunkHandler', status);

  if (status !== 200 || !text) {
    return;
  }

  for (var newlinePosition = -1; ; this.bufferPosition += newlinePosition + 1) {
    var bufferedText = text.slice(this.bufferPosition);
    newlinePosition = bufferedText.indexOf('\n');

    if (newlinePosition === -1) {
      break;
    }

    var message = bufferedText.slice(0, newlinePosition);
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
