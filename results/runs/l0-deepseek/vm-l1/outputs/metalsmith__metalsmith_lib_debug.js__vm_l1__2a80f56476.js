const vm_0x382ded_cd071f = (() => {
  const _module = { exports: {} };
  const _exports = _module.exports;
  const _require = typeof require !== 'undefined' ? require : undefined;
  const _dirname = typeof __dirname !== 'undefined' ? __dirname : undefined;
  const _filename = typeof __filename !== 'undefined' ? __filename : undefined;

  const _debug = _require('debug');
  const _utf8 = _require('is-utf8');

  const _helpers = (() => {
    const _isString = (value) => typeof value === 'string';
    return { isString: _isString };
  })();

  const _streamLogHandler = (stream) => {
    return (message) => {
      stream.write(message + '\n');
    };
  };

  _debug.log = _streamLogHandler(process.stderr);

  const _options = {};

  Object.defineProperty(_options, 'colors', {
    get() { return _options._colors; },
    set(value) { _options._colors = value; }
  });

  Object.defineProperty(_options, 'handle', {
    get() { return _options._handle; },
    set(value) { _options._handle = value; }
  });

  _debug.formatters.b = (value) => {
    if (value instanceof Buffer && _utf8(value)) {
      return value.toString().slice(0, 200) + '...';
    }
    return value;
  };

  function Debugger(options) {
    if (!(this instanceof Debugger)) {
      return new Debugger(options);
    }
    this.options = options;
  }

  function proxy(target, options, method) {
    return new Proxy(target, {
      get(obj, prop) {
        if (prop === method) {
          return (...args) => {
            const result = obj[prop](...args);
            if (options && options.handle) {
              options.handle(result);
            }
            return result;
          };
        }
        return obj[prop];
      }
    });
  }

  proxy(Debugger, _options, 'log');
  proxy(Debugger, _options, 'error');
  proxy(Debugger, _debug, 'log');
  proxy(Debugger, _debug, 'error');
  proxy(Debugger, _debug, 'disable');

  _exports.Debugger = Debugger;
  _exports.fileLogHandler = _streamLogHandler;

  return _exports;
})();

const Debugger = vm_0x382ded_cd071f.Debugger;
const fileLogHandler = vm_0x382ded_cd071f.fileLogHandler;

export { Debugger, fileLogHandler };
