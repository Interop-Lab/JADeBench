'use strict';

const path = require('path');

let nativeBinding = null;
let packageLoadError = null;
let localLoadError = null;
let nativeError = null;
let nativeLoadAttempted = false;

function loadNativeBinding() {
  if (nativeLoadAttempted) return;
  nativeLoadAttempted = true;

  try {
    nativeBinding = require('@aicontextlab/core-native');
    return;
  } catch (error) {
    packageLoadError = error;
  }

  try {
    const localBindingPath = path.join(__dirname, '../../crates/opencontext-node');
    nativeBinding = require(localBindingPath);
  } catch (error) {
    localLoadError = error;
    nativeError = error;
  }
}

loadNativeBinding();

function isNativeAvailable() {
  return nativeBinding !== null;
}

function getNativeError() {
  return nativeError;
}

function requireNative() {
  if (!nativeBinding) {
    throw new Error(
      'OpenContext native bindings not available.\n'
        + '  If installed via npm: try reinstalling the package\n'
        + '  If developing locally: cd crates/opencontext-node && npm run build\n'
        + '  If optional deps were skipped: npm install -g @aicontextlab/cli --include=optional\n'
        + `Error (npm): ${packageLoadError?.message || 'unknown error'}\n`
        + `Error (local): ${localLoadError?.message || 'unknown error'}`,
    );
  }
  return nativeBinding;
}

function normalizeResult(result) {
  return {
    score: result.score,
    file_path: result.file_path || result.filePath,
    content: result.content,
    line_start: result.line_start || result.lineStart,
    line_end: result.line_end || result.lineEnd,
    folder_path: result.folder_path || result.folderPath,
    doc_type: result.doc_type || result.docType,
  };
}

function normalizeResults(results) {
  return (results || []).map(normalizeResult);
}

function compactResult(result) {
  return Object.fromEntries(
    Object.entries(normalizeResult(result)).filter(([, value]) => value !== undefined),
  );
}

function formatResult(index, result) {
  const normalized = normalizeResult(result);
  const score = Number(normalized.score || 0).toFixed(4);
  const lineRange = normalized.line_start
    ? ` (lines ${normalized.line_start}${normalized.line_end ? `-${normalized.line_end}` : ''})`
    : '';
  const separator = '─'.repeat(40);
  const content = normalized.content || '';

  return `[${index + 1}] Score: ${score} [keyword]\n`
    + `📄 ${normalized.file_path}${lineRange}\n`
    + `${separator}\n${content}\n${separator}\n\n`;
}

function formatFolderResult(index, result) {
  const normalized = normalizeResult(result);
  const score = Number(normalized.score || 0).toFixed(4);
  const documentCount = result.doc_count || result.docCount || 0;
  const matchCount = result.hit_count || result.hitCount || 0;
  return `[${index + 1}] Score: ${score} [keyword]\n`
    + `📁 ${normalized.folder_path}\n`
    + `   ${documentCount} documents, ${matchCount} matches\n\n`;
}

function formatPlain(query, results, options = {}) {
  const { mode = 'hybrid', aggregateBy = 'content' } = options;
  if (!results || results.length === 0) {
    return `🔍 Search: "${query}"\nNo results found. Try different keywords or run "oc index build" first.`;
  }

  const modeNames = { hybrid: 'Hybrid', vector: 'Vector', keyword: 'Keyword' };
  let output = `🔍 ${modeNames[mode] || mode} Search: "${query}"\nFound ${results.length} results:\n\n`;
  results.forEach((result, index) => {
    output += aggregateBy === 'folder'
      ? formatFolderResult(index, result)
      : formatResult(index, result);
  });
  return output;
}

function formatJson(query, results, options = {}) {
  const { mode = 'hybrid', aggregateBy = 'content' } = options;
  return {
    query,
    mode,
    aggregate_by: aggregateBy,
    count: results.length,
    results: results.map(compactResult),
  };
}

class NativeSearcher {
  constructor(options = {}) {
    this.vectorWeight = options.vectorWeight ?? 0.7;
    this.keywordWeight = options.keywordWeight ?? 0.3;
    this.initialized = false;
    this._searcher = null;
  }

  async initialize(force = false) {
    if (this.initialized && !force) return;
    this._searcher = await requireNative().Searcher.create();
    this.initialized = true;
  }

  async search(query, options = {}) {
    if (!this.initialized) await this.initialize();

    const {
      limit = 10,
      mode = 'hybrid',
      aggregateBy = 'content',
      docType,
    } = options;
    const response = await this._searcher.search({
      query,
      limit,
      mode,
      aggregateBy,
      docType,
    });
    return normalizeResults(response.results);
  }

  formatResults(query, results, options = {}) {
    return formatPlain(query, results, options);
  }

  formatResultsPlain(query, results, options = {}) {
    return formatPlain(query, results, options);
  }

  formatResultsJson(query, results, options = {}) {
    return formatJson(query, results, options);
  }
}

class NativeIndexer {
  constructor() {
    this._indexer = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    this._indexer = await requireNative().Indexer.create();
    this.initialized = true;
  }

  async buildIndex(options = {}) {
    await this.initialize();
    const result = await this._indexer.buildAll();
    options.onProgress?.({ phase: 'done', percent: 100 });
    return {
      fileCount: result.totalDocs,
      chunkCount: result.totalChunks,
      mode: 'full',
      elapsedMs: result.elapsedMs,
    };
  }

  async indexFile(relativePath) {
    await this.initialize();
    return this._indexer.indexFile(relativePath);
  }

  async removeFile(relativePath) {
    await this.initialize();
    await this._indexer.removeFile(relativePath);
  }

  async indexExists() {
    await this.initialize();
    return this._indexer.indexExists();
  }

  async getStats() {
    await this.initialize();
    return this._indexer.getStats();
  }

  async clean() {
    await this.initialize();
    await this._indexer.clean();
  }
}

module.exports = {
  isNativeAvailable,
  getNativeError,
  NativeSearcher,
  NativeIndexer,
};
