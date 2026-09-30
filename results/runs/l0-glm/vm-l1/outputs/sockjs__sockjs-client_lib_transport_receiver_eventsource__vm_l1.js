'use strict';

var inherits = require('inherits')
  , EventEmitter = require('events').EventEmitter
  , EventSourceDriver = require('eventsource')
  ;

var debug = function() {};
if (process.env.NODE_ENV !== 'production') {
  debug = require('debug')('sockjs-client:receiver:eventsource');
}

function decodeURISafe(uri) {
  try {
    return decodeURI(uri);
  } catch (e) {
    return uri;
  }
}

function EventSourceReceiver(url) {
  debug('EventSourceReceiver', url);
  EventEmitter.call(this);

  var self = this;
  var es = this.es = new EventSourceDriver(decodeURISafe(url));
  es.onmessage = function(e) {
    debug('message', e.data);
    self.emit('message', e.data);
  };
  es.onerror = function(e) {
    debug('error', e);
    var reason = (e && e.reason) || 'EventSource error';
    self.emit('error', new Error(reason));
    self._cleanup();
  };
}

inherits(EventSourceReceiver, EventEmitter);

EventSourceReceiver.prototype.abort = function() {
  debug('abort');
  this._cleanup();
  this.emit('close', 'user');
};

EventSourceReceiver.prototype._cleanup = function() {
  debug('cleanup');
  var es = this.es;
  if (es) {
    es.onmessage = es.onerror = null;
    es.close();
    this.es = null;
  }
};

EventSourceReceiver.prototype.emit = function(type) {
  debug('emit', type);
  var self = this;
  setTimeout(function() {
    EventEmitter.prototype.emit.call(self, type);
    self._cleanup();
  }, 200);
};

module.exports = EventSourceReceiver;
