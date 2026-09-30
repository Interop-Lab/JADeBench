'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x3c1ca1, _0x5761c7) => function _0x51ff34() {
  if (!_0x5761c7) {
    (0, _0x3c1ca1[__getOwnPropNames(_0x3c1ca1)[0]])((_0x5761c7 = {
      exports: {}
    }).exports, _0x5761c7);
  }
  return _0x5761c7.exports;
};
var require_github = __commonJS({
  "../work/agent-sh__agentsys/lib/collectors/github.js"(_0x4a634d, _0x54a1f2) {
    'use strict';

    var {
      execFileSync: _0x42da02
    } = require("child_process");
    var _0x8c9806 = {
      issueLimit: 100,
      prLimit: 50,
      milestoneLimit: 100,
      timeout: 10000,
      cwd: process.cwd()
    };
    function _0x36cfd5(_0x4677d6, _0x4110f6 = {}) {
      const _0x59d452 = _0x8311f6(_0x4677d6, _0x4110f6);
      if (_0x59d452.ok) {
        return _0x59d452.data;
      } else {
        return null;
      }
    }
    function _0x8311f6(_0x5ca449, _0x57bff6 = {}) {
      try {
        const _0x7b31ec = _0x42da02("gh", _0x5ca449, {
          encoding: "utf8",
          stdio: "pipe",
          timeout: _0x57bff6.timeout || _0x8c9806.timeout,
          cwd: _0x57bff6.cwd || _0x8c9806.cwd
        });
        try {
          return {
            ok: true,
            data: JSON.parse(_0x7b31ec)
          };
        } catch (_0x26b005) {
          return {
            ok: false,
            error: {
              type: "parse",
              message: "Failed to parse gh output as JSON: " + _0x26b005.message,
              raw: _0x7b31ec.slice(0, 500)
            }
          };
        }
      } catch (_0x439264) {
        return {
          ok: false,
          error: {
            type: _0x439264.killed ? "timeout" : "process",
            message: _0x439264.message,
            exitCode: _0x439264.status ?? null,
            stderr: _0x439264.stderr ? String(_0x439264.stderr).trim() : ""
          }
        };
      }
    }
    function _0x24a16b() {
      try {
        _0x42da02("gh", ["auth", "status"], {
          encoding: "utf8",
          stdio: "pipe",
          timeout: 5000
        });
        return true;
      } catch {
        return false;
      }
    }
    function _0x572d3a(_0x53d0d5) {
      return {
        number: _0x53d0d5.number,
        title: _0x53d0d5.title,
        labels: (_0x53d0d5.labels || []).map(_0x108ccb => _0x108ccb.name || _0x108ccb),
        milestone: _0x53d0d5.milestone?.title || _0x53d0d5.milestone || null,
        createdAt: _0x53d0d5.createdAt,
        updatedAt: _0x53d0d5.updatedAt,
        snippet: _0x53d0d5.body ? _0x53d0d5.body.slice(0, 200).replace(/\n/g, " ").trim() + (_0x53d0d5.body.length > 200 ? "..." : "") : ""
      };
    }
    function _0x510c7f(_0x4bd1e1) {
      return {
        number: _0x4bd1e1.number,
        title: _0x4bd1e1.title,
        labels: (_0x4bd1e1.labels || []).map(_0x4bea39 => _0x4bea39.name || _0x4bea39),
        isDraft: _0x4bd1e1.isDraft,
        createdAt: _0x4bd1e1.createdAt,
        updatedAt: _0x4bd1e1.updatedAt,
        files: _0x4bd1e1.files || [],
        snippet: _0x4bd1e1.body ? _0x4bd1e1.body.slice(0, 150).replace(/\n/g, " ").trim() + (_0x4bd1e1.body.length > 150 ? "..." : "") : ""
      };
    }
    function _0x20ddc8(_0x2c2e92, _0x4f6001) {
      const _0x574e9d = {
        bug: "bugs",
        "type: bug": "bugs",
        feature: "features",
        "type: feature": "features",
        enhancement: "enhancements",
        security: "security",
        "type: security": "security"
      };
      const _0x57b108 = Object.entries(_0x574e9d).map(([_0x4cb50c, _0x10e949]) => ({
        regex: new RegExp("(^|[^a-z])" + _0x4cb50c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^a-z]|$)", "i"),
        category: _0x10e949
      }));
      for (const _0x5afc7c of _0x4f6001) {
        const _0x4ff3a3 = (_0x5afc7c.labels || []).map(_0x1ea480 => (_0x1ea480.name || _0x1ea480).toLowerCase());
        let _0x439e8a = false;
        const _0x5bc356 = {
          number: _0x5afc7c.number,
          title: _0x5afc7c.title
        };
        const _0x10dea5 = _0x5bc356;
        for (const {
          regex: _0x2b8881,
          category: _0x34c9a4
        } of _0x57b108) {
          if (_0x4ff3a3.some(_0x488590 => _0x2b8881.test(_0x488590))) {
            _0x2c2e92.categorized[_0x34c9a4].push(_0x10dea5);
            _0x439e8a = true;
            break;
          }
        }
        if (!_0x439e8a) {
          _0x2c2e92.categorized.other.push(_0x10dea5);
        }
      }
    }
    function _0x241dc7(_0x2d9fad, _0x59b511, _0x67d908) {
      const _0x4f9c38 = new Date();
      _0x4f9c38.setDate(_0x4f9c38.getDate() - _0x67d908);
      for (const _0x3a7992 of _0x59b511) {
        const _0x3656f9 = new Date(_0x3a7992.updatedAt);
        if (_0x3656f9 < _0x4f9c38) {
          _0x2d9fad.stale.push({
            number: _0x3a7992.number,
            title: _0x3a7992.title,
            lastUpdated: _0x3a7992.updatedAt,
            daysStale: Math.floor((Date.now() - _0x3656f9) / 86400000)
          });
        }
      }
    }
    function _0x5c7c82(_0x16cc2c, _0x7dd99e) {
      const _0x1f0925 = {};
      const _0x5ef931 = new Set(["the", "a", "an", "is", "are", "to", "for", "in", "on", "at", "with", "and", "or", "of"]);
      for (const _0x3c9eec of _0x7dd99e) {
        const _0x5097e1 = (_0x3c9eec.title || "").toLowerCase().split(/\s+/);
        for (const _0x454103 of _0x5097e1) {
          if (_0x454103.length > 3 && !_0x5ef931.has(_0x454103)) {
            _0x1f0925[_0x454103] = (_0x1f0925[_0x454103] || 0) + 1;
          }
        }
      }
      _0x16cc2c.themes = Object.entries(_0x1f0925).filter(([, _0x3248b0]) => _0x3248b0 > 1).sort((_0x4e649b, _0x27ded1) => _0x27ded1[1] - _0x4e649b[1]).slice(0, 10).map(([_0x54057f, _0x15c709]) => ({
        word: _0x54057f,
        count: _0x15c709
      }));
    }
    function _0x433309(_0x28485b) {
      const _0x6729e = new Date();
      _0x28485b.overdueMilestones = _0x28485b.milestones.filter(_0x87f716 => {
        if (!_0x87f716.due_on || _0x87f716.state === "closed") {
          return false;
        }
        return new Date(_0x87f716.due_on) < _0x6729e;
      });
    }
    function _0x4893c2(_0x47605d = {}) {
      const _0x333d26 = {
        ..._0x8c9806,
        ..._0x47605d
      };
      const _0x3ec1cc = _0x333d26;
      const _0x4843f9 = {
        requestedLimit: _0x3ec1cc.issueLimit,
        fetchedCount: 0,
        hasMore: false
      };
      const _0x35e64a = {
        requestedLimit: _0x3ec1cc.prLimit,
        fetchedCount: 0,
        hasMore: false
      };
      const _0x33ce80 = {
        requestedLimit: _0x3ec1cc.milestoneLimit,
        fetchedCount: 0,
        hasMore: false
      };
      const _0x3196ba = {
        issues: _0x4843f9,
        prs: _0x35e64a,
        milestones: _0x33ce80
      };
      const _0x57144e = {
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
        pagination: _0x3196ba,
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
      const _0x2e3ddb = _0x57144e;
      if (!_0x24a16b()) {
        _0x2e3ddb.error = "gh CLI not available or not authenticated";
        return _0x2e3ddb;
      }
      _0x2e3ddb.available = true;
      const _0x111f7a = _0x8311f6(["issue", "list", "--state", "open", "--json", "number,title,labels,milestone,createdAt,updatedAt,body", "--limit", String(_0x3ec1cc.issueLimit)], _0x3ec1cc);
      if (_0x111f7a.ok && Array.isArray(_0x111f7a.data)) {
        const _0x80507 = _0x111f7a.data;
        _0x2e3ddb.issues = _0x80507.map(_0x572d3a);
        _0x2e3ddb.summary.issueCount = _0x80507.length;
        _0x2e3ddb.pagination.issues.fetchedCount = _0x80507.length;
        _0x2e3ddb.pagination.issues.hasMore = _0x3ec1cc.issueLimit > 0 && _0x80507.length >= _0x3ec1cc.issueLimit;
        _0x20ddc8(_0x2e3ddb, _0x80507);
        _0x241dc7(_0x2e3ddb, _0x80507, 90);
        _0x5c7c82(_0x2e3ddb, _0x80507);
      } else if (!_0x111f7a.ok) {
        const _0x4fc1b4 = {
          source: "issues",
          ..._0x111f7a.error
        };
        _0x2e3ddb.errors.push(_0x4fc1b4);
      }
      const _0x153c9a = _0x8311f6(["pr", "list", "--state", "open", "--json", "number,title,labels,isDraft,createdAt,updatedAt,body,files", "--limit", String(_0x3ec1cc.prLimit)], _0x3ec1cc);
      if (_0x153c9a.ok && Array.isArray(_0x153c9a.data)) {
        const _0x4661f7 = _0x153c9a.data;
        _0x2e3ddb.prs = _0x4661f7.map(_0x510c7f);
        _0x2e3ddb.summary.prCount = _0x4661f7.length;
        _0x2e3ddb.pagination.prs.fetchedCount = _0x4661f7.length;
        _0x2e3ddb.pagination.prs.hasMore = _0x3ec1cc.prLimit > 0 && _0x4661f7.length >= _0x3ec1cc.prLimit;
      } else if (!_0x153c9a.ok) {
        const _0x265b16 = {
          source: "prs",
          ..._0x153c9a.error
        };
        _0x2e3ddb.errors.push(_0x265b16);
      }
      const _0x4be113 = _0x8311f6(["api", "repos/{owner}/{repo}/milestones", "--paginate", "--slurp"], _0x3ec1cc);
      if (_0x4be113.ok && Array.isArray(_0x4be113.data)) {
        const _0x46fd8e = _0x4be113.data;
        const _0x22e634 = _0x46fd8e.flatMap(_0x113b45 => Array.isArray(_0x113b45) ? _0x113b45 : []);
        const _0x23e6cd = _0x22e634.map(_0x3843c6 => ({
          title: _0x3843c6.title,
          state: _0x3843c6.state,
          due_on: _0x3843c6.due_on,
          open_issues: _0x3843c6.open_issues,
          closed_issues: _0x3843c6.closed_issues
        }));
        _0x2e3ddb.pagination.milestones.fetchedCount = _0x23e6cd.length;
        _0x2e3ddb.pagination.milestones.hasMore = _0x3ec1cc.milestoneLimit > 0 && _0x23e6cd.length > _0x3ec1cc.milestoneLimit;
        _0x2e3ddb.milestones = _0x23e6cd.slice(0, _0x3ec1cc.milestoneLimit);
        _0x2e3ddb.summary.milestoneCount = _0x2e3ddb.milestones.length;
        _0x433309(_0x2e3ddb);
      } else if (!_0x4be113.ok) {
        const _0x5599ff = {
          source: "milestones",
          ..._0x4be113.error
        };
        _0x2e3ddb.errors.push(_0x5599ff);
      }
      _0x2e3ddb.partial = _0x2e3ddb.errors.length > 0;
      if (_0x2e3ddb.partial && !_0x2e3ddb.error) {
        _0x2e3ddb.error = "Partial GitHub data collected";
      }
      return _0x2e3ddb;
    }
    const _0x58f2c3 = {
      DEFAULT_OPTIONS: _0x8c9806,
      scanGitHubState: _0x4893c2,
      isGhAvailable: _0x24a16b,
      execGh: _0x36cfd5,
      summarizeIssue: _0x572d3a,
      summarizePR: _0x510c7f,
      categorizeIssues: _0x20ddc8,
      findStaleItems: _0x241dc7,
      extractThemes: _0x5c7c82,
      findOverdueMilestones: _0x433309
    };
    _0x54a1f2.exports = _0x58f2c3;
  }
});
var require_documentation = __commonJS({
  "../work/agent-sh__agentsys/lib/collectors/documentation.js"(_0x543171, _0x2b43ae) {
    'use strict';

    var _0x1af79f = require("fs");
    var _0xcac748 = require("path");
    var _0xb43c11 = {
      depth: "thorough",
      cwd: process.cwd()
    };
    function _0xfbbaca(_0x1a6d8d, _0x2007a3) {
      const _0x55335f = _0xcac748.resolve(_0x2007a3, _0x1a6d8d);
      return _0x55335f.startsWith(_0xcac748.resolve(_0x2007a3));
    }
    function _0x349a56(_0x12c970, _0x4bf713) {
      const _0x2ca508 = _0xcac748.resolve(_0x4bf713, _0x12c970);
      if (!_0xfbbaca(_0x12c970, _0x4bf713)) {
        return null;
      }
      try {
        return _0x1af79f.readFileSync(_0x2ca508, "utf8");
      } catch {
        return null;
      }
    }
    function _0x5591ac(_0x1ae0be, _0xbc407b) {
      const _0x433c27 = _0x1ae0be.match(/^##\s{1,1000}(.+)$/gm) || [];
      const _0x2a806b = _0x433c27.slice(0, 10).map(_0x391c6c => _0x391c6c.replace(/^##\s+/, ""));
      const _0x239ee4 = _0x2a806b.map(_0x467fbb => _0x467fbb.toLowerCase()).join(" ");
      return {
        path: _0xbc407b,
        sectionCount: _0x433c27.length,
        sections: _0x2a806b,
        hasInstallation: /install|setup|getting.started/i.test(_0x239ee4),
        hasUsage: /usage|how.to|example/i.test(_0x239ee4),
        hasApi: /api|reference|methods/i.test(_0x239ee4),
        hasTesting: /test|spec|coverage/i.test(_0x239ee4),
        codeBlocks: Math.floor((_0x1ae0be.match(/```/g) || []).length / 2),
        wordCount: _0x1ae0be.split(/\s+/).length
      };
    }
    function _0x5769b2(_0x4be52c, _0x523197) {
      const _0x2e6790 = (_0x523197.match(/^[-*]\s+\[x\]/gim) || []).length;
      const _0x5d40fb = (_0x523197.match(/^[-*]\s+\[\s\]/gim) || []).length;
      _0x4be52c.checkboxes.checked += _0x2e6790;
      _0x4be52c.checkboxes.unchecked += _0x5d40fb;
      _0x4be52c.checkboxes.total += _0x2e6790 + _0x5d40fb;
    }
    function _0x315d5b(_0x2b7297, _0x4ae0ed) {
      const _0x40325a = /^[-*]\s{1,100}\*{0,2}([^\n]{1,2000}?)\*{0,2}(?:\s{0,100}[-–]\s{0,100}([^\n]{1,2000}))?$/gm;
      let _0x1baf9a;
      while ((_0x1baf9a = _0x40325a.exec(_0x4ae0ed)) !== null && _0x2b7297.features.length < 20) {
        const _0x3f278c = _0x1baf9a[1].trim();
        if (_0x3f278c.length > 5 && _0x3f278c.length < 80) {
          _0x2b7297.features.push(_0x3f278c);
        }
      }
      _0x2b7297.features = [...new Set(_0x2b7297.features)].slice(0, 20);
    }
    function _0x327ea7(_0x29488a, _0xbddbe7) {
      const _0x1afad1 = [/(?:TODO|FIXME|PLAN):\s*(.+)/gi, /^##\s+(?:Roadmap|Future|Planned|Coming Soon)/gim];
      for (const _0x37f670 of _0x1afad1) {
        let _0x9e98dc;
        while ((_0x9e98dc = _0x37f670.exec(_0xbddbe7)) !== null && _0x29488a.plans.length < 15) {
          const _0x398b6b = (_0x9e98dc[1] || _0x9e98dc[0]).slice(0, 100);
          _0x29488a.plans.push(_0x398b6b);
        }
      }
    }
    function _0x57dc15(_0x52edeb) {
      const _0x3feb2b = _0x52edeb.files["README.md"];
      if (!_0x3feb2b) {
        _0x52edeb.gaps.push({
          type: "missing",
          file: "README.md",
          severity: "high"
        });
      } else {
        if (!_0x3feb2b.hasInstallation) {
          _0x52edeb.gaps.push({
            type: "missing-section",
            file: "README.md",
            section: "Installation",
            severity: "medium"
          });
        }
        if (!_0x3feb2b.hasUsage) {
          _0x52edeb.gaps.push({
            type: "missing-section",
            file: "README.md",
            section: "Usage",
            severity: "medium"
          });
        }
      }
      if (!_0x52edeb.files["CHANGELOG.md"]) {
        _0x52edeb.gaps.push({
          type: "missing",
          file: "CHANGELOG.md",
          severity: "low"
        });
      }
    }
    function _0x200b99(_0x13b3e2 = {}) {
      const _0x56b523 = {
        ..._0xb43c11,
        ..._0x13b3e2
      };
      const _0x36787d = _0x56b523;
      const _0x135cfd = _0x36787d.cwd;
      const _0x41a006 = {
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
      const _0x4445c4 = ["README.md", "PLAN.md", "CLAUDE.md", "AGENTS.md", "CONTRIBUTING.md", "CHANGELOG.md", "docs/README.md", "docs/PLAN.md"];
      for (const _0x2f5c52 of _0x4445c4) {
        const _0x4cf8ce = _0x349a56(_0x2f5c52, _0x135cfd);
        if (_0x4cf8ce) {
          const _0xa73c88 = _0x5591ac(_0x4cf8ce, _0x2f5c52);
          _0x41a006.files[_0x2f5c52] = _0xa73c88;
          _0x41a006.summary.totalWords += _0xa73c88.wordCount;
          _0x5769b2(_0x41a006, _0x4cf8ce);
          _0x315d5b(_0x41a006, _0x4cf8ce);
          _0x327ea7(_0x41a006, _0x4cf8ce);
        }
      }
      if (_0x36787d.depth === "thorough") {
        const _0x215c26 = _0xcac748.join(_0x135cfd, "docs");
        if (_0x1af79f.existsSync(_0x215c26)) {
          try {
            const _0xc638a9 = _0x1af79f.readdirSync(_0x215c26).filter(_0x35b54c => _0x35b54c.endsWith(".md") && !_0x4445c4.includes("docs/" + _0x35b54c));
            for (const _0x53c2eb of _0xc638a9.slice(0, 5)) {
              const _0x135b39 = "docs/" + _0x53c2eb;
              const _0xe80bac = _0x349a56(_0x135b39, _0x135cfd);
              if (_0xe80bac) {
                const _0x455e27 = _0x5591ac(_0xe80bac, _0x135b39);
                _0x41a006.files[_0x135b39] = _0x455e27;
                _0x41a006.summary.totalWords += _0x455e27.wordCount;
              }
            }
          } catch {}
        }
      }
      _0x41a006.summary.fileCount = Object.keys(_0x41a006.files).length;
      _0x57dc15(_0x41a006);
      return _0x41a006;
    }
    const _0x361f73 = {
      DEFAULT_OPTIONS: _0xb43c11,
      analyzeDocumentation: _0x200b99,
      analyzeMarkdownFile: _0x5591ac,
      safeReadFile: _0x349a56,
      isPathSafe: _0xfbbaca,
      extractCheckboxes: _0x5769b2,
      extractFeatures: _0x315d5b,
      extractPlans: _0x327ea7,
      identifyDocGaps: _0x57dc15
    };
    _0x2b43ae.exports = _0x361f73;
  }
});
var require_fs_safe = __commonJS({
  "../work/agent-sh__agentsys/lib/utils/fs-safe.js"(_0x2c1962, _0x5296ee) {
    'use strict';

    var _0x2f3402 = require("fs");
    function _0x2a8a95(_0xfa32b8, _0x471eca, _0x2d082e = "utf8") {
      const _0xe44eb = _0x2f3402.openSync(_0xfa32b8, "r");
      try {
        const _0x191ab4 = _0x2f3402.fstatSync(_0xe44eb);
        if (!_0x191ab4.isFile()) {
          const _0x5e762c = new Error("Not a regular file: " + _0xfa32b8);
          _0x5e762c.code = "ENOTFILE";
          throw _0x5e762c;
        }
        if (typeof _0x471eca === "number" && _0x191ab4.size > _0x471eca) {
          const _0x1747e1 = new Error("File too large: " + _0x191ab4.size + " > " + _0x471eca + " bytes");
          _0x1747e1.code = "EFBIG";
          throw _0x1747e1;
        }
        return _0x2f3402.readFileSync(_0xe44eb, _0x2d082e);
      } finally {
        _0x2f3402.closeSync(_0xe44eb);
      }
    }
    const _0x39c873 = {
      readFileWithLimit: _0x2a8a95
    };
    _0x5296ee.exports = _0x39c873;
  }
});
var require_codebase = __commonJS({
  "../work/agent-sh__agentsys/lib/collectors/codebase.js"(_0x1e41a7, _0x2402d1) {
    'use strict';

    var _0xe2bcb4 = require("fs");
    var _0x5dfa2e = require("path");
    var {
      readFileWithLimit: _0x430c06
    } = require_fs_safe();
    var _0x42c765 = {
      depth: "thorough",
      cwd: process.cwd()
    };
    var _0xfc854a = 50000;
    var _0x2b1b39 = ["node_modules", "vendor", "dist", "build", "out", "target", ".git", ".svn", ".hg", "__pycache__", ".pytest_cache", "coverage", ".nyc_output", ".next", ".nuxt", ".cache"];
    var _0x221c6e = {
      js: [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"],
      rust: [".rs"],
      go: [".go"],
      python: [".py"],
      java: [".java"]
    };
    function _0x24e926(_0x309ff7, _0x5c80bd) {
      const _0x3f5451 = _0x5dfa2e.resolve(_0x5c80bd, _0x309ff7);
      const _0x4d0f76 = _0x5dfa2e.resolve(_0x5c80bd);
      if (!_0x3f5451.startsWith(_0x4d0f76)) {
        return null;
      }
      try {
        return _0xe2bcb4.readFileSync(_0x3f5451, "utf8");
      } catch {
        return null;
      }
    }
    function _0x571e9b(_0x23fad3, _0x46aae1 = _0x2b1b39) {
      const _0x52f07d = _0x23fad3.split(/[\\/]/);
      return _0x52f07d.some(_0x51e9e7 => _0x46aae1.includes(_0x51e9e7));
    }
    function _0x5c5e2f(_0x457fb6, _0x5996e7) {
      const _0x28ae4c = {
        ..._0x5996e7.dependencies,
        ..._0x5996e7.devDependencies
      };
      const _0x24c228 = _0x28ae4c;
      const _0x5ea677 = {
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
      for (const [_0x2506ba, _0x32f131] of Object.entries(_0x5ea677)) {
        if (_0x24c228[_0x2506ba]) {
          _0x457fb6.frameworks.push(_0x32f131);
        }
      }
      _0x457fb6.frameworks = [...new Set(_0x457fb6.frameworks)];
    }
    function _0x402eff(_0x4e32da, _0x51b8ba) {
      const _0x527aa9 = {
        ..._0x51b8ba.dependencies,
        ..._0x51b8ba.devDependencies
      };
      const _0x312cd4 = _0x527aa9;
      const _0x2ea50e = ["jest", "mocha", "vitest", "ava", "tap", "jasmine"];
      for (const _0x164573 of _0x2ea50e) {
        if (_0x312cd4[_0x164573]) {
          _0x4e32da.testFramework = _0x164573;
          _0x4e32da.health.hasTests = true;
          break;
        }
      }
    }
    function _0x39b51b(_0x4df928) {
      const _0x4d1f92 = {
        functions: [],
        classes: [],
        exports: []
      };
      const _0x217b07 = /(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
      let _0xc6e293;
      while ((_0xc6e293 = _0x217b07.exec(_0x4df928)) !== null) {
        _0x4d1f92.functions.push(_0xc6e293[1]);
      }
      const _0x302ec9 = /(?:const|let)\s{1,1000}([a-zA-Z_$][a-zA-Z0-9_$]*)\s{0,1000}=\s{0,1000}(?:async\s{0,1000})?\([^)]{0,2000}\)\s{0,1000}=>/g;
      while ((_0xc6e293 = _0x302ec9.exec(_0x4df928)) !== null) {
        _0x4d1f92.functions.push(_0xc6e293[1]);
      }
      const _0x38fc99 = /class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
      while ((_0xc6e293 = _0x38fc99.exec(_0x4df928)) !== null) {
        _0x4d1f92.classes.push(_0xc6e293[1]);
      }
      const _0x1b596b = /export\s+(?:(?:async\s+)?function|class|const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
      while ((_0xc6e293 = _0x1b596b.exec(_0x4df928)) !== null) {
        _0x4d1f92.exports.push(_0xc6e293[1]);
      }
      const _0x3c0f44 = /module\.exports\s{0,1000}=\s{0,1000}\{([^}]{1,100000})\}/;
      const _0x588faf = _0x4df928.match(_0x3c0f44);
      if (_0x588faf) {
        const _0x399edd = _0x588faf[1].split(",").map(_0x557790 => _0x557790.trim().split(":")[0].trim());
        _0x4d1f92.exports.push(..._0x399edd.filter(_0x35a615 => _0x35a615 && /^[a-zA-Z_$]/.test(_0x35a615)));
      }
      _0x4d1f92.functions = [...new Set(_0x4d1f92.functions)];
      _0x4d1f92.classes = [...new Set(_0x4d1f92.classes)];
      _0x4d1f92.exports = [...new Set(_0x4d1f92.exports)];
      return _0x4d1f92;
    }
    function _0x1d8fdc(_0x3f5a10, _0x636234) {
      const _0x5693e0 = {};
      const _0x3583af = ["lib", "src", "app", "pages", "components", "utils", "services", "api"];
      const _0x2bd504 = _0x636234.filter(_0x57729a => _0x3583af.includes(_0x57729a));
      const _0x33ee8f = Object.values(_0x221c6e).flat();
      let _0x1b74cc = 0;
      const _0x5dbb7c = 40;
      function _0xba739e(_0xcd082d, _0x5ab1f2, _0x3a9344 = 0) {
        if (_0x1b74cc >= _0x5dbb7c || _0x3a9344 > 2) {
          return;
        }
        if (!_0xe2bcb4.existsSync(_0xcd082d)) {
          return;
        }
        try {
          const _0x1b75a5 = _0xe2bcb4.readdirSync(_0xcd082d, {
            withFileTypes: true
          });
          for (const _0xd9ea42 of _0x1b75a5) {
            if (_0x1b74cc >= _0x5dbb7c) {
              break;
            }
            const _0x1d9934 = _0x5dfa2e.join(_0xcd082d, _0xd9ea42.name);
            const _0x4b6405 = _0x5ab1f2 ? _0x5ab1f2 + "/" + _0xd9ea42.name : _0xd9ea42.name;
            if (_0xd9ea42.isDirectory()) {
              if (["node_modules", "__tests__", "test", "tests", "dist", "build"].includes(_0xd9ea42.name)) {
                continue;
              }
              _0xba739e(_0x1d9934, _0x4b6405, _0x3a9344 + 1);
            } else if (_0xd9ea42.isFile()) {
              const _0x25de52 = _0x5dfa2e.extname(_0xd9ea42.name);
              if (!_0x33ee8f.includes(_0x25de52)) {
                continue;
              }
              if (_0xd9ea42.name.includes(".test.") || _0xd9ea42.name.includes(".spec.")) {
                continue;
              }
              try {
                const _0x164601 = _0x430c06(_0x1d9934, _0xfc854a);
                const _0x52abc7 = _0x39b51b(_0x164601);
                if (_0x52abc7.functions.length || _0x52abc7.classes.length || _0x52abc7.exports.length) {
                  _0x5693e0[_0x4b6405] = _0x52abc7;
                  _0x1b74cc++;
                }
              } catch {}
            }
          }
        } catch {}
      }
      for (const _0x1b4352 of _0x2bd504) {
        if (_0x1b74cc >= _0x5dbb7c) {
          break;
        }
        _0xba739e(_0x5dfa2e.join(_0x3f5a10, _0x1b4352), _0x1b4352);
      }
      return _0x5693e0;
    }
    function _0x469c36(_0x3b062a, _0x3d24aa, _0x136611, _0x3c5e2c, _0x27ec96 = 0) {
      if (_0x27ec96 >= _0x3c5e2c) {
        return;
      }
      const _0x4d8c7b = _0x5dfa2e.join(_0x3d24aa, _0x136611);
      if (!_0xe2bcb4.existsSync(_0x4d8c7b)) {
        return;
      }
      try {
        const _0x5804d9 = _0xe2bcb4.readdirSync(_0x4d8c7b, {
          withFileTypes: true
        });
        const _0x504079 = [];
        const _0x5e97b7 = [];
        for (const _0x2edde2 of _0x5804d9) {
          if (_0x2edde2.isDirectory()) {
            if (!_0x2b1b39.includes(_0x2edde2.name)) {
              _0x504079.push(_0x2edde2.name);
            }
          } else {
            _0x5e97b7.push(_0x2edde2.name);
          }
        }
        const _0x68ddf5 = _0x136611 || ".";
        const _0x55d6c2 = {
          dirs: _0x504079,
          fileCount: _0x5e97b7.length
        };
        _0x3b062a.structure[_0x68ddf5] = _0x55d6c2;
        for (const _0x52bebe of _0x5e97b7) {
          const _0x5f0297 = _0x5dfa2e.extname(_0x52bebe).toLowerCase() || "no-ext";
          _0x3b062a.fileStats[_0x5f0297] = (_0x3b062a.fileStats[_0x5f0297] || 0) + 1;
        }
        for (const _0x2d0f27 of _0x504079) {
          _0x469c36(_0x3b062a, _0x3d24aa, _0x5dfa2e.join(_0x136611, _0x2d0f27), _0x3c5e2c, _0x27ec96 + 1);
        }
      } catch {}
    }
    function _0x2f9daf(_0x42f6f2, _0xd52681) {
      _0x42f6f2.health.hasReadme = _0xe2bcb4.existsSync(_0x5dfa2e.join(_0xd52681, "README.md"));
      const _0x3fa2ae = [".eslintrc", ".eslintrc.js", ".eslintrc.json", "eslint.config.js", "biome.json"];
      _0x42f6f2.health.hasLinting = _0x3fa2ae.some(_0x2406cd => _0xe2bcb4.existsSync(_0x5dfa2e.join(_0xd52681, _0x2406cd)));
      const _0x5e2f20 = [".github/workflows", ".gitlab-ci.yml", ".circleci", "Jenkinsfile", ".travis.yml"];
      _0x42f6f2.health.hasCi = _0x5e2f20.some(_0x35543e => _0xe2bcb4.existsSync(_0x5dfa2e.join(_0xd52681, _0x35543e)));
      const _0x578e0d = ["tests", "__tests__", "test", "spec"];
      _0x42f6f2.health.hasTests = _0x42f6f2.health.hasTests || _0x578e0d.some(_0x18bb81 => _0xe2bcb4.existsSync(_0x5dfa2e.join(_0xd52681, _0x18bb81)));
    }
    function _0x3607b7(_0x54e074, _0x14e300) {
      const _0x4009eb = {
        authentication: ["auth", "login", "session", "jwt", "oauth"],
        api: ["routes", "controllers", "handlers", "endpoints"],
        database: ["models", "schemas", "migrations", "seeds"],
        ui: ["components", "views", "pages", "layouts"],
        testing: ["__tests__", "test", "spec", ".test.", ".spec."],
        docs: ["docs", "documentation", "wiki"]
      };
      for (const [_0x48036b, _0x5f1ef9] of Object.entries(_0x4009eb)) {
        const _0x228b99 = _0x5f1ef9.some(_0x4cddfe => {
          for (const _0x2f1476 of Object.keys(_0x54e074.structure)) {
            if (_0x2f1476.toLowerCase().includes(_0x4cddfe)) {
              return true;
            }
          }
          return false;
        });
        if (_0x228b99) {
          _0x54e074.implementedFeatures.push(_0x48036b);
        }
      }
    }
    function _0x3219a3(_0x49ec9b = {}) {
      const _0x133438 = {
        ..._0x42c765,
        ..._0x49ec9b
      };
      const _0x2e29e2 = _0x133438;
      const _0x1d3a5a = _0x2e29e2.cwd;
      const _0x74f5c4 = {
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
      const _0xbc9cbd = {};
      const _0x172fea = _0x24e926("package.json", _0x1d3a5a);
      if (_0x172fea) {
        try {
          const _0x2c715a = JSON.parse(_0x172fea);
          _0x5c5e2f(_0x74f5c4, _0x2c715a);
          _0x402eff(_0x74f5c4, _0x2c715a);
        } catch {}
      }
      _0x74f5c4.hasTypeScript = _0xe2bcb4.existsSync(_0x5dfa2e.join(_0x1d3a5a, "tsconfig.json"));
      const _0x27c84b = {
        structure: _0xbc9cbd,
        fileStats: _0x74f5c4.fileStats
      };
      _0x469c36(_0x27c84b, _0x1d3a5a, "", _0x2e29e2.depth === "thorough" ? 3 : 2);
      _0x74f5c4.summary.totalDirs = Object.keys(_0xbc9cbd).length;
      _0x74f5c4.summary.totalFiles = Object.values(_0xbc9cbd).reduce((_0x2c1878, _0x5ca301) => _0x2c1878 + (_0x5ca301.fileCount || 0), 0);
      const _0x5eb3a0 = _0xbc9cbd["."];
      if (_0x5eb3a0) {
        _0x74f5c4.topLevelDirs = _0x5eb3a0.dirs || [];
      }
      _0x2f9daf(_0x74f5c4, _0x1d3a5a);
      if (_0x2e29e2.depth === "thorough") {
        const _0x45f09b = {
          ..._0x74f5c4
        };
        _0x45f09b.structure = _0xbc9cbd;
        _0x3607b7(_0x45f09b, _0x1d3a5a);
        _0x74f5c4.symbols = _0x1d8fdc(_0x1d3a5a, _0x74f5c4.topLevelDirs);
      }
      const _0x4595bf = Object.entries(_0x74f5c4.fileStats).sort((_0x38e700, _0x286acf) => _0x286acf[1] - _0x38e700[1]).slice(0, 10);
      _0x74f5c4.fileStats = Object.fromEntries(_0x4595bf);
      return _0x74f5c4;
    }
    const _0x449738 = {
      DEFAULT_OPTIONS: _0x42c765,
      EXCLUDE_DIRS: _0x2b1b39,
      SOURCE_EXTENSIONS: _0x221c6e,
      scanCodebase: _0x3219a3,
      detectFrameworks: _0x5c5e2f,
      detectTestFramework: _0x402eff,
      detectHealth: _0x2f9daf,
      findImplementedFeatures: _0x3607b7,
      extractSymbols: _0x39b51b,
      scanFileSymbols: _0x1d8fdc,
      scanDirectory: _0x469c36,
      shouldExclude: _0x571e9b,
      safeReadFile: _0x24e926
    };
    _0x2402d1.exports = _0x449738;
  }
});
var require_version = __commonJS({
  "../work/agent-sh__agentsys/lib/binary/version.js"(_0x285ff6, _0xaa93af) {
    'use strict';

    "use strict";
    var _0x2971dc = "0.3.0";
    var _0x2644c6 = "agent-analyzer";
    var _0x6755c4 = "agent-sh/agent-analyzer";
    const _0xf0c2ae = {
      ANALYZER_MIN_VERSION: _0x2971dc,
      BINARY_NAME: _0x2644c6,
      GITHUB_REPO: _0x6755c4
    };
    _0xaa93af.exports = _0xf0c2ae;
  }
});
var require_binary = __commonJS({
  "../work/agent-sh__agentsys/lib/binary/index.js"(_0x58282f, _0x984709) {
    'use strict';

    var _0x5724af = require("fs");
    var _0xd9a2a9 = require("path");
    var _0x1ab005 = require("os");
    var _0x9205a6 = require("https");
    var _0x1984c6 = require("child_process");
    var _0x5de9e2 = require("crypto");
    var {
      promisify: _0x4f9d2a
    } = require("util");
    var _0x110cc0 = _0x4f9d2a(_0x1984c6.execFile);
    var _0x7ebb58 = 268435456;
    var {
      ANALYZER_MIN_VERSION: _0x296e5,
      BINARY_NAME: _0x5a752c,
      GITHUB_REPO: _0xc55ee2
    } = require_version();
    var _0x4aa83e = {
      "darwin-arm64": "aarch64-apple-darwin",
      "darwin-x64": "x86_64-apple-darwin",
      "linux-x64": "x86_64-unknown-linux-gnu",
      "linux-arm64": "aarch64-unknown-linux-gnu",
      "win32-x64": "x86_64-pc-windows-msvc"
    };
    function _0x59c76b() {
      const _0x611138 = process.platform === "win32" ? ".exe" : "";
      return _0xd9a2a9.join(_0x1ab005.homedir(), ".agent-sh", "bin", _0x5a752c + _0x611138);
    }
    function _0x1c9f19() {
      const _0x13a8cb = process.platform + "-" + process.arch;
      return _0x4aa83e[_0x13a8cb] || null;
    }
    function _0x17fafb(_0x232197, _0x4f4ad4) {
      if (!_0x232197) {
        return false;
      }
      const _0x57b98f = _0x232197.match(/^(\d+)\.(\d+)\.(\d+)/);
      if (!_0x57b98f) {
        return false;
      }
      const _0x2b1b7f = _0x57b98f.slice(1).map(Number);
      const _0x274113 = _0x4f4ad4.split(".").map(Number);
      if (_0x2b1b7f[0] > _0x274113[0]) {
        return true;
      }
      if (_0x2b1b7f[0] < _0x274113[0]) {
        return false;
      }
      if (_0x2b1b7f[1] > _0x274113[1]) {
        return true;
      }
      if (_0x2b1b7f[1] < _0x274113[1]) {
        return false;
      }
      return _0x2b1b7f[2] >= _0x274113[2];
    }
    function _0x2f73fa() {
      const _0x3975c8 = _0x59c76b();
      if (!_0x5724af.existsSync(_0x3975c8)) {
        return null;
      }
      try {
        const _0x259c8f = _0x1984c6.execFileSync(_0x3975c8, ["--version"], {
          timeout: 5000,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"],
          windowsHide: true
        });
        const _0x114328 = _0x259c8f.trim().match(/(\d+\.\d+\.\d+)/);
        if (_0x114328) {
          return _0x114328[1];
        } else {
          return _0x259c8f.trim();
        }
      } catch (_0x361836) {
        return null;
      }
    }
    function _0x297de5() {
      const _0x452382 = _0x59c76b();
      if (!_0x5724af.existsSync(_0x452382)) {
        return false;
      }
      const _0x3d6bb8 = _0x2f73fa();
      return _0x17fafb(_0x3d6bb8, _0x296e5);
    }
    async function _0x2d3227() {
      return _0x297de5();
    }
    function _0x304a61(_0x52054a, _0x1cf4e0) {
      const _0x3d149e = process.platform === "win32" ? ".zip" : ".tar.gz";
      return "https://github.com/" + _0xc55ee2 + "/releases/download/v" + _0x52054a + "/" + _0x5a752c + "-" + _0x1cf4e0 + _0x3d149e;
    }
    function _0x45cd5c(_0x2f1aa1) {
      return new Promise(function (_0x473c68, _0x1eff10) {
        const _0x44dbbc = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
        function _0x4ebc0a(_0x11cdeb, _0x4c4c26) {
          if (_0x4c4c26 > 5) {
            _0x1eff10(new Error("Too many redirects fetching from " + _0x2f1aa1));
            return;
          }
          const _0x4a6635 = {
            "User-Agent": "agent-core/binary-resolver",
            Accept: "application/octet-stream"
          };
          if (_0x44dbbc) {
            _0x4a6635.Authorization = "Bearer " + _0x44dbbc;
          }
          const _0x741efd = {
            headers: _0x4a6635
          };
          _0x9205a6.get(_0x11cdeb, _0x741efd, function (_0x2c206a) {
            const _0x4cc5f3 = _0x2c206a.statusCode;
            if (_0x4cc5f3 === 301 || _0x4cc5f3 === 302 || _0x4cc5f3 === 307 || _0x4cc5f3 === 308) {
              _0x2c206a.resume();
              _0x4ebc0a(_0x2c206a.headers.location, _0x4c4c26 + 1);
              return;
            }
            if (_0x4cc5f3 !== 200) {
              _0x2c206a.resume();
              const _0x2bdeec = _0x4cc5f3 === 403 ? " (rate limited - set GITHUB_TOKEN env var)" : "";
              _0x1eff10(new Error("HTTP " + _0x4cc5f3 + _0x2bdeec + " fetching " + _0x11cdeb));
              return;
            }
            const _0x4ce36c = [];
            _0x2c206a.on("data", function (_0xd2d79f) {
              _0x4ce36c.push(_0xd2d79f);
            });
            _0x2c206a.on("end", function () {
              _0x473c68(Buffer.concat(_0x4ce36c));
            });
            _0x2c206a.on("error", _0x1eff10);
          }).on("error", _0x1eff10);
        }
        _0x4ebc0a(_0x2f1aa1, 0);
      });
    }
    function _0x4038c5(_0x2e44e0) {
      if (typeof _0x2e44e0 !== "string") {
        _0x2e44e0 = String(_0x2e44e0 || "");
      }
      const _0xd01c46 = _0x2e44e0.trim().match(/^([A-Fa-f0-9]{64})\b/);
      if (!_0xd01c46) {
        throw new Error("Could not parse SHA-256 digest from sidecar body");
      }
      return _0xd01c46[1].toLowerCase();
    }
    async function _0xbdb1b4(_0xfbc50f) {
      const _0x4e0ef1 = _0xfbc50f + ".sha256";
      const _0x252374 = await _0x45cd5c(_0x4e0ef1);
      return _0x4038c5(_0x252374.toString("utf8"));
    }
    function _0x5aa74f(_0x3bf89b) {
      return _0x5de9e2.createHash("sha256").update(_0x3bf89b).digest("hex");
    }
    function _0x53a7e8(_0x5a4e33, _0x3b3d19, _0x2b2d1a) {
      const _0x5a5c8b = String(_0x3b3d19 || "").toLowerCase();
      const _0x2ed1f5 = _0x5aa74f(_0x5a4e33);
      if (_0x5a5c8b !== _0x2ed1f5) {
        throw new Error("SHA-256 verification failed for " + _0x2b2d1a + ": expected " + _0x5a5c8b + ", got " + _0x2ed1f5 + ". This could indicate a tampered release. Do not extract.");
      }
    }
    function _0x36833e(_0x3a9b0c) {
      if (!_0x3a9b0c || typeof _0x3a9b0c !== "string") {
        throw new Error("Refusing to extract archive with empty entry name");
      }
      const _0x5e001a = _0x3a9b0c.replace(/\\/g, "/").trim();
      if (_0x5e001a.length === 0) {
        throw new Error("Refusing to extract archive with empty entry name");
      }
      if (_0x5e001a.startsWith("//")) {
        throw new Error("Refusing to extract archive with UNC entry: " + _0x3a9b0c);
      }
      if (_0x5e001a.startsWith("/")) {
        throw new Error("Refusing to extract archive with absolute entry: " + _0x3a9b0c);
      }
      if (/^[A-Za-z]:[\\/]/.test(_0x3a9b0c)) {
        throw new Error("Refusing to extract archive with Windows absolute entry: " + _0x3a9b0c);
      }
      const _0x395630 = _0x5e001a.split("/").filter(function (_0x2631f1) {
        return _0x2631f1.length > 0;
      });
      for (let _0x16d9de = 0; _0x16d9de < _0x395630.length; _0x16d9de++) {
        if (_0x395630[_0x16d9de] === "..") {
          throw new Error("Refusing to extract archive with parent-traversal entry: " + _0x3a9b0c);
        }
      }
    }
    function _0x40c7f7(_0x595891) {
      return new Promise(function (_0x55885f, _0x4939a0) {
        const _0x51a9e1 = _0x1984c6.spawn("tar", ["-tz"], {
          stdio: ["pipe", "pipe", "pipe"]
        });
        let _0x13bffb = "";
        let _0x201683 = "";
        _0x51a9e1.stdout.on("data", function (_0x59da4a) {
          _0x13bffb += _0x59da4a;
        });
        _0x51a9e1.stderr.on("data", function (_0x3c11ab) {
          _0x201683 += _0x3c11ab;
        });
        _0x51a9e1.on("error", _0x4939a0);
        _0x51a9e1.on("close", function (_0x36e55c) {
          if (_0x36e55c !== 0) {
            _0x4939a0(new Error("tar -tz listing failed (code " + _0x36e55c + "): " + _0x201683));
            return;
          }
          const _0x41b90b = _0x13bffb.split(/\r?\n/).filter(function (_0x1a4a1c) {
            return _0x1a4a1c.length > 0;
          });
          _0x55885f(_0x41b90b);
        });
        _0x51a9e1.stdin.write(_0x595891);
        _0x51a9e1.stdin.end();
      });
    }
    function _0x1e5f5b(_0x3907e4, _0x15cf43) {
      const _0x148fd8 = _0xd9a2a9.resolve(_0x3907e4) + _0xd9a2a9.sep;
      const _0x3bebe8 = _0xd9a2a9.resolve(_0x15cf43);
      if (_0x3bebe8 !== _0xd9a2a9.resolve(_0x3907e4) && !_0x3bebe8.startsWith(_0x148fd8)) {
        throw new Error("Extracted path escapes extract root: " + _0x15cf43);
      }
    }
    function _0x246f1b(_0x18472d) {
      const _0x5c30fd = [];
      const _0x45c91d = [_0x18472d];
      while (_0x45c91d.length > 0) {
        const _0x87117c = _0x45c91d.pop();
        const _0x515b9f = _0x5724af.lstatSync(_0x87117c);
        if (_0x515b9f.isSymbolicLink()) {
          throw new Error("Refusing to follow symlink produced by extractor: " + _0x87117c);
        }
        if (_0x515b9f.isDirectory()) {
          const _0x2ae6c2 = _0x5724af.readdirSync(_0x87117c);
          for (let _0x1d1797 = 0; _0x1d1797 < _0x2ae6c2.length; _0x1d1797++) {
            _0x45c91d.push(_0xd9a2a9.join(_0x87117c, _0x2ae6c2[_0x1d1797]));
          }
        } else if (_0x515b9f.isFile()) {
          _0x5c30fd.push(_0x87117c);
        }
      }
      return _0x5c30fd;
    }
    function _0x2be3de(_0x1bba10) {
      try {
        _0x5724af.rmSync(_0x1bba10, {
          recursive: true,
          force: true
        });
      } catch (_0x360321) {}
    }
    async function _0xea639a(_0x342206) {
      const _0x47ca2c = await _0x40c7f7(_0x342206);
      for (let _0x32cb36 = 0; _0x32cb36 < _0x47ca2c.length; _0x32cb36++) {
        _0x36833e(_0x47ca2c[_0x32cb36]);
      }
      const _0x2c0b1d = _0x5724af.mkdtempSync(_0xd9a2a9.join(_0x1ab005.tmpdir(), "agent-analyzer-tar-"));
      try {
        await new Promise(function (_0x2eefa6, _0x1686dd) {
          const _0x247424 = _0x1984c6.spawn("tar", ["xz", "-C", _0x2c0b1d], {
            stdio: ["pipe", "pipe", "pipe"]
          });
          let _0x525ae8 = "";
          _0x247424.stderr.on("data", function (_0x562e8a) {
            _0x525ae8 += _0x562e8a;
          });
          _0x247424.on("error", _0x1686dd);
          _0x247424.on("close", function (_0x398366) {
            if (_0x398366 !== 0) {
              _0x1686dd(new Error("tar extraction failed (code " + _0x398366 + "): " + _0x525ae8));
            } else {
              _0x2eefa6();
            }
          });
          _0x247424.stdin.write(_0x342206);
          _0x247424.stdin.end();
        });
        const _0x215914 = _0x246f1b(_0x2c0b1d);
        for (let _0x1b5718 = 0; _0x1b5718 < _0x215914.length; _0x1b5718++) {
          _0x1e5f5b(_0x2c0b1d, _0x215914[_0x1b5718]);
        }
      } catch (_0x2b6a7e) {
        _0x2be3de(_0x2c0b1d);
        throw _0x2b6a7e;
      }
      return _0x2c0b1d;
    }
    var _0x45c795 = ["$ErrorActionPreference = \"Stop\"", "$src  = $env:SRC_ZIP", "$dest = $env:DEST_DIR", "if ([string]::IsNullOrEmpty($src) -or [string]::IsNullOrEmpty($dest)) {", "  [Console]::Error.WriteLine(\"SRC_ZIP and DEST_DIR must both be set\"); exit 2", "}", "Add-Type -AssemblyName System.IO.Compression.FileSystem", "$destFull = [System.IO.Path]::GetFullPath($dest)", "if (-not $destFull.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {", "  $destFull = $destFull + [System.IO.Path]::DirectorySeparatorChar", "}", "$zip = [System.IO.Compression.ZipFile]::OpenRead($src)", "try {", "  foreach ($entry in $zip.Entries) {", "    $name = $entry.FullName", "    if ([string]::IsNullOrEmpty($name)) { continue }", "    $norm = $name -replace \"\\\\\",\"/\"", "    if ($norm.StartsWith(\"/\") -or $norm.StartsWith(\"//\")) {", "      [Console]::Error.WriteLine(\"Refusing absolute/UNC entry: \" + $name); exit 3", "    }", "    if ($name -match \"^[A-Za-z]:[\\\\/]\") {", "      [Console]::Error.WriteLine(\"Refusing Windows-absolute entry: \" + $name); exit 3", "    }", "    foreach ($part in ($norm -split \"/\")) {", "      if ($part -eq \"..\") {", "        [Console]::Error.WriteLine(\"Refusing parent-traversal entry: \" + $name); exit 3", "      }", "    }", "    $target = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($destFull, $norm))", "    if (-not $target.StartsWith($destFull, [System.StringComparison]::OrdinalIgnoreCase)) {", "      [Console]::Error.WriteLine(\"Entry escapes destination: \" + $name); exit 3", "    }", "    if ($entry.FullName.EndsWith(\"/\")) {", "      [System.IO.Directory]::CreateDirectory($target) | Out-Null", "    } else {", "      $parent = [System.IO.Path]::GetDirectoryName($target)", "      if ($parent) { [System.IO.Directory]::CreateDirectory($parent) | Out-Null }", "      [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $target, $true)", "    }", "  }", "} finally {", "  $zip.Dispose()", "}"].join("\r\n");
    async function _0x4b49ea(_0x24ea9b) {
      const _0x529ca7 = _0x5724af.mkdtempSync(_0xd9a2a9.join(_0x1ab005.tmpdir(), "agent-analyzer-zip-"));
      const _0x5363a5 = _0xd9a2a9.join(_0x529ca7, "__archive.zip");
      const _0x1c2c4d = _0x5724af.mkdtempSync(_0xd9a2a9.join(_0x1ab005.tmpdir(), "agent-analyzer-ps-"));
      const _0x20aab8 = _0xd9a2a9.join(_0x1c2c4d, "extract.ps1");
      try {
        _0x5724af.writeFileSync(_0x5363a5, _0x24ea9b);
        _0x5724af.writeFileSync(_0x20aab8, _0x45c795, "utf8");
        await new Promise(function (_0x479d3f, _0x7fe01c) {
          const _0x1b4561 = {
            SRC_ZIP: _0x5363a5,
            DEST_DIR: _0x529ca7
          };
          const _0x75db8c = _0x1984c6.execFile("powershell.exe", ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", _0x20aab8], {
            windowsHide: true,
            env: Object.assign({}, process.env, _0x1b4561)
          }, function (_0x44fe3e, _0x16f63a, _0x2dc3b8) {
            if (_0x44fe3e) {
              _0x7fe01c(new Error("zip extraction failed: " + (_0x2dc3b8 || _0x44fe3e.message)));
            } else {
              _0x479d3f();
            }
          });
          if (_0x75db8c.stdin) {
            _0x75db8c.stdin.end();
          }
        });
        try {
          _0x5724af.unlinkSync(_0x5363a5);
        } catch (_0x328a8c) {}
        const _0xf2de21 = _0x246f1b(_0x529ca7);
        for (let _0x8cfa5 = 0; _0x8cfa5 < _0xf2de21.length; _0x8cfa5++) {
          _0x1e5f5b(_0x529ca7, _0xf2de21[_0x8cfa5]);
        }
      } catch (_0x372cfd) {
        _0x2be3de(_0x529ca7);
        throw _0x372cfd;
      } finally {
        _0x2be3de(_0x1c2c4d);
      }
      return _0x529ca7;
    }
    function _0x5da667(_0x5b6fa6, _0xa7636c) {
      const _0x23445f = _0x246f1b(_0x5b6fa6);
      for (let _0x20e8f7 = 0; _0x20e8f7 < _0x23445f.length; _0x20e8f7++) {
        if (_0xd9a2a9.basename(_0x23445f[_0x20e8f7]) === _0xa7636c) {
          _0x1e5f5b(_0x5b6fa6, _0x23445f[_0x20e8f7]);
          return _0x23445f[_0x20e8f7];
        }
      }
      return null;
    }
    function _0x2f1ddb(_0x5943c4, _0x1e146a) {
      try {
        const _0x17e1ca = _0x1984c6.execFileSync("gh", ["attestation", "verify", _0x5943c4, "--repo", _0x1e146a, "--format", "json"], {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
          timeout: 60000,
          windowsHide: true
        });
        return {
          status: 0,
          stdout: _0x17e1ca || "",
          stderr: ""
        };
      } catch (_0x52a0a4) {
        return {
          status: typeof _0x52a0a4.status === "number" ? _0x52a0a4.status : null,
          stdout: _0x52a0a4.stdout ? String(_0x52a0a4.stdout) : "",
          stderr: _0x52a0a4.stderr ? String(_0x52a0a4.stderr) : _0x52a0a4.message || ""
        };
      }
    }
    function _0xf52dce(_0x3f0fb6) {
      if (typeof _0x3f0fb6 === "function") {
        try {
          return !!_0x3f0fb6();
        } catch (_0x12fd08) {
          return false;
        }
      }
      try {
        _0x1984c6.execFileSync("gh", ["--version"], {
          stdio: "ignore",
          timeout: 5000,
          windowsHide: true
        });
        return true;
      } catch (_0xc144c2) {
        return false;
      }
    }
    function _0x5c0aaa(_0x4ace23, _0x3e9ba9) {
      const _0x68bbdf = _0x3e9ba9 || {};
      const _0x1d59f9 = _0x68bbdf.repo || _0xc55ee2;
      const _0xf9376 = typeof _0x68bbdf.ghRunner === "function" ? _0x68bbdf.ghRunner : _0x2f1ddb;
      const _0x3499cf = typeof _0x68bbdf.requireAttestation === "boolean" ? _0x68bbdf.requireAttestation : process.env.AGENT_ANALYZER_REQUIRE_ATTESTATION === "1";
      const _0x3d9c45 = _0xf52dce(_0x68bbdf.ghProbe);
      if (!_0x3d9c45) {
        const _0x18c0e3 = "`gh` CLI not found on PATH";
        if (_0x3499cf) {
          return {
            status: "failed",
            reason: _0x18c0e3 + " (AGENT_ANALYZER_REQUIRE_ATTESTATION=1)"
          };
        }
        const _0x13e55f = {
          status: "skipped",
          reason: _0x18c0e3
        };
        return _0x13e55f;
      }
      const _0x5f3757 = _0xf9376(_0x4ace23, _0x1d59f9);
      if (_0x5f3757 && _0x5f3757.status === 0) {
        return {
          status: "verified"
        };
      }
      return {
        status: "failed",
        reason: "gh attestation verify exited with status " + (_0x5f3757 && _0x5f3757.status !== null ? _0x5f3757.status : "unknown"),
        stderr: _0x5f3757 && _0x5f3757.stderr || ""
      };
    }
    async function _0x38be2e(_0x43e9ac, _0x51e679) {
      const _0x4ba635 = _0x51e679 || {};
      const _0xe2ee1e = _0x4ba635.skipChecksum === true;
      const _0x24f9da = _0x4ba635.skipAttestation === true;
      const _0x597c35 = _0x1c9f19();
      if (!_0x597c35) {
        throw new Error("Unsupported platform: " + process.platform + "-" + process.arch + ". Supported platforms: " + Object.keys(_0x4aa83e).join(", "));
      }
      const _0x2b9e80 = _0x304a61(_0x43e9ac, _0x597c35);
      const _0x179768 = _0x2b9e80.substring(_0x2b9e80.lastIndexOf("/") + 1);
      process.stderr.write("Downloading " + _0x5a752c + " v" + _0x43e9ac + " for " + _0x597c35 + "...\n");
      const _0x35a961 = _0x59c76b();
      const _0x2f962c = _0xd9a2a9.dirname(_0x35a961);
      _0x5724af.mkdirSync(_0x2f962c, {
        recursive: true
      });
      let _0x40803d;
      try {
        _0x40803d = await _0x45cd5c(_0x2b9e80);
      } catch (_0x5de6f5) {
        throw new Error("Failed to download " + _0x5a752c + ":\n  URL: " + _0x2b9e80 + "\n  Error: " + _0x5de6f5.message + "\n\nTo install manually:\n  1. Download: " + _0x2b9e80 + "\n  2. Extract the binary to: " + _0x2f962c + "\n  3. Ensure it is named: " + _0xd9a2a9.basename(_0x35a961));
      }
      if (_0xe2ee1e) {
        process.stderr.write("[WARN] skipChecksum=true - SHA-256 verification disabled. This is LOCAL DEV ONLY and MUST NOT be used in production.\n");
      } else {
        let _0x6de4d2;
        try {
          _0x6de4d2 = await _0xbdb1b4(_0x2b9e80);
        } catch (_0x3b2a8d) {
          throw new Error("Failed to fetch SHA-256 sidecar for " + _0x179768 + ":\n  URL: " + _0x2b9e80 + ".sha256\n  Error: " + _0x3b2a8d.message + "\n\nThe release may be missing its checksum file. Refusing to install an unverified binary. If this is a legacy release without sidecars, pass { skipChecksum: true } to downloadBinary() (LOCAL DEV ONLY).");
        }
        _0x53a7e8(_0x40803d, _0x6de4d2, _0x179768);
      }
      if (_0x24f9da) {
        process.stderr.write("[WARN] skipAttestation=true - SLSA verification disabled. This is LOCAL DEV ONLY and MUST NOT be used in production.\n");
      } else {
        const _0x2924cc = _0x5724af.mkdtempSync(_0xd9a2a9.join(_0x1ab005.tmpdir(), "agent-analyzer-slsa-"));
        const _0x4d7f9e = _0xd9a2a9.join(_0x2924cc, _0x179768);
        try {
          _0x5724af.writeFileSync(_0x4d7f9e, _0x40803d);
          const _0x11b287 = {
            repo: _0xc55ee2,
            requireAttestation: _0x4ba635.requireAttestation,
            ghRunner: _0x4ba635.ghRunner,
            ghProbe: _0x4ba635.ghProbe
          };
          const _0x5cd3d6 = _0x5c0aaa(_0x4d7f9e, _0x11b287);
          if (_0x5cd3d6.status === "verified") {
            process.stderr.write("[OK] SLSA attestation verified for " + _0x179768 + "\n");
          } else if (_0x5cd3d6.status === "skipped") {
            process.stderr.write("[WARN] SLSA attestation check skipped: " + _0x5cd3d6.reason + ". Install the GitHub CLI (`gh`) to enable provenance verification. Set AGENT_ANALYZER_REQUIRE_ATTESTATION=1 to require it.\n");
          } else {
            throw new Error("SLSA attestation verification failed for " + _0x179768 + ": " + _0x5cd3d6.reason + ". Refusing to execute binary." + (_0x5cd3d6.stderr ? "\n--- gh stderr ---\n" + _0x5cd3d6.stderr : ""));
          }
        } finally {
          _0x2be3de(_0x2924cc);
        }
      }
      const _0x4a9208 = _0xd9a2a9.basename(_0x35a961);
      let _0x539f01;
      try {
        if (process.platform === "win32") {
          _0x539f01 = await _0x4b49ea(_0x40803d);
        } else {
          _0x539f01 = await _0xea639a(_0x40803d);
        }
        const _0x2e9f79 = _0x5da667(_0x539f01, _0x4a9208);
        if (!_0x2e9f79) {
          throw new Error("Expected binary \"" + _0x4a9208 + "\" not found inside archive " + _0x179768 + ". Archive layout may have changed.");
        }
        _0x5724af.copyFileSync(_0x2e9f79, _0x35a961);
      } finally {
        if (_0x539f01) {
          _0x2be3de(_0x539f01);
        }
      }
      if (process.platform !== "win32") {
        _0x5724af.chmodSync(_0x35a961, 493);
      }
      const _0x3fc043 = _0x2f73fa();
      if (!_0x3fc043) {
        throw new Error(_0x5a752c + " was downloaded to " + _0x35a961 + " but could not be executed. Check the file is a valid binary for this platform.");
      }
      return _0x35a961;
    }
    async function _0x886957(_0xb6cf3) {
      const _0x4b6838 = _0xb6cf3 || {};
      const _0x2b8562 = _0x4b6838.version || _0x296e5;
      const _0x117ada = _0x59c76b();
      if (_0x5724af.existsSync(_0x117ada)) {
        const _0x150873 = _0x2f73fa();
        if (_0x17fafb(_0x150873, _0x296e5)) {
          return _0x117ada;
        }
      }
      return _0x38be2e(_0x2b8562, {
        skipChecksum: _0x4b6838.skipChecksum === true,
        skipAttestation: _0x4b6838.skipAttestation === true,
        requireAttestation: _0x4b6838.requireAttestation,
        ghRunner: _0x4b6838.ghRunner,
        ghProbe: _0x4b6838.ghProbe
      });
    }
    function _0x206438(_0x4feb15) {
      const _0x1128dc = _0x59c76b();
      if (_0x5724af.existsSync(_0x1128dc)) {
        const _0x50de37 = _0x2f73fa();
        if (_0x17fafb(_0x50de37, _0x296e5)) {
          return _0x1128dc;
        }
      }
      const _0x3af619 = _0x4feb15 && _0x4feb15.version || _0x296e5;
      const _0x18db2e = !!_0x4feb15 && !!_0x4feb15.skipChecksum;
      const _0x3459e4 = !!_0x4feb15 && !!_0x4feb15.skipAttestation;
      const _0x507ff9 = _0x4feb15 && typeof _0x4feb15.requireAttestation === "boolean" ? _0x4feb15.requireAttestation : undefined;
      const _0x2d20d1 = __filename;
      const _0x113d4b = {
        version: _0x3af619,
        skipChecksum: _0x18db2e,
        skipAttestation: _0x3459e4
      };
      const _0x571850 = _0x113d4b;
      if (_0x507ff9 !== undefined) {
        _0x571850.requireAttestation = _0x507ff9;
      }
      const _0x2261df = ["var b = require(" + JSON.stringify(_0x2d20d1) + ");", "b.ensureBinary(" + JSON.stringify(_0x571850) + ")", "  .then(function(p) { process.stdout.write(p); })", "  .catch(function(e) { process.stderr.write(e.message); process.exit(1); });"];
      try {
        const _0x43946e = _0x1984c6.execFileSync(process.execPath, ["-e", _0x2261df.join("\n")], {
          encoding: "utf8",
          stdio: ["pipe", "pipe", "inherit"],
          timeout: 120000
        });
        return _0x43946e.trim() || _0x1128dc;
      } catch (_0x4ed7ab) {
        throw new Error("Failed to ensure binary (sync): " + _0x4ed7ab.message);
      }
    }
    function _0x44400a(_0x425971, _0x118675) {
      const _0x36a068 = _0x206438();
      const _0x4911e5 = {
        encoding: "utf8",
        windowsHide: true,
        maxBuffer: _0x7ebb58
      };
      const _0x525914 = Object.assign(_0x4911e5, _0x118675);
      if (!_0x525914.stdio) {
        _0x525914.stdio = ["pipe", "pipe", "pipe"];
      }
      const _0x550709 = _0x1984c6.execFileSync(_0x36a068, _0x425971, _0x525914);
      if (typeof _0x550709 === "string") {
        return _0x550709;
      } else {
        return _0x550709.toString("utf8");
      }
    }
    async function _0x40cf8a(_0x63e393, _0x38a710) {
      const _0xed71a = await _0x886957();
      const _0x4ad4bd = {
        encoding: "utf8",
        windowsHide: true,
        maxBuffer: _0x7ebb58
      };
      const _0x1ea027 = Object.assign(_0x4ad4bd, _0x38a710);
      const _0x16490d = await _0x110cc0(_0xed71a, _0x63e393, _0x1ea027);
      return _0x16490d.stdout;
    }
    const _0x2c7114 = {
      ensureBinary: _0x886957,
      ensureBinarySync: _0x206438,
      runAnalyzer: _0x44400a,
      runAnalyzerAsync: _0x40cf8a,
      getBinaryPath: _0x59c76b,
      getVersion: _0x2f73fa,
      getPlatformKey: _0x1c9f19,
      isAvailable: _0x297de5,
      isAvailableAsync: _0x2d3227,
      meetsMinimumVersion: _0x17fafb,
      buildDownloadUrl: _0x304a61,
      PLATFORM_MAP: _0x4aa83e,
      parseSha256Sidecar: _0x4038c5,
      verifySha256: _0x53a7e8,
      sha256Hex: _0x5aa74f,
      assertSafeArchiveEntry: _0x36833e,
      assertInsideRoot: _0x1e5f5b,
      downloadBinary: _0x38be2e,
      verifySlsaAttestation: _0x5c0aaa,
      isGhAvailable: _0xf52dce,
      extractTarGzToScratch: _0xea639a,
      extractZipToScratch: _0x4b49ea,
      _EXTRACT_ZIP_PS1: _0x45c795
    };
    _0x984709.exports = _0x2c7114;
  }
});
var require_installer = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/installer.js"(_0x272a51, _0xea5fb) {
    'use strict';

    var _0x18fb3e = require_binary();
    async function _0x74a360() {
      if (_0x18fb3e.isAvailable()) {
        return {
          found: true,
          version: _0x18fb3e.getVersion(),
          tool: "agent-analyzer"
        };
      }
      try {
        await _0x18fb3e.ensureBinary();
        return {
          found: true,
          version: _0x18fb3e.getVersion(),
          tool: "agent-analyzer"
        };
      } catch (_0x2ed413) {
        const _0xe76ac7 = {
          found: false,
          error: _0x2ed413.message,
          tool: "agent-analyzer"
        };
        return _0xe76ac7;
      }
    }
    function _0x2449a2() {
      if (_0x18fb3e.isAvailable()) {
        return {
          found: true,
          version: _0x18fb3e.getVersion(),
          tool: "agent-analyzer"
        };
      }
      try {
        _0x18fb3e.ensureBinarySync();
        return {
          found: true,
          version: _0x18fb3e.getVersion(),
          tool: "agent-analyzer"
        };
      } catch (_0xfde098) {
        const _0x31dcbe = {
          found: false,
          error: _0xfde098.message,
          tool: "agent-analyzer"
        };
        return _0x31dcbe;
      }
    }
    function _0x13f1d0() {
      return true;
    }
    function _0x456eb5() {
      return "agent-analyzer is downloaded automatically on first use from https://github.com/agent-sh/agent-analyzer/releases";
    }
    function _0x10819a() {
      return "0.3.0";
    }
    const _0x14f0cf = {
      checkInstalled: _0x74a360,
      checkInstalledSync: _0x2449a2,
      meetsMinimumVersion: _0x13f1d0,
      getInstallInstructions: _0x456eb5,
      getMinimumVersion: _0x10819a,
      getCommand: () => null
    };
    _0xea5fb.exports = _0x14f0cf;
  }
});
var require_state_dir = __commonJS({
  "../work/agent-sh__agentsys/lib/platform/state-dir.js"(_0x2f0dfb, _0x19d195) {
    var _0xe6f3c1 = require("fs");
    var _0x2f02de = require("path");
    var _0x5cbab3 = new Map();
    function _0x1808ad(_0x470187) {
      try {
        return _0xe6f3c1.statSync(_0x470187).isDirectory();
      } catch {
        return false;
      }
    }
    function _0x4ae8b9(_0xdfd587 = process.cwd()) {
      if (process.env.AI_STATE_DIR) {
        return process.env.AI_STATE_DIR;
      }
      const _0x50d7dd = _0x2f02de.resolve(_0xdfd587);
      const _0x11fe2b = _0x5cbab3.get(_0x50d7dd);
      if (_0x11fe2b) {
        return _0x11fe2b;
      }
      if (process.env.OPENCODE_CONFIG || process.env.OPENCODE_CONFIG_DIR) {
        _0x5cbab3.set(_0x50d7dd, ".opencode");
        return ".opencode";
      }
      try {
        const _0x5dd9c2 = _0x2f02de.join(_0xdfd587, ".opencode");
        if (_0x1808ad(_0x5dd9c2)) {
          _0x5cbab3.set(_0x50d7dd, ".opencode");
          return ".opencode";
        }
      } catch {}
      if (process.env.CODEX_HOME) {
        _0x5cbab3.set(_0x50d7dd, ".codex");
        return ".codex";
      }
      try {
        const _0x5362f6 = _0x2f02de.join(_0xdfd587, ".codex");
        if (_0x1808ad(_0x5362f6)) {
          _0x5cbab3.set(_0x50d7dd, ".codex");
          return ".codex";
        }
      } catch {}
      _0x5cbab3.set(_0x50d7dd, ".claude");
      return ".claude";
    }
    function _0x6f8096(_0x4fc9b7 = process.cwd()) {
      return _0x2f02de.join(_0x4fc9b7, _0x4ae8b9(_0x4fc9b7));
    }
    function _0x2e444f(_0x397c90 = process.cwd()) {
      const _0x4b2a13 = _0x4ae8b9(_0x397c90);
      if (process.env.AI_STATE_DIR) {
        return "custom";
      }
      switch (_0x4b2a13) {
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
    function _0x24ec9f() {
      _0x5cbab3.clear();
    }
    const _0x2db744 = {
      getStateDir: _0x4ae8b9,
      getStateDirPath: _0x6f8096,
      getPlatformName: _0x2e444f,
      clearCache: _0x24ec9f
    };
    _0x19d195.exports = _0x2db744;
  }
});
var require_atomic_write = __commonJS({
  "../work/agent-sh__agentsys/lib/utils/atomic-write.js"(_0x298a13, _0x4ba824) {
    var _0x73c799 = require("fs");
    var _0x5312b3 = require("path");
    var _0x394648 = require("crypto");
    function _0x3570e1(_0x2d9420) {
      const _0x2ccdc4 = _0x5312b3.dirname(_0x2d9420);
      const _0x4e1019 = _0x5312b3.basename(_0x2d9420);
      const _0x104ced = _0x394648.randomBytes(6).toString("hex");
      return _0x5312b3.join(_0x2ccdc4, "." + _0x4e1019 + "." + _0x104ced + ".tmp");
    }
    function _0x37a940(_0x25df28, _0x143248, _0x1c595a = {}) {
      const {
        encoding = "utf8",
        mode = 420
      } = _0x1c595a;
      const _0x3abfdf = _0x5312b3.dirname(_0x25df28);
      if (!_0x73c799.existsSync(_0x3abfdf)) {
        _0x73c799.mkdirSync(_0x3abfdf, {
          recursive: true
        });
      }
      const _0x5de8a4 = _0x3570e1(_0x25df28);
      try {
        const _0x133cce = {
          encoding: encoding,
          mode: mode
        };
        _0x73c799.writeFileSync(_0x5de8a4, _0x143248, _0x133cce);
        _0x73c799.renameSync(_0x5de8a4, _0x25df28);
        return true;
      } catch (_0x14ad9c) {
        try {
          if (_0x73c799.existsSync(_0x5de8a4)) {
            _0x73c799.unlinkSync(_0x5de8a4);
          }
        } catch {}
        throw _0x14ad9c;
      }
    }
    function _0x12a547(_0x5cedf6, _0x5f3b0e, _0x2e202b = {}) {
      const {
        indent = 2,
        ..._0x524851
      } = _0x2e202b;
      const _0x18b816 = JSON.stringify(_0x5f3b0e, null, indent);
      return _0x37a940(_0x5cedf6, _0x18b816, _0x524851);
    }
    const _0x582129 = {
      writeFileAtomic: _0x37a940,
      writeJsonAtomic: _0x12a547,
      getTempPath: _0x3570e1
    };
    _0x4ba824.exports = _0x582129;
  }
});
var require_cache = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/cache.js"(_0x4e3ac3, _0x578270) {
    'use strict';

    var _0x3224b0 = require("fs");
    var _0x30189d = require("path");
    var {
      getStateDirPath: _0x1e6783
    } = require_state_dir();
    var {
      writeJsonAtomic: _0x59d851,
      writeFileAtomic: _0x100511
    } = require_atomic_write();
    var _0x562c65 = "repo-map.json";
    var _0x14af10 = "repo-map.stale";
    var _0x4c19d2 = "repo-intel.json";
    function _0x46bcac(_0x1062c8) {
      return _0x30189d.join(_0x1e6783(_0x1062c8), _0x562c65);
    }
    function _0x2aa0f0(_0x475364) {
      return _0x30189d.join(_0x1e6783(_0x475364), _0x4c19d2);
    }
    function _0x2b15bc(_0x35d9ea) {
      return _0x30189d.join(_0x1e6783(_0x35d9ea), _0x14af10);
    }
    function _0x4e9c25(_0x1a4b30) {
      const _0x2708f4 = _0x1e6783(_0x1a4b30);
      if (!_0x3224b0.existsSync(_0x2708f4)) {
        _0x3224b0.mkdirSync(_0x2708f4, {
          recursive: true
        });
      }
      return _0x2708f4;
    }
    function _0x291cb9(_0x1a2dcc) {
      const _0xf466d1 = _0x46bcac(_0x1a2dcc);
      if (!_0x3224b0.existsSync(_0xf466d1)) {
        return null;
      }
      try {
        const _0x316ccc = _0x3224b0.readFileSync(_0xf466d1, "utf8");
        return JSON.parse(_0x316ccc);
      } catch {
        return null;
      }
    }
    function _0x472d1c(_0x31b020, _0x248570) {
      _0x4e9c25(_0x31b020);
      const _0x2d32a4 = _0x46bcac(_0x31b020);
      const _0x3bb31c = {
        ..._0x248570,
        updated: new Date().toISOString()
      };
      _0x59d851(_0x2d32a4, _0x3bb31c);
      _0x43876b(_0x31b020);
    }
    function _0x2a4fa5(_0x5d38fc) {
      return _0x3224b0.existsSync(_0x46bcac(_0x5d38fc));
    }
    function _0x285c0c(_0x5b0e04) {
      _0x4e9c25(_0x5b0e04);
      _0x100511(_0x2b15bc(_0x5b0e04), new Date().toISOString());
    }
    function _0x43876b(_0x5294d5) {
      const _0x4fc538 = _0x2b15bc(_0x5294d5);
      if (_0x3224b0.existsSync(_0x4fc538)) {
        _0x3224b0.unlinkSync(_0x4fc538);
      }
    }
    function _0x4147da(_0x3a5784) {
      return _0x3224b0.existsSync(_0x2b15bc(_0x3a5784));
    }
    function _0x2cff43(_0x59e01d) {
      const _0xa0ee71 = _0x291cb9(_0x59e01d);
      if (!_0xa0ee71) {
        return null;
      }
      return {
        generated: _0xa0ee71.generated,
        updated: _0xa0ee71.updated,
        commit: _0xa0ee71.git?.commit,
        branch: _0xa0ee71.git?.branch,
        files: Object.keys(_0xa0ee71.files || {}).length,
        symbols: _0xa0ee71.stats?.totalSymbols || 0,
        languages: _0xa0ee71.project?.languages || []
      };
    }
    const _0x5b1239 = {
      load: _0x291cb9,
      save: _0x472d1c,
      exists: _0x2a4fa5,
      getStatus: _0x2cff43,
      getMapPath: _0x46bcac,
      getPath: _0x2aa0f0,
      getStateDirPath: _0x1e6783,
      markStale: _0x285c0c,
      clearStale: _0x43876b,
      isMarkedStale: _0x4147da
    };
    _0x578270.exports = _0x5b1239;
  }
});
var require_updater = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/updater.js"(_0x15d435, _0x55a7cd) {
    'use strict';

    var {
      execFileSync: _0x2a3f4b
    } = require("child_process");
    var _0xf961d0 = require_cache();
    function _0x11ba70(_0x28822e, _0x129127) {
      const _0x30eac2 = {
        isStale: false,
        reason: null,
        commitsBehind: 0,
        suggestFullRebuild: false
      };
      if (!_0x129127?.git?.commit) {
        _0x30eac2.isStale = true;
        _0x30eac2.reason = "Missing base commit in repo-map";
        _0x30eac2.suggestFullRebuild = true;
        return _0x30eac2;
      }
      if (_0xf961d0.isMarkedStale(_0x28822e)) {
        _0x30eac2.isStale = true;
        _0x30eac2.reason = "Marked stale by hook";
      }
      if (!_0x373d92(_0x28822e, _0x129127.git.commit)) {
        _0x30eac2.isStale = true;
        _0x30eac2.reason = "Base commit no longer exists (rebased?)";
        _0x30eac2.suggestFullRebuild = true;
        return _0x30eac2;
      }
      const _0xe4d773 = _0x2b358e(_0x28822e);
      if (_0xe4d773 && _0x129127.git.branch && _0xe4d773 !== _0x129127.git.branch) {
        _0x30eac2.isStale = true;
        _0x30eac2.reason = "Branch changed from " + _0x129127.git.branch + " to " + _0xe4d773;
        _0x30eac2.suggestFullRebuild = true;
      }
      const _0x3e77e7 = _0x564c31(_0x28822e, _0x129127.git.commit);
      if (_0x3e77e7 > 0) {
        _0x30eac2.isStale = true;
        _0x30eac2.commitsBehind = _0x3e77e7;
        if (!_0x30eac2.reason) {
          _0x30eac2.reason = _0x3e77e7 + " commits behind HEAD";
        }
      }
      return _0x30eac2;
    }
    function _0x55f8ee(_0x146c58) {
      return typeof _0x146c58 === "string" && /^[0-9a-fA-F]{4,40}$/.test(_0x146c58);
    }
    function _0x373d92(_0x251a45, _0x413aea) {
      if (!_0x55f8ee(_0x413aea)) {
        return false;
      }
      try {
        _0x2a3f4b("git", ["cat-file", "-e", _0x413aea], {
          cwd: _0x251a45,
          stdio: ["pipe", "pipe", "pipe"]
        });
        return true;
      } catch {
        return false;
      }
    }
    function _0x2b358e(_0x16fd84) {
      try {
        return _0x2a3f4b("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
          cwd: _0x16fd84,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"]
        }).trim();
      } catch {
        return null;
      }
    }
    function _0x564c31(_0x5f41a2, _0x3e6716) {
      if (!_0x55f8ee(_0x3e6716)) {
        return 0;
      }
      try {
        const _0x3edcc3 = _0x2a3f4b("git", ["rev-list", _0x3e6716 + "..HEAD", "--count"], {
          cwd: _0x5f41a2,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"]
        }).trim();
        return Number(_0x3edcc3) || 0;
      } catch {
        return 0;
      }
    }
    const _0x5462cd = {
      checkStaleness: _0x11ba70
    };
    _0x55a7cd.exports = _0x5462cd;
  }
});
var require_converter = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/converter.js"(_0x161468, _0x174eb8) {
    'use strict';

    var _0x559842 = require("path");
    var _0x43d31f = {
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
    var _0x95d6c2 = new Set(["class", "struct", "interface", "enum", "impl"]);
    var _0x3d2e66 = new Set(["trait", "type-alias"]);
    var _0x4f70f7 = new Set(["method", "arrow", "closure"]);
    var _0x2e4e9e = new Set(["constant", "variable", "const", "field", "property"]);
    function _0x19f0e9(_0x1220f1) {
      return _0x43d31f[_0x559842.extname(_0x1220f1).toLowerCase()] || "unknown";
    }
    function _0x103102(_0x3320ef) {
      const _0x2ba6f6 = new Set();
      for (const _0x15a1dd of _0x3320ef) {
        const _0x265bbb = _0x19f0e9(_0x15a1dd);
        if (_0x265bbb !== "unknown") {
          _0x2ba6f6.add(_0x265bbb);
        }
      }
      return Array.from(_0x2ba6f6);
    }
    function _0x2b3ee6(_0xfae0bd, _0x32c41d) {
      const _0x37352c = new Set((_0x32c41d.exports || []).map(_0x4ae265 => _0x4ae265.name));
      const _0x5ba91e = (_0x32c41d.exports || []).map(_0x56668f => ({
        name: _0x56668f.name,
        kind: _0x56668f.kind,
        line: _0x56668f.line
      }));
      const _0x5e54c2 = [];
      const _0x3656d3 = [];
      const _0x5d5e16 = [];
      const _0x1e5c4c = [];
      for (const _0x4e1cef of _0x32c41d.definitions || []) {
        const _0x327a64 = {
          name: _0x4e1cef.name,
          kind: _0x4e1cef.kind,
          line: _0x4e1cef.line,
          exported: _0x37352c.has(_0x4e1cef.name)
        };
        if (_0x4e1cef.kind === "function" || _0x4f70f7.has(_0x4e1cef.kind)) {
          _0x5e54c2.push(_0x327a64);
        } else if (_0x95d6c2.has(_0x4e1cef.kind)) {
          _0x3656d3.push(_0x327a64);
        } else if (_0x3d2e66.has(_0x4e1cef.kind)) {
          _0x5d5e16.push(_0x327a64);
        } else if (_0x2e4e9e.has(_0x4e1cef.kind)) {
          _0x1e5c4c.push(_0x327a64);
        } else {
          _0x1e5c4c.push(_0x327a64);
        }
      }
      const _0x584513 = (_0x32c41d.imports || []).map(_0x25506f => ({
        source: _0x25506f.from,
        kind: "import",
        names: _0x25506f.names || []
      }));
      const _0x29e5c0 = {
        exports: _0x5ba91e,
        functions: _0x5e54c2,
        classes: _0x3656d3,
        types: _0x5d5e16,
        constants: _0x1e5c4c
      };
      return {
        language: _0x19f0e9(_0xfae0bd),
        symbols: _0x29e5c0,
        imports: _0x584513
      };
    }
    function _0x3a84e1(_0x44328a) {
      const _0x3af2e2 = {};
      let _0x914b71 = 0;
      let _0x5c13d2 = 0;
      for (const [_0x3541a7, _0x2dc857] of Object.entries(_0x44328a.symbols || {})) {
        _0x3af2e2[_0x3541a7] = _0x2b3ee6(_0x3541a7, _0x2dc857);
        const _0x25c12d = _0x3af2e2[_0x3541a7].symbols;
        _0x914b71 += _0x25c12d.functions.length + _0x25c12d.classes.length + _0x25c12d.types.length + _0x25c12d.constants.length;
        _0x5c13d2 += _0x3af2e2[_0x3541a7].imports.length;
      }
      return {
        version: "2.0",
        generated: _0x44328a.generated || new Date().toISOString(),
        git: _0x44328a.git ? {
          commit: _0x44328a.git.analyzedUpTo
        } : undefined,
        project: {
          languages: _0x103102(Object.keys(_0x3af2e2))
        },
        stats: {
          totalFiles: Object.keys(_0x3af2e2).length,
          totalSymbols: _0x914b71,
          totalImports: _0x5c13d2,
          errors: []
        },
        files: _0x3af2e2
      };
    }
    const _0x47efe8 = {
      convertIntelToRepoMap: _0x3a84e1,
      convertFile: _0x2b3ee6,
      detectLanguage: _0x19f0e9
    };
    _0x174eb8.exports = _0x47efe8;
  }
});
var require_queries = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/queries.js"(_0x57b2d2, _0x4f2e1b) {
    'use strict';

    var _0x20a4a1 = require("fs");
    var _0x2a66ac = require("path");
    var {
      getStateDir: _0x570749
    } = require_state_dir();
    var _0x196ef3 = require_binary();
    var _0x2309c3 = class extends Error {
      constructor(_0x56617a) {
        super("repo-intel map not found at " + _0x56617a + ". Run `agentsys repo-intel update` to generate it first.");
        this.name = "RepoIntelMissingError";
        this.code = "REPO_INTEL_MISSING";
        this.mapFile = _0x56617a;
      }
    };
    var _0x3c15cf = "repo-intel.json";
    function _0x3c4772(_0x498a14) {
      const _0x3dc3ca = _0x570749(_0x498a14);
      return _0x2a66ac.join(_0x498a14, _0x3dc3ca, _0x3c15cf);
    }
    function _0x17c121(_0x3a492f) {
      const _0x5a032e = _0x3c4772(_0x3a492f);
      if (!_0x20a4a1.existsSync(_0x5a032e)) {
        throw new _0x2309c3(_0x5a032e);
      }
      return _0x5a032e;
    }
    function _0x14f205(_0x55eda8, _0x58bf77, _0x5e1e16) {
      const _0x37666f = _0x17c121(_0x5e1e16);
      const _0x11da6d = ["repo-intel", "query", _0x55eda8, ..._0x58bf77, "--map-file", _0x37666f, _0x5e1e16];
      let _0x296287;
      try {
        _0x296287 = _0x196ef3.runAnalyzer(_0x11da6d);
      } catch (_0x1363e4) {
        throw new Error("repo-intel query failed [" + _0x55eda8 + "]: " + _0x1363e4.message, {
          cause: _0x1363e4
        });
      }
      let _0x163779;
      try {
        _0x163779 = JSON.parse(_0x296287);
      } catch (_0x1d8504) {
        const _0x42bc65 = _0x296287.slice(0, 200);
        throw new Error("repo-intel query [" + _0x55eda8 + "] returned non-JSON output: " + _0x42bc65);
      }
      return _0x163779;
    }
    function _0x5aa83f(_0x253f47, _0x1ed082) {
      if (typeof _0x253f47 !== "string" || _0x253f47.length === 0) {
        throw new TypeError(_0x1ed082 + " must be a non-empty string");
      }
    }
    function _0x51700d(_0xb53835, _0x224235 = {}) {
      const _0x4375c5 = [];
      if (_0x224235.limit != null) {
        _0x4375c5.push("--top", String(_0x224235.limit));
      }
      return _0x14f205("hotspots", _0x4375c5, _0xb53835);
    }
    function _0x21cdac(_0x3d84d4, _0x46b124, _0x266c67 = {}) {
      _0x5aa83f(_0x46b124, "coupling: file");
      const _0x5437a1 = [_0x46b124];
      if (_0x266c67.limit != null) {
        _0x5437a1.push("--top", String(_0x266c67.limit));
      }
      return _0x14f205("coupling", _0x5437a1, _0x3d84d4);
    }
    function _0x303e6f(_0xdbe8a2, _0x4fc716 = {}) {
      const _0x4268ab = [];
      if (_0x4fc716.adjustForAi) {
        _0x4268ab.push("--adjust-for-ai");
      }
      if (_0x4fc716.limit != null) {
        _0x4268ab.push("--top", String(_0x4fc716.limit));
      }
      return _0x14f205("bus-factor", _0x4268ab, _0xdbe8a2);
    }
    function _0x4eaed7(_0x5b2283, _0x1779f9 = {}) {
      const _0x6182d5 = [];
      if (_0x1779f9.limit != null) {
        _0x6182d5.push("--top", String(_0x1779f9.limit));
      }
      if (_0x1779f9.minChanges != null) {
        _0x6182d5.push("--min-changes", String(_0x1779f9.minChanges));
      }
      return _0x14f205("test-gaps", _0x6182d5, _0x5b2283);
    }
    function _0xefcc71(_0x373103, _0x5ae3f2) {
      if (!Array.isArray(_0x5ae3f2)) {
        throw new TypeError("diffRisk: files must be an array of strings");
      }
      if (!_0x5ae3f2.every(_0x547bfe => typeof _0x547bfe === "string")) {
        throw new TypeError("diffRisk: all entries in files must be strings");
      }
      const _0x440766 = _0x5ae3f2.join(",");
      if (_0x440766.length > 30000) {
        throw new RangeError("diffRisk: files argument exceeds 30000 character limit (got " + _0x440766.length + ")");
      }
      const _0xf787f2 = ["--files", _0x440766];
      return _0x14f205("diff-risk", _0xf787f2, _0x373103);
    }
    function _0x203a08(_0x316f4d, _0x5dfcf9, _0x51c833) {
      _0x5aa83f(_0x5dfcf9, "dependents: symbol");
      const _0x2b0743 = [_0x5dfcf9];
      if (_0x51c833 != null) {
        _0x5aa83f(_0x51c833, "dependents: file");
        _0x2b0743.push("--file", _0x51c833);
      }
      return _0x14f205("dependents", _0x2b0743, _0x316f4d);
    }
    function _0x296869(_0x3f3212, _0x35f582 = {}) {
      const _0x54339d = [];
      if (_0x35f582.limit != null) {
        _0x54339d.push("--top", String(_0x35f582.limit));
      }
      return _0x14f205("bugspots", _0x54339d, _0x3f3212);
    }
    function _0x4f61fb(_0x5bbb02) {
      return _0x14f205("health", [], _0x5bbb02);
    }
    function _0x2a6685(_0x486a2c) {
      return _0x14f205("communities", [], _0x486a2c);
    }
    function _0x25a25b(_0x42a5d9, _0x5e615b = {}) {
      const _0x20123d = [];
      if (_0x5e615b.limit != null) {
        _0x20123d.push("--top", String(_0x5e615b.limit));
      }
      return _0x14f205("boundaries", _0x20123d, _0x42a5d9);
    }
    function _0x226b7e(_0x1a9ba8, _0x5cbbd7) {
      _0x5aa83f(_0x5cbbd7, "areaOf: file");
      return _0x14f205("area-of", [_0x5cbbd7], _0x1a9ba8);
    }
    function _0x1784fa(_0x28877d, _0x58de4f) {
      if (typeof _0x58de4f !== "number" || !Number.isInteger(_0x58de4f) || _0x58de4f < 0) {
        throw new TypeError("communityHealth: id must be a non-negative integer");
      }
      return _0x14f205("community-health", [String(_0x58de4f)], _0x28877d);
    }
    function _0x427bcc(_0x4be8f9, _0x37569d = {}) {
      const _0x1e5474 = [];
      if (_0x37569d.limit != null) {
        _0x1e5474.push("--top", String(_0x37569d.limit));
      }
      return _0x14f205("coldspots", _0x1e5474, _0x4be8f9);
    }
    function _0x400f52(_0x40a2e0, _0x5e29fa) {
      _0x5aa83f(_0x5e29fa, "ownership: file");
      return _0x14f205("ownership", [_0x5e29fa], _0x40a2e0);
    }
    function _0x55976d(_0x42ae31) {
      return _0x14f205("norms", [], _0x42ae31);
    }
    function _0x47cb0d(_0x5be015) {
      return _0x14f205("areas", [], _0x5be015);
    }
    function _0x237527(_0x58eec5, _0x5be8c8 = {}) {
      const _0x4f718e = [];
      if (_0x5be8c8.limit != null) {
        _0x4f718e.push("--top", String(_0x5be8c8.limit));
      }
      return _0x14f205("contributors", _0x4f718e, _0x58eec5);
    }
    function _0x2f40b8(_0x4e1d57) {
      return _0x14f205("release-info", [], _0x4e1d57);
    }
    function _0x15d7fc(_0x2d856f, _0x2a27f9) {
      _0x5aa83f(_0x2a27f9, "fileHistory: file");
      return _0x14f205("file-history", [_0x2a27f9], _0x2d856f);
    }
    function _0x301fb5(_0x4279c3) {
      return _0x14f205("conventions", [], _0x4279c3);
    }
    function _0x361c5a(_0x4b9f6e, _0x1f43cb = {}) {
      const _0x8f1142 = [];
      if (_0x1f43cb.limit != null) {
        _0x8f1142.push("--top", String(_0x1f43cb.limit));
      }
      return _0x14f205("doc-drift", _0x8f1142, _0x4b9f6e);
    }
    function _0xd04207(_0x3ea618) {
      return _0x14f205("onboard", [], _0x3ea618);
    }
    function _0x477729(_0x171321) {
      return _0x14f205("can-i-help", [], _0x171321);
    }
    function _0xc680ae(_0x3a5077, _0x42ed6a = {}) {
      const _0x4f9427 = [];
      if (_0x42ed6a.limit != null) {
        _0x4f9427.push("--top", String(_0x42ed6a.limit));
      }
      return _0x14f205("painspots", _0x4f9427, _0x3a5077);
    }
    function _0x2bb90f(_0x5af2f9, _0x5cfe87 = {}) {
      const _0x2d7bfc = [];
      if (_0x5cfe87.files) {
        const _0x3e1e3f = Array.isArray(_0x5cfe87.files) ? _0x5cfe87.files.join(",") : String(_0x5cfe87.files);
        _0x2d7bfc.push("--files", _0x3e1e3f);
      }
      return _0x14f205("entry-points", _0x2d7bfc, _0x5af2f9);
    }
    function _0x16fe96(_0x5861fb) {
      return _0x14f205("project-info", [], _0x5861fb);
    }
    function _0x315a13(_0x11e0f6, _0x294120) {
      _0x5aa83f(_0x294120, "symbols: file");
      return _0x14f205("symbols", [_0x294120], _0x11e0f6);
    }
    function _0x1cae13(_0x39dbe4, _0x11286 = {}) {
      const _0x6bef9c = [];
      if (_0x11286.limit != null) {
        _0x6bef9c.push("--top", String(_0x11286.limit));
      }
      return _0x14f205("stale-docs", _0x6bef9c, _0x39dbe4);
    }
    function _0x14fb1b(_0x21d017, _0x593653, _0x2d804d = {}) {
      _0x5aa83f(_0x593653, "find: query");
      const _0x3edde1 = [_0x593653];
      if (_0x2d804d.limit != null) {
        _0x3edde1.push("--top", String(_0x2d804d.limit));
      }
      return _0x14f205("find", _0x3edde1, _0x21d017);
    }
    function _0x1442fc(_0x271da2) {
      return _0x14f205("slop-fixes", [], _0x271da2);
    }
    function _0x5ad006(_0x1cb084, _0x44a760 = {}) {
      const _0xc437b1 = [];
      if (_0x44a760.top != null) {
        _0xc437b1.push("--top", String(_0x44a760.top));
      }
      return _0x14f205("slop-targets", _0xc437b1, _0x1cb084);
    }
    function _0x470619(_0x32157a, _0x184e1d = {}) {
      const _0x47d04e = _0x17c121(_0x32157a);
      const _0x1dd462 = [];
      if (_0x184e1d.depth != null) {
        _0x1dd462.push("--depth", String(_0x184e1d.depth));
      }
      const _0x54a592 = ["repo-intel", "query", "summary", ..._0x1dd462, "--map-file", _0x47d04e, _0x32157a];
      let _0x542cd4;
      try {
        _0x542cd4 = _0x196ef3.runAnalyzer(_0x54a592).trim();
      } catch (_0x39d0fb) {
        throw new Error("repo-intel query failed [summary]: " + _0x39d0fb.message, {
          cause: _0x39d0fb
        });
      }
      if (_0x542cd4 === "null") {
        return null;
      }
      if (_0x184e1d.depth != null) {
        return _0x542cd4;
      }
      try {
        return JSON.parse(_0x542cd4);
      } catch (_0x394290) {
        throw new Error("repo-intel query [summary] returned non-JSON output: " + _0x542cd4.slice(0, 200));
      }
    }
    const _0x30ab31 = {
      RepoIntelMissingError: _0x2309c3,
      hotspots: _0x51700d,
      coupling: _0x21cdac,
      busFactor: _0x303e6f,
      testGaps: _0x4eaed7,
      diffRisk: _0xefcc71,
      dependents: _0x203a08,
      bugspots: _0x296869,
      health: _0x4f61fb,
      communities: _0x2a6685,
      boundaries: _0x25a25b,
      areaOf: _0x226b7e,
      communityHealth: _0x1784fa,
      coldspots: _0x427bcc,
      ownership: _0x400f52,
      norms: _0x55976d,
      areas: _0x47cb0d,
      contributors: _0x237527,
      releaseInfo: _0x2f40b8,
      fileHistory: _0x15d7fc,
      conventions: _0x301fb5,
      docDrift: _0x361c5a,
      onboard: _0xd04207,
      canIHelp: _0x477729,
      painspots: _0xc680ae,
      entryPoints: _0x2bb90f,
      projectInfo: _0x16fe96,
      symbols: _0x315a13,
      staleDocs: _0x1cae13,
      find: _0x14fb1b,
      slopFixes: _0x1442fc,
      slopTargets: _0x5ad006,
      summary: _0x470619
    };
    _0x4f2e1b.exports = _0x30ab31;
  }
});
var require_preference = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/embed/preference.js"(_0x4c5588, _0x1ff32c) {
    'use strict';

    var _0x61f895 = require("fs");
    var _0x211593 = require("path");
    var _0x426ae0 = require_cache();
    var _0x4816c2 = ["none", "small", "big"];
    var _0x36bde8 = ["compact", "balanced", "maximum"];
    function _0x4e9b15(_0x1c76a4) {
      return _0x211593.join(_0x426ae0.getStateDirPath(_0x1c76a4), "sources", "preference.json");
    }
    function _0x435a10(_0x26c78a) {
      const _0x165123 = _0x4e9b15(_0x26c78a);
      if (!_0x61f895.existsSync(_0x165123)) {
        return {};
      }
      try {
        const _0x47fb17 = JSON.parse(_0x61f895.readFileSync(_0x165123, "utf8"));
        if (_0x47fb17 && typeof _0x47fb17 === "object") {
          return _0x47fb17;
        } else {
          return {};
        }
      } catch (_0x3cd89d) {
        return {};
      }
    }
    function _0x76b951(_0x16ca5a, _0x50aa77) {
      const _0x535fd2 = _0x435a10(_0x16ca5a);
      const _0x803735 = Object.assign({}, _0x535fd2, _0x50aa77 || {});
      const _0x670a8f = _0x4e9b15(_0x16ca5a);
      _0x61f895.mkdirSync(_0x211593.dirname(_0x670a8f), {
        recursive: true
      });
      _0x61f895.writeFileSync(_0x670a8f, JSON.stringify(_0x803735, null, 2));
      return _0x803735;
    }
    function _0x5c48d5(_0x31a3da) {
      const _0x14cdbd = _0x435a10(_0x31a3da);
      delete _0x14cdbd.embedder;
      delete _0x14cdbd.embedderDetail;
      const _0x475a5d = _0x4e9b15(_0x31a3da);
      _0x61f895.mkdirSync(_0x211593.dirname(_0x475a5d), {
        recursive: true
      });
      _0x61f895.writeFileSync(_0x475a5d, JSON.stringify(_0x14cdbd, null, 2));
    }
    function _0x1b9b80(_0x252a93) {
      const _0x178b3c = _0x435a10(_0x252a93);
      return _0x4816c2.includes(_0x178b3c.embedder);
    }
    function _0xafcf46(_0x5bb67e) {
      const _0x247cab = _0x435a10(_0x5bb67e);
      return _0x36bde8.includes(_0x247cab.embedderDetail);
    }
    function _0x27c039(_0x2db29b) {
      switch (_0x2db29b) {
        case "compact":
          return "compact";
        case "maximum":
          return "maximum";
        case "balanced":
        default:
          return "balanced";
      }
    }
    const _0x533bd4 = {
      read: _0x435a10,
      update: _0x76b951,
      reset: _0x5c48d5,
      hasEmbedderChoice: _0x1b9b80,
      hasDetailChoice: _0xafcf46,
      detailToCliArg: _0x27c039,
      preferencePath: _0x4e9b15,
      VALID_EMBEDDER: _0x4816c2,
      VALID_DETAIL: _0x36bde8
    };
    _0x1ff32c.exports = _0x533bd4;
  }
});
var require_shared_helpers = __commonJS({
  "../work/agent-sh__agentsys/lib/binary/shared-helpers.js"(_0x29a3d9, _0x5ed7ad) {
    'use strict';

    var _0x485a1c = require("fs");
    var _0x593b79 = require("path");
    var _0x5941dd = require("os");
    var _0x42e888 = require("https");
    var _0x58677f = require("child_process");
    var _0x5acc7a = 30000;
    var _0x4d5eb1 = 5;
    function _0x2898a2(_0x2ef24c, _0x4cd80a) {
      const _0x184a6d = _0x4cd80a || {};
      const _0x2fd915 = _0x184a6d.userAgent || "agent-sh/binary-resolver";
      const _0x29821c = _0x184a6d.timeoutMs || _0x5acc7a;
      return new Promise(function (_0x10b975, _0x34b37a) {
        const _0x363ce0 = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
        function _0x506e1d(_0x539898, _0xf6d57f) {
          if (_0xf6d57f > _0x4d5eb1) {
            _0x34b37a(new Error("Too many redirects fetching from " + _0x2ef24c));
            return;
          }
          const _0xee75ba = {
            "User-Agent": _0x2fd915,
            Accept: "application/octet-stream"
          };
          const _0x124bbf = _0xee75ba;
          if (_0x363ce0) {
            _0x124bbf.Authorization = "Bearer " + _0x363ce0;
          }
          const _0x55c85f = {
            headers: _0x124bbf,
            timeout: _0x29821c
          };
          const _0x30e763 = _0x42e888.get(_0x539898, _0x55c85f, function (_0x3639db) {
            const _0x327b57 = _0x3639db.statusCode;
            if (_0x327b57 === 301 || _0x327b57 === 302 || _0x327b57 === 307 || _0x327b57 === 308) {
              _0x3639db.resume();
              var _0x1c0567 = _0x3639db.headers.location;
              if (_0x1c0567 && !_0x1c0567.startsWith("https://")) {
                _0x34b37a(new Error("Refusing non-HTTPS redirect to " + _0x1c0567));
                return;
              }
              _0x506e1d(_0x1c0567, _0xf6d57f + 1);
              return;
            }
            if (_0x327b57 !== 200) {
              _0x3639db.resume();
              const _0x287ddb = _0x327b57 === 403 ? " (rate limited - set GITHUB_TOKEN env var)" : "";
              _0x34b37a(new Error("HTTP " + _0x327b57 + _0x287ddb + " fetching " + _0x539898));
              return;
            }
            const _0x36128f = [];
            _0x3639db.on("data", function (_0x33888d) {
              _0x36128f.push(_0x33888d);
            });
            _0x3639db.on("end", function () {
              _0x10b975(Buffer.concat(_0x36128f));
            });
            _0x3639db.on("error", _0x34b37a);
          });
          _0x30e763.on("error", _0x34b37a);
          _0x30e763.on("timeout", function () {
            _0x30e763.destroy();
            _0x34b37a(new Error("Timeout (" + _0x29821c + "ms) fetching " + _0x539898));
          });
        }
        _0x506e1d(_0x2ef24c, 0);
      });
    }
    function _0x453f46(_0x3e156b, _0x288911) {
      return new Promise(function (_0x76d10a, _0x21ca2a) {
        const _0x4a6e31 = process.platform === "win32" ? _0x288911.replace(/\\/g, "/") : _0x288911;
        const _0x46c225 = _0x58677f.spawn("tar", ["xz", "-C", _0x4a6e31], {
          stdio: ["pipe", "pipe", "pipe"]
        });
        let _0x22e58a = "";
        _0x46c225.stderr.on("data", function (_0x4692c1) {
          _0x22e58a += _0x4692c1;
        });
        _0x46c225.stdin.write(_0x3e156b);
        _0x46c225.stdin.end();
        _0x46c225.on("close", function (_0x5b6334) {
          if (_0x5b6334 !== 0) {
            _0x21ca2a(new Error("tar extraction failed (code " + _0x5b6334 + "): " + _0x22e58a));
          } else {
            _0x76d10a();
          }
        });
        _0x46c225.on("error", _0x21ca2a);
      });
    }
    function _0x32d715(_0x12f31a, _0x26c814, _0x494ff5) {
      return new Promise(function (_0x283a3c, _0x4c67ea) {
        var _0x54315e = _0x485a1c.mkdtempSync(_0x593b79.join(_0x5941dd.tmpdir(), _0x494ff5 + "-"));
        var _0x26e46e = _0x593b79.join(_0x54315e, "archive.zip");
        _0x485a1c.writeFileSync(_0x26e46e, _0x12f31a);
        var _0x1eb0d7 = _0x58677f.spawn("powershell", ["-NoProfile", "-NonInteractive", "-Command", "Expand-Archive", "-Path", _0x26e46e, "-DestinationPath", _0x26c814, "-Force"], {
          stdio: ["ignore", "pipe", "pipe"]
        });
        var _0xb9c78d = "";
        _0x1eb0d7.stderr.on("data", function (_0x441c73) {
          _0xb9c78d += _0x441c73;
        });
        _0x1eb0d7.on("close", function (_0x59e48b) {
          try {
            _0x485a1c.rmSync(_0x54315e, {
              recursive: true,
              force: true
            });
          } catch (_0x599e1a) {}
          if (_0x59e48b !== 0) {
            _0x4c67ea(new Error("zip extraction failed (code " + _0x59e48b + "): " + _0xb9c78d));
          } else {
            _0x283a3c();
          }
        });
        _0x1eb0d7.on("error", _0x4c67ea);
      });
    }
    const _0x11147d = {
      downloadToBuffer: _0x2898a2,
      extractTarGz: _0x453f46,
      extractZip: _0x32d715,
      DEFAULT_DOWNLOAD_TIMEOUT_MS: _0x5acc7a
    };
    _0x5ed7ad.exports = _0x11147d;
  }
});
var require_binary2 = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/embed/binary.js"(_0x6d81ca, _0x21c7a1) {
    'use strict';

    var _0x5d706a = require("fs");
    var _0x4a4a3f = require("path");
    var _0x23e594 = require("os");
    var _0x4ed006 = require("https");
    var _0x4f4191 = require("child_process");
    var _0x5ceee8 = require_binary();
    var _0x5af185 = require_shared_helpers();
    var _0x299a96 = "agent-analyzer-embed";
    var _0x505b55 = "agent-sh/agent-analyzer";
    var _0x4a0b05 = 3600000;
    var _0x612b2d = _0x5ceee8.PLATFORM_MAP;
    function _0x51bf06() {
      const _0x2d5702 = process.platform === "win32" ? ".exe" : "";
      return _0x4a4a3f.join(_0x23e594.homedir(), ".agent-sh", "bin", _0x299a96 + _0x2d5702);
    }
    function _0x238164() {
      if (process.platform === "win32") {
        return "onnxruntime.dll";
      }
      if (process.platform === "darwin") {
        return "libonnxruntime.dylib";
      }
      return "libonnxruntime.so";
    }
    function _0x5bec2e() {
      return _0x4a4a3f.join(_0x4a4a3f.dirname(_0x51bf06()), _0x238164());
    }
    function _0x230257() {
      const _0x10ab17 = _0x144e15();
      return !!_0x10ab17 && !_0x10ab17.includes("musl");
    }
    function _0x144e15() {
      const _0x1214ee = process.platform + "-" + process.arch;
      return _0x612b2d[_0x1214ee] || null;
    }
    function _0x2aea59() {
      const _0x49abbd = _0x51bf06();
      if (!_0x5d706a.existsSync(_0x49abbd)) {
        return null;
      }
      try {
        const _0x80bfb1 = _0x4f4191.execFileSync(_0x49abbd, ["--version"], {
          timeout: 5000,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"],
          windowsHide: true
        });
        const _0x342337 = _0x80bfb1.trim().match(/(\d+\.\d+\.\d+)/);
        if (_0x342337) {
          return _0x342337[1];
        } else {
          return _0x80bfb1.trim();
        }
      } catch (_0x560e69) {
        return null;
      }
    }
    function _0x151619() {
      return _0x5d706a.existsSync(_0x51bf06());
    }
    var _0x4052f4 = null;
    async function _0x3e1acb() {
      if (_0x4052f4 && Date.now() - _0x4052f4.fetchedAt < _0x4a0b05) {
        return _0x4052f4.version;
      }
      return new Promise(function (_0x4b3dd9, _0xf219da) {
        const _0x1d6c25 = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
        const _0x49b68c = {
          "User-Agent": "agent-sh/embed-resolver",
          Accept: "application/vnd.github+json"
        };
        if (_0x1d6c25) {
          _0x49b68c.Authorization = "Bearer " + _0x1d6c25;
        }
        const _0x384792 = "https://api.github.com/repos/" + _0x505b55 + "/releases/latest";
        const _0x10250a = function (_0x384eb7) {
          _0xf219da(new Error(_0x384eb7 + " fetching " + _0x384792));
        };
        const _0x3783a6 = {
          headers: _0x49b68c,
          timeout: 5000
        };
        const _0x516859 = _0x4ed006.get(_0x384792, _0x3783a6, function (_0x3f480a) {
          if (_0x3f480a.statusCode !== 200) {
            _0x3f480a.resume();
            _0x10250a("HTTP " + _0x3f480a.statusCode);
            return;
          }
          const _0x5e5a8a = [];
          _0x3f480a.on("data", function (_0x274d35) {
            _0x5e5a8a.push(_0x274d35);
          });
          _0x3f480a.on("end", function () {
            try {
              const _0x1cdb57 = JSON.parse(Buffer.concat(_0x5e5a8a).toString("utf8"));
              const _0x9189d2 = _0x1cdb57 && _0x1cdb57.tag_name || "";
              const _0x5afe0d = _0x9189d2.replace(/^v/, "");
              if (/^\d+\.\d+\.\d+/.test(_0x5afe0d)) {
                _0x4052f4 = {
                  version: _0x5afe0d,
                  fetchedAt: Date.now()
                };
                _0x4b3dd9(_0x5afe0d);
              } else {
                _0x10250a("No valid release tag");
              }
            } catch (_0x3303e8) {
              _0x10250a("Failed to parse release JSON: " + _0x3303e8.message);
            }
          });
          _0x3f480a.on("error", function (_0x279cb8) {
            _0x10250a(_0x279cb8.message);
          });
        });
        _0x516859.on("error", function (_0x271778) {
          _0x10250a(_0x271778.message);
        });
        _0x516859.on("timeout", function () {
          _0x516859.destroy();
          _0x10250a("Timeout");
        });
      });
    }
    function _0x27e213(_0x24775e, _0x361b39) {
      const _0x3c0668 = process.platform === "win32" ? ".zip" : ".tar.gz";
      return "https://github.com/" + _0x505b55 + "/releases/download/v" + _0x24775e + "/" + _0x299a96 + "-" + _0x361b39 + _0x3c0668;
    }
    function _0x4e4e55(_0x32aa8a) {
      return _0x5af185.downloadToBuffer(_0x32aa8a, {
        userAgent: "agent-sh/embed-resolver"
      });
    }
    var _0x1af11e = _0x5af185.extractTarGz;
    var _0x5d86e3 = _0x5af185.extractZip;
    async function _0x2b3c36(_0x41e3a0) {
      const _0x4f4ff2 = _0x144e15();
      if (!_0x4f4ff2) {
        throw new Error("Unsupported platform: " + process.platform + "-" + process.arch + ". Supported: " + Object.keys(_0x612b2d).join(", "));
      }
      const _0x44ce74 = _0x27e213(_0x41e3a0, _0x4f4ff2);
      process.stderr.write("Downloading " + _0x299a96 + " v" + _0x41e3a0 + " for " + _0x4f4ff2 + "...\n");
      const _0x38e032 = _0x51bf06();
      const _0x1bf9f2 = _0x4a4a3f.dirname(_0x38e032);
      _0x5d706a.mkdirSync(_0x1bf9f2, {
        recursive: true
      });
      let _0x488b60;
      try {
        _0x488b60 = await _0x4e4e55(_0x44ce74);
      } catch (_0x3961db) {
        throw new Error("Failed to download " + _0x299a96 + ":\n  URL: " + _0x44ce74 + "\n  Error: " + _0x3961db.message + "\n\nTo install manually:\n  1. Download: " + _0x44ce74 + "\n  2. Extract the binary to: " + _0x1bf9f2 + "\n  3. Ensure it is named: " + _0x4a4a3f.basename(_0x38e032));
      }
      if (process.platform === "win32") {
        await _0x5d86e3(_0x488b60, _0x1bf9f2, _0x4a4a3f.basename(_0x38e032));
      } else {
        await _0x1af11e(_0x488b60, _0x1bf9f2);
      }
      if (process.platform !== "win32") {
        _0x5d706a.chmodSync(_0x38e032, 493);
      }
      return _0x38e032;
    }
    async function _0x558d04(_0x494006) {
      const _0x4bed0a = _0x494006 || {};
      const _0x2c37f0 = _0x51bf06();
      if (_0x5d706a.existsSync(_0x2c37f0)) {
        if (_0x230257() && !_0x5d706a.existsSync(_0x5bec2e())) {
          const _0x10f385 = _0x4bed0a.version || (await _0x3e1acb());
          return _0x2b3c36(_0x10f385);
        }
        return _0x2c37f0;
      }
      const _0x9d02b = _0x4bed0a.version || (await _0x3e1acb());
      return _0x2b3c36(_0x9d02b);
    }
    const _0x46add9 = {
      EMBED_BINARY_NAME: _0x299a96,
      getBinaryPath: _0x51bf06,
      getBundledOrtName: _0x238164,
      getBundledOrtPath: _0x5bec2e,
      platformBundlesOrt: _0x230257,
      getVersion: _0x2aea59,
      getPlatformKey: _0x144e15,
      getLatestReleaseVersion: _0x3e1acb,
      isAvailable: _0x151619,
      ensureBinary: _0x558d04,
      buildDownloadUrl: _0x27e213
    };
    _0x21c7a1.exports = _0x46add9;
  }
});
var require_orchestrator = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/embed/orchestrator.js"(_0x1b2af4, _0x46459e) {
    'use strict';

    var _0x2fa269 = require("fs");
    var _0x8108ac = require("path");
    var _0xd770 = require("child_process");
    var _0x3347a4 = require_preference();
    var _0x26c539 = require_binary2();
    var _0x502694 = require_binary();
    var _0x2ec623 = require_cache();
    function _0x34013d(_0x40c7a0) {
      const _0x43cd24 = _0x3347a4.read(_0x40c7a0);
      return _0x43cd24.embedder === "small" || _0x43cd24.embedder === "big";
    }
    async function _0x12391c(_0x472cb8) {
      if (!_0x34013d(_0x472cb8)) {
        return {
          ran: false,
          reason: "embedder preference is \"none\" or unset"
        };
      }
      const _0x219ce0 = _0x3347a4.read(_0x472cb8);
      const _0x1e5286 = _0x3347a4.detailToCliArg(_0x219ce0.embedderDetail || "balanced");
      const _0x310a50 = _0x2ec623.getPath(_0x472cb8);
      if (!_0x2fa269.existsSync(_0x310a50)) {
        return {
          ran: false,
          reason: "no repo-intel map found; run `/repo-intel init` first"
        };
      }
      const _0x3e0c97 = Date.now();
      const _0x335a06 = await _0x26c539.ensureBinary();
      const _0x416765 = await _0x502694.ensureBinary();
      const _0x4b870d = await _0x1757a8(_0x335a06, ["scan", _0x472cb8, "--variant", _0x219ce0.embedder, "--detail", _0x1e5286], _0x416765, _0x310a50);
      return Object.assign({
        ran: true,
        durationMs: Date.now() - _0x3e0c97
      }, _0x4b870d);
    }
    async function _0x35abe2(_0x48d7ff) {
      if (!_0x34013d(_0x48d7ff)) {
        return {
          ran: false,
          reason: "embedder preference is \"none\" or unset"
        };
      }
      const _0xb4fcc0 = _0x3347a4.read(_0x48d7ff);
      const _0x8f6fe2 = _0x3347a4.detailToCliArg(_0xb4fcc0.embedderDetail || "balanced");
      const _0x269cf6 = _0x2ec623.getPath(_0x48d7ff);
      if (!_0x2fa269.existsSync(_0x269cf6)) {
        return {
          ran: false,
          reason: "no repo-intel map; run `/repo-intel init` then `enrich`"
        };
      }
      const _0x34af2f = Date.now();
      const _0x35a7b9 = await _0x26c539.ensureBinary();
      const _0x75b343 = await _0x502694.ensureBinary();
      const _0x47dc63 = await _0x1757a8(_0x35a7b9, ["update", _0x48d7ff, "--map-file", _0x269cf6, "--variant", _0xb4fcc0.embedder, "--detail", _0x8f6fe2], _0x75b343, _0x269cf6);
      return Object.assign({
        ran: true,
        durationMs: Date.now() - _0x34af2f
      }, _0x47dc63);
    }
    function _0xe819d1(_0x5894ae) {
      const _0x196e27 = _0x3347a4.read(_0x5894ae);
      const _0x2d1f2a = _0x2ec623.getPath(_0x5894ae);
      const _0x18fb9f = _0x247011(_0x2d1f2a);
      return {
        enabled: _0x34013d(_0x5894ae),
        embedder: _0x196e27.embedder,
        embedderDetail: _0x196e27.embedderDetail,
        binaryInstalled: _0x26c539.isAvailable(),
        ortBundled: !_0x26c539.platformBundlesOrt() || _0x2fa269.existsSync(_0x26c539.getBundledOrtPath()),
        sidecarExists: _0x2fa269.existsSync(_0x18fb9f),
        sidecarPath: _0x18fb9f
      };
    }
    function _0x1757a8(_0x47cc77, _0x45bbc8, _0x1c0183, _0x4a25d4) {
      return new Promise(function (_0x133226, _0x64cfcd) {
        const _0x2de1b0 = _0xd770.spawn(_0x47cc77, _0x45bbc8, {
          stdio: ["ignore", "pipe", "pipe"],
          windowsHide: true
        });
        const _0x32c420 = _0xd770.spawn(_0x1c0183, ["repo-intel", "set-embeddings", "--map-file", _0x4a25d4, "--input", "-"], {
          stdio: ["pipe", "pipe", "pipe"],
          windowsHide: true
        });
        let _0x1b7822 = null;
        let _0x2a701e = null;
        let _0x307b02 = false;
        let _0x5c2968 = "";
        let _0x52f33c = "";
        let _0x44588a = "";
        function _0x4b1cfb(_0x532142, _0x3a62fe) {
          if (_0x307b02) {
            return;
          }
          _0x307b02 = true;
          if (_0x532142) {
            try {
              _0x2de1b0.kill("SIGTERM");
            } catch (_0x3b6688) {}
            try {
              _0x32c420.kill("SIGTERM");
            } catch (_0x159ff8) {}
            _0x64cfcd(_0x532142);
          } else {
            _0x133226(_0x3a62fe);
          }
        }
        function _0x4146b4() {
          if (_0x307b02 || _0x1b7822 === null || _0x2a701e === null) {
            return;
          }
          if (_0x1b7822 !== 0) {
            return _0x4b1cfb(new Error(_0x26c539.EMBED_BINARY_NAME + " exited " + _0x1b7822 + (_0x52f33c.trim() ? ": " + _0x52f33c.trim().slice(0, 500) : "")));
          }
          if (_0x2a701e !== 0) {
            return _0x4b1cfb(new Error("agent-analyzer set-embeddings exited " + _0x2a701e + (_0x44588a.trim() ? ": " + _0x44588a.trim().slice(0, 500) : "")));
          }
          const _0x3808b8 = _0x5c2968.match(/(\d+)\s+files?/);
          _0x4b1cfb(null, {
            files: _0x3808b8 ? parseInt(_0x3808b8[1], 10) : undefined
          });
        }
        _0x2de1b0.stderr.on("data", function (_0x1ddea7) {
          _0x52f33c += _0x1ddea7.toString("utf8");
        });
        _0x32c420.stderr.on("data", function (_0x3e22cf) {
          _0x44588a += _0x3e22cf.toString("utf8");
        });
        _0x32c420.stdout.on("data", function (_0x56434a) {
          _0x5c2968 += _0x56434a.toString("utf8");
        });
        _0x2de1b0.stdout.on("error", function (_0xacdc86) {
          _0x4b1cfb(_0xacdc86);
        });
        _0x32c420.stdin.on("error", function (_0x59fbe2) {
          if (_0x59fbe2 && _0x59fbe2.code !== "EPIPE") {
            _0x4b1cfb(_0x59fbe2);
          }
        });
        _0x2de1b0.stdout.pipe(_0x32c420.stdin);
        _0x2de1b0.on("error", function (_0x283cf1) {
          _0x4b1cfb(_0x283cf1);
        });
        _0x32c420.on("error", function (_0x27652d) {
          _0x4b1cfb(_0x27652d);
        });
        _0x2de1b0.on("close", function (_0x53fdf7) {
          _0x1b7822 = _0x53fdf7;
          _0x4146b4();
        });
        _0x32c420.on("close", function (_0x273b4b) {
          _0x2a701e = _0x273b4b;
          _0x4146b4();
        });
      });
    }
    function _0x247011(_0x2a881f) {
      if (!_0x2a881f) {
        return "";
      }
      const _0x9e62f6 = _0x8108ac.dirname(_0x2a881f);
      const _0x537cb8 = _0x8108ac.basename(_0x2a881f, _0x8108ac.extname(_0x2a881f));
      return _0x8108ac.join(_0x9e62f6, _0x537cb8 + ".embeddings.bin");
    }
    const _0x11673c = {
      isEnabled: _0x34013d,
      runScan: _0x12391c,
      runUpdate: _0x35abe2,
      status: _0xe819d1,
      streamEmbedToSetEmbeddings: _0x1757a8
    };
    _0x46459e.exports = _0x11673c;
  }
});
var require_embed = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/embed/index.js"(_0x5f45e4, _0x17d56f) {
    'use strict';

    "use strict";
    var _0xcf243f = require_preference();
    var _0x50ec6e = require_binary2();
    var _0x17c153 = require_orchestrator();
    const _0x4baeac = {
      preference: _0xcf243f,
      binary: _0x50ec6e,
      orchestrator: _0x17c153,
      isEnabled: _0x17c153.isEnabled,
      runScan: _0x17c153.runScan,
      runUpdate: _0x17c153.runUpdate,
      status: _0x17c153.status
    };
    _0x17d56f.exports = _0x4baeac;
  }
});
var require_repo_intel = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/index.js"(_0x318e31, _0x29a55c) {
    'use strict';

    var _0x1a2561 = require("fs");
    var _0x52c34c = require("path");
    var _0xcb7e64 = require("child_process");
    var {
      execFileSync: _0x3161c8
    } = _0xcb7e64;
    var _0x3d5e55 = require_installer();
    var _0x577106 = require_cache();
    var _0x352392 = require_updater();
    var _0x26207f = require_converter();
    var _0x139d99 = require_queries();
    var _0x3d9939 = require_binary();
    var {
      getStateDirPath: _0x2e4c97
    } = require_state_dir();
    var {
      writeJsonAtomic: _0x6f1a01
    } = require_atomic_write();
    var _0x477d57 = "repo-intel.json";
    function _0x3430e4(_0x1fc65a) {
      return _0x52c34c.join(_0x2e4c97(_0x1fc65a), _0x477d57);
    }
    async function _0xe736fc(_0x4268c2, _0x1f1894 = {}) {
      const _0x3eefbf = await _0x3d5e55.checkInstalled();
      if (!_0x3eefbf.found) {
        return {
          success: false,
          error: "agent-analyzer binary unavailable: " + (_0x3eefbf.error || "unknown error"),
          installSuggestion: _0x3d5e55.getInstallInstructions()
        };
      }
      const _0x36d25a = _0x577106.load(_0x4268c2);
      if (_0x36d25a && !_0x1f1894.force) {
        return {
          success: false,
          error: "Repo map already exists. Use --force to rebuild or update to refresh.",
          existing: _0x577106.getStatus(_0x4268c2)
        };
      }
      const _0xc95020 = Date.now();
      let _0x591c07;
      try {
        _0x591c07 = await _0x3d9939.runAnalyzerAsync(["repo-intel", "init", _0x4268c2]);
      } catch (_0x5aa33e) {
        return {
          success: false,
          error: "agent-analyzer repo-intel init failed: " + _0x5aa33e.message
        };
      }
      let _0x42da65;
      try {
        _0x42da65 = JSON.parse(_0x591c07);
      } catch (_0x165629) {
        return {
          success: false,
          error: "Failed to parse repo-intel output: " + _0x165629.message
        };
      }
      const _0x5a7f28 = _0x3430e4(_0x4268c2);
      try {
        _0x6f1a01(_0x5a7f28, _0x42da65);
      } catch {}
      const _0x52368b = _0x26207f.convertIntelToRepoMap(_0x42da65);
      _0x52368b.stats.scanDurationMs = Date.now() - _0xc95020;
      _0x577106.save(_0x4268c2, _0x52368b);
      return {
        success: true,
        map: _0x52368b,
        summary: {
          files: Object.keys(_0x52368b.files).length,
          symbols: _0x52368b.stats.totalSymbols,
          languages: _0x52368b.project.languages,
          duration: _0x52368b.stats.scanDurationMs
        }
      };
    }
    async function _0x589d85(_0x2be032, _0x1c43ac = {}) {
      const _0x4e068b = await _0x3d5e55.checkInstalled();
      if (!_0x4e068b.found) {
        return {
          success: false,
          error: "agent-analyzer binary unavailable: " + (_0x4e068b.error || "unknown error"),
          installSuggestion: _0x3d5e55.getInstallInstructions()
        };
      }
      if (!_0x577106.exists(_0x2be032)) {
        return {
          success: false,
          error: "No repo map found. Run init first."
        };
      }
      if (_0x1c43ac.full) {
        return _0xe736fc(_0x2be032, {
          force: true
        });
      }
      const _0x529faf = _0x3430e4(_0x2be032);
      if (!_0x1a2561.existsSync(_0x529faf)) {
        return _0xe736fc(_0x2be032, {
          force: true
        });
      }
      const _0x499765 = Date.now();
      let _0x52bed9;
      try {
        _0x52bed9 = await _0x3d9939.runAnalyzerAsync(["repo-intel", "update", "--map-file", _0x529faf, _0x2be032]);
      } catch (_0x1f6f0e) {
        return {
          success: false,
          error: "agent-analyzer repo-intel update failed: " + _0x1f6f0e.message
        };
      }
      let _0x147e93;
      try {
        _0x147e93 = JSON.parse(_0x52bed9);
      } catch (_0x52a166) {
        return {
          success: false,
          error: "Failed to parse repo-intel update output: " + _0x52a166.message
        };
      }
      try {
        _0x6f1a01(_0x529faf, _0x147e93);
      } catch {}
      const _0x5ba47b = _0x26207f.convertIntelToRepoMap(_0x147e93);
      _0x5ba47b.stats.scanDurationMs = Date.now() - _0x499765;
      _0x577106.save(_0x2be032, _0x5ba47b);
      return {
        success: true,
        map: _0x5ba47b,
        summary: {
          files: Object.keys(_0x5ba47b.files).length,
          symbols: _0x5ba47b.stats.totalSymbols,
          duration: _0x5ba47b.stats.scanDurationMs
        }
      };
    }
    function _0x3372ff(_0xa33760) {
      const _0x193696 = _0x577106.load(_0xa33760);
      if (!_0x193696) {
        return {
          exists: false
        };
      }
      const _0xda9109 = _0x352392.checkStaleness(_0xa33760, _0x193696);
      let _0x939288;
      try {
        _0x939288 = _0x3161c8("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
          cwd: _0xa33760,
          encoding: "utf8"
        }).trim();
      } catch {}
      return {
        exists: true,
        status: {
          generated: _0x193696.generated,
          updated: _0x193696.updated,
          commit: _0x193696.git?.commit,
          branch: _0x939288,
          files: Object.keys(_0x193696.files).length,
          symbols: _0x193696.stats?.totalSymbols || 0,
          languages: _0x193696.project?.languages || [],
          staleness: _0xda9109
        }
      };
    }
    function _0x59494b(_0x54ffa5) {
      return _0x577106.load(_0x54ffa5);
    }
    function _0x19f2c3(_0x5eaf67) {
      return _0x577106.exists(_0x5eaf67);
    }
    function _0x3d7d63(_0x1b4b5c) {
      const _0x585e98 = _0x3430e4(_0x1b4b5c);
      if (!_0x1a2561.existsSync(_0x585e98)) {
        return null;
      }
      try {
        return JSON.parse(_0x1a2561.readFileSync(_0x585e98, "utf8"));
      } catch {
        return null;
      }
    }
    async function _0x46052a(_0x215bf2, _0xf5c100) {
      const _0x4d0398 = await _0x3d9939.ensureBinary();
      return new Promise((_0x3c7346, _0x3b4955) => {
        const _0xc44ba3 = _0xcb7e64.spawn(_0x4d0398, _0x215bf2, {
          stdio: ["pipe", "pipe", "pipe"],
          windowsHide: true
        });
        let _0x7b3f1d = "";
        let _0x19e141 = "";
        _0xc44ba3.stdout.on("data", _0x594bf1 => {
          _0x7b3f1d += _0x594bf1.toString("utf8");
        });
        _0xc44ba3.stderr.on("data", _0x13bf97 => {
          _0x19e141 += _0x13bf97.toString("utf8");
        });
        _0xc44ba3.on("error", _0x3b4955);
        _0xc44ba3.on("close", _0x5e72a7 => {
          if (_0x5e72a7 === 0) {
            const _0x5e4be3 = {
              stdout: _0x7b3f1d,
              stderr: _0x19e141
            };
            _0x3c7346(_0x5e4be3);
          } else {
            _0x3b4955(new Error("agent-analyzer " + _0x215bf2.join(" ") + " exited " + _0x5e72a7 + ": " + (_0x19e141.trim() || _0x7b3f1d.trim())));
          }
        });
        _0xc44ba3.stdin.write(_0xf5c100);
        _0xc44ba3.stdin.end();
      });
    }
    async function _0x177c1d(_0x300bbf, _0x37a653) {
      if (!_0x37a653 || typeof _0x37a653 !== "object") {
        throw new Error("applyDescriptors requires an object {path: descriptor}");
      }
      const _0x275337 = _0x3430e4(_0x300bbf);
      if (!_0x1a2561.existsSync(_0x275337)) {
        throw new Error("No repo-intel artifact for " + _0x300bbf + "; run init first.");
      }
      await _0x46052a(["repo-intel", "set-descriptors", "--map-file", _0x275337, "--input", "-"], JSON.stringify(_0x37a653));
    }
    async function _0x16345f(_0x255934, _0x49871e) {
      if (!_0x49871e || !_0x49871e.depth1 || !_0x49871e.depth3 || !_0x49871e.depth10) {
        throw new Error("applySummary requires {depth1, depth3, depth10, inputHash}");
      }
      const _0x43bc4d = _0x3430e4(_0x255934);
      if (!_0x1a2561.existsSync(_0x43bc4d)) {
        throw new Error("No repo-intel artifact for " + _0x255934 + "; run init first.");
      }
      await _0x46052a(["repo-intel", "set-summary", "--map-file", _0x43bc4d, "--input", "-"], JSON.stringify(_0x49871e));
    }
    async function _0x19f787() {
      return _0x3d5e55.checkInstalled();
    }
    function _0x36bd42() {
      return _0x3d5e55.getInstallInstructions();
    }
    const _0x1f2bc0 = {
      init: _0xe736fc,
      update: _0x589d85,
      status: _0x3372ff,
      load: _0x59494b,
      loadRaw: _0x3d7d63,
      exists: _0x19f2c3,
      applyDescriptors: _0x177c1d,
      applySummary: _0x16345f,
      checkAstGrepInstalled: _0x19f787,
      getInstallInstructions: _0x36bd42,
      queries: _0x139d99,
      installer: _0x3d5e55,
      cache: _0x577106,
      updater: _0x352392,
      converter: _0x26207f
    };
    _0x29a55c.exports = _0x1f2bc0;
    Object.defineProperty(_0x29a55c.exports, "embed", {
      enumerable: true,
      get() {
        return require_embed();
      }
    });
  }
});
var require_repo_map = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-map/index.js"(_0x28444a, _0x1c2872) {
    'use strict';

    var _0x3ad307 = require_repo_intel();
    const _0x2c3e66 = {
      init: _0x3ad307.init,
      update: _0x3ad307.update,
      status: _0x3ad307.status,
      load: _0x3ad307.load,
      exists: _0x3ad307.exists,
      checkAstGrepInstalled: _0x3ad307.checkAstGrepInstalled,
      getInstallInstructions: _0x3ad307.getInstallInstructions,
      installer: _0x3ad307.installer,
      cache: _0x3ad307.cache,
      updater: _0x3ad307.updater
    };
    _0x1c2872.exports = _0x2c3e66;
  }
});
var require_docs_patterns = __commonJS({
  "../work/agent-sh__agentsys/lib/collectors/docs-patterns.js"(_0x16b5ec, _0xe85eaa) {
    'use strict';

    var _0x1214d3 = require("fs");
    var _0x5ab1ba = require("path");
    var {
      execFileSync: _0x1dfc19
    } = require("child_process");
    var _0x1eefa6 = null;
    var _0x4da43f = null;
    function _0x1b9f57() {
      if (!_0x1eefa6 && !_0x4da43f) {
        try {
          _0x1eefa6 = require_repo_map();
        } catch (_0x1e583d) {
          _0x4da43f = _0x1e583d.message || "Failed to load repo-map module";
          _0x1eefa6 = null;
        }
      }
      return _0x1eefa6;
    }
    function _0x26ed35() {
      return _0x4da43f;
    }
    var _0x58ce30 = {
      cwd: process.cwd()
    };
    var _0xa8265a = 5;
    var _0xb6ce20 = 200;
    var _0x2d8d26 = ["internal", "private", "utils", "helpers", "__tests__", "test", "tests"];
    var _0x2c8b1 = ["index", "main", "app", "server", "cli", "bin"];
    var _0x579e5a = [/export\s+(?:function|class|const|let|var)\s+(\w+)/g, /export\s+\{([^}]+)\}/g, /module\.exports\s*=\s*\{([^}]+)\}/];
    function _0x2226b8(_0x3b1ebb) {
      return _0x3b1ebb.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    function _0x1f7e30(_0x4eec52, _0x406c7a) {
      if (_0x4eec52.startsWith("_")) {
        return true;
      }
      const _0x1e444b = _0x406c7a.toLowerCase();
      for (const _0x1fa7f3 of _0x2d8d26) {
        if (_0x1e444b.includes("/" + _0x1fa7f3 + "/") || _0x1e444b.includes("\\" + _0x1fa7f3 + "\\")) {
          return true;
        }
      }
      if (/\.(test|spec)\.[jt]sx?$/.test(_0x406c7a)) {
        return true;
      }
      return false;
    }
    function _0x279dc1(_0x3687da) {
      const _0x3dd55d = _0x5ab1ba.basename(_0x3687da);
      const _0x4c7498 = _0x3dd55d.replace(/\.[^.]+$/, "").toLowerCase();
      return _0x2c8b1.includes(_0x4c7498);
    }
    async function _0x50d4d6(_0x3b12d6 = {}) {
      const {
        cwd = process.cwd(),
        askUser: _0x5ede66
      } = _0x3b12d6;
      const _0xbb1624 = _0x1b9f57();
      if (!_0xbb1624) {
        return {
          available: false,
          map: null,
          fallbackReason: "repo-map-module-not-found"
        };
      }
      if (_0xbb1624.exists(cwd)) {
        const _0x4525ea = _0xbb1624.load(cwd);
        const _0x255d9c = {
          available: true,
          map: _0x4525ea,
          fallbackReason: null
        };
        return _0x255d9c;
      }
      const _0xd00195 = await _0xbb1624.checkAstGrepInstalled();
      if (!_0xd00195.found) {
        if (_0x5ede66) {
          const _0x392906 = await _0x5ede66({
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
          if (_0x392906 && _0x392906.includes("Yes")) {
            const _0x10a55b = _0xbb1624.getInstallInstructions();
            const _0x1bbacc = {
              available: false,
              map: null,
              fallbackReason: "ast-grep-install-pending",
              installInstructions: _0x10a55b
            };
            return _0x1bbacc;
          }
        }
        return {
          available: false,
          map: null,
          fallbackReason: "ast-grep-not-installed"
        };
      }
      try {
        const _0x4a57aa = await _0xbb1624.init(cwd, {
          force: false
        });
        if (_0x4a57aa.success) {
          const _0x1a7d1e = {
            available: true,
            map: _0x4a57aa.map,
            fallbackReason: null
          };
          return _0x1a7d1e;
        }
        if (_0x4a57aa.error && _0x4a57aa.error.includes("already exists")) {
          const _0x226c20 = _0xbb1624.load(cwd);
          const _0x1c6c9e = {
            available: true,
            map: _0x226c20,
            fallbackReason: null
          };
          return _0x1c6c9e;
        }
        const _0x144e3c = {
          available: false,
          map: null,
          fallbackReason: _0x4a57aa.error || "init-failed"
        };
        return _0x144e3c;
      } catch (_0xa0939) {
        const _0x591256 = {
          available: false,
          map: null,
          fallbackReason: _0xa0939.message || "init-error"
        };
        return _0x591256;
      }
    }
    function _0x179556(_0x105c2f = {}) {
      const {
        cwd = process.cwd()
      } = _0x105c2f;
      const _0x5287d2 = _0x1b9f57();
      if (!_0x5287d2) {
        return {
          available: false,
          map: null,
          fallbackReason: "repo-map-module-not-found"
        };
      }
      if (_0x5287d2.exists(cwd)) {
        const _0x523f65 = _0x5287d2.load(cwd);
        const _0x2be6b9 = {
          available: true,
          map: _0x523f65,
          fallbackReason: null
        };
        return _0x2be6b9;
      }
      return {
        available: false,
        map: null,
        fallbackReason: "repo-map-not-initialized"
      };
    }
    function _0xcfd54e(_0x13a1f2, _0x528174) {
      if (!_0x528174 || !_0x528174.files) {
        return null;
      }
      const _0x23ce3c = _0x13a1f2.replace(/\\/g, "/");
      let _0x3b7ba7 = _0x528174.files[_0x23ce3c];
      if (!_0x3b7ba7 && _0x23ce3c.startsWith("./")) {
        _0x3b7ba7 = _0x528174.files[_0x23ce3c.slice(2)];
      }
      if (!_0x3b7ba7 && !_0x23ce3c.startsWith("./")) {
        _0x3b7ba7 = _0x528174.files["./" + _0x23ce3c];
      }
      if (!_0x3b7ba7 || !_0x3b7ba7.symbols || !_0x3b7ba7.symbols.exports) {
        return null;
      }
      return _0x3b7ba7.symbols.exports.map(_0x4a5322 => _0x4a5322.name);
    }
    function _0x53769b(_0x44469c, _0x3526e7 = {}) {
      const _0x1b36c7 = {
        ..._0x58ce30,
        ..._0x3526e7
      };
      const _0x10543d = _0x1b36c7;
      const _0x1ae902 = _0x10543d.repoMapStatus || _0x179556(_0x10543d);
      if (!_0x1ae902.available || !_0x1ae902.map) {
        return [];
      }
      const _0x657623 = _0x1ae902.map;
      const _0x3952b7 = _0x32d645(_0x10543d.cwd);
      let _0x186158 = "";
      for (const _0x552fa1 of _0x3952b7) {
        try {
          _0x186158 += _0x1214d3.readFileSync(_0x5ab1ba.join(_0x10543d.cwd, _0x552fa1), "utf8") + "\n";
        } catch {}
      }
      const _0x2927cb = [];
      for (const _0x1cff22 of _0x44469c) {
        const _0x518bcf = _0x1cff22.replace(/\\/g, "/");
        const _0x3347b3 = _0x657623.files[_0x518bcf] || _0x657623.files[_0x518bcf.replace(/^\.\//, "")];
        if (!_0x3347b3 || !_0x3347b3.symbols || !_0x3347b3.symbols.exports) {
          continue;
        }
        for (const _0x54a586 of _0x3347b3.symbols.exports) {
          if (_0x1f7e30(_0x54a586.name, _0x518bcf)) {
            continue;
          }
          if (_0x279dc1(_0x518bcf)) {
            continue;
          }
          const _0x331b83 = new RegExp("\\b" + _0x2226b8(_0x54a586.name) + "\\b");
          if (!_0x331b83.test(_0x186158)) {
            const _0x53c2f7 = {
              type: "undocumented-export",
              severity: "low",
              file: _0x518bcf,
              name: _0x54a586.name,
              line: _0x54a586.line || 0,
              kind: _0x54a586.kind || "export",
              certainty: "MEDIUM",
              suggestion: "Export '" + _0x54a586.name + "' in " + _0x518bcf + " is not mentioned in any documentation"
            };
            _0x2927cb.push(_0x53c2f7);
          }
        }
      }
      return _0x2927cb;
    }
    function _0x44f5d3(_0x388df3, _0x565fc8 = {}) {
      const _0x65f8eb = {
        ..._0x58ce30,
        ..._0x565fc8
      };
      const _0xe11560 = _0x65f8eb;
      const _0x3f535b = _0xe11560.cwd;
      const _0x134095 = [];
      const _0x5828a6 = _0x32d645(_0x3f535b);
      for (const _0x412722 of _0x388df3) {
        const _0x507f29 = _0x5ab1ba.basename(_0x412722).replace(/\.[^.]+$/, "");
        const _0x412f68 = _0x412722.replace(/\.[^.]+$/, "");
        const _0x2c4554 = _0x5ab1ba.dirname(_0x412722);
        for (const _0x738165 of _0x5828a6) {
          let _0x4aec2b;
          try {
            _0x4aec2b = _0x1214d3.readFileSync(_0x5ab1ba.join(_0x3f535b, _0x738165), "utf8");
          } catch {
            continue;
          }
          const _0x4b5230 = [];
          if (_0x4aec2b.includes(_0x507f29)) {
            _0x4b5230.push("filename");
          }
          if (_0x4aec2b.includes(_0x412722)) {
            _0x4b5230.push("full-path");
          }
          if (_0x4aec2b.includes("from '" + _0x412f68 + "'") || _0x4aec2b.includes("from \"" + _0x412f68 + "\"")) {
            _0x4b5230.push("import");
          }
          if (_0x4aec2b.includes("require('" + _0x412f68 + "')") || _0x4aec2b.includes("require(\"" + _0x412f68 + "\")")) {
            _0x4b5230.push("require");
          }
          if (_0x4aec2b.includes("/" + _0x507f29) || _0x4aec2b.includes("/" + _0x507f29 + ".")) {
            _0x4b5230.push("url-path");
          }
          if (_0x4b5230.length > 0) {
            const _0x9e625b = {
              doc: _0x738165,
              referencedFile: _0x412722,
              referenceTypes: _0x4b5230
            };
            _0x134095.push(_0x9e625b);
          }
        }
      }
      return _0x134095;
    }
    function _0x32d645(_0x19457c) {
      const _0x2447ca = [];
      const _0x2bead1 = ["node_modules", "dist", "build", ".git", "coverage", "vendor"];
      function _0x120fc9(_0x2a4780, _0x1da2f4 = 0) {
        if (_0x1da2f4 > _0xa8265a || _0x2447ca.length > _0xb6ce20) {
          return;
        }
        try {
          const _0x23a355 = _0x1214d3.readdirSync(_0x2a4780, {
            withFileTypes: true
          });
          for (const _0x29850a of _0x23a355) {
            const _0x1d9d0e = _0x5ab1ba.join(_0x2a4780, _0x29850a.name);
            const _0x1a2023 = _0x5ab1ba.relative(_0x19457c, _0x1d9d0e);
            if (_0x29850a.isDirectory()) {
              if (!_0x2bead1.includes(_0x29850a.name) && !_0x29850a.name.startsWith(".")) {
                _0x120fc9(_0x1d9d0e, _0x1da2f4 + 1);
              }
            } else if (_0x29850a.isFile() && _0x29850a.name.endsWith(".md")) {
              _0x2447ca.push(_0x1a2023);
            }
          }
        } catch {}
      }
      _0x120fc9(_0x19457c);
      return _0x2447ca;
    }
    function _0x397a2b(_0x1105de, _0x3599c3, _0x3f34ca = {}) {
      const _0x1d15ee = {
        ..._0x58ce30,
        ..._0x3f34ca
      };
      const _0x71cb7a = _0x1d15ee;
      const _0x3dbe2c = _0x71cb7a.cwd;
      const _0x117df3 = [];
      let _0x5c16d3;
      try {
        _0x5c16d3 = _0x1214d3.readFileSync(_0x5ab1ba.join(_0x3dbe2c, _0x1105de), "utf8");
      } catch {
        return _0x117df3;
      }
      const _0x4754ea = _0x5c16d3.split("\n");
      const _0xbce88c = /```[\s\S]*?```/g;
      const _0x4e02e0 = _0x5c16d3.match(_0xbce88c) || [];
      for (const _0x1d6459 of _0x4e02e0) {
        const _0xb621c2 = /import .* from ['"]([^'"]+)['"]/g;
        let _0x16136a;
        while ((_0x16136a = _0xb621c2.exec(_0x1d6459)) !== null) {
          const _0x126854 = _0x16136a[1];
          const _0x27dd8a = _0x3599c3.replace(/\.[^.]+$/, "");
          if (_0x126854.includes(_0x5ab1ba.basename(_0x27dd8a))) {
            _0x117df3.push({
              type: "code-example",
              severity: "medium",
              line: _0x5759f8(_0x5c16d3, _0x16136a[0]),
              current: _0x16136a[0],
              suggestion: "Verify import path is still valid"
            });
          }
        }
      }
      const _0x327750 = _0x179556(_0x71cb7a);
      let _0x13f55a;
      let _0x3ffefe;
      let _0x1da347 = false;
      if (_0x327750.available && _0x327750.map) {
        const _0x4033cd = _0xcfd54e(_0x3599c3, _0x327750.map);
        if (_0x4033cd) {
          _0x3ffefe = _0x4033cd;
          _0x13f55a = _0xe04005(_0x3599c3, "HEAD~1", _0x71cb7a);
          _0x1da347 = true;
        }
      }
      if (!_0x1da347) {
        _0x13f55a = _0xe04005(_0x3599c3, "HEAD~1", _0x71cb7a);
        _0x3ffefe = _0xe04005(_0x3599c3, "HEAD", _0x71cb7a);
      }
      const _0x241326 = _0x13f55a.filter(_0x2bc0fd => !_0x3ffefe.includes(_0x2bc0fd));
      for (const _0x44d460 of _0x241326) {
        if (_0x5c16d3.includes(_0x44d460)) {
          const _0x1c4b96 = {
            type: "removed-export",
            severity: "high",
            reference: _0x44d460,
            suggestion: "'" + _0x44d460 + "' was removed or renamed",
            detectionMethod: _0x1da347 ? "repo-map" : "regex"
          };
          _0x117df3.push(_0x1c4b96);
        }
      }
      try {
        const _0x23dfde = _0x1214d3.readFileSync(_0x5ab1ba.join(_0x3dbe2c, "package.json"), "utf8");
        const _0xdb5137 = JSON.parse(_0x23dfde);
        const _0x24c1cd = _0xdb5137.version;
        const _0xe34e5d = _0x5c16d3.matchAll(/version[:\s]+['"]?(\d+\.\d+\.\d+)/gi);
        for (const _0x5174ec of _0xe34e5d) {
          const _0x5f24aa = _0x5174ec[1];
          if (_0x5f24aa !== _0x24c1cd && _0x4a7db2(_0x5f24aa, _0x24c1cd) < 0) {
            _0x117df3.push({
              type: "outdated-version",
              severity: "low",
              line: _0x5759f8(_0x5c16d3, _0x5174ec[0]),
              current: _0x5f24aa,
              expected: _0x24c1cd,
              suggestion: "Update version from " + _0x5f24aa + " to " + _0x24c1cd
            });
          }
        }
      } catch {}
      return _0x117df3;
    }
    function _0x5759f8(_0x36ab32, _0x1bca68) {
      const _0x2833de = _0x36ab32.indexOf(_0x1bca68);
      if (_0x2833de === -1) {
        return 0;
      }
      return _0x36ab32.substring(0, _0x2833de).split("\n").length;
    }
    function _0x574f18(_0x12e9e7) {
      if (typeof _0x12e9e7 !== "string" || !_0x12e9e7) {
        return false;
      }
      return /^[a-zA-Z0-9_./-]+(?:[~^][0-9]+)?$/.test(_0x12e9e7);
    }
    function _0xe04005(_0x3aceaa, _0x55b5f4, _0x4a8904 = {}) {
      const _0x5eef71 = {
        ..._0x58ce30,
        ..._0x4a8904
      };
      const _0x540026 = _0x5eef71;
      if (!_0x574f18(_0x55b5f4)) {
        return [];
      }
      try {
        const _0x2334af = _0x1dfc19("git", ["show", _0x55b5f4 + ":" + _0x3aceaa], {
          cwd: _0x540026.cwd,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"]
        });
        const _0x265181 = [];
        for (const _0x4a54f4 of _0x579e5a) {
          const _0x55cec3 = new RegExp(_0x4a54f4.source, _0x4a54f4.flags);
          let _0x5ddb45;
          while ((_0x5ddb45 = _0x55cec3.exec(_0x2334af)) !== null) {
            if (_0x5ddb45[1].includes(",")) {
              const _0x5b8a12 = _0x5ddb45[1].split(",").map(_0x30b23e => _0x30b23e.trim().split(/\s+as\s+/)[0].trim());
              _0x265181.push(..._0x5b8a12.filter(_0x2e6ad9 => _0x2e6ad9 && /^\w+$/.test(_0x2e6ad9)));
            } else {
              _0x265181.push(_0x5ddb45[1]);
            }
          }
        }
        return [...new Set(_0x265181)];
      } catch {
        return [];
      }
    }
    function _0x4a7db2(_0x3e505f, _0x11c05f) {
      const _0x1ff2ee = _0x3e505f.split(".").map(Number);
      const _0x3ae983 = _0x11c05f.split(".").map(Number);
      for (let _0x40afca = 0; _0x40afca < 3; _0x40afca++) {
        const _0x45ba87 = _0x1ff2ee[_0x40afca] || 0;
        const _0x3fbf6b = _0x3ae983[_0x40afca] || 0;
        if (_0x45ba87 < _0x3fbf6b) {
          return -1;
        }
        if (_0x45ba87 > _0x3fbf6b) {
          return 1;
        }
      }
      return 0;
    }
    function _0xb81e6a(_0x3534ba, _0x56eb65 = {}) {
      const _0x50f406 = {
        ..._0x58ce30,
        ..._0x56eb65
      };
      const _0x37f70e = _0x50f406;
      const _0x4a04d4 = _0x37f70e.cwd;
      const _0x4f1cd2 = _0x5ab1ba.join(_0x4a04d4, "CHANGELOG.md");
      if (!_0x1214d3.existsSync(_0x4f1cd2)) {
        return {
          exists: false
        };
      }
      let _0x4b1728;
      try {
        _0x4b1728 = _0x1214d3.readFileSync(_0x4f1cd2, "utf8");
      } catch {
        return {
          exists: false,
          error: "Could not read CHANGELOG.md"
        };
      }
      const _0x3b7c4b = _0x4b1728.includes("## [Unreleased]");
      let _0x480b7e = [];
      try {
        const _0x1732c4 = _0x1dfc19("git", ["log", "--oneline", "-10", "HEAD"], {
          cwd: _0x4a04d4,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"]
        });
        _0x480b7e = _0x1732c4.trim().split("\n");
      } catch {}
      const _0x4cabf2 = [];
      const _0x3caf8d = [];
      for (const _0xcc2d48 of _0x480b7e) {
        if (!_0xcc2d48) {
          continue;
        }
        const _0x155940 = _0xcc2d48.substring(8);
        if (_0x4b1728.includes(_0x155940) || _0x4b1728.includes(_0xcc2d48.substring(0, 7))) {
          _0x4cabf2.push(_0x155940);
        } else if (_0x155940.match(/^(feat|fix|breaking)/i)) {
          _0x3caf8d.push(_0x155940);
        }
      }
      return {
        exists: true,
        hasUnreleased: _0x3b7c4b,
        documented: _0x4cabf2,
        undocumented: _0x3caf8d,
        suggestion: _0x3caf8d.length > 0 ? _0x3caf8d.length + " commits may need CHANGELOG entries" : null
      };
    }
    function _0x311cf3(_0x2244e4 = {}) {
      const _0xad6cdc = {
        ..._0x58ce30,
        ..._0x2244e4
      };
      const _0x4ff57a = _0xad6cdc;
      const _0x34b72d = _0x4ff57a.changedFiles || [];
      const _0x13bcc7 = _0x179556(_0x4ff57a);
      return {
        relatedDocs: _0x44f5d3(_0x34b72d, _0x4ff57a),
        changelog: _0xb81e6a(_0x34b72d, _0x4ff57a),
        markdownFiles: _0x32d645(_0x4ff57a.cwd),
        repoMap: {
          available: _0x13bcc7.available,
          fallbackReason: _0x13bcc7.fallbackReason,
          stats: _0x13bcc7.map ? {
            files: Object.keys(_0x13bcc7.map.files || {}).length,
            symbols: _0x13bcc7.map.stats?.totalSymbols || 0
          } : null
        },
        undocumentedExports: _0x13bcc7.available ? _0x53769b(_0x34b72d, {
          ..._0x4ff57a,
          repoMapStatus: _0x13bcc7
        }) : []
      };
    }
    const _0xeea895 = {
      DEFAULT_OPTIONS: _0x58ce30,
      findRelatedDocs: _0x44f5d3,
      findMarkdownFiles: _0x32d645,
      analyzeDocIssues: _0x397a2b,
      checkChangelog: _0xb81e6a,
      getExportsFromGit: _0xe04005,
      compareVersions: _0x4a7db2,
      findLineNumber: _0x5759f8,
      collect: _0x311cf3,
      ensureRepoMap: _0x50d4d6,
      ensureRepoMapSync: _0x179556,
      getExportsFromRepoMap: _0xcfd54e,
      findUndocumentedExports: _0x53769b,
      isInternalExport: _0x1f7e30,
      isEntryPoint: _0x279dc1,
      escapeRegex: _0x2226b8,
      getRepoMapLoadError: _0x26ed35
    };
    _0xe85eaa.exports = _0xeea895;
  }
});
var require_git = __commonJS({
  "../work/agent-sh__agentsys/lib/collectors/git.js"(_0x39a5f1, _0x34069a) {
    'use strict';

    var _0x4f9601 = require_binary();
    var _0x33a60b = {
      top: 20,
      adjustForAi: false,
      cwd: process.cwd()
    };
    function _0x40ed51(_0x4d0b56 = {}) {
      const _0x3ac534 = {
        ..._0x33a60b,
        ..._0x4d0b56
      };
      const _0xbb4344 = _0x3ac534;
      const _0xb1e147 = _0xbb4344.cwd || process.cwd();
      try {
        _0x4f9601.ensureBinarySync();
      } catch (_0x5c2885) {
        const _0x4b972d = {
          available: false,
          error: "Binary not available: " + _0x5c2885.message
        };
        return _0x4b972d;
      }
      let _0x3f0601;
      try {
        const _0x5357b8 = _0x4f9601.runAnalyzer(["repo-intel", "init", _0xb1e147]);
        _0x3f0601 = JSON.parse(_0x5357b8);
      } catch (_0x1485a6) {
        const _0x456d27 = {
          available: false,
          error: "Git analysis failed: " + _0x1485a6.message
        };
        return _0x456d27;
      }
      const _0x3ff7c5 = _0x3f0601.fileActivity || {};
      const _0x4eaa93 = _0x3f0601.contributors || {};
      const _0x364408 = _0x3f0601.aiAttribution || {};
      const _0x5c4fa8 = _0x3f0601.conventions || {};
      const _0x1aca02 = _0x3f0601.releases || {};
      const _0x317884 = Object.entries(_0x3ff7c5).map(([_0x2677b8, _0x4298f2]) => ({
        path: _0x2677b8,
        changes: _0x4298f2.totalChanges || 0,
        recentChanges: _0x4298f2.recentChanges || 0,
        authors: _0x4298f2.authors ? Object.keys(_0x4298f2.authors).length : 0,
        lastChanged: _0x4298f2.lastChanged || null
      })).sort((_0x4794c8, _0x210304) => _0x210304.changes - _0x4794c8.changes).slice(0, _0xbb4344.top);
      const _0x142924 = _0x4eaa93.humans || {};
      const _0x5e02b6 = Object.entries(_0x142924).map(([_0x1d42c0, _0x4cdb01]) => ({
        name: _0x1d42c0,
        commits: _0x4cdb01.commitCount || 0,
        firstSeen: _0x4cdb01.firstSeen || null,
        lastSeen: _0x4cdb01.lastSeen || null
      })).sort((_0x115da1, _0x459df1) => _0x459df1.commits - _0x115da1.commits);
      const _0x3ee93f = _0x5e02b6.reduce((_0x2845f9, _0x7f8c12) => _0x2845f9 + _0x7f8c12.commits, 0);
      let _0x564c52 = 0;
      let _0x19a4fd = 0;
      for (const _0x5f4192 of _0x5e02b6) {
        _0x564c52 += _0x5f4192.commits;
        _0x19a4fd++;
        if (_0x564c52 >= _0x3ee93f * 0.8) {
          break;
        }
      }
      const _0x2b9af7 = (_0x364408.attributed || 0) + (_0x364408.heuristic || 0);
      const _0x5a83aa = _0x3f0601.git?.totalCommitsAnalyzed || _0x3ee93f;
      const _0x4025a6 = _0x5a83aa > 0 ? _0x2b9af7 / _0x5a83aa : 0;
      const _0x29f950 = {
        style: _0x5c4fa8.style || null,
        prefixes: _0x5c4fa8.prefixes || {},
        usesScopes: _0x5c4fa8.usesScopes || false
      };
      return {
        available: true,
        health: {
          active: _0x5e02b6.length > 0,
          busFactor: _0x19a4fd,
          aiRatio: Math.round(_0x4025a6 * 100) / 100,
          totalCommits: _0x5a83aa,
          totalContributors: _0x5e02b6.length
        },
        hotspots: _0x317884,
        contributors: _0x5e02b6.slice(0, 10),
        aiAttribution: {
          ratio: Math.round(_0x4025a6 * 100) / 100,
          attributed: _0x364408.attributed || 0,
          heuristic: _0x364408.heuristic || 0,
          none: _0x364408.none || 0,
          confidence: _0x364408.confidence || "low",
          tools: _0x364408.tools || {}
        },
        busFactor: _0x19a4fd,
        conventions: _0x29f950,
        releaseInfo: {
          tagCount: _0x1aca02.tags ? _0x1aca02.tags.length : 0,
          lastRelease: _0x1aca02.tags && _0x1aca02.tags.length > 0 ? _0x1aca02.tags[_0x1aca02.tags.length - 1] : null,
          cadence: _0x1aca02.cadence || null
        }
      };
    }
    const _0x30dc08 = {
      collectGitData: _0x40ed51,
      DEFAULT_OPTIONS: _0x33a60b
    };
    _0x34069a.exports = _0x30dc08;
  }
});
var require_analyzer_queries = __commonJS({
  "../work/agent-sh__agentsys/lib/collectors/analyzer-queries.js"(_0x39d2fd, _0x16a625) {
    'use strict';

    var _0xb0177c = require("fs");
    var _0x54a3c6 = require("path");
    var _0x54c0e0 = {
      cwd: process.cwd()
    };
    var _0x2355e4 = [/(^|\/)versioned_docs\//, /(^|\/)versioned_sidebars\//, /(^|\/)tests\/fixtures\//, /(^|\/)__fixtures__\//, /(^|\/)generated\//, /\.generated\.md$/, /(^|\/)CHANGELOG\.md$/i, /(^|\/)node_modules\//, /(^|\/)target\//, /(^|\/)dist\//, /(^|\/)build\//];
    function _0x2f5dea(_0x1021fe) {
      for (const _0x47a27e of [".claude", ".opencode", ".codex"]) {
        if (_0xb0177c.existsSync(_0x54a3c6.join(_0x1021fe, _0x47a27e))) {
          return _0x47a27e;
        }
      }
      return ".claude";
    }
    function _0x531905(_0x6f933e) {
      return _0x54a3c6.join(_0x6f933e, _0x2f5dea(_0x6f933e), "repo-intel.json");
    }
    function _0x164f27() {
      try {
        const {
          binary: _0x3c451d
        } = require("../agentsys").get();
        if (_0x3c451d) {
          return _0x3c451d;
        }
      } catch {}
      try {
        return require_binary();
      } catch {
        return null;
      }
    }
    function _0x5047d7(_0x3d5c90, _0x56b446) {
      try {
        const _0x1f123b = _0x3d5c90.runAnalyzer(_0x56b446);
        return JSON.parse(_0x1f123b);
      } catch {
        return null;
      }
    }
    function _0x38e561(_0x318cde) {
      return (_0x318cde || "").replace(/\\/g, "/");
    }
    function _0x51791f(_0x1957be) {
      if (Array.isArray(_0x1957be)) {
        return _0x1957be;
      } else {
        return [];
      }
    }
    function _0x21a219(_0x20c8a0 = {}) {
      const _0x18e77d = {
        ..._0x54c0e0,
        ..._0x20c8a0
      };
      const _0x472cc9 = _0x18e77d;
      const _0x2a2811 = _0x472cc9.cwd;
      const _0x1b3a61 = _0x531905(_0x2a2811);
      const _0x36cce5 = {
        available: false,
        reason: null,
        queryErrors: [],
        mapFile: _0x1b3a61,
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
      const _0x5f0579 = _0x36cce5;
      const _0xee0647 = _0x164f27();
      if (!_0xee0647) {
        const _0x33e6f1 = {
          ..._0x5f0579
        };
        _0x33e6f1.reason = "analyzer-binary-unavailable";
        return _0x33e6f1;
      }
      if (!_0xb0177c.existsSync(_0x1b3a61)) {
        const _0xfed86b = {
          ..._0x5f0579
        };
        _0xfed86b.reason = "repo-intel-map-missing";
        return _0xfed86b;
      }
      const _0x27b40f = _0x472cc9.staleDocsTop ?? 500;
      const _0x36dbac = _0x472cc9.docDriftTop ?? 50;
      const _0x7956e0 = [];
      const _0x453095 = (_0x1b8527, _0x2596d2) => {
        const _0x2b2421 = _0x5047d7(_0xee0647, _0x2596d2);
        if (_0x2b2421 === null) {
          _0x7956e0.push(_0x1b8527);
        }
        return _0x2b2421;
      };
      const _0x28622f = _0x51791f(_0x453095("stale-docs", ["repo-intel", "query", "stale-docs", "--top", String(_0x27b40f), "--map-file", _0x1b3a61, _0x2a2811]));
      const _0x33758f = _0x51791f(_0x453095("doc-drift", ["repo-intel", "query", "doc-drift", "--top", String(_0x36dbac), "--map-file", _0x1b3a61, _0x2a2811]));
      const _0x550932 = _0x51791f(_0x453095("entry-points", ["repo-intel", "query", "entry-points", "--map-file", _0x1b3a61, _0x2a2811]));
      const _0x56b519 = _0x453095("slop-fixes", ["repo-intel", "query", "slop-fixes", "--map-file", _0x1b3a61, _0x2a2811]);
      const _0x1e85d7 = Array.isArray(_0x56b519) ? _0x56b519 : _0x51791f(_0x56b519?.fixes);
      const _0x24c860 = new Map();
      const _0x22eff7 = new Map();
      for (const _0x6d0942 of _0x28622f) {
        const _0x5f5698 = _0x38e561(_0x6d0942.doc);
        _0x6d0942.doc = _0x5f5698;
        const _0xdc4325 = _0x5f5698 + ":" + _0x6d0942.line + ":" + _0x6d0942.reference;
        _0x24c860.set(_0xdc4325, _0x6d0942);
        if (!_0x22eff7.has(_0x5f5698)) {
          _0x22eff7.set(_0x5f5698, []);
        }
        _0x22eff7.get(_0x5f5698).push(_0x6d0942);
      }
      const _0x3d80a9 = new Set();
      const _0x55f60d = new Set();
      for (const _0x14062c of _0x550932) {
        const _0x1973bf = _0x38e561(_0x14062c.path);
        if (_0x1973bf) {
          _0x3d80a9.add(_0x1973bf);
        }
        if (_0x14062c.name && _0x1973bf) {
          _0x55f60d.add(_0x1973bf + ":" + _0x14062c.name);
        }
      }
      const _0xa669e1 = _0x472cc9.docDriftIgnore || _0x2355e4;
      const _0x4aa1fa = _0x33758f.filter(_0x103911 => {
        const _0x1eea3a = _0x38e561(_0x103911.path);
        return !_0xa669e1.some(_0xfb0d13 => _0xfb0d13.test(_0x1eea3a));
      });
      const _0x17d8e0 = {
        "orphan-export": "orphanExports",
        "passthrough-wrapper": "passthroughWrappers",
        "always-true-condition": "alwaysTrueConditions",
        "commented-out-code": "commentedOutCode",
        "stale-suppression": "staleSuppressions"
      };
      const _0xc98faa = [];
      const _0x565c45 = [];
      const _0x34dc8b = [];
      const _0x5c94eb = [];
      const _0x4cb62f = [];
      const _0x5001a7 = {
        orphanExports: _0xc98faa,
        passthroughWrappers: _0x565c45,
        alwaysTrueConditions: _0x34dc8b,
        commentedOutCode: _0x5c94eb,
        staleSuppressions: _0x4cb62f
      };
      const _0x509844 = _0x5001a7;
      for (const _0x43f0fd of _0x1e85d7) {
        const _0x47dbca = _0x17d8e0[_0x43f0fd.category];
        if (_0x47dbca) {
          _0x509844[_0x47dbca].push(_0x43f0fd);
        }
      }
      const _0x685f6 = _0x7956e0.length < 4;
      const _0x4e9235 = {
        available: _0x685f6,
        reason: _0x685f6 ? null : "all-queries-failed",
        queryErrors: _0x7956e0,
        mapFile: _0x1b3a61,
        staleDocs: _0x28622f,
        staleDocsByKey: _0x24c860,
        staleDocsByDoc: _0x22eff7,
        docDrift: _0x4aa1fa,
        docDriftAll: _0x33758f,
        entryPoints: _0x550932,
        entryPointSet: _0x3d80a9,
        entryPointSymbols: _0x55f60d,
        slopFixes: _0x1e85d7,
        orphanExports: _0xc98faa,
        passthroughWrappers: _0x565c45,
        alwaysTrueConditions: _0x34dc8b,
        commentedOutCode: _0x5c94eb,
        staleSuppressions: _0x4cb62f
      };
      return _0x4e9235;
    }
    function _0x1726cc(_0x4dfbd2, _0x1fd04e, _0x47d16f) {
      if (!_0x4dfbd2?.entryPointSymbols) {
        return false;
      }
      const _0x451038 = _0x38e561(_0x1fd04e);
      return _0x4dfbd2.entryPointSymbols.has(_0x451038 + ":" + _0x47d16f) || _0x4dfbd2.entryPointSet.has(_0x451038);
    }
    const _0x21f715 = {
      DEFAULT_OPTIONS: _0x54c0e0,
      DEFAULT_DOC_DRIFT_IGNORE: _0x2355e4,
      collect: _0x21a219,
      isEntryPointSymbol: _0x1726cc,
      resolveMapFile: _0x531905,
      resolveStateDir: _0x2f5dea
    };
    _0x16a625.exports = _0x21f715;
  }
});
var require_collectors = __commonJS({
  "../work/agent-sh__agentsys/lib/collectors/index.js"(_0x2289b9, _0x180008) {
    'use strict';

    var _0x4a2053 = require_github();
    var _0x3b88af = require_documentation();
    var _0x464501 = require_codebase();
    var _0x1039d3 = require_docs_patterns();
    var _0x5a6cd0 = require_git();
    var _0x244cac = require_analyzer_queries();
    var _0x1d4780 = {
      collectors: ["github", "docs", "code"],
      depth: "thorough",
      cwd: process.cwd()
    };
    function _0x503178(_0x41cc79 = {}) {
      const _0x2232a5 = {
        ..._0x1d4780,
        ..._0x41cc79
      };
      const _0x35aade = _0x2232a5;
      const _0x6d0e57 = Array.isArray(_0x35aade.collectors) ? _0x35aade.collectors : _0x1d4780.collectors;
      const _0x257af9 = {
        timestamp: new Date().toISOString(),
        options: _0x35aade,
        github: null,
        docs: null,
        code: null,
        docsPatterns: null,
        git: null,
        analyzer: null
      };
      if (_0x6d0e57.includes("analyzer")) {
        _0x257af9.analyzer = _0x244cac.collect(_0x35aade);
        _0x35aade.analyzer = _0x257af9.analyzer;
      }
      if (_0x6d0e57.includes("github")) {
        _0x257af9.github = _0x4a2053.scanGitHubState(_0x35aade);
      }
      if (_0x6d0e57.includes("docs")) {
        _0x257af9.docs = _0x3b88af.analyzeDocumentation(_0x35aade);
      }
      if (_0x6d0e57.includes("code")) {
        _0x257af9.code = _0x464501.scanCodebase(_0x35aade);
      }
      if (_0x6d0e57.includes("docs-patterns")) {
        _0x257af9.docsPatterns = _0x1039d3.collect(_0x35aade);
      }
      if (_0x6d0e57.includes("git")) {
        _0x257af9.git = _0x5a6cd0.collectGitData(_0x35aade);
      }
      return _0x257af9;
    }
    function _0x27214b(_0x2598cd = {}) {
      let _0x58433f = ["github", "docs", "code"];
      if (_0x2598cd.sources) {
        _0x58433f = _0x2598cd.sources;
      } else if (_0x2598cd.collectors) {
        _0x58433f = _0x2598cd.collectors;
      }
      const _0x3b8068 = {
        ..._0x2598cd
      };
      _0x3b8068.collectors = _0x58433f;
      return _0x503178(_0x3b8068);
    }
    const _0x84e8d8 = {
      collect: _0x503178,
      collectAllData: _0x27214b,
      github: _0x4a2053,
      documentation: _0x3b88af,
      codebase: _0x464501,
      docsPatterns: _0x1039d3,
      git: _0x5a6cd0,
      analyzerQueries: _0x244cac,
      scanGitHubState: _0x4a2053.scanGitHubState,
      isGhAvailable: _0x4a2053.isGhAvailable,
      analyzeDocumentation: _0x3b88af.analyzeDocumentation,
      scanCodebase: _0x464501.scanCodebase,
      findRelatedDocs: _0x1039d3.findRelatedDocs,
      analyzeDocIssues: _0x1039d3.analyzeDocIssues,
      checkChangelog: _0x1039d3.checkChangelog,
      ensureRepoMap: _0x1039d3.ensureRepoMap,
      ensureRepoMapSync: _0x1039d3.ensureRepoMapSync,
      getExportsFromRepoMap: _0x1039d3.getExportsFromRepoMap,
      findUndocumentedExports: _0x1039d3.findUndocumentedExports,
      isInternalExport: _0x1039d3.isInternalExport,
      isEntryPoint: _0x1039d3.isEntryPoint,
      collectGitData: _0x5a6cd0.collectGitData,
      DEFAULT_OPTIONS: _0x1d4780
    };
    _0x180008.exports = _0x84e8d8;
  }
});
var collectors = require_collectors();
const _0x158627 = {
  sources: ["github", "docs", "code"],
  depth: "thorough",
  issueLimit: collectors.github.DEFAULT_OPTIONS.issueLimit,
  prLimit: collectors.github.DEFAULT_OPTIONS.prLimit,
  timeout: collectors.github.DEFAULT_OPTIONS.timeout
};
var DEFAULT_OPTIONS = _0x158627;
const _0x3c0539 = {
  DEFAULT_OPTIONS: DEFAULT_OPTIONS,
  scanGitHubState: collectors.scanGitHubState,
  analyzeDocumentation: collectors.analyzeDocumentation,
  scanCodebase: collectors.scanCodebase,
  collectAllData: collectors.collectAllData,
  isGhAvailable: collectors.isGhAvailable,
  isPathSafe: collectors.documentation.isPathSafe
};
module.exports = _0x3c0539;