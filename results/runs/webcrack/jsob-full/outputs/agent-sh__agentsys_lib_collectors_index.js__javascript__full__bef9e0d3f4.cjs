'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0xb642d6, _0x52a843) => function _0x45fa10() {
  if (!_0x52a843) {
    (0, _0xb642d6[__getOwnPropNames(_0xb642d6)[0]])((_0x52a843 = {
      exports: {}
    }).exports, _0x52a843);
  }
  return _0x52a843.exports;
};
var require_github = __commonJS({
  "../work/agent-sh__agentsys/lib/collectors/github.js"(_0x71aa0e, _0x1b04ce) {
    'use strict';

    var {
      execFileSync: _0x2677dd
    } = require("child_process");
    var _0x4c3485 = {
      issueLimit: 100,
      prLimit: 50,
      milestoneLimit: 100,
      timeout: 10000,
      cwd: process.cwd()
    };
    function _0x8ec36f(_0x1fdc1d, _0xaf22dd = {}) {
      const _0x25f5bc = _0x52a0d1(_0x1fdc1d, _0xaf22dd);
      if (_0x25f5bc.ok) {
        return _0x25f5bc.data;
      } else {
        return null;
      }
    }
    function _0x52a0d1(_0x5aac7c, _0x3c9ce7 = {}) {
      try {
        const _0x50f8e2 = _0x2677dd("gh", _0x5aac7c, {
          encoding: "utf8",
          stdio: "pipe",
          timeout: _0x3c9ce7.timeout || _0x4c3485.timeout,
          cwd: _0x3c9ce7.cwd || _0x4c3485.cwd
        });
        try {
          return {
            ok: true,
            data: JSON.parse(_0x50f8e2)
          };
        } catch (_0x17d9fd) {
          return {
            ok: false,
            error: {
              type: "parse",
              message: "Failed to parse gh output as JSON: " + _0x17d9fd.message,
              raw: _0x50f8e2.slice(0, 500)
            }
          };
        }
      } catch (_0x41d59d) {
        return {
          ok: false,
          error: {
            type: _0x41d59d.killed ? "timeout" : "process",
            message: _0x41d59d.message,
            exitCode: _0x41d59d.status ?? null,
            stderr: _0x41d59d.stderr ? String(_0x41d59d.stderr).trim() : ""
          }
        };
      }
    }
    function _0x5035da() {
      try {
        _0x2677dd("gh", ["auth", "status"], {
          encoding: "utf8",
          stdio: "pipe",
          timeout: 5000
        });
        return true;
      } catch {
        return false;
      }
    }
    function _0xaa9f5e(_0x388671) {
      return {
        number: _0x388671.number,
        title: _0x388671.title,
        labels: (_0x388671.labels || []).map(_0x384c17 => _0x384c17.name || _0x384c17),
        milestone: _0x388671.milestone?.title || _0x388671.milestone || null,
        createdAt: _0x388671.createdAt,
        updatedAt: _0x388671.updatedAt,
        snippet: _0x388671.body ? _0x388671.body.slice(0, 200).replace(/\n/g, " ").trim() + (_0x388671.body.length > 200 ? "..." : "") : ""
      };
    }
    function _0x290715(_0x28f1ca) {
      return {
        number: _0x28f1ca.number,
        title: _0x28f1ca.title,
        labels: (_0x28f1ca.labels || []).map(_0x14b540 => _0x14b540.name || _0x14b540),
        isDraft: _0x28f1ca.isDraft,
        createdAt: _0x28f1ca.createdAt,
        updatedAt: _0x28f1ca.updatedAt,
        files: _0x28f1ca.files || [],
        snippet: _0x28f1ca.body ? _0x28f1ca.body.slice(0, 150).replace(/\n/g, " ").trim() + (_0x28f1ca.body.length > 150 ? "..." : "") : ""
      };
    }
    function _0x5a9ef5(_0x2111d3, _0x239788) {
      const _0x2d714a = {
        bug: "bugs",
        "type: bug": "bugs",
        feature: "features",
        "type: feature": "features",
        enhancement: "enhancements",
        security: "security",
        "type: security": "security"
      };
      const _0x46babe = Object.entries(_0x2d714a).map(([_0x42e6dd, _0x137a27]) => ({
        regex: new RegExp("(^|[^a-z])" + _0x42e6dd.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^a-z]|$)", "i"),
        category: _0x137a27
      }));
      for (const _0x5767a5 of _0x239788) {
        const _0x556b36 = (_0x5767a5.labels || []).map(_0xa06bcc => (_0xa06bcc.name || _0xa06bcc).toLowerCase());
        let _0x24c824 = false;
        const _0x8855c5 = {
          number: _0x5767a5.number,
          title: _0x5767a5.title
        };
        const _0x35a595 = _0x8855c5;
        for (const {
          regex: _0x38b54b,
          category: _0x128554
        } of _0x46babe) {
          if (_0x556b36.some(_0x340560 => _0x38b54b.test(_0x340560))) {
            _0x2111d3.categorized[_0x128554].push(_0x35a595);
            _0x24c824 = true;
            break;
          }
        }
        if (!_0x24c824) {
          _0x2111d3.categorized.other.push(_0x35a595);
        }
      }
    }
    function _0x21b569(_0x12fc2a, _0x50388d, _0x4fda31) {
      const _0x44c1ad = new Date();
      _0x44c1ad.setDate(_0x44c1ad.getDate() - _0x4fda31);
      for (const _0x3ac95e of _0x50388d) {
        const _0x1f879a = new Date(_0x3ac95e.updatedAt);
        if (_0x1f879a < _0x44c1ad) {
          _0x12fc2a.stale.push({
            number: _0x3ac95e.number,
            title: _0x3ac95e.title,
            lastUpdated: _0x3ac95e.updatedAt,
            daysStale: Math.floor((Date.now() - _0x1f879a) / 86400000)
          });
        }
      }
    }
    function _0x291023(_0x16226e, _0x2f0dcf) {
      const _0x2b6ed4 = {};
      const _0x827f99 = new Set(["the", "a", "an", "is", "are", "to", "for", "in", "on", "at", "with", "and", "or", "of"]);
      for (const _0x1058bc of _0x2f0dcf) {
        const _0x487e29 = (_0x1058bc.title || "").toLowerCase().split(/\s+/);
        for (const _0x2c8b7b of _0x487e29) {
          if (_0x2c8b7b.length > 3 && !_0x827f99.has(_0x2c8b7b)) {
            _0x2b6ed4[_0x2c8b7b] = (_0x2b6ed4[_0x2c8b7b] || 0) + 1;
          }
        }
      }
      _0x16226e.themes = Object.entries(_0x2b6ed4).filter(([, _0x1fc641]) => _0x1fc641 > 1).sort((_0x50a0ac, _0x2835d0) => _0x2835d0[1] - _0x50a0ac[1]).slice(0, 10).map(([_0x1baedb, _0x37ac10]) => ({
        word: _0x1baedb,
        count: _0x37ac10
      }));
    }
    function _0xab4926(_0x295b1f) {
      const _0x364155 = new Date();
      _0x295b1f.overdueMilestones = _0x295b1f.milestones.filter(_0x2c8c42 => {
        if (!_0x2c8c42.due_on || _0x2c8c42.state === "closed") {
          return false;
        }
        return new Date(_0x2c8c42.due_on) < _0x364155;
      });
    }
    function _0x319248(_0x4f091d = {}) {
      const _0x3fab36 = {
        ..._0x4c3485,
        ..._0x4f091d
      };
      const _0x1bbfe9 = _0x3fab36;
      const _0x3b27f8 = {
        requestedLimit: _0x1bbfe9.issueLimit,
        fetchedCount: 0,
        hasMore: false
      };
      const _0x2d8300 = {
        requestedLimit: _0x1bbfe9.prLimit,
        fetchedCount: 0,
        hasMore: false
      };
      const _0x484734 = {
        requestedLimit: _0x1bbfe9.milestoneLimit,
        fetchedCount: 0,
        hasMore: false
      };
      const _0x7fa5 = {
        issues: _0x3b27f8,
        prs: _0x2d8300,
        milestones: _0x484734
      };
      const _0x442a0f = {
        available: false,
        partial: false,
        errors: [],
        summary: {
          issueCount: 0,
          prCount: 0,
          milestoneCount: 0
        },
        issues: [],
        prs: [],
        milestones: [],
        overdueMilestones: [],
        pagination: _0x7fa5,
        categorized: {
          bugs: [],
          features: [],
          security: [],
          enhancements: [],
          other: []
        },
        stale: [],
        themes: []
      };
      const _0x41f8d3 = _0x442a0f;
      if (!_0x5035da()) {
        _0x41f8d3.error = "gh CLI not available or not authenticated";
        return _0x41f8d3;
      }
      _0x41f8d3.available = true;
      const _0x505db4 = _0x52a0d1(["issue", "list", "--state", "open", "--json", "number,title,labels,milestone,createdAt,updatedAt,body", "--limit", String(_0x1bbfe9.issueLimit)], _0x1bbfe9);
      if (_0x505db4.ok && Array.isArray(_0x505db4.data)) {
        const _0x446228 = _0x505db4.data;
        _0x41f8d3.issues = _0x446228.map(_0xaa9f5e);
        _0x41f8d3.summary.issueCount = _0x446228.length;
        _0x41f8d3.pagination.issues.fetchedCount = _0x446228.length;
        _0x41f8d3.pagination.issues.hasMore = _0x1bbfe9.issueLimit > 0 && _0x446228.length >= _0x1bbfe9.issueLimit;
        _0x5a9ef5(_0x41f8d3, _0x446228);
        _0x21b569(_0x41f8d3, _0x446228, 90);
        _0x291023(_0x41f8d3, _0x446228);
      } else if (!_0x505db4.ok) {
        const _0x419063 = {
          source: "issues",
          ..._0x505db4.error
        };
        _0x41f8d3.errors.push(_0x419063);
      }
      const _0x13d8f1 = _0x52a0d1(["pr", "list", "--state", "open", "--json", "number,title,labels,isDraft,createdAt,updatedAt,body,files", "--limit", String(_0x1bbfe9.prLimit)], _0x1bbfe9);
      if (_0x13d8f1.ok && Array.isArray(_0x13d8f1.data)) {
        const _0x561fb0 = _0x13d8f1.data;
        _0x41f8d3.prs = _0x561fb0.map(_0x290715);
        _0x41f8d3.summary.prCount = _0x561fb0.length;
        _0x41f8d3.pagination.prs.fetchedCount = _0x561fb0.length;
        _0x41f8d3.pagination.prs.hasMore = _0x1bbfe9.prLimit > 0 && _0x561fb0.length >= _0x1bbfe9.prLimit;
      } else if (!_0x13d8f1.ok) {
        const _0x372c85 = {
          source: "prs",
          ..._0x13d8f1.error
        };
        _0x41f8d3.errors.push(_0x372c85);
      }
      const _0x7201e4 = _0x52a0d1(["api", "repos/{owner}/{repo}/milestones", "--paginate", "--slurp"], _0x1bbfe9);
      if (_0x7201e4.ok && Array.isArray(_0x7201e4.data)) {
        const _0x2ca485 = _0x7201e4.data;
        const _0xa30f78 = _0x2ca485.flatMap(_0x2b26fc => Array.isArray(_0x2b26fc) ? _0x2b26fc : []);
        const _0x4cb3c5 = _0xa30f78.map(_0x4b7479 => ({
          title: _0x4b7479.title,
          state: _0x4b7479.state,
          due_on: _0x4b7479.due_on,
          open_issues: _0x4b7479.open_issues,
          closed_issues: _0x4b7479.closed_issues
        }));
        _0x41f8d3.pagination.milestones.fetchedCount = _0x4cb3c5.length;
        _0x41f8d3.pagination.milestones.hasMore = _0x1bbfe9.milestoneLimit > 0 && _0x4cb3c5.length > _0x1bbfe9.milestoneLimit;
        _0x41f8d3.milestones = _0x4cb3c5.slice(0, _0x1bbfe9.milestoneLimit);
        _0x41f8d3.summary.milestoneCount = _0x41f8d3.milestones.length;
        _0xab4926(_0x41f8d3);
      } else if (!_0x7201e4.ok) {
        const _0x489451 = {
          source: "milestones",
          ..._0x7201e4.error
        };
        _0x41f8d3.errors.push(_0x489451);
      }
      _0x41f8d3.partial = _0x41f8d3.errors.length > 0;
      if (_0x41f8d3.partial && !_0x41f8d3.error) {
        _0x41f8d3.error = "Partial GitHub data collected";
      }
      return _0x41f8d3;
    }
    const _0x2390e0 = {
      DEFAULT_OPTIONS: _0x4c3485,
      scanGitHubState: _0x319248,
      isGhAvailable: _0x5035da,
      execGh: _0x8ec36f,
      summarizeIssue: _0xaa9f5e,
      summarizePR: _0x290715,
      categorizeIssues: _0x5a9ef5,
      findStaleItems: _0x21b569,
      extractThemes: _0x291023,
      findOverdueMilestones: _0xab4926
    };
    _0x1b04ce.exports = _0x2390e0;
  }
});
var require_documentation = __commonJS({
  "../work/agent-sh__agentsys/lib/collectors/documentation.js"(_0x43b1bc, _0x374c1d) {
    'use strict';

    var _0x43ad3f = require("fs");
    var _0x1c1208 = require("path");
    var _0x474075 = {
      depth: "thorough",
      cwd: process.cwd()
    };
    function _0x36c9d3(_0x103e6a, _0xa8af1f) {
      const _0x578389 = _0x1c1208.resolve(_0xa8af1f, _0x103e6a);
      return _0x578389.startsWith(_0x1c1208.resolve(_0xa8af1f));
    }
    function _0x1e8876(_0x35e75d, _0x5dfb18) {
      const _0xbd9e0f = _0x1c1208.resolve(_0x5dfb18, _0x35e75d);
      if (!_0x36c9d3(_0x35e75d, _0x5dfb18)) {
        return null;
      }
      try {
        return _0x43ad3f.readFileSync(_0xbd9e0f, "utf8");
      } catch {
        return null;
      }
    }
    function _0x299e94(_0x18270f, _0x23f41c) {
      const _0x5a27db = _0x18270f.match(/^##\s{1,1000}(.+)$/gm) || [];
      const _0x35c114 = _0x5a27db.slice(0, 10).map(_0xbde2fa => _0xbde2fa.replace(/^##\s+/, ""));
      const _0x5656b5 = _0x35c114.map(_0x468fd4 => _0x468fd4.toLowerCase()).join(" ");
      return {
        path: _0x23f41c,
        sectionCount: _0x5a27db.length,
        sections: _0x35c114,
        hasInstallation: /install|setup|getting.started/i.test(_0x5656b5),
        hasUsage: /usage|how.to|example/i.test(_0x5656b5),
        hasApi: /api|reference|methods/i.test(_0x5656b5),
        hasTesting: /test|spec|coverage/i.test(_0x5656b5),
        codeBlocks: Math.floor((_0x18270f.match(/```/g) || []).length / 2),
        wordCount: _0x18270f.split(/\s+/).length
      };
    }
    function _0x3dfb30(_0x152203, _0x2ca78b) {
      const _0x43d62a = (_0x2ca78b.match(/^[-*]\s+\[x\]/gim) || []).length;
      const _0x1441ad = (_0x2ca78b.match(/^[-*]\s+\[\s\]/gim) || []).length;
      _0x152203.checkboxes.checked += _0x43d62a;
      _0x152203.checkboxes.unchecked += _0x1441ad;
      _0x152203.checkboxes.total += _0x43d62a + _0x1441ad;
    }
    function _0x104f12(_0x311e31, _0x4f1317) {
      const _0x167417 = /^[-*]\s{1,100}\*{0,2}([^\n]{1,2000}?)\*{0,2}(?:\s{0,100}[-–]\s{0,100}([^\n]{1,2000}))?$/gm;
      let _0x388d9b;
      while ((_0x388d9b = _0x167417.exec(_0x4f1317)) !== null && _0x311e31.features.length < 20) {
        const _0x28648e = _0x388d9b[1].trim();
        if (_0x28648e.length > 5 && _0x28648e.length < 80) {
          _0x311e31.features.push(_0x28648e);
        }
      }
      _0x311e31.features = [...new Set(_0x311e31.features)].slice(0, 20);
    }
    function _0x9a34de(_0x5148fc, _0xfdc686) {
      const _0x12a510 = [/(?:TODO|FIXME|PLAN):\s*(.+)/gi, /^##\s+(?:Roadmap|Future|Planned|Coming Soon)/gim];
      for (const _0x123dd5 of _0x12a510) {
        let _0x2d94d8;
        while ((_0x2d94d8 = _0x123dd5.exec(_0xfdc686)) !== null && _0x5148fc.plans.length < 15) {
          const _0x4e2493 = (_0x2d94d8[1] || _0x2d94d8[0]).slice(0, 100);
          _0x5148fc.plans.push(_0x4e2493);
        }
      }
    }
    function _0x4a14ea(_0x471b92) {
      const _0xd16c4d = _0x471b92.files["README.md"];
      if (!_0xd16c4d) {
        _0x471b92.gaps.push({
          type: "missing",
          file: "README.md",
          severity: "high"
        });
      } else {
        if (!_0xd16c4d.hasInstallation) {
          _0x471b92.gaps.push({
            type: "missing-section",
            file: "README.md",
            section: "Installation",
            severity: "medium"
          });
        }
        if (!_0xd16c4d.hasUsage) {
          _0x471b92.gaps.push({
            type: "missing-section",
            file: "README.md",
            section: "Usage",
            severity: "medium"
          });
        }
      }
      if (!_0x471b92.files["CHANGELOG.md"]) {
        _0x471b92.gaps.push({
          type: "missing",
          file: "CHANGELOG.md",
          severity: "low"
        });
      }
    }
    function _0x55ec99(_0x532a38 = {}) {
      const _0x34f166 = {
        ..._0x474075,
        ..._0x532a38
      };
      const _0x6314a0 = _0x34f166;
      const _0xce7aac = _0x6314a0.cwd;
      const _0x3bcfec = {
        summary: {
          fileCount: 0,
          totalWords: 0
        },
        files: {},
        features: [],
        plans: [],
        checkboxes: {
          total: 0,
          checked: 0,
          unchecked: 0
        },
        gaps: []
      };
      const _0x2644fc = ["README.md", "PLAN.md", "CLAUDE.md", "AGENTS.md", "CONTRIBUTING.md", "CHANGELOG.md", "docs/README.md", "docs/PLAN.md"];
      for (const _0x4aff91 of _0x2644fc) {
        const _0x2cf6f0 = _0x1e8876(_0x4aff91, _0xce7aac);
        if (_0x2cf6f0) {
          const _0x138ece = _0x299e94(_0x2cf6f0, _0x4aff91);
          _0x3bcfec.files[_0x4aff91] = _0x138ece;
          _0x3bcfec.summary.totalWords += _0x138ece.wordCount;
          _0x3dfb30(_0x3bcfec, _0x2cf6f0);
          _0x104f12(_0x3bcfec, _0x2cf6f0);
          _0x9a34de(_0x3bcfec, _0x2cf6f0);
        }
      }
      if (_0x6314a0.depth === "thorough") {
        const _0x253daf = _0x1c1208.join(_0xce7aac, "docs");
        if (_0x43ad3f.existsSync(_0x253daf)) {
          try {
            const _0x2a357a = _0x43ad3f.readdirSync(_0x253daf).filter(_0x156a22 => _0x156a22.endsWith(".md") && !_0x2644fc.includes("docs/" + _0x156a22));
            for (const _0x3b339b of _0x2a357a.slice(0, 5)) {
              const _0x2a2520 = "docs/" + _0x3b339b;
              const _0x5e9864 = _0x1e8876(_0x2a2520, _0xce7aac);
              if (_0x5e9864) {
                const _0x1620f6 = _0x299e94(_0x5e9864, _0x2a2520);
                _0x3bcfec.files[_0x2a2520] = _0x1620f6;
                _0x3bcfec.summary.totalWords += _0x1620f6.wordCount;
              }
            }
          } catch {}
        }
      }
      _0x3bcfec.summary.fileCount = Object.keys(_0x3bcfec.files).length;
      _0x4a14ea(_0x3bcfec);
      return _0x3bcfec;
    }
    const _0x215707 = {
      DEFAULT_OPTIONS: _0x474075,
      analyzeDocumentation: _0x55ec99,
      analyzeMarkdownFile: _0x299e94,
      safeReadFile: _0x1e8876,
      isPathSafe: _0x36c9d3,
      extractCheckboxes: _0x3dfb30,
      extractFeatures: _0x104f12,
      extractPlans: _0x9a34de,
      identifyDocGaps: _0x4a14ea
    };
    _0x374c1d.exports = _0x215707;
  }
});
var require_fs_safe = __commonJS({
  "../work/agent-sh__agentsys/lib/utils/fs-safe.js"(_0x31ca98, _0x5bbdd8) {
    'use strict';

    var _0x1bef64 = require("fs");
    function _0x28c574(_0x21f0ea, _0x17c8c1, _0x31ee7c = "utf8") {
      const _0x4d96f4 = _0x1bef64.openSync(_0x21f0ea, "r");
      try {
        const _0x50ea9a = _0x1bef64.fstatSync(_0x4d96f4);
        if (!_0x50ea9a.isFile()) {
          const _0x3b0396 = new Error("Not a regular file: " + _0x21f0ea);
          _0x3b0396.code = "ENOTFILE";
          throw _0x3b0396;
        }
        if (typeof _0x17c8c1 === "number" && _0x50ea9a.size > _0x17c8c1) {
          const _0x53c8e3 = new Error("File too large: " + _0x50ea9a.size + " > " + _0x17c8c1 + " bytes");
          _0x53c8e3.code = "EFBIG";
          throw _0x53c8e3;
        }
        return _0x1bef64.readFileSync(_0x4d96f4, _0x31ee7c);
      } finally {
        _0x1bef64.closeSync(_0x4d96f4);
      }
    }
    const _0x34a580 = {
      readFileWithLimit: _0x28c574
    };
    _0x5bbdd8.exports = _0x34a580;
  }
});
var require_codebase = __commonJS({
  "../work/agent-sh__agentsys/lib/collectors/codebase.js"(_0x5071e3, _0x107589) {
    'use strict';

    var _0x701370 = require("fs");
    var _0xf9dcf5 = require("path");
    var {
      readFileWithLimit: _0x16c8ec
    } = require_fs_safe();
    var _0x58c35b = {
      depth: "thorough",
      cwd: process.cwd()
    };
    var _0x30af69 = 50000;
    var _0x381561 = ["node_modules", "vendor", "dist", "build", "out", "target", ".git", ".svn", ".hg", "__pycache__", ".pytest_cache", "coverage", ".nyc_output", ".next", ".nuxt", ".cache"];
    var _0x46be8c = {
      js: [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"],
      rust: [".rs"],
      go: [".go"],
      python: [".py"],
      java: [".java"]
    };
    function _0x275ec7(_0x473dca, _0x53e457) {
      const _0x4511b8 = _0xf9dcf5.resolve(_0x53e457, _0x473dca);
      const _0x478243 = _0xf9dcf5.resolve(_0x53e457);
      if (!_0x4511b8.startsWith(_0x478243)) {
        return null;
      }
      try {
        return _0x701370.readFileSync(_0x4511b8, "utf8");
      } catch {
        return null;
      }
    }
    function _0x2e536e(_0x4a9b81, _0x1781ad = _0x381561) {
      const _0x1fad94 = _0x4a9b81.split(/[\\/]/);
      return _0x1fad94.some(_0x2b476a => _0x1781ad.includes(_0x2b476a));
    }
    function _0xe2e97c(_0x2f68fc, _0x189f31) {
      const _0x42c0a2 = {
        ..._0x189f31.dependencies,
        ..._0x189f31.devDependencies
      };
      const _0x3d7cf5 = _0x42c0a2;
      const _0x2a16e2 = {
        react: "React",
        "react-dom": "React",
        next: "Next.js",
        vue: "Vue.js",
        nuxt: "Nuxt",
        angular: "Angular",
        express: "Express",
        fastify: "Fastify",
        koa: "Koa",
        nestjs: "NestJS"
      };
      for (const [_0x4057e4, _0x4eddc6] of Object.entries(_0x2a16e2)) {
        if (_0x3d7cf5[_0x4057e4]) {
          _0x2f68fc.frameworks.push(_0x4eddc6);
        }
      }
      _0x2f68fc.frameworks = [...new Set(_0x2f68fc.frameworks)];
    }
    function _0xf548f7(_0x2a00aa, _0x141197) {
      const _0x3107f5 = {
        ..._0x141197.dependencies,
        ..._0x141197.devDependencies
      };
      const _0x36a47d = _0x3107f5;
      const _0x5b884a = ["jest", "mocha", "vitest", "ava", "tap", "jasmine"];
      for (const _0x5aa160 of _0x5b884a) {
        if (_0x36a47d[_0x5aa160]) {
          _0x2a00aa.testFramework = _0x5aa160;
          _0x2a00aa.health.hasTests = true;
          break;
        }
      }
    }
    function _0x5db491(_0x351ae0) {
      const _0x2d6036 = {
        functions: [],
        classes: [],
        exports: []
      };
      const _0x5b81fe = /(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
      let _0x5077e4;
      while ((_0x5077e4 = _0x5b81fe.exec(_0x351ae0)) !== null) {
        _0x2d6036.functions.push(_0x5077e4[1]);
      }
      const _0x3fccc1 = /(?:const|let)\s{1,1000}([a-zA-Z_$][a-zA-Z0-9_$]*)\s{0,1000}=\s{0,1000}(?:async\s{0,1000})?\([^)]{0,2000}\)\s{0,1000}=>/g;
      while ((_0x5077e4 = _0x3fccc1.exec(_0x351ae0)) !== null) {
        _0x2d6036.functions.push(_0x5077e4[1]);
      }
      const _0x99b528 = /class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
      while ((_0x5077e4 = _0x99b528.exec(_0x351ae0)) !== null) {
        _0x2d6036.classes.push(_0x5077e4[1]);
      }
      const _0x1e0a1a = /export\s+(?:(?:async\s+)?function|class|const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
      while ((_0x5077e4 = _0x1e0a1a.exec(_0x351ae0)) !== null) {
        _0x2d6036.exports.push(_0x5077e4[1]);
      }
      const _0x68b23b = /module\.exports\s{0,1000}=\s{0,1000}\{([^}]{1,100000})\}/;
      const _0x5db059 = _0x351ae0.match(_0x68b23b);
      if (_0x5db059) {
        const _0x2de782 = _0x5db059[1].split(",").map(_0x4fedde => _0x4fedde.trim().split(":")[0].trim());
        _0x2d6036.exports.push(..._0x2de782.filter(_0x3abb8e => _0x3abb8e && /^[a-zA-Z_$]/.test(_0x3abb8e)));
      }
      _0x2d6036.functions = [...new Set(_0x2d6036.functions)];
      _0x2d6036.classes = [...new Set(_0x2d6036.classes)];
      _0x2d6036.exports = [...new Set(_0x2d6036.exports)];
      return _0x2d6036;
    }
    function _0x521184(_0x177a43, _0x822808) {
      const _0x161bb7 = {};
      const _0x3c61b3 = ["lib", "src", "app", "pages", "components", "utils", "services", "api"];
      const _0x4d1605 = _0x822808.filter(_0x225ed5 => _0x3c61b3.includes(_0x225ed5));
      const _0x4b500f = Object.values(_0x46be8c).flat();
      let _0x14fc9e = 0;
      const _0x79e41d = 40;
      function _0x209c3b(_0xf52107, _0x21ab2b, _0x38b2cb = 0) {
        if (_0x14fc9e >= _0x79e41d || _0x38b2cb > 2) {
          return;
        }
        if (!_0x701370.existsSync(_0xf52107)) {
          return;
        }
        try {
          const _0x4db18e = _0x701370.readdirSync(_0xf52107, {
            withFileTypes: true
          });
          for (const _0x1f04c1 of _0x4db18e) {
            if (_0x14fc9e >= _0x79e41d) {
              break;
            }
            const _0x3955db = _0xf9dcf5.join(_0xf52107, _0x1f04c1.name);
            const _0xf818a6 = _0x21ab2b ? _0x21ab2b + "/" + _0x1f04c1.name : _0x1f04c1.name;
            if (_0x1f04c1.isDirectory()) {
              if (["node_modules", "__tests__", "test", "tests", "dist", "build"].includes(_0x1f04c1.name)) {
                continue;
              }
              _0x209c3b(_0x3955db, _0xf818a6, _0x38b2cb + 1);
            } else if (_0x1f04c1.isFile()) {
              const _0x460076 = _0xf9dcf5.extname(_0x1f04c1.name);
              if (!_0x4b500f.includes(_0x460076)) {
                continue;
              }
              if (_0x1f04c1.name.includes(".test.") || _0x1f04c1.name.includes(".spec.")) {
                continue;
              }
              try {
                const _0x7b3a84 = _0x16c8ec(_0x3955db, _0x30af69);
                const _0x388833 = _0x5db491(_0x7b3a84);
                if (_0x388833.functions.length || _0x388833.classes.length || _0x388833.exports.length) {
                  _0x161bb7[_0xf818a6] = _0x388833;
                  _0x14fc9e++;
                }
              } catch {}
            }
          }
        } catch {}
      }
      for (const _0x4921f1 of _0x4d1605) {
        if (_0x14fc9e >= _0x79e41d) {
          break;
        }
        _0x209c3b(_0xf9dcf5.join(_0x177a43, _0x4921f1), _0x4921f1);
      }
      return _0x161bb7;
    }
    function _0x1855c4(_0x567c7b, _0x446b84, _0x4c68d6, _0x4472f4, _0x298aca = 0) {
      if (_0x298aca >= _0x4472f4) {
        return;
      }
      const _0xb5363e = _0xf9dcf5.join(_0x446b84, _0x4c68d6);
      if (!_0x701370.existsSync(_0xb5363e)) {
        return;
      }
      try {
        const _0xa81ab1 = _0x701370.readdirSync(_0xb5363e, {
          withFileTypes: true
        });
        const _0x40315e = [];
        const _0x44fd42 = [];
        for (const _0x1fc698 of _0xa81ab1) {
          if (_0x1fc698.isDirectory()) {
            if (!_0x381561.includes(_0x1fc698.name)) {
              _0x40315e.push(_0x1fc698.name);
            }
          } else {
            _0x44fd42.push(_0x1fc698.name);
          }
        }
        const _0x56bba4 = _0x4c68d6 || ".";
        const _0x3006bc = {
          dirs: _0x40315e,
          fileCount: _0x44fd42.length
        };
        _0x567c7b.structure[_0x56bba4] = _0x3006bc;
        for (const _0x3e6cde of _0x44fd42) {
          const _0x1a50de = _0xf9dcf5.extname(_0x3e6cde).toLowerCase() || "no-ext";
          _0x567c7b.fileStats[_0x1a50de] = (_0x567c7b.fileStats[_0x1a50de] || 0) + 1;
        }
        for (const _0xd03663 of _0x40315e) {
          _0x1855c4(_0x567c7b, _0x446b84, _0xf9dcf5.join(_0x4c68d6, _0xd03663), _0x4472f4, _0x298aca + 1);
        }
      } catch {}
    }
    function _0x36b0e0(_0x43bc5c, _0x4c2b45) {
      _0x43bc5c.health.hasReadme = _0x701370.existsSync(_0xf9dcf5.join(_0x4c2b45, "README.md"));
      const _0x34579b = [".eslintrc", ".eslintrc.js", ".eslintrc.json", "eslint.config.js", "biome.json"];
      _0x43bc5c.health.hasLinting = _0x34579b.some(_0x41f59a => _0x701370.existsSync(_0xf9dcf5.join(_0x4c2b45, _0x41f59a)));
      const _0x3eff1e = [".github/workflows", ".gitlab-ci.yml", ".circleci", "Jenkinsfile", ".travis.yml"];
      _0x43bc5c.health.hasCi = _0x3eff1e.some(_0x2d920f => _0x701370.existsSync(_0xf9dcf5.join(_0x4c2b45, _0x2d920f)));
      const _0x3b15a8 = ["tests", "__tests__", "test", "spec"];
      _0x43bc5c.health.hasTests = _0x43bc5c.health.hasTests || _0x3b15a8.some(_0x1400fb => _0x701370.existsSync(_0xf9dcf5.join(_0x4c2b45, _0x1400fb)));
    }
    function _0x251aaf(_0x628f25, _0x5d1b82) {
      const _0x1fa04e = {
        authentication: ["auth", "login", "session", "jwt", "oauth"],
        api: ["routes", "controllers", "handlers", "endpoints"],
        database: ["models", "schemas", "migrations", "seeds"],
        ui: ["components", "views", "pages", "layouts"],
        testing: ["__tests__", "test", "spec", ".test.", ".spec."],
        docs: ["docs", "documentation", "wiki"]
      };
      for (const [_0x559075, _0x12dfe8] of Object.entries(_0x1fa04e)) {
        const _0x1c516d = _0x12dfe8.some(_0x53b792 => {
          for (const _0x26668a of Object.keys(_0x628f25.structure)) {
            if (_0x26668a.toLowerCase().includes(_0x53b792)) {
              return true;
            }
          }
          return false;
        });
        if (_0x1c516d) {
          _0x628f25.implementedFeatures.push(_0x559075);
        }
      }
    }
    function _0x1c3d01(_0x3c7e74 = {}) {
      const _0x552dd9 = {
        ..._0x58c35b,
        ..._0x3c7e74
      };
      const _0x1cd84a = _0x552dd9;
      const _0x3971c6 = _0x1cd84a.cwd;
      const _0x5458ee = {
        summary: {
          totalDirs: 0,
          totalFiles: 0
        },
        topLevelDirs: [],
        frameworks: [],
        testFramework: null,
        hasTypeScript: false,
        implementedFeatures: [],
        symbols: {},
        health: {
          hasTests: false,
          hasLinting: false,
          hasCi: false,
          hasReadme: false
        },
        fileStats: {}
      };
      const _0x396e3b = {};
      const _0x3a4f68 = _0x275ec7("package.json", _0x3971c6);
      if (_0x3a4f68) {
        try {
          const _0x406917 = JSON.parse(_0x3a4f68);
          _0xe2e97c(_0x5458ee, _0x406917);
          _0xf548f7(_0x5458ee, _0x406917);
        } catch {}
      }
      _0x5458ee.hasTypeScript = _0x701370.existsSync(_0xf9dcf5.join(_0x3971c6, "tsconfig.json"));
      const _0x56ae61 = {
        structure: _0x396e3b,
        fileStats: _0x5458ee.fileStats
      };
      _0x1855c4(_0x56ae61, _0x3971c6, "", _0x1cd84a.depth === "thorough" ? 3 : 2);
      _0x5458ee.summary.totalDirs = Object.keys(_0x396e3b).length;
      _0x5458ee.summary.totalFiles = Object.values(_0x396e3b).reduce((_0x1db9ad, _0x563b29) => _0x1db9ad + (_0x563b29.fileCount || 0), 0);
      const _0x18709f = _0x396e3b["."];
      if (_0x18709f) {
        _0x5458ee.topLevelDirs = _0x18709f.dirs || [];
      }
      _0x36b0e0(_0x5458ee, _0x3971c6);
      if (_0x1cd84a.depth === "thorough") {
        const _0x307e26 = {
          ..._0x5458ee
        };
        _0x307e26.structure = _0x396e3b;
        _0x251aaf(_0x307e26, _0x3971c6);
        _0x5458ee.symbols = _0x521184(_0x3971c6, _0x5458ee.topLevelDirs);
      }
      const _0x3196eb = Object.entries(_0x5458ee.fileStats).sort((_0x24053c, _0x46be30) => _0x46be30[1] - _0x24053c[1]).slice(0, 10);
      _0x5458ee.fileStats = Object.fromEntries(_0x3196eb);
      return _0x5458ee;
    }
    const _0x35e079 = {
      DEFAULT_OPTIONS: _0x58c35b,
      EXCLUDE_DIRS: _0x381561,
      SOURCE_EXTENSIONS: _0x46be8c,
      scanCodebase: _0x1c3d01,
      detectFrameworks: _0xe2e97c,
      detectTestFramework: _0xf548f7,
      detectHealth: _0x36b0e0,
      findImplementedFeatures: _0x251aaf,
      extractSymbols: _0x5db491,
      scanFileSymbols: _0x521184,
      scanDirectory: _0x1855c4,
      shouldExclude: _0x2e536e,
      safeReadFile: _0x275ec7
    };
    _0x107589.exports = _0x35e079;
  }
});
var require_version = __commonJS({
  "../work/agent-sh__agentsys/lib/binary/version.js"(_0x566902, _0x135b62) {
    'use strict';

    "use strict";
    var _0x1b022c = "0.3.0";
    var _0x1edcff = "agent-analyzer";
    var _0x4a0d88 = "agent-sh/agent-analyzer";
    const _0xaf214c = {
      ANALYZER_MIN_VERSION: _0x1b022c,
      BINARY_NAME: _0x1edcff,
      GITHUB_REPO: _0x4a0d88
    };
    _0x135b62.exports = _0xaf214c;
  }
});
var require_binary = __commonJS({
  "../work/agent-sh__agentsys/lib/binary/index.js"(_0x197f67, _0x5783b3) {
    'use strict';

    var _0x2985be = require("fs");
    var _0x30d82b = require("path");
    var _0x2bfd59 = require("os");
    var _0x572849 = require("https");
    var _0x57a654 = require("child_process");
    var _0x418160 = require("crypto");
    var {
      promisify: _0x499bae
    } = require("util");
    var _0x2bb30f = _0x499bae(_0x57a654.execFile);
    var _0x1b37c8 = 268435456;
    var {
      ANALYZER_MIN_VERSION: _0x1c879f,
      BINARY_NAME: _0x8f30b7,
      GITHUB_REPO: _0xbb0eb4
    } = require_version();
    var _0xb91a14 = {
      "darwin-arm64": "aarch64-apple-darwin",
      "darwin-x64": "x86_64-apple-darwin",
      "linux-x64": "x86_64-unknown-linux-gnu",
      "linux-arm64": "aarch64-unknown-linux-gnu",
      "win32-x64": "x86_64-pc-windows-msvc"
    };
    function _0x1cd9eb() {
      const _0x248bd7 = process.platform === "win32" ? ".exe" : "";
      return _0x30d82b.join(_0x2bfd59.homedir(), ".agent-sh", "bin", _0x8f30b7 + _0x248bd7);
    }
    function _0xfe7c47() {
      const _0x37c50c = process.platform + "-" + process.arch;
      return _0xb91a14[_0x37c50c] || null;
    }
    function _0x34723f(_0x3ce9ba, _0x2fa52a) {
      if (!_0x3ce9ba) {
        return false;
      }
      const _0x4d0f02 = _0x3ce9ba.match(/^(\d+)\.(\d+)\.(\d+)/);
      if (!_0x4d0f02) {
        return false;
      }
      const _0x555f3d = _0x4d0f02.slice(1).map(Number);
      const _0x2ed283 = _0x2fa52a.split(".").map(Number);
      if (_0x555f3d[0] > _0x2ed283[0]) {
        return true;
      }
      if (_0x555f3d[0] < _0x2ed283[0]) {
        return false;
      }
      if (_0x555f3d[1] > _0x2ed283[1]) {
        return true;
      }
      if (_0x555f3d[1] < _0x2ed283[1]) {
        return false;
      }
      return _0x555f3d[2] >= _0x2ed283[2];
    }
    function _0x184edf() {
      const _0x3b2873 = _0x1cd9eb();
      if (!_0x2985be.existsSync(_0x3b2873)) {
        return null;
      }
      try {
        const _0x2650a3 = _0x57a654.execFileSync(_0x3b2873, ["--version"], {
          timeout: 5000,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"],
          windowsHide: true
        });
        const _0x519ef0 = _0x2650a3.trim().match(/(\d+\.\d+\.\d+)/);
        if (_0x519ef0) {
          return _0x519ef0[1];
        } else {
          return _0x2650a3.trim();
        }
      } catch (_0x1c4dda) {
        return null;
      }
    }
    function _0x40dff3() {
      const _0x5278bd = _0x1cd9eb();
      if (!_0x2985be.existsSync(_0x5278bd)) {
        return false;
      }
      const _0xa61723 = _0x184edf();
      return _0x34723f(_0xa61723, _0x1c879f);
    }
    async function _0x20c88a() {
      return _0x40dff3();
    }
    function _0x3b7ac7(_0x21debf, _0x26a2a5) {
      const _0xaa201d = process.platform === "win32" ? ".zip" : ".tar.gz";
      return "https://github.com/" + _0xbb0eb4 + "/releases/download/v" + _0x21debf + "/" + _0x8f30b7 + "-" + _0x26a2a5 + _0xaa201d;
    }
    function _0x2e751b(_0x5e994a) {
      return new Promise(function (_0x4d0b2d, _0xa4f050) {
        const _0x3e4f0c = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
        function _0x1440d8(_0x42274b, _0x3b95ca) {
          if (_0x3b95ca > 5) {
            _0xa4f050(new Error("Too many redirects fetching from " + _0x5e994a));
            return;
          }
          const _0x5722f6 = {
            "User-Agent": "agent-core/binary-resolver",
            Accept: "application/octet-stream"
          };
          if (_0x3e4f0c) {
            _0x5722f6.Authorization = "Bearer " + _0x3e4f0c;
          }
          const _0x485192 = {
            headers: _0x5722f6
          };
          _0x572849.get(_0x42274b, _0x485192, function (_0x49df6a) {
            const _0x196ac5 = _0x49df6a.statusCode;
            if (_0x196ac5 === 301 || _0x196ac5 === 302 || _0x196ac5 === 307 || _0x196ac5 === 308) {
              _0x49df6a.resume();
              _0x1440d8(_0x49df6a.headers.location, _0x3b95ca + 1);
              return;
            }
            if (_0x196ac5 !== 200) {
              _0x49df6a.resume();
              const _0x47169a = _0x196ac5 === 403 ? " (rate limited - set GITHUB_TOKEN env var)" : "";
              _0xa4f050(new Error("HTTP " + _0x196ac5 + _0x47169a + " fetching " + _0x42274b));
              return;
            }
            const _0x578e43 = [];
            _0x49df6a.on("data", function (_0x113a10) {
              _0x578e43.push(_0x113a10);
            });
            _0x49df6a.on("end", function () {
              _0x4d0b2d(Buffer.concat(_0x578e43));
            });
            _0x49df6a.on("error", _0xa4f050);
          }).on("error", _0xa4f050);
        }
        _0x1440d8(_0x5e994a, 0);
      });
    }
    function _0x1ab2d9(_0x45e957) {
      if (typeof _0x45e957 !== "string") {
        _0x45e957 = String(_0x45e957 || "");
      }
      const _0x55f24a = _0x45e957.trim().match(/^([A-Fa-f0-9]{64})\b/);
      if (!_0x55f24a) {
        throw new Error("Could not parse SHA-256 digest from sidecar body");
      }
      return _0x55f24a[1].toLowerCase();
    }
    async function _0x40440e(_0x38cbcb) {
      const _0x54ee00 = _0x38cbcb + ".sha256";
      const _0x96d3c = await _0x2e751b(_0x54ee00);
      return _0x1ab2d9(_0x96d3c.toString("utf8"));
    }
    function _0x11d2a8(_0x35bff4) {
      return _0x418160.createHash("sha256").update(_0x35bff4).digest("hex");
    }
    function _0x50fb3c(_0x588bed, _0x10f665, _0x46ddc5) {
      const _0x341939 = String(_0x10f665 || "").toLowerCase();
      const _0x1c1a58 = _0x11d2a8(_0x588bed);
      if (_0x341939 !== _0x1c1a58) {
        throw new Error("SHA-256 verification failed for " + _0x46ddc5 + ": expected " + _0x341939 + ", got " + _0x1c1a58 + ". This could indicate a tampered release. Do not extract.");
      }
    }
    function _0x38c307(_0x153da4) {
      if (!_0x153da4 || typeof _0x153da4 !== "string") {
        throw new Error("Refusing to extract archive with empty entry name");
      }
      const _0x1f6cb6 = _0x153da4.replace(/\\/g, "/").trim();
      if (_0x1f6cb6.length === 0) {
        throw new Error("Refusing to extract archive with empty entry name");
      }
      if (_0x1f6cb6.startsWith("//")) {
        throw new Error("Refusing to extract archive with UNC entry: " + _0x153da4);
      }
      if (_0x1f6cb6.startsWith("/")) {
        throw new Error("Refusing to extract archive with absolute entry: " + _0x153da4);
      }
      if (/^[A-Za-z]:[\\/]/.test(_0x153da4)) {
        throw new Error("Refusing to extract archive with Windows absolute entry: " + _0x153da4);
      }
      const _0x1c07cc = _0x1f6cb6.split("/").filter(function (_0x4043e4) {
        return _0x4043e4.length > 0;
      });
      for (let _0x229524 = 0; _0x229524 < _0x1c07cc.length; _0x229524++) {
        if (_0x1c07cc[_0x229524] === "..") {
          throw new Error("Refusing to extract archive with parent-traversal entry: " + _0x153da4);
        }
      }
    }
    function _0x4699c8(_0x11f880) {
      return new Promise(function (_0x130fb2, _0x2819ad) {
        const _0x421e67 = _0x57a654.spawn("tar", ["-tz"], {
          stdio: ["pipe", "pipe", "pipe"]
        });
        let _0x31d855 = "";
        let _0x10397e = "";
        _0x421e67.stdout.on("data", function (_0x2b5b1a) {
          _0x31d855 += _0x2b5b1a;
        });
        _0x421e67.stderr.on("data", function (_0x516668) {
          _0x10397e += _0x516668;
        });
        _0x421e67.on("error", _0x2819ad);
        _0x421e67.on("close", function (_0x63b0e0) {
          if (_0x63b0e0 !== 0) {
            _0x2819ad(new Error("tar -tz listing failed (code " + _0x63b0e0 + "): " + _0x10397e));
            return;
          }
          const _0xfdbd9 = _0x31d855.split(/\r?\n/).filter(function (_0x1f7299) {
            return _0x1f7299.length > 0;
          });
          _0x130fb2(_0xfdbd9);
        });
        _0x421e67.stdin.write(_0x11f880);
        _0x421e67.stdin.end();
      });
    }
    function _0x31f08d(_0x334f6d, _0x29400a) {
      const _0x1b5ab5 = _0x30d82b.resolve(_0x334f6d) + _0x30d82b.sep;
      const _0x4ed34c = _0x30d82b.resolve(_0x29400a);
      if (_0x4ed34c !== _0x30d82b.resolve(_0x334f6d) && !_0x4ed34c.startsWith(_0x1b5ab5)) {
        throw new Error("Extracted path escapes extract root: " + _0x29400a);
      }
    }
    function _0x43ad61(_0x2ffa79) {
      const _0x2a5f9d = [];
      const _0x4fc831 = [_0x2ffa79];
      while (_0x4fc831.length > 0) {
        const _0x21b859 = _0x4fc831.pop();
        const _0x55e602 = _0x2985be.lstatSync(_0x21b859);
        if (_0x55e602.isSymbolicLink()) {
          throw new Error("Refusing to follow symlink produced by extractor: " + _0x21b859);
        }
        if (_0x55e602.isDirectory()) {
          const _0xc8ebda = _0x2985be.readdirSync(_0x21b859);
          for (let _0x4fa940 = 0; _0x4fa940 < _0xc8ebda.length; _0x4fa940++) {
            _0x4fc831.push(_0x30d82b.join(_0x21b859, _0xc8ebda[_0x4fa940]));
          }
        } else if (_0x55e602.isFile()) {
          _0x2a5f9d.push(_0x21b859);
        }
      }
      return _0x2a5f9d;
    }
    function _0x4c1777(_0x1f22e2) {
      try {
        _0x2985be.rmSync(_0x1f22e2, {
          recursive: true,
          force: true
        });
      } catch (_0x5764b7) {}
    }
    async function _0x14410c(_0x27a570) {
      const _0x1c6838 = await _0x4699c8(_0x27a570);
      for (let _0x3b8443 = 0; _0x3b8443 < _0x1c6838.length; _0x3b8443++) {
        _0x38c307(_0x1c6838[_0x3b8443]);
      }
      const _0x579776 = _0x2985be.mkdtempSync(_0x30d82b.join(_0x2bfd59.tmpdir(), "agent-analyzer-tar-"));
      try {
        await new Promise(function (_0x4eec08, _0x56428f) {
          const _0x4aae81 = _0x57a654.spawn("tar", ["xz", "-C", _0x579776], {
            stdio: ["pipe", "pipe", "pipe"]
          });
          let _0x46ec8a = "";
          _0x4aae81.stderr.on("data", function (_0x272c64) {
            _0x46ec8a += _0x272c64;
          });
          _0x4aae81.on("error", _0x56428f);
          _0x4aae81.on("close", function (_0x596bc2) {
            if (_0x596bc2 !== 0) {
              _0x56428f(new Error("tar extraction failed (code " + _0x596bc2 + "): " + _0x46ec8a));
            } else {
              _0x4eec08();
            }
          });
          _0x4aae81.stdin.write(_0x27a570);
          _0x4aae81.stdin.end();
        });
        const _0x42c05b = _0x43ad61(_0x579776);
        for (let _0x1e46c4 = 0; _0x1e46c4 < _0x42c05b.length; _0x1e46c4++) {
          _0x31f08d(_0x579776, _0x42c05b[_0x1e46c4]);
        }
      } catch (_0x4a8f81) {
        _0x4c1777(_0x579776);
        throw _0x4a8f81;
      }
      return _0x579776;
    }
    var _0x5efa56 = ["$ErrorActionPreference = \"Stop\"", "$src  = $env:SRC_ZIP", "$dest = $env:DEST_DIR", "if ([string]::IsNullOrEmpty($src) -or [string]::IsNullOrEmpty($dest)) {", "  [Console]::Error.WriteLine(\"SRC_ZIP and DEST_DIR must both be set\"); exit 2", "}", "Add-Type -AssemblyName System.IO.Compression.FileSystem", "$destFull = [System.IO.Path]::GetFullPath($dest)", "if (-not $destFull.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {", "  $destFull = $destFull + [System.IO.Path]::DirectorySeparatorChar", "}", "$zip = [System.IO.Compression.ZipFile]::OpenRead($src)", "try {", "  foreach ($entry in $zip.Entries) {", "    $name = $entry.FullName", "    if ([string]::IsNullOrEmpty($name)) { continue }", "    $norm = $name -replace \"\\\\\",\"/\"", "    if ($norm.StartsWith(\"/\") -or $norm.StartsWith(\"//\")) {", "      [Console]::Error.WriteLine(\"Refusing absolute/UNC entry: \" + $name); exit 3", "    }", "    if ($name -match \"^[A-Za-z]:[\\\\/]\") {", "      [Console]::Error.WriteLine(\"Refusing Windows-absolute entry: \" + $name); exit 3", "    }", "    foreach ($part in ($norm -split \"/\")) {", "      if ($part -eq \"..\") {", "        [Console]::Error.WriteLine(\"Refusing parent-traversal entry: \" + $name); exit 3", "      }", "    }", "    $target = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($destFull, $norm))", "    if (-not $target.StartsWith($destFull, [System.StringComparison]::OrdinalIgnoreCase)) {", "      [Console]::Error.WriteLine(\"Entry escapes destination: \" + $name); exit 3", "    }", "    if ($entry.FullName.EndsWith(\"/\")) {", "      [System.IO.Directory]::CreateDirectory($target) | Out-Null", "    } else {", "      $parent = [System.IO.Path]::GetDirectoryName($target)", "      if ($parent) { [System.IO.Directory]::CreateDirectory($parent) | Out-Null }", "      [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $target, $true)", "    }", "  }", "} finally {", "  $zip.Dispose()", "}"].join("\r\n");
    async function _0x209f8f(_0x4411d1) {
      const _0x4b18e9 = _0x2985be.mkdtempSync(_0x30d82b.join(_0x2bfd59.tmpdir(), "agent-analyzer-zip-"));
      const _0x1d5fed = _0x30d82b.join(_0x4b18e9, "__archive.zip");
      const _0x125481 = _0x2985be.mkdtempSync(_0x30d82b.join(_0x2bfd59.tmpdir(), "agent-analyzer-ps-"));
      const _0x4ec6e2 = _0x30d82b.join(_0x125481, "extract.ps1");
      try {
        _0x2985be.writeFileSync(_0x1d5fed, _0x4411d1);
        _0x2985be.writeFileSync(_0x4ec6e2, _0x5efa56, "utf8");
        await new Promise(function (_0x25ce02, _0xfbc23a) {
          const _0x37462e = {
            SRC_ZIP: _0x1d5fed,
            DEST_DIR: _0x4b18e9
          };
          const _0x3ee97e = _0x57a654.execFile("powershell.exe", ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", _0x4ec6e2], {
            windowsHide: true,
            env: Object.assign({}, process.env, _0x37462e)
          }, function (_0x553a93, _0x21c479, _0xba0ea1) {
            if (_0x553a93) {
              _0xfbc23a(new Error("zip extraction failed: " + (_0xba0ea1 || _0x553a93.message)));
            } else {
              _0x25ce02();
            }
          });
          if (_0x3ee97e.stdin) {
            _0x3ee97e.stdin.end();
          }
        });
        try {
          _0x2985be.unlinkSync(_0x1d5fed);
        } catch (_0x557c49) {}
        const _0x1eb850 = _0x43ad61(_0x4b18e9);
        for (let _0x1dbd36 = 0; _0x1dbd36 < _0x1eb850.length; _0x1dbd36++) {
          _0x31f08d(_0x4b18e9, _0x1eb850[_0x1dbd36]);
        }
      } catch (_0x549bc4) {
        _0x4c1777(_0x4b18e9);
        throw _0x549bc4;
      } finally {
        _0x4c1777(_0x125481);
      }
      return _0x4b18e9;
    }
    function _0x1718b2(_0xe142f5, _0x44d95f) {
      const _0x598d22 = _0x43ad61(_0xe142f5);
      for (let _0x36bb74 = 0; _0x36bb74 < _0x598d22.length; _0x36bb74++) {
        if (_0x30d82b.basename(_0x598d22[_0x36bb74]) === _0x44d95f) {
          _0x31f08d(_0xe142f5, _0x598d22[_0x36bb74]);
          return _0x598d22[_0x36bb74];
        }
      }
      return null;
    }
    function _0x5e483e(_0x125106, _0x2e327a) {
      try {
        const _0x57d29d = _0x57a654.execFileSync("gh", ["attestation", "verify", _0x125106, "--repo", _0x2e327a, "--format", "json"], {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
          timeout: 60000,
          windowsHide: true
        });
        return {
          status: 0,
          stdout: _0x57d29d || "",
          stderr: ""
        };
      } catch (_0x2be86a) {
        return {
          status: typeof _0x2be86a.status === "number" ? _0x2be86a.status : null,
          stdout: _0x2be86a.stdout ? String(_0x2be86a.stdout) : "",
          stderr: _0x2be86a.stderr ? String(_0x2be86a.stderr) : _0x2be86a.message || ""
        };
      }
    }
    function _0x22809c(_0x2e0b73) {
      if (typeof _0x2e0b73 === "function") {
        try {
          return !!_0x2e0b73();
        } catch (_0x3df2c4) {
          return false;
        }
      }
      try {
        _0x57a654.execFileSync("gh", ["--version"], {
          stdio: "ignore",
          timeout: 5000,
          windowsHide: true
        });
        return true;
      } catch (_0x267374) {
        return false;
      }
    }
    function _0x2ecd35(_0x57ca8e, _0x51ccde) {
      const _0x43609c = _0x51ccde || {};
      const _0x139f1e = _0x43609c.repo || _0xbb0eb4;
      const _0x24ee06 = typeof _0x43609c.ghRunner === "function" ? _0x43609c.ghRunner : _0x5e483e;
      const _0x265678 = typeof _0x43609c.requireAttestation === "boolean" ? _0x43609c.requireAttestation : process.env.AGENT_ANALYZER_REQUIRE_ATTESTATION === "1";
      const _0x218741 = _0x22809c(_0x43609c.ghProbe);
      if (!_0x218741) {
        const _0x3a6c5d = "`gh` CLI not found on PATH";
        if (_0x265678) {
          return {
            status: "failed",
            reason: _0x3a6c5d + " (AGENT_ANALYZER_REQUIRE_ATTESTATION=1)"
          };
        }
        const _0x1dc29f = {
          status: "skipped",
          reason: _0x3a6c5d
        };
        return _0x1dc29f;
      }
      const _0x2f9613 = _0x24ee06(_0x57ca8e, _0x139f1e);
      if (_0x2f9613 && _0x2f9613.status === 0) {
        return {
          status: "verified"
        };
      }
      return {
        status: "failed",
        reason: "gh attestation verify exited with status " + (_0x2f9613 && _0x2f9613.status !== null ? _0x2f9613.status : "unknown"),
        stderr: _0x2f9613 && _0x2f9613.stderr || ""
      };
    }
    async function _0x886cd3(_0x37be8f, _0x2aea37) {
      const _0x1b3551 = _0x2aea37 || {};
      const _0xa308c8 = _0x1b3551.skipChecksum === true;
      const _0x2bba3c = _0x1b3551.skipAttestation === true;
      const _0x5b1aa8 = _0xfe7c47();
      if (!_0x5b1aa8) {
        throw new Error("Unsupported platform: " + process.platform + "-" + process.arch + ". Supported platforms: " + Object.keys(_0xb91a14).join(", "));
      }
      const _0x5d965a = _0x3b7ac7(_0x37be8f, _0x5b1aa8);
      const _0x2395d0 = _0x5d965a.substring(_0x5d965a.lastIndexOf("/") + 1);
      process.stderr.write("Downloading " + _0x8f30b7 + " v" + _0x37be8f + " for " + _0x5b1aa8 + "...\n");
      const _0x4bdab0 = _0x1cd9eb();
      const _0x480a29 = _0x30d82b.dirname(_0x4bdab0);
      _0x2985be.mkdirSync(_0x480a29, {
        recursive: true
      });
      let _0x245137;
      try {
        _0x245137 = await _0x2e751b(_0x5d965a);
      } catch (_0x35461c) {
        throw new Error("Failed to download " + _0x8f30b7 + ":\n  URL: " + _0x5d965a + "\n  Error: " + _0x35461c.message + "\n\nTo install manually:\n  1. Download: " + _0x5d965a + "\n  2. Extract the binary to: " + _0x480a29 + "\n  3. Ensure it is named: " + _0x30d82b.basename(_0x4bdab0));
      }
      if (_0xa308c8) {
        process.stderr.write("[WARN] skipChecksum=true - SHA-256 verification disabled. This is LOCAL DEV ONLY and MUST NOT be used in production.\n");
      } else {
        let _0x513898;
        try {
          _0x513898 = await _0x40440e(_0x5d965a);
        } catch (_0x59ad1f) {
          throw new Error("Failed to fetch SHA-256 sidecar for " + _0x2395d0 + ":\n  URL: " + _0x5d965a + ".sha256\n  Error: " + _0x59ad1f.message + "\n\nThe release may be missing its checksum file. Refusing to install an unverified binary. If this is a legacy release without sidecars, pass { skipChecksum: true } to downloadBinary() (LOCAL DEV ONLY).");
        }
        _0x50fb3c(_0x245137, _0x513898, _0x2395d0);
      }
      if (_0x2bba3c) {
        process.stderr.write("[WARN] skipAttestation=true - SLSA verification disabled. This is LOCAL DEV ONLY and MUST NOT be used in production.\n");
      } else {
        const _0x2248e6 = _0x2985be.mkdtempSync(_0x30d82b.join(_0x2bfd59.tmpdir(), "agent-analyzer-slsa-"));
        const _0x1d0f0b = _0x30d82b.join(_0x2248e6, _0x2395d0);
        try {
          _0x2985be.writeFileSync(_0x1d0f0b, _0x245137);
          const _0x1ad983 = {
            repo: _0xbb0eb4,
            requireAttestation: _0x1b3551.requireAttestation,
            ghRunner: _0x1b3551.ghRunner,
            ghProbe: _0x1b3551.ghProbe
          };
          const _0x4850e4 = _0x2ecd35(_0x1d0f0b, _0x1ad983);
          if (_0x4850e4.status === "verified") {
            process.stderr.write("[OK] SLSA attestation verified for " + _0x2395d0 + "\n");
          } else if (_0x4850e4.status === "skipped") {
            process.stderr.write("[WARN] SLSA attestation check skipped: " + _0x4850e4.reason + ". Install the GitHub CLI (`gh`) to enable provenance verification. Set AGENT_ANALYZER_REQUIRE_ATTESTATION=1 to require it.\n");
          } else {
            throw new Error("SLSA attestation verification failed for " + _0x2395d0 + ": " + _0x4850e4.reason + ". Refusing to execute binary." + (_0x4850e4.stderr ? "\n--- gh stderr ---\n" + _0x4850e4.stderr : ""));
          }
        } finally {
          _0x4c1777(_0x2248e6);
        }
      }
      const _0x83a231 = _0x30d82b.basename(_0x4bdab0);
      let _0xe37aa7;
      try {
        if (process.platform === "win32") {
          _0xe37aa7 = await _0x209f8f(_0x245137);
        } else {
          _0xe37aa7 = await _0x14410c(_0x245137);
        }
        const _0x227f43 = _0x1718b2(_0xe37aa7, _0x83a231);
        if (!_0x227f43) {
          throw new Error("Expected binary \"" + _0x83a231 + "\" not found inside archive " + _0x2395d0 + ". Archive layout may have changed.");
        }
        _0x2985be.copyFileSync(_0x227f43, _0x4bdab0);
      } finally {
        if (_0xe37aa7) {
          _0x4c1777(_0xe37aa7);
        }
      }
      if (process.platform !== "win32") {
        _0x2985be.chmodSync(_0x4bdab0, 493);
      }
      const _0x2b75df = _0x184edf();
      if (!_0x2b75df) {
        throw new Error(_0x8f30b7 + " was downloaded to " + _0x4bdab0 + " but could not be executed. Check the file is a valid binary for this platform.");
      }
      return _0x4bdab0;
    }
    async function _0x3454c2(_0x30ed3a) {
      const _0x5e0a79 = _0x30ed3a || {};
      const _0x449546 = _0x5e0a79.version || _0x1c879f;
      const _0x157055 = _0x1cd9eb();
      if (_0x2985be.existsSync(_0x157055)) {
        const _0x406087 = _0x184edf();
        if (_0x34723f(_0x406087, _0x1c879f)) {
          return _0x157055;
        }
      }
      return _0x886cd3(_0x449546, {
        skipChecksum: _0x5e0a79.skipChecksum === true,
        skipAttestation: _0x5e0a79.skipAttestation === true,
        requireAttestation: _0x5e0a79.requireAttestation,
        ghRunner: _0x5e0a79.ghRunner,
        ghProbe: _0x5e0a79.ghProbe
      });
    }
    function _0x16556d(_0x11f07b) {
      const _0x280532 = _0x1cd9eb();
      if (_0x2985be.existsSync(_0x280532)) {
        const _0x1a28f9 = _0x184edf();
        if (_0x34723f(_0x1a28f9, _0x1c879f)) {
          return _0x280532;
        }
      }
      const _0x36bb63 = _0x11f07b && _0x11f07b.version || _0x1c879f;
      const _0x3a0524 = !!_0x11f07b && !!_0x11f07b.skipChecksum;
      const _0x3d4309 = !!_0x11f07b && !!_0x11f07b.skipAttestation;
      const _0x5ec6a7 = _0x11f07b && typeof _0x11f07b.requireAttestation === "boolean" ? _0x11f07b.requireAttestation : undefined;
      const _0x2f5d15 = __filename;
      const _0x34aba6 = {
        version: _0x36bb63,
        skipChecksum: _0x3a0524,
        skipAttestation: _0x3d4309
      };
      const _0x45b4b4 = _0x34aba6;
      if (_0x5ec6a7 !== undefined) {
        _0x45b4b4.requireAttestation = _0x5ec6a7;
      }
      const _0x2cb6fa = ["var b = require(" + JSON.stringify(_0x2f5d15) + ");", "b.ensureBinary(" + JSON.stringify(_0x45b4b4) + ")", "  .then(function(p) { process.stdout.write(p); })", "  .catch(function(e) { process.stderr.write(e.message); process.exit(1); });"];
      try {
        const _0x90d43d = _0x57a654.execFileSync(process.execPath, ["-e", _0x2cb6fa.join("\n")], {
          encoding: "utf8",
          stdio: ["pipe", "pipe", "inherit"],
          timeout: 120000
        });
        return _0x90d43d.trim() || _0x280532;
      } catch (_0x5f1c46) {
        throw new Error("Failed to ensure binary (sync): " + _0x5f1c46.message);
      }
    }
    function _0x25ad28(_0x1be808, _0x5538e0) {
      const _0x4c9e4f = _0x16556d();
      const _0x310e55 = {
        encoding: "utf8",
        windowsHide: true,
        maxBuffer: _0x1b37c8
      };
      const _0x47f53b = Object.assign(_0x310e55, _0x5538e0);
      if (!_0x47f53b.stdio) {
        _0x47f53b.stdio = ["pipe", "pipe", "pipe"];
      }
      const _0x20cd96 = _0x57a654.execFileSync(_0x4c9e4f, _0x1be808, _0x47f53b);
      if (typeof _0x20cd96 === "string") {
        return _0x20cd96;
      } else {
        return _0x20cd96.toString("utf8");
      }
    }
    async function _0x5af810(_0x314c56, _0x5c7517) {
      const _0x36a0e6 = await _0x3454c2();
      const _0x1d77f6 = {
        encoding: "utf8",
        windowsHide: true,
        maxBuffer: _0x1b37c8
      };
      const _0x3a1298 = Object.assign(_0x1d77f6, _0x5c7517);
      const _0x2b3c58 = await _0x2bb30f(_0x36a0e6, _0x314c56, _0x3a1298);
      return _0x2b3c58.stdout;
    }
    const _0x315e3f = {
      ensureBinary: _0x3454c2,
      ensureBinarySync: _0x16556d,
      runAnalyzer: _0x25ad28,
      runAnalyzerAsync: _0x5af810,
      getBinaryPath: _0x1cd9eb,
      getVersion: _0x184edf,
      getPlatformKey: _0xfe7c47,
      isAvailable: _0x40dff3,
      isAvailableAsync: _0x20c88a,
      meetsMinimumVersion: _0x34723f,
      buildDownloadUrl: _0x3b7ac7,
      PLATFORM_MAP: _0xb91a14,
      parseSha256Sidecar: _0x1ab2d9,
      verifySha256: _0x50fb3c,
      sha256Hex: _0x11d2a8,
      assertSafeArchiveEntry: _0x38c307,
      assertInsideRoot: _0x31f08d,
      downloadBinary: _0x886cd3,
      verifySlsaAttestation: _0x2ecd35,
      isGhAvailable: _0x22809c,
      extractTarGzToScratch: _0x14410c,
      extractZipToScratch: _0x209f8f,
      _EXTRACT_ZIP_PS1: _0x5efa56
    };
    _0x5783b3.exports = _0x315e3f;
  }
});
var require_installer = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/installer.js"(_0x20bd32, _0x71ef88) {
    'use strict';

    var _0x5919b9 = require_binary();
    async function _0x2ec790() {
      if (_0x5919b9.isAvailable()) {
        return {
          found: true,
          version: _0x5919b9.getVersion(),
          tool: "agent-analyzer"
        };
      }
      try {
        await _0x5919b9.ensureBinary();
        return {
          found: true,
          version: _0x5919b9.getVersion(),
          tool: "agent-analyzer"
        };
      } catch (_0x5f7c5c) {
        const _0x3e8080 = {
          found: false,
          error: _0x5f7c5c.message,
          tool: "agent-analyzer"
        };
        return _0x3e8080;
      }
    }
    function _0xe69791() {
      if (_0x5919b9.isAvailable()) {
        return {
          found: true,
          version: _0x5919b9.getVersion(),
          tool: "agent-analyzer"
        };
      }
      try {
        _0x5919b9.ensureBinarySync();
        return {
          found: true,
          version: _0x5919b9.getVersion(),
          tool: "agent-analyzer"
        };
      } catch (_0x507d4b) {
        const _0x21fde8 = {
          found: false,
          error: _0x507d4b.message,
          tool: "agent-analyzer"
        };
        return _0x21fde8;
      }
    }
    function _0xd95717() {
      return true;
    }
    function _0x326998() {
      return "agent-analyzer is downloaded automatically on first use from https://github.com/agent-sh/agent-analyzer/releases";
    }
    function _0x20f6a1() {
      return "0.3.0";
    }
    const _0x532fa3 = {
      checkInstalled: _0x2ec790,
      checkInstalledSync: _0xe69791,
      meetsMinimumVersion: _0xd95717,
      getInstallInstructions: _0x326998,
      getMinimumVersion: _0x20f6a1,
      getCommand: () => null
    };
    _0x71ef88.exports = _0x532fa3;
  }
});
var require_state_dir = __commonJS({
  "../work/agent-sh__agentsys/lib/platform/state-dir.js"(_0x10e3b1, _0xfbeccc) {
    var _0x23ba57 = require("fs");
    var _0x3c4eee = require("path");
    var _0x43df7f = new Map();
    function _0x40d632(_0x4974df) {
      try {
        return _0x23ba57.statSync(_0x4974df).isDirectory();
      } catch {
        return false;
      }
    }
    function _0x5ad6a2(_0x1c58d3 = process.cwd()) {
      if (process.env.AI_STATE_DIR) {
        return process.env.AI_STATE_DIR;
      }
      const _0x4ca1c3 = _0x3c4eee.resolve(_0x1c58d3);
      const _0x3dcec2 = _0x43df7f.get(_0x4ca1c3);
      if (_0x3dcec2) {
        return _0x3dcec2;
      }
      if (process.env.OPENCODE_CONFIG || process.env.OPENCODE_CONFIG_DIR) {
        _0x43df7f.set(_0x4ca1c3, ".opencode");
        return ".opencode";
      }
      try {
        const _0x3c8e9f = _0x3c4eee.join(_0x1c58d3, ".opencode");
        if (_0x40d632(_0x3c8e9f)) {
          _0x43df7f.set(_0x4ca1c3, ".opencode");
          return ".opencode";
        }
      } catch {}
      if (process.env.CODEX_HOME) {
        _0x43df7f.set(_0x4ca1c3, ".codex");
        return ".codex";
      }
      try {
        const _0x1f9225 = _0x3c4eee.join(_0x1c58d3, ".codex");
        if (_0x40d632(_0x1f9225)) {
          _0x43df7f.set(_0x4ca1c3, ".codex");
          return ".codex";
        }
      } catch {}
      _0x43df7f.set(_0x4ca1c3, ".claude");
      return ".claude";
    }
    function _0x4cffd9(_0x4a581b = process.cwd()) {
      return _0x3c4eee.join(_0x4a581b, _0x5ad6a2(_0x4a581b));
    }
    function _0x5a6517(_0x502b0a = process.cwd()) {
      const _0x5dc517 = _0x5ad6a2(_0x502b0a);
      if (process.env.AI_STATE_DIR) {
        return "custom";
      }
      switch (_0x5dc517) {
        case ".opencode":
          return "opencode";
        case ".codex":
          return "codex";
        case ".claude":
          return "claude";
        default:
          return "unknown";
      }
    }
    function _0x570fe4() {
      _0x43df7f.clear();
    }
    const _0x2e667b = {
      getStateDir: _0x5ad6a2,
      getStateDirPath: _0x4cffd9,
      getPlatformName: _0x5a6517,
      clearCache: _0x570fe4
    };
    _0xfbeccc.exports = _0x2e667b;
  }
});
var require_atomic_write = __commonJS({
  "../work/agent-sh__agentsys/lib/utils/atomic-write.js"(_0x488c13, _0x1a8cee) {
    var _0x38f7b4 = require("fs");
    var _0x35cef2 = require("path");
    var _0x1f7374 = require("crypto");
    function _0x52d94f(_0x1264cc) {
      const _0xe7acdc = _0x35cef2.dirname(_0x1264cc);
      const _0x5e71bc = _0x35cef2.basename(_0x1264cc);
      const _0x4592c8 = _0x1f7374.randomBytes(6).toString("hex");
      return _0x35cef2.join(_0xe7acdc, "." + _0x5e71bc + "." + _0x4592c8 + ".tmp");
    }
    function _0x350dda(_0x2fb9f8, _0x28d275, _0x39da3e = {}) {
      const {
        encoding = "utf8",
        mode = 420
      } = _0x39da3e;
      const _0x484bc0 = _0x35cef2.dirname(_0x2fb9f8);
      if (!_0x38f7b4.existsSync(_0x484bc0)) {
        _0x38f7b4.mkdirSync(_0x484bc0, {
          recursive: true
        });
      }
      const _0x35c8af = _0x52d94f(_0x2fb9f8);
      try {
        const _0x297a4b = {
          encoding: encoding,
          mode: mode
        };
        _0x38f7b4.writeFileSync(_0x35c8af, _0x28d275, _0x297a4b);
        _0x38f7b4.renameSync(_0x35c8af, _0x2fb9f8);
        return true;
      } catch (_0x12e77d) {
        try {
          if (_0x38f7b4.existsSync(_0x35c8af)) {
            _0x38f7b4.unlinkSync(_0x35c8af);
          }
        } catch {}
        throw _0x12e77d;
      }
    }
    function _0x48074c(_0x26edd9, _0x17a0b2, _0x4fc28a = {}) {
      const {
        indent = 2,
        ..._0x267e67
      } = _0x4fc28a;
      const _0x5e849a = JSON.stringify(_0x17a0b2, null, indent);
      return _0x350dda(_0x26edd9, _0x5e849a, _0x267e67);
    }
    const _0x161bc1 = {
      writeFileAtomic: _0x350dda,
      writeJsonAtomic: _0x48074c,
      getTempPath: _0x52d94f
    };
    _0x1a8cee.exports = _0x161bc1;
  }
});
var require_cache = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/cache.js"(_0x2893cc, _0x128e38) {
    'use strict';

    var _0x35cb15 = require("fs");
    var _0x8a4d3d = require("path");
    var {
      getStateDirPath: _0x473ce7
    } = require_state_dir();
    var {
      writeJsonAtomic: _0xd01fc8,
      writeFileAtomic: _0x319b64
    } = require_atomic_write();
    var _0x10c506 = "repo-map.json";
    var _0x21da6b = "repo-map.stale";
    var _0x21e512 = "repo-intel.json";
    function _0x3bddbd(_0xa3e036) {
      return _0x8a4d3d.join(_0x473ce7(_0xa3e036), _0x10c506);
    }
    function _0x27b01d(_0x4df774) {
      return _0x8a4d3d.join(_0x473ce7(_0x4df774), _0x21e512);
    }
    function _0x24aae6(_0x186f9f) {
      return _0x8a4d3d.join(_0x473ce7(_0x186f9f), _0x21da6b);
    }
    function _0x37ebcc(_0x41e9f9) {
      const _0xe287ba = _0x473ce7(_0x41e9f9);
      if (!_0x35cb15.existsSync(_0xe287ba)) {
        _0x35cb15.mkdirSync(_0xe287ba, {
          recursive: true
        });
      }
      return _0xe287ba;
    }
    function _0x29d689(_0x25ac12) {
      const _0x565f58 = _0x3bddbd(_0x25ac12);
      if (!_0x35cb15.existsSync(_0x565f58)) {
        return null;
      }
      try {
        const _0x87020b = _0x35cb15.readFileSync(_0x565f58, "utf8");
        return JSON.parse(_0x87020b);
      } catch {
        return null;
      }
    }
    function _0x59fc22(_0x1a3c9f, _0x42f8c9) {
      _0x37ebcc(_0x1a3c9f);
      const _0x414e6b = _0x3bddbd(_0x1a3c9f);
      const _0x4095a5 = {
        ..._0x42f8c9,
        updated: new Date().toISOString()
      };
      _0xd01fc8(_0x414e6b, _0x4095a5);
      _0x56491f(_0x1a3c9f);
    }
    function _0x46eeab(_0x1477ec) {
      return _0x35cb15.existsSync(_0x3bddbd(_0x1477ec));
    }
    function _0x3f2aa2(_0x5b7aad) {
      _0x37ebcc(_0x5b7aad);
      _0x319b64(_0x24aae6(_0x5b7aad), new Date().toISOString());
    }
    function _0x56491f(_0x112118) {
      const _0x23c72e = _0x24aae6(_0x112118);
      if (_0x35cb15.existsSync(_0x23c72e)) {
        _0x35cb15.unlinkSync(_0x23c72e);
      }
    }
    function _0x270f36(_0x5dab83) {
      return _0x35cb15.existsSync(_0x24aae6(_0x5dab83));
    }
    function _0x2b3ae7(_0x2e6a5b) {
      const _0x4a379d = _0x29d689(_0x2e6a5b);
      if (!_0x4a379d) {
        return null;
      }
      return {
        generated: _0x4a379d.generated,
        updated: _0x4a379d.updated,
        commit: _0x4a379d.git?.commit,
        branch: _0x4a379d.git?.branch,
        files: Object.keys(_0x4a379d.files || {}).length,
        symbols: _0x4a379d.stats?.totalSymbols || 0,
        languages: _0x4a379d.project?.languages || []
      };
    }
    const _0x47cdb5 = {
      load: _0x29d689,
      save: _0x59fc22,
      exists: _0x46eeab,
      getStatus: _0x2b3ae7,
      getMapPath: _0x3bddbd,
      getPath: _0x27b01d,
      getStateDirPath: _0x473ce7,
      markStale: _0x3f2aa2,
      clearStale: _0x56491f,
      isMarkedStale: _0x270f36
    };
    _0x128e38.exports = _0x47cdb5;
  }
});
var require_updater = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/updater.js"(_0xf4852e, _0x37b686) {
    'use strict';

    var {
      execFileSync: _0x3daa9e
    } = require("child_process");
    var _0x38325d = require_cache();
    function _0x33f117(_0x174560, _0x5d01d8) {
      const _0xc7fee4 = {
        isStale: false,
        reason: null,
        commitsBehind: 0,
        suggestFullRebuild: false
      };
      if (!_0x5d01d8?.git?.commit) {
        _0xc7fee4.isStale = true;
        _0xc7fee4.reason = "Missing base commit in repo-map";
        _0xc7fee4.suggestFullRebuild = true;
        return _0xc7fee4;
      }
      if (_0x38325d.isMarkedStale(_0x174560)) {
        _0xc7fee4.isStale = true;
        _0xc7fee4.reason = "Marked stale by hook";
      }
      if (!_0x1ef6b3(_0x174560, _0x5d01d8.git.commit)) {
        _0xc7fee4.isStale = true;
        _0xc7fee4.reason = "Base commit no longer exists (rebased?)";
        _0xc7fee4.suggestFullRebuild = true;
        return _0xc7fee4;
      }
      const _0x217757 = _0x139d96(_0x174560);
      if (_0x217757 && _0x5d01d8.git.branch && _0x217757 !== _0x5d01d8.git.branch) {
        _0xc7fee4.isStale = true;
        _0xc7fee4.reason = "Branch changed from " + _0x5d01d8.git.branch + " to " + _0x217757;
        _0xc7fee4.suggestFullRebuild = true;
      }
      const _0x2ca6c1 = _0x5497bc(_0x174560, _0x5d01d8.git.commit);
      if (_0x2ca6c1 > 0) {
        _0xc7fee4.isStale = true;
        _0xc7fee4.commitsBehind = _0x2ca6c1;
        if (!_0xc7fee4.reason) {
          _0xc7fee4.reason = _0x2ca6c1 + " commits behind HEAD";
        }
      }
      return _0xc7fee4;
    }
    function _0x1602d6(_0x2524f6) {
      return typeof _0x2524f6 === "string" && /^[0-9a-fA-F]{4,40}$/.test(_0x2524f6);
    }
    function _0x1ef6b3(_0x26d74b, _0x512012) {
      if (!_0x1602d6(_0x512012)) {
        return false;
      }
      try {
        _0x3daa9e("git", ["cat-file", "-e", _0x512012], {
          cwd: _0x26d74b,
          stdio: ["pipe", "pipe", "pipe"]
        });
        return true;
      } catch {
        return false;
      }
    }
    function _0x139d96(_0x2ef13e) {
      try {
        return _0x3daa9e("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
          cwd: _0x2ef13e,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"]
        }).trim();
      } catch {
        return null;
      }
    }
    function _0x5497bc(_0x216523, _0x4fa312) {
      if (!_0x1602d6(_0x4fa312)) {
        return 0;
      }
      try {
        const _0x2bd8af = _0x3daa9e("git", ["rev-list", _0x4fa312 + "..HEAD", "--count"], {
          cwd: _0x216523,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"]
        }).trim();
        return Number(_0x2bd8af) || 0;
      } catch {
        return 0;
      }
    }
    const _0x2c00bb = {
      checkStaleness: _0x33f117
    };
    _0x37b686.exports = _0x2c00bb;
  }
});
var require_converter = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/converter.js"(_0x12c6b3, _0x14aeb1) {
    'use strict';

    var _0x872745 = require("path");
    var _0x1e7ca5 = {
      ".js": "javascript",
      ".jsx": "javascript",
      ".mjs": "javascript",
      ".cjs": "javascript",
      ".ts": "typescript",
      ".tsx": "typescript",
      ".mts": "typescript",
      ".cts": "typescript",
      ".py": "python",
      ".pyw": "python",
      ".rs": "rust",
      ".go": "go",
      ".java": "java"
    };
    var _0x27c465 = new Set(["class", "struct", "interface", "enum", "impl"]);
    var _0x2e2d6f = new Set(["trait", "type-alias"]);
    var _0x1d3eb8 = new Set(["method", "arrow", "closure"]);
    var _0x511249 = new Set(["constant", "variable", "const", "field", "property"]);
    function _0x5cc9c1(_0x8cd2b9) {
      return _0x1e7ca5[_0x872745.extname(_0x8cd2b9).toLowerCase()] || "unknown";
    }
    function _0x5b3bd2(_0x287018) {
      const _0x4a6649 = new Set();
      for (const _0x97f1dc of _0x287018) {
        const _0x3c3aa4 = _0x5cc9c1(_0x97f1dc);
        if (_0x3c3aa4 !== "unknown") {
          _0x4a6649.add(_0x3c3aa4);
        }
      }
      return Array.from(_0x4a6649);
    }
    function _0x51f9fb(_0x16bda8, _0x4affb4) {
      const _0x43f1d1 = new Set((_0x4affb4.exports || []).map(_0x34138e => _0x34138e.name));
      const _0x7cdcab = (_0x4affb4.exports || []).map(_0x16759b => ({
        name: _0x16759b.name,
        kind: _0x16759b.kind,
        line: _0x16759b.line
      }));
      const _0x4c5066 = [];
      const _0x59289d = [];
      const _0x5ad908 = [];
      const _0x5589c9 = [];
      for (const _0x20c91b of _0x4affb4.definitions || []) {
        const _0x146961 = {
          name: _0x20c91b.name,
          kind: _0x20c91b.kind,
          line: _0x20c91b.line,
          exported: _0x43f1d1.has(_0x20c91b.name)
        };
        if (_0x20c91b.kind === "function" || _0x1d3eb8.has(_0x20c91b.kind)) {
          _0x4c5066.push(_0x146961);
        } else if (_0x27c465.has(_0x20c91b.kind)) {
          _0x59289d.push(_0x146961);
        } else if (_0x2e2d6f.has(_0x20c91b.kind)) {
          _0x5ad908.push(_0x146961);
        } else if (_0x511249.has(_0x20c91b.kind)) {
          _0x5589c9.push(_0x146961);
        } else {
          _0x5589c9.push(_0x146961);
        }
      }
      const _0x94ff64 = (_0x4affb4.imports || []).map(_0x4bf86d => ({
        source: _0x4bf86d.from,
        kind: "import",
        names: _0x4bf86d.names || []
      }));
      const _0x1d7461 = {
        exports: _0x7cdcab,
        functions: _0x4c5066,
        classes: _0x59289d,
        types: _0x5ad908,
        constants: _0x5589c9
      };
      return {
        language: _0x5cc9c1(_0x16bda8),
        symbols: _0x1d7461,
        imports: _0x94ff64
      };
    }
    function _0x4b6744(_0xfe0b71) {
      const _0x489f85 = {};
      let _0x15145f = 0;
      let _0x38af3d = 0;
      for (const [_0x3e3b58, _0x453455] of Object.entries(_0xfe0b71.symbols || {})) {
        _0x489f85[_0x3e3b58] = _0x51f9fb(_0x3e3b58, _0x453455);
        const _0x17d517 = _0x489f85[_0x3e3b58].symbols;
        _0x15145f += _0x17d517.functions.length + _0x17d517.classes.length + _0x17d517.types.length + _0x17d517.constants.length;
        _0x38af3d += _0x489f85[_0x3e3b58].imports.length;
      }
      return {
        version: "2.0",
        generated: _0xfe0b71.generated || new Date().toISOString(),
        git: _0xfe0b71.git ? {
          commit: _0xfe0b71.git.analyzedUpTo
        } : undefined,
        project: {
          languages: _0x5b3bd2(Object.keys(_0x489f85))
        },
        stats: {
          totalFiles: Object.keys(_0x489f85).length,
          totalSymbols: _0x15145f,
          totalImports: _0x38af3d,
          errors: []
        },
        files: _0x489f85
      };
    }
    const _0x2a670f = {
      convertIntelToRepoMap: _0x4b6744,
      convertFile: _0x51f9fb,
      detectLanguage: _0x5cc9c1
    };
    _0x14aeb1.exports = _0x2a670f;
  }
});
var require_queries = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/queries.js"(_0x2577ab, _0x2c749a) {
    'use strict';

    var _0xd56cbd = require("fs");
    var _0x5ab9ea = require("path");
    var {
      getStateDir: _0x2b4795
    } = require_state_dir();
    var _0x37988e = require_binary();
    var _0x26d5cc = class extends Error {
      constructor(_0x55c9b8) {
        super("repo-intel map not found at " + _0x55c9b8 + ". Run `agentsys repo-intel update` to generate it first.");
        this.name = "RepoIntelMissingError";
        this.code = "REPO_INTEL_MISSING";
        this.mapFile = _0x55c9b8;
      }
    };
    var _0x27c861 = "repo-intel.json";
    function _0x177c3b(_0x417fb7) {
      const _0x45f473 = _0x2b4795(_0x417fb7);
      return _0x5ab9ea.join(_0x417fb7, _0x45f473, _0x27c861);
    }
    function _0x2374d0(_0x49b819) {
      const _0x7de15e = _0x177c3b(_0x49b819);
      if (!_0xd56cbd.existsSync(_0x7de15e)) {
        throw new _0x26d5cc(_0x7de15e);
      }
      return _0x7de15e;
    }
    function _0x322386(_0x34ff14, _0x442e10, _0x396ea8) {
      const _0x57ccb8 = _0x2374d0(_0x396ea8);
      const _0x3bad02 = ["repo-intel", "query", _0x34ff14, ..._0x442e10, "--map-file", _0x57ccb8, _0x396ea8];
      let _0x50110b;
      try {
        _0x50110b = _0x37988e.runAnalyzer(_0x3bad02);
      } catch (_0x3aee03) {
        throw new Error("repo-intel query failed [" + _0x34ff14 + "]: " + _0x3aee03.message, {
          cause: _0x3aee03
        });
      }
      let _0x2a43cf;
      try {
        _0x2a43cf = JSON.parse(_0x50110b);
      } catch (_0x5d3cb8) {
        const _0x134b68 = _0x50110b.slice(0, 200);
        throw new Error("repo-intel query [" + _0x34ff14 + "] returned non-JSON output: " + _0x134b68);
      }
      return _0x2a43cf;
    }
    function _0x1df337(_0x1f2dfc, _0x1dbd9e) {
      if (typeof _0x1f2dfc !== "string" || _0x1f2dfc.length === 0) {
        throw new TypeError(_0x1dbd9e + " must be a non-empty string");
      }
    }
    function _0x20e691(_0x56f961, _0x13d35b = {}) {
      const _0x18982a = [];
      if (_0x13d35b.limit != null) {
        _0x18982a.push("--top", String(_0x13d35b.limit));
      }
      return _0x322386("hotspots", _0x18982a, _0x56f961);
    }
    function _0x4a0af0(_0x431c2f, _0x96960a, _0x422dce = {}) {
      _0x1df337(_0x96960a, "coupling: file");
      const _0x4cba07 = [_0x96960a];
      if (_0x422dce.limit != null) {
        _0x4cba07.push("--top", String(_0x422dce.limit));
      }
      return _0x322386("coupling", _0x4cba07, _0x431c2f);
    }
    function _0x231f6a(_0x56320c, _0x2e3480 = {}) {
      const _0xd269d1 = [];
      if (_0x2e3480.adjustForAi) {
        _0xd269d1.push("--adjust-for-ai");
      }
      if (_0x2e3480.limit != null) {
        _0xd269d1.push("--top", String(_0x2e3480.limit));
      }
      return _0x322386("bus-factor", _0xd269d1, _0x56320c);
    }
    function _0x4a05be(_0x205a0b, _0x476104 = {}) {
      const _0x400541 = [];
      if (_0x476104.limit != null) {
        _0x400541.push("--top", String(_0x476104.limit));
      }
      if (_0x476104.minChanges != null) {
        _0x400541.push("--min-changes", String(_0x476104.minChanges));
      }
      return _0x322386("test-gaps", _0x400541, _0x205a0b);
    }
    function _0x460715(_0x4a3250, _0x16b53e) {
      if (!Array.isArray(_0x16b53e)) {
        throw new TypeError("diffRisk: files must be an array of strings");
      }
      if (!_0x16b53e.every(_0x5408d1 => typeof _0x5408d1 === "string")) {
        throw new TypeError("diffRisk: all entries in files must be strings");
      }
      const _0x57344b = _0x16b53e.join(",");
      if (_0x57344b.length > 30000) {
        throw new RangeError("diffRisk: files argument exceeds 30000 character limit (got " + _0x57344b.length + ")");
      }
      const _0x360edc = ["--files", _0x57344b];
      return _0x322386("diff-risk", _0x360edc, _0x4a3250);
    }
    function _0x4725d8(_0x3fc73b, _0x49324e, _0x1e26e2) {
      _0x1df337(_0x49324e, "dependents: symbol");
      const _0xf2282f = [_0x49324e];
      if (_0x1e26e2 != null) {
        _0x1df337(_0x1e26e2, "dependents: file");
        _0xf2282f.push("--file", _0x1e26e2);
      }
      return _0x322386("dependents", _0xf2282f, _0x3fc73b);
    }
    function _0x286de8(_0x577835, _0x4463c2 = {}) {
      const _0x408673 = [];
      if (_0x4463c2.limit != null) {
        _0x408673.push("--top", String(_0x4463c2.limit));
      }
      return _0x322386("bugspots", _0x408673, _0x577835);
    }
    function _0x73abfb(_0x2375dd) {
      return _0x322386("health", [], _0x2375dd);
    }
    function _0x585afe(_0x39b075) {
      return _0x322386("communities", [], _0x39b075);
    }
    function _0x9274a8(_0x34ec1d, _0x44211d = {}) {
      const _0x250c41 = [];
      if (_0x44211d.limit != null) {
        _0x250c41.push("--top", String(_0x44211d.limit));
      }
      return _0x322386("boundaries", _0x250c41, _0x34ec1d);
    }
    function _0x16a3bb(_0x5f20f1, _0x42d558) {
      _0x1df337(_0x42d558, "areaOf: file");
      return _0x322386("area-of", [_0x42d558], _0x5f20f1);
    }
    function _0x3df0a4(_0x5e81c1, _0x1134d1) {
      if (typeof _0x1134d1 !== "number" || !Number.isInteger(_0x1134d1) || _0x1134d1 < 0) {
        throw new TypeError("communityHealth: id must be a non-negative integer");
      }
      return _0x322386("community-health", [String(_0x1134d1)], _0x5e81c1);
    }
    function _0x17093f(_0x477e75, _0x3f1afd = {}) {
      const _0x434c1e = [];
      if (_0x3f1afd.limit != null) {
        _0x434c1e.push("--top", String(_0x3f1afd.limit));
      }
      return _0x322386("coldspots", _0x434c1e, _0x477e75);
    }
    function _0x2a94b0(_0xc825e1, _0x4badba) {
      _0x1df337(_0x4badba, "ownership: file");
      return _0x322386("ownership", [_0x4badba], _0xc825e1);
    }
    function _0x402350(_0x1deeef) {
      return _0x322386("norms", [], _0x1deeef);
    }
    function _0x20b5ad(_0x1d4ea5) {
      return _0x322386("areas", [], _0x1d4ea5);
    }
    function _0x16e667(_0x31f2d1, _0x22a1ee = {}) {
      const _0x51612f = [];
      if (_0x22a1ee.limit != null) {
        _0x51612f.push("--top", String(_0x22a1ee.limit));
      }
      return _0x322386("contributors", _0x51612f, _0x31f2d1);
    }
    function _0x111360(_0x3bf496) {
      return _0x322386("release-info", [], _0x3bf496);
    }
    function _0x4f1a9b(_0x32a0c3, _0x36e5b8) {
      _0x1df337(_0x36e5b8, "fileHistory: file");
      return _0x322386("file-history", [_0x36e5b8], _0x32a0c3);
    }
    function _0x297550(_0x42ee82) {
      return _0x322386("conventions", [], _0x42ee82);
    }
    function _0x426065(_0x1789d6, _0x422498 = {}) {
      const _0x16252e = [];
      if (_0x422498.limit != null) {
        _0x16252e.push("--top", String(_0x422498.limit));
      }
      return _0x322386("doc-drift", _0x16252e, _0x1789d6);
    }
    function _0x4b5ca7(_0x5d9696) {
      return _0x322386("onboard", [], _0x5d9696);
    }
    function _0x48e802(_0x3aaf0f) {
      return _0x322386("can-i-help", [], _0x3aaf0f);
    }
    function _0x6cb260(_0x24460f, _0x212ef8 = {}) {
      const _0x236d4b = [];
      if (_0x212ef8.limit != null) {
        _0x236d4b.push("--top", String(_0x212ef8.limit));
      }
      return _0x322386("painspots", _0x236d4b, _0x24460f);
    }
    function _0x381e91(_0x24f46d, _0x489e5c = {}) {
      const _0x252da5 = [];
      if (_0x489e5c.files) {
        const _0x1353bb = Array.isArray(_0x489e5c.files) ? _0x489e5c.files.join(",") : String(_0x489e5c.files);
        _0x252da5.push("--files", _0x1353bb);
      }
      return _0x322386("entry-points", _0x252da5, _0x24f46d);
    }
    function _0x2d731b(_0x4f680a) {
      return _0x322386("project-info", [], _0x4f680a);
    }
    function _0x11ede8(_0x243dad, _0x2963c6) {
      _0x1df337(_0x2963c6, "symbols: file");
      return _0x322386("symbols", [_0x2963c6], _0x243dad);
    }
    function _0x215cfe(_0x48ee02, _0x539d64 = {}) {
      const _0x273132 = [];
      if (_0x539d64.limit != null) {
        _0x273132.push("--top", String(_0x539d64.limit));
      }
      return _0x322386("stale-docs", _0x273132, _0x48ee02);
    }
    function _0x399e45(_0x4f9573, _0x22862d, _0x1de48e = {}) {
      _0x1df337(_0x22862d, "find: query");
      const _0x35fe51 = [_0x22862d];
      if (_0x1de48e.limit != null) {
        _0x35fe51.push("--top", String(_0x1de48e.limit));
      }
      return _0x322386("find", _0x35fe51, _0x4f9573);
    }
    function _0x10838a(_0x3ce422) {
      return _0x322386("slop-fixes", [], _0x3ce422);
    }
    function _0x5d367e(_0x5f3ab1, _0x5311be = {}) {
      const _0x412890 = [];
      if (_0x5311be.top != null) {
        _0x412890.push("--top", String(_0x5311be.top));
      }
      return _0x322386("slop-targets", _0x412890, _0x5f3ab1);
    }
    function _0x284ed1(_0x57dbca, _0x428bc8 = {}) {
      const _0x49104f = _0x2374d0(_0x57dbca);
      const _0x3d08cd = [];
      if (_0x428bc8.depth != null) {
        _0x3d08cd.push("--depth", String(_0x428bc8.depth));
      }
      const _0x5aa134 = ["repo-intel", "query", "summary", ..._0x3d08cd, "--map-file", _0x49104f, _0x57dbca];
      let _0x3e45cc;
      try {
        _0x3e45cc = _0x37988e.runAnalyzer(_0x5aa134).trim();
      } catch (_0x9396d) {
        throw new Error("repo-intel query failed [summary]: " + _0x9396d.message, {
          cause: _0x9396d
        });
      }
      if (_0x3e45cc === "null") {
        return null;
      }
      if (_0x428bc8.depth != null) {
        return _0x3e45cc;
      }
      try {
        return JSON.parse(_0x3e45cc);
      } catch (_0x5dd6cd) {
        throw new Error("repo-intel query [summary] returned non-JSON output: " + _0x3e45cc.slice(0, 200));
      }
    }
    const _0x54b640 = {
      RepoIntelMissingError: _0x26d5cc,
      hotspots: _0x20e691,
      coupling: _0x4a0af0,
      busFactor: _0x231f6a,
      testGaps: _0x4a05be,
      diffRisk: _0x460715,
      dependents: _0x4725d8,
      bugspots: _0x286de8,
      health: _0x73abfb,
      communities: _0x585afe,
      boundaries: _0x9274a8,
      areaOf: _0x16a3bb,
      communityHealth: _0x3df0a4,
      coldspots: _0x17093f,
      ownership: _0x2a94b0,
      norms: _0x402350,
      areas: _0x20b5ad,
      contributors: _0x16e667,
      releaseInfo: _0x111360,
      fileHistory: _0x4f1a9b,
      conventions: _0x297550,
      docDrift: _0x426065,
      onboard: _0x4b5ca7,
      canIHelp: _0x48e802,
      painspots: _0x6cb260,
      entryPoints: _0x381e91,
      projectInfo: _0x2d731b,
      symbols: _0x11ede8,
      staleDocs: _0x215cfe,
      find: _0x399e45,
      slopFixes: _0x10838a,
      slopTargets: _0x5d367e,
      summary: _0x284ed1
    };
    _0x2c749a.exports = _0x54b640;
  }
});
var require_preference = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/embed/preference.js"(_0x139bc3, _0x2ecc86) {
    'use strict';

    var _0x20c0c7 = require("fs");
    var _0x32a59c = require("path");
    var _0x41021c = require_cache();
    var _0x3331ac = ["none", "small", "big"];
    var _0x12070b = ["compact", "balanced", "maximum"];
    function _0xd5b23f(_0x4cde51) {
      return _0x32a59c.join(_0x41021c.getStateDirPath(_0x4cde51), "sources", "preference.json");
    }
    function _0x37a08f(_0x26eada) {
      const _0x365809 = _0xd5b23f(_0x26eada);
      if (!_0x20c0c7.existsSync(_0x365809)) {
        return {};
      }
      try {
        const _0xead58 = JSON.parse(_0x20c0c7.readFileSync(_0x365809, "utf8"));
        if (_0xead58 && typeof _0xead58 === "object") {
          return _0xead58;
        } else {
          return {};
        }
      } catch (_0x20805e) {
        return {};
      }
    }
    function _0x42f31e(_0x42b0c1, _0x261933) {
      const _0x24da1c = _0x37a08f(_0x42b0c1);
      const _0x1fa003 = Object.assign({}, _0x24da1c, _0x261933 || {});
      const _0x4e2c11 = _0xd5b23f(_0x42b0c1);
      _0x20c0c7.mkdirSync(_0x32a59c.dirname(_0x4e2c11), {
        recursive: true
      });
      _0x20c0c7.writeFileSync(_0x4e2c11, JSON.stringify(_0x1fa003, null, 2));
      return _0x1fa003;
    }
    function _0x48ad87(_0x5db1ba) {
      const _0x4751e3 = _0x37a08f(_0x5db1ba);
      delete _0x4751e3.embedder;
      delete _0x4751e3.embedderDetail;
      const _0x2baf13 = _0xd5b23f(_0x5db1ba);
      _0x20c0c7.mkdirSync(_0x32a59c.dirname(_0x2baf13), {
        recursive: true
      });
      _0x20c0c7.writeFileSync(_0x2baf13, JSON.stringify(_0x4751e3, null, 2));
    }
    function _0x20f90a(_0x83c518) {
      const _0x353623 = _0x37a08f(_0x83c518);
      return _0x3331ac.includes(_0x353623.embedder);
    }
    function _0x16ec1b(_0x1ed776) {
      const _0x239a7b = _0x37a08f(_0x1ed776);
      return _0x12070b.includes(_0x239a7b.embedderDetail);
    }
    function _0x4d4cd2(_0x5e0a80) {
      switch (_0x5e0a80) {
        case "compact":
          return "compact";
        case "maximum":
          return "maximum";
        case "balanced":
        default:
          return "balanced";
      }
    }
    const _0x18dcf4 = {
      read: _0x37a08f,
      update: _0x42f31e,
      reset: _0x48ad87,
      hasEmbedderChoice: _0x20f90a,
      hasDetailChoice: _0x16ec1b,
      detailToCliArg: _0x4d4cd2,
      preferencePath: _0xd5b23f,
      VALID_EMBEDDER: _0x3331ac,
      VALID_DETAIL: _0x12070b
    };
    _0x2ecc86.exports = _0x18dcf4;
  }
});
var require_shared_helpers = __commonJS({
  "../work/agent-sh__agentsys/lib/binary/shared-helpers.js"(_0x55ac76, _0x24e277) {
    'use strict';

    var _0x510398 = require("fs");
    var _0x151590 = require("path");
    var _0x9d390e = require("os");
    var _0x2cf535 = require("https");
    var _0x273a71 = require("child_process");
    var _0x3697b8 = 30000;
    var _0x7087f2 = 5;
    function _0xec2f5a(_0x2cbc45, _0xa2c7a9) {
      const _0x1c8fc5 = _0xa2c7a9 || {};
      const _0xe99fe7 = _0x1c8fc5.userAgent || "agent-sh/binary-resolver";
      const _0x4a3f7d = _0x1c8fc5.timeoutMs || _0x3697b8;
      return new Promise(function (_0xbcc8a4, _0x375621) {
        const _0x163194 = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
        function _0x2d5469(_0x43649c, _0x5cd584) {
          if (_0x5cd584 > _0x7087f2) {
            _0x375621(new Error("Too many redirects fetching from " + _0x2cbc45));
            return;
          }
          const _0x5c2000 = {
            "User-Agent": _0xe99fe7,
            Accept: "application/octet-stream"
          };
          const _0x4cd4d4 = _0x5c2000;
          if (_0x163194) {
            _0x4cd4d4.Authorization = "Bearer " + _0x163194;
          }
          const _0x1c2faf = {
            headers: _0x4cd4d4,
            timeout: _0x4a3f7d
          };
          const _0x27d95f = _0x2cf535.get(_0x43649c, _0x1c2faf, function (_0x2bb990) {
            const _0x21f4ae = _0x2bb990.statusCode;
            if (_0x21f4ae === 301 || _0x21f4ae === 302 || _0x21f4ae === 307 || _0x21f4ae === 308) {
              _0x2bb990.resume();
              var _0x35d3e7 = _0x2bb990.headers.location;
              if (_0x35d3e7 && !_0x35d3e7.startsWith("https://")) {
                _0x375621(new Error("Refusing non-HTTPS redirect to " + _0x35d3e7));
                return;
              }
              _0x2d5469(_0x35d3e7, _0x5cd584 + 1);
              return;
            }
            if (_0x21f4ae !== 200) {
              _0x2bb990.resume();
              const _0x467e80 = _0x21f4ae === 403 ? " (rate limited - set GITHUB_TOKEN env var)" : "";
              _0x375621(new Error("HTTP " + _0x21f4ae + _0x467e80 + " fetching " + _0x43649c));
              return;
            }
            const _0x45c582 = [];
            _0x2bb990.on("data", function (_0x1604f2) {
              _0x45c582.push(_0x1604f2);
            });
            _0x2bb990.on("end", function () {
              _0xbcc8a4(Buffer.concat(_0x45c582));
            });
            _0x2bb990.on("error", _0x375621);
          });
          _0x27d95f.on("error", _0x375621);
          _0x27d95f.on("timeout", function () {
            _0x27d95f.destroy();
            _0x375621(new Error("Timeout (" + _0x4a3f7d + "ms) fetching " + _0x43649c));
          });
        }
        _0x2d5469(_0x2cbc45, 0);
      });
    }
    function _0x13d325(_0x5407dc, _0x2d9e46) {
      return new Promise(function (_0x1f9648, _0x35c4fa) {
        const _0x2fd288 = process.platform === "win32" ? _0x2d9e46.replace(/\\/g, "/") : _0x2d9e46;
        const _0x219bd2 = _0x273a71.spawn("tar", ["xz", "-C", _0x2fd288], {
          stdio: ["pipe", "pipe", "pipe"]
        });
        let _0x1a9b63 = "";
        _0x219bd2.stderr.on("data", function (_0x4087ed) {
          _0x1a9b63 += _0x4087ed;
        });
        _0x219bd2.stdin.write(_0x5407dc);
        _0x219bd2.stdin.end();
        _0x219bd2.on("close", function (_0x2b65a2) {
          if (_0x2b65a2 !== 0) {
            _0x35c4fa(new Error("tar extraction failed (code " + _0x2b65a2 + "): " + _0x1a9b63));
          } else {
            _0x1f9648();
          }
        });
        _0x219bd2.on("error", _0x35c4fa);
      });
    }
    function _0x397182(_0x46b009, _0x2c2c53, _0x40de3b) {
      return new Promise(function (_0x464477, _0x3cd11f) {
        var _0x4e2cfa = _0x510398.mkdtempSync(_0x151590.join(_0x9d390e.tmpdir(), _0x40de3b + "-"));
        var _0x163465 = _0x151590.join(_0x4e2cfa, "archive.zip");
        _0x510398.writeFileSync(_0x163465, _0x46b009);
        var _0x3e3b96 = _0x273a71.spawn("powershell", ["-NoProfile", "-NonInteractive", "-Command", "Expand-Archive", "-Path", _0x163465, "-DestinationPath", _0x2c2c53, "-Force"], {
          stdio: ["ignore", "pipe", "pipe"]
        });
        var _0x54f919 = "";
        _0x3e3b96.stderr.on("data", function (_0x2c2849) {
          _0x54f919 += _0x2c2849;
        });
        _0x3e3b96.on("close", function (_0x295eaf) {
          try {
            _0x510398.rmSync(_0x4e2cfa, {
              recursive: true,
              force: true
            });
          } catch (_0x43eb62) {}
          if (_0x295eaf !== 0) {
            _0x3cd11f(new Error("zip extraction failed (code " + _0x295eaf + "): " + _0x54f919));
          } else {
            _0x464477();
          }
        });
        _0x3e3b96.on("error", _0x3cd11f);
      });
    }
    const _0x1e4d8e = {
      downloadToBuffer: _0xec2f5a,
      extractTarGz: _0x13d325,
      extractZip: _0x397182,
      DEFAULT_DOWNLOAD_TIMEOUT_MS: _0x3697b8
    };
    _0x24e277.exports = _0x1e4d8e;
  }
});
var require_binary2 = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/embed/binary.js"(_0x277958, _0x18b3b7) {
    'use strict';

    var _0x63669 = require("fs");
    var _0x5c9331 = require("path");
    var _0x4d3e4d = require("os");
    var _0x4a8997 = require("https");
    var _0x18b7b7 = require("child_process");
    var _0x1d4472 = require_binary();
    var _0x490d1e = require_shared_helpers();
    var _0x24500f = "agent-analyzer-embed";
    var _0x467c85 = "agent-sh/agent-analyzer";
    var _0x258112 = 3600000;
    var _0x548706 = _0x1d4472.PLATFORM_MAP;
    function _0x447912() {
      const _0x2b7c67 = process.platform === "win32" ? ".exe" : "";
      return _0x5c9331.join(_0x4d3e4d.homedir(), ".agent-sh", "bin", _0x24500f + _0x2b7c67);
    }
    function _0x5b09e3() {
      if (process.platform === "win32") {
        return "onnxruntime.dll";
      }
      if (process.platform === "darwin") {
        return "libonnxruntime.dylib";
      }
      return "libonnxruntime.so";
    }
    function _0x473545() {
      return _0x5c9331.join(_0x5c9331.dirname(_0x447912()), _0x5b09e3());
    }
    function _0x5df390() {
      const _0x1d914b = _0x127e1e();
      return !!_0x1d914b && !_0x1d914b.includes("musl");
    }
    function _0x127e1e() {
      const _0x2dc181 = process.platform + "-" + process.arch;
      return _0x548706[_0x2dc181] || null;
    }
    function _0x2abe3b() {
      const _0x10023a = _0x447912();
      if (!_0x63669.existsSync(_0x10023a)) {
        return null;
      }
      try {
        const _0x5d9433 = _0x18b7b7.execFileSync(_0x10023a, ["--version"], {
          timeout: 5000,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"],
          windowsHide: true
        });
        const _0x444872 = _0x5d9433.trim().match(/(\d+\.\d+\.\d+)/);
        if (_0x444872) {
          return _0x444872[1];
        } else {
          return _0x5d9433.trim();
        }
      } catch (_0x43884d) {
        return null;
      }
    }
    function _0x3fc943() {
      return _0x63669.existsSync(_0x447912());
    }
    var _0x52f179 = null;
    async function _0x350e99() {
      if (_0x52f179 && Date.now() - _0x52f179.fetchedAt < _0x258112) {
        return _0x52f179.version;
      }
      return new Promise(function (_0x1c533f, _0x4dafa8) {
        const _0x8b8f76 = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
        const _0x1ec4f5 = {
          "User-Agent": "agent-sh/embed-resolver",
          Accept: "application/vnd.github+json"
        };
        if (_0x8b8f76) {
          _0x1ec4f5.Authorization = "Bearer " + _0x8b8f76;
        }
        const _0x5aae9a = "https://api.github.com/repos/" + _0x467c85 + "/releases/latest";
        const _0x47ad93 = function (_0x5d9d3c) {
          _0x4dafa8(new Error(_0x5d9d3c + " fetching " + _0x5aae9a));
        };
        const _0x3f6397 = {
          headers: _0x1ec4f5,
          timeout: 5000
        };
        const _0x4afe02 = _0x4a8997.get(_0x5aae9a, _0x3f6397, function (_0x2f8809) {
          if (_0x2f8809.statusCode !== 200) {
            _0x2f8809.resume();
            _0x47ad93("HTTP " + _0x2f8809.statusCode);
            return;
          }
          const _0x433cd8 = [];
          _0x2f8809.on("data", function (_0x15b6e7) {
            _0x433cd8.push(_0x15b6e7);
          });
          _0x2f8809.on("end", function () {
            try {
              const _0x287e00 = JSON.parse(Buffer.concat(_0x433cd8).toString("utf8"));
              const _0x3b908f = _0x287e00 && _0x287e00.tag_name || "";
              const _0x4b3eac = _0x3b908f.replace(/^v/, "");
              if (/^\d+\.\d+\.\d+/.test(_0x4b3eac)) {
                _0x52f179 = {
                  version: _0x4b3eac,
                  fetchedAt: Date.now()
                };
                _0x1c533f(_0x4b3eac);
              } else {
                _0x47ad93("No valid release tag");
              }
            } catch (_0x560a92) {
              _0x47ad93("Failed to parse release JSON: " + _0x560a92.message);
            }
          });
          _0x2f8809.on("error", function (_0x1ab942) {
            _0x47ad93(_0x1ab942.message);
          });
        });
        _0x4afe02.on("error", function (_0x2f844b) {
          _0x47ad93(_0x2f844b.message);
        });
        _0x4afe02.on("timeout", function () {
          _0x4afe02.destroy();
          _0x47ad93("Timeout");
        });
      });
    }
    function _0x3181c2(_0x5c4781, _0x368e2c) {
      const _0x4638a8 = process.platform === "win32" ? ".zip" : ".tar.gz";
      return "https://github.com/" + _0x467c85 + "/releases/download/v" + _0x5c4781 + "/" + _0x24500f + "-" + _0x368e2c + _0x4638a8;
    }
    function _0x32a63f(_0x3bcd8e) {
      return _0x490d1e.downloadToBuffer(_0x3bcd8e, {
        userAgent: "agent-sh/embed-resolver"
      });
    }
    var _0x29f05b = _0x490d1e.extractTarGz;
    var _0x4fa8d5 = _0x490d1e.extractZip;
    async function _0x37f72e(_0x4977b8) {
      const _0x339261 = _0x127e1e();
      if (!_0x339261) {
        throw new Error("Unsupported platform: " + process.platform + "-" + process.arch + ". Supported: " + Object.keys(_0x548706).join(", "));
      }
      const _0x2f57b3 = _0x3181c2(_0x4977b8, _0x339261);
      process.stderr.write("Downloading " + _0x24500f + " v" + _0x4977b8 + " for " + _0x339261 + "...\n");
      const _0x3e1479 = _0x447912();
      const _0x3abc69 = _0x5c9331.dirname(_0x3e1479);
      _0x63669.mkdirSync(_0x3abc69, {
        recursive: true
      });
      let _0x464853;
      try {
        _0x464853 = await _0x32a63f(_0x2f57b3);
      } catch (_0x1c8c84) {
        throw new Error("Failed to download " + _0x24500f + ":\n  URL: " + _0x2f57b3 + "\n  Error: " + _0x1c8c84.message + "\n\nTo install manually:\n  1. Download: " + _0x2f57b3 + "\n  2. Extract the binary to: " + _0x3abc69 + "\n  3. Ensure it is named: " + _0x5c9331.basename(_0x3e1479));
      }
      if (process.platform === "win32") {
        await _0x4fa8d5(_0x464853, _0x3abc69, _0x5c9331.basename(_0x3e1479));
      } else {
        await _0x29f05b(_0x464853, _0x3abc69);
      }
      if (process.platform !== "win32") {
        _0x63669.chmodSync(_0x3e1479, 493);
      }
      return _0x3e1479;
    }
    async function _0x48c6e9(_0x19c2be) {
      const _0x1b4740 = _0x19c2be || {};
      const _0x2c3f9c = _0x447912();
      if (_0x63669.existsSync(_0x2c3f9c)) {
        if (_0x5df390() && !_0x63669.existsSync(_0x473545())) {
          const _0x562c59 = _0x1b4740.version || (await _0x350e99());
          return _0x37f72e(_0x562c59);
        }
        return _0x2c3f9c;
      }
      const _0x14ebda = _0x1b4740.version || (await _0x350e99());
      return _0x37f72e(_0x14ebda);
    }
    const _0x43f451 = {
      EMBED_BINARY_NAME: _0x24500f,
      getBinaryPath: _0x447912,
      getBundledOrtName: _0x5b09e3,
      getBundledOrtPath: _0x473545,
      platformBundlesOrt: _0x5df390,
      getVersion: _0x2abe3b,
      getPlatformKey: _0x127e1e,
      getLatestReleaseVersion: _0x350e99,
      isAvailable: _0x3fc943,
      ensureBinary: _0x48c6e9,
      buildDownloadUrl: _0x3181c2
    };
    _0x18b3b7.exports = _0x43f451;
  }
});
var require_orchestrator = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/embed/orchestrator.js"(_0x4a962e, _0x56175d) {
    'use strict';

    var _0xc21e03 = require("fs");
    var _0xa18f01 = require("path");
    var _0x10a7ee = require("child_process");
    var _0x480c36 = require_preference();
    var _0x2003a4 = require_binary2();
    var _0x14fe14 = require_binary();
    var _0x16fa0b = require_cache();
    function _0x44afbf(_0x7c2aae) {
      const _0x3ded34 = _0x480c36.read(_0x7c2aae);
      return _0x3ded34.embedder === "small" || _0x3ded34.embedder === "big";
    }
    async function _0x471ee1(_0x225872) {
      if (!_0x44afbf(_0x225872)) {
        return {
          ran: false,
          reason: "embedder preference is \"none\" or unset"
        };
      }
      const _0x48f22f = _0x480c36.read(_0x225872);
      const _0x4905f9 = _0x480c36.detailToCliArg(_0x48f22f.embedderDetail || "balanced");
      const _0x4e098b = _0x16fa0b.getPath(_0x225872);
      if (!_0xc21e03.existsSync(_0x4e098b)) {
        return {
          ran: false,
          reason: "no repo-intel map found; run `/repo-intel init` first"
        };
      }
      const _0x29943a = Date.now();
      const _0x16be72 = await _0x2003a4.ensureBinary();
      const _0x5484cc = await _0x14fe14.ensureBinary();
      const _0x1080b4 = await _0x365cb7(_0x16be72, ["scan", _0x225872, "--variant", _0x48f22f.embedder, "--detail", _0x4905f9], _0x5484cc, _0x4e098b);
      return Object.assign({
        ran: true,
        durationMs: Date.now() - _0x29943a
      }, _0x1080b4);
    }
    async function _0x376dcb(_0x607b9d) {
      if (!_0x44afbf(_0x607b9d)) {
        return {
          ran: false,
          reason: "embedder preference is \"none\" or unset"
        };
      }
      const _0x468533 = _0x480c36.read(_0x607b9d);
      const _0x3f633c = _0x480c36.detailToCliArg(_0x468533.embedderDetail || "balanced");
      const _0x2648f6 = _0x16fa0b.getPath(_0x607b9d);
      if (!_0xc21e03.existsSync(_0x2648f6)) {
        return {
          ran: false,
          reason: "no repo-intel map; run `/repo-intel init` then `enrich`"
        };
      }
      const _0x1900e8 = Date.now();
      const _0x1637f6 = await _0x2003a4.ensureBinary();
      const _0x3073d0 = await _0x14fe14.ensureBinary();
      const _0x22ef39 = await _0x365cb7(_0x1637f6, ["update", _0x607b9d, "--map-file", _0x2648f6, "--variant", _0x468533.embedder, "--detail", _0x3f633c], _0x3073d0, _0x2648f6);
      return Object.assign({
        ran: true,
        durationMs: Date.now() - _0x1900e8
      }, _0x22ef39);
    }
    function _0x20c1b5(_0x421d65) {
      const _0x55acf4 = _0x480c36.read(_0x421d65);
      const _0x48a18f = _0x16fa0b.getPath(_0x421d65);
      const _0x4e7345 = _0x4b4162(_0x48a18f);
      return {
        enabled: _0x44afbf(_0x421d65),
        embedder: _0x55acf4.embedder,
        embedderDetail: _0x55acf4.embedderDetail,
        binaryInstalled: _0x2003a4.isAvailable(),
        ortBundled: !_0x2003a4.platformBundlesOrt() || _0xc21e03.existsSync(_0x2003a4.getBundledOrtPath()),
        sidecarExists: _0xc21e03.existsSync(_0x4e7345),
        sidecarPath: _0x4e7345
      };
    }
    function _0x365cb7(_0x17953f, _0x57460a, _0x21a3e1, _0x12d815) {
      return new Promise(function (_0x597c89, _0x3c8ba9) {
        const _0x2541a7 = _0x10a7ee.spawn(_0x17953f, _0x57460a, {
          stdio: ["ignore", "pipe", "pipe"],
          windowsHide: true
        });
        const _0x4b6095 = _0x10a7ee.spawn(_0x21a3e1, ["repo-intel", "set-embeddings", "--map-file", _0x12d815, "--input", "-"], {
          stdio: ["pipe", "pipe", "pipe"],
          windowsHide: true
        });
        let _0x4f162f = null;
        let _0x2468f0 = null;
        let _0xd43d4b = false;
        let _0x24a0bd = "";
        let _0xdbbeca = "";
        let _0x20672e = "";
        function _0x44a2d9(_0x27164b, _0x734cc2) {
          if (_0xd43d4b) {
            return;
          }
          _0xd43d4b = true;
          if (_0x27164b) {
            try {
              _0x2541a7.kill("SIGTERM");
            } catch (_0x1b5934) {}
            try {
              _0x4b6095.kill("SIGTERM");
            } catch (_0x154fcb) {}
            _0x3c8ba9(_0x27164b);
          } else {
            _0x597c89(_0x734cc2);
          }
        }
        function _0x1de986() {
          if (_0xd43d4b || _0x4f162f === null || _0x2468f0 === null) {
            return;
          }
          if (_0x4f162f !== 0) {
            return _0x44a2d9(new Error(_0x2003a4.EMBED_BINARY_NAME + " exited " + _0x4f162f + (_0xdbbeca.trim() ? ": " + _0xdbbeca.trim().slice(0, 500) : "")));
          }
          if (_0x2468f0 !== 0) {
            return _0x44a2d9(new Error("agent-analyzer set-embeddings exited " + _0x2468f0 + (_0x20672e.trim() ? ": " + _0x20672e.trim().slice(0, 500) : "")));
          }
          const _0x3015c6 = _0x24a0bd.match(/(\d+)\s+files?/);
          _0x44a2d9(null, {
            files: _0x3015c6 ? parseInt(_0x3015c6[1], 10) : undefined
          });
        }
        _0x2541a7.stderr.on("data", function (_0x43b834) {
          _0xdbbeca += _0x43b834.toString("utf8");
        });
        _0x4b6095.stderr.on("data", function (_0x13608a) {
          _0x20672e += _0x13608a.toString("utf8");
        });
        _0x4b6095.stdout.on("data", function (_0x2f7c5b) {
          _0x24a0bd += _0x2f7c5b.toString("utf8");
        });
        _0x2541a7.stdout.on("error", function (_0x2ff1b6) {
          _0x44a2d9(_0x2ff1b6);
        });
        _0x4b6095.stdin.on("error", function (_0x3d41bf) {
          if (_0x3d41bf && _0x3d41bf.code !== "EPIPE") {
            _0x44a2d9(_0x3d41bf);
          }
        });
        _0x2541a7.stdout.pipe(_0x4b6095.stdin);
        _0x2541a7.on("error", function (_0x178ddf) {
          _0x44a2d9(_0x178ddf);
        });
        _0x4b6095.on("error", function (_0x182b0d) {
          _0x44a2d9(_0x182b0d);
        });
        _0x2541a7.on("close", function (_0x140f0b) {
          _0x4f162f = _0x140f0b;
          _0x1de986();
        });
        _0x4b6095.on("close", function (_0x2ad562) {
          _0x2468f0 = _0x2ad562;
          _0x1de986();
        });
      });
    }
    function _0x4b4162(_0x16367c) {
      if (!_0x16367c) {
        return "";
      }
      const _0x1d62db = _0xa18f01.dirname(_0x16367c);
      const _0x378b78 = _0xa18f01.basename(_0x16367c, _0xa18f01.extname(_0x16367c));
      return _0xa18f01.join(_0x1d62db, _0x378b78 + ".embeddings.bin");
    }
    const _0x52c3f6 = {
      isEnabled: _0x44afbf,
      runScan: _0x471ee1,
      runUpdate: _0x376dcb,
      status: _0x20c1b5,
      streamEmbedToSetEmbeddings: _0x365cb7
    };
    _0x56175d.exports = _0x52c3f6;
  }
});
var require_embed = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/embed/index.js"(_0x918778, _0x12325c) {
    'use strict';

    "use strict";
    var _0x345f29 = require_preference();
    var _0x397316 = require_binary2();
    var _0x3fb614 = require_orchestrator();
    const _0x54501f = {
      preference: _0x345f29,
      binary: _0x397316,
      orchestrator: _0x3fb614,
      isEnabled: _0x3fb614.isEnabled,
      runScan: _0x3fb614.runScan,
      runUpdate: _0x3fb614.runUpdate,
      status: _0x3fb614.status
    };
    _0x12325c.exports = _0x54501f;
  }
});
var require_repo_intel = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/index.js"(_0x4315f0, _0x48738e) {
    'use strict';

    var _0x3344c2 = require("fs");
    var _0x449dff = require("path");
    var _0x2fe30e = require("child_process");
    var {
      execFileSync: _0x2d4178
    } = _0x2fe30e;
    var _0x53014c = require_installer();
    var _0x26a751 = require_cache();
    var _0x5e3fbf = require_updater();
    var _0x2d2d6c = require_converter();
    var _0x3fba0f = require_queries();
    var _0x5f5c6 = require_binary();
    var {
      getStateDirPath: _0x37b29e
    } = require_state_dir();
    var {
      writeJsonAtomic: _0x31d4e2
    } = require_atomic_write();
    var _0x119b35 = "repo-intel.json";
    function _0x57549a(_0xcfc3f7) {
      return _0x449dff.join(_0x37b29e(_0xcfc3f7), _0x119b35);
    }
    async function _0x5789a6(_0xb7ec75, _0x259e80 = {}) {
      const _0xc06487 = await _0x53014c.checkInstalled();
      if (!_0xc06487.found) {
        return {
          success: false,
          error: "agent-analyzer binary unavailable: " + (_0xc06487.error || "unknown error"),
          installSuggestion: _0x53014c.getInstallInstructions()
        };
      }
      const _0x3f5881 = _0x26a751.load(_0xb7ec75);
      if (_0x3f5881 && !_0x259e80.force) {
        return {
          success: false,
          error: "Repo map already exists. Use --force to rebuild or update to refresh.",
          existing: _0x26a751.getStatus(_0xb7ec75)
        };
      }
      const _0xb17e1c = Date.now();
      let _0x3dc883;
      try {
        _0x3dc883 = await _0x5f5c6.runAnalyzerAsync(["repo-intel", "init", _0xb7ec75]);
      } catch (_0x3f3dc6) {
        return {
          success: false,
          error: "agent-analyzer repo-intel init failed: " + _0x3f3dc6.message
        };
      }
      let _0x33e9c7;
      try {
        _0x33e9c7 = JSON.parse(_0x3dc883);
      } catch (_0x34cf80) {
        return {
          success: false,
          error: "Failed to parse repo-intel output: " + _0x34cf80.message
        };
      }
      const _0x11a9e3 = _0x57549a(_0xb7ec75);
      try {
        _0x31d4e2(_0x11a9e3, _0x33e9c7);
      } catch {}
      const _0x2d105f = _0x2d2d6c.convertIntelToRepoMap(_0x33e9c7);
      _0x2d105f.stats.scanDurationMs = Date.now() - _0xb17e1c;
      _0x26a751.save(_0xb7ec75, _0x2d105f);
      return {
        success: true,
        map: _0x2d105f,
        summary: {
          files: Object.keys(_0x2d105f.files).length,
          symbols: _0x2d105f.stats.totalSymbols,
          languages: _0x2d105f.project.languages,
          duration: _0x2d105f.stats.scanDurationMs
        }
      };
    }
    async function _0x3f16bf(_0x1c0153, _0x5e2dd2 = {}) {
      const _0x3a023a = await _0x53014c.checkInstalled();
      if (!_0x3a023a.found) {
        return {
          success: false,
          error: "agent-analyzer binary unavailable: " + (_0x3a023a.error || "unknown error"),
          installSuggestion: _0x53014c.getInstallInstructions()
        };
      }
      if (!_0x26a751.exists(_0x1c0153)) {
        return {
          success: false,
          error: "No repo map found. Run init first."
        };
      }
      if (_0x5e2dd2.full) {
        return _0x5789a6(_0x1c0153, {
          force: true
        });
      }
      const _0x105628 = _0x57549a(_0x1c0153);
      if (!_0x3344c2.existsSync(_0x105628)) {
        return _0x5789a6(_0x1c0153, {
          force: true
        });
      }
      const _0x1d1e11 = Date.now();
      let _0x18a44f;
      try {
        _0x18a44f = await _0x5f5c6.runAnalyzerAsync(["repo-intel", "update", "--map-file", _0x105628, _0x1c0153]);
      } catch (_0x22d61d) {
        return {
          success: false,
          error: "agent-analyzer repo-intel update failed: " + _0x22d61d.message
        };
      }
      let _0x43c053;
      try {
        _0x43c053 = JSON.parse(_0x18a44f);
      } catch (_0x202b27) {
        return {
          success: false,
          error: "Failed to parse repo-intel update output: " + _0x202b27.message
        };
      }
      try {
        _0x31d4e2(_0x105628, _0x43c053);
      } catch {}
      const _0x460f4a = _0x2d2d6c.convertIntelToRepoMap(_0x43c053);
      _0x460f4a.stats.scanDurationMs = Date.now() - _0x1d1e11;
      _0x26a751.save(_0x1c0153, _0x460f4a);
      return {
        success: true,
        map: _0x460f4a,
        summary: {
          files: Object.keys(_0x460f4a.files).length,
          symbols: _0x460f4a.stats.totalSymbols,
          duration: _0x460f4a.stats.scanDurationMs
        }
      };
    }
    function _0x129a6e(_0x3b1ffe) {
      const _0x408f24 = _0x26a751.load(_0x3b1ffe);
      if (!_0x408f24) {
        return {
          exists: false
        };
      }
      const _0x163c4e = _0x5e3fbf.checkStaleness(_0x3b1ffe, _0x408f24);
      let _0xd10da1;
      try {
        _0xd10da1 = _0x2d4178("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
          cwd: _0x3b1ffe,
          encoding: "utf8"
        }).trim();
      } catch {}
      return {
        exists: true,
        status: {
          generated: _0x408f24.generated,
          updated: _0x408f24.updated,
          commit: _0x408f24.git?.commit,
          branch: _0xd10da1,
          files: Object.keys(_0x408f24.files).length,
          symbols: _0x408f24.stats?.totalSymbols || 0,
          languages: _0x408f24.project?.languages || [],
          staleness: _0x163c4e
        }
      };
    }
    function _0x374a1b(_0x213624) {
      return _0x26a751.load(_0x213624);
    }
    function _0x3f2929(_0x20dc0e) {
      return _0x26a751.exists(_0x20dc0e);
    }
    function _0x352e48(_0x484998) {
      const _0x5dc5c4 = _0x57549a(_0x484998);
      if (!_0x3344c2.existsSync(_0x5dc5c4)) {
        return null;
      }
      try {
        return JSON.parse(_0x3344c2.readFileSync(_0x5dc5c4, "utf8"));
      } catch {
        return null;
      }
    }
    async function _0x1d46c6(_0x4b0a4c, _0x30829c) {
      const _0x4e706a = await _0x5f5c6.ensureBinary();
      return new Promise((_0x1aeb3d, _0x2ba42f) => {
        const _0x3ca986 = _0x2fe30e.spawn(_0x4e706a, _0x4b0a4c, {
          stdio: ["pipe", "pipe", "pipe"],
          windowsHide: true
        });
        let _0x4ae000 = "";
        let _0x5e840b = "";
        _0x3ca986.stdout.on("data", _0x1923ee => {
          _0x4ae000 += _0x1923ee.toString("utf8");
        });
        _0x3ca986.stderr.on("data", _0x5595be => {
          _0x5e840b += _0x5595be.toString("utf8");
        });
        _0x3ca986.on("error", _0x2ba42f);
        _0x3ca986.on("close", _0x1ef5c0 => {
          if (_0x1ef5c0 === 0) {
            const _0x488feb = {
              stdout: _0x4ae000,
              stderr: _0x5e840b
            };
            _0x1aeb3d(_0x488feb);
          } else {
            _0x2ba42f(new Error("agent-analyzer " + _0x4b0a4c.join(" ") + " exited " + _0x1ef5c0 + ": " + (_0x5e840b.trim() || _0x4ae000.trim())));
          }
        });
        _0x3ca986.stdin.write(_0x30829c);
        _0x3ca986.stdin.end();
      });
    }
    async function _0x27ed98(_0x598d91, _0x214294) {
      if (!_0x214294 || typeof _0x214294 !== "object") {
        throw new Error("applyDescriptors requires an object {path: descriptor}");
      }
      const _0x163986 = _0x57549a(_0x598d91);
      if (!_0x3344c2.existsSync(_0x163986)) {
        throw new Error("No repo-intel artifact for " + _0x598d91 + "; run init first.");
      }
      await _0x1d46c6(["repo-intel", "set-descriptors", "--map-file", _0x163986, "--input", "-"], JSON.stringify(_0x214294));
    }
    async function _0x486094(_0x5995d5, _0x3d0e6c) {
      if (!_0x3d0e6c || !_0x3d0e6c.depth1 || !_0x3d0e6c.depth3 || !_0x3d0e6c.depth10) {
        throw new Error("applySummary requires {depth1, depth3, depth10, inputHash}");
      }
      const _0x29360c = _0x57549a(_0x5995d5);
      if (!_0x3344c2.existsSync(_0x29360c)) {
        throw new Error("No repo-intel artifact for " + _0x5995d5 + "; run init first.");
      }
      await _0x1d46c6(["repo-intel", "set-summary", "--map-file", _0x29360c, "--input", "-"], JSON.stringify(_0x3d0e6c));
    }
    async function _0x26133e() {
      return _0x53014c.checkInstalled();
    }
    function _0x199418() {
      return _0x53014c.getInstallInstructions();
    }
    const _0x224263 = {
      init: _0x5789a6,
      update: _0x3f16bf,
      status: _0x129a6e,
      load: _0x374a1b,
      loadRaw: _0x352e48,
      exists: _0x3f2929,
      applyDescriptors: _0x27ed98,
      applySummary: _0x486094,
      checkAstGrepInstalled: _0x26133e,
      getInstallInstructions: _0x199418,
      queries: _0x3fba0f,
      installer: _0x53014c,
      cache: _0x26a751,
      updater: _0x5e3fbf,
      converter: _0x2d2d6c
    };
    _0x48738e.exports = _0x224263;
    Object.defineProperty(_0x48738e.exports, "embed", {
      enumerable: true,
      get() {
        return require_embed();
      }
    });
  }
});
var require_repo_map = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-map/index.js"(_0x4164cd, _0x356534) {
    'use strict';

    var _0x59a0a6 = require_repo_intel();
    const _0x19e687 = {
      init: _0x59a0a6.init,
      update: _0x59a0a6.update,
      status: _0x59a0a6.status,
      load: _0x59a0a6.load,
      exists: _0x59a0a6.exists,
      checkAstGrepInstalled: _0x59a0a6.checkAstGrepInstalled,
      getInstallInstructions: _0x59a0a6.getInstallInstructions,
      installer: _0x59a0a6.installer,
      cache: _0x59a0a6.cache,
      updater: _0x59a0a6.updater
    };
    _0x356534.exports = _0x19e687;
  }
});
var require_docs_patterns = __commonJS({
  "../work/agent-sh__agentsys/lib/collectors/docs-patterns.js"(_0x3a988a, _0x5e87bb) {
    'use strict';

    var _0x38b6f9 = require("fs");
    var _0x10caed = require("path");
    var {
      execFileSync: _0x2a943a
    } = require("child_process");
    var _0x5ddbbd = null;
    var _0x456bc2 = null;
    function _0x3f49b2() {
      if (!_0x5ddbbd && !_0x456bc2) {
        try {
          _0x5ddbbd = require_repo_map();
        } catch (_0x1063b0) {
          _0x456bc2 = _0x1063b0.message || "Failed to load repo-map module";
          _0x5ddbbd = null;
        }
      }
      return _0x5ddbbd;
    }
    function _0x1e3fc8() {
      return _0x456bc2;
    }
    var _0x1319b0 = {
      cwd: process.cwd()
    };
    var _0x36c0f8 = 5;
    var _0x4d47b3 = 200;
    var _0x10b849 = ["internal", "private", "utils", "helpers", "__tests__", "test", "tests"];
    var _0x7ea6f7 = ["index", "main", "app", "server", "cli", "bin"];
    var _0x564288 = [/export\s+(?:function|class|const|let|var)\s+(\w+)/g, /export\s+\{([^}]+)\}/g, /module\.exports\s*=\s*\{([^}]+)\}/];
    function _0x370aaa(_0x1d152f) {
      return _0x1d152f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    function _0x5a7e60(_0x2fdf55, _0x49a7bb) {
      if (_0x2fdf55.startsWith("_")) {
        return true;
      }
      const _0x2ecea1 = _0x49a7bb.toLowerCase();
      for (const _0x33cae8 of _0x10b849) {
        if (_0x2ecea1.includes("/" + _0x33cae8 + "/") || _0x2ecea1.includes("\\" + _0x33cae8 + "\\")) {
          return true;
        }
      }
      if (/\.(test|spec)\.[jt]sx?$/.test(_0x49a7bb)) {
        return true;
      }
      return false;
    }
    function _0x1f17a7(_0x4fd947) {
      const _0x2e97ec = _0x10caed.basename(_0x4fd947);
      const _0x4d195c = _0x2e97ec.replace(/\.[^.]+$/, "").toLowerCase();
      return _0x7ea6f7.includes(_0x4d195c);
    }
    async function _0x465e9b(_0x11a9e8 = {}) {
      const {
        cwd = process.cwd(),
        askUser: _0x2b0f10
      } = _0x11a9e8;
      const _0x399169 = _0x3f49b2();
      if (!_0x399169) {
        return {
          available: false,
          map: null,
          fallbackReason: "repo-map-module-not-found"
        };
      }
      if (_0x399169.exists(cwd)) {
        const _0x57a4cf = _0x399169.load(cwd);
        const _0x471ced = {
          available: true,
          map: _0x57a4cf,
          fallbackReason: null
        };
        return _0x471ced;
      }
      const _0x3b63c7 = await _0x399169.checkAstGrepInstalled();
      if (!_0x3b63c7.found) {
        if (_0x2b0f10) {
          const _0x40d849 = await _0x2b0f10({
            question: "ast-grep not found. Install for better doc sync accuracy?",
            header: "ast-grep Required",
            options: [{
              label: "Yes, show instructions",
              description: "Better accuracy with AST-based symbol detection"
            }, {
              label: "No, use regex fallback",
              description: "Less accurate but works without additional install"
            }]
          });
          if (_0x40d849 && _0x40d849.includes("Yes")) {
            const _0x24baca = _0x399169.getInstallInstructions();
            const _0x1ae390 = {
              available: false,
              map: null,
              fallbackReason: "ast-grep-install-pending",
              installInstructions: _0x24baca
            };
            return _0x1ae390;
          }
        }
        return {
          available: false,
          map: null,
          fallbackReason: "ast-grep-not-installed"
        };
      }
      try {
        const _0x3b7fcd = await _0x399169.init(cwd, {
          force: false
        });
        if (_0x3b7fcd.success) {
          const _0x3e642f = {
            available: true,
            map: _0x3b7fcd.map,
            fallbackReason: null
          };
          return _0x3e642f;
        }
        if (_0x3b7fcd.error && _0x3b7fcd.error.includes("already exists")) {
          const _0x5932c6 = _0x399169.load(cwd);
          const _0x5be792 = {
            available: true,
            map: _0x5932c6,
            fallbackReason: null
          };
          return _0x5be792;
        }
        const _0x2c19d0 = {
          available: false,
          map: null,
          fallbackReason: _0x3b7fcd.error || "init-failed"
        };
        return _0x2c19d0;
      } catch (_0x113d46) {
        const _0x1c37fd = {
          available: false,
          map: null,
          fallbackReason: _0x113d46.message || "init-error"
        };
        return _0x1c37fd;
      }
    }
    function _0x3c83cf(_0x5d22a2 = {}) {
      const {
        cwd = process.cwd()
      } = _0x5d22a2;
      const _0x460051 = _0x3f49b2();
      if (!_0x460051) {
        return {
          available: false,
          map: null,
          fallbackReason: "repo-map-module-not-found"
        };
      }
      if (_0x460051.exists(cwd)) {
        const _0x1a9906 = _0x460051.load(cwd);
        const _0x232f68 = {
          available: true,
          map: _0x1a9906,
          fallbackReason: null
        };
        return _0x232f68;
      }
      return {
        available: false,
        map: null,
        fallbackReason: "repo-map-not-initialized"
      };
    }
    function _0xd85078(_0x1f6b2b, _0x41f380) {
      if (!_0x41f380 || !_0x41f380.files) {
        return null;
      }
      const _0xbf511 = _0x1f6b2b.replace(/\\/g, "/");
      let _0x11b0d2 = _0x41f380.files[_0xbf511];
      if (!_0x11b0d2 && _0xbf511.startsWith("./")) {
        _0x11b0d2 = _0x41f380.files[_0xbf511.slice(2)];
      }
      if (!_0x11b0d2 && !_0xbf511.startsWith("./")) {
        _0x11b0d2 = _0x41f380.files["./" + _0xbf511];
      }
      if (!_0x11b0d2 || !_0x11b0d2.symbols || !_0x11b0d2.symbols.exports) {
        return null;
      }
      return _0x11b0d2.symbols.exports.map(_0x42913f => _0x42913f.name);
    }
    function _0x237c93(_0x4404a8, _0xa4d942 = {}) {
      const _0x5c1054 = {
        ..._0x1319b0,
        ..._0xa4d942
      };
      const _0x5ac8c9 = _0x5c1054;
      const _0x39c793 = _0x5ac8c9.repoMapStatus || _0x3c83cf(_0x5ac8c9);
      if (!_0x39c793.available || !_0x39c793.map) {
        return [];
      }
      const _0x468ce4 = _0x39c793.map;
      const _0x345d38 = _0x2053f9(_0x5ac8c9.cwd);
      let _0xd10fe3 = "";
      for (const _0x3bbff3 of _0x345d38) {
        try {
          _0xd10fe3 += _0x38b6f9.readFileSync(_0x10caed.join(_0x5ac8c9.cwd, _0x3bbff3), "utf8") + "\n";
        } catch {}
      }
      const _0x5dac9b = [];
      for (const _0x2dc76a of _0x4404a8) {
        const _0x3c0b61 = _0x2dc76a.replace(/\\/g, "/");
        const _0x26dbf4 = _0x468ce4.files[_0x3c0b61] || _0x468ce4.files[_0x3c0b61.replace(/^\.\//, "")];
        if (!_0x26dbf4 || !_0x26dbf4.symbols || !_0x26dbf4.symbols.exports) {
          continue;
        }
        for (const _0x4a0475 of _0x26dbf4.symbols.exports) {
          if (_0x5a7e60(_0x4a0475.name, _0x3c0b61)) {
            continue;
          }
          if (_0x1f17a7(_0x3c0b61)) {
            continue;
          }
          const _0x409080 = new RegExp("\\b" + _0x370aaa(_0x4a0475.name) + "\\b");
          if (!_0x409080.test(_0xd10fe3)) {
            const _0x1fe8aa = {
              type: "undocumented-export",
              severity: "low",
              file: _0x3c0b61,
              name: _0x4a0475.name,
              line: _0x4a0475.line || 0,
              kind: _0x4a0475.kind || "export",
              certainty: "MEDIUM",
              suggestion: "Export '" + _0x4a0475.name + "' in " + _0x3c0b61 + " is not mentioned in any documentation"
            };
            _0x5dac9b.push(_0x1fe8aa);
          }
        }
      }
      return _0x5dac9b;
    }
    function _0x1d8aac(_0x93d5f2, _0x52fa1b = {}) {
      const _0x111841 = {
        ..._0x1319b0,
        ..._0x52fa1b
      };
      const _0x534f04 = _0x111841;
      const _0x39f014 = _0x534f04.cwd;
      const _0x103f32 = [];
      const _0x589de8 = _0x2053f9(_0x39f014);
      for (const _0x319ace of _0x93d5f2) {
        const _0x33f5d1 = _0x10caed.basename(_0x319ace).replace(/\.[^.]+$/, "");
        const _0x47bf21 = _0x319ace.replace(/\.[^.]+$/, "");
        const _0x279187 = _0x10caed.dirname(_0x319ace);
        for (const _0x430bda of _0x589de8) {
          let _0x212f79;
          try {
            _0x212f79 = _0x38b6f9.readFileSync(_0x10caed.join(_0x39f014, _0x430bda), "utf8");
          } catch {
            continue;
          }
          const _0x31afec = [];
          if (_0x212f79.includes(_0x33f5d1)) {
            _0x31afec.push("filename");
          }
          if (_0x212f79.includes(_0x319ace)) {
            _0x31afec.push("full-path");
          }
          if (_0x212f79.includes("from '" + _0x47bf21 + "'") || _0x212f79.includes("from \"" + _0x47bf21 + "\"")) {
            _0x31afec.push("import");
          }
          if (_0x212f79.includes("require('" + _0x47bf21 + "')") || _0x212f79.includes("require(\"" + _0x47bf21 + "\")")) {
            _0x31afec.push("require");
          }
          if (_0x212f79.includes("/" + _0x33f5d1) || _0x212f79.includes("/" + _0x33f5d1 + ".")) {
            _0x31afec.push("url-path");
          }
          if (_0x31afec.length > 0) {
            const _0xbf915e = {
              doc: _0x430bda,
              referencedFile: _0x319ace,
              referenceTypes: _0x31afec
            };
            _0x103f32.push(_0xbf915e);
          }
        }
      }
      return _0x103f32;
    }
    function _0x2053f9(_0x1b18cc) {
      const _0x268e08 = [];
      const _0x3fa118 = ["node_modules", "dist", "build", ".git", "coverage", "vendor"];
      function _0x4a5868(_0x14ccc3, _0x109dd4 = 0) {
        if (_0x109dd4 > _0x36c0f8 || _0x268e08.length > _0x4d47b3) {
          return;
        }
        try {
          const _0x3c2100 = _0x38b6f9.readdirSync(_0x14ccc3, {
            withFileTypes: true
          });
          for (const _0x332a2d of _0x3c2100) {
            const _0x10e2c9 = _0x10caed.join(_0x14ccc3, _0x332a2d.name);
            const _0x592f98 = _0x10caed.relative(_0x1b18cc, _0x10e2c9);
            if (_0x332a2d.isDirectory()) {
              if (!_0x3fa118.includes(_0x332a2d.name) && !_0x332a2d.name.startsWith(".")) {
                _0x4a5868(_0x10e2c9, _0x109dd4 + 1);
              }
            } else if (_0x332a2d.isFile() && _0x332a2d.name.endsWith(".md")) {
              _0x268e08.push(_0x592f98);
            }
          }
        } catch {}
      }
      _0x4a5868(_0x1b18cc);
      return _0x268e08;
    }
    function _0x3856cf(_0x36329f, _0x58b5a0, _0x511877 = {}) {
      const _0x268c2a = {
        ..._0x1319b0,
        ..._0x511877
      };
      const _0x41ef21 = _0x268c2a;
      const _0x121d67 = _0x41ef21.cwd;
      const _0x1505b7 = [];
      let _0x518be4;
      try {
        _0x518be4 = _0x38b6f9.readFileSync(_0x10caed.join(_0x121d67, _0x36329f), "utf8");
      } catch {
        return _0x1505b7;
      }
      const _0x4ce032 = _0x518be4.split("\n");
      const _0x41f589 = /```[\s\S]*?```/g;
      const _0x2a3ca8 = _0x518be4.match(_0x41f589) || [];
      for (const _0x15458c of _0x2a3ca8) {
        const _0x5c3926 = /import .* from ['"]([^'"]+)['"]/g;
        let _0x48c526;
        while ((_0x48c526 = _0x5c3926.exec(_0x15458c)) !== null) {
          const _0x46cc82 = _0x48c526[1];
          const _0x12c250 = _0x58b5a0.replace(/\.[^.]+$/, "");
          if (_0x46cc82.includes(_0x10caed.basename(_0x12c250))) {
            _0x1505b7.push({
              type: "code-example",
              severity: "medium",
              line: _0xbc1c88(_0x518be4, _0x48c526[0]),
              current: _0x48c526[0],
              suggestion: "Verify import path is still valid"
            });
          }
        }
      }
      const _0x5464c4 = _0x3c83cf(_0x41ef21);
      let _0x170fbb;
      let _0x33bed9;
      let _0x207dde = false;
      if (_0x5464c4.available && _0x5464c4.map) {
        const _0x521443 = _0xd85078(_0x58b5a0, _0x5464c4.map);
        if (_0x521443) {
          _0x33bed9 = _0x521443;
          _0x170fbb = _0x593140(_0x58b5a0, "HEAD~1", _0x41ef21);
          _0x207dde = true;
        }
      }
      if (!_0x207dde) {
        _0x170fbb = _0x593140(_0x58b5a0, "HEAD~1", _0x41ef21);
        _0x33bed9 = _0x593140(_0x58b5a0, "HEAD", _0x41ef21);
      }
      const _0x5028f2 = _0x170fbb.filter(_0x569aff => !_0x33bed9.includes(_0x569aff));
      for (const _0x5293c3 of _0x5028f2) {
        if (_0x518be4.includes(_0x5293c3)) {
          const _0x5bda98 = {
            type: "removed-export",
            severity: "high",
            reference: _0x5293c3,
            suggestion: "'" + _0x5293c3 + "' was removed or renamed",
            detectionMethod: _0x207dde ? "repo-map" : "regex"
          };
          _0x1505b7.push(_0x5bda98);
        }
      }
      try {
        const _0x278922 = _0x38b6f9.readFileSync(_0x10caed.join(_0x121d67, "package.json"), "utf8");
        const _0x330295 = JSON.parse(_0x278922);
        const _0x3d22f2 = _0x330295.version;
        const _0x48b2e2 = _0x518be4.matchAll(/version[:\s]+['"]?(\d+\.\d+\.\d+)/gi);
        for (const _0x9d7f60 of _0x48b2e2) {
          const _0x18e2e4 = _0x9d7f60[1];
          if (_0x18e2e4 !== _0x3d22f2 && _0xf67ea0(_0x18e2e4, _0x3d22f2) < 0) {
            _0x1505b7.push({
              type: "outdated-version",
              severity: "low",
              line: _0xbc1c88(_0x518be4, _0x9d7f60[0]),
              current: _0x18e2e4,
              expected: _0x3d22f2,
              suggestion: "Update version from " + _0x18e2e4 + " to " + _0x3d22f2
            });
          }
        }
      } catch {}
      return _0x1505b7;
    }
    function _0xbc1c88(_0x5297f7, _0x384dbc) {
      const _0x277b06 = _0x5297f7.indexOf(_0x384dbc);
      if (_0x277b06 === -1) {
        return 0;
      }
      return _0x5297f7.substring(0, _0x277b06).split("\n").length;
    }
    function _0x2fc28d(_0x531ba3) {
      if (typeof _0x531ba3 !== "string" || !_0x531ba3) {
        return false;
      }
      return /^[a-zA-Z0-9_./-]+(?:[~^][0-9]+)?$/.test(_0x531ba3);
    }
    function _0x593140(_0x336ee0, _0x6e8cd, _0x366977 = {}) {
      const _0x1b8be9 = {
        ..._0x1319b0,
        ..._0x366977
      };
      const _0x10fdd2 = _0x1b8be9;
      if (!_0x2fc28d(_0x6e8cd)) {
        return [];
      }
      try {
        const _0x26cfa7 = _0x2a943a("git", ["show", _0x6e8cd + ":" + _0x336ee0], {
          cwd: _0x10fdd2.cwd,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"]
        });
        const _0x504f13 = [];
        for (const _0x2f7274 of _0x564288) {
          const _0x1d5ac5 = new RegExp(_0x2f7274.source, _0x2f7274.flags);
          let _0x22c6fa;
          while ((_0x22c6fa = _0x1d5ac5.exec(_0x26cfa7)) !== null) {
            if (_0x22c6fa[1].includes(",")) {
              const _0x52742f = _0x22c6fa[1].split(",").map(_0x4fb835 => _0x4fb835.trim().split(/\s+as\s+/)[0].trim());
              _0x504f13.push(..._0x52742f.filter(_0x2878dc => _0x2878dc && /^\w+$/.test(_0x2878dc)));
            } else {
              _0x504f13.push(_0x22c6fa[1]);
            }
          }
        }
        return [...new Set(_0x504f13)];
      } catch {
        return [];
      }
    }
    function _0xf67ea0(_0x2f2dd0, _0xadce63) {
      const _0x35d7c9 = _0x2f2dd0.split(".").map(Number);
      const _0x1ea7f2 = _0xadce63.split(".").map(Number);
      for (let _0x19e1c5 = 0; _0x19e1c5 < 3; _0x19e1c5++) {
        const _0x5ecf44 = _0x35d7c9[_0x19e1c5] || 0;
        const _0x276337 = _0x1ea7f2[_0x19e1c5] || 0;
        if (_0x5ecf44 < _0x276337) {
          return -1;
        }
        if (_0x5ecf44 > _0x276337) {
          return 1;
        }
      }
      return 0;
    }
    function _0x2dcb71(_0x11cf2a, _0x3767c9 = {}) {
      const _0x5aca06 = {
        ..._0x1319b0,
        ..._0x3767c9
      };
      const _0x17b506 = _0x5aca06;
      const _0x5739fa = _0x17b506.cwd;
      const _0x5e01ab = _0x10caed.join(_0x5739fa, "CHANGELOG.md");
      if (!_0x38b6f9.existsSync(_0x5e01ab)) {
        return {
          exists: false
        };
      }
      let _0x10c90d;
      try {
        _0x10c90d = _0x38b6f9.readFileSync(_0x5e01ab, "utf8");
      } catch {
        return {
          exists: false,
          error: "Could not read CHANGELOG.md"
        };
      }
      const _0x119cc3 = _0x10c90d.includes("## [Unreleased]");
      let _0xe639d3 = [];
      try {
        const _0xc72c2b = _0x2a943a("git", ["log", "--oneline", "-10", "HEAD"], {
          cwd: _0x5739fa,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"]
        });
        _0xe639d3 = _0xc72c2b.trim().split("\n");
      } catch {}
      const _0x42a469 = [];
      const _0x2711fb = [];
      for (const _0x51069a of _0xe639d3) {
        if (!_0x51069a) {
          continue;
        }
        const _0x4ba7de = _0x51069a.substring(8);
        if (_0x10c90d.includes(_0x4ba7de) || _0x10c90d.includes(_0x51069a.substring(0, 7))) {
          _0x42a469.push(_0x4ba7de);
        } else if (_0x4ba7de.match(/^(feat|fix|breaking)/i)) {
          _0x2711fb.push(_0x4ba7de);
        }
      }
      return {
        exists: true,
        hasUnreleased: _0x119cc3,
        documented: _0x42a469,
        undocumented: _0x2711fb,
        suggestion: _0x2711fb.length > 0 ? _0x2711fb.length + " commits may need CHANGELOG entries" : null
      };
    }
    function _0x397c84(_0x476c52 = {}) {
      const _0x56df31 = {
        ..._0x1319b0,
        ..._0x476c52
      };
      const _0x12dce7 = _0x56df31;
      const _0x77b0d6 = _0x12dce7.changedFiles || [];
      const _0x2cd840 = _0x3c83cf(_0x12dce7);
      return {
        relatedDocs: _0x1d8aac(_0x77b0d6, _0x12dce7),
        changelog: _0x2dcb71(_0x77b0d6, _0x12dce7),
        markdownFiles: _0x2053f9(_0x12dce7.cwd),
        repoMap: {
          available: _0x2cd840.available,
          fallbackReason: _0x2cd840.fallbackReason,
          stats: _0x2cd840.map ? {
            files: Object.keys(_0x2cd840.map.files || {}).length,
            symbols: _0x2cd840.map.stats?.totalSymbols || 0
          } : null
        },
        undocumentedExports: _0x2cd840.available ? _0x237c93(_0x77b0d6, {
          ..._0x12dce7,
          repoMapStatus: _0x2cd840
        }) : []
      };
    }
    const _0x5a2fc7 = {
      DEFAULT_OPTIONS: _0x1319b0,
      findRelatedDocs: _0x1d8aac,
      findMarkdownFiles: _0x2053f9,
      analyzeDocIssues: _0x3856cf,
      checkChangelog: _0x2dcb71,
      getExportsFromGit: _0x593140,
      compareVersions: _0xf67ea0,
      findLineNumber: _0xbc1c88,
      collect: _0x397c84,
      ensureRepoMap: _0x465e9b,
      ensureRepoMapSync: _0x3c83cf,
      getExportsFromRepoMap: _0xd85078,
      findUndocumentedExports: _0x237c93,
      isInternalExport: _0x5a7e60,
      isEntryPoint: _0x1f17a7,
      escapeRegex: _0x370aaa,
      getRepoMapLoadError: _0x1e3fc8
    };
    _0x5e87bb.exports = _0x5a2fc7;
  }
});
var require_git = __commonJS({
  "../work/agent-sh__agentsys/lib/collectors/git.js"(_0x2c4b55, _0x212c6b) {
    'use strict';

    var _0x328312 = require_binary();
    var _0x128537 = {
      top: 20,
      adjustForAi: false,
      cwd: process.cwd()
    };
    function _0x3c0e83(_0x320aed = {}) {
      const _0x43d957 = {
        ..._0x128537,
        ..._0x320aed
      };
      const _0x4ddbfa = _0x43d957;
      const _0x4382f8 = _0x4ddbfa.cwd || process.cwd();
      try {
        _0x328312.ensureBinarySync();
      } catch (_0x53d8b6) {
        const _0x345f49 = {
          available: false,
          error: "Binary not available: " + _0x53d8b6.message
        };
        return _0x345f49;
      }
      let _0x17b5cc;
      try {
        const _0x438d07 = _0x328312.runAnalyzer(["repo-intel", "init", _0x4382f8]);
        _0x17b5cc = JSON.parse(_0x438d07);
      } catch (_0x3fb7d2) {
        const _0x35fa88 = {
          available: false,
          error: "Git analysis failed: " + _0x3fb7d2.message
        };
        return _0x35fa88;
      }
      const _0x24317b = _0x17b5cc.fileActivity || {};
      const _0x3a28e6 = _0x17b5cc.contributors || {};
      const _0x3ed2e7 = _0x17b5cc.aiAttribution || {};
      const _0xd7079e = _0x17b5cc.conventions || {};
      const _0x10069a = _0x17b5cc.releases || {};
      const _0x8b7dcc = Object.entries(_0x24317b).map(([_0xd9476c, _0x270c95]) => ({
        path: _0xd9476c,
        changes: _0x270c95.totalChanges || 0,
        recentChanges: _0x270c95.recentChanges || 0,
        authors: _0x270c95.authors ? Object.keys(_0x270c95.authors).length : 0,
        lastChanged: _0x270c95.lastChanged || null
      })).sort((_0x41ed9a, _0x2766b0) => _0x2766b0.changes - _0x41ed9a.changes).slice(0, _0x4ddbfa.top);
      const _0x227da7 = _0x3a28e6.humans || {};
      const _0x16ad7a = Object.entries(_0x227da7).map(([_0x4865c6, _0x226db4]) => ({
        name: _0x4865c6,
        commits: _0x226db4.commitCount || 0,
        firstSeen: _0x226db4.firstSeen || null,
        lastSeen: _0x226db4.lastSeen || null
      })).sort((_0x758958, _0x322938) => _0x322938.commits - _0x758958.commits);
      const _0x4d160d = _0x16ad7a.reduce((_0x4ac2d7, _0x1b18a2) => _0x4ac2d7 + _0x1b18a2.commits, 0);
      let _0xb31f6b = 0;
      let _0x30667b = 0;
      for (const _0x5249e2 of _0x16ad7a) {
        _0xb31f6b += _0x5249e2.commits;
        _0x30667b++;
        if (_0xb31f6b >= _0x4d160d * 0.8) {
          break;
        }
      }
      const _0x3e1b11 = (_0x3ed2e7.attributed || 0) + (_0x3ed2e7.heuristic || 0);
      const _0x468ed2 = _0x17b5cc.git?.totalCommitsAnalyzed || _0x4d160d;
      const _0x288b3c = _0x468ed2 > 0 ? _0x3e1b11 / _0x468ed2 : 0;
      const _0x29ab23 = {
        style: _0xd7079e.style || null,
        prefixes: _0xd7079e.prefixes || {},
        usesScopes: _0xd7079e.usesScopes || false
      };
      return {
        available: true,
        health: {
          active: _0x16ad7a.length > 0,
          busFactor: _0x30667b,
          aiRatio: Math.round(_0x288b3c * 100) / 100,
          totalCommits: _0x468ed2,
          totalContributors: _0x16ad7a.length
        },
        hotspots: _0x8b7dcc,
        contributors: _0x16ad7a.slice(0, 10),
        aiAttribution: {
          ratio: Math.round(_0x288b3c * 100) / 100,
          attributed: _0x3ed2e7.attributed || 0,
          heuristic: _0x3ed2e7.heuristic || 0,
          none: _0x3ed2e7.none || 0,
          confidence: _0x3ed2e7.confidence || "low",
          tools: _0x3ed2e7.tools || {}
        },
        busFactor: _0x30667b,
        conventions: _0x29ab23,
        releaseInfo: {
          tagCount: _0x10069a.tags ? _0x10069a.tags.length : 0,
          lastRelease: _0x10069a.tags && _0x10069a.tags.length > 0 ? _0x10069a.tags[_0x10069a.tags.length - 1] : null,
          cadence: _0x10069a.cadence || null
        }
      };
    }
    const _0x3815c8 = {
      collectGitData: _0x3c0e83,
      DEFAULT_OPTIONS: _0x128537
    };
    _0x212c6b.exports = _0x3815c8;
  }
});
var require_analyzer_queries = __commonJS({
  "../work/agent-sh__agentsys/lib/collectors/analyzer-queries.js"(_0x5da6d0, _0x38c73e) {
    'use strict';

    var _0x28ed3d = require("fs");
    var _0x37db40 = require("path");
    var _0x5afc50 = {
      cwd: process.cwd()
    };
    var _0x39b281 = [/(^|\/)versioned_docs\//, /(^|\/)versioned_sidebars\//, /(^|\/)tests\/fixtures\//, /(^|\/)__fixtures__\//, /(^|\/)generated\//, /\.generated\.md$/, /(^|\/)CHANGELOG\.md$/i, /(^|\/)node_modules\//, /(^|\/)target\//, /(^|\/)dist\//, /(^|\/)build\//];
    function _0x205f01(_0x599ced) {
      for (const _0x362b5d of [".claude", ".opencode", ".codex"]) {
        if (_0x28ed3d.existsSync(_0x37db40.join(_0x599ced, _0x362b5d))) {
          return _0x362b5d;
        }
      }
      return ".claude";
    }
    function _0x250cf7(_0x5a03e7) {
      return _0x37db40.join(_0x5a03e7, _0x205f01(_0x5a03e7), "repo-intel.json");
    }
    function _0x3acc36() {
      try {
        const {
          binary: _0x474011
        } = require("../agentsys").get();
        if (_0x474011) {
          return _0x474011;
        }
      } catch {}
      try {
        return require_binary();
      } catch {
        return null;
      }
    }
    function _0x45c310(_0xf855bc, _0x43bb9b) {
      try {
        const _0x105750 = _0xf855bc.runAnalyzer(_0x43bb9b);
        return JSON.parse(_0x105750);
      } catch {
        return null;
      }
    }
    function _0x933fe9(_0xd13a75) {
      return (_0xd13a75 || "").replace(/\\/g, "/");
    }
    function _0x27d84c(_0x26b075) {
      if (Array.isArray(_0x26b075)) {
        return _0x26b075;
      } else {
        return [];
      }
    }
    function _0x3623fe(_0x2f634b = {}) {
      const _0x3abd4c = {
        ..._0x5afc50,
        ..._0x2f634b
      };
      const _0x3bb385 = _0x3abd4c;
      const _0x324e1f = _0x3bb385.cwd;
      const _0x368617 = _0x250cf7(_0x324e1f);
      const _0x43b277 = {
        available: false,
        reason: null,
        queryErrors: [],
        mapFile: _0x368617,
        staleDocs: null,
        staleDocsByKey: null,
        staleDocsByDoc: null,
        docDrift: null,
        docDriftAll: null,
        entryPoints: null,
        entryPointSet: null,
        entryPointSymbols: null,
        slopFixes: null,
        orphanExports: null,
        passthroughWrappers: null,
        alwaysTrueConditions: null,
        commentedOutCode: null,
        staleSuppressions: null
      };
      const _0x31890d = _0x43b277;
      const _0x28b5e5 = _0x3acc36();
      if (!_0x28b5e5) {
        const _0x1d7015 = {
          ..._0x31890d
        };
        _0x1d7015.reason = "analyzer-binary-unavailable";
        return _0x1d7015;
      }
      if (!_0x28ed3d.existsSync(_0x368617)) {
        const _0xa6bfbb = {
          ..._0x31890d
        };
        _0xa6bfbb.reason = "repo-intel-map-missing";
        return _0xa6bfbb;
      }
      const _0x143b91 = _0x3bb385.staleDocsTop ?? 500;
      const _0x5c1763 = _0x3bb385.docDriftTop ?? 50;
      const _0x1b8b01 = [];
      const _0x273873 = (_0x24f709, _0x2a7439) => {
        const _0x457aa4 = _0x45c310(_0x28b5e5, _0x2a7439);
        if (_0x457aa4 === null) {
          _0x1b8b01.push(_0x24f709);
        }
        return _0x457aa4;
      };
      const _0x5826b5 = _0x27d84c(_0x273873("stale-docs", ["repo-intel", "query", "stale-docs", "--top", String(_0x143b91), "--map-file", _0x368617, _0x324e1f]));
      const _0x4c9043 = _0x27d84c(_0x273873("doc-drift", ["repo-intel", "query", "doc-drift", "--top", String(_0x5c1763), "--map-file", _0x368617, _0x324e1f]));
      const _0x1bd93d = _0x27d84c(_0x273873("entry-points", ["repo-intel", "query", "entry-points", "--map-file", _0x368617, _0x324e1f]));
      const _0x2a8007 = _0x273873("slop-fixes", ["repo-intel", "query", "slop-fixes", "--map-file", _0x368617, _0x324e1f]);
      const _0x188c6d = Array.isArray(_0x2a8007) ? _0x2a8007 : _0x27d84c(_0x2a8007?.fixes);
      const _0x491a6c = new Map();
      const _0x6f71fb = new Map();
      for (const _0x399101 of _0x5826b5) {
        const _0x4a9872 = _0x933fe9(_0x399101.doc);
        _0x399101.doc = _0x4a9872;
        const _0x268dd6 = _0x4a9872 + ":" + _0x399101.line + ":" + _0x399101.reference;
        _0x491a6c.set(_0x268dd6, _0x399101);
        if (!_0x6f71fb.has(_0x4a9872)) {
          _0x6f71fb.set(_0x4a9872, []);
        }
        _0x6f71fb.get(_0x4a9872).push(_0x399101);
      }
      const _0xaeeef5 = new Set();
      const _0x255b9f = new Set();
      for (const _0xe44053 of _0x1bd93d) {
        const _0xbf1fbf = _0x933fe9(_0xe44053.path);
        if (_0xbf1fbf) {
          _0xaeeef5.add(_0xbf1fbf);
        }
        if (_0xe44053.name && _0xbf1fbf) {
          _0x255b9f.add(_0xbf1fbf + ":" + _0xe44053.name);
        }
      }
      const _0x5b0ffe = _0x3bb385.docDriftIgnore || _0x39b281;
      const _0x457773 = _0x4c9043.filter(_0x14ade5 => {
        const _0x555936 = _0x933fe9(_0x14ade5.path);
        return !_0x5b0ffe.some(_0x25c746 => _0x25c746.test(_0x555936));
      });
      const _0x2d2139 = {
        "orphan-export": "orphanExports",
        "passthrough-wrapper": "passthroughWrappers",
        "always-true-condition": "alwaysTrueConditions",
        "commented-out-code": "commentedOutCode",
        "stale-suppression": "staleSuppressions"
      };
      const _0x1f131e = [];
      const _0x3fdbd0 = [];
      const _0x2cbb12 = [];
      const _0x58f3fd = [];
      const _0x3610a5 = [];
      const _0x55bf8d = {
        orphanExports: _0x1f131e,
        passthroughWrappers: _0x3fdbd0,
        alwaysTrueConditions: _0x2cbb12,
        commentedOutCode: _0x58f3fd,
        staleSuppressions: _0x3610a5
      };
      const _0x2d36b2 = _0x55bf8d;
      for (const _0x3d817a of _0x188c6d) {
        const _0x2cb29b = _0x2d2139[_0x3d817a.category];
        if (_0x2cb29b) {
          _0x2d36b2[_0x2cb29b].push(_0x3d817a);
        }
      }
      const _0x3a110a = _0x1b8b01.length < 4;
      const _0x598f39 = {
        available: _0x3a110a,
        reason: _0x3a110a ? null : "all-queries-failed",
        queryErrors: _0x1b8b01,
        mapFile: _0x368617,
        staleDocs: _0x5826b5,
        staleDocsByKey: _0x491a6c,
        staleDocsByDoc: _0x6f71fb,
        docDrift: _0x457773,
        docDriftAll: _0x4c9043,
        entryPoints: _0x1bd93d,
        entryPointSet: _0xaeeef5,
        entryPointSymbols: _0x255b9f,
        slopFixes: _0x188c6d,
        orphanExports: _0x1f131e,
        passthroughWrappers: _0x3fdbd0,
        alwaysTrueConditions: _0x2cbb12,
        commentedOutCode: _0x58f3fd,
        staleSuppressions: _0x3610a5
      };
      return _0x598f39;
    }
    function _0x2ae36f(_0x5228f6, _0x1863fc, _0x365c3e) {
      if (!_0x5228f6?.entryPointSymbols) {
        return false;
      }
      const _0x331e0c = _0x933fe9(_0x1863fc);
      return _0x5228f6.entryPointSymbols.has(_0x331e0c + ":" + _0x365c3e) || _0x5228f6.entryPointSet.has(_0x331e0c);
    }
    const _0x5cecd4 = {
      DEFAULT_OPTIONS: _0x5afc50,
      DEFAULT_DOC_DRIFT_IGNORE: _0x39b281,
      collect: _0x3623fe,
      isEntryPointSymbol: _0x2ae36f,
      resolveMapFile: _0x250cf7,
      resolveStateDir: _0x205f01
    };
    _0x38c73e.exports = _0x5cecd4;
  }
});
var github = require_github();
var documentation = require_documentation();
var codebase = require_codebase();
var docsPatterns = require_docs_patterns();
var git = require_git();
var analyzerQueries = require_analyzer_queries();
var DEFAULT_OPTIONS = {
  collectors: ["github", "docs", "code"],
  depth: "thorough",
  cwd: process.cwd()
};
function collect(_0x2af305 = {}) {
  const _0x4da5b0 = {
    ...DEFAULT_OPTIONS,
    ..._0x2af305
  };
  const _0x548b30 = _0x4da5b0;
  const _0x1f82b1 = Array.isArray(_0x548b30.collectors) ? _0x548b30.collectors : DEFAULT_OPTIONS.collectors;
  const _0x2cddfa = {
    timestamp: new Date().toISOString(),
    options: _0x548b30,
    github: null,
    docs: null,
    code: null,
    docsPatterns: null,
    git: null,
    analyzer: null
  };
  if (_0x1f82b1.includes("analyzer")) {
    _0x2cddfa.analyzer = analyzerQueries.collect(_0x548b30);
    _0x548b30.analyzer = _0x2cddfa.analyzer;
  }
  if (_0x1f82b1.includes("github")) {
    _0x2cddfa.github = github.scanGitHubState(_0x548b30);
  }
  if (_0x1f82b1.includes("docs")) {
    _0x2cddfa.docs = documentation.analyzeDocumentation(_0x548b30);
  }
  if (_0x1f82b1.includes("code")) {
    _0x2cddfa.code = codebase.scanCodebase(_0x548b30);
  }
  if (_0x1f82b1.includes("docs-patterns")) {
    _0x2cddfa.docsPatterns = docsPatterns.collect(_0x548b30);
  }
  if (_0x1f82b1.includes("git")) {
    _0x2cddfa.git = git.collectGitData(_0x548b30);
  }
  return _0x2cddfa;
}
function collectAllData(_0x1cf5f7 = {}) {
  let _0x483797 = ["github", "docs", "code"];
  if (_0x1cf5f7.sources) {
    _0x483797 = _0x1cf5f7.sources;
  } else if (_0x1cf5f7.collectors) {
    _0x483797 = _0x1cf5f7.collectors;
  }
  const _0x70e195 = {
    ..._0x1cf5f7
  };
  _0x70e195.collectors = _0x483797;
  return collect(_0x70e195);
}
const _0x5aec83 = {
  collect: collect,
  collectAllData: collectAllData,
  github: github,
  documentation: documentation,
  codebase: codebase,
  docsPatterns: docsPatterns,
  git: git,
  analyzerQueries: analyzerQueries,
  scanGitHubState: github.scanGitHubState,
  isGhAvailable: github.isGhAvailable,
  analyzeDocumentation: documentation.analyzeDocumentation,
  scanCodebase: codebase.scanCodebase,
  findRelatedDocs: docsPatterns.findRelatedDocs,
  analyzeDocIssues: docsPatterns.analyzeDocIssues,
  checkChangelog: docsPatterns.checkChangelog,
  ensureRepoMap: docsPatterns.ensureRepoMap,
  ensureRepoMapSync: docsPatterns.ensureRepoMapSync,
  getExportsFromRepoMap: docsPatterns.getExportsFromRepoMap,
  findUndocumentedExports: docsPatterns.findUndocumentedExports,
  isInternalExport: docsPatterns.isInternalExport,
  isEntryPoint: docsPatterns.isEntryPoint,
  collectGitData: git.collectGitData,
  DEFAULT_OPTIONS: DEFAULT_OPTIONS
};
module.exports = _0x5aec83;