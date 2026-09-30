const path = require('path');

const NO_NATIVE_BINDINGS_MESSAGE = `OpenContext native bindings not available.
  If installed via npm: try reinstalling the package
  If developing locally: cd crates/opencontext-node && npm run build
  If optional deps were skipped: npm install -g @aicontextlab/cli --include=optional`;

function loadNativeBindings() {
  let binding = null;
  let loadError = null;
  let loadedFrom = null;
  let npmError = null;
  let localError = null;

  try {
    binding = require('@aicontextlab/core-native');
    loadedFrom = 'npm';
  } catch (error) {
    npmError = error;

    try {
      binding = require(path.join(__dirname, '../../crates/opencontext-node'));
      loadedFrom = 'local';
    } catch (error) {
      localError = error;
      loadError = error;
    }
  }

  function createUnavailableError() {
    return new Error(
      `${NO_NATIVE_BINDINGS_MESSAGE}\n` +
        `Error (npm): ${npmError?.message || 'unknown'}\n` +
        `Error (local): ${localError?.message || 'unknown'}`,
    );
  }

  return {
    isAvailable() {
      return binding !== null;
    },

    getError() {
      return loadError;
    },

    get() {
      if (!binding) {
        throw createUnavailableError();
      }
      return binding;
    },

    require() {
      if (!binding) {
        throw createUnavailableError();
      }
    },

    getLoadedFrom() {
      return loadedFrom;
    },

    native: binding,
  };
}

const native = loadNativeBindings();

function normalizeResult(result) {
  return {
    score: result.score,
    file_path: result.file_path || result.filePath,
    content: result.content,
    heading_path: result.heading_path || result.headingPath,
    section_title: result.section_title || result.sectionTitle,
    line_start: result.line_start || result.lineStart,
    line_end: result.line_end || result.lineEnd,
    matched_by: result.matched_by || result.matchedBy,
    hit_count: result.hit_count || result.hitCount,
    doc_count: result.doc_count || result.docCount,
    folder_path: result.folder_path || result.folderPath,
    display_name: result.display_name || result.displayName,
    doc_type: result.doc_type || result.docType,
    entry_id: result.entry_id || result.entryId,
    entry_date: result.entry_date || result.entryDate,
    entry_created_at: result.entry_created_at || result.entryCreatedAt,
    idea_box: result.idea_box || result.ideaBox,
  };
}

function normalizeResults(results) {
  return results.map(normalizeResult);
}

function formatMatchType(matchedBy) {
  if (matchedBy === 'vector+keyword') {
    return '[vector+keyword]';
  }
  if (matchedBy === 'vector') {
    return '[vector]';
  }
  return '[keyword]';
}

function formatFolderResult(result, index) {
  return (
    `[${index + 1}] Score: ${result.score.toFixed(4)} ${formatMatchType(result.matched_by)}\n` +
    `📁 ${result.folder_path || result.file_path}\n` +
    `   ${result.doc_count || 0} documents, ${result.hit_count || 0} matches\n\n`
  );
}

function formatDocumentResult(result, index) {
  return (
    `[${index + 1}] Score: ${result.score.toFixed(4)} ${formatMatchType(result.matched_by)}\n` +
    `📄 ${result.file_path}\n` +
    `   ${result.hit_count || 0} matches\n\n`
  );
}

function formatContentResult(result, index) {
  const heading = result.heading_path ? ` > ${result.heading_path}` : '';
  const lines =
    result.line_start && result.line_end
      ? ` (lines ${result.line_start}-${result.line_end})`
      : '';
  const divider = '─'.repeat(40);
  const content =
    result.content.length > 300
      ? `${result.content.slice(0, 300)}...`
      : result.content;

  return (
    `[${index + 1}] Score: ${result.score.toFixed(4)} ${formatMatchType(result.matched_by)}\n` +
    `📄 ${result.file_path}${heading}${lines}\n` +
    `${divider}\n${content}\n${divider}\n\n`
  );
}

function formatResult(result, index, aggregateBy) {
  const normalized = normalizeResult(result);

  if (aggregateBy === 'folder') {
    return formatFolderResult(normalized, index);
  }
  if (aggregateBy === 'doc') {
    return formatDocumentResult(normalized, index);
  }
  return formatContentResult(normalized, index);
}

function formatPlain(query, results, options = {}) {
  const { aggregateBy = 'content', mode = 'hybrid' } = options;

  if (results.length === 0) {
    return `🔍 Search: "${query}"\nNo results found. Try different keywords or run "oc index build" first.`;
  }

  const modeLabel =
    mode === 'hybrid'
      ? 'Hybrid'
      : mode === 'vector'
        ? 'Vector'
        : mode === 'keyword'
          ? 'Keyword'
          : mode;
  let output = `🔍 ${modeLabel} Search: "${query}"\nFound ${results.length} results:\n\n`;

  results.slice(0, 10).forEach((result, index) => {
    output += formatResult(result, index, aggregateBy);
  });

  return output;
}

function formatJson(query, results, options = {}) {
  const { mode = 'hybrid', aggregateBy = 'content' } = options;
  const normalizedResults = normalizeResults(results);

  return {
    query,
    mode,
    aggregate_by: aggregateBy,
    count: normalizedResults.length,
    results: normalizedResults,
  };
}

const isNativeAvailable = native.isAvailable;
const getNativeError = native.getError;

class NativeSearcher {
  constructor(options = {}) {
    this.vectorWeight = options.vectorWeight ?? 0.7;
    this.keywordWeight = options.keywordWeight ?? 0.3;
    this.initialized = false;
    this._searcher = null;
  }

  async initialize() {
    if (this.initialized) {
      return;
    }

    this._searcher = await native.get().Searcher.create();
    this.initialized = true;
  }

  async search(query, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    const {
      limit = 5,
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

    return normalizeResults(response.results || []);
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
    if (this.initialized) {
      return;
    }

    this._indexer = await native.get().Indexer.create();
    this.initialized = true;
  }

  async buildIndex(options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    const result = await this._indexer.buildAll();
    if (options.onProgress) {
      options.onProgress({ phase: 'done', percent: 100 });
    }

    return {
      fileCount: result.totalDocs,
      chunkCount: result.totalChunks,
      mode: 'full',
      elapsedMs: result.elapsedMs,
    };
  }

  async indexFile(filePath) {
    if (!this.initialized) {
      await this.initialize();
    }
    return this._indexer.indexFile(filePath);
  }

  async removeFile(filePath) {
    if (!this.initialized) {
      await this.initialize();
    }
    await this._indexer.removeFile(filePath);
  }

  async indexExists() {
    if (!this.initialized) {
      await this.initialize();
    }
    return this._indexer.indexExists();
  }

  async getStats() {
    if (!this.initialized) {
      await this.initialize();
    }
    return this._indexer.getStats();
  }

  async clean() {
    if (!this.initialized) {
      await this.initialize();
    }
    await this._indexer.clean();
  }
}

module.exports = {
  isNativeAvailable,
  getNativeError,
  NativeSearcher,
  NativeIndexer,
};
