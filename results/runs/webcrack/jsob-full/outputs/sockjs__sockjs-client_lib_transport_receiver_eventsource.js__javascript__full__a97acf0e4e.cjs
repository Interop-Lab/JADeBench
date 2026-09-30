'use strict';

var inherits = require("inherits");
var EventEmitter = require("events").EventEmitter;
var EventSourceDriver = require("eventsource");
function debug() {}
if (process.env.NODE_ENV !== "production") {
  debug = require("debug")("sockjs-client:receiver:eventsource");
}
function decodeURISafe(_0x3fdca1) {
  return decodeURI(_0x3fdca1.replace(/%(?![0-9][0-9a-fA-F]+)/g, "%25"));
}
function EventSourceReceiver(_0x4eff66) {
  debug(_0x4eff66);
  EventEmitter.call(this);
  var _0x18a2c5 = this;
  var _0x10bdca = this.es = new EventSourceDriver(_0x4eff66);
  _0x10bdca.onmessage = function (_0x449ea2) {
    debug("message", _0x449ea2.data);
    _0x18a2c5.emit("message", decodeURISafe(_0x449ea2.data));
  };
  _0x10bdca.onerror = function (_0xdf9033) {
    debug("error", _0x10bdca.readyState, _0xdf9033);
    var _0x51b391 = _0x10bdca.readyState !== 2 ? "network" : "permanent";
    _0x18a2c5._cleanup();
    _0x18a2c5._close(_0x51b391);
  };
}
inherits(EventSourceReceiver, EventEmitter);
EventSourceReceiver.prototype.abort = function () {
  debug("abort");
  this._cleanup();
  this._close("user");
};
EventSourceReceiver.prototype._cleanup = function () {
  debug("cleanup");
  var _0x30efa1 = this.es;
  if (_0x30efa1) {
    _0x30efa1.onmessage = _0x30efa1.onerror = null;
    _0x30efa1.close();
    this.es = null;
  }
};
EventSourceReceiver.prototype._close = function (_0x1c3b68) {
  debug("close", _0x1c3b68);
  var _0x589152 = this;
  setTimeout(function () {
    _0x589152.emit("close", null, _0x1c3b68);
    _0x589152.removeAllListeners();
  }, 200);
};
module.exports = EventSourceReceiver;