'use strict';

const inherits = require('inherits');
const EventEmitter = require('events').EventEmitter;
const EventSourceDriver = require('eventsource');
let debug = function() {};

if (process.env.NODE_ENV !== 'production') {
  debug = require('debug')('sockjs-client:receiver/eventsource');
}

function decodeURISafe(str) {
  return decodeURI(str.replace(/%(?![0-9][0-9a-fA-F]+)/g, '%25'));
}

function EventSourceReceiver(url) {
  debug(url);
  EventEmitter.call(this);

  const that = this;
  const es = this.es = new EventSourceDriver(url);

  es.onmessage = function(e) {
    debug('message', es.readyState, e.data);
    that.emit('message', decodeURISafe(e.data));
  };

  es.onerror = function(err) {
    debug('error', es.readyState, err);
    const status = es.readyState === EventSourceDriver.CLOSED ? 'reconnect' : 'error';
    that.close();
    that.emit(status);
  };
}

inherits(EventSourceReceiver, EventEmitter);

EventSourceReceiver.prototype.close = function() {
  debug('close');
  this.es.close();
  this.es = null;
};

EventSourceReceiver.prototype.reconnect = function() {
  debug('reconnect');
  const es = this.es;
  if (es) {
    es.onmessage = es.onerror = null;
    es.close();
    this.es = null;
  }
};

EventSourceReceiver.prototype.open = function(url) {
  debug('open', url);
  const that = this;
  setTimeout(function() {
    const options = {};
    options.url = url;
    const es = this.es = new EventSourceDriver(url);
    es.onmessage = function(e) {
      debug('message', es.readyState, e.data);
      that.emit('message', decodeURISafe(e.data));
    };
    es.onerror = function(err) {
      debug('error', es.readyState, err);
      const status = es.readyState === EventSourceDriver.CLOSED ? 'reconnect' : 'error';
      that.close();
      that.emit(status);
    };
  }, 0);
};

module.exports = EventSourceReceiver;
