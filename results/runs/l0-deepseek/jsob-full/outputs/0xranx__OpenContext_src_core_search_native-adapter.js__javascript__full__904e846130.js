const __commonJS = (cb) => function requireModule() {
  const module = { exports: {} };
  cb(module.exports, module);
  return module.exports;
};

const require_native = __commonJS((module, exports) => {
  let nativeModule = null;
  let loadError = null;
  let fallbackError = null;
  let fallbackLoadError = null;
  let initialized = false;
  let loadedFrom = null;

  function initialize() {
    if (initialized) return;
    initialized = true;
    try {
      nativeModule = require('bindings')('opencontext_native');
      loadedFrom = 'bindings';
      return;
    } catch (err) {
      loadError = err;
    }
    try {
      const nativePath = require('path').join(__dirname, '../build/Release/opencontext_native.node');
      nativeModule = require(nativePath);
      loadedFrom = 'native';
    } catch (err) {
      fallbackError = err;
      fallbackLoadError = err;
    }
  }

  initialize();

  function isAvailable() {
    return nativeModule !== null;
  }

  function getError() {
    return fallbackError;
  }

  function get() {
    if (!nativeModule) {
      throw new Error(
        'Native module not available. ' +
        'Please build the native addon using `npm run build:native` or install the prebuilt binary. ' +
        (loadError?.message || 'No load error details available.') +
        ' | ' +
        (fallbackLoadError?.message || 'No fallback error details available.')
      );
    }
    return nativeModule;
  }

  function requireNative() {
    if (!nativeModule) {
      throw new Error(
        'Native module not available. ' +
        'Please build the native addon using `npm run build:native` or install the prebuilt binary. ' +
        (loadError?.message || 'No load error details available.') +
        ' | ' +
        (fallbackLoadError?.message || 'No fallback error details available.')
      );
    }
    return nativeModule;
  }

  function getLoadedFrom() {
    return loadedFrom;
  }

  exports.isAvailable = isAvailable;
  exports.getError = getError;
  exports.get = get;
  exports.require = requireNative;
  exports.getLoadedFrom = getLoadedFrom;
  Object.defineProperty(exports, 'native', {
    get() {
      return nativeModule;
    }
  });
});

