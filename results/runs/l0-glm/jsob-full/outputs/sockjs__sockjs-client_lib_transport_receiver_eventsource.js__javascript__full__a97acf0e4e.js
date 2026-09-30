'use strict';

var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var EventSourceDriver = require('eventsource');
var debug = function() {};

if (process.env.NODE_ENV !== 'production') {
  debug = require('debug')('sockjs-client:receiver:eventsource');
}

function decodeURISafe(uri) {
  return decodeURI(uri.replace(/%(?![0-9][0-9a-fA-F]+)/g, '%25'));
}

function EventSourceReceiver(url) {
  debug(url);
  EventEmitter.call(this);

  var self = this;
  var es = this.es = new EventSourceDriver(url);

  es.onmessage = function(ev) {
    debug('message', ev.data);
    self.emit('message', decodeURISafe(ev.data));
  };

  es.onerror = function(e) {
    debug('error', es.readyState, e);
    var reason = (es.readyState === 2 ? 'network' : 'error');
    self._transportClose();
    self.emit('close', reason);
  };
}

inherits(EventSourceReceiver, EventEmitter);

EventSourceReceiver.prototype.abort = function() {
  debug('abort');
  this._transportClose();
  this.emit('close', 'user');
};

EventSourceReceiver.prototype._transportClose = function() {
  debug('_transportClose');
  var es = this.es;
  if (es) {
    es.onmessage = es.onerror = null;
    es.close();
    this.es = null;
  }
};

EventSourceReceiver.prototype._transportTimeout = function(delay) {
  debug('_transportTimeout', delay);
  var self = this;
  setTimeout(function() {
    self.emit('close', 'timeout', delay);
    self.removeAllListeners();
  }, delay);
};

module.exports = EventSourceReceiver;
