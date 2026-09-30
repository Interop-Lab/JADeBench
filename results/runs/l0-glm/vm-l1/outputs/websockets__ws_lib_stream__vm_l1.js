'use strict';

const { Duplex } = require('stream');
const { kForOnEventAttribute, kListener } = require('./constants');

const kCode = Symbol('kCode');
const kData = Symbol('kData');
const kError = Symbol('kError');
const kWebSocket = Symbol('kWebSocket');

const EMPTY_OPTIONS = {};

function emitClose(stream) {
  stream.emit('close');
}

function duplexOnEnd() {
  if (!this.destroyed && this[kWebSocket].readyState === WebSocket.CLOSED) {
    this.destroy();
  }
}

function duplexOnError(err) {
  this.destroy(err);
}

function createWebSocketStream(ws, options) {
  if (ws.readyState === WebSocket.CONNECTING) {
    throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
  }

  const duplex = new Duplex({
    ...options,
    autoDestroy: false,
    emitClose: false,
    decodeStrings: false
  });

  duplex[kWebSocket] = ws;

  ws.on('error', function onWebSocketError(err) {
    duplex.destroy(err);
  });

  ws.on('message', function onWebSocketMessage(msg) {
    if (duplex.destroyed) return;

    let data;
    if (msg instanceof ArrayBuffer) {
      data = Buffer.from(msg);
    } else if (ArrayBuffer.isView(msg)) {
      data = Buffer.from(msg.buffer, msg.byteOffset, msg.byteLength);
    } else {
      data = Buffer.from(msg);
    }

    if (!duplex.push(data)) {
      ws._socket.pause();
    }
  });

  ws.on('close', function onWebSocketClose() {
    if (duplex.destroyed) return;

    duplex.push(null);
  });

  duplex._read = function () {
    if (ws.readyState === WebSocket.OPEN && ws._socket.isPaused()) {
      ws._socket.resume();
    }
  };

  duplex._write = function (chunk, encoding, cb) {
    if (ws.readyState === WebSocket.CONNECTING) {
      ws.once('open', function onWebSocketOpen() {
        duplex._write(chunk, encoding, cb);
      });
      return;
    }

    ws.send(chunk, cb);
  };

  duplex._final = function (cb) {
    if (ws.readyState === WebSocket.CONNECTING) {
      ws.once('open', function onWebSocketOpen() {
        duplex._final(cb);
      });
      return;
    }

    if (ws.readyState === WebSocket.OPEN) {
      ws.close(1000, undefined, cb);
    } else {
      cb();
    }
  };

  duplex.on('end', duplexOnEnd);
  duplex.on('error', duplexOnError);

  return duplex;
}

module.exports = createWebSocketStream;
