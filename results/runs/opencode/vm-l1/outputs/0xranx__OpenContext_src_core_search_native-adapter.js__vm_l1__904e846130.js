"use strict";

const path = require("path");

let bindings = null;
let npmError = null;
let localError = null;
let loadedFrom = null;

try {
  bindings = require("@aicontextlab/core-native");
  loadedFrom = "npm";
} catch (error) {
  npmError = error;
  try {
    bindings = require(path.join(__dirname, "../../crates/opencontext-node"));
    loadedFrom = "local";
  } catch (error) {
    localError = error;
  }
}

function isNativeAvailable() {
  return bindings !== null;
}

function getNativeError() {
  if (bindings) return null;
  return new Error(
    "OpenContext native bindings not available.\n" +
      "  If installed via npm: try reinstalling the package\n" +
      "  If developing locally: cd crates/opencontext-node && npm run build\n" +
      "  If optional deps were skipped: npm install -g @aicontextlab/cli --include=optional\n" +
      `Error (npm): ${npmError?.message ?? "unknown"}\n` +
      `Error (local): ${localError?.message ?? "unknown"}`,
  );
}

function getNativeBindings() {
  if (!bindings) throw getNativeError();
  return bindings;
}

function getLoadedFrom() {
  return loadedFrom;
}

const native = {
  isAvailable: isNativeAvailable,
  getError: getNativeError,
  get: getNativeBindings,
  getLoadedFrom,
};

const RESULT_FIELDS = [
  ["file_path", "filePath"],
  ["heading_path", "headingPath"],
  ["section_title", "sectionTitle"],
  ["line_start", "lineStart"],
  ["line_end", "lineEnd"],
  ["matched_by", "matchedBy"],
  ["hit_count", "hitCount"],
  ["doc_count", "docCount"],
  ["folder_path", "folderPath"],
  ["display_name", "displayName"],
  ["doc_type", "docType"],
  ["entry_id", "entryId"],
  ["entry_date", "entryDate"],
  ["entry_created_at", "entryCreatedAt"],
  ["idea_box", "ideaBox"],
];

function normalizeResult(result) {
  const normalized = { score: result.score };
  for (const [snakeCase, camelCase] of RESULT_FIELDS) {
    normalized[snakeCase] = result[snakeCase] ?? result[camelCase];
  }
  normalized.content = result.content;
  return normalized;
}

function normalizeResults(results) {
  return results.map(normalizeResult);
}

function matchedByLabel(matchedBy) {
  if (matchedBy === "vector+keyword") return "[vector+keyword]";
  if (matchedBy === "vector") return "[vector]";
  return "[keyword]";
}

function formatFolderResult(result, index) {
  return (
    `[${index + 1}] Score: ${result.score.toFixed(4)} ${matchedByLabel(result.matched_by)}` +
    `\n📁 ${result.folder_path || result.file_path}` +
    `\n   ${result.doc_count || 0} documents, ${result.hit_count || 0} matches\n\n`
  );
}

function formatDocumentResult(result, index) {
  return (
    `[${index + 1}] Score: ${result.score.toFixed(4)} ${matchedByLabel(result.matched_by)}` +
    `\n📄 ${result.file_path}` +
    `\n   ${result.hit_count || 0} matches\n\n`
  );
}

function formatContentResult(result, index) {
  let location = result.heading_path ? ` > ${result.heading_path}` : "";
  if (result.line_start) {
    location += ` (lines ${result.line_start}-${result.line_end})`;
  }

  const content = result.content || "";
  const excerpt = content.length > 300 ? `${content.slice(0, 300)}...` : content;
  return (
    `[${index + 1}] Score: ${result.score.toFixed(4)} ${matchedByLabel(result.matched_by)}` +
    `\n📄 ${result.file_path}${location}\n${"─".repeat(40)}\n${excerpt}\n${"─".repeat(40)}\n\n`
  );
}

function formatPlain(query, results, options = {}) {
  const aggregateBy = options.aggregateBy || "content";
  const mode = options.mode || "hybrid";
  if (!results.length) {
    return `🔍 Search: "${query}"\nNo results found. Try different keywords or run "oc index build" first.`;
  }

  const modeName = mode === "hybrid" ? "Hybrid" : mode === "vector" ? "Vector" : "Keyword";
  let output = `🔍 ${modeName} Search: "${query}"\nFound ${results.length} results:\n\n`;
  results.forEach((result, index) => {
    if (aggregateBy === "folder") output += formatFolderResult(result, index);
    else if (aggregateBy === "doc") output += formatDocumentResult(result, index);
    else output += formatContentResult(result, index);
  });
  return output;
}

function formatJson(query, results, options = {}) {
  const mode = options.mode || "hybrid";
  const aggregateBy = options.aggregateBy || "content";
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

  async initialize() {
    if (this.initialized) return;
    const { Searcher } = native.get();
    this._searcher = await Searcher.create();
    this.initialized = true;
  }

  async search(query, options = {}) {
    if (!this.initialized) await this.initialize();
    const limit = options.limit ?? 5;
    const mode = options.mode ?? "hybrid";
    const aggregateBy = options.aggregateBy ?? "content";
    const results = await this._searcher.search({
      query,
      limit,
      mode,
      aggregateBy,
      docType: options.docType,
    });
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
    const { Indexer } = native.get();
    this._indexer = await Indexer.create();
    this.initialized = true;
  }

  async buildIndex(options = {}) {
    if (!this.initialized) await this.initialize();
    const result = await this._indexer.buildAll();
    options.onProgress?.({ phase: "done", percent: 100 });
    return {
      totalDocs: result.fileCount,
      totalChunks: result.chunkCount,
      mode: "full",
      elapsedMs: result.elapsedMs,
    };
  }

  async indexFile(filePath) {
    if (!this.initialized) await this.initialize();
    return this._indexer.indexFile(filePath);
  }

  async removeFile(filePath) {
    if (!this.initialized) await this.initialize();
    return this._indexer.removeFile(filePath);
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
    return this._indexer.clean();
  }
}

module.exports = {
  isNativeAvailable,
  getNativeError,
  NativeSearcher,
  NativeIndexer,
};