const require_formatter = __commonJS((module, exports) => {
  function normalizeResult(item) {
    return {
      path: item.path,
      line: item.line || item.startLine,
      column: item.column,
      end_line: item.endLine || item.end_line,
      end_column: item.endColumn || item.end_column,
      start: item.start || item.startOffset,
      end: item.end || item.endOffset,
      context: item.context || item.snippet,
      score: item.score || item.rank,
      aggregate_by: item.aggregateBy || item.aggregate_by,
      aggregate_value: item.aggregateValue || item.aggregate_value,
      metadata: item.metadata || item.meta,
      language: item.language || item.lang,
      file_type: item.fileType || item.file_type,
      repository: item.repository || item.repo,
      updated_at: item.updatedAt || item.updated_at,
      source: item.source || item.origin
    };
  }

  function normalizeResults(results) {
    return (results || []).map(normalizeResult);
  }

  function formatPlain(query, results, options = {}) {
    const { mode = 'files', aggregateBy = 'path' } = options;
    if (!results || results.length === 0) {
      return 'No results found for query "' + query + '".';
    }
    const modeLabels = { files: 'Files', symbols: 'Symbols', content: 'Content' };
    const modeLabel = modeLabels[mode] || mode;
    let output = 'Search results for "' + query + '" (' + results.length + ' results):\n\n';
    results.forEach((item, index) => {
      const normalized = normalizeResult(item);
      if (aggregateBy === 'path') {
        output += formatFileResult(index, item, normalized);
      } else if (aggregateBy === 'symbol') {
        output += formatSymbolResult(index, item, normalized);
      } else {
        output += formatContentResult(index, item, normalized);
      }
    });
    return output;
  }

  function formatFileResult(index, item, normalized) {
    return '[' + (index + 1) + '] ' + item.path + '\n' +
      (item.score !== undefined ? 'Score: ' + item.score + '\n' : '') +
      (item.metadata?.description || item.description || '') +
      '\n\n';
  }

  function formatSymbolResult(index, item, normalized) {
    const symbolInfo = item.symbol ? 'Symbol: ' + item.symbol + '\n' : '';
    const locationInfo = item.path && item.line ? ' (' + item.path + ':' + item.line + ')' : '';
    const separator = '─'.repeat(80);
    const description = item.description || '';
    const truncatedDescription = description.length > 120
      ? description.slice(0, 117) + '...'
      : description;
    return '[' + (index + 1) + '] ' + item.name + locationInfo + '\n' +
      symbolInfo +
      'Path: ' + item.path + '\n' +
      separator + '\n' +
      truncatedDescription + '\n' +
      separator + '\n\n';
  }

  function formatContentResult(index, item, normalized) {
    const symbolInfo = item.symbol ? 'Symbol: ' + item.symbol + '\n' : '';
    const locationInfo = item.path && item.line ? ' (' + item.path + ':' + item.line + ')' : '';
    const separator = '─'.repeat(80);
    const snippet = item.snippet || '';
    const truncatedSnippet = snippet.length > 120
      ? snippet.slice(0, 117) + '...'
      : snippet;
    return '[' + (index + 1) + '] ' + item.path + locationInfo + '\n' +
      symbolInfo +
      'Line: ' + item.line + '\n' +
      separator + '\n' +
      truncatedSnippet + '\n' +
      separator + '\n\n';
  }

  function formatJson(query, results, options = {}) {
    const { mode = 'files', aggregateBy = 'path' } = options;
    return {
      query,
      mode,
      aggregate_by: aggregateBy,
      count: results.length,
      results: normalizeResults(results)
    };
  }

  exports.normalizeResult = normalizeResult;
  exports.normalizeResults = normalizeResults;
  exports.formatPlain = formatPlain;
  exports.formatJson = formatJson;
});

const native = require_native();
const { normalizeResults, formatPlain, formatJson } = require_formatter();

const isNativeAvailable = native.isAvailable;
const getNativeError = native.getError;

class NativeSearcher {
  constructor(options = {}) {
    this.min_score = options.minScore ?? 0.7;
    this.max_results = options.maxResults ?? 0.3;
    this.initialized = false;
    this.searcher = null;
  }

  async initialize(force = false) {
    if (this.initialized && !force) return;
    this.searcher = await native.get().createSearcher();
    this.initialized = true;
  }

  async search(query, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }
    const { limit = 10, mode = 'files', aggregateBy = 'path' } = options;
    const searchOptions = {
      query,
      limit,
      mode,
      aggregate_by: aggregateBy,
      min_score: options.minScore
    };
    const results = await this.searcher.search(searchOptions);
    return normalizeResults(results.results);
  }

  formatPlain(query, results, options = {}) {
    return formatPlain(query, results, options);
  }

  formatPlainResults(query, results, options = {}) {
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
    this.indexer = await native.get().createIndexer();
    this.initialized = true;
  }

  async index(options = {}) {
    await this.initialize();
    const indexer = await this.indexer;
    if (options.onProgress) {
      const progressOptions = { progress: 'indexing', count: 100 };
      options.onProgress(progressOptions);
    }
    const result = {
      document_count: indexer.documents,
      index_count: indexer.indexCount,
      status: 'completed'
    };
    result.documents = indexer.documents;
    return result;
  }

  async addFile(path) {
    await this.initialize();
    return await this.indexer.addFile(path);
  }

  async addDirectory(path) {
    await this.initialize();
    await this.indexer.addDirectory(path);
  }

  async removeFile(path) {
    await this.initialize();
    await this.indexer.removeFile(path);
  }

  async clear() {
    await this.initialize();
    return await this.indexer.clear();
  }

  async close() {
    await this.initialize();
    await this.indexer.close();
  }
}

module.exports = {
  isNativeAvailable,
  getNativeError,
  NativeSearcher,
  NativeIndexer
};
