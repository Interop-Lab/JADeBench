// Deobfuscated from subject.cjs.
// Provides a small CommonJS wrapper around the optional OpenContext native binding.

const path = require("path");

let nativeBinding = null;
let npmError = null;
let localError = null;
let loadedFrom = null;
let attemptedLoad = false;

function loadNative() {
  if (attemptedLoad) return;
  attemptedLoad = true;

  try {
    nativeBinding = require("@aicontextlab/core-native");
    loadedFrom = "npm";
    return;
  } catch (error) {
    npmError = error;
  }

  try {
    const localBindingPath = path.join(__dirname, "../../crates/opencontext-node");
    nativeBinding = require(localBindingPath);
    loadedFrom = "local";
  } catch (error) {
    localError = error;
  }
}

loadNative();

function nativeUnavailableError() {
  return new Error(
    "OpenContext native bindings not available.\n" +
      "  If installed via npm: try reinstalling the package\n" +
      "  If developing locally: cd crates/opencontext-node && npm run build\n" +
      "  If optional deps were skipped: npm install -g @aicontextlab/cli --include=optional\n" +
      "Error (npm): " +
      (npmError?.message || "unknown") +
      "\nError (local): " +
      (localError?.message || "unknown")
  );
}

function getNative() {
  if (!nativeBinding) throw nativeUnavailableError();
  return nativeBinding;
}

const native = {
  isAvailable() {
    return nativeBinding !== null;
  },
  getError() {
    return localError;
  },
  get() {
    return getNative();
  },
  require() {
    if (!nativeBinding) throw nativeUnavailableError();
  },
  getLoadedFrom() {
    return loadedFrom;
  },
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

function matchedByLabel(matchedBy) {
  if (matchedBy === "vector+keyword") return "[vector+keyword]";
  if (matchedBy === "vector") return "[vector]";
  return "[keyword]";
}

function formatFolderResult(index, result, matchedBy) {
  return (
    "[" +
    (index + 1) +
    "] Score: " +
    result.score.toFixed(4) +
    " " +
    matchedBy +
    "\n📁 " +
    (result.folder_path || result.file_path) +
    "\n   " +
    (result.doc_count || 0) +
    " documents, " +
    (result.hit_count || 0) +
    " matches\n\n"
  );
}

function formatDocumentResult(index, result, matchedBy) {
  return (
    "[" +
    (index + 1) +
    "] Score: " +
    result.score.toFixed(4) +
    " " +
    matchedBy +
    "\n📄 " +
    result.file_path +
    "\n   " +
    (result.hit_count || 0) +
    " matches\n\n"
  );
}

function formatDefaultResult(index, result, matchedBy) {
  const heading = result.heading_path ? " > " + result.heading_path : "";
  const lines = result.line_start && result.line_end ? " (lines " + result.line_start + "-" + result.line_end + ")" : "";
  const separator = "─".repeat(40);
  const content = result.content || "";
  const displayContent = content.length > 300 ? content.slice(0, 300) + "..." : content;
  return (
    "[" +
    (index + 1) +
    "] Score: " +
    result.score.toFixed(4) +
    " " +
    matchedBy +
    "\n📄 " +
    result.file_path +
    heading +
    lines +
    "\n" +
    separator +
    "\n" +
    displayContent +
    "\n" +
    separator +
    "\n\n"
  );
}

function formatPlain(query, results, options = {}) {
  const { mode = "hybrid", aggregateBy = "content" } = options;

  if (!results || results.length === 0) {
    return '🔍 Search: "' + query + '"\nNo results found. Try different keywords or run "oc index build" first.';
  }

  const modeNames = { hybrid: "Hybrid", vector: "Vector", keyword: "Keyword" };
  const modeName = modeNames[mode] || mode;
  let output = '🔍 ' + modeName + ' Search: "' + query + '"\nFound ' + results.length + " results:\n\n";

  results.forEach((rawResult, index) => {
    const result = normalizeResult(rawResult);
    const label = matchedByLabel(result.matched_by);

    if (aggregateBy === "folder") {
      output += formatFolderResult(index, result, label);
    } else if (aggregateBy === "doc") {
      output += formatDocumentResult(index, result, label);
    } else {
      output += formatDefaultResult(index, result, label);
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
    const searchOptions = {
      query,
      limit,
      mode,
      aggregateBy,
      docType: options.docType,
    };
    const result = await this._searcher.search(searchOptions);
    return normalizeResults(result.results);
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
  constructor(options = {}) {
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
  isNativeAvailable: native.isAvailable,
  getNativeError: native.getError,
  NativeSearcher,
  NativeIndexer,
};
