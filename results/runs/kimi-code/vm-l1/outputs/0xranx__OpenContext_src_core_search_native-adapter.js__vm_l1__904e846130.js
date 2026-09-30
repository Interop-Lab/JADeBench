'use strict';

const path = require('path');

let nativeBinding = null;
let npmLoadError = null;
let localLoadError = null;
let loadedFrom = null;

try {
  nativeBinding = require('@aicontextlab/core-native');
  loadedFrom = 'npm';
} catch (error) {
  npmLoadError = error;
  try {
    nativeBinding = require(path.join(__dirname, '../../crates/opencontext-node'));
    loadedFrom = 'local';
  } catch (localError) {
    localLoadError = localError;
  }
}

const native = {
  isAvailable: nativeBinding !== null,
  getError() {
    return npmLoadError ?? localLoadError;
  },
  getLoadedFrom() {
    return loadedFrom;
  },
  get() {
    if (nativeBinding) return nativeBinding;
    const npmMessage = npmLoadError?.message ?? 'unknown';
    const localMessage = localLoadError?.message ?? 'unknown';
    throw new Error(
      'OpenContext native bindings not available.\n'
      + '  If installed via npm: try reinstalling the package\n'
      + '  If developing locally: cd crates/opencontext-node && npm run build\n'
      + '  If optional deps were skipped: npm install -g @aicontextlab/cli --include=optional\n'
      + `Error (npm): ${npmMessage}\nError (local): ${localMessage}`,
    );
  },
};

const isNativeAvailable = native.isAvailable;
const getNativeError = native.getError;

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
    idea_box: result.idea_box ?? result.ideaBox,
  };
}

function normalizeResults(results) {
  const values = Array.isArray(results) ? results : results?.results ?? [];
  return values.map(normalizeResult);
}

function matchLabel(matchedBy) {
  if (matchedBy === 'vector+keyword') return '[vector+keyword]';
  if (matchedBy === 'vector') return '[vector]';
  return '[keyword]';
}

function formatFolderResult(result) {
  return `[${matchLabel(result.matched_by)}] Score: ${result.score.toFixed(4)} `
    + `\n📁 ${result.folder_path ?? result.file_path}`
    + `\n   ${result.doc_count ?? 0} documents, ${result.hit_count} matches\n\n`;
}

function formatDocumentResult(result) {
  return `[${matchLabel(result.matched_by)}] Score: ${result.score.toFixed(4)} `
    + `\n📄 ${result.file_path}`
    + `\n   ${result.hit_count ?? 0} matches\n\n`;
}

function formatContentResult(result) {
  const heading = result.heading_path ? result.heading_path.join(' > ') : '';
  const lines = result.line_start && result.line_end
    ? ` (lines ${result.line_start}-${result.line_end})`
    : '';
  const divider = '─'.repeat(40);
  const content = result.content.length > 300
    ? `${result.content.slice(0, 300)}...`
    : result.content;

  return `[${matchLabel(result.matched_by)}] Score: ${result.score.toFixed(4)} `
    + `\n📄 ${result.file_path}${lines}`
    + `\n${heading}\n${divider}\n${content}\n\n`;
}

function formatPlain(results, options = {}) {
  const aggregateBy = options.aggregateBy ?? 'content';
  const mode = options.mode ?? 'hybrid';
  const normalized = normalizeResults(results);
  const modeLabel = mode === 'hybrid' ? 'Hybrid' : mode === 'vector' ? 'Vector' : 'Keyword';
  const query = options.query ?? '';

  if (normalized.length === 0) {
    return `🔍 Search: "${query}"\nNo results found. Try different keywords or run "oc index build" first.`;
  }

  let output = `🔍 ${modeLabel} Search: "${query}"\nFound ${normalized.length} results:\n\n`;
  for (const result of normalized) {
    if (aggregateBy === 'folder') output += formatFolderResult(result);
    else if (aggregateBy === 'doc') output += formatDocumentResult(result);
    else output += formatContentResult(result);
  }
  return output;
}

function formatJson(results, options = {}) {
  const normalized = normalizeResults(results);
  return JSON.stringify({
    query: options.query,
    mode: options.mode ?? 'hybrid',
    aggregate_by: options.aggregateBy ?? 'content',
    count: normalized.length,
    results: normalized,
  }, null, 2);
}

class NativeSearcher {
  constructor(options = {}) {
    this.vectorWeight = options.vectorWeight ?? 0.7;
    this.keywordWeight = options.keywordWeight ?? 0.3;
    this.initialized = false;
    this._searcher = null;
  }

  async initialize() {
    if (this.initialized) return;
    this._searcher = await native.get().Searcher.create();
    this.initialized = true;
  }

  async search(query, options = {}) {
    if (!this.initialized) await this.initialize();

    const searchOptions = {
      query,
      limit: options.limit ?? 5,
      mode: options.mode ?? 'hybrid',
      aggregateBy: options.aggregateBy ?? 'content',
      docType: options.docType,
    };

    const results = await this._searcher.search(searchOptions);
    return normalizeResults(results);
  }

  formatResults(results, options) {
    return formatPlain(results, options);
  }

  formatResultsPlain(results, options) {
    return formatPlain(results, options);
  }

  formatResultsJson(results, options) {
    return formatJson(results, options);
  }
}

class NativeIndexer {
  constructor() {
    this._indexer = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    this._indexer = await native.get().Indexer.create();
    this.initialized = true;
  }

  async buildIndex(options = {}) {
    await this.initialize();
    const stats = await this._indexer.buildAll();
    if (options.onProgress) options.onProgress({ phase: 'done', percent: 100 });
    return {
      fileCount: stats.totalDocs,
      chunkCount: stats.totalChunks,
      mode: 'full',
      elapsedMs: stats.elapsedMs,
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
