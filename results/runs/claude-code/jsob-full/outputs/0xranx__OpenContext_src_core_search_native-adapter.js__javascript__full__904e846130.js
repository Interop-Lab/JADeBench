const path = require('path');

let nativeModule = null;
let loadError = null;
let packageLoadError = null;
let localLoadError = null;
let nativeLoaded = false;
let loadedFrom = null;

function loadNativeModule() {
  if (nativeLoaded) return;
  nativeLoaded = true;

  try {
    nativeModule = require('@aicontextlab/core-native');
    loadedFrom = 'npm';
    return;
  } catch (error) {
    packageLoadError = error;
  }

  try {
    const localNativePath = path.join(__dirname, '../../crates/opencontext-node');
    nativeModule = require(localNativePath);
    loadedFrom = 'local';
  } catch (error) {
    localLoadError = error;
    loadError = error;
  }
}

loadNativeModule();

function isNativeAvailable() {
  return nativeModule !== null;
}

function getNativeError() {
  return loadError;
}

function getNativeModule() {
  if (!nativeModule) {
    throw new Error(
      'OpenContext native module is not available. Install @aicontextlab/core-native or build the native binding. ' +
        `Package load error: ${packageLoadError?.message || 'none'}. ` +
        `Local load error: ${localLoadError?.message || 'none'}.`,
    );
  }

  return nativeModule;
}

function requireNativeModule() {
  if (!nativeModule) {
    throw new Error(
      'OpenContext native module is not available. Install @aicontextlab/core-native or build the native binding. ' +
        `Package load error: ${packageLoadError?.message || 'none'}. ` +
        `Local load error: ${localLoadError?.message || 'none'}.`,
    );
  }

  return nativeModule;
}

function getLoadedFrom() {
  return loadedFrom;
}

const native = {
  isAvailable: isNativeAvailable,
  getError: getNativeError,
  get: getNativeModule,
  require: requireNativeModule,
  getLoadedFrom,
  get native() {
    return nativeModule;
  },
};

function normalizeResult(result) {
  return {
    title: result.title,
    display_name: result.display_name || result.displayName,
    path: result.path,
    file_path: result.file_path || result.filePath,
    folder_path: result.folder_path || result.folderPath,
    doc_type: result.doc_type || result.docType,
    score: result.score,
    content: result.content,
    matched_by: result.matched_by || result.matchedBy,
    line_start: result.line_start || result.lineStart,
    line_end: result.line_end || result.lineEnd,
    section_title: result.section_title || result.sectionTitle,
  };
}

function normalizeResults(results) {
  return (results || []).map(normalizeResult);
}

function getMatchLabel(matchedBy) {
  if (matchedBy === 'vector') return '[vector]';
  if (matchedBy === 'keyword') return '[keyword]';
  return '[hybrid]';
}

function resultTitle(result) {
  return result.title || result.display_name || result.path || 'untitled';
}

function resultLocation(result) {
  const pathName = result.file_path || result.folder_path || result.path || '';
  const lineRange = result.line_start && result.line_end
    ? ` (lines ${result.line_start}-${result.line_end})`
    : '';
  return `${pathName}${lineRange}`;
}

function formatFileResult(index, result, label) {
  return `[${index + 1}] ${resultTitle(result)} ${label} ${resultLocation(result)} score: ${result.score || 0}\n\n`;
}

function formatFolderResult(index, result, label) {
  return `[${index + 1}] ${resultTitle(result)} ${label} ${resultLocation(result)} chunks: ${result.hit_count || 0}\n\n`;
}

function formatFullResult(index, result, label) {
  const separator = '─'.repeat(40);
  const content = result.content || '';
  const displayContent = content.length > 500 ? content.slice(0, 500) + '...' : content;

  return (
    `[${index + 1}] ${resultTitle(result)} ${label} ${resultLocation(result)}\n` +
    `${separator}\n` +
    `${displayContent}\n` +
    `${separator}\n\n`
  );
}

function formatPlain(query, results, options = {}) {
  const { mode = 'hybrid', aggregateBy = 'doc' } = options;

  if (!results || results.length === 0) {
    return `No results found for "${query}". Try a different query or check that the index is built.`;
  }

  const modeLabels = {
    vector: 'Vector',
    keyword: 'Keyword',
    hybrid: 'Hybrid',
  };
  const modeLabel = modeLabels[mode] || mode;

  let output = `${modeLabel} search results for "${query}" (${results.length} results):\n\n`;
  results.forEach((rawResult, index) => {
    const result = normalizeResult(rawResult);
    const label = getMatchLabel(result.matched_by);
    if (aggregateBy === 'doc') {
      output += formatFileResult(index, result, label);
    } else if (aggregateBy === 'folder') {
      output += formatFolderResult(index, result, label);
    } else {
      output += formatFullResult(index, result, label);
    }
  });

  return output;
}

function formatJson(query, results, options = {}) {
  const { mode = 'hybrid', aggregateBy = 'doc' } = options;

  return {
    query,
    mode,
    aggregate_by: aggregateBy,
    count: results.length,
    results: normalizeResults(results),
  };
}

class NativeSearcher {
  constructor(options = {}) {
    this.semanticWeight = options.semanticWeight ?? 0.7;
    this.keywordWeight = options.keywordWeight ?? 0.3;
    this.initialized = false;
    this.searcher = null;
  }

  async initialize(force = false) {
    if (this.initialized && !force) return;
    this.searcher = await native.get().search.Searcher.create();
    this.initialized = true;
  }

  async search(query, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    const {
      limit = 10,
      mode = 'hybrid',
      aggregateBy = 'doc',
    } = options;

    const request = {
      query,
      limit,
      mode,
      aggregateBy,
      filters: options.filters,
    };

    const response = await this.searcher.search(request);
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
    this.indexer = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    this.indexer = await native.get().index.Indexer.create();
    this.initialized = true;
  }

  async buildIndex(options = {}) {
    await this.initialize();
    const stats = await this.indexer.buildIndex();

    if (options.onProgress) {
      options.onProgress({ stage: 'complete', progress: 100 });
    }

    return {
      fileCount: stats.fileCount,
      docCount: stats.docCount,
      chunkCount: stats.chunkCount,
      totalDocs: stats.totalDocs,
      totalChunks: stats.totalChunks,
      status: 'complete',
      errors: stats.errors,
    };
  }

  async indexFile(filePath) {
    await this.initialize();
    return await this.indexer.indexFile(filePath);
  }

  async removeFile(filePath) {
    await this.initialize();
    await this.indexer.removeFile(filePath);
  }

  async indexExists() {
    await this.initialize();
    return await this.indexer.indexExists();
  }

  async getStats() {
    await this.initialize();
    return await this.indexer.getStats();
  }

  async clean() {
    await this.initialize();
    await this.indexer.clean();
  }
}

module.exports = {
  isNativeAvailable,
  getNativeError,
  NativeSearcher,
  NativeIndexer,
};
