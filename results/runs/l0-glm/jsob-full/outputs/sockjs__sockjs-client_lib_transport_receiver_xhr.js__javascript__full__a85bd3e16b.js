'use strict';

var inherits = require('inherits'),
    EventEmitter = require('events').EventEmitter,
    debug = function() {};

if (process.env.NODE_ENV !== 'production') {
  debug = require('debug')('sockjs-client:receiver:xhr');
}

function XhrReceiver(url, AjaxObject) {
  debug(url);
  EventEmitter.call(this);

  var self = this;
  this._bufferPosition = 0;
  this.xo = new AjaxObject('POST', url, null);

  this.xo.on('chunk', this._chunkHandler.bind(this));
  this.xo.once('finish', function(status, text) {
    debug('finish', status, text);
    self._abort(null);
    self.xo = null;

    var reason = status === 200 ? 'network' : 'permanent';
    self.emit('close', null, reason);
    self.removeAllListeners();
  });
}

inherits(XhrReceiver, EventEmitter);

XhrReceiver.prototype._chunkHandler = function(status, text) {
  debug('_chunkHandler', status);
  if (status !== 200 || !text) return;

  for (var idx = -1; ; this._bufferPosition += idx) {
    var buf = text.substr(this._bufferPosition);
    idx = buf.indexOf('\n');
    if (idx === -1) break;

    var line = buf.substr(0, idx);
    if (line) {
      debug('message', line);
      this.emit('message', line);
    }
  }
};

XhrReceiver.prototype._abort = function() {
  debug('_abort');
  this.removeAllListeners();
  this.xo.abort();
};

XhrReceiver.prototype.close = function() {
  debug('close');
  if (this.xo) {
    this.xo.abort();
    debug('close abort');
    this.emit('close', null, 'user');
    this.xo = null;
  }
  this._abort();
};

module.exports = XhrReceiver;
