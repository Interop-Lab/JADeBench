'use strict';

const { Duplex } = require('stream');

function emitClose(stream) {
  stream.emit('close');
}

function duplexOnError(error) {
  this.removeListener('error', duplexOnError);
  this.destroy();

  if (this.listenerCount('error') === 0) {
    this.emit('error', error);
  }
}

/**
 * Wrap a ws-compatible WebSocket in a Node.js Duplex stream.
 *
 * Incoming WebSocket messages are exposed by the readable side. Writes are
 * forwarded with `websocket.send()`, and stream shutdown performs the normal
 * WebSocket close handshake.
 */
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
    const chunk = !isBinary && stream._readableState.objectMode
      ? message.toString()
      : message;

    if (!stream.push(chunk)) websocket.pause();
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

  stream._destroy = function destroy(error, callback) {
    if (websocket.readyState === websocket.CLOSED) {
      callback(error);
      process.nextTick(emitClose, stream);
      return;
    }

    let called = false;

    websocket.once('error', (websocketError) => {
      called = true;
      callback(websocketError);
    });

    websocket.once('close', () => {
      if (!called) callback(error);
      process.nextTick(emitClose, stream);
    });

    if (terminateOnDestroy) websocket.terminate();
  };

  stream._final = function final(callback) {
    if (websocket.readyState === websocket.CONNECTING) {
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

  stream._read = function read() {
    if (websocket.isPaused) websocket.resume();
  };

  stream._write = function write(chunk, encoding, callback) {
    if (websocket.readyState === websocket.CONNECTING) {
      websocket.once('open', () => stream._write(chunk, encoding, callback));
      return;
    }

    websocket.send(chunk, callback);
  };

  stream.on('end', function duplexOnEnd() {
    if (!this.destroyed && this._writableState.finished) {
      this.destroy();
    }
  });

  stream.on('error', duplexOnError);

  return stream;
}

module.exports = createWebSocketStream;
