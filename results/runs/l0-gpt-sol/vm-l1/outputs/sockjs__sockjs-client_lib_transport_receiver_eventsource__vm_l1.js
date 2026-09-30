'use strict';

var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var EventSourceDriver = require('eventsource');

var debug = function() {};

if (process.env.NODE_ENV !== 'production') {
  debug = require('debug')('sockjs-client:receiver:eventsource');
}

function decodeURISafe(text) {
  try {
    return decodeURI(text);
  } catch (error) {
    return text;
  }
}

function EventSourceReceiver(url) {
  debug(url);

  var self = this;
  EventEmitter.call(this);

  var es = this.es = new EventSourceDriver(url);

  es.onmessage = function(event) {
    debug('message', event.data);
    self.emit('message', decodeURISafe(event.data));
  };

  es.onerror = function(error) {
    debug('error', error);
    self._cleanup();
    self._close('network');
  };
}

inherits(EventSourceReceiver, EventEmitter);

EventSourceReceiver.prototype.abort = function() {
  debug('abort');
  this._cleanup();
  this._close('user');
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

EventSourceReceiver.prototype._close = function(reason) {
  debug('close', reason);

  var self = this;
  setTimeout(function() {
    self.emit('close', null, reason);
    self.removeAllListeners();
  }, 200);
};

module.exports = EventSourceReceiver;
