'use strict';

var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var EventSourceDriver = require('eventsource');

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

  var receiver = this;
  this.es = new EventSourceDriver(url);
  this.es.onmessage = function (event) {
    receiver.emit('message', decodeURISafe(event.data));
  };
  this.es.onerror = function () {
    receiver._cleanup();
    receiver._close('network');
  };
}

inherits(EventSourceReceiver, EventEmitter);

EventSourceReceiver.prototype.abort = function () {
  debug('abort');
  this._cleanup();
  this._close('user');
};

EventSourceReceiver.prototype._cleanup = function () {
  debug('cleanup');

  var eventSource = this.es;
  if (eventSource) {
    eventSource.onmessage = eventSource.onerror = null;
    eventSource.close();
    this.es = null;
  }
};

EventSourceReceiver.prototype._close = function (reason) {
  debug('close', reason);

  var receiver = this;
  setTimeout(function () {
    receiver.emit('close', null, reason);
    receiver.removeAllListeners();
  }, 200);
};

module.exports = EventSourceReceiver;
