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
    this.emit('error', error);
  }
}

function createWebSocketStream(webSocket, options) {
  let terminateOnDestroy = true;

  const duplex = new Duplex({
    ...options,
    autoDestroy: false,
    emitClose: false,
    objectMode: false,
    writableObjectMode: false
  });

  webSocket.on('message', function onMessage(message, isBinary) {
    const data =
      !isBinary && duplex._readableState.decodeStrings
        ? message.toString()
        : message;

    if (!duplex.push(data)) webSocket.pause();
  });

  webSocket.once('error', function onWebSocketError(error) {
    if (duplex.destroyed) return;

    terminateOnDestroy = false;
    duplex.destroy(error);
  });

  webSocket.once('close', function onWebSocketClose() {
    if (duplex.destroyed) return;

    duplex.push(null);
  });

  duplex._destroy = function destroy(error, callback) {
    if (webSocket.readyState === webSocket.CLOSED) {
      callback(error);
      process.nextTick(emitClose, duplex);
      return;
    }

    let callbackCalled = false;

    webSocket.once('error', function onDestroyError(destroyError) {
      callbackCalled = true;
      callback(destroyError);
    });
    webSocket.once('close', function onDestroyClose() {
      if (!callbackCalled) callback(error);
      process.nextTick(emitClose, duplex);
    });

    if (terminateOnDestroy) webSocket.terminate();
  };

  duplex._final = function final(callback) {
    if (webSocket.readyState === webSocket.CONNECTING) {
      webSocket.once('open', function onOpen() {
        duplex._final(callback);
      });
      return;
    }

    if (webSocket._socket === null) return;

    if (webSocket._socket._writableState.finished) {
      callback();
      if (duplex._readableState.endEmitted) duplex.destroy();
    } else {
      webSocket._socket.once('finish', function onSocketFinish() {
        callback();
      });
      webSocket.close();
    }
  };

  duplex._read = function read() {
    if (webSocket.isPaused) webSocket.resume();
  };

  duplex._write = function write(chunk, encoding, callback) {
    if (webSocket.readyState === webSocket.CONNECTING) {
      webSocket.once('open', function onOpen() {
        duplex._write(chunk, encoding, callback);
      });
      return;
    }

    webSocket.send(chunk, callback);
  };

  duplex.on('end', duplexOnEnd);
  duplex.on('error', duplexOnError);
  return duplex;
}

module.exports = createWebSocketStream;
