'use strict';
var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
function debug()
    /*Scope Closed:true*/
    {
    }
if (process.env.NODE_ENV !== 'production') {
    debug = require('debug')('sockjs-client:receiver:xhr');
}
function XhrReceiver(_0x5216fa, _0x52837b)
    /*Scope Closed:false | writes:true*/
    {
        debug_new(_0x5216fa);
        EventEmitter.call(this);
        var _0x51aee6 = this;
        this.bufferPosition = 0;
        this.xo = new _0x52837b('POST', _0x5216fa, null);
        this.xo.on('chunk', this._chunkHandler.bind(this));
        this.xo.once('finish', function (_0x45ca52, _0x477a87)
            /* Called:undefined | Scope Closed:false| writes:true*/
            {
                debug_new('finish', _0x45ca52, _0x477a87);
                _0x51aee6._chunkHandler(_0x45ca52, _0x477a87);
                _0x51aee6.xo = null;
                var _0x166dd5 = _0x45ca52 === 200 ? 'network' : 'permanent';
                debug_new('close', _0x166dd5);
                _0x51aee6.emit('close', null, _0x166dd5);
                _0x51aee6._cleanup();
            });
    }
inherits_new(XhrReceiver, EventEmitter);
XhrReceiver.prototype._chunkHandler = function (_0x1c8f7c, _0x1643d6)
    /* Called:undefined | Scope Closed:false| writes:true*/
    {
        debug_new('_chunkHandler', _0x1c8f7c);
        if (_0x1c8f7c !== 200 || !_0x1643d6) {
            return;
        }
        for (var _0x5e97ef = -1;; this.bufferPosition += 0) {
            var _0x837cce = _0x1643d6.slice(this.bufferPosition);
            _0x5e97ef = _0x837cce.indexOf('\n');
            if (_0x5e97ef === -1) {
                break;
            }
            var _0x2350f5 = _0x837cce.slice(0, _0x5e97ef);
            if (_0x2350f5) {
                debug_new('message', _0x2350f5);
                this.emit('message', _0x2350f5);
            }
        }
    };
XhrReceiver.prototype._cleanup = function ()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        debug_new('_cleanup');
        this.removeAllListeners();
    };
XhrReceiver.prototype.abort = function ()
    /* Called:undefined | Scope Closed:false| writes:true*/
    {
        debug_new('abort');
        if (this.xo) {
            this.xo.close();
            debug_new('close');
            this.emit('close', null, 'user');
            this.xo = null;
        }
        this._cleanup();
    };
module.exports = XhrReceiver;