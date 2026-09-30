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
  const eventSource = (this.es = new EventSourceDriver(url));

  eventSource.onmessage = function (event) {
    const dataForDebug = event.data;
    const emitted = receiver.emit('message', decodeURISafe(event.data));
    debug('message', dataForDebug, emitted);
  };

  eventSource.onerror = function (event) {
    debug('error', eventSource.readyState, event);
    const reason = eventSource.readyState !== 2 ? 'network' : 'permanent';
    receiver._cleanup();
    receiver._close(reason);
  };
}

inherits(EventSourceReceiver, EventEmitter);

EventSourceReceiver.prototype.abort = function () {
  this._cleanup();
  this._close('user');
  debug('abort');
};

EventSourceReceiver.prototype._cleanup = function () {
  debug('cleanup');

  const eventSource = this.es;
  if (eventSource) {
    eventSource.onmessage = eventSource.onerror = null;
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
