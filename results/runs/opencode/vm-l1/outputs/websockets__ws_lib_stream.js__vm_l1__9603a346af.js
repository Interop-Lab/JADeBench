'use strict';

const { Duplex } = require('stream');

const kWebSocket = Symbol('websocket');
const CONNECTING = 0;
const CLOSED = 3;

function emitClose(stream) {
  stream.emit('close');
}

function duplexOnEnd() {
  const websocket = this[kWebSocket];

  if (websocket.readyState === CONNECTING) {
    websocket.once('open', function onOpen() {
      websocket.close();
    });
  } else {
    websocket.close();
  }
}

function duplexOnError(error) {
  const websocket = this[kWebSocket];

  if (websocket.readyState === CLOSED) {
    this.emit('error', error);
    this.emit('close');
  } else {
    websocket.close();
  }
}

function createWebSocketStream(websocket, options) {
  let terminateOnDestroy = true;

  const duplex = new Duplex({
    ...options,
    autoDestroy: false,
    emitClose: false,
    objectMode: false,
    writableObjectMode: false
  });

  duplex[kWebSocket] = websocket;

  websocket.on('message', function onMessage(message, isBinary) {
    const data =
      !isBinary && duplex._readableState.decodeStrings
        ? message.toString()
        : message;

    if (!duplex.push(data)) websocket.pause();
  });

  websocket.once('error', function onError(error) {
    if (duplex.destroyed) return;

    terminateOnDestroy = false;
    duplex.destroy(error);
  });

  websocket.once('close', function onClose() {
    if (duplex.destroyed) return;
    duplex.push(null);
  });

  duplex._destroy = function destroy(error, callback) {
    if (websocket.readyState === CLOSED) {
      callback(error);
      process.nextTick(emitClose, duplex);
      return;
    }

    let callbackCalled = false;

    websocket.once('error', function onError(websocketError) {
      callbackCalled = true;
      callback(websocketError);
    });

    websocket.once('close', function onClose() {
      if (!callbackCalled) callback(error);
      process.nextTick(emitClose, duplex);
    });

    if (terminateOnDestroy) websocket.terminate();
  };

  duplex._final = function final(callback) {
    if (websocket.readyState === CONNECTING) {
      websocket.once('open', function onOpen() {
        duplex._final(callback);
      });
      return;
    }

    if (websocket._socket._writableState.finished) {
      callback();
      if (duplex._readableState.endEmitted) duplex.destroy();
    } else {
      websocket._socket.once('finish', function onFinish() {
        callback();
      });
      websocket.close();
    }
  };

  duplex._read = function read() {
    if (websocket.isPaused) websocket.resume();
  };

  duplex._write = function write(chunk, encoding, callback) {
    if (websocket.readyState === CONNECTING) {
      websocket.once('open', function onOpen() {
        duplex._write(chunk, encoding, callback);
      });
      return;
    }

    websocket.send(chunk, callback);
  };

  duplex.on('end', duplexOnEnd);
  duplex.on('error', duplexOnError);

  return duplex;
}

module.exports = createWebSocketStream;
