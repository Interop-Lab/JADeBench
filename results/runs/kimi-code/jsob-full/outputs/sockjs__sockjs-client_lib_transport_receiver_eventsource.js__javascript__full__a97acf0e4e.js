'use strict';

var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var EventSource = require('eventsource');
var debug = function () {};

if (process.env.NODE_ENV !== 'production') {
  debug = require('debug')('sockjs-client:receiver:eventsource');
}

function decodeURISafe(value) {
  return decodeURI(value.replace(/%(?![0-9][0-9a-fA-F]+)/g, '%25'));
}

function EventSourceReceiver(url) {
  debug(url);
  EventEmitter.call(this);

  var self = this;
  var eventSource = this.es = new EventSource(url);

  eventSource.onmessage = function (event) {
    debug('message', event.data);
    self.emit('message', decodeURISafe(event.data));
  };

  eventSource.onerror = function (error) {
    debug('error', eventSource.readyState, error);
    var reason = eventSource.readyState !== 2 ? 'network' : 'permanent';
    self._cleanup();
    self._close(reason);
  };
}

inherits(EventSourceReceiver, EventEmitter);

EventSourceReceiver.prototype.abort = function () {
  debug('abort');
  this._cleanup();
  this._close('user');
};

EventSourceReceiver.prototype._cleanup = function () {
  debug('_cleanup');
  var eventSource = this.es;
  if (!eventSource) {
    return;
  }

  eventSource.onmessage = eventSource.onerror = null;
  eventSource.close();
  this.es = null;
};

EventSourceReceiver.prototype._close = function (reason) {
  debug('_close', reason);
  var self = this;
  setTimeout(function () {
    self.emit('close', null, reason);
    self.removeAllListeners();
  }, 200);
};

module.exports = EventSourceReceiver;
