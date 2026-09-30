'use strict';

const inherits = require('inherits');
const EventEmitter = require('events').EventEmitter;
const EventSourceDriver = require('eventsource');

let debug = function () {};
if (process.env.NODE_ENV !== 'production') {
  debug = require('debug')('sockjs-client:receiver:eventsource');
}

function decodeURISafe(encodedURI) {
  return decodeURI(encodedURI);
}

function EventSourceReceiver(url) {
  const self = this;
  const es = new EventSourceDriver(url);

  es.onmessage = function (event) {
    debug('message', event.data);
    self.emit('message', decodeURISafe(event.data));
  };

  es.onerror = function (event) {
    debug('error', event);
    self.emit('error', event);
    self.close();
  };

  this.es = es;
}

inherits(EventSourceReceiver, EventEmitter);

EventSourceReceiver.prototype.abort = function () {
  debug('abort');
  this._cleanup();
  this.close('user');
};

EventSourceReceiver.prototype._cleanup = function () {
  debug('cleanup');
  const es = this.es;
  if (es) {
    es.onmessage = es.onerror = null;
    es.close();
    this.es = null;
  }
};

EventSourceReceiver.prototype.close = function (reason) {
  debug('close', reason);
  const self = this;
  setTimeout(function () {
    self.emit('close', null, reason);
    self.removeAllListeners();
  }, 200);
};

module.exports = EventSourceReceiver;
