var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (obj, target) => function() {
  var exports = {};
  return exports.default = {},
    (target || (obj[__getOwnPropNames(obj)[0]] = exports).default, target.exports = exports), target.exports;
};

var require_native = __commonJS({
  '../work/0xranx__OpenContext/src/core/native.js'(exports, module) {
    var path = require('path');
    var nativeModule = null;
    var loadError = null;
    var requireError = null;
    var initError = null;
    var initialized = false;
    var loadedFrom = null;

    function initialize() {
      if (initialized) return;
      initialized = true;
      try {
        nativeModule = require('@opencontext/native');
        loadedFrom = 'prebuilt';
        return;
      } catch (err) {
        requireError = err;
      }
      try {
        var modulePath = path.join(__dirname, '../../build/Release/opencontext.node');
        nativeModule = require(modulePath);
        loadedFrom = 'build';
      } catch (err) {
        initError = err;
        loadError = err;
      }
    }

    initialize();

    function isAvailable() {
      return nativeModule !== null;
    }

    function getError() {
      return loadError;
    }

    function get() {
      if (!nativeModule) {
        throw new Error(
          'Native module not available. ' +
          (requireError?.message || 'Unknown error') +
          ' | ' +
          (initError?.message || 'Unknown error')
        );
      }
      return nativeModule;
    }

    function requireNative() {
      if (!nativeModule) {
        throw new Error(
          'Native module not available. ' +
          (requireError?.message || 'Unknown error') +
          ' | ' +
          (initError?.message || 'Unknown error')
        );
      }
      return nativeModule;
    }

    function getLoadedFrom() {
      return loadedFrom;
    }

    module.exports = {
      isAvailable: isAvailable,
      getError: getError,
      get: get,
      require: requireNative,
      getLoadedFrom: getLoadedFrom,
      get native() {
        return nativeModule;
      }
    };
  }
});

var require_formatter = __commonJS({
  '../work/0xranx__OpenContext/src/core/search/formatter.js'(exports, module) {
    function normalizeResult(result) {
      var normalized = {};
      normalized.path = result.path;
      normalized.line = result.line || result.lineNumber;
      normalized.column = result.column;
      normalized.lineText = result.lineText || result.lineContent;
      normalized.previewText = result.previewText || result.previewContent;
      normalized.context = result.context || result.contextText;
      normalized.score = result.score || result.relevance;
      normalized.aggregateBy = result.aggregateBy || result.aggregate_by;
      normalized.contextBefore = result.contextBefore || result.beforeContext;
      normalized.contextAfter = result.contextAfter || result.afterContext;
      normalized.matchCount = result.matchCount || result.matches;
      normalized.matchLength = result.matchLength || result.length;
      normalized.byteOffset = result.byteOffset || result.offset;
      normalized.matchStart = result.matchStart || result.start;
      normalized.matchEnd = result.matchEnd || result.end;
      normalized.byteLength = result.byteLength || result.size;
      normalized.aggregateScore = result.aggregateScore || result.aggregate_score;
      normalized.aggregateMatches = result.aggregateMatches || result.aggregate_matches;
      normalized.fileType = result.fileType || result.type;
      normalized.fileSize = result.fileSize || result.size;
      normalized.modifiedTime = result.modifiedTime || result.mtime;
      normalized.createdTime = result.createdTime || result.ctime;
      normalized.isBinary = result.isBinary || result.binary;
      normalized.encoding = result.encoding || result.encoding;
      return normalized;
    }

    function normalizeResults(results) {
      return (results || []).map(normalizeResult);
    }

    function formatPlain(query, results, options = {}) {
      var { mode = 'default', aggregateBy = 'file' } = options;
      if (!results || results.length === 0) {
        return 'No results found for "' + query + '".\n';
      }
      var modeMap = {};
      modeMap.default = 'default';
      modeMap.compact = 'compact';
      modeMap.detailed = 'detailed';
      var modeLabel = modeMap[mode] || mode;
      var output = 'Found ' + results.length + ' results for "' + query + '" (mode: ' + modeLabel + ')\n\n';
      results.forEach((result, index) => {
        var normalized = normalizeResult(result);
        var aggregateLabel = formatAggregateBy(normalized.aggregateBy);
        if (aggregateBy === 'file') {
          output += formatFileResult(index, normalized, aggregateLabel);
        } else if (aggregateBy === 'match') {
          output += formatMatchResult(index, normalized, aggregateLabel);
        } else {
          output += formatDetailedResult(index, normalized, aggregateLabel);
        }
      });
      return output;
    }

    function formatAggregateBy(aggregateBy) {
      if (aggregateBy === 'file') return 'file';
      if (aggregateBy === 'match') return 'match';
      return 'default';
    }

    function formatFileResult(index, result, aggregateLabel) {
      var contextBefore = result.contextBefore ? '\n' + result.contextBefore : '';
      var contextAfter = result.contextAfter && result.contextAfter ? '\n' + result.contextAfter + ')' : '';
      var separator = '─'.repeat(40);
      var lineText = result.lineText || '';
      var preview = lineText.length > 200 ? lineText.substring(0, 200) + '...' : lineText;
      return '[' + (index + 1) + '] ' + result.path.split(/[\\/]/).pop() + ' ' + aggregateLabel +
             ' (line: ' + (result.line || result.lineNumber) + ')' +
             (result.matchCount || 0) +
             ' | score: ' + (result.score || 0) +
             '\n' + separator + '\n' + preview + '\n' + separator + '\n\n';
    }

    function formatMatchResult(index, result, aggregateLabel) {
      return '[' + (index + 1) + '] ' + result.path.split(/[\\/]/).pop() + ' ' + aggregateLabel +
             ' (line: ' + (result.line || result.lineNumber) + ')' +
             (result.matchCount || 0) +
             '\n\n';
    }

    function formatDetailedResult(index, result, aggregateLabel) {
      var contextBefore = result.contextBefore ? '\n' + result.contextBefore : '';
      var contextAfter = result.contextAfter && result.contextAfter ? '\n' + result.contextAfter + ')' : '';
      var separator = '─'.repeat(40);
      var lineText = result.lineText || '';
      var preview = lineText.length > 200 ? lineText.substring(0, 200) + '...' : lineText;
      return '[' + (index + 1) + '] ' + result.path.split(/[\\/]/).pop() + ' ' + aggregateLabel +
             ' (line: ' + (result.line || result.lineNumber) + ')' +
             contextBefore + contextAfter + '\n' + separator + '\n' + preview + '\n' + separator + '\n\n';
    }

    function formatJson(query, results, options = {}) {
      var { mode = 'default', aggregateBy = 'file' } = options;
      return {
        query: query,
        mode: mode,
        aggregate_by: aggregateBy,
        count: results.length,
        results: normalizeResults(results)
      };
    }

    var formatter = {};
    formatter.normalizeResult = normalizeResult;
    formatter.normalizeResults = normalizeResults;
    formatter.formatPlain = formatPlain;
    formatter.formatJson = formatJson;
    module.exports = formatter;
  }
});

