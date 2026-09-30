var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../work/0xranx__OpenContext/src/core/native.js
var require_native = __commonJS({
  "../work/0xranx__OpenContext/src/core/native.js"(exports2, module2) {
    var path = require("path");
    var native2 = null;
    var nativeError = null;
    var npmError = null;
    var localError = null;
    var initialized = false;
    var loadedFrom = null;
    function loadNative() {
      if (initialized) return;
      initialized = true;
      try {
        native2 = require("@aicontextlab/core-native");
        loadedFrom = "npm";
        return;
      } catch (e) {
        npmError = e;
      }
      try {
        const nativePath = path.join(__dirname, "../../crates/opencontext-node");
        native2 = require(nativePath);
        loadedFrom = "local";
      } catch (e) {
        localError = e;
        nativeError = e;
      }
    }
    loadNative();
    function isAvailable() {
      return native2 !== null;
    }
    function getError() {
      return nativeError;
    }
    function get() {
      if (!native2) {
        throw new Error(
          `OpenContext native bindings not available.
  If installed via npm: try reinstalling the package
  If developing locally: cd crates/opencontext-node && npm run build
  If optional deps were skipped: npm install -g @aicontextlab/cli --include=optional
Error (npm): ${npmError?.message || "unknown"}
Error (local): ${localError?.message || "unknown"}`
        );
      }
      return native2;
    }
    function require_() {
      if (!native2) {
        throw new Error(
          `OpenContext native bindings not available.
  If installed via npm: try reinstalling the package
  If developing locally: cd crates/opencontext-node && npm run build
  If optional deps were skipped: npm install -g @aicontextlab/cli --include=optional
Error (npm): ${npmError?.message || "unknown"}
Error (local): ${localError?.message || "unknown"}`
        );
      }
    }
    function getLoadedFrom() {
      return loadedFrom;
    }
    module2.exports = {
      isAvailable,
      getError,
      get,
      require: require_,
      getLoadedFrom,
      // Direct access (for advanced use)
      get native() {
        return native2;
      }
    };
  }
});

// ../work/0xranx__OpenContext/src/core/search/formatter.js
var require_formatter = __commonJS({
  "../work/0xranx__OpenContext/src/core/search/formatter.js"(exports2, module2) {
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
        idea_box: result.idea_box || result.ideaBox
      };
    }
    function normalizeResults2(results) {
      return (results || []).map(normalizeResult);
    }
    function formatPlain2(query, results, options = {}) {
      const { mode = "hybrid", aggregateBy = "content" } = options;
      if (!results || results.length === 0) {
        return `\u{1F50D} Search: "${query}"
No results found. Try different keywords or run "oc index build" first.`;
      }
      const modeLabel = { hybrid: "Hybrid", vector: "Vector", keyword: "Keyword" }[mode] || mode;
      let output = `\u{1F50D} ${modeLabel} Search: "${query}"
Found ${results.length} results:

`;
      results.forEach((result, i) => {
        const r = normalizeResult(result);
        const matchLabel = formatMatchLabel(r.matched_by);
        if (aggregateBy === "folder") {
          output += formatFolderResult(i, r, matchLabel);
        } else if (aggregateBy === "doc") {
          output += formatDocResult(i, r, matchLabel);
        } else {
          output += formatContentResult(i, r, matchLabel);
        }
      });
      return output;
    }
    function formatMatchLabel(matchedBy) {
      if (matchedBy === "vector+keyword") return "[vector+keyword]";
      if (matchedBy === "vector") return "[vector]";
      return "[keyword]";
    }
    function formatFolderResult(index, result, matchLabel) {
      return `[${index + 1}] Score: ${result.score.toFixed(4)} ${matchLabel}
\u{1F4C1} ${result.folder_path || result.file_path}
   ${result.doc_count || 0} documents, ${result.hit_count || 0} matches

`;
    }
    function formatDocResult(index, result, matchLabel) {
      return `[${index + 1}] Score: ${result.score.toFixed(4)} ${matchLabel}
\u{1F4C4} ${result.file_path}
   ${result.hit_count || 0} matches

`;
    }
    function formatContentResult(index, result, matchLabel) {
      const headingPath = result.heading_path ? ` > ${result.heading_path}` : "";
      const lineInfo = result.line_start && result.line_end ? ` (lines ${result.line_start}-${result.line_end})` : "";
      const separator = "\u2500".repeat(40);
      const content = result.content || "";
      const truncated = content.length > 300 ? content.slice(0, 300) + "..." : content;
      return `[${index + 1}] Score: ${result.score.toFixed(4)} ${matchLabel}
\u{1F4C4} ${result.file_path}${headingPath}${lineInfo}
${separator}
${truncated}
${separator}

`;
    }
    function formatJson2(query, results, options = {}) {
      const { mode = "hybrid", aggregateBy = "content" } = options;
      return {
        query,
        mode,
        aggregate_by: aggregateBy,
        count: results.length,
        results: normalizeResults2(results)
      };
    }
    module2.exports = {
      normalizeResult,
      normalizeResults: normalizeResults2,
      formatPlain: formatPlain2,
      formatJson: formatJson2
    };
  }
});

