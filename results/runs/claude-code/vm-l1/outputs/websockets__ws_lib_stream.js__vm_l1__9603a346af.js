'use strict';

const { Duplex } = require('stream');

const CONNECTING = 0;
const CLOSED = 3;
const kWebSocket = Symbol('websocket');
const NOOP = () => {};

function emitClose(stream) {
  stream.emit('close');
}

function duplexOnEnd() {
  const websocket = this[kWebSocket];

  if (websocket.readyState === CONNECTING) {
    websocket.once('open', () => websocket.close());
    return;
  }

  websocket.close();
}

function duplexOnError() {
  const websocket = this[kWebSocket];

  if (websocket.readyState === CLOSED) {
    this.emit('close');
    return;
  }

  websocket.close();
  this.once('error', NOOP);
}

function createWebSocketStream(websocket, options) {
  let terminateOnDestroy = true;

  const stream = new Duplex({
    ...options,
    autoDestroy: false,
    emitClose: false,
    objectMode: false,
    writableObjectMode: false
  });

  websocket.on('message', (message, isBinary) => {
    const data = !isBinary && stream._readableState.decodeStrings
      ? message.toString()
      : message;

    if (!stream.push(data)) websocket.pause();
  });

  websocket.once('error', (error) => {
    if (stream.destroyed) return;

    terminateOnDestroy = false;
    stream.destroy(error);
  });

  websocket.once('close', () => {
    if (stream.destroyed) return;
    stream.push(null);
  });

  stream._destroy = (error, callback) => {
    if (websocket.readyState === CLOSED) {
      callback(error);
      process.nextTick(emitClose, stream);
      return;
    }

    let callbackCalled = false;

    websocket.once('error', (socketError) => {
      callbackCalled = true;
      callback(socketError);
    });

    websocket.once('close', () => {
      if (!callbackCalled) callback(error);
      process.nextTick(emitClose, stream);
    });

    if (terminateOnDestroy) websocket.terminate();
  };

  stream._final = (callback) => {
    if (websocket.readyState === CONNECTING) {
      websocket.once('open', () => stream._final(callback));
      return;
    }

    if (websocket._socket === null) return;

    if (websocket._socket._writableState.finished) {
      callback();
      if (stream._readableState.endEmitted) stream.destroy();
    } else {
      websocket._socket.once('finish', callback);
      websocket.close();
    }
  };

  stream._read = () => {
    if (websocket.isPaused) websocket.resume();
  };

  stream._write = (chunk, encoding, callback) => {
    if (websocket.readyState === CONNECTING) {
      websocket.once('open', () => stream._write(chunk, encoding, callback));
      return;
    }

    websocket.send(chunk, callback);
  };

  stream[kWebSocket] = websocket;
  stream.on('end', duplexOnEnd);
  stream.on('error', duplexOnError);

  return stream;
}

module.exports = createWebSocketStream;
