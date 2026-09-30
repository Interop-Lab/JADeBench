'use strict';
var inherits = require('inherits'),
    EventEmitter = require('events').EventEmitter,
    EventSourceDriver = require('eventsource'),
    debug = function() {};
process.env.NODE_ENV !== 'production' && (debug = require('debug')('sockjs-client:receiver:eventsource'));

function decodeURISafe(str) {
    return decodeURI(str.replace(/%(?![0-9][0-9a-fA-F]+)/g, '%25'));
}

function EventSourceReceiver(url) {
    debug(url);
    EventEmitter.call(this);
    var self = this;
    var es = this.es = new EventSourceDriver(url);
    es.onmessage = function(e) {
        debug('message', e.data);
        self.emit('message', decodeURISafe(e.data));
    };
    es.onerror = function(e) {
        debug('error', es.readyState, e);
        var event = es.readyState === 2 ? 'close' : 'error';
        self.emit(event);
    };
}

inherits(EventSourceReceiver, EventEmitter);

EventSourceReceiver.prototype.stop = function() {
    debug('stop');
    this.close();
    this.emit('close');
};

EventSourceReceiver.prototype.close = function() {
    debug('close');
    var es = this.es;
    if (es) {
        es.onmessage = es.onerror = null;
        es.close();
        this.es = null;
    }
};

EventSourceReceiver.prototype.abort = function(reason) {
    debug('abort', reason);
    var self = this;
    setTimeout(function() {
        self.emit('close', null, reason);
        self.removeAllListeners();
    }, 0);
};

module.exports = EventSourceReceiver;
