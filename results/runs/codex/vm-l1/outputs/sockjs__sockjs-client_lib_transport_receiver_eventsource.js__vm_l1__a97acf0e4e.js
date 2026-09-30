'use strict';

var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var EventSourceDriver = require('eventsource');

var debug = function() {};
if (process.env.NODE_ENV !== 'production') {
  debug = require('debug')('sockjs-client:receiver:eventsource');
}

function decodeURISafe(value) {
  try {
    return decodeURI(value);
  } catch (error) {
    return value;
  }
}

function EventSourceReceiver(url) {
  debug(url);
  EventEmitter.call(this);

  var self = this;
  var eventSource = (this.es = new EventSourceDriver(url));

  eventSource.onmessage = function(event) {
    debug('message', event.data);
    self.emit('message', decodeURISafe(event.data));
  };

  eventSource.onerror = function(event) {
    debug('error', eventSource.readyState, event);
    self._cleanup();
    self._close('network');
  };
}

inherits(EventSourceReceiver, EventEmitter);

EventSourceReceiver.prototype.destroy = function() {
  debug('destroy');
  this._cleanup();
  this._close('user');
};

EventSourceReceiver.prototype._cleanup = function() {
  debug('cleanup');
  var eventSource = this.es;
  if (eventSource) {
    eventSource.onmessage = eventSource.onerror = null;
    eventSource.close();
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
