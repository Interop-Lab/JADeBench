'use strict';

const crypto = require('crypto');

const randomCharacters = 'abcdefghijklmnopqrstuvwxyz012345';

const random = {
  string(length) {
    const bytes = crypto.randomBytes(length);
    const characters = [];

    for (let index = 0; index < length; index += 1) {
      characters.push(
        randomCharacters.substr(bytes[index] % randomCharacters.length, 1),
      );
    }

    return characters.join('');
  },

  number(max) {
    return Math.floor(Math.random() * max);
  },

  numberString(max) {
    const width = String(max - 1).length;
    const padding = Array(width + 1).join('0');
    return (padding + this.number(max)).slice(-width);
  },
};

const unloadCallbacks = {};
let unloaded = false;
const chromeRuntime =
  global.chrome && global.chrome.app && global.chrome.app.runtime;

const eventUtils = {
  attachEvent(event, listener) {
    if (typeof global.addEventListener !== 'undefined') {
      global.addEventListener(event, listener, false);
    } else if (global.document && global.document.attachEvent) {
      global.document.attachEvent(`on${event}`, listener);
      global.attachEvent(`on${event}`, listener);
    }
  },

  detachEvent(event, listener) {
    if (typeof global.addEventListener !== 'undefined') {
      global.removeEventListener(event, listener, false);
    } else if (global.document && global.document.detachEvent) {
      global.document.detachEvent(`on${event}`, listener);
      global.detachEvent(`on${event}`, listener);
    }
  },

  unloadAdd(listener) {
    if (unloaded) return null;

    const id = random.string(8);
    unloadCallbacks[id] = listener;

    if (chromeRuntime) {
      setTimeout(this.triggerUnloadCallbacks, 0);
    }

    return id;
  },

  unloadDel(id) {
    if (id in unloadCallbacks) delete unloadCallbacks[id];
  },

  triggerUnloadCallbacks() {
    const callbackIds = [];
    for (const id in unloadCallbacks) callbackIds.push(id);

    for (const id of callbackIds) {
      if (id in unloadCallbacks) {
        unloadCallbacks[id]();
        delete unloadCallbacks[id];
      }
    }
  },
};

function unload() {
  if (unloaded) return;

  unloaded = true;
  eventUtils.triggerUnloadCallbacks();
}

if (!chromeRuntime) {
  if ('onpagehide' in global) {
    eventUtils.attachEvent('pagehide', (event) => {
      if (!event.persisted) unload();
    });
  } else {
    eventUtils.attachEvent('unload', unload);
  }
}

const browser = {
  isOpera() {
    return global.navigator && /opera/i.test(global.navigator.userAgent);
  },

  isKonqueror() {
    return global.navigator && /konqueror/i.test(global.navigator.userAgent);
  },

  hasDomain() {
    if (!global.document) return true;

    try {
      return Boolean(global.document.domain);
    } catch (error) {
      return false;
    }
  },
};

let iframeDebug = function () {};
if (process.env.NODE_ENV !== 'production') {
  iframeDebug = require('debug')('sockjs-client:utils:iframe');
}

