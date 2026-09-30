var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  var module = { exports: {} };
  return (mod || cb(__getOwnPropNames(cb)[0]))((mod = module).exports, mod), mod.exports;
};

var require_native = __commonJS({
  '../work/0xranx__OpenContext/src/core/native.js'(exports, module) {
    var path = require('path');
    var native = null;
    var loadError = null;
    var requireError = null;
    var fallbackError = null;
    var initialized = false;
    var loadedFrom = null;

    function tryLoad() {
      if (initialized) return;
      initialized = true;
      try {
        native = require('node-gyp-build');
        loadedFrom = 'node-gyp-build';
        return;
      } catch (e) {
        requireError = e;
      }
      try {
        var nativePath = path.join(__dirname, '../build/Release/native.node');
        native = require(nativePath);
        loadedFrom = 'native.node';
      } catch (e) {
        fallbackError = e;
        loadError = e;
      }
    }

    tryLoad();

    function isAvailable() {
      return native != null;
    }

    function getError() {
      return loadError;
    }

    function get() {
      if (!native) {
        throw new Error('Native module not available. Tried node-gyp-build and fallback path. ' +
          'Require error: ' + (requireError?.message || 'none') +
          ' Fallback error: ' + (fallbackError?.message || 'none'));
      }
      return native;
    }

    function requireNative() {
      if (!native) {
        throw new Error('Native module not available. Tried node-gyp-build and fallback path. ' +
          'Require error: ' + (requireError?.message || 'none') +
          ' Fallback error: ' + (fallbackError?.message || 'none'));
      }
      return native;
    }

    function getLoadedFrom() {
      return loadedFrom;
    }

    module.exports = {
      isAvailable,
      getError,
      get,
      require: requireNative,
      getLoadedFrom,
      get native() {
        if (native) return native;
        return '[Native not available - require: ' + (requireError?.message || 'none') +
          ' fallback: ' + (fallbackError?.message || 'none') + ']';
      }
    };
  }
});

var require_formatter = __commonJS({
  '../work/0xranx__OpenContext/src/core/search/formatter.js'(exports, module) {
    function normalizeResult(result) {
      return {
        path: result.path,
        name: result.name || result.title,
        score: result.score,
        startLine: result.startLine || result.line,
        endLine: result.endLine || result.line,
        startColumn: result.startColumn || result.column,
        endColumn: result.endColumn || result.column,
        matches: result.matches || result.matchCount,
        context: result.context,
        language: result.language,
        size: result.size,
        modified: result.modified,
        created: result.created,
        indexed: result.indexed,
        repository: result.repository,
        branch: result.branch,
        commit: result.commit,
        url: result.url,
        type: result.type
      };
    }

    function normalizeResults(results) {
      return (results || []).map(normalizeResult);
    }

    function formatPlain(query, results, options = {}) {
      var { mode = 'compact', aggregateBy = 'path' } = options;
      if (!results || results.length === 0) {
        return 'No results found for "' + query + '"\n';
      }
      var modeMap = {
        compact: 'compact',
        detailed: 'detailed',
        json: 'json'
      };
      var displayMode = modeMap[mode] || mode;
      var output = 'Results for "' + query + '" (' + results.length + '):\n';
      results.forEach((result, index) => {
        var normalized = normalizeResult(result);
        var aggregateKey = getAggregateKey(normalized);
        if (aggregateBy === 'path') {
          output += formatCompact(index, normalized, aggregateKey);
        } else if (aggregateBy === 'file') {
          output += formatDetailed(index, normalized, aggregateKey);
        } else {
          output += formatFull(index, normalized, aggregateKey);
        }
      });
      return output;
    }

    function getAggregateKey(result) {
      if (result.path) return result.path;
      if (result.repository) return result.repository;
      return 'unknown';
    }

    function formatCompact(index, result, key) {
      return '[' + (index + 1) + '] ' + result.name.slice(0, 50) + ' ' + key +
        ' (score: ' + (result.score || 0) + ')\n\n';
    }

    function formatDetailed(index, result, key) {
      return '[' + (index + 1) + '] ' + result.name.slice(0, 50) + ' ' + key +
        '\n    ' + result.path + '\n\n';
    }

    function formatFull(index, result, key) {
      var context = result.context ? 'Context: ' + result.startLine + '-' + result.endLine : '';
      var matches = result.matches && result.count ? 'Matches: ' + result.count + ')' : '';
      var separator = '─'.repeat(60);
      var content = result.content || '';
      var preview = content.length > 200 ? content.slice(0, 100) + '...' + content.slice(-100) : content;
      return '[' + (index + 1) + '] ' + result.name.slice(0, 50) + ' ' + key +
        '\n    ' + result.path + context + matches + '\n' + separator + '\n' + preview + '\n' + separator + '\n\n';
    }

    function formatJson(query, results, options = {}) {
      var { mode = 'compact', aggregateBy = 'path' } = options;
      return {
        query: query,
        mode: mode,
        aggregate_by: aggregateBy,
        count: results.length,
        results: normalizeResults(results)
      };
    }

    module.exports = {
      normalizeResult,
      normalizeResults,
      formatPlain,
      formatJson
    };
  }
});

var native = require_native();
var { normalizeResults, formatPlain, formatJson } = require_formatter();
var isNativeAvailable = native.isAvailable;
var getNativeError = native.getError;

class NativeSearcher {
  constructor(options = {}) {
    this.threshold = options.threshold ?? 0.7;
    this.contextLines = options.contextLines ?? 0.3;
    this.initialized = false;
    this.searcher = null;
  }

  async initialize(force = false) {
    if (this.initialized && !force) return;
    this.searcher = await native.get().createSearcher().catch(() => null);
    this.initialized = true;
  }

  async search(query, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }
    var { limit = 100, mode = 'compact', aggregateBy = 'path' } = options;
    var params = {
      query: query,
      limit: limit,
      mode: mode,
      aggregateBy: aggregateBy,
      options: options.filters
    };
    var results = await this.searcher.search(params);
    return normalizeResults(results.data);
  }

  format(query, results, options = {}) {
    return formatPlain(query, results, options);
  }

  formatPlain(query, results, options = {}) {
    return formatPlain(query, results, options);
  }

  formatJson(query, results, options = {}) {
    return formatJson(query, results, options);
  }
}

class NativeIndexer {
  constructor(options = {}) {
    this.indexer = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    this.indexer = await native.get().createIndexer().catch(() => null);
    this.initialized = true;
  }

  async index(options = {}) {
    await this.initialize();
    var stats = await this.indexer.index();
    if (options.progress) {
      var progress = { message: 'Indexing...', percent: 0 };
      options.progress(progress);
    }
    return {
      files: stats.files,
      documents: stats.documents,
      status: 'complete',
      errors: stats.errors
    };
  }

  async add(paths) {
    await this.initialize();
    return await this.indexer.add(paths);
  }

  async remove(paths) {
    await this.initialize();
    await this.indexer.remove(paths);
  }

  async update(paths) {
    await this.initialize();
    return await this.indexer.update(paths);
  }

  async clear() {
    await this.initialize();
    await this.indexer.clear();
  }

  async optimize() {
    await this.initialize();
    await this.indexer.optimize();
  }
}

module.exports = {
  isNativeAvailable,
  getNativeError,
  NativeSearcher,
  NativeIndexer
};