var native = require_native();
var { normalizeResults, formatPlain, formatJson } = require_formatter();

var isNativeAvailable = native.isAvailable;
var getNativeError = native.getError;

var NativeSearcher = class {
  constructor(options = {}) {
    this.fuzzyThreshold = options.fuzzyThreshold ?? 0.7;
    this.maxResults = options.maxResults ?? 1000;
    this.initialized = false;
    this.searcher = null;
  }

  async initialize(force = false) {
    if (this.initialized && !force) return;
    this.searcher = await native.require().NativeSearch.create();
    this.initialized = true;
  }

  async search(query, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }
    var { limit = 100, mode = 'default', aggregateBy = 'file' } = options;
    var params = {};
    params.query = query;
    params.limit = limit;
    params.mode = mode;
    params.aggregate_by = aggregateBy;
    params.context = options.context;
    var results = await this.searcher.search(params);
    return normalizeResults(results.results);
  }

  formatPlain(query, results, options = {}) {
    return formatPlain(query, results, options);
  }

  formatJson(query, results, options = {}) {
    return formatJson(query, results, options);
  }
};

var NativeIndexer = class {
  constructor(options = {}) {
    this.indexer = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    this.indexer = await native.require().NativeIndexer.create();
    this.initialized = true;
  }

  async index(options = {}) {
    await this.initialize();
    var stats = await this.indexer.stats();
    if (options.progress) {
      var progressOptions = {};
      progressOptions.mode = 'verbose';
      progressOptions.threshold = 100;
      options.progress(progressOptions);
    }
    var result = {};
    result.count = stats.files;
    result.content = stats.content;
    result.status = 'completed';
    result.errors = stats.errors;
    return result;
  }

  async add(path) {
    await this.initialize();
    return await this.indexer.add(path);
  }

  async remove(path) {
    await this.initialize();
    await this.indexer.remove(path);
  }

  async clear() {
    await this.initialize();
    return await this.indexer.clear();
  }

  async flush() {
    await this.initialize();
    return await this.indexer.flush();
  }

  async close() {
    await this.initialize();
    await this.indexer.close();
  }
};

var exports_obj = {};
exports_obj.isNativeAvailable = isNativeAvailable;
exports_obj.getNativeError = getNativeError;
exports_obj.NativeSearcher = NativeSearcher;
exports_obj.NativeIndexer = NativeIndexer;
module.exports = exports_obj;