// ../work/0xranx__OpenContext/src/core/search/native-adapter.js
var native = require_native();
var { normalizeResults, formatPlain, formatJson } = require_formatter();
var isNativeAvailable = native.isAvailable;
var getNativeError = native.getError;
var NativeSearcher = class {
  constructor(options = {}) {
    this.vectorWeight = options.vectorWeight ?? 0.7;
    this.keywordWeight = options.keywordWeight ?? 0.3;
    this.initialized = false;
    this._searcher = null;
  }
  /**
   * Initialize search engine
   * @param {boolean} forceReinit - Force re-initialization
   */
  async initialize(forceReinit = false) {
    if (this.initialized && !forceReinit) return;
    this._searcher = await native.get().Searcher.create();
    this.initialized = true;
  }
  /**
   * Execute search
   * @param {string} query - Search query
   * @param {Object} options
   * @param {number} options.limit - Number of results to return
   * @param {string} options.mode - Search mode: 'hybrid' | 'vector' | 'keyword'
   * @param {string} options.aggregateBy - Aggregation type: 'content' | 'doc' | 'folder'
   * @returns {Promise<Array>} Search results array with snake_case fields
   */
  async search(query, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }
    const { limit = 5, mode = "hybrid", aggregateBy = "content" } = options;
    const response = await this._searcher.search({
      query,
      limit,
      mode,
      aggregateBy,
      docType: options.docType
    });
    return normalizeResults(response.results);
  }
  /** @see formatPlain */
  formatResults(query, results, options = {}) {
    return formatPlain(query, results, options);
  }
  /** @see formatPlain */
  formatResultsPlain(query, results, options = {}) {
    return formatPlain(query, results, options);
  }
  /** @see formatJson */
  formatResultsJson(query, results, options = {}) {
    return formatJson(query, results, options);
  }
};
var NativeIndexer = class {
  constructor(options = {}) {
    this._indexer = null;
    this.initialized = false;
  }
  /**
   * Initialize indexer
   */
  async initialize() {
    if (this.initialized) return;
    this._indexer = await native.get().Indexer.create();
    this.initialized = true;
  }
  /**
   * Build index for all documents
   * @param {Object} options
   * @param {Function} options.onProgress - Progress callback
   * @returns {Promise<Object>} Index stats
   */
  async buildIndex(options = {}) {
    await this.initialize();
    const stats = await this._indexer.buildAll();
    if (options.onProgress) {
      options.onProgress({ phase: "done", percent: 100 });
    }
    return {
      fileCount: stats.totalDocs,
      chunkCount: stats.totalChunks,
      mode: "full",
      elapsedMs: stats.elapsedMs
    };
  }
  /**
   * Index a single file
   * @param {string} relPath - Relative path to the file
   * @returns {Promise<number>} Number of chunks created
   */
  async indexFile(relPath) {
    await this.initialize();
    return await this._indexer.indexFile(relPath);
  }
  /**
   * Remove a file from the index
   * @param {string} relPath - Relative path to the file
   */
  async removeFile(relPath) {
    await this.initialize();
    await this._indexer.removeFile(relPath);
  }
  /**
   * Check if index exists
   * @returns {Promise<boolean>}
   */
  async indexExists() {
    await this.initialize();
    return await this._indexer.indexExists();
  }
  /**
   * Get index statistics
   * @returns {Promise<Object>}
   */
  async getStats() {
    await this.initialize();
    return await this._indexer.getStats();
  }
  /**
   * Clean/reset the index
   */
  async clean() {
    await this.initialize();
    await this._indexer.clean();
  }
};
module.exports = {
  isNativeAvailable,
  getNativeError,
  NativeSearcher,
  NativeIndexer
};
