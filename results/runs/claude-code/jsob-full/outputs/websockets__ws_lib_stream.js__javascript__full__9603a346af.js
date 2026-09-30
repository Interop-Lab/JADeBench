'use strict';

const WebSocket = require('./websocket');
const { Duplex } = require('stream');

function emitClose(stream) {
  stream.emit('close');
}

function duplexOnEnd() {
  if (!this.destroyed && this._writableState.finished) {
    this.destroy();
  }
}

function duplexOnError(error) {
  this.removeListener('error', duplexOnError);
  this.destroy();

  if (this.listenerCount('error') === 0) {
    this.emit('error', error);
  }
}

function createWebSocketStream(websocket, options) {
  let terminateOnDestroy = true;

  function onMessage(message, isBinary) {
    const data =
      !isBinary && duplex._readableState.objectMode
        ? message.toString()
        : message;

    if (!duplex.push(data)) {
      websocket.pause();
    }
  }

  function onError(error) {
    if (duplex.destroyed) return;

    terminateOnDestroy = false;
    duplex.destroy(error);
  }

  function onClose() {
    if (!duplex.destroyed) {
      duplex.push(null);
    }
  }

  websocket.on('message', onMessage);
  websocket.once('error', onError);
  websocket.once('close', onClose);

  options = {
    ...options,
    autoDestroy: false,
    emitClose: false,
    objectMode: false,
    writableObjectMode: false
  };

  const duplex = new Duplex(options);

  duplex._write = function write(chunk, encoding, callback) {
    if (websocket.readyState === WebSocket.CONNECTING) {
      websocket.once('open', function onOpen() {
        duplex._write(chunk, encoding, callback);
      });
      return;
    }

    websocket.send(chunk, callback);
  };

  duplex._read = function read() {
    if (websocket.isPaused) {
      websocket.resume();
    }
  };

  duplex._destroy = function destroy(error, callback) {
    if (websocket.readyState === WebSocket.CLOSED) {
      callback(error);
      process.nextTick(emitClose, duplex);
      return;
    }

    let callbackCalled = false;

    websocket.once('error', function onWebSocketError(websocketError) {
      callbackCalled = true;
      callback(websocketError);
    });

    websocket.once('close', function onWebSocketClose() {
      if (!callbackCalled) callback(error);
      process.nextTick(emitClose, duplex);
    });

    if (terminateOnDestroy) {
      websocket.terminate();
    }
  };

  duplex._final = function final(callback) {
    if (websocket.readyState === WebSocket.CONNECTING) {
      websocket.once('open', function onOpen() {
        duplex._final(callback);
      });
      return;
    }

    if (websocket._socket === null) return;

    if (websocket._socket._writableState.finished) {
      callback();

      if (duplex._readableState.endEmitted) {
        duplex.destroy();
      }
    } else {
      websocket._socket.once('finish', callback);
      websocket.close();
    }
  };

  duplex.on('end', duplexOnEnd);
  duplex.on('error', duplexOnError);

  return duplex;
}

module.exports = createWebSocketStream;
