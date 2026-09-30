'use strict';

const inherits = require('inherits');
const { EventEmitter } = require('events');
const EventSource = require('eventsource');

let debug = function () {};
if (process.env.NODE_ENV !== 'production') {
  debug = require('debug')('sockjs-client:receiver:eventsource');
}

function decodeURISafe(value) {
  try {
    return decodeURI(value);
  } catch (_error) {
    return value;
  }
}

function EventSourceReceiver(url) {
  EventEmitter.call(this);
  debug(url);

  const receiver = this;
  this.es = new EventSource(url);
  this.es.onmessage = function (event) {
    debug('message', event.data);
    receiver.emit('message', decodeURISafe(event.data));
  };
  this.es.onerror = function (error) {
    debug('error', null, error);
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

  const eventSource = this.es;
  if (eventSource) {
    eventSource.onmessage = null;
    eventSource.onerror = null;
    eventSource.close();
    this.es = null;
  }
};

EventSourceReceiver.prototype._close = function (reason) {
  debug('close', reason);

  const receiver = this;
  setTimeout(function () {
    receiver.emit('close', null, reason);
    receiver.removeAllListeners();
  }, 200);
};

module.exports = EventSourceReceiver;
