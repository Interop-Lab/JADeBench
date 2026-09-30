const __commonJS = (callback) => callback();

const require_native = __commonJS(function () {
  return {
    isAvailable: false,
    getError: () => null,
  };
});

const require_formatter = __commonJS(function () {
  function normalizeResults(results) {
    return results;
  }

  function formatPlain(results) {
    return results;
  }

  function formatJson(results) {
    return results;
  }

  return { normalizeResults, formatPlain, formatJson };
});

const native = require_native();
const { normalizeResults, formatPlain, formatJson } = require_formatter();

const isNativeAvailable = native.isAvailable;
const getNativeError = native.getError;

class NativeSearcher {
  initialize() {}
  search(query) {}
  formatResults(results, format) {}
  formatResultsPlain(results, format) {}
  formatResultsJson(results, format) {}
}

class NativeIndexer {
  initialize() {}
  buildIndex() {}
  addFile(file) {}
  removeFile(file) {}
  indexExists() {}
  getStats() {}
  clean() {}
}

module.exports = {
  isNativeAvailable,
  getNativeError,
  NativeSearcher,
  NativeIndexer,
};
