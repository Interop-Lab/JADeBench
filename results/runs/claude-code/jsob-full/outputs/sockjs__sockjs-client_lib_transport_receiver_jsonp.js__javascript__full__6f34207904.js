'use strict';

const crypto = require('crypto');
const inherits = require('inherits');
const EventEmitter = require('events').EventEmitter;
const Url = require('url-parse');

const randomAlphabet = 'abcdefghijklmnopqrstuvwxyz012345';

const random = {
  string(length) {
    const bytes = crypto.randomBytes(length);
    const result = [];

    for (let index = 0; index < length; index += 1) {
      result.push(randomAlphabet.substr(bytes[index] % randomAlphabet.length, 1));
    }

    return result.join('');
  },

  number(max) {
    return Math.floor(Math.random() * max);
  },

  numberString(max) {
    const width = String(max - 1).length;
    return `${new Array(width + 1).join('0')}${this.number(max)}`.slice(-width);
  }
};

const unloadCallbacks = {};
const chromeAppRuntime = global.chrome && global.chrome.app && global.chrome.app.runtime;
let unloading = false;

const events = {
  attachEvent(name, listener) {
    if (typeof global.addEventListener !== 'undefined') {
      global.addEventListener(name, listener, false);
    } else if (global.document && global.attachEvent) {
      global.document.attachEvent(`on${name}`, listener);
      global.attachEvent(`on${name}`, listener);
    }
  },

  detachEvent(name, listener) {
    if (typeof global.addEventListener !== 'undefined') {
      global.removeEventListener(name, listener, false);
    } else if (global.document && global.detachEvent) {
      global.document.detachEvent(`on${name}`, listener);
      global.detachEvent(`on${name}`, listener);
    }
  },

  unloadAdd(callback) {
    if (chromeAppRuntime) {
      return null;
    }

    const id = random.string(8);
    unloadCallbacks[id] = callback;

    if (unloading) {
      setTimeout(events.triggerUnloadCallbacks, 0);
    }

    return id;
  },

  unloadDel(id) {
    if (id in unloadCallbacks) {
      delete unloadCallbacks[id];
    }
  },

  triggerUnloadCallbacks() {
    for (const id in unloadCallbacks) {
      unloadCallbacks[id]();
      delete unloadCallbacks[id];
    }
  }
};

function triggerUnload() {
  if (unloading) {
    return;
  }

  unloading = true;
  events.triggerUnloadCallbacks();
}

if (!chromeAppRuntime) {
  if ('onpagehide' in global) {
    events.attachEvent('pagehide', event => {
      if (!event.persisted) {
        triggerUnload();
      }
    });
  } else {
    events.attachEvent('unload', triggerUnload);
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
    if (!global.document) {
      return true;
    }

    try {
      return Boolean(global.document.domain);
    } catch (error) {
      return false;
    }
  }
};

let iframeDebug = function() {};
if (process.env.NODE_ENV !== 'production') {
  iframeDebug = require('debug')('sockjs-client:utils:iframe');
}

