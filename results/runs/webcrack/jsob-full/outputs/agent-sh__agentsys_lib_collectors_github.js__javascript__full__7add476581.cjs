'use strict';

var {
  execFileSync
} = require("child_process");
var DEFAULT_OPTIONS = {
  issueLimit: 100,
  prLimit: 50,
  milestoneLimit: 100,
  timeout: 10000,
  cwd: process.cwd()
};
function execGh(_0x8b3efd, _0x3ec9b2 = {}) {
  const _0x2f9931 = execGhWithResult(_0x8b3efd, _0x3ec9b2);
  if (_0x2f9931.ok) {
    return _0x2f9931.data;
  } else {
    return null;
  }
}
function execGhWithResult(_0x5a08d, _0x282c1c = {}) {
  try {
    const _0x485644 = execFileSync("gh", _0x5a08d, {
      encoding: "utf8",
      stdio: "pipe",
      timeout: _0x282c1c.timeout || DEFAULT_OPTIONS.timeout,
      cwd: _0x282c1c.cwd || DEFAULT_OPTIONS.cwd
    });
    try {
      return {
        ok: true,
        data: JSON.parse(_0x485644)
      };
    } catch (_0x204068) {
      return {
        ok: false,
        error: {
          type: "parse",
          message: "Failed to parse gh output as JSON: " + _0x204068.message,
          raw: _0x485644.slice(0, 500)
        }
      };
    }
  } catch (_0x25fce4) {
    return {
      ok: false,
      error: {
        type: _0x25fce4.killed ? "timeout" : "process",
        message: _0x25fce4.message,
        exitCode: _0x25fce4.status ?? null,
        stderr: _0x25fce4.stderr ? String(_0x25fce4.stderr).trim() : ""
      }
    };
  }
}
function isGhAvailable() {
  try {
    execFileSync("gh", ["auth", "status"], {
      encoding: "utf8",
      stdio: "pipe",
      timeout: 5000
    });
    return true;
  } catch {
    return false;
  }
}
function summarizeIssue(_0x5a057b) {
  return {
    number: _0x5a057b.number,
    title: _0x5a057b.title,
    labels: (_0x5a057b.labels || []).map(_0x61e389 => _0x61e389.name || _0x61e389),
    milestone: _0x5a057b.milestone?.title || _0x5a057b.milestone || null,
    createdAt: _0x5a057b.createdAt,
    updatedAt: _0x5a057b.updatedAt,
    snippet: _0x5a057b.body ? _0x5a057b.body.slice(0, 200).replace(/\n/g, " ").trim() + (_0x5a057b.body.length > 200 ? "..." : "") : ""
  };
}
function summarizePR(_0xbd8a35) {
  return {
    number: _0xbd8a35.number,
    title: _0xbd8a35.title,
    labels: (_0xbd8a35.labels || []).map(_0x17aa8f => _0x17aa8f.name || _0x17aa8f),
    isDraft: _0xbd8a35.isDraft,
    createdAt: _0xbd8a35.createdAt,
    updatedAt: _0xbd8a35.updatedAt,
    files: _0xbd8a35.files || [],
    snippet: _0xbd8a35.body ? _0xbd8a35.body.slice(0, 150).replace(/\n/g, " ").trim() + (_0xbd8a35.body.length > 150 ? "..." : "") : ""
  };
}
function categorizeIssues(_0x1a24d3, _0x24c18d) {
  const _0x223aa1 = {
    bug: "bugs",
    "type: bug": "bugs",
    feature: "features",
    "type: feature": "features",
    enhancement: "enhancements",
    security: "security",
    "type: security": "security"
  };
  const _0x3f6810 = Object.entries(_0x223aa1).map(([_0x56193b, _0x467be4]) => ({
    regex: new RegExp("(^|[^a-z])" + _0x56193b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^a-z]|$)", "i"),
    category: _0x467be4
  }));
  for (const _0x4bed99 of _0x24c18d) {
    const _0xf01574 = (_0x4bed99.labels || []).map(_0x2f1b7d => (_0x2f1b7d.name || _0x2f1b7d).toLowerCase());
    let _0x168279 = false;
    const _0x32aee0 = {
      number: _0x4bed99.number,
      title: _0x4bed99.title
    };
    const _0x378d8f = _0x32aee0;
    for (const {
      regex: _0x212d71,
      category: _0x35e3b9
    } of _0x3f6810) {
      if (_0xf01574.some(_0xa279ef => _0x212d71.test(_0xa279ef))) {
        _0x1a24d3.categorized[_0x35e3b9].push(_0x378d8f);
        _0x168279 = true;
        break;
      }
    }
    if (!_0x168279) {
      _0x1a24d3.categorized.other.push(_0x378d8f);
    }
  }
}
function findStaleItems(_0x252fe1, _0x582812, _0x2e387e) {
  const _0x142cf4 = new Date();
  _0x142cf4.setDate(_0x142cf4.getDate() - _0x2e387e);
  for (const _0x88aa47 of _0x582812) {
    const _0x19ce4a = new Date(_0x88aa47.updatedAt);
    if (_0x19ce4a < _0x142cf4) {
      _0x252fe1.stale.push({
        number: _0x88aa47.number,
        title: _0x88aa47.title,
        lastUpdated: _0x88aa47.updatedAt,
        daysStale: Math.floor((Date.now() - _0x19ce4a) / 86400000)
      });
    }
  }
}
function extractThemes(_0xd843a5, _0x29cac3) {
  const _0x2cba17 = {};
  const _0x57d2f8 = new Set(["the", "a", "an", "is", "are", "to", "for", "in", "on", "at", "with", "and", "or", "of"]);
  for (const _0x5e5bdf of _0x29cac3) {
    const _0x5be1f9 = (_0x5e5bdf.title || "").toLowerCase().split(/\s+/);
    for (const _0x5f5b69 of _0x5be1f9) {
      if (_0x5f5b69.length > 3 && !_0x57d2f8.has(_0x5f5b69)) {
        _0x2cba17[_0x5f5b69] = (_0x2cba17[_0x5f5b69] || 0) + 1;
      }
    }
  }
  _0xd843a5.themes = Object.entries(_0x2cba17).filter(([, _0x4a711c]) => _0x4a711c > 1).sort((_0x2ea1af, _0x21698d) => _0x21698d[1] - _0x2ea1af[1]).slice(0, 10).map(([_0x5e23a4, _0x3a5504]) => ({
    word: _0x5e23a4,
    count: _0x3a5504
  }));
}
function findOverdueMilestones(_0x172262) {
  const _0x598841 = new Date();
  _0x172262.overdueMilestones = _0x172262.milestones.filter(_0x2d3bb2 => {
    if (!_0x2d3bb2.due_on || _0x2d3bb2.state === "closed") {
      return false;
    }
    return new Date(_0x2d3bb2.due_on) < _0x598841;
  });
}
function scanGitHubState(_0x5c85ae = {}) {
  const _0x261478 = {
    ...DEFAULT_OPTIONS,
    ..._0x5c85ae
  };
  const _0x5780bc = _0x261478;
  const _0x2959db = {
    requestedLimit: _0x5780bc.issueLimit,
    fetchedCount: 0,
    hasMore: false
  };
  const _0x5cced1 = {
    requestedLimit: _0x5780bc.prLimit,
    fetchedCount: 0,
    hasMore: false
  };
  const _0x585055 = {
    requestedLimit: _0x5780bc.milestoneLimit,
    fetchedCount: 0,
    hasMore: false
  };
  const _0x574e52 = {
    issues: _0x2959db,
    prs: _0x5cced1,
    milestones: _0x585055
  };
  const _0x21df17 = {
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
    pagination: _0x574e52,
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
  const _0x38c6bb = _0x21df17;
  if (!isGhAvailable()) {
    _0x38c6bb.error = "gh CLI not available or not authenticated";
    return _0x38c6bb;
  }
  _0x38c6bb.available = true;
  const _0x33f309 = execGhWithResult(["issue", "list", "--state", "open", "--json", "number,title,labels,milestone,createdAt,updatedAt,body", "--limit", String(_0x5780bc.issueLimit)], _0x5780bc);
  if (_0x33f309.ok && Array.isArray(_0x33f309.data)) {
    const _0x259a2c = _0x33f309.data;
    _0x38c6bb.issues = _0x259a2c.map(summarizeIssue);
    _0x38c6bb.summary.issueCount = _0x259a2c.length;
    _0x38c6bb.pagination.issues.fetchedCount = _0x259a2c.length;
    _0x38c6bb.pagination.issues.hasMore = _0x5780bc.issueLimit > 0 && _0x259a2c.length >= _0x5780bc.issueLimit;
    categorizeIssues(_0x38c6bb, _0x259a2c);
    findStaleItems(_0x38c6bb, _0x259a2c, 90);
    extractThemes(_0x38c6bb, _0x259a2c);
  } else if (!_0x33f309.ok) {
    const _0x31e554 = {
      source: "issues",
      ..._0x33f309.error
    };
    _0x38c6bb.errors.push(_0x31e554);
  }
  const _0x122064 = execGhWithResult(["pr", "list", "--state", "open", "--json", "number,title,labels,isDraft,createdAt,updatedAt,body,files", "--limit", String(_0x5780bc.prLimit)], _0x5780bc);
  if (_0x122064.ok && Array.isArray(_0x122064.data)) {
    const _0x52a5f8 = _0x122064.data;
    _0x38c6bb.prs = _0x52a5f8.map(summarizePR);
    _0x38c6bb.summary.prCount = _0x52a5f8.length;
    _0x38c6bb.pagination.prs.fetchedCount = _0x52a5f8.length;
    _0x38c6bb.pagination.prs.hasMore = _0x5780bc.prLimit > 0 && _0x52a5f8.length >= _0x5780bc.prLimit;
  } else if (!_0x122064.ok) {
    const _0x44ec3d = {
      source: "prs",
      ..._0x122064.error
    };
    _0x38c6bb.errors.push(_0x44ec3d);
  }
  const _0x306f08 = execGhWithResult(["api", "repos/{owner}/{repo}/milestones", "--paginate", "--slurp"], _0x5780bc);
  if (_0x306f08.ok && Array.isArray(_0x306f08.data)) {
    const _0x356fe4 = _0x306f08.data;
    const _0x598aa7 = _0x356fe4.flatMap(_0x230ca6 => Array.isArray(_0x230ca6) ? _0x230ca6 : []);
    const _0x32f24c = _0x598aa7.map(_0x41f3aa => ({
      title: _0x41f3aa.title,
      state: _0x41f3aa.state,
      due_on: _0x41f3aa.due_on,
      open_issues: _0x41f3aa.open_issues,
      closed_issues: _0x41f3aa.closed_issues
    }));
    _0x38c6bb.pagination.milestones.fetchedCount = _0x32f24c.length;
    _0x38c6bb.pagination.milestones.hasMore = _0x5780bc.milestoneLimit > 0 && _0x32f24c.length > _0x5780bc.milestoneLimit;
    _0x38c6bb.milestones = _0x32f24c.slice(0, _0x5780bc.milestoneLimit);
    _0x38c6bb.summary.milestoneCount = _0x38c6bb.milestones.length;
    findOverdueMilestones(_0x38c6bb);
  } else if (!_0x306f08.ok) {
    const _0x58d350 = {
      source: "milestones",
      ..._0x306f08.error
    };
    _0x38c6bb.errors.push(_0x58d350);
  }
  _0x38c6bb.partial = _0x38c6bb.errors.length > 0;
  if (_0x38c6bb.partial && !_0x38c6bb.error) {
    _0x38c6bb.error = "Partial GitHub data collected";
  }
  return _0x38c6bb;
}
const _0x44729a = {
  DEFAULT_OPTIONS: DEFAULT_OPTIONS,
  scanGitHubState: scanGitHubState,
  isGhAvailable: isGhAvailable,
  execGh: execGh,
  summarizeIssue: summarizeIssue,
  summarizePR: summarizePR,
  categorizeIssues: categorizeIssues,
  findStaleItems: findStaleItems,
  extractThemes: extractThemes,
  findOverdueMilestones: findOverdueMilestones
};
module.exports = _0x44729a;