const iframeUtils = {
  WPrefix: '_jp',
  currentWindowId: null,

  polluteGlobalNamespace() {
    if (!(iframeUtils.WPrefix in global)) {
      global[iframeUtils.WPrefix] = {};
    }
  },

  postMessage(type, data) {
    if (global.parent !== global) {
      global.parent.postMessage(
        JSON.stringify({
          windowId: iframeUtils.currentWindowId,
          type,
          data: data || '',
        }),
        '*',
      );
    } else {
      iframeDebug('Cannot postMessage, no parent window.', type, data);
    }
  },

  createIframe(url, callback) {
    let iframe = global.document.createElement('iframe');
    let timeoutId;
    let unloadId;

    const loaded = () => {
      iframeDebug('unattach');
      clearTimeout(timeoutId);

      try {
        iframe.onload = null;
      } catch (error) {
        // Old browsers can reject event-handler assignment.
      }

      iframe.onerror = null;
    };

    const removeIframe = () => {
      if (iframe) iframe.parentNode.removeChild(iframe);
      iframe = null;
    };

    const cleanup = () => {
      iframeDebug('cleanup');
      if (!iframe) return;

      loaded();
      setTimeout(removeIframe, 0);
      eventUtils.unloadDel(unloadId);
    };

    const fail = (reason) => {
      iframeDebug('onerror', reason);
      if (!iframe) return;

      cleanup();
      callback(reason);
    };

    const post = (message, targetOrigin) => {
      iframeDebug('post', message, targetOrigin);
      setTimeout(() => {
        try {
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(message, targetOrigin);
          }
        } catch (error) {
          // Cross-window access can fail while an iframe is navigating.
        }
      }, 0);
    };

    iframe.src = url;
    iframe.style.display = 'none';
    iframe.style.position = 'absolute';
    iframe.onerror = () => fail('onerror');
    iframe.onload = () => {
      iframeDebug('onload');
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fail('onload timeout'), 2000);
    };

    global.document.body.appendChild(iframe);
    timeoutId = setTimeout(() => fail('timeout'), 15000);
    unloadId = eventUtils.unloadAdd(cleanup);

    return { post, cleanup, loaded };
  },

  createHtmlfile(url, callback) {
    const activeXObjectName = ['Active'].concat('Object').join('X');
    let htmlfile = new global[activeXObjectName]('htmlfile');
    let timeoutId;
    let unloadId;
    let iframe;

    const loaded = () => {
      clearTimeout(timeoutId);
      iframe.onerror = null;
    };

    const cleanup = () => {
      if (!htmlfile) return;

      loaded();
      eventUtils.unloadDel(unloadId);
      iframe.parentNode.removeChild(iframe);
      htmlfile = iframe = null;
      global.CollectGarbage();
    };

    const fail = (reason) => {
      iframeDebug('onerror', reason);
      if (!htmlfile) return;

      cleanup();
      callback(reason);
    };

    const post = (message, targetOrigin) => {
      try {
        setTimeout(() => {
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(message, targetOrigin);
          }
        }, 0);
      } catch (error) {
        // Legacy htmlfile objects can disappear during teardown.
      }
    };

    htmlfile.open();
    htmlfile.write(
      `<html><script>document.domain="${global.document.domain}";</script></html>`,
    );
    htmlfile.close();
    htmlfile.parentWindow[iframeUtils.WPrefix] = global[iframeUtils.WPrefix];

    const container = htmlfile.createElement('div');
    htmlfile.body.appendChild(container);
    iframe = htmlfile.createElement('iframe');
    container.appendChild(iframe);
    iframe.src = url;
    iframe.onerror = () => fail('onerror');

    timeoutId = setTimeout(() => fail('timeout'), 15000);
    unloadId = eventUtils.unloadAdd(cleanup);

    return { post, cleanup, loaded };
  },
};

iframeUtils.iframeEnabled = false;
if (global.document) {
  const canPostMessage =
    typeof global.postMessage === 'function' ||
    typeof global.postMessage === 'object';
  iframeUtils.iframeEnabled = canPostMessage && !browser.isKonqueror();
}

const Url = require('url-parse');
let urlDebug = function () {};
if (process.env.NODE_ENV !== 'production') {
  urlDebug = require('debug')('sockjs-client:utils:url');
}

const urlUtils = {
  getOrigin(url) {
    if (!url) return null;

    const parsed = new Url(url);
    if (parsed.protocol === 'file:') return null;

    const port = parsed.port || (parsed.protocol === 'https:' ? '443' : '80');
    return `${parsed.protocol}//${parsed.hostname}:${port}`;
  },

  isOriginEqual(firstUrl, secondUrl) {
    const same = this.getOrigin(firstUrl) === this.getOrigin(secondUrl);
    urlDebug('same', firstUrl, secondUrl, same);
    return same;
  },

  isSchemeEqual(firstUrl, secondUrl) {
    return firstUrl.split(':')[0] === secondUrl.split(':')[0];
  },

  addPath(url, path) {
    const parts = url.split('?');
    return parts[0] + path + (parts[1] ? `?${parts[1]}` : '');
  },

  addQuery(url, query) {
    return url + (url.indexOf('?') === -1 ? `?${query}` : `&${query}`);
  },

  isLoopbackAddr(hostname) {
    return (
      /^127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(hostname) ||
      /^\[::1\]$/i.test(hostname)
    );
  },
};

const inherits = require('inherits');
const { EventEmitter } = require('events');

let debug = function () {};
if (process.env.NODE_ENV !== 'production') {
  debug = require('debug')('sockjs-client:receiver:jsonp');
}

