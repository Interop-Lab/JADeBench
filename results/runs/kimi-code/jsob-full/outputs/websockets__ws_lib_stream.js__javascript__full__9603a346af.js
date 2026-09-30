'use strict';

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
    this._writableState.errorEmitted = true;
    this.emit('error', error);
  }
}

function createWebSocketStream(webSocket, options) {
  let terminateOnDestroy = true;
  const duplexOptions = {
    ...options,
    autoDestroy: false,
    emitClose: false,
    objectMode: false,
    writableObjectMode: false
  };
  const stream = new Duplex(duplexOptions);

  webSocket.on('message', function onMessage(message, isBinary) {
    const data = !isBinary && stream._readableState.decodeStrings
      ? message.toString()
      : message;

    if (!stream.push(data)) {
      webSocket.pause();
    }
  });

  webSocket.once('error', function onError(error) {
    if (stream.destroyed) return;

    terminateOnDestroy = false;
    stream.destroy(error);
  });

  webSocket.once('close', function onClose() {
    if (stream.destroyed) return;

    stream.push(null);
  });

  stream._destroy = function destroy(error, callback) {
    if (webSocket.readyState === webSocket.CLOSED) {
      callback(error);
      process.nextTick(emitClose, stream);
      return;
    }

    let callbackCalled = false;

    webSocket.once('error', function onDestroyError(webSocketError) {
      callbackCalled = true;
      callback(webSocketError);
    });

    webSocket.once('close', function onDestroyClose() {
      if (!callbackCalled) callback(error);
      process.nextTick(emitClose, stream);
    });

    if (terminateOnDestroy) {
      webSocket.terminate();
    }
  };

  stream._final = function final(callback) {
    if (webSocket.readyState === webSocket.CONNECTING) {
      webSocket.once('open', function onOpen() {
        stream._final(callback);
      });
      return;
    }

    if (webSocket._socket === null) return;

    if (webSocket._socket._writableState.finished) {
      callback();

      if (stream._readableState.endEmitted) {
        stream.destroy();
      }
    } else {
      webSocket._socket.once('finish', callback);
      webSocket.close();
    }
  };

  stream._read = function read() {
    if (webSocket.isPaused) {
      webSocket.resume();
    }
  };

  stream._write = function write(chunk, encoding, callback) {
    if (webSocket.readyState === webSocket.CONNECTING) {
      webSocket.once('open', function onOpen() {
        stream._write(chunk, encoding, callback);
      });
      return;
    }

    webSocket.send(chunk, callback);
  };

  stream.on('end', duplexOnEnd);
  stream.on('error', duplexOnError);

  return stream;
}

module.exports = createWebSocketStream;
