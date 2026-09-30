'use strict';

const inherits = require('inherits');
const EventEmitter = require('events').EventEmitter;

let debug = function () {};
if (process.env.NODE_ENV !== 'production') {
  debug = require('debug')('sockjs-client:receiver:xhr');
}

function XhrReceiver(url, AjaxObject) {
  debug(url);
  EventEmitter.call(this);

  const receiver = this;
  this.bufferPosition = 0;
  this.xo = new AjaxObject('POST', url, null);

  this.xo.on('chunk', this._chunkHandler.bind(this));
  this.xo.once('finish', function (status, text) {
    debug('finish', status, text);
    receiver._chunkHandler(status, text);
    receiver.xo = null;

    const reason = status === 200 ? 'network' : 'permanent';
    debug('close', reason);
    receiver.emit('close', null, reason);
    receiver._cleanup();
  });
}

inherits(XhrReceiver, EventEmitter);

XhrReceiver.prototype._chunkHandler = function (status, text) {
  debug('_chunkHandler', status);
  if (status !== 200 || !text) {
    return;
  }

  for (let newlineIndex = -1; ; this.bufferPosition += newlineIndex + 1) {
    const unreadText = text.slice(this.bufferPosition);
    newlineIndex = unreadText.indexOf('\n');
    if (newlineIndex === -1) {
      break;
    }

    const message = unreadText.slice(0, newlineIndex);
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
    this.emit('close', null, 'network');
    this.xo = null;
  }
  this._cleanup();
};

module.exports = XhrReceiver;
