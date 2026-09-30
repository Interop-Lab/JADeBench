'use strict';

const { Duplex } = require('stream');

function emitClose(stream) {
  stream.destroy();
}

function duplexOnEnd() {
  if (!this.destroyed) {
    this.destroy();
  }
}

function duplexOnError(error) {
  this.destroy(error);
}

function createWebSocketStream(ws, options) {
  let terminateOnDestroy = true;

  const duplex = new Duplex({
    ...options,

    read() {
      if (ws.isPaused) {
        ws.resume();
      }
    },

    write(chunk, encoding, callback) {
      if (ws.readyState === ws.OPEN) {
        ws.send(chunk, { binary: true }, callback);
      } else {
        ws.once('open', () => {
          ws.send(chunk, { binary: true }, callback);
        });
      }
    },

    final(callback) {
      if (ws.readyState === ws.CLOSED || ws.readyState === ws.CLOSING) {
        callback();
        return;
      }

      ws.once('close', callback);
      ws.close();
    },

    destroy(error, callback) {
      terminateOnDestroy = false;
      ws.terminate();
      callback(error);
    }
  });

  ws.on('message', (message, isBinary) => {
    if (!duplex.push(isBinary ? message : message.toString())) {
      ws.pause();
    }
  });

  ws.on('error', error => {
    if (duplex.destroyed) {
      return;
    }

    duplex.destroy(error);
  });

  ws.on('close', () => {
    if (duplex.destroyed) {
      return;
    }

    duplex.push(null);
  });

  duplex.on('end', duplexOnEnd);
  duplex.on('error', duplexOnError);
  duplex.on('close', emitClose);

  return duplex;
}

module.exports = createWebSocketStream;
