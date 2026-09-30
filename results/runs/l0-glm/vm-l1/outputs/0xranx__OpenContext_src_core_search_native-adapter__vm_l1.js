var __getOwnPropNames = Object.getOwnPropertyNames;
globalThis['__getOwnPropNames'] = __getOwnPropNames;

var __commonJS = (cb) => {
  let module = { exports: {} };
  let exports = module.exports;
  cb(module, exports);
  return module.exports;
};
globalThis['__commonJS'] = __commonJS;

var require_native = __commonJS({
  '../work/0xranx__OpenContext/src/core/native.js'(module, exports) {
    const native = {
      isAvailable: false,
      getError: () => 'Native module not available',
      search: () => { throw new Error('Native search not available'); },
      indexFile: () => { throw new Error('Native indexing not available'); },
      indexExists: () => false,
      buildIndex: () => { throw new Error('Native buildIndex not available'); },
      removeFile: () => { throw new Error('Native removeFile not available'); },
      clean: () => { throw new Error('Native clean not available'); },
      getStats: () => { throw new Error('Native getStats not available'); }
    };
    module.exports = native;
  }
});
globalThis['require_native'] = require_native;

var require_formatter = __commonJS({
  '../work/0xranx__OpenContext/src/core/search/formatter.js'(module, exports) {
    function normalizeResults(results) {
      if (!Array.isArray(results)) return [];
      return results.map(r => ({
        file: r.file || r.path || '',
        line: r.line || 0,
        column: r.column || 0,
        match: r.match || r.text || '',
        context: r.context || ''
      }));
    }

    function formatPlain(results) {
      const normalized = normalizeResults(results);
      if (normalized.length === 0) return 'No results found.';
      return normalized.map(r => {
        const location = r.file + ':' + r.line + ':' + r.column;
        return location + ': ' + r.match + (r.context ? '\n  ' + r.context : '');
      }).join('\n');
    }

    function formatJson(results) {
      const normalized = normalizeResults(results);
      return JSON.stringify(normalized, null, 2);
    }

    module.exports = { normalizeResults, formatPlain, formatJson };
  }
});
globalThis['require_formatter'] = require_formatter;

var native = require_native();
globalThis['native'] = native;

var { normalizeResults, formatPlain, formatJson } = require_formatter();
globalThis['formatJson'] = formatJson;
globalThis['formatPlain'] = formatPlain;
globalThis['normalizeResults'] = normalizeResults;

var isNativeAvailable = native.isAvailable;
globalThis['isNativeAvailable'] = isNativeAvailable;

var getNativeError = native.getError;
globalThis['getNativeError'] = getNativeError;

class NativeSearcher {
  constructor() {}

  search() {
    return native.search();
  }

  indexFile(path) {
    return native.indexFile(path);
  }

  formatResults(results, format) {
    if (format === 'json') return formatJson(results);
    return formatPlain(results);
  }

  formatResultsPlain(results) {
    return formatPlain(results);
  }

  formatResultsJson(results) {
    return formatJson(results);
  }
}
globalThis['NativeSearcher'] = NativeSearcher;

class NativeIndexer {
  constructor() {}

  indexFile(path) {
    return native.indexFile(path);
  }

  indexExists(path) {
    return native.indexExists(path);
  }

  buildIndex(path) {
    return native.buildIndex(path);
  }

  removeFile(path) {
    return native.removeFile(path);
  }

  clean() {
    return native.clean();
  }

  getStats() {
    return native.getStats();
  }
}
globalThis['NativeIndexer'] = NativeIndexer;

module.exports = {
  isNativeAvailable,
  getNativeError,
  NativeSearcher,
  NativeIndexer
};
