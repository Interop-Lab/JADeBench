'use strict';

const path = require('path');

let native = null;
let nativeError = null;
let nativeLoadedFrom = null;
let npmNativeError = null;

try {
  native = require('@aicontextlab/core-native');
  nativeLoadedFrom = 'npm';
} catch (npmError) {
  npmNativeError = npmError;
  try {
    native = require(path.join(__dirname, '../../crates/opencontext-node'));
    nativeLoadedFrom = 'local';
  } catch (localError) {
    nativeError = localError;
  }
}

function isNativeAvailable() {
  return native !== null;
}

function getNativeError() {
  return nativeError;
}

function getNative() {
  if (!native) {
    throw new Error(
      'OpenContext native bindings not available.\n' +
      'If installed via npm: try reinstalling the package\n' +
      'If developing locally: cd crates/opencontext-node && npm run build\n' +
      'If optional deps were skipped: npm install -g @aicontextlab/cli --include=optional\n' +
      `Error (npm): ${npmNativeError?.message ?? 'unknown error'}\n` +
      `Error (local): ${nativeError?.message ?? 'unknown error'}`
    );
  }
  return native;
}

function requireNative() {
  return native;
}

function getLoadedFrom() {
  return nativeLoadedFrom;
}

function normalizeResult(result) {
  return {
    score: result.score,
    file_path: result.file_path ?? result.filePath,
    content: result.content,
    heading_path: result.heading_path ?? result.headingPath,
    section_title: result.section_title ?? result.sectionTitle,
    line_start: result.line_start ?? result.lineStart,
    line_end: result.line_end ?? result.lineEnd,
    matched_by: result.matched_by ?? result.matchedBy,
    hit_count: result.hit_count ?? result.hitCount,
    doc_count: result.doc_count ?? result.docCount,
    folder_path: result.folder_path ?? result.folderPath,
    display_name: result.display_name ?? result.displayName,
    doc_type: result.doc_type ?? result.docType,
    entry_id: result.entry_id ?? result.entryId,
    entry_date: result.entry_date ?? result.entryDate,
    entry_created_at: result.entry_created_at ?? result.entryCreatedAt,
    idea_box: result.idea_box ?? result.ideaBox
  };
}

function normalizeResults(results) {
  return Array.isArray(results) ? results.map(normalizeResult) : [];
}

function formatPlain(query, results) {
  const normalized = normalizeResults(results);
  if (normalized.length === 0) {
    return `🔍 Search: "${query}"\nNo results found. Try different keywords or run "oc index build" first.`;
  }

  const lines = [`🔍 Hybrid Search: "${query}"`, `Found ${normalized.length} results:`, ''];
  normalized.forEach((result, index) => {
    const score = typeof result.score === 'number' ? result.score.toFixed(4) : result.score;
    const matchedBy = ` [${result.matched_by || 'keyword'}]`;
    const heading = Array.isArray(result.heading_path) && result.heading_path.length
      ? ` > ${result.heading_path.join(',')}`
      : '';
    const lineRange = result.line_start != null
      ? ` (lines ${result.line_start}-${result.line_end})`
      : '';
    lines.push(`[${index + 1}] Score: ${score}${matchedBy}`);
    lines.push(`📄 ${result.file_path}${heading}${lineRange}`);
    lines.push('────────────────────────────────────────');
    lines.push(result.content);
    lines.push('────────────────────────────────────────');
    lines.push('');
  });
  return lines.join('\n');
}

function formatJson(query, results) {
  const normalized = normalizeResults(results);
  return {
    query,
    mode: 'hybrid',
    aggregate_by: 'content',
    count: normalized.length,
    results: normalized
  };
}

const formatter = { normalizeResult, normalizeResults, formatPlain, formatJson };

class NativeSearcher {
  constructor() {
    this.vectorWeight = 0.7;
    this.keywordWeight = 0.3;
    this.initialized = false;
    this._searcher = null;
  }

  async initialize() {
    if (!this.initialized) {
      this._searcher = await getNative().Searcher.create();
      this.initialized = true;
    }
  }

  async search(query) {
    if (!this.initialized) await this.initialize();
    const results = await this._searcher.search({
      query,
      limit: 5,
      mode: 'hybrid',
      aggregateBy: 'content',
      docType: undefined
    });
    return normalizeResults(results.results);
  }

  formatResults(query, results) {
    return formatPlain(query, results);
  }

  formatResultsPlain(query, results) {
    return formatPlain(query, results);
  }

  formatResultsJson(query, results) {
    return formatJson(query, results);
  }
}

class NativeIndexer {
  constructor() {
    this._indexer = null;
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      this._indexer = await getNative().Indexer.create();
      this.initialized = true;
    }
  }

  async buildIndex() {
    if (!this.initialized) await this.initialize();
    const result = await this._indexer.buildAll();
    return {
      fileCount: result?.totalDocs,
      chunkCount: result?.totalChunks,
      mode: 'full',
      elapsedMs: result?.elapsedMs
    };
  }

  async indexFile(filePath) {
    if (!this.initialized) await this.initialize();
    return this._indexer.indexFile(filePath);
  }

  async removeFile(filePath) {
    if (!this.initialized) await this.initialize();
    await this._indexer.removeFile(filePath);
  }

  async indexExists() {
    if (!this.initialized) await this.initialize();
    return this._indexer.indexExists();
  }

  async getStats() {
    if (!this.initialized) await this.initialize();
    return this._indexer.getStats();
  }

  async clean() {
    if (!this.initialized) await this.initialize();
    await this._indexer.clean();
  }
}

globalThis.NativeSearcher = NativeSearcher;
globalThis.NativeIndexer = NativeIndexer;

module.exports = {
  isNativeAvailable,
  getNativeError,
  NativeSearcher,
  NativeIndexer
};
