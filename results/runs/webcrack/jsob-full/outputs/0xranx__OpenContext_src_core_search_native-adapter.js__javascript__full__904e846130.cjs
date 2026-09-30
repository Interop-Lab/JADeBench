var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x533831, _0x155418) => function _0xf52434() {
  if (!_0x155418) {
    (0, _0x533831[__getOwnPropNames(_0x533831)[0]])((_0x155418 = {
      exports: {}
    }).exports, _0x155418);
  }
  return _0x155418.exports;
};
var require_native = __commonJS({
  "../work/0xranx__OpenContext/src/core/native.js"(_0x324a2e, _0x1de27c) {
    var _0x53f5d8 = require("path");
    var _0x518d67 = null;
    var _0x542ac0 = null;
    var _0x1c484c = null;
    var _0x68cd48 = null;
    var _0x12d3b6 = false;
    var _0x2dcd51 = null;
    function _0x5721c2() {
      if (_0x12d3b6) {
        return;
      }
      _0x12d3b6 = true;
      try {
        _0x518d67 = require("@aicontextlab/core-native");
        _0x2dcd51 = "npm";
        return;
      } catch (_0x48ca20) {
        _0x1c484c = _0x48ca20;
      }
      try {
        const _0x4be1fa = _0x53f5d8.join(__dirname, "../../crates/opencontext-node");
        _0x518d67 = require(_0x4be1fa);
        _0x2dcd51 = "local";
      } catch (_0x2621d8) {
        _0x68cd48 = _0x2621d8;
        _0x542ac0 = _0x2621d8;
      }
    }
    _0x5721c2();
    function _0x571b29() {
      return _0x518d67 !== null;
    }
    function _0x29b8bd() {
      return _0x542ac0;
    }
    function _0x3d7271() {
      if (!_0x518d67) {
        throw new Error("OpenContext native bindings not available.\n  If installed via npm: try reinstalling the package\n  If developing locally: cd crates/opencontext-node && npm run build\n  If optional deps were skipped: npm install -g @aicontextlab/cli --include=optional\nError (npm): " + (_0x1c484c?.message || "unknown") + "\nError (local): " + (_0x68cd48?.message || "unknown"));
      }
      return _0x518d67;
    }
    function _0x5c01c7() {
      if (!_0x518d67) {
        throw new Error("OpenContext native bindings not available.\n  If installed via npm: try reinstalling the package\n  If developing locally: cd crates/opencontext-node && npm run build\n  If optional deps were skipped: npm install -g @aicontextlab/cli --include=optional\nError (npm): " + (_0x1c484c?.message || "unknown") + "\nError (local): " + (_0x68cd48?.message || "unknown"));
      }
    }
    function _0x6975f9() {
      return _0x2dcd51;
    }
    _0x1de27c.exports = {
      isAvailable: _0x571b29,
      getError: _0x29b8bd,
      get: _0x3d7271,
      require: _0x5c01c7,
      getLoadedFrom: _0x6975f9,
      get native() {
        return _0x518d67;
      }
    };
  }
});
var require_formatter = __commonJS({
  "../work/0xranx__OpenContext/src/core/search/formatter.js"(_0x3a5790, _0x4ebef6) {
    function _0x1bdd40(_0x36b1e0) {
      var _0x13a7e1 = {
        score: _0x36b1e0.score,
        file_path: _0x36b1e0.file_path || _0x36b1e0.filePath,
        content: _0x36b1e0.content,
        heading_path: _0x36b1e0.heading_path || _0x36b1e0.headingPath,
        section_title: _0x36b1e0.section_title || _0x36b1e0.sectionTitle,
        line_start: _0x36b1e0.line_start || _0x36b1e0.lineStart,
        line_end: _0x36b1e0.line_end || _0x36b1e0.lineEnd,
        matched_by: _0x36b1e0.matched_by || _0x36b1e0.matchedBy,
        hit_count: _0x36b1e0.hit_count || _0x36b1e0.hitCount,
        doc_count: _0x36b1e0.doc_count || _0x36b1e0.docCount,
        folder_path: _0x36b1e0.folder_path || _0x36b1e0.folderPath,
        display_name: _0x36b1e0.display_name || _0x36b1e0.displayName,
        doc_type: _0x36b1e0.doc_type || _0x36b1e0.docType,
        entry_id: _0x36b1e0.entry_id || _0x36b1e0.entryId,
        entry_date: _0x36b1e0.entry_date || _0x36b1e0.entryDate,
        entry_created_at: _0x36b1e0.entry_created_at || _0x36b1e0.entryCreatedAt,
        idea_box: _0x36b1e0.idea_box || _0x36b1e0.ideaBox
      };
      return _0x13a7e1;
    }
    function _0x159382(_0x37fabb) {
      return (_0x37fabb || []).map(_0x1bdd40);
    }
    function _0x5aa068(_0x4390eb, _0xb7d768, _0x2da1e2 = {}) {
      const {
        mode = "hybrid",
        aggregateBy = "content"
      } = _0x2da1e2;
      if (!_0xb7d768 || _0xb7d768.length === 0) {
        return "🔍 Search: \"" + _0x4390eb + "\"\nNo results found. Try different keywords or run \"oc index build\" first.";
      }
      const _0x2b1e97 = {
        hybrid: "Hybrid",
        vector: "Vector",
        keyword: "Keyword"
      }[mode] || mode;
      let _0x3f975e = "🔍 " + _0x2b1e97 + " Search: \"" + _0x4390eb + "\"\nFound " + _0xb7d768.length + " results:\n\n";
      _0xb7d768.forEach((_0x13f959, _0x2035c1) => {
        const _0x4d936d = _0x1bdd40(_0x13f959);
        const _0x5627d4 = _0x4c542a(_0x4d936d.matched_by);
        if (aggregateBy === "folder") {
          _0x3f975e += _0x49bce9(_0x2035c1, _0x4d936d, _0x5627d4);
        } else if (aggregateBy === "doc") {
          _0x3f975e += _0x58ebce(_0x2035c1, _0x4d936d, _0x5627d4);
        } else {
          _0x3f975e += _0x16abd4(_0x2035c1, _0x4d936d, _0x5627d4);
        }
      });
      return _0x3f975e;
    }
    function _0x4c542a(_0x2f68b3) {
      if (_0x2f68b3 === "vector+keyword") {
        return "[vector+keyword]";
      }
      if (_0x2f68b3 === "vector") {
        return "[vector]";
      }
      return "[keyword]";
    }
    function _0x49bce9(_0x47067e, _0xcd7620, _0x45fca8) {
      return "[" + (_0x47067e + 1) + "] Score: " + _0xcd7620.score.toFixed(4) + " " + _0x45fca8 + "\n📁 " + (_0xcd7620.folder_path || _0xcd7620.file_path) + "\n   " + (_0xcd7620.doc_count || 0) + " documents, " + (_0xcd7620.hit_count || 0) + " matches\n\n";
    }
    function _0x58ebce(_0x2f0935, _0x18a8bd, _0x2bc6d3) {
      return "[" + (_0x2f0935 + 1) + "] Score: " + _0x18a8bd.score.toFixed(4) + " " + _0x2bc6d3 + "\n📄 " + _0x18a8bd.file_path + "\n   " + (_0x18a8bd.hit_count || 0) + " matches\n\n";
    }
    function _0x16abd4(_0x12a18b, _0x4e9a5c, _0x26db0d) {
      const _0x5223c4 = _0x4e9a5c.heading_path ? " > " + _0x4e9a5c.heading_path : "";
      const _0x71533b = _0x4e9a5c.line_start && _0x4e9a5c.line_end ? " (lines " + _0x4e9a5c.line_start + "-" + _0x4e9a5c.line_end + ")" : "";
      const _0x1cee3c = "─".repeat(40);
      const _0x1f8418 = _0x4e9a5c.content || "";
      const _0x36dd70 = _0x1f8418.length > 300 ? _0x1f8418.slice(0, 300) + "..." : _0x1f8418;
      return "[" + (_0x12a18b + 1) + "] Score: " + _0x4e9a5c.score.toFixed(4) + " " + _0x26db0d + "\n📄 " + _0x4e9a5c.file_path + _0x5223c4 + _0x71533b + "\n" + _0x1cee3c + "\n" + _0x36dd70 + "\n" + _0x1cee3c + "\n\n";
    }
    function _0x4bd627(_0x124110, _0x202645, _0x123e85 = {}) {
      const {
        mode = "hybrid",
        aggregateBy = "content"
      } = _0x123e85;
      return {
        query: _0x124110,
        mode: mode,
        aggregate_by: aggregateBy,
        count: _0x202645.length,
        results: _0x159382(_0x202645)
      };
    }
    var _0x220b8e = {
      normalizeResult: _0x1bdd40,
      normalizeResults: _0x159382,
      formatPlain: _0x5aa068,
      formatJson: _0x4bd627
    };
    _0x4ebef6.exports = _0x220b8e;
  }
});
var native = require_native();
var {
  normalizeResults,
  formatPlain,
  formatJson
} = require_formatter();
var isNativeAvailable = native.isAvailable;
var getNativeError = native.getError;
var NativeSearcher = class {
  constructor(_0x1a72f4 = {}) {
    this.vectorWeight = _0x1a72f4.vectorWeight ?? 0.7;
    this.keywordWeight = _0x1a72f4.keywordWeight ?? 0.3;
    this.initialized = false;
    this._searcher = null;
  }
  async initialize(_0x1e83b9 = false) {
    if (this.initialized && !_0x1e83b9) {
      return;
    }
    this._searcher = await native.get().Searcher.create();
    this.initialized = true;
  }
  async search(_0x8fac98, _0x47480d = {}) {
    if (!this.initialized) {
      await this.initialize();
    }
    const {
      limit = 5,
      mode = "hybrid",
      aggregateBy = "content"
    } = _0x47480d;
    var _0x1fbd64 = {
      query: _0x8fac98,
      limit: limit,
      mode: mode,
      aggregateBy: aggregateBy,
      docType: _0x47480d.docType
    };
    const _0xb6116c = await this._searcher.search(_0x1fbd64);
    return normalizeResults(_0xb6116c.results);
  }
  formatResults(_0x1be293, _0x12db05, _0x3591cf = {}) {
    return formatPlain(_0x1be293, _0x12db05, _0x3591cf);
  }
  formatResultsPlain(_0x3148fd, _0x20d102, _0xa0bfe3 = {}) {
    return formatPlain(_0x3148fd, _0x20d102, _0xa0bfe3);
  }
  formatResultsJson(_0x6b5f4a, _0x131daf, _0x20c354 = {}) {
    return formatJson(_0x6b5f4a, _0x131daf, _0x20c354);
  }
};
var NativeIndexer = class {
  constructor(_0x176b55 = {}) {
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
  async buildIndex(_0x735999 = {}) {
    await this.initialize();
    const _0x264e1c = await this._indexer.buildAll();
    if (_0x735999.onProgress) {
      _0x735999.onProgress({
        phase: "done",
        percent: 100
      });
    }
    var _0x55cd78 = {
      fileCount: _0x264e1c.totalDocs,
      chunkCount: _0x264e1c.totalChunks,
      mode: "full",
      elapsedMs: _0x264e1c.elapsedMs
    };
    return _0x55cd78;
  }
  async indexFile(_0x565598) {
    await this.initialize();
    return await this._indexer.indexFile(_0x565598);
  }
  async removeFile(_0x9a3766) {
    await this.initialize();
    await this._indexer.removeFile(_0x9a3766);
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
};
var _0x418419 = {
  isNativeAvailable: isNativeAvailable,
  getNativeError: getNativeError,
  NativeSearcher: NativeSearcher,
  NativeIndexer: NativeIndexer
};
module.exports = _0x418419;