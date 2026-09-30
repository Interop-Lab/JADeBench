"use strict";

const path = require("path");

let nativeModule = null;
let nativeLoadError = null;
let packageLoadError = null;
let loadedFrom = null;
let loadAttempted = false;

function loadNativeModule() {
  if (loadAttempted) return;
  loadAttempted = true;

  try {
    nativeModule = require("@opencontext/native");
    loadedFrom = "package";
    return;
  } catch (error) {
    packageLoadError = error;
  }

  try {
    const localNativePath = path.join(__dirname, "../../../native");
    nativeModule = require(localNativePath);
    loadedFrom = "local";
  } catch (error) {
    nativeLoadError = error;
  }
}

loadNativeModule();

const native = {
  isAvailable() {
    return nativeModule !== null;
  },

  getError() {
    return nativeLoadError;
  },

  get() {
    if (!nativeModule) {
      const packageMessage =
        packageLoadError && packageLoadError.message
          ? packageLoadError.message
          : "unknown package-loading error";
      const localMessage =
        nativeLoadError && nativeLoadError.message
          ? nativeLoadError.message
          : "unknown local-loading error";

      throw new Error(
        "The OpenContext native module could not be loaded. " +
          "Package load error: " +
          packageMessage +
          ". Local load error: " +
          localMessage
      );
    }

    return nativeModule;
  },

  require() {
    if (!nativeModule) this.get();
  },

  getLoadedFrom() {
    return loadedFrom;
  },

  get native() {
    return nativeModule;
  }
};

function normalizeResult(result) {
  return {
    id: result.id,
    path: result.path || result.file_path || result.filePath || result.file,
    hash: result.hash || result.file_hash || result.fileHash,
    score: result.score,
    semanticScore:
      result.semantic_score !== undefined
        ? result.semantic_score
        : result.semanticScore,
    keywordScore:
      result.keyword_score !== undefined
        ? result.keyword_score
        : result.keywordScore,
    startLine:
      result.start_line !== undefined ? result.start_line : result.startLine,
    endLine: result.end_line !== undefined ? result.end_line : result.endLine,
    startByte:
      result.start_byte !== undefined ? result.start_byte : result.startByte,
    endByte:
      result.end_byte !== undefined ? result.end_byte : result.endByte,
    content: result.content || result.body || result.text,
    repository:
      result.repository || result.repository_name || result.repositoryName,
    branch: result.branch,
    language: result.language,
    metadata: result.metadata,
    rank: result.rank,
    type: result.type
  };
}

function normalizeResults(results) {
  return (results || []).map(normalizeResult);
}

function modeLabel(mode) {
  if (mode === "semantic") return "Semantic";
  if (mode === "keyword") return "Keyword";
  if (mode === "hybrid") return "Hybrid";
  return mode;
}

function formatDetailedResult(index, result, scoreLabel) {
  const repository = result.repository ? ` (${result.repository})` : "";
  const lineRange =
    result.startLine && result.endLine
      ? ` (lines ${result.startLine}-${result.endLine})`
      : "";
  const separator = "─".repeat(60);
  const content = result.content || "";
  const shortenedContent =
    content.length > 500 ? `${content.slice(0, 497)}...` : content;

  return (
    `[${index + 1}] ${result.path || ""} ${scoreLabel}: ` +
    `${Number(result.score || 0).toFixed(3)}${repository}${lineRange}\n` +
    `${separator}\n${shortenedContent}\n${separator}\n\n`
  );
}

function formatFileResult(index, result, scoreLabel) {
  return (
    `[${index + 1}] ${result.path || ""} ${scoreLabel}: ` +
    `${Number(result.score || 0).toFixed(3)} ` +
    `(${result.language || "unknown"}, ${result.startLine || 0} lines)\n\n`
  );
}

function formatPlain(query, rawResults, options = {}) {
  const { mode = "hybrid", aggregateBy = "file" } = options;

  if (!rawResults || rawResults.length === 0) {
    return `No results found for "${query}".`;
  }

  const labels = {
    semantic: "Semantic",
    keyword: "Keyword",
    hybrid: "Hybrid"
  };

  const label = labels[mode] || mode;
  let output =
    `${label} search results for "${query}" ` +
    `(${rawResults.length} results):\n\n`;

  rawResults.forEach((rawResult, index) => {
    const result = normalizeResult(rawResult);
    const scoreLabel = modeLabel(mode);

    if (aggregateBy === "chunk" || aggregateBy === "repository") {
      output += formatDetailedResult(index, result, scoreLabel);
    } else {
      output += formatFileResult(index, result, scoreLabel);
    }
  });

  return output;
}

function formatJson(query, rawResults, options = {}) {
  const { mode = "hybrid", aggregateBy = "file" } = options;

  return {
    query,
    mode,
    aggregate_by: aggregateBy,
    count: rawResults.length,
    results: normalizeResults(rawResults)
  };
}

const isNativeAvailable = native.isAvailable;
const getNativeError = native.getError;

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
      limit = 5,
      mode = "hybrid",
      aggregateBy = "file"
    } = options;

    const request = {
      query,
      limit,
      mode,
      aggregate_by: aggregateBy,
      filter: options.filter
    };

    const response = await this.searcher.search(request);
    return normalizeResults(response.results);
  }

  formatResults(query, results, options = {}) {
    return formatPlain(query, results, options);
  }

  formatPlain(query, results, options = {}) {
    return formatPlain(query, results, options);
  }

  formatJson(query, results, options = {}) {
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

  async index(options = {}) {
    await this.initialize();

    const result = await this.indexer.index();

    if (options.progress) {
      options.progress({
        phase: "complete",
        percent: 100
      });
    }

    return {
      files: result.files,
      documentCount:
        result.document_count !== undefined
          ? result.document_count
          : result.documentCount,
      status: "complete",
      errors: result.errors
    };
  }

  async addFile(filePath) {
    await this.initialize();
    return await this.indexer.addFile(filePath);
  }

  async removeFile(filePath) {
    await this.initialize();
    await this.indexer.removeFile(filePath);
  }

  async getStats() {
    await this.initialize();
    return await this.indexer.getStats();
  }

  async save() {
    await this.initialize();
    return await this.indexer.save();
  }

  async close() {
    await this.initialize();
    await this.indexer.close();
  }
}

module.exports = {
  isNativeAvailable,
  getNativeError,
  NativeSearcher,
  NativeIndexer
};
