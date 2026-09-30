'use strict';

const inherits = require('inherits');
const EventEmitter = require('events').EventEmitter;
const EventSourceDriver = require('eventsource');

let debug = function () {};
if (process.env.NODE_ENV !== 'production') {
  debug = require('debug')('sockjs-client:receiver:eventsource');
}

function decodeURISafe(value) {
  return decodeURI(value.replace(/%(?![0-9][0-9a-fA-F]+)/g, '%25'));
}

function EventSourceReceiver(url) {
  debug(url);
  EventEmitter.call(this);

  const receiver = this;
  const eventSource = new EventSourceDriver(url);
  this.es = eventSource;

  eventSource.onmessage = function (event) {
    debug('message', event.data);
    receiver.emit('message', decodeURISafe(event.data));
  };

  eventSource.onerror = function (error) {
    debug('error', eventSource.readyState, error);
    const reason = eventSource.readyState !== 2 ? 'network' : 'permanent';
    receiver._cleanup();
    receiver._close(reason);
  };
}

inherits(EventSourceReceiver, EventEmitter);

EventSourceReceiver.prototype.close = function () {
  debug('close');
  this._cleanup();
  this._close('user');
};

EventSourceReceiver.prototype._cleanup = function () {
  debug('cleanup');
  const eventSource = this.es;
  if (!eventSource) return;

  eventSource.onmessage = null;
  eventSource.onerror = null;
  eventSource.close();
  this.es = null;
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