function JsonpReceiver(url) {
  debug(url);
  const receiver = this;

  EventEmitter.call(this);
  iframeUtils.polluteGlobalNamespace();

  this.id = `a${random.string(6)}`;
  const scriptUrl = urlUtils.addQuery(
    url,
    `c=${encodeURIComponent(`${iframeUtils.WPrefix}.${this.id}`)}`,
  );

  global[iframeUtils.WPrefix][this.id] = this._callback.bind(this);
  this._createScript(scriptUrl);
  this.timeoutId = setTimeout(() => {
    debug('timeout');
    receiver._abort(new Error('JSONP script loaded abnormally (timeout)'));
  }, JsonpReceiver.timeout);
}

inherits(JsonpReceiver, EventEmitter);

JsonpReceiver.prototype.abort = function abort() {
  debug('abort');
  if (global[iframeUtils.WPrefix][this.id]) {
    const error = new Error('JSONP user aborted read');
    error.code = 1000;
    this._abort(error);
  }
};

JsonpReceiver.timeout = 35000;
JsonpReceiver.scriptErrorTimeout = 1000;

JsonpReceiver.prototype._callback = function _callback(data) {
  debug('_callback', data);
  this._cleanup();
  if (this.aborting) return;

  if (data) {
    debug('message', data);
    this.emit('message', data);
  }

  this.emit('close', null, 'network');
  this.removeAllListeners();
};

JsonpReceiver.prototype._abort = function _abort(error) {
  debug('_abort', error);
  this._cleanup();
  this.aborting = true;
  this.emit('close', error.code, error.message);
  this.removeAllListeners();
};

JsonpReceiver.prototype._cleanup = function _cleanup() {
  debug('_cleanup');
  clearTimeout(this.timeoutId);

  if (this.script2) {
    this.script2.parentNode.removeChild(this.script2);
    this.script2 = null;
  }

  if (this.script) {
    const script = this.script;
    script.parentNode.removeChild(script);
    script.onreadystatechange = script.onerror = script.onload = script.onclick = null;
    this.script = null;
  }

  delete global[iframeUtils.WPrefix][this.id];
};

JsonpReceiver.prototype._scriptError = function _scriptError() {
  debug('_scriptError');
  const receiver = this;
  if (this.errorTimer) return;

  this.errorTimer = setTimeout(() => {
    if (!receiver.loadedOkay) {
      receiver._abort(new Error('JSONP script loaded abnormally (onerror)'));
    }
  }, JsonpReceiver.scriptErrorTimeout);
};

JsonpReceiver.prototype._createScript = function _createScript(url) {
  debug('_createScript', url);

  const receiver = this;
  const script = (this.script = global.document.createElement('script'));
  let script2;

  script.id = `a${random.string(8)}`;
  script.src = url;
  script.type = 'text/javascript';
  script.charset = 'UTF-8';
  script.onerror = this._scriptError.bind(this);
  script.onload = function onload() {
    debug('onload');
    receiver._abort(new Error('JSONP script loaded abnormally (onload)'));
  };
  script.onreadystatechange = function onReadyStateChange() {
    debug('onreadystatechange', script.readyState);
    if (/loaded|closed/.test(script.readyState)) {
      if (script && script.htmlFor && script.onclick) {
        receiver.loadedOkay = true;
        try {
          script.onclick();
        } catch (error) {
          // IE may throw while dispatching the synthetic click.
        }
      }

      if (script) {
        receiver._abort(
          new Error('JSONP script loaded abnormally (onreadystatechange)'),
        );
      }
    }
  };

  if (typeof script.async === 'undefined' && global.document.attachEvent) {
    if (!browser.isOpera()) {
      try {
        script.htmlFor = script.id;
        script.event = 'onclick';
      } catch (error) {
        // Ignore unsupported legacy script properties.
      }
      script.async = true;
    } else {
      script2 = this.script2 = global.document.createElement('script');
      script2.text =
        `try{var a = document.getElementById('${script.id}'); ` +
        'if(a)a.onerror();}catch(x){};';
      script.async = script2.async = false;
    }
  }

  if (typeof script.async !== 'undefined') script.async = true;

  const head = global.document.getElementsByTagName('head')[0];
  head.insertBefore(script, head.firstChild);
  if (script2) head.insertBefore(script2, head.firstChild);
};

module.exports = JsonpReceiver;