const iframeUtils = {
  WPrefix: '_jp',
  currentWindowId: null,

  polluteGlobalNamespace() {
    if (!(this.WPrefix in global)) {
      global[this.WPrefix] = {};
    }
  },

  postMessage(type, data) {
    if (global.parent !== global) {
      global.parent.postMessage(JSON.stringify({
        windowId: this.currentWindowId,
        type,
        data: data || ''
      }), '*');
    } else {
      iframeDebug('Cannot postMessage, no parent window.', type, data);
    }
  },

  createIframe(url, callback) {
    let iframe = global.document.createElement('iframe');
    let timer;
    let unloadId;

    const loaded = () => {
      iframeDebug('loaded');
      clearTimeout(timer);
      try {
        iframe.onload = null;
      } catch (error) {}
      iframe.onerror = null;
    };

    const cleanup = () => {
      iframeDebug('cleanup');
      clearTimeout(timer);
      try {
        iframe.onload = null;
      } catch (error) {}
      iframe.onerror = null;

      if (iframe) {
        loaded();
        setTimeout(() => {
          if (iframe) {
            iframe.parentNode.removeChild(iframe);
          }
          iframe = null;
        }, 0);
        events.unloadDel(unloadId);
      }
    };

    const fail = reason => {
      iframeDebug('onerror', reason);
      if (iframe) {
        cleanup();
        callback(reason);
      }
    };

    iframe.src = url;
    iframe.style.display = 'none';
    iframe.style.position = 'absolute';
    iframe.onerror = () => fail('onerror');
    iframe.onload = () => {
      iframeDebug('onload');
      clearTimeout(timer);
      timer = setTimeout(() => fail('onload timeout'), 2000);
    };

    global.document.body.appendChild(iframe);
    timer = setTimeout(() => fail('timeout'), 15000);
    unloadId = events.unloadAdd(cleanup);

    return {
      post(message, origin) {
        iframeDebug('post', message, origin);
        setTimeout(() => {
          try {
            if (iframe && iframe.contentWindow) {
              iframe.contentWindow.postMessage(message, origin);
            }
          } catch (error) {}
        }, 0);
      },
      cleanup,
      loaded
    };
  },

  createHtmlfile(url, callback) {
    const activeXName = ['Active'].concat('Object').join('X');
    let htmlfile = new global[activeXName]('htmlfile');
    let iframe;
    let timer;
    let unloadId;

    const loaded = () => {
      iframeDebug('loaded');
      clearTimeout(timer);
      iframe.onerror = null;
    };

    const cleanup = () => {
      if (!htmlfile) {
        return;
      }

      loaded();
      events.unloadDel(unloadId);
      iframe.parentNode.removeChild(iframe);
      iframe = htmlfile = null;
      CollectGarbage();
    };

    const fail = reason => {
      iframeDebug('onerror', reason);
      if (htmlfile) {
        cleanup();
        callback(reason);
      }
    };

    htmlfile.open();
    htmlfile.write(`<html><script>document.domain="${global.document.domain}";<\/script></html>`);
    htmlfile.close();
    htmlfile.parentWindow[this.WPrefix] = global[this.WPrefix];

    const container = htmlfile.createElement('div');
    htmlfile.body.appendChild(container);
    iframe = htmlfile.createElement('iframe');
    container.appendChild(iframe);
    iframe.src = url;
    iframe.onerror = () => fail('onerror');

    timer = setTimeout(() => fail('timeout'), 15000);
    unloadId = events.unloadAdd(cleanup);

    return {
      post(message, origin) {
        setTimeout(() => {
          try {
            if (iframe && iframe.contentWindow) {
              iframe.contentWindow.postMessage(message, origin);
            }
          } catch (error) {}
        }, 0);
      },
      cleanup,
      loaded
    };
  },

  iframeEnabled: false
};

if (global.document) {
  iframeUtils.iframeEnabled =
    (typeof global.postMessage === 'function' || typeof global.postMessage === 'object') &&
    !browser.isKonqueror();
}

let urlDebug = function() {};
if (process.env.NODE_ENV !== 'production') {
  urlDebug = require('debug')('sockjs-client:utils:url');
}

const urlUtils = {
  getOrigin(url) {
    if (!url) {
      return null;
    }

    const parsed = new Url(url);
    if (parsed.protocol === 'file:') {
      return null;
    }

    const port = parsed.port || (parsed.protocol === 'https:' ? '443' : '80');
    return `${parsed.protocol}//${parsed.hostname}:${port}`;
  },

  isOriginEqual(first, second) {
    const equal = this.getOrigin(first) === this.getOrigin(second);
    urlDebug('same', first, second, equal);
    return equal;
  },

  isSchemeEqual(first, second) {
    return first.split(':')[0] === second.split(':')[0];
  },

  addPath(url, path) {
    const parts = url.split('?');
    return parts[0] + path + (parts[1] ? `?${parts[1]}` : '');
  },

  addQuery(url, query) {
    return url + (url.indexOf('?') === -1 ? `?${query}` : `&${query}`);
  },

  isLoopbackAddr(address) {
    return /^127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(address) || /^\[::1\]$/.test(address);
  }
};

