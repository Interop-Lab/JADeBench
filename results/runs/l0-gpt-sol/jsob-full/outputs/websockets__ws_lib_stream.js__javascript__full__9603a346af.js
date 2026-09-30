'use strict';

const { Duplex } = require('stream');

function emitClose(stream) {
  stream.emit('close');
}

function duplexOnEnd() {
  if (!this.destroyed && this._readableState.endEmitted) {
    this.destroy();
  }
}

function duplexOnError(error) {
  this.destroy();
  if (this.destroyed) return;
  this.emit('error', error);
}

function createWebSocketStream(websocket, options) {
  const stream = new Duplex({
    ...options,
    autoDestroy: false,
    emitClose: false,
    objectMode: false,
    writableObjectMode: false
  });

  let terminateOnDestroy = true;

  websocket.on('message', function message(data, isBinary) {
    const chunk = !isBinary && stream._readableState.decoder
      ? data.toString()
      : data;

    if (!stream.push(chunk)) {
      websocket.pause();
    }
  });

  websocket.on('error', function error(err) {
    if (stream.destroyed) return;
    terminateOnDestroy = false;
    stream.destroy(err);
  });

  websocket.on('close', function close() {
    if (terminateOnDestroy) {
      stream.destroy();
    }
  });

  stream._read = function read() {
    if (websocket.isPaused) {
      websocket.resume();
    }
  };

  stream._destroy = function destroy(error, callback) {
    terminateOnDestroy = false;

    if (websocket.readyState === websocket.CLOSED) {
      callback(error);
      return;
    }

    websocket.once('close', () => callback(error));

    if (websocket.readyState === websocket.OPEN) {
      websocket.close();
    } else {
      websocket.terminate();
    }
  };

  stream._final = function final(callback) {
    if (websocket.readyState === websocket.CONNECTING) {
      websocket.once('open', () => stream._final(callback));
      return;
    }

    if (websocket.readyState === websocket.OPEN) {
      websocket.once('close', callback);
      websocket.close();
    } else {
      callback();
    }
  };

  stream._write = function write(chunk, encoding, callback) {
    if (websocket.readyState === websocket.CONNECTING) {
      websocket.once('open', () => stream._write(chunk, encoding, callback));
      return;
    }

    websocket.send(chunk, callback);
  };

  return stream;
}

module.exports = createWebSocketStream;
