'use strict';

const EventEmitter = require('events').EventEmitter;
const inherits = require('inherits');

function XhrReceiver(url, AjaxObject) {
  const that = this;
  debug('XhrReceiver', url);

  this.xo = new AjaxObject('POST', url, null);
  this.xo.on('chunk', this._chunkHandler.bind(this));
  this.xo.once('finish', function (status, text) {
    debug('finish', status, text);
    that.xo = null;
    const reason = status === 200 ? null : status;
    that.emit('close', reason, text);
  });
}

inherits(XhrReceiver, EventEmitter);

XhrReceiver.prototype._chunkHandler = function (status, chunk) {
  debug('_chunkHandler', status);
  if (status !== 200 || !chunk) return;
  for (let pos = -1; ; this.bufferPosition += pos + 1) {
    const buffer = chunk.slice(this.bufferPosition);
    pos = buffer.indexOf('\n');
    if (pos === -1) break;
    const msg = buffer.slice(0, pos);
    if (msg) {
      debug('message', msg);
      this.emit('message', msg);
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
