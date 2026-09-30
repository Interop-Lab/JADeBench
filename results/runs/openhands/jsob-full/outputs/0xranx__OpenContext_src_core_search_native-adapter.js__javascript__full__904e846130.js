const path = require("path");

let nativeBinding = null;
let nativeError = null;
let npmLoadError = null;
let localLoadError = null;
let nativeLoadAttempted = false;
let nativeLoadedFrom = null;

const NATIVE_UNAVAILABLE_MESSAGE =
  "OpenContext native bindings not available.\n" +
  "  If installed via npm: try reinstalling the package\n" +
  "  If developing locally: cd crates/opencontext-node && npm run build\n" +
  "  If optional deps were skipped: npm install -g @aicontextlab/cli --include=optional\n";

function loadNativeBinding() {
  if (nativeLoadAttempted) return;
  nativeLoadAttempted = true;

  try {
    nativeBinding = require("@aicontextlab/core-native");
    nativeLoadedFrom = "npm";
    return;
  } catch (error) {
    npmLoadError = error;
  }

  try {
    const localBindingPath = path.join(__dirname, "../../crates/opencontext-node");
    nativeBinding = require(localBindingPath);
    nativeLoadedFrom = "local";
  } catch (error) {
    localLoadError = error;
    nativeError = error;
  }
}

function nativeUnavailableError() {
  return new Error(
    NATIVE_UNAVAILABLE_MESSAGE +
      `Error (npm): ${npmLoadError?.message || "unknown"}\n` +
      `Error (local): ${localLoadError?.message || "unknown"}`,
  );
}

function isNativeAvailable() {
  return nativeBinding !== null;
}

function getNativeError() {
  return nativeError;
}

function getNativeBinding() {
  if (!nativeBinding) throw nativeUnavailableError();
  return nativeBinding;
}

function requireNativeBinding() {
  if (!nativeBinding) throw nativeUnavailableError();
}

function getNativeLoadedFrom() {
  return nativeLoadedFrom;
}

loadNativeBinding();

const native = {
  isAvailable: isNativeAvailable,
  getError: getNativeError,
  get: getNativeBinding,
  require: requireNativeBinding,
  getLoadedFrom: getNativeLoadedFrom,
  get native() {
    return nativeBinding;
  },
};

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
  return (results || []).map(normalizeResult);
}

function formatMatchType(matchedBy) {
  if (matchedBy === "vector+keyword") return "[vector+keyword]";
  if (matchedBy === "vector") return "[vector]";
  return "[keyword]";
}

function formatFolderResult(index, result, matchType) {
  return (
    `[${index + 1}] Score: ${result.score.toFixed(4)} ${matchType}\n` +
    `📁 ${result.folder_path || result.file_path}\n` +
    `   ${result.doc_count || 0} documents, ${result.hit_count || 0} matches\n\n`
  );
}

function formatDocumentResult(index, result, matchType) {
  return (
    `[${index + 1}] Score: ${result.score.toFixed(4)} ${matchType}\n` +
    `📄 ${result.file_path}\n` +
    `   ${result.hit_count || 0} matches\n\n`
  );
}

function formatContentResult(index, result, matchType) {
  const heading = result.heading_path ? ` > ${result.heading_path}` : "";
  const lines =
    result.line_start && result.line_end
      ? ` (lines ${result.line_start}-${result.line_end})`
      : "";
  const separator = "─".repeat(40);
  const content = result.content || "";
  const preview = content.length > 300 ? `${content.slice(0, 300)}...` : content;

  return (
    `[${index + 1}] Score: ${result.score.toFixed(4)} ${matchType}\n` +
    `📄 ${result.file_path}${heading}${lines}\n` +
    `${separator}\n${preview}\n${separator}\n\n`
  );
}

function formatPlain(query, results, options = {}) {
  const { mode = "hybrid", aggregateBy = "content" } = options;

  if (!results || results.length === 0) {
    return `🔍 Search: "${query}"\nNo results found. Try different keywords or run "oc index build" first.`;
  }

  const modeLabels = {
    hybrid: "Hybrid",
    vector: "Vector",
    keyword: "Keyword",
  };
  const modeLabel = modeLabels[mode] || mode;
  let output = `🔍 ${modeLabel} Search: "${query}"\nFound ${results.length} results:\n\n`;

  results.forEach((rawResult, index) => {
    const result = normalizeResult(rawResult);
    const matchType = formatMatchType(result.matched_by);

    if (aggregateBy === "folder") {
      output += formatFolderResult(index, result, matchType);
    } else if (aggregateBy === "doc") {
      output += formatDocumentResult(index, result, matchType);
    } else {
      output += formatContentResult(index, result, matchType);
    }
  });

  return output;
}

function formatJson(query, results, options = {}) {
  const { mode = "hybrid", aggregateBy = "content" } = options;
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
    this.vectorWeight = options.vectorWeight ?? 0.7;
    this.keywordWeight = options.keywordWeight ?? 0.3;
    this.initialized = false;
    this._searcher = null;
  }

  async initialize(force = false) {
    if (this.initialized && !force) return;
    this._searcher = await native.get().Searcher.create();
    this.initialized = true;
  }

  async search(query, options = {}) {
    if (!this.initialized) await this.initialize();

    const { limit = 5, mode = "hybrid", aggregateBy = "content" } = options;
    const response = await this._searcher.search({
      query,
      limit,
      mode,
      aggregateBy,
      docType: options.docType,
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
  constructor(_options = {}) {
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
    const result = await this._indexer.buildAll();

    if (options.onProgress) {
      options.onProgress({ phase: "done", percent: 100 });
    }

    return {
      fileCount: result.totalDocs,
      chunkCount: result.totalChunks,
      mode: "full",
      elapsedMs: result.elapsedMs,
    };
  }

  async indexFile(filePath) {
    await this.initialize();
    return await this._indexer.indexFile(filePath);
  }

  async removeFile(filePath) {
    await this.initialize();
    await this._indexer.removeFile(filePath);
  }

  async indexExists() {
    await this.initialize();
    return await this._indexer.indexExists();
  }

  async getStats() {
    await this.initialize();
    return await this._indexer.getStats();
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
