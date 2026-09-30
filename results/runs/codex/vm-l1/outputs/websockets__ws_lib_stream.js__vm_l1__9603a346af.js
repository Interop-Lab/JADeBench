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

  webSocket.on('message', function message(data, isBinary) {
    const chunk =
      !isBinary && duplex._readableState.decodeStrings
        ? data.toString()
        : data;

    if (!duplex.push(chunk)) webSocket.pause();
  });

  webSocket.once('error', function error(streamError) {
    if (duplex.destroyed) return;

    terminateOnDestroy = false;
    duplex.destroy(streamError);
  });

  webSocket.once('close', function close() {
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

    webSocket.once('error', function error(streamError) {
      callbackCalled = true;
      callback(streamError);
    });

    webSocket.once('close', function close() {
      if (!callbackCalled) callback(error);
      process.nextTick(emitClose, duplex);
    });

    if (terminateOnDestroy) webSocket.terminate();
  };

  duplex._final = function final(callback) {
    if (webSocket.readyState === webSocket.CONNECTING) {
      webSocket.once('open', function open() {
        duplex._final(callback);
      });
      return;
    }

    if (webSocket._socket === null) return;

    if (webSocket._socket._writableState.finished) {
      callback();
      if (duplex._readableState.endEmitted) duplex.destroy();
    } else {
      webSocket._socket.once('finish', function finish() {
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
      webSocket.once('open', function open() {
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