let debug = function() {};
if (process.env.NODE_ENV !== 'production') {
  debug = require('debug')('sockjs-client:receiver:jsonp');
}

function JsonpReceiver(url) {
  debug(url);
  EventEmitter.call(this);

  iframeUtils.polluteGlobalNamespace();
  this.id = `a${random.string(6)}`;

  const callbackName = `${iframeUtils.WPrefix}.${this.id}`;
  const scriptUrl = urlUtils.addQuery(url, `c=${encodeURIComponent(callbackName)}`);
  global[iframeUtils.WPrefix][this.id] = this._callback.bind(this);
  this._createScript(scriptUrl);

  this.timeoutId = setTimeout(() => {
    debug('timeout');
    this._abort(new Error('JSONP script loaded abnormally (timeout)'));
  }, JsonpReceiver.timeout);
}

inherits(JsonpReceiver, EventEmitter);

JsonpReceiver.timeout = 35000;
JsonpReceiver.scriptErrorTimeout = 1000;

JsonpReceiver.prototype.abort = function abort() {
  debug('abort');
  if (global[iframeUtils.WPrefix][this.id]) {
    const error = new Error('JSONP user aborted read');
    error.code = 1000;
    this._abort(error);
  }
};

JsonpReceiver.prototype._callback = function callback(data) {
  debug('_callback', data);
  this._cleanup();

  if (this.aborting) {
    return;
  }

  if (data) {
    debug('message', data);
    this.emit('message', data);
  }

  this.emit('close', null, 'network');
  this.removeAllListeners();
};

JsonpReceiver.prototype._abort = function abortWithError(error) {
  debug('_abort', error);
  this._cleanup();
  this.aborting = true;
  this.emit('close', error.code, error.message);
  this.removeAllListeners();
};

JsonpReceiver.prototype._cleanup = function cleanup() {
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

JsonpReceiver.prototype._scriptError = function scriptError() {
  debug('_scriptError');
  if (this.errorTimer) {
    return;
  }

  this.errorTimer = setTimeout(() => {
    if (!this.loadedOkay) {
      this._abort(new Error('JSONP script loaded abnormally (onerror)'));
    }
  }, JsonpReceiver.scriptErrorTimeout);
};

JsonpReceiver.prototype._createScript = function createScript(url) {
  debug('_createScript', url);

  const receiver = this;
  const script = this.script = global.document.createElement('script');
  let errorScript;

  script.id = `a${random.string(8)}`;
  script.src = url;
  script.type = 'text/javascript';
  script.charset = 'UTF-8';
  script.onerror = this._scriptError.bind(this);
  script.onload = function onload() {
    debug('onload');
    receiver._abort(new Error('JSONP script loaded abnormally (onload)'));
  };
  script.onreadystatechange = function onreadystatechange() {
    debug('onreadystatechange', script.readyState);
    if (/loaded|closed/.test(script.readyState)) {
      if (script.htmlFor && script.onclick) {
        receiver.loadedOkay = true;
        try {
          script.onclick();
        } catch (error) {}
      }

      if (script) {
        receiver._abort(new Error('JSONP script loaded abnormally (onreadystatechange)'));
      }
    }
  };

  if (typeof script.async === 'undefined' && global.document.attachEvent) {
    if (!browser.isOpera()) {
      try {
        script.htmlFor = script.id;
        script.event = 'onclick';
      } catch (error) {}
      script.async = true;
    } else {
      errorScript = this.script2 = global.document.createElement('script');
      errorScript.text = `try{var a = document.getElementById('${script.id}'); if(a)a.onerror();}catch(x){}`;
      script.async = errorScript.async = false;
    }
  }

  if (typeof script.async !== 'undefined') {
    script.async = true;
  }

  const head = global.document.getElementsByTagName('head')[0];
  head.insertBefore(script, head.firstChild);
  if (errorScript) {
    head.insertBefore(errorScript, head.firstChild);
  }
};

module.exports = JsonpReceiver;
