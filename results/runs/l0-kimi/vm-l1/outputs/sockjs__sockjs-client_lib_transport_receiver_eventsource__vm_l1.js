'use strict';

const inherits = require('inherits');
const EventEmitter = require('events').EventEmitter;
const EventSourceDriver = require('eventsource');

function debug() {}
if (process.env.NODE_ENV !== 'production') {
  globalThis.debug = require('debug')('sockjs-client:receiver:eventsource');
}

function decodeURISafe(uri) {
  'use strict';
  try {
    return decodeURI(uri);
  } catch (e) {
    return uri;
  }
}

globalThis.decodeURISafe = decodeURISafe;

function EventSourceReceiver(url) {
  'use strict';
  debug('constructor');
  EventEmitter.call(this);
  this.url = url;
  this.es = null;
}

inherits(EventSourceReceiver, EventEmitter);

EventSourceReceiver.prototype.abort = function() {
  debug('abort');
  this._cleanup();
  this.emit('close', null, 'user');
};

EventSourceReceiver.prototype._cleanup = function() {
  debug('cleanup');
  const es = this.es;
  if (es) {
    es.onmessage = es.onerror = null;
    es.close();
    this.es = null;
  }
};

EventSourceReceiver.prototype.close = function(reason) {
  debug('close', reason);
  const self = this;
  setTimeout(function() {
    self.emit('close', null, reason);
    self._cleanup();
  }, 200);
};

module.exports = EventSourceReceiver;

globalThis.EventSourceReceiver = EventSourceReceiver;
globalThis.EventSourceDriver = EventSourceDriver;
globalThis.EventEmitter = EventEmitter;
globalThis.inherits = inherits;
globalThis.debug = debug;
