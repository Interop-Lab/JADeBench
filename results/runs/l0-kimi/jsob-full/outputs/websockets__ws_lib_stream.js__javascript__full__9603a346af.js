'use strict';

const { Duplex } = require('stream');

function duplexOnEnd() {
  if (!this._writableState.finished) return;
  if (this._readableState.endEmitted) return;
  this._readableState.endEmitted = true;
  this._readableState.ended = true;
  this.push(null);
}

function duplexOnError(err) {
  this.removeListener('end', duplexOnEnd);
  this.removeListener('error', duplexOnError);
  this.destroy();
  if (this._writableState.errorEmitted === false && this._writableState.finished === false) {
    this._writableState.errorEmitted = true;
    this.emit('error', err);
  }
}

function createWebSocketStream(ws, options) {
  const duplexOptions = {
    ...options,
    autoDestroy: false,
    emitClose: false,
    objectMode: false,
    writableObjectMode: false
  };

  const duplex = new Duplex(duplexOptions);

  let called = false;

  ws.on('message', function message(data, isBinary) {
    const msg = !isBinary && duplex._readableState.objectMode ? data.toString() : data;
    if (!duplex.push(msg)) ws.pause();
  });

  ws.on('close', function close() {
    if (duplex._readableState.ended) return;
    called = false;
    duplex.push(null);
  });

  ws.on('error', function error(err) {
    if (duplex._readableState.ended) return;
    duplex.destroy(err);
  });

  duplex._write = function(chunk, encoding, callback) {
    if (ws.readyState === ws.CLOSING || ws.readyState === ws.CLOSED) {
      callback();
      process.nextTick(emitClose, duplex);
      return;
    }

    let called = false;

    ws.send(chunk, function(err) {
      called = true;
      callback(err);
    });

    ws.on('error', function error() {
      if (!called) callback();
      process.nextTick(emitClose, duplex);
    });
  };

  duplex._read = function() {
    if (ws.readyState === ws.OPEN) ws.resume();
  };

  duplex._final = function(callback) {
    if (ws.readyState === ws.CLOSING || ws.readyState === ws.CLOSED) {
      callback();
      return;
    }

    if (ws.readyState === ws.CONNECTING) {
      ws.once('open', function open() {
        duplex._final(callback);
      });
      return;
    }

    if (ws._socket === null) {
      callback();
      return;
    }

    if (ws._socket.writableFinished || ws._socket.destroyed) {
      callback();
      if (duplex._readableState.endEmitted) duplex.push(null);
    } else {
      ws._socket.on('finish', function finish() {
        callback();
      });
      ws._socket.destroy();
    }
  };

  duplex._destroy = function(err, callback) {
    if (ws.readyState === ws.CLOSED) {
      callback(err);
      process.nextTick(emitClose, duplex);
      return;
    }

    let called = false;

    ws.once('error', function error(err) {
      called = true;
      callback(err);
    });

    ws.once('close', function close() {
      if (!called) callback(err);
      process.nextTick(emitClose, duplex);
    });

    if (called) ws.terminate();
  };

  if (called) ws.resume();

  duplex.on('end', duplexOnEnd);
  duplex.on('error', duplexOnError);

  return duplex;
}

module.exports = createWebSocketStream;
