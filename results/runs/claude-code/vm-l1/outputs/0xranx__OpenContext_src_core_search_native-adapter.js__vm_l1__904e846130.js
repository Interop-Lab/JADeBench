'use strict';

const path = require('path');

let nativeBinding = null;
let nativeError = null;
let nativeLoadedFrom = null;

const nativeCandidates = [
  ['@aicontextlab/core-native', '@aicontextlab/core-native'],
  [path.join(__dirname, '../../crates/opencontext-node'), path.join(__dirname, '../../crates/opencontext-node')],
];

for (const [modulePath, source] of nativeCandidates) {
  try {
    nativeBinding = require(modulePath);
    nativeLoadedFrom = source;
    break;
  } catch (error) {
    nativeError = error;
  }
}

const native = {
  isAvailable: nativeBinding !== null,
  getError: () => nativeError,
  get() {
    if (!nativeBinding) throw nativeError || new Error('OpenContext native module is not available');
    return nativeBinding;
  },
  getLoadedFrom: () => nativeLoadedFrom,
};

function normalizeResult(result) {
  const normalized = {
    score: result.score,
    file_path: result.filePath,
    content: result.content,
    doc_type: result.docType,
  };
  if (result.startLine !== undefined) normalized.start_line = result.startLine;
  if (result.endLine !== undefined) normalized.end_line = result.endLine;
  if (result.matchType !== undefined) normalized.match_type = result.matchType;
  if (result.vectorScore !== undefined) normalized.vector_score = result.vectorScore;
  if (result.keywordScore !== undefined) normalized.keyword_score = result.keywordScore;
  return normalized;
}

function normalizeResults(results) {
  return results.map(normalizeResult);
}

function formatPlain(query, results, options = {}) {
  const mode = options.mode || 'hybrid';
  const modeName = mode.charAt(0).toUpperCase() + mode.slice(1);
  if (results.length === 0) {
    return `🔍 Search: "${query}"\nNo results found. Try different keywords or run "oc index build" first.`;
  }

  let output = `🔍 ${modeName} Search: "${query}"\nFound ${results.length} results:\n\n`;
  for (let index = 0; index < results.length; index++) {
    const result = results[index];
    output += `[${index + 1}] Score: ${result.score.toFixed(4)} [${result.matchType || 'keyword'}]\n`;
    output += `📄 ${result.filePath}`;
    if (result.startLine !== undefined) {
      output += result.endLine !== undefined && result.endLine !== result.startLine
        ? `:${result.startLine}-${result.endLine}`
        : `:${result.startLine}`;
    }
    output += `\n────────────────────────────────────────\n${result.content}\n`;
    output += '────────────────────────────────────────\n\n';
  }
  return output;
}

function formatJson(query, results, options = {}) {
  return {
    query,
    mode: options.mode || 'hybrid',
    aggregate_by: options.aggregateBy || 'content',
    count: results.length,
    results: normalizeResults(results),
  };
}

class NativeSearcher {
  constructor() {
    this.vectorWeight = 0.7;
    this.keywordWeight = 0.3;
    this.initialized = false;
    this._searcher = null;
  }

  async initialize() {
    if (this.initialized) return;
    const binding = native.get();
    this._searcher = await binding.Searcher.create({
      vectorWeight: this.vectorWeight,
      keywordWeight: this.keywordWeight,
    });
    this.initialized = true;
  }

  async search(query, options = {}) {
    await this.initialize();
    const searchOptions = {
      query,
      limit: options.limit || 5,
      mode: options.mode || 'hybrid',
      aggregateBy: options.aggregateBy || 'content',
    };
    if (options.docType !== undefined) searchOptions.docType = options.docType;
    const { results } = await this._searcher.search(searchOptions);
    return normalizeResults(results);
  }

  formatResults(query, results, options) {
    return formatPlain(query, results, options);
  }

  formatResultsPlain(query, results, options) {
    return formatPlain(query, results, options);
  }

  formatResultsJson(query, results, options) {
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
    const binding = native.get();
    this._indexer = await binding.Indexer.create();
    this.initialized = true;
  }

  async buildIndex(options = {}) {
    await this.initialize();
    const result = await this._indexer.buildAll(options);
    if (options.onProgress) {
      options.onProgress({
        phase: 'done',
        percent: 100,
        totalDocs: result.fileCount,
        totalChunks: result.chunkCount,
      });
    }
    return { ...result, mode: 'full', elapsedMs: result.elapsedMs };
  }

  async indexFile(filePath) {
    await this.initialize();
    return this._indexer.indexFile(filePath);
  }

  async removeFile(filePath) {
    await this.initialize();
    return this._indexer.removeFile(filePath);
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
    return this._indexer.clean();
  }
}

const isNativeAvailable = native.isAvailable;
const getNativeError = native.getError;

module.exports = { isNativeAvailable, getNativeError, NativeSearcher, NativeIndexer };
