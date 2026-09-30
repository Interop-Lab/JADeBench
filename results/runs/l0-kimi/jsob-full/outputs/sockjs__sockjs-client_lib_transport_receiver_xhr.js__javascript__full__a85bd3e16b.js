'use strict';
var inherits = require('inherits'), EventEmitter = require('events').EventEmitter, debug = function() {};
process.env.NODE_ENV !== 'production' && (debug = require('debug')('sockjs-client:receiver:xhr'));

function XhrReceiver(url, AjaxObject) {
  debug(url);
  EventEmitter.call(this);
  this.bufferPosition = 0;
  this.xo = new AjaxObject('POST', url, null);
  var self = this;
  var handlers = {
    finish: function(status, text) {
      var reason = status === 200 ? 'network' : 'permanent';
      debug('finish', status, text);
      self._cleanup();
      self.xo = null;
      self.emit('close', null, reason);
    },
    chunk: function(status, text) {
      debug('chunk', status);
      var idx = text.indexOf('\n');
      while (idx !== -1) {
        var line = text.substring(0, idx);
        if (line) {
          debug('message', line);
          self.emit('message', line);
        }
        text = text.substring(idx + 1);
        idx = text.indexOf('\n');
      }
      self.bufferPosition += text.length;
    }
  };
  this.xo.on('chunk', handlers.chunk.bind(this));
  this.xo.on('finish', handlers.finish.bind(this));
}

inherits(XhrReceiver, EventEmitter);

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
