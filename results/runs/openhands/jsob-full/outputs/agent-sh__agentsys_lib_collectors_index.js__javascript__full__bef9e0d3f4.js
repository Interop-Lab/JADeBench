"use strict";

var __getOwnPropNames = Object.getOwnPropertyNames, __commonJS = (_0xb642d6, _0x52a843) => function() {
    return _0x52a843 || (0, _0xb642d6[(_0x3066f6 = __getOwnPropNames, _0x1ef5ea = _0xb642d6, 
    _0x3066f6(_0x1ef5ea))[0]])((_0x52a843 = {
        exports: {}
    }).exports, _0x52a843), _0x52a843.exports;
    var _0x3066f6, _0x1ef5ea;
}, require_github = __commonJS({
    "../work/agent-sh__agentsys/lib/collectors/github.js"(_0x71aa0e, _0x1b04ce) {
        const _0x3bde77_UkrMn = function(_0x154f7a, _0x5c030c, _0xb0fae) {
            return _0x154f7a(_0x5c030c, _0xb0fae);
        }, _0x3bde77_mRBMg = function(_0x24c9e7, _0x39ff12) {
            return _0x24c9e7 > _0x39ff12;
        }, _0x3bde77_sOBLJ = function(_0x208ea4, _0x263d56) {
            return _0x208ea4 + _0x263d56;
        }, _0x3bde77_drNEu = function(_0x5c3d60, _0x583a10) {
            return _0x5c3d60 + _0x583a10;
        }, _0x3bde77_PFbgZ = function(_0x206894, _0x49aefe) {
            return _0x206894 !== _0x49aefe;
        }, _0x3bde77_NrBVd = function(_0x3d4b93) {
            return _0x3d4b93();
        }, _0x3bde77_CJMrB = function(_0x2a7898, _0xb223f9) {
            return _0x2a7898 === _0xb223f9;
        }, _0x3bde77_astmP = function(_0x2b5621) {
            return _0x2b5621();
        }, _0x3bde77_DlMHJ = function(_0x27741a, _0x3f83f9) {
            return _0x27741a !== _0x3f83f9;
        }, _0x3bde77_MxqYh = function(_0x1139eb, _0x4a2ae5) {
            return _0x1139eb === _0x4a2ae5;
        }, _0x3bde77_pNPCI = function(_0x98fc3a, _0x2de0cc) {
            return _0x98fc3a < _0x2de0cc;
        }, _0x3bde77_dzozC = function(_0x3ea3c7, _0x509e01) {
            return _0x3ea3c7 > _0x509e01;
        }, _0x3bde77_PvsJT = function(_0x37e966, _0x11bbe8, _0x55d645) {
            return _0x37e966(_0x11bbe8, _0x55d645);
        }, _0x3bde77_cibNw = function(_0x35ff6b, _0xd4dbdd) {
            return _0x35ff6b(_0xd4dbdd);
        }, _0x3bde77_lTSIx = function(_0x1dc77f, _0x56f1b2) {
            return _0x1dc77f > _0x56f1b2;
        };
        var {execFileSync: _0x2677dd} = require("child_process"), _0x4c3485 = {
            issueLimit: 100,
            prLimit: 50,
            milestoneLimit: 100,
            timeout: 1e4,
            cwd: process.cwd()
        };
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
                        ok: !0,
                        data: JSON.parse(_0x50f8e2)
                    };
                } catch (_0x17d9fd) {
                    return {
                        ok: !1,
                        error: {
                            type: "parse",
                            message: "Failed to parse gh output as JSON: " + _0x17d9fd.message,
                            raw: _0x50f8e2.slice(0, 500)
                        }
                    };
                }
            } catch (_0x41d59d) {
                return {
                    ok: !1,
                    error: {
                        type: _0x41d59d.killed ? "timeout" : "process",
                        message: _0x41d59d.message,
                        exitCode: _0x41d59d.status ?? null,
                        stderr: _0x41d59d.stderr ? (_0x43598b = String, _0x1e7548 = _0x41d59d.stderr, _0x43598b(_0x1e7548)).trim() : ""
                    }
                };
            }
            var _0x43598b, _0x1e7548;
        }
        function _0x5035da() {
            try {
                return _0x3bde77_PFbgZ("VnGAV", "VnGAV") ? void _0x5010f2(new _0x3cfd22((_0x1a00a5 = _0x36a816, 
                _0x3bde77_sOBLJ("Too many redirects fetching from ", _0x1a00a5)))) : (_0x2677dd("gh", [ "auth", "status" ], {
                    encoding: "utf8",
                    stdio: "pipe",
                    timeout: 5e3
                }), !0);
            } catch {
                return !!_0x3bde77_PFbgZ("QGeZr", "QGeZr") && {
                    success: !1,
                    error: (_0x582b9f = _0x4a7cb8.message, _0x3bde77_drNEu("agent-analyzer repo-intel init failed: ", _0x582b9f))
                };
            }
            var _0x582b9f, _0x1a00a5;
        }
        function _0xaa9f5e(_0x388671) {
            return {
                number: _0x388671.number,
                title: _0x388671.title,
                labels: (_0x388671.labels || []).map((_0x384c17 => _0x384c17.name || _0x384c17)),
                milestone: _0x388671.milestone?.title || _0x388671.milestone || null,
                createdAt: _0x388671.createdAt,
                updatedAt: _0x388671.updatedAt,
                snippet: _0x388671.body ? _0x3bde77_sOBLJ(_0x388671.body.slice(0, 200).replace(/\n/g, " ").trim(), _0x3bde77_mRBMg(_0x388671.body.length, 200) ? "..." : "") : ""
            };
        }
        function _0x290715(_0x28f1ca) {
            if (!_0x3bde77_CJMrB("kWUPb", "UcVMq")) {
                return {
                    number: _0x28f1ca.number,
                    title: _0x28f1ca.title,
                    labels: (_0x28f1ca.labels || []).map((_0x14b540 => _0x14b540.name || _0x14b540)),
                    isDraft: _0x28f1ca.isDraft,
                    createdAt: _0x28f1ca.createdAt,
                    updatedAt: _0x28f1ca.updatedAt,
                    files: _0x28f1ca.files || [],
                    snippet: _0x28f1ca.body ? _0x3bde77_drNEu(_0x28f1ca.body.slice(0, 150).replace(/\n/g, " ").trim(), (_0x4b48d2 = _0x28f1ca.body.length, 
                    _0x4b48d2 > 150 ? "..." : "")) : ""
                };
            }
            var _0x4b48d2;
            {
                const _0x52f364 = _0x3bde77_NrBVd(_0xa7200c);
                if (!_0x58d14c.existsSync(_0x52f364)) {
                    return null;
                }
                try {
                    const _0x35894e = _0x341596.execFileSync(_0x52f364, [ "--version" ], {
                        timeout: 5e3,
                        encoding: "utf8",
                        stdio: [ "pipe", "pipe", "pipe" ],
                        windowsHide: !0
                    }), _0x4e3a00 = _0x35894e.trim().match(/(\d+\.\d+\.\d+)/);
                    return _0x4e3a00 ? _0x4e3a00[1] : _0x35894e.trim();
                } catch (_0x2965e7) {
                    return null;
                }
            }
        }
        function _0x5a9ef5(_0x2111d3, _0x239788) {
            if (_0x3bde77_DlMHJ("Nfcav", "Nfcav")) {
                const _0x397952 = _0x3bde77_astmP(_0x12c9e1);
                if (!_0x3b77ac.existsSync(_0x397952)) {
                    return !1;
                }
                const _0x2d2953 = _0x3bde77_astmP(_0x142140);
                return _0x3bde77_UkrMn(_0x164615, _0x2d2953, _0x4e9a0a);
            }
            {
                const _0x2d714a = {
                    bug: "bugs",
                    "type: bug": "bugs",
                    feature: "features",
                    "type: feature": "features",
                    enhancement: "enhancements",
                    security: "security",
                    "type: security": "security"
                }, _0x46babe = Object.entries(_0x2d714a).map((([_0x42e6dd, _0x137a27]) => ({
                    regex: new RegExp("(^|[^a-z])" + _0x42e6dd.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^a-z]|$)", "i"),
                    category: _0x137a27
                })));
                for (const _0x5767a5 of _0x239788) {
                    if (!_0x3bde77_DlMHJ("cXxKF", "xSHXW")) {
                        const _0x34d569 = _0x6dd275.load(_0x3f25a2), _0x224aa3 = {
                            available: !0
                        };
                        return _0x224aa3.map = _0x34d569, _0x224aa3.fallbackReason = null, _0x224aa3;
                    }
                    {
                        const _0x556b36 = (_0x5767a5.labels || []).map((_0xa06bcc => (_0xa06bcc.name || _0xa06bcc).toLowerCase()));
                        let _0x24c824 = !1;
                        const _0x8855c5 = {};
                        _0x8855c5.number = _0x5767a5.number, _0x8855c5.title = _0x5767a5.title;
                        const _0x35a595 = _0x8855c5;
                        for (const {regex: _0x38b54b, category: _0x128554} of _0x46babe) {
                            if (_0x3bde77_MxqYh("DrMNe", "YJTZp")) {
                                _0x672a03 += _0xcdfb7a;
                            } else if (_0x556b36.some((_0x340560 => _0x38b54b.test(_0x340560)))) {
                                _0x2111d3.categorized[_0x128554].push(_0x35a595), _0x24c824 = !0;
                                break;
                            }
                        }
                        !_0x24c824 && _0x2111d3.categorized.other.push(_0x35a595);
                    }
                }
            }
        }
        function _0x21b569(_0x12fc2a, _0x50388d, _0x4fda31) {
            if (_0x3bde77_CJMrB("vujrD", "vujrD")) {
                const _0x44c1ad = new Date;
                _0x44c1ad.setDate(_0x44c1ad.getDate() - _0x4fda31);
                for (const _0x3ac95e of _0x50388d) {
                    const _0x1f879a = new Date(_0x3ac95e.updatedAt);
                    _0x3bde77_pNPCI(_0x1f879a, _0x44c1ad) && _0x12fc2a.stale.push({
                        number: _0x3ac95e.number,
                        title: _0x3ac95e.title,
                        lastUpdated: _0x3ac95e.updatedAt,
                        daysStale: Math.floor((_0xb86b4f = Date.now(), _0x1fbea6 = _0x1f879a, _0x302d98 = _0xb86b4f - _0x1fbea6, 
                        _0x302d98 / 864e5))
                    });
                }
            } else {
                _0x17b004.destroy(), _0x17a39d("Timeout");
            }
            var _0x302d98, _0xb86b4f, _0x1fbea6;
        }
        function _0x291023(_0x16226e, _0x2f0dcf) {
            {
                const _0x2b6ed4 = {}, _0x827f99 = new Set([ "the", "a", "an", "is", "are", "to", "for", "in", "on", "at", "with", "and", "or", "of" ]);
                for (const _0x1058bc of _0x2f0dcf) {
                    const _0x487e29 = (_0x1058bc.title || "").toLowerCase().split(/\s+/);
                    for (const _0x2c8b7b of _0x487e29) {
                        if (_0x3bde77_MxqYh("NMVjX", "aIHeI")) {
                            _0x2b5e7f.existsSync(_0x46d857) && _0x531ace.unlinkSync(_0x5d5e43);
                        } else if (_0x3bde77_dzozC(_0x2c8b7b.length, 3) && !_0x827f99.has(_0x2c8b7b)) {
                            if (_0x3bde77_PFbgZ("xrVIb", "xrVIb")) {
                                const _0x4ac7df = _0x20f367.resolve(_0x44a3d2, _0x5df4f3), _0x230b19 = _0x379c1c.resolve(_0x481ffe);
                                if (!_0x4ac7df.startsWith(_0x230b19)) {
                                    return null;
                                }
                                try {
                                    return _0x282010.readFileSync(_0x4ac7df, "utf8");
                                } catch {
                                    return null;
                                }
                            } else {
                                _0x2b6ed4[_0x2c8b7b] = (_0x2b6ed4[_0x2c8b7b] || 0) + 1;
                            }
                        }
                    }
                }
                _0x16226e.themes = Object.entries(_0x2b6ed4).filter((([, _0x1fc641]) => _0x1fc641 > 1)).sort(((_0x50a0ac, _0x2835d0) => _0x2835d0[1] - _0x50a0ac[1])).slice(0, 10).map((([_0x1baedb, _0x37ac10]) => ({
                    word: _0x1baedb,
                    count: _0x37ac10
                })));
            }
        }
        function _0xab4926(_0x295b1f) {
            const _0x364155 = new Date;
            _0x295b1f.overdueMilestones = _0x295b1f.milestones.filter((_0x2c8c42 => {
                return !(!_0x2c8c42.due_on || (_0x32902f = _0x2c8c42.state, "closed" === _0x32902f)) && _0x3bde77_pNPCI(new Date(_0x2c8c42.due_on), _0x364155);
                var _0x32902f;
            }));
        }
        const _0x2390e0 = {};
        _0x2390e0.DEFAULT_OPTIONS = _0x4c3485, _0x2390e0.scanGitHubState = function(_0x4f091d = {}) {
            {
                const _0x1bbfe9 = {
                    ..._0x4c3485,
                    ..._0x4f091d
                }, _0x4f1c42 = {
                    issueCount: 0,
                    prCount: 0,
                    milestoneCount: 0
                }, _0x3b27f8 = {};
                _0x3b27f8.requestedLimit = _0x1bbfe9.issueLimit, _0x3b27f8.fetchedCount = 0, _0x3b27f8.hasMore = !1;
                const _0x2d8300 = {};
                _0x2d8300.requestedLimit = _0x1bbfe9.prLimit, _0x2d8300.fetchedCount = 0, _0x2d8300.hasMore = !1;
                const _0x484734 = {};
                _0x484734.requestedLimit = _0x1bbfe9.milestoneLimit, _0x484734.fetchedCount = 0, 
                _0x484734.hasMore = !1;
                const _0x7fa5 = {};
                _0x7fa5.issues = _0x3b27f8, _0x7fa5.prs = _0x2d8300, _0x7fa5.milestones = _0x484734;
                const _0x15ea04 = {
                    bugs: [],
                    features: [],
                    security: [],
                    enhancements: [],
                    other: []
                }, _0x442a0f = {
                    available: !1,
                    partial: !1,
                    errors: []
                };
                _0x442a0f.summary = _0x4f1c42, _0x442a0f.issues = [], _0x442a0f.prs = [], _0x442a0f.milestones = [], 
                _0x442a0f.overdueMilestones = [], _0x442a0f.pagination = _0x7fa5, _0x442a0f.categorized = _0x15ea04, 
                _0x442a0f.stale = [], _0x442a0f.themes = [];
                const _0x41f8d3 = _0x442a0f;
                if (!_0x3bde77_NrBVd(_0x5035da)) {
                    return _0x41f8d3.error = "gh CLI not available or not authenticated", _0x41f8d3;
                }
                _0x41f8d3.available = !0;
                const _0x505db4 = _0x3bde77_UkrMn(_0x52a0d1, [ "issue", "list", "--state", "open", "--json", "number,title,labels,milestone,createdAt,updatedAt,body", "--limit", _0x3bde77_cibNw(String, _0x1bbfe9.issueLimit) ], _0x1bbfe9);
                if (_0x505db4.ok && Array.isArray(_0x505db4.data)) {
                    const _0x446228 = _0x505db4.data;
                    _0x41f8d3.issues = _0x446228.map(_0xaa9f5e), _0x41f8d3.summary.issueCount = _0x446228.length, 
                    _0x41f8d3.pagination.issues.fetchedCount = _0x446228.length, _0x41f8d3.pagination.issues.hasMore = _0x3bde77_lTSIx(_0x1bbfe9.issueLimit, 0) && _0x446228.length >= _0x1bbfe9.issueLimit, 
                    _0x5a9ef5(_0x41f8d3, _0x446228), _0x21b569(_0x41f8d3, _0x446228, 90), _0x3bde77_PvsJT(_0x291023, _0x41f8d3, _0x446228);
                } else if (!_0x505db4.ok) {
                    const _0x419063 = {
                        source: "issues",
                        ..._0x505db4.error
                    };
                    _0x41f8d3.errors.push(_0x419063);
                }
                const _0x13d8f1 = _0x52a0d1([ "pr", "list", "--state", "open", "--json", "number,title,labels,isDraft,createdAt,updatedAt,body,files", "--limit", _0x3bde77_cibNw(String, _0x1bbfe9.prLimit) ], _0x1bbfe9);
                if (_0x13d8f1.ok && Array.isArray(_0x13d8f1.data)) {
                    const _0x561fb0 = _0x13d8f1.data;
                    _0x41f8d3.prs = _0x561fb0.map(_0x290715), _0x41f8d3.summary.prCount = _0x561fb0.length, 
                    _0x41f8d3.pagination.prs.fetchedCount = _0x561fb0.length, _0x41f8d3.pagination.prs.hasMore = _0x1bbfe9.prLimit > 0 && _0x561fb0.length >= _0x1bbfe9.prLimit;
                } else if (!_0x13d8f1.ok) {
                    if (_0x3bde77_PFbgZ("OcVWZ", "OcVWZ")) {
                        _0x160e12 = _0x45d284.message || "Failed to load repo-map module", _0x3dd0aa = null;
                    } else {
                        const _0x372c85 = {
                            source: "prs",
                            ..._0x13d8f1.error
                        };
                        _0x41f8d3.errors.push(_0x372c85);
                    }
                }
                const _0x7201e4 = _0x3bde77_PvsJT(_0x52a0d1, [ "api", "repos/{owner}/{repo}/milestones", "--paginate", "--slurp" ], _0x1bbfe9);
                if (_0x7201e4.ok && Array.isArray(_0x7201e4.data)) {
                    const _0x4cb3c5 = _0x7201e4.data.flatMap((_0x2b26fc => Array.isArray(_0x2b26fc) ? _0x2b26fc : [])).map((_0x4b7479 => ({
                        title: _0x4b7479.title,
                        state: _0x4b7479.state,
                        due_on: _0x4b7479.due_on,
                        open_issues: _0x4b7479.open_issues,
                        closed_issues: _0x4b7479.closed_issues
                    })));
                    _0x41f8d3.pagination.milestones.fetchedCount = _0x4cb3c5.length, _0x41f8d3.pagination.milestones.hasMore = _0x3bde77_mRBMg(_0x1bbfe9.milestoneLimit, 0) && _0x3bde77_dzozC(_0x4cb3c5.length, _0x1bbfe9.milestoneLimit), 
                    _0x41f8d3.milestones = _0x4cb3c5.slice(0, _0x1bbfe9.milestoneLimit), _0x41f8d3.summary.milestoneCount = _0x41f8d3.milestones.length, 
                    _0x3bde77_cibNw(_0xab4926, _0x41f8d3);
                } else if (!_0x7201e4.ok) {
                    if (_0x3bde77_CJMrB("bknEA", "HIHhY")) {
                        return {
                            status: "verified"
                        };
                    }
                    {
                        const _0x489451 = {
                            source: "milestones",
                            ..._0x7201e4.error
                        };
                        _0x41f8d3.errors.push(_0x489451);
                    }
                }
                return _0x41f8d3.partial = _0x3bde77_lTSIx(_0x41f8d3.errors.length, 0), _0x41f8d3.partial && !_0x41f8d3.error && (_0x41f8d3.error = "Partial GitHub data collected"), 
                _0x41f8d3;
            }
        }, _0x2390e0.isGhAvailable = _0x5035da, _0x2390e0.execGh = function(_0x1fdc1d, _0xaf22dd = {}) {
            const _0x25f5bc = _0x3bde77_UkrMn(_0x52a0d1, _0x1fdc1d, _0xaf22dd);
            return _0x25f5bc.ok ? _0x25f5bc.data : null;
        }, _0x2390e0.summarizeIssue = _0xaa9f5e, _0x2390e0.summarizePR = _0x290715, _0x2390e0.categorizeIssues = _0x5a9ef5, 
        _0x2390e0.findStaleItems = _0x21b569, _0x2390e0.extractThemes = _0x291023, _0x2390e0.findOverdueMilestones = _0xab4926, 
        _0x1b04ce.exports = _0x2390e0;
    }
}), require_documentation = __commonJS({
    "../work/agent-sh__agentsys/lib/collectors/documentation.js"(_0x43b1bc, _0x374c1d) {
        const _0x6260fe_Muahb = function(_0x2f10ca, _0x1da505) {
            return _0x2f10ca + _0x1da505;
        }, _0x6260fe_myGjF = function(_0x3f2aeb, _0x2496d2, _0x285632) {
            return _0x3f2aeb(_0x2496d2, _0x285632);
        }, _0x6260fe_QSWBh = function(_0x3dd48a, _0x38b8bb) {
            return _0x3dd48a !== _0x38b8bb;
        }, _0x6260fe_iInKU = function(_0x37f1ce, _0x36af53) {
            return _0x37f1ce === _0x36af53;
        }, _0x6260fe_zkRLl = function(_0x52516c, _0x319a5f, _0x19e630) {
            return _0x52516c(_0x319a5f, _0x19e630);
        }, _0x6260fe_MkujC = function(_0x39cdf3, _0x22bb2b) {
            return _0x39cdf3 === _0x22bb2b;
        }, _0x6260fe_DtaYm = function(_0x13fbb8, _0x46a8dd) {
            return _0x13fbb8 === _0x46a8dd;
        }, _0x6260fe_atLpH = function(_0x3445d8, _0x4151d7) {
            return _0x3445d8 > _0x4151d7;
        }, _0x6260fe_pbkiH = function(_0xaa11cb, _0x418cd5) {
            return _0xaa11cb === _0x418cd5;
        }, _0x6260fe_rxwUR = function(_0x2e9b84, _0x20a4f6) {
            return _0x2e9b84(_0x20a4f6);
        }, _0x6260fe_tdbpu = function(_0x31e1cb, _0x2c2d8f) {
            return _0x31e1cb !== _0x2c2d8f;
        }, _0x6260fe_GLVzE = function(_0x3f6e29, _0x4259a9, _0x4d0cda) {
            return _0x3f6e29(_0x4259a9, _0x4d0cda);
        };
        var _0x43ad3f = require("fs"), _0x1c1208 = require("path"), _0x474075 = {
            depth: "thorough",
            cwd: process.cwd()
        };
        function _0x36c9d3(_0x103e6a, _0xa8af1f) {
            return _0x1c1208.resolve(_0xa8af1f, _0x103e6a).startsWith(_0x1c1208.resolve(_0xa8af1f));
        }
        function _0x1e8876(_0x35e75d, _0x5dfb18) {
            const _0xbd9e0f = _0x1c1208.resolve(_0x5dfb18, _0x35e75d);
            if (!_0x6260fe_myGjF(_0x36c9d3, _0x35e75d, _0x5dfb18)) {
                return null;
            }
            try {
                if (!_0x6260fe_QSWBh("BfHUh", "BfHUh")) {
                    return _0x43ad3f.readFileSync(_0xbd9e0f, "utf8");
                }
                _0x2a895c(_0x598964, _0x518b3b, _0x271be9.join(_0xac84f0, _0x53ca2d), _0x42ac1d, _0x6260fe_Muahb(_0x31b139, 1));
            } catch {
                if (_0x6260fe_iInKU("jUlzi", "jUlzi")) {
                    return null;
                }
                _0x55a895 = _0x2848cf(_0x5b8910, "HEAD~1", _0x109e28), _0x2929b5 = _0x13266d(_0x35a7d4, "HEAD", _0x2b963c);
            }
        }
        function _0x299e94(_0x18270f, _0x23f41c) {
            if (_0x6260fe_QSWBh("EpJpo", "JYvYI")) {
                const _0x5a27db = _0x18270f.match(/^##\s{1,1000}(.+)$/gm) || [], _0x35c114 = _0x5a27db.slice(0, 10).map((_0xbde2fa => _0xbde2fa.replace(/^##\s+/, ""))), _0x5656b5 = _0x35c114.map((_0x468fd4 => _0x468fd4.toLowerCase())).join(" ");
                return {
                    path: _0x23f41c,
                    sectionCount: _0x5a27db.length,
                    sections: _0x35c114,
                    hasInstallation: /install|setup|getting.started/i.test(_0x5656b5),
                    hasUsage: /usage|how.to|example/i.test(_0x5656b5),
                    hasApi: /api|reference|methods/i.test(_0x5656b5),
                    hasTesting: /test|spec|coverage/i.test(_0x5656b5),
                    codeBlocks: Math.floor((_0x5da76b = (_0x18270f.match(/```/g) || []).length, _0x5da76b / 2)),
                    wordCount: _0x18270f.split(/\s+/).length
                };
            }
            var _0x5da76b;
            {
                const _0x2aabb0 = /import .* from ['"]([^'"]+)['"]/g;
                let _0x3cc9a9;
                for (;_0x6260fe_QSWBh(_0x3cc9a9 = _0x2aabb0.exec(_0x352adf), null); ) {
                    const _0x5973ea = _0x3cc9a9[1], _0x83e926 = _0x19c95d.replace(/\.[^.]+$/, "");
                    _0x5973ea.includes(_0x42ccfd.basename(_0x83e926)) && _0x1c6e09.push({
                        type: "code-example",
                        severity: "medium",
                        line: _0x6260fe_zkRLl(_0x1f5190, _0x1670ee, _0x3cc9a9[0]),
                        current: _0x3cc9a9[0],
                        suggestion: "Verify import path is still valid"
                    });
                }
            }
        }
        function _0x3dfb30(_0x152203, _0x2ca78b) {
            if (_0x6260fe_iInKU("Dgydy", "Dgydy")) {
                const _0x43d62a = (_0x2ca78b.match(/^[-*]\s+\[x\]/gim) || []).length, _0x1441ad = (_0x2ca78b.match(/^[-*]\s+\[\s\]/gim) || []).length;
                _0x152203.checkboxes.checked += _0x43d62a, _0x152203.checkboxes.unchecked += _0x1441ad, 
                _0x152203.checkboxes.total += _0x43d62a + _0x1441ad;
            } else {
                const _0xe7019c = new _0x3093b9;
                _0x3def59.overdueMilestones = _0x38385b.milestones.filter((_0x345594 => !(!_0x345594.due_on || vWaAja.spoAQ(_0x345594.state, vWaAja.nSUEk)) && vWaAja.irENE(new _0x356dba(_0x345594.due_on), _0xe7019c)));
            }
        }
        function _0x104f12(_0x311e31, _0x4f1317) {
            if (_0x6260fe_MkujC("SOGUJ", "wVgmq")) {
                _0x342bb2.exports.push(_0x313128[1]);
            } else {
                const _0x167417 = /^[-*]\s{1,100}\*{0,2}([^\n]{1,2000}?)\*{0,2}(?:\s{0,100}[-–]\s{0,100}([^\n]{1,2000}))?$/gm;
                let _0x388d9b;
                for (;_0x6260fe_QSWBh(_0x388d9b = _0x167417.exec(_0x4f1317), null) && _0x311e31.features.length < 20; ) {
                    if (_0x6260fe_DtaYm("MLhwE", "BSYTk")) {
                        _0x417ebc[_0x4016ca] = _0x2dd530, _0x39eaff++;
                    } else {
                        const _0x28648e = _0x388d9b[1].trim();
                        _0x6260fe_atLpH(_0x28648e.length, 5) && _0x28648e.length < 80 && (_0x6260fe_pbkiH("VFBWU", "CPUhu") ? (_0x58a39c.isStale = !0, 
                        _0x375bc.reason = "Marked stale by hook") : _0x311e31.features.push(_0x28648e));
                    }
                }
                _0x311e31.features = [ ...new Set(_0x311e31.features) ].slice(0, 20);
            }
        }
        function _0x9a34de(_0x5148fc, _0xfdc686) {
            const _0x12a510 = [ /(?:TODO|FIXME|PLAN):\s*(.+)/gi, /^##\s+(?:Roadmap|Future|Planned|Coming Soon)/gim ];
            for (const _0x123dd5 of _0x12a510) {
                if (_0x6260fe_QSWBh("ghOyi", "ghOyi")) {
                    const _0x4cc28e = _0x6260fe_rxwUR(_0x8bf203, _0x56e2f7);
                    if (!_0x1d1e3b.existsSync(_0x4cc28e)) {
                        return null;
                    }
                    try {
                        return _0x267a35.parse(_0x20184d.readFileSync(_0x4cc28e, "utf8"));
                    } catch {
                        return null;
                    }
                } else {
                    let _0x2d94d8;
                    for (;_0x6260fe_QSWBh(_0x2d94d8 = _0x123dd5.exec(_0xfdc686), null) && _0x5148fc.plans.length < 15; ) {
                        if (_0x6260fe_MkujC("ChMiA", "ChMiA")) {
                            const _0x4e2493 = (_0x2d94d8[1] || _0x2d94d8[0]).slice(0, 100);
                            _0x5148fc.plans.push(_0x4e2493);
                        } else {
                            _0x31c3b7.push(_0x54e6a6);
                        }
                    }
                }
            }
        }
        function _0x4a14ea(_0x471b92) {
            const _0x4f0a75_mrFaH = function(_0x10b35d, _0x3020ac) {
                return _0x10b35d + _0x3020ac;
            }, _0xd16c4d = _0x471b92.files["README.md"];
            if (_0xd16c4d) {
                if (_0x6260fe_tdbpu("pEjXR", "FFhYf")) {
                    if (!_0xd16c4d.hasInstallation) {
                        if (_0x6260fe_pbkiH("vtzfS", "vtzfS")) {
                            const _0x906bd = {
                                type: "missing-section",
                                file: "README.md",
                                section: "Installation",
                                severity: "medium"
                            };
                            _0x471b92.gaps.push(_0x906bd);
                        } else {
                            _0x408c00(_0x15ea57, _0x118d81);
                        }
                    }
                    if (!_0xd16c4d.hasUsage) {
                        const _0x4b2790 = {
                            type: "missing-section",
                            file: "README.md",
                            section: "Usage",
                            severity: "medium"
                        };
                        _0x471b92.gaps.push(_0x4b2790);
                    }
                } else {
                    _0x3d5b0f.stderr.write(_0x6260fe_Muahb("[OK] SLSA attestation verified for ", _0x31b6c8) + "\n");
                }
            } else {
                if (_0x6260fe_QSWBh("zaqrc", "zaqrc")) {
                    throw new _0xb29959(_0x4f0a75_mrFaH(_0x4f0a75_mrFaH(_0x4f0a75_mrFaH(_0x4f0a75_mrFaH(_0x4f0a75_mrFaH("Unsupported platform: ", _0x276418.platform), "-"), _0x44f19b.arch), ". Supported platforms: "), _0x990bed.keys(_0x6db76d).join(", ")));
                }
                {
                    const _0x3612ab = {
                        type: "missing",
                        file: "README.md",
                        severity: "high"
                    };
                    _0x471b92.gaps.push(_0x3612ab);
                }
            }
            if (!_0x471b92.files["CHANGELOG.md"]) {
                const _0x217b15 = {
                    type: "missing",
                    file: "CHANGELOG.md",
                    severity: "low"
                };
                _0x471b92.gaps.push(_0x217b15);
            }
        }
        const _0x215707 = {};
        _0x215707.DEFAULT_OPTIONS = _0x474075, _0x215707.analyzeDocumentation = function(_0x532a38 = {}) {
            const _0x31c0fe_TWrVi = function(_0x3a7c6d, _0x471124) {
                return _0x3a7c6d + _0x471124;
            };
            if (_0x6260fe_tdbpu("AZIfy", "elzjN")) {
                const _0x6314a0 = {
                    ..._0x474075,
                    ..._0x532a38
                }, _0xce7aac = _0x6314a0.cwd, _0x8ebe59 = {
                    fileCount: 0,
                    totalWords: 0
                }, _0x12bbfa = {
                    total: 0,
                    checked: 0,
                    unchecked: 0
                }, _0x570db5 = {};
                _0x570db5.summary = _0x8ebe59, _0x570db5.files = {}, _0x570db5.features = [], _0x570db5.plans = [], 
                _0x570db5.checkboxes = _0x12bbfa, _0x570db5.gaps = [];
                const _0x3bcfec = _0x570db5, _0x2644fc = [ "README.md", "PLAN.md", "CLAUDE.md", "AGENTS.md", "CONTRIBUTING.md", "CHANGELOG.md", "docs/README.md", "docs/PLAN.md" ];
                for (const _0x4aff91 of _0x2644fc) {
                    const _0x2cf6f0 = _0x1e8876(_0x4aff91, _0xce7aac);
                    if (_0x2cf6f0) {
                        const _0x138ece = _0x6260fe_zkRLl(_0x299e94, _0x2cf6f0, _0x4aff91);
                        _0x3bcfec.files[_0x4aff91] = _0x138ece, _0x3bcfec.summary.totalWords += _0x138ece.wordCount, 
                        _0x6260fe_myGjF(_0x3dfb30, _0x3bcfec, _0x2cf6f0), _0x6260fe_GLVzE(_0x104f12, _0x3bcfec, _0x2cf6f0), 
                        _0x6260fe_GLVzE(_0x9a34de, _0x3bcfec, _0x2cf6f0);
                    }
                }
                if (_0x6260fe_DtaYm(_0x6314a0.depth, "thorough")) {
                    if (_0x6260fe_QSWBh("cmQEx", "JOVcF")) {
                        const _0x253daf = _0x1c1208.join(_0xce7aac, "docs");
                        if (_0x43ad3f.existsSync(_0x253daf)) {
                            try {
                                if (!_0x6260fe_tdbpu("EVLwo", "ODTMX")) {
                                    return _0x33d8ef = _0x1f87df, _0x5e4349 = new _0x3601b2(_0x31c0fe_TWrVi(_0x31c0fe_TWrVi("tar -tz listing failed (code " + _0x3ce072, "): "), _0x23966e)), 
                                    void _0x6260fe_rxwUR(_0x33d8ef, _0x5e4349);
                                }
                                {
                                    const _0x2a357a = _0x43ad3f.readdirSync(_0x253daf).filter((_0x156a22 => _0x156a22.endsWith(".md") && !_0x2644fc.includes("docs/" + _0x156a22)));
                                    for (const _0x3b339b of _0x2a357a.slice(0, 5)) {
                                        if (_0x6260fe_iInKU("zEZXV", "VyzSB")) {
                                            _0x5df3e3.frameworks.push(_0x5ee362);
                                        } else {
                                            const _0x2a2520 = "docs/" + _0x3b339b, _0x5e9864 = _0x6260fe_myGjF(_0x1e8876, _0x2a2520, _0xce7aac);
                                            if (_0x5e9864) {
                                                const _0x1620f6 = _0x6260fe_myGjF(_0x299e94, _0x5e9864, _0x2a2520);
                                                _0x3bcfec.files[_0x2a2520] = _0x1620f6, _0x3bcfec.summary.totalWords += _0x1620f6.wordCount;
                                            }
                                        }
                                    }
                                }
                            } catch {}
                        }
                    } else {
                        const _0x5ee623 = {
                            SreYa: function(_0x4dd4ea, _0xe0bd99) {
                                return _0x6260fe_atLpH(_0x4dd4ea, _0xe0bd99);
                            }
                        };
                        if (_0x6260fe_QSWBh(_0x1030c0, 0)) {
                            return void _0x6260fe_rxwUR(_0x3585c7, new _0x10c78a((_0x4d400c = _0x3929f2, _0x2b0fb3 = "tar -tz listing failed (code " + _0x4d400c, 
                            _0x486c5a = _0x2b0fb3 + "): ", _0xa2b51d = _0x4e2eb9, _0x486c5a + _0xa2b51d)));
                        }
                        const _0xb08361 = _0x2a321b.split(/\r?\n/).filter((function(_0x3a6c6d) {
                            return _0x5ee623.SreYa(_0x3a6c6d.length, 0);
                        }));
                        _0x6260fe_rxwUR(_0x4a6089, _0xb08361);
                    }
                }
                return _0x3bcfec.summary.fileCount = Object.keys(_0x3bcfec.files).length, _0x6260fe_rxwUR(_0x4a14ea, _0x3bcfec), 
                _0x3bcfec;
            }
            var _0x33d8ef, _0x5e4349, _0x486c5a, _0xa2b51d, _0x2b0fb3, _0x4d400c, _0x8b08d5;
            return (_0x8b08d5 = _0x12b125, _0x8b08d5 || "").replace(/\\/g, "/");
        }, _0x215707.analyzeMarkdownFile = _0x299e94, _0x215707.safeReadFile = _0x1e8876, 
        _0x215707.isPathSafe = _0x36c9d3, _0x215707.extractCheckboxes = _0x3dfb30, _0x215707.extractFeatures = _0x104f12, 
        _0x215707.extractPlans = _0x9a34de, _0x215707.identifyDocGaps = _0x4a14ea, _0x374c1d.exports = _0x215707;
    }
}), require_fs_safe = __commonJS({
    "../work/agent-sh__agentsys/lib/utils/fs-safe.js"(_0x31ca98, _0x5bbdd8) {
        const _0x13199e_hVaXS = function(_0x4c512a, _0x329cc1) {
            return _0x4c512a === _0x329cc1;
        };
        var _0x1bef64 = require("fs");
        const _0x34a580 = {
            readFileWithLimit: function(_0x21f0ea, _0x17c8c1, _0x31ee7c = "utf8") {
                if (_0x13199e_hVaXS("CzsLE", "oQgPc")) {
                    return !1;
                }
                {
                    const _0x4d96f4 = _0x1bef64.openSync(_0x21f0ea, "r");
                    try {
                        {
                            const _0x50ea9a = _0x1bef64.fstatSync(_0x4d96f4);
                            if (!_0x50ea9a.isFile()) {
                                const _0x3b0396 = new Error("Not a regular file: " + _0x21f0ea);
                                throw _0x3b0396.code = "ENOTFILE", _0x3b0396;
                            }
                            if (_0x13199e_hVaXS(typeof _0x17c8c1, "number") && _0x50ea9a.size > _0x17c8c1) {
                                const _0x53c8e3 = new Error("File too large: " + _0x50ea9a.size + " > " + _0x17c8c1 + " bytes");
                                throw _0x53c8e3.code = "EFBIG", _0x53c8e3;
                            }
                            return _0x1bef64.readFileSync(_0x4d96f4, _0x31ee7c);
                        }
                    } finally {
                        _0x1bef64.closeSync(_0x4d96f4);
                    }
                }
            }
        };
        _0x5bbdd8.exports = _0x34a580;
    }
}), require_codebase = __commonJS({
    "../work/agent-sh__agentsys/lib/collectors/codebase.js"(_0x5071e3, _0x107589) {
        const _0x4c221b_esbMx = function(_0x4d9c6b, _0x5b2032) {
            return _0x4d9c6b === _0x5b2032;
        }, _0x4c221b_hrddS = function(_0x2e3c61, _0x49ba2c) {
            return _0x2e3c61 + _0x49ba2c;
        }, _0x4c221b_rAali = function(_0x2ef528, _0x2d8710) {
            return _0x2ef528 + _0x2d8710;
        }, _0x4c221b_CfCiM = function(_0x18ce0b, _0x369c1b) {
            return _0x18ce0b + _0x369c1b;
        }, _0x4c221b_ydIMr = function(_0x2ecff6, _0x27d3c9) {
            return _0x2ecff6 === _0x27d3c9;
        }, _0x4c221b_acpqY = function(_0x4fd708, _0x353fc8) {
            return _0x4fd708 !== _0x353fc8;
        }, _0x4c221b_zLswd = function(_0x802131, _0x2bef35) {
            return _0x802131(_0x2bef35);
        }, _0x4c221b_juVEj = function(_0x1016e8, _0x5bf3be, _0x40cb72, _0x5366a0) {
            return _0x1016e8(_0x5bf3be, _0x40cb72, _0x5366a0);
        }, _0x4c221b_lQfaO = function(_0x20e26c, _0x18ebee, _0x12ec24) {
            return _0x20e26c(_0x18ebee, _0x12ec24);
        }, _0x4c221b_YfGIg = function(_0x41914f, _0x316e2f) {
            return _0x41914f !== _0x316e2f;
        }, _0x4c221b_slchy = function(_0xc9272, _0xb39d82, _0x2df2dc) {
            return _0xc9272(_0xb39d82, _0x2df2dc);
        }, _0x4c221b_dXGjJ = function(_0x4abba0, _0x41b890) {
            return _0x4abba0 > _0x41b890;
        }, _0x4c221b_TvOIT = function(_0x9db65c, _0x4351f6) {
            return _0x9db65c(_0x4351f6);
        }, _0x4c221b_DgLXo = function(_0x3fa8de, _0x2bd668) {
            return _0x3fa8de !== _0x2bd668;
        }, _0x4c221b_zxJGS = function(_0x56fa47, _0x341de5) {
            return _0x56fa47 >= _0x341de5;
        }, _0x4c221b_PrDCM = function(_0x20cf87, _0x1f43ba) {
            return _0x20cf87 === _0x1f43ba;
        }, _0x4c221b_AuTdd = function(_0x511477, _0x5cdbc5) {
            return _0x511477 === _0x5cdbc5;
        }, _0x4c221b_pNESB = function(_0x28cadd, _0x3615c1, _0x581236) {
            return _0x28cadd(_0x3615c1, _0x581236);
        }, _0x4c221b_ErDpE = function(_0xd6f8a1, _0x1953d7) {
            return _0xd6f8a1 !== _0x1953d7;
        }, _0x4c221b_ghkhM = function(_0x32248d, _0x34f0d9) {
            return _0x32248d === _0x34f0d9;
        }, _0x4c221b_FZscs = function(_0x4dbcc7, _0x582933) {
            return _0x4dbcc7(_0x582933);
        }, _0x4c221b_nUeXy = function(_0x227c18, _0x5f4fb6, _0x493d59) {
            return _0x227c18(_0x5f4fb6, _0x493d59);
        };
        var _0x701370 = _0x4c221b_FZscs(require, "fs"), _0xf9dcf5 = require("path"), {readFileWithLimit: _0x16c8ec} = require_fs_safe(), _0x58c35b = {
            depth: "thorough",
            cwd: process.cwd()
        }, _0x381561 = [ "node_modules", "vendor", "dist", "build", "out", "target", ".git", ".svn", ".hg", "__pycache__", ".pytest_cache", "coverage", ".nyc_output", ".next", ".nuxt", ".cache" ], _0x46be8c = {
            js: [ ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs" ],
            rust: [ ".rs" ],
            go: [ ".go" ],
            python: [ ".py" ],
            java: [ ".java" ]
        };
        function _0x275ec7(_0x473dca, _0x53e457) {
            if (_0x4c221b_ydIMr("EupQl", "wzoku")) {
                const _0x466495 = _0x4c221b_esbMx(_0x11f2a3.platform, "win32") ? ".zip" : ".tar.gz";
                return _0x4c221b_hrddS(_0x4c221b_rAali(_0x4c221b_rAali(_0x4c221b_CfCiM(_0x4c221b_CfCiM(_0x4c221b_rAali(_0x4c221b_hrddS("https://github.com/" + _0x54fe08, "/releases/download/v"), _0x5c79b1), "/"), _0x46a27d), "-"), _0x17f636), _0x466495);
            }
            {
                const _0x4511b8 = _0xf9dcf5.resolve(_0x53e457, _0x473dca), _0x478243 = _0xf9dcf5.resolve(_0x53e457);
                if (!_0x4511b8.startsWith(_0x478243)) {
                    return null;
                }
                try {
                    if (!_0x4c221b_acpqY("YMyeI", "YMyeI")) {
                        return _0x701370.readFileSync(_0x4511b8, "utf8");
                    }
                    {
                        const _0x46a42f = _0x19509a.extname(_0x4bd22b).toLowerCase() || "no-ext";
                        _0x48f18f.fileStats[_0x46a42f] = _0x4c221b_CfCiM(_0x16d18b.fileStats[_0x46a42f] || 0, 1);
                    }
                } catch {
                    return null;
                }
            }
        }
        function _0xe2e97c(_0x2f68fc, _0x189f31) {
            if (_0x4c221b_esbMx("xphvE", "vyanW")) {
                const _0x57a5bc = (_0x5d2185 = _0x4527c5, _0x5e69bf = _0x4a20c0, _0x4c221b_zLswd(_0x5d2185, _0x5e69bf));
                if (!_0x537a7a.existsSync(_0x57a5bc)) {
                    const _0x493e36 = {
                        recursive: !0
                    };
                    _0x413e47.mkdirSync(_0x57a5bc, _0x493e36);
                }
                return _0x57a5bc;
            }
            var _0x5d2185, _0x5e69bf;
            {
                const _0x3d7cf5 = {
                    ..._0x189f31.dependencies,
                    ..._0x189f31.devDependencies
                }, _0x2a16e2 = {
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
                    _0x3d7cf5[_0x4057e4] && _0x2f68fc.frameworks.push(_0x4eddc6);
                }
                _0x2f68fc.frameworks = [ ...new Set(_0x2f68fc.frameworks) ];
            }
        }
        function _0xf548f7(_0x2a00aa, _0x141197) {
            const _0x36a47d = {
                ..._0x141197.dependencies,
                ..._0x141197.devDependencies
            }, _0x5b884a = [ "jest", "mocha", "vitest", "ava", "tap", "jasmine" ];
            for (const _0x5aa160 of _0x5b884a) {
                if (_0x4c221b_acpqY("chtIy", "chtIy")) {
                    return _0x4c221b_juVEj(_0xac48ee, "slop-fixes", [], _0x88c34f);
                }
                if (_0x36a47d[_0x5aa160]) {
                    _0x2a00aa.testFramework = _0x5aa160, _0x2a00aa.health.hasTests = !0;
                    break;
                }
            }
        }
        function _0x5db491(_0x351ae0) {
            const _0x2d6036 = {
                functions: [],
                classes: [],
                exports: []
            }, _0x5b81fe = /(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
            let _0x5077e4;
            for (;_0x4c221b_acpqY(_0x5077e4 = _0x5b81fe.exec(_0x351ae0), null); ) {
                if (_0x4c221b_ydIMr("CUNdK", "AArkc")) {
                    const _0x23d8cb = _0x28f6a1.readdirSync(_0x52eb86);
                    for (let _0x3d1ebf = 0; _0x3d1ebf < _0x23d8cb.length; _0x3d1ebf++) {
                        _0x4b025f.push(_0x43fb67.join(_0x2ade66, _0x23d8cb[_0x3d1ebf]));
                    }
                } else {
                    _0x2d6036.functions.push(_0x5077e4[1]);
                }
            }
            const _0x3fccc1 = /(?:const|let)\s{1,1000}([a-zA-Z_$][a-zA-Z0-9_$]*)\s{0,1000}=\s{0,1000}(?:async\s{0,1000})?\([^)]{0,2000}\)\s{0,1000}=>/g;
            for (;_0x4c221b_YfGIg(_0x5077e4 = _0x3fccc1.exec(_0x351ae0), null); ) {
                _0x2d6036.functions.push(_0x5077e4[1]);
            }
            const _0x99b528 = /class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
            for (;_0x4c221b_acpqY(_0x5077e4 = _0x99b528.exec(_0x351ae0), null); ) {
                _0x2d6036.classes.push(_0x5077e4[1]);
            }
            const _0x1e0a1a = /export\s+(?:(?:async\s+)?function|class|const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
            for (;_0x4c221b_YfGIg(_0x5077e4 = _0x1e0a1a.exec(_0x351ae0), null); ) {
                if (!_0x4c221b_YfGIg("xrCGu", "hGSQj")) {
                    _0x267920 = _0x4ff7fb, _0x49a472 = _0x2cb744, _0x4c221b_lQfaO(_0x267920, _0x49a472, "coupling: file");
                    const _0x28763c = [ _0x1f9876 ];
                    return null != _0x3567a6.limit && _0x28763c.push("--top", (_0x147e9e = _0x482ae9, 
                    _0x4e9914 = _0x136584.limit, _0x4c221b_zLswd(_0x147e9e, _0x4e9914))), _0x39a36c = _0x1e28fe, 
                    _0x4692b7 = _0x1d68c5, _0x4c221b_juVEj(_0x39a36c, "coupling", _0x28763c, _0x4692b7);
                }
                _0x2d6036.exports.push(_0x5077e4[1]);
            }
            var _0x39a36c, _0x4692b7, _0x147e9e, _0x4e9914, _0x267920, _0x49a472;
            const _0x5db059 = _0x351ae0.match(/module\.exports\s{0,1000}=\s{0,1000}\{([^}]{1,100000})\}/);
            if (_0x5db059) {
                if (_0x4c221b_acpqY("MSbhi", "MSbhi")) {
                    const _0x50f0c6 = _0x4ce84e.parse(_0x227440.concat(_0x1f6286).toString("utf8")), _0x5464a0 = (_0x50f0c6 && _0x50f0c6.tag_name || "").replace(/^v/, "");
                    /^\d+\.\d+\.\d+/.test(_0x5464a0) ? (_0x962f1f = {
                        version: _0x5464a0,
                        fetchedAt: _0x4880a3.now()
                    }, _0x1ce578(_0x5464a0)) : _0x4914c5("No valid release tag");
                } else {
                    const _0x2de782 = _0x5db059[1].split(",").map((_0x4fedde => _0x4fedde.trim().split(":")[0].trim()));
                    _0x2d6036.exports.push(..._0x2de782.filter((_0x3abb8e => _0x3abb8e && /^[a-zA-Z_$]/.test(_0x3abb8e))));
                }
            }
            return _0x2d6036.functions = [ ...new Set(_0x2d6036.functions) ], _0x2d6036.classes = [ ...new Set(_0x2d6036.classes) ], 
            _0x2d6036.exports = [ ...new Set(_0x2d6036.exports) ], _0x2d6036;
        }
        function _0x521184(_0x177a43, _0x822808) {
            const _0xbbb1d4 = {
                tMDRB: function(_0x14711c, _0x20a297) {
                    return _0x14711c + _0x20a297;
                },
                bjmvr: function(_0x2cca84, _0x1410de) {
                    return _0x4c221b_dXGjJ(_0x2cca84, _0x1410de);
                },
                okrzN: "...",
                TeEVb: ".opencode",
                Vwwjy: function(_0x31a7ec, _0x242bc6) {
                    return _0x4c221b_TvOIT(_0x31a7ec, _0x242bc6);
                },
                kTNsx: "zip extraction failed: ",
                xhaOx: function(_0x21ddae) {
                    return _0x21ddae();
                },
                WaWDs: function(_0x1a82a6, _0x40662a) {
                    return _0x4c221b_DgLXo(_0x1a82a6, _0x40662a);
                },
                vWaWV: "tniBo",
                GWHhY: function(_0x50cee0, _0x21d1a0) {
                    return _0x4c221b_zxJGS(_0x50cee0, _0x21d1a0);
                },
                IPimL: function(_0x5051d9, _0x1da25d) {
                    return _0x4c221b_dXGjJ(_0x5051d9, _0x1da25d);
                },
                NPrOw: function(_0x47bea4, _0x570ab1) {
                    return _0x4c221b_YfGIg(_0x47bea4, _0x570ab1);
                },
                lAxCT: "bdVIR",
                fGKgw: function(_0x407048, _0x50ea04) {
                    return _0x407048 >= _0x50ea04;
                },
                ieaTm: function(_0x1cfb4a, _0x507d05) {
                    return _0x4c221b_DgLXo(_0x1cfb4a, _0x507d05);
                },
                uHIJv: "yiQTH",
                AgbLJ: "node_modules",
                fEgsT: "__tests__",
                iZcLo: "test",
                yjtqJ: "tests",
                rbqJH: "dist",
                JEaHi: "build",
                CdgFn: function(_0x5bbf3c, _0x28f17f, _0x12a473, _0xdcfaf5) {
                    return _0x5bbf3c(_0x28f17f, _0x12a473, _0xdcfaf5);
                },
                dCUMW: function(_0x381e3a, _0x417b7b) {
                    return _0x4c221b_PrDCM(_0x381e3a, _0x417b7b);
                },
                OMQgk: "VqYcG",
                rNjxF: ".test.",
                yxUQK: ".spec.",
                pkMEs: function(_0x1402b3, _0x2f460d) {
                    return _0x1402b3 !== _0x2f460d;
                },
                EwMrs: "KgtLs",
                qMMzk: "gXDmE",
                VpShT: function(_0x20777a, _0x35bfba, _0x2132d9) {
                    return _0x4c221b_lQfaO(_0x20777a, _0x35bfba, _0x2132d9);
                },
                uFkNV: function(_0x3bc4dc, _0x1b0fd4) {
                    return _0x4c221b_TvOIT(_0x3bc4dc, _0x1b0fd4);
                }
            };
            if (!_0x4c221b_AuTdd("gPpOV", "gwctt")) {
                const _0x161bb7 = {}, _0x3c61b3 = [ "lib", "src", "app", "pages", "components", "utils", "services", "api" ], _0x4d1605 = _0x822808.filter((_0x225ed5 => _0x3c61b3.includes(_0x225ed5))), _0x4b500f = Object.values(_0x46be8c).flat();
                let _0x14fc9e = 0;
                const _0x79e41d = 40;
                function _0x209c3b(_0xf52107, _0x21ab2b, _0x38b2cb = 0) {
                    const _0x15c16f = {
                        uXhiT: function(_0x317d90, _0x5aac93) {
                            return _0xbbb1d4.tMDRB(_0x317d90, _0x5aac93);
                        },
                        vVBUf: function(_0x1850fa, _0x46d1bd) {
                            return _0xbbb1d4.bjmvr(_0x1850fa, _0x46d1bd);
                        },
                        TjoGF: _0xbbb1d4.okrzN,
                        ngBTx: _0xbbb1d4.TeEVb,
                        oaolr: function(_0x50bf5f, _0x3c198a) {
                            return _0xbbb1d4.Vwwjy(_0x50bf5f, _0x3c198a);
                        },
                        OFmPD: function(_0x2dfac6, _0xa1df39) {
                            return _0xbbb1d4.tMDRB(_0x2dfac6, _0xa1df39);
                        },
                        Ghoda: _0xbbb1d4.kTNsx,
                        QPtxI: function(_0x146a6d) {
                            return _0xbbb1d4.xhaOx(_0x146a6d);
                        }
                    };
                    if (_0xbbb1d4.WaWDs(_0xbbb1d4.vWaWV, _0xbbb1d4.vWaWV)) {
                        return {
                            number: _0x3807d8.number,
                            title: _0x4251fb.title,
                            labels: (_0x5dde27.labels || []).map((_0x1ae1b8 => _0x1ae1b8.name || _0x1ae1b8)),
                            milestone: _0xaa984d.milestone?.title || _0xae110a.milestone || null,
                            createdAt: _0x254e3c.createdAt,
                            updatedAt: _0x502de0.updatedAt,
                            snippet: _0xef5493.body ? ZNybrE.uXhiT(_0x3022fc.body.slice(0, 200).replace(/\n/g, " ").trim(), ZNybrE.vVBUf(_0x40886e.body.length, 200) ? ZNybrE.TjoGF : "") : ""
                        };
                    }
                    if (!_0xbbb1d4.GWHhY(_0x14fc9e, _0x79e41d) && !_0xbbb1d4.IPimL(_0x38b2cb, 2) && _0x701370.existsSync(_0xf52107)) {
                        try {
                            const _0x2dfbb6 = {
                                withFileTypes: !0
                            }, _0x4db18e = _0x701370.readdirSync(_0xf52107, _0x2dfbb6);
                            for (const _0x1f04c1 of _0x4db18e) {
                                if (_0xbbb1d4.NPrOw(_0xbbb1d4.lAxCT, _0xbbb1d4.lAxCT)) {
                                    _0x28f4ba.push(_0x2b576f[1]);
                                } else {
                                    if (_0xbbb1d4.fGKgw(_0x14fc9e, _0x79e41d)) {
                                        break;
                                    }
                                    const _0x3955db = _0xf9dcf5.join(_0xf52107, _0x1f04c1.name), _0xf818a6 = _0x21ab2b ? _0x21ab2b + "/" + _0x1f04c1.name : _0x1f04c1.name;
                                    if (_0x1f04c1.isDirectory()) {
                                        if (_0xbbb1d4.ieaTm(_0xbbb1d4.uHIJv, _0xbbb1d4.uHIJv)) {
                                            return _0x268413.set(_0x5850cf, _0x15c16f.ngBTx), _0x15c16f.ngBTx;
                                        }
                                        if ([ _0xbbb1d4.AgbLJ, _0xbbb1d4.fEgsT, _0xbbb1d4.iZcLo, _0xbbb1d4.yjtqJ, _0xbbb1d4.rbqJH, _0xbbb1d4.JEaHi ].includes(_0x1f04c1.name)) {
                                            continue;
                                        }
                                        _0xbbb1d4.CdgFn(_0x209c3b, _0x3955db, _0xf818a6, _0xbbb1d4.tMDRB(_0x38b2cb, 1));
                                    } else if (_0x1f04c1.isFile()) {
                                        if (!_0xbbb1d4.dCUMW(_0xbbb1d4.OMQgk, _0xbbb1d4.OMQgk)) {
                                            return null;
                                        }
                                        {
                                            const _0x460076 = _0xf9dcf5.extname(_0x1f04c1.name);
                                            if (!_0x4b500f.includes(_0x460076)) {
                                                continue;
                                            }
                                            if (_0x1f04c1.name.includes(_0xbbb1d4.rNjxF) || _0x1f04c1.name.includes(_0xbbb1d4.yxUQK)) {
                                                continue;
                                            }
                                            try {
                                                if (_0xbbb1d4.pkMEs(_0xbbb1d4.EwMrs, _0xbbb1d4.qMMzk)) {
                                                    const _0x7b3a84 = _0xbbb1d4.VpShT(_0x16c8ec, _0x3955db, 5e4), _0x388833 = _0xbbb1d4.uFkNV(_0x5db491, _0x7b3a84);
                                                    (_0x388833.functions.length || _0x388833.classes.length || _0x388833.exports.length) && (_0x161bb7[_0xf818a6] = _0x388833, 
                                                    _0x14fc9e++);
                                                } else {
                                                    _0x54f1b1 ? _0x15c16f.oaolr(_0x39c01e, new _0x1104a8(_0x15c16f.OFmPD(_0x15c16f.Ghoda, _0x2ec5ce || _0x57086a.message))) : _0x15c16f.QPtxI(_0x3a6dff);
                                                }
                                            } catch {}
                                        }
                                    }
                                }
                            }
                        } catch {}
                    }
                }
                for (const _0x4921f1 of _0x4d1605) {
                    if (_0x4c221b_zxJGS(_0x14fc9e, _0x79e41d)) {
                        break;
                    }
                    _0x4c221b_pNESB(_0x209c3b, _0xf9dcf5.join(_0x177a43, _0x4921f1), _0x4921f1);
                }
                return _0x161bb7;
            }
            _0x4d6ee7.closeSync(_0x1b7cce);
        }
        function _0x1855c4(_0x567c7b, _0x446b84, _0x4c68d6, _0x4472f4, _0x298aca = 0) {
            {
                if (_0x298aca >= _0x4472f4) {
                    return;
                }
                const _0xb5363e = _0xf9dcf5.join(_0x446b84, _0x4c68d6);
                if (!_0x701370.existsSync(_0xb5363e)) {
                    return;
                }
                try {
                    if (_0x4c221b_AuTdd("CLDWz", "XrscO")) {
                        return null;
                    }
                    {
                        const _0x2dc2e0 = {
                            withFileTypes: !0
                        }, _0xa81ab1 = _0x701370.readdirSync(_0xb5363e, _0x2dc2e0), _0x40315e = [], _0x44fd42 = [];
                        for (const _0x1fc698 of _0xa81ab1) {
                            if (_0x1fc698.isDirectory()) {
                                !_0x381561.includes(_0x1fc698.name) && _0x40315e.push(_0x1fc698.name);
                            } else {
                                if (_0x4c221b_ErDpE("CRMRE", "CRMRE")) {
                                    const _0x597d36 = _0x3d6b2d.dirname(_0x4384a6), _0x124e35 = _0x788488.basename(_0x3546fa), _0x37c99a = _0x4a7db7.randomBytes(6).toString("hex");
                                    return _0x260352.join(_0x597d36, "." + _0x124e35 + "." + _0x37c99a + ".tmp");
                                }
                                _0x44fd42.push(_0x1fc698.name);
                            }
                        }
                        const _0x56bba4 = _0x4c68d6 || ".", _0x3006bc = {};
                        _0x3006bc.dirs = _0x40315e, _0x3006bc.fileCount = _0x44fd42.length, _0x567c7b.structure[_0x56bba4] = _0x3006bc;
                        for (const _0x3e6cde of _0x44fd42) {
                            const _0x1a50de = _0xf9dcf5.extname(_0x3e6cde).toLowerCase() || "no-ext";
                            _0x567c7b.fileStats[_0x1a50de] = (_0x567c7b.fileStats[_0x1a50de] || 0) + 1;
                        }
                        for (const _0xd03663 of _0x40315e) {
                            if (_0x4c221b_PrDCM("yTuKG", "NPvme")) {
                                return !0;
                            }
                            _0x1855c4(_0x567c7b, _0x446b84, _0xf9dcf5.join(_0x4c68d6, _0xd03663), _0x4472f4, _0x298aca + 1);
                        }
                    }
                } catch {}
            }
        }
        function _0x36b0e0(_0x43bc5c, _0x4c2b45) {
            _0x43bc5c.health.hasReadme = _0x701370.existsSync(_0xf9dcf5.join(_0x4c2b45, "README.md")), 
            _0x43bc5c.health.hasLinting = [ ".eslintrc", ".eslintrc.js", ".eslintrc.json", "eslint.config.js", "biome.json" ].some((_0x41f59a => _0x701370.existsSync(_0xf9dcf5.join(_0x4c2b45, _0x41f59a)))), 
            _0x43bc5c.health.hasCi = [ ".github/workflows", ".gitlab-ci.yml", ".circleci", "Jenkinsfile", ".travis.yml" ].some((_0x2d920f => _0x701370.existsSync(_0xf9dcf5.join(_0x4c2b45, _0x2d920f)))), 
            _0x43bc5c.health.hasTests = _0x43bc5c.health.hasTests || [ "tests", "__tests__", "test", "spec" ].some((_0x1400fb => _0x701370.existsSync(_0xf9dcf5.join(_0x4c2b45, _0x1400fb))));
        }
        function _0x251aaf(_0x628f25, _0x5d1b82) {
            if (_0x4c221b_ydIMr("NMWuH", "NMWuH")) {
                const _0x1fa04e = {
                    authentication: [ "auth", "login", "session", "jwt", "oauth" ],
                    api: [ "routes", "controllers", "handlers", "endpoints" ],
                    database: [ "models", "schemas", "migrations", "seeds" ],
                    ui: [ "components", "views", "pages", "layouts" ],
                    testing: [ "__tests__", "test", "spec", ".test.", ".spec." ],
                    docs: [ "docs", "documentation", "wiki" ]
                };
                for (const [_0x559075, _0x12dfe8] of Object.entries(_0x1fa04e)) {
                    _0x12dfe8.some((_0x53b792 => {
                        if (_0x4c221b_esbMx("Zfufi", "Zfufi")) {
                            for (const _0x26668a of Object.keys(_0x628f25.structure)) {
                                if (_0x26668a.toLowerCase().includes(_0x53b792)) {
                                    return !0;
                                }
                            }
                            return !1;
                        }
                        {
                            const _0x3a4484 = {
                                available: !1
                            };
                            return _0x3a4484.error = "Binary not available: " + _0x579781.message, _0x3a4484;
                        }
                    })) && (_0x4c221b_ghkhM("SSkzC", "SSkzC") ? _0x628f25.implementedFeatures.push(_0x559075) : _0x200fd8(_0x4902ea.message));
                }
            } else {
                _0x348c2f.classes.push(_0x4b0f58[1]);
            }
        }
        const _0x35e079 = {};
        _0x35e079.DEFAULT_OPTIONS = _0x58c35b, _0x35e079.EXCLUDE_DIRS = _0x381561, _0x35e079.SOURCE_EXTENSIONS = _0x46be8c, 
        _0x35e079.scanCodebase = function(_0x3c7e74 = {}) {
            const _0x1cd84a = {
                ..._0x58c35b,
                ..._0x3c7e74
            }, _0x3971c6 = _0x1cd84a.cwd, _0x5458ee = {
                summary: {
                    totalDirs: 0,
                    totalFiles: 0
                },
                topLevelDirs: [],
                frameworks: [],
                testFramework: null,
                hasTypeScript: !1,
                implementedFeatures: [],
                symbols: {},
                health: {
                    hasTests: !1,
                    hasLinting: !1,
                    hasCi: !1,
                    hasReadme: !1
                },
                fileStats: {}
            }, _0x396e3b = {}, _0x3a4f68 = _0x4c221b_nUeXy(_0x275ec7, "package.json", _0x3971c6);
            if (_0x3a4f68) {
                try {
                    if (_0x4c221b_ErDpE("wBlfh", "WusRE")) {
                        const _0x406917 = JSON.parse(_0x3a4f68);
                        _0x4c221b_nUeXy(_0xe2e97c, _0x5458ee, _0x406917), _0x4c221b_slchy(_0xf548f7, _0x5458ee, _0x406917);
                    } else {
                        const _0xbcef7c = _0x4c221b_FZscs(_0x260551, _0x4b1d92);
                        delete _0xbcef7c.embedder, delete _0xbcef7c.embedderDetail;
                        const _0x4e3bbd = _0x30ea7f(_0x3235b0), _0x5a6e0f = {
                            recursive: !0
                        };
                        _0x46c86e.mkdirSync(_0x26219b.dirname(_0x4e3bbd), _0x5a6e0f), _0x2f6d25.writeFileSync(_0x4e3bbd, _0x5486d1.stringify(_0xbcef7c, null, 2));
                    }
                } catch {}
            }
            _0x5458ee.hasTypeScript = _0x701370.existsSync(_0xf9dcf5.join(_0x3971c6, "tsconfig.json"));
            const _0x56ae61 = {};
            _0x56ae61.structure = _0x396e3b, _0x56ae61.fileStats = _0x5458ee.fileStats, _0x1855c4(_0x56ae61, _0x3971c6, "", "thorough" === _0x1cd84a.depth ? 3 : 2), 
            _0x5458ee.summary.totalDirs = Object.keys(_0x396e3b).length, _0x5458ee.summary.totalFiles = Object.values(_0x396e3b).reduce(((_0x1db9ad, _0x563b29) => _0x1db9ad + (_0x563b29.fileCount || 0)), 0);
            const _0x18709f = _0x396e3b["."];
            if (_0x18709f) {
                if (!_0x4c221b_ghkhM("wTqCe", "wTqCe")) {
                    return (_0x589588 = _0x3e7275, _0xdeaf74 = [ "rev-parse", "--abbrev-ref", "HEAD" ], 
                    _0x194f16 = {
                        cwd: _0xa0cb44,
                        encoding: "utf8",
                        stdio: [ "pipe", "pipe", "pipe" ]
                    }, _0x589588("git", _0xdeaf74, _0x194f16)).trim();
                }
                _0x5458ee.topLevelDirs = _0x18709f.dirs || [];
            }
            var _0x589588, _0xdeaf74, _0x194f16;
            if (_0x4c221b_pNESB(_0x36b0e0, _0x5458ee, _0x3971c6), "thorough" === _0x1cd84a.depth) {
                const _0x307e26 = {
                    ..._0x5458ee
                };
                _0x307e26.structure = _0x396e3b, _0x4c221b_slchy(_0x251aaf, _0x307e26, _0x3971c6), 
                _0x5458ee.symbols = _0x521184(_0x3971c6, _0x5458ee.topLevelDirs);
            }
            const _0x3196eb = Object.entries(_0x5458ee.fileStats).sort(((_0x24053c, _0x46be30) => _0x46be30[1] - _0x24053c[1])).slice(0, 10);
            return _0x5458ee.fileStats = Object.fromEntries(_0x3196eb), _0x5458ee;
        }, _0x35e079.detectFrameworks = _0xe2e97c, _0x35e079.detectTestFramework = _0xf548f7, 
        _0x35e079.detectHealth = _0x36b0e0, _0x35e079.findImplementedFeatures = _0x251aaf, 
        _0x35e079.extractSymbols = _0x5db491, _0x35e079.scanFileSymbols = _0x521184, _0x35e079.scanDirectory = _0x1855c4, 
        _0x35e079.shouldExclude = function(_0x4a9b81, _0x1781ad = _0x381561) {
            return _0x4a9b81.split(/[\\/]/).some((_0x2b476a => _0x1781ad.includes(_0x2b476a)));
        }, _0x35e079.safeReadFile = _0x275ec7, _0x107589.exports = _0x35e079;
    }
}), require_version = __commonJS({
    "../work/agent-sh__agentsys/lib/binary/version.js"(_0x566902, _0x135b62) {
        const _0x4fa1a6 = {
            PATXP: "0|3|2|4|1",
            vqrKB: "agent-analyzer",
            vGpTO: "0.3.0",
            ZCFqi: "agent-sh/agent-analyzer"
        }, _0xac853e = _0x4fa1a6.PATXP.split("|");
        let _0x335ac4 = 0;
        for (;;) {
            switch (_0xac853e[_0x335ac4++]) {
              case "0":
                continue;

              case "1":
                const _0xaf214c = {};
                _0xaf214c.ANALYZER_MIN_VERSION = _0x1b022c, _0xaf214c.BINARY_NAME = _0x1edcff, _0xaf214c.GITHUB_REPO = _0x4a0d88, 
                _0x135b62.exports = _0xaf214c;
                continue;

              case "2":
                var _0x1edcff = _0x4fa1a6.vqrKB;
                continue;

              case "3":
                var _0x1b022c = _0x4fa1a6.vGpTO;
                continue;

              case "4":
                var _0x4a0d88 = _0x4fa1a6.ZCFqi;
                continue;
            }
            break;
        }
    }
}), require_binary = __commonJS({
    "../work/agent-sh__agentsys/lib/binary/index.js"(_0x197f67, _0x5783b3) {
        const _0x527584 = {
            jWnEw: function(_0x3d9a06, _0x4e5c85, _0x5d50fb) {
                return _0x3d9a06(_0x4e5c85, _0x5d50fb);
            },
            QIgrg: function(_0x4e0987, _0x4ac7f6, _0x4346de) {
                return _0x4e0987(_0x4ac7f6, _0x4346de);
            },
            OBIQl: function(_0x4c8626, _0x5cf790) {
                return _0x4c8626 === _0x5cf790;
            },
            MMHIX: "fFQlu",
            VHLVV: "jcqGl",
            zjoIM: function(_0x238f55, _0x17dd85) {
                return _0x238f55 === _0x17dd85;
            },
            hFBax: "win32",
            kODhV: ".exe",
            GZogd: ".agent-sh",
            LRKlK: "bin",
            egwLl: function(_0x42689a, _0x1c3ec3) {
                return _0x42689a + _0x1c3ec3;
            },
            VLxKH: "prs",
            dUmVi: function(_0x55dfe8, _0x23c0fb) {
                return _0x55dfe8 === _0x23c0fb;
            },
            HpXoG: "QdqMf",
            VgdXq: "lGgtK",
            GONOm: function(_0x109b7b, _0x545361) {
                return _0x109b7b + _0x545361;
            },
            lVfLv: function(_0x9cdf82, _0x37381f) {
                return _0x9cdf82 > _0x37381f;
            },
            qhPBy: function(_0x2d140b, _0x568189) {
                return _0x2d140b < _0x568189;
            },
            UOCjl: function(_0x50fc94, _0x239460) {
                return _0x50fc94 < _0x239460;
            },
            mulqN: function(_0x14be31, _0x2c766e) {
                return _0x14be31 >= _0x2c766e;
            },
            pNVAH: function(_0x36a9a4) {
                return _0x36a9a4();
            },
            tFnDk: function(_0x82129, _0x29427c) {
                return _0x82129 !== _0x29427c;
            },
            qtexx: "zxikR",
            MTDgt: "--version",
            MbkAi: "utf8",
            UdIBU: "pipe",
            gjqra: function(_0x46dd8f) {
                return _0x46dd8f();
            },
            BZXan: function(_0x1e5c17) {
                return _0x1e5c17();
            },
            TQrHT: function(_0x49eeb9) {
                return _0x49eeb9();
            },
            uVzPc: function(_0x3a2a01) {
                return _0x3a2a01();
            },
            lVTNU: "CfBtc",
            TkhRQ: function(_0xe1ddfd, _0x372c7c) {
                return _0xe1ddfd === _0x372c7c;
            },
            bQEzQ: ".zip",
            oTIAj: ".tar.gz",
            zybai: function(_0xdabcd9, _0x44e231) {
                return _0xdabcd9 + _0x44e231;
            },
            DuHKw: function(_0x12302b, _0x3e0f95) {
                return _0x12302b + _0x3e0f95;
            },
            LyDnJ: function(_0x32d569, _0xb2c780) {
                return _0x32d569 + _0xb2c780;
            },
            cGiBu: function(_0x762bac, _0x1b66d0) {
                return _0x762bac + _0x1b66d0;
            },
            uGIOM: function(_0x27cbc8, _0x13688) {
                return _0x27cbc8 + _0x13688;
            },
            PaEwu: "https://github.com/",
            PtymA: "/releases/download/v",
            Eiawi: function(_0x117e59, _0x1583df) {
                return _0x117e59 === _0x1583df;
            },
            cKMOT: function(_0x569b59, _0x2cae6b) {
                return _0x569b59 + _0x2cae6b;
            },
            ngijJ: "Refusing to extract archive with parent-traversal entry: ",
            atSQM: "PkhDG",
            aoZOH: "XanKR",
            YxkAr: function(_0x24210d, _0x3136a7) {
                return _0x24210d(_0x3136a7);
            },
            EnoxT: function(_0xc96521, _0x488d57) {
                return _0xc96521 > _0x488d57;
            },
            ePoJu: "QhkwE",
            IBBWx: "Too many redirects fetching from ",
            EVkxz: "agent-core/binary-resolver",
            oRpIf: "application/octet-stream",
            xhJLd: "Authorization",
            nGULY: "Bearer ",
            EEpMM: "error",
            xOmMo: function(_0x57bbae, _0x3f8d3a) {
                return _0x57bbae != _0x3f8d3a;
            },
            DmAtS: "--top",
            cmacK: function(_0x409e5e, _0x290a42, _0x3a8a66, _0x34fae5) {
                return _0x409e5e(_0x290a42, _0x3a8a66, _0x34fae5);
            },
            aCnMq: "hotspots",
            cyiIK: "zDXjd",
            CEMxT: function(_0x25de4e, _0x393810, _0x22bb50) {
                return _0x25de4e(_0x393810, _0x22bb50);
            },
            vGMMV: function(_0x39c21f, _0x3b10d0) {
                return _0x39c21f + _0x3b10d0;
            },
            nKUYc: " (rate limited - set GITHUB_TOKEN env var)",
            XhIMy: "HTTP ",
            nzKmu: " fetching ",
            tJpky: "data",
            TkocM: "end",
            Qsrns: function(_0x430aca, _0x57658a) {
                return _0x430aca(_0x57658a);
            },
            GZjsv: function(_0x5dbb3a, _0x4c7904) {
                return _0x5dbb3a + _0x4c7904;
            },
            YUHoq: "Timeout (",
            kenXp: "ms) fetching ",
            IXZMr: function(_0xdf2136, _0x3cfa83) {
                return _0xdf2136 === _0x3cfa83;
            },
            IDGRb: "FdfRR",
            YYNFf: "DDOag",
            xwXYC: function(_0x310e79, _0x1c3a20) {
                return _0x310e79 !== _0x1c3a20;
            },
            QOBnT: "string",
            CxZjD: function(_0x50d5d4, _0x48dadc) {
                return _0x50d5d4 || _0x48dadc;
            },
            JAywY: function(_0x4b86d8, _0x1ec9ba) {
                return _0x4b86d8 === _0x1ec9ba;
            },
            hvKFR: "vxPMn",
            QaVLV: "VZUCA",
            Dmtrp: "Could not parse SHA-256 digest from sidecar body",
            BQInc: "failed",
            rBJqh: function(_0x4655d3, _0x72a62c) {
                return _0x4655d3 + _0x72a62c;
            },
            JrZtS: " (AGENT_ANALYZER_REQUIRE_ATTESTATION=1)",
            RuowU: function(_0x194dde, _0xfb2847) {
                return _0x194dde !== _0xfb2847;
            },
            pAAVK: "NoFpi",
            AWZUU: "yNEBV",
            CKgQE: function(_0x1883cf, _0x2e7efc) {
                return _0x1883cf + _0x2e7efc;
            },
            LucyW: ".sha256",
            LtVjk: function(_0x2698a9, _0x480aea) {
                return _0x2698a9(_0x480aea);
            },
            ermRm: "parse",
            IBwXp: function(_0x197a8f, _0x36e0b2) {
                return _0x197a8f !== _0x36e0b2;
            },
            QtaMT: "ekUeF",
            vfGpt: "lpGQs",
            FBfRL: "sha256",
            CZZDa: "hex",
            enILc: function(_0xa35ed8, _0x287187) {
                return _0xa35ed8 + _0x287187;
            },
            ofJes: "zip extraction failed: ",
            shceB: "ppevu",
            jXhqX: function(_0x1096be, _0x433156) {
                return _0x1096be(_0x433156);
            },
            JLFUU: function(_0x11a473, _0x45f916) {
                return _0x11a473 || _0x45f916;
            },
            imYhc: function(_0x6d6b78, _0x59cc17) {
                return _0x6d6b78 + _0x59cc17;
            },
            WGzNR: "SHA-256 verification failed for ",
            iOEOv: ": expected ",
            bKOqh: ", got ",
            lUjfO: ". This could indicate a tampered release. Do not extract.",
            ZAlJL: function(_0x280811) {
                return _0x280811();
            },
            AHjFI: function(_0x573851, _0x40a8cd, _0x22fb42) {
                return _0x573851(_0x40a8cd, _0x22fb42);
            },
            RHigQ: function(_0x1e6b21, _0x319cc7, _0xe2bf0c) {
                return _0x1e6b21(_0x319cc7, _0xe2bf0c);
            },
            kJQBG: function(_0x4e39a1, _0x519be8) {
                return _0x4e39a1 + _0x519be8;
            },
            qqEZS: function(_0x5196ba, _0x10bec7) {
                return _0x5196ba + _0x10bec7;
            },
            UReGp: function(_0x59e099, _0x5e317d) {
                return _0x59e099 >= _0x5e317d;
            },
            fbmTK: function(_0x590eb9, _0xeaa41e) {
                return _0x590eb9 === _0xeaa41e;
            },
            CmFmW: "WKqpb",
            RlsJZ: function(_0x138e1d, _0x95f891) {
                return _0x138e1d !== _0x95f891;
            },
            tAmXi: "Refusing to extract archive with empty entry name",
            djptM: function(_0x36c1a6, _0x10c410) {
                return _0x36c1a6 === _0x10c410;
            },
            tNyLl: "lAoJd",
            GJPRO: "ZFUVE",
            fUmfv: function(_0x14b942, _0x2a6197) {
                return _0x14b942 + _0x2a6197;
            },
            GxzgU: "Refusing to extract archive with UNC entry: ",
            PktkG: function(_0x464d37, _0x42200c) {
                return _0x464d37 + _0x42200c;
            },
            sACJS: "Refusing to extract archive with absolute entry: ",
            GoGYa: "JOCgA",
            FCqQO: "omlUq",
            jEGwv: function(_0x2dabd2, _0x4a54e2) {
                return _0x2dabd2 + _0x4a54e2;
            },
            DHtql: "Refusing to extract archive with Windows absolute entry: ",
            CPBWO: function(_0x53f4e7, _0x42f772) {
                return _0x53f4e7 !== _0x42f772;
            },
            oeBkm: "zGVil",
            mpQpi: function(_0x512316, _0xd93409) {
                return _0x512316 === _0xd93409;
            },
            zBiJl: function(_0x64a5ce, _0x20a0d8) {
                return _0x64a5ce === _0x20a0d8;
            },
            sJLpj: "zYvOg",
            GYURi: function(_0x14e8ec, _0x28ba21) {
                return _0x14e8ec + _0x28ba21;
            },
            vaESp: "tar",
            ANUVv: "-tz",
            KiYCk: "close",
            miqsz: function(_0x25b4e7, _0x310240) {
                return _0x25b4e7 + _0x310240;
            },
            Fkrsb: "Failed to fetch SHA-256 sidecar for ",
            UsUfM: ":\n  URL: ",
            lTWQe: ".sha256\n  Error: ",
            TkMIl: "\n\nThe release may be missing its checksum file. Refusing to install an unverified binary. If this is a legacy release without sidecars, pass { skipChecksum: true } to downloadBinary() (LOCAL DEV ONLY).",
            otbhQ: function(_0x56082a, _0x1dc352) {
                return _0x56082a !== _0x1dc352;
            },
            zLpzF: "WXLHY",
            AVdQa: " exited ",
            vpTxK: "nAiSg",
            Mrqlz: "DfkCq",
            PlnKd: function(_0xee26e2, _0x3297f4) {
                return _0xee26e2 !== _0x3297f4;
            },
            Tddfn: function(_0x172a49, _0x2be4b3) {
                return _0x172a49 === _0x2be4b3;
            },
            qwWtP: "llAMv",
            LVNfO: function(_0x287bb6, _0x1fb83d) {
                return _0x287bb6(_0x1fb83d);
            },
            JBclY: "tar -tz listing failed (code ",
            WJAhd: "): ",
            Qnvlc: "[WARN] skipChecksum=true - SHA-256 verification disabled. This is LOCAL DEV ONLY and MUST NOT be used in production.\n",
            kKIru: "RzMpd",
            EFKqz: function(_0x565115, _0x5dbffb) {
                return _0x565115 + _0x5dbffb;
            },
            XXVpC: function(_0x24f6c6, _0x15af97) {
                return _0x24f6c6 !== _0x15af97;
            },
            nuhoz: function(_0x431109, _0x58df03) {
                return _0x431109 !== _0x58df03;
            },
            tjGdi: "EcThA",
            EynBV: "RVhzh",
            cyQaL: "Extracted path escapes extract root: ",
            pGsgm: function(_0x51168f, _0x394890) {
                return _0x51168f + _0x394890;
            },
            Oijjn: function(_0x141a58, _0x410635) {
                return _0x141a58 + _0x410635;
            },
            nFLNj: " was downloaded to ",
            dqsCI: " but could not be executed. Check the file is a valid binary for this platform.",
            RITMd: function(_0x247396, _0x4a0c39) {
                return _0x247396 + _0x4a0c39;
            },
            guAfv: function(_0x5e5304, _0x113710) {
                return _0x5e5304 + _0x113710;
            },
            xfbNp: function(_0x3bbce4, _0x31ee6c) {
                return _0x3bbce4 + _0x31ee6c;
            },
            bjcXl: "Unsupported platform: ",
            QCqHn: ". Supported: ",
            gvgSa: "koklB",
            seoFD: "uATce",
            EZyFM: "gDdRj",
            AfLLI: function(_0x1228b6, _0x4226b4) {
                return _0x1228b6 === _0x4226b4;
            },
            eqWAc: "GHGyb",
            nVUgT: "QCSWu",
            WKFfn: "Refusing to follow symlink produced by extractor: ",
            nQvrU: function(_0x38afeb, _0x23f1da) {
                return _0x38afeb < _0x23f1da;
            },
            Msjqk: "qJiim",
            bgKba: function(_0x4a47f5, _0x18a6c7, _0x39fa9f) {
                return _0x4a47f5(_0x18a6c7, _0x39fa9f);
            },
            xcOyw: function(_0x1ee856, _0x5ce199) {
                return _0x1ee856 === _0x5ce199;
            },
            LzICr: "Cmmwt",
            ajRHq: "tdhzy",
            rGsWS: function(_0x3f5ee5) {
                return _0x3f5ee5();
            },
            gQlSZ: "git",
            qnNvj: "rev-parse",
            dAnwk: "--abbrev-ref",
            ksOJs: "HEAD",
            vMKLN: function(_0x1fe628, _0x1f2cb4) {
                return _0x1fe628(_0x1f2cb4);
            },
            hBSPt: "require",
            CaFse: function(_0x26eb54, _0x9d08d2) {
                return _0x26eb54 !== _0x9d08d2;
            },
            rAQgb: "tar extraction failed (code ",
            lfHUv: "DpmMy",
            tXfyg: "uTutH",
            zRDCg: function(_0x18cff7, _0x56d52a) {
                return _0x18cff7 === _0x56d52a;
            },
            gjepr: "Xmlqq",
            EkLuc: "repo-map-module-not-found",
            mJkmg: "attestation",
            gPvNz: "verify",
            LRyev: "--repo",
            uhFgU: "--format",
            schbZ: "json",
            iAUGS: "ignore",
            QvKIU: function(_0x4c133a, _0x21b5ee) {
                return _0x4c133a || _0x21b5ee;
            },
            MgiTa: "number",
            sXuYg: function(_0x146ee8, _0x1c49e2) {
                return _0x146ee8(_0x1c49e2);
            },
            ZDfzz: function(_0x5f538e, _0x108334) {
                return _0x5f538e(_0x108334);
            },
            kakXi: function(_0x1f740d, _0x41d4e9) {
                return _0x1f740d !== _0x41d4e9;
            },
            PtqDc: "xCFlE",
            PaptP: function(_0xc4f621, _0x4140e8) {
                return _0xc4f621 < _0x4140e8;
            },
            wmDvP: "dygnc",
            RGFqO: "qIaPM",
            NivdE: "agent-analyzer-tar-",
            icdOK: function(_0x482f13, _0x4fd2ef) {
                return _0x482f13 !== _0x4fd2ef;
            },
            YxqgQ: "LwomH",
            TLTLw: function(_0x43628c, _0x4d7f9b) {
                return _0x43628c(_0x4d7f9b);
            },
            MeimR: function(_0xba8f00, _0x23cf31) {
                return _0xba8f00 < _0x23cf31;
            },
            VvWQF: "ihUeQ",
            VdpSE: function(_0x1b7539, _0x2bad2e, _0x27b5c9) {
                return _0x1b7539(_0x2bad2e, _0x27b5c9);
            },
            aFWbX: "fNreQ",
            hPCzN: "wYUSI",
            ROGKw: "agent-analyzer",
            PrjEQ: function(_0x512880, _0x4a803f) {
                return _0x512880 === _0x4a803f;
            },
            JVuzQ: "jtPPi",
            eQCii: function(_0x20f11c, _0x24b9e6) {
                return _0x20f11c(_0x24b9e6);
            },
            qkQpy: function(_0x4d5705, _0x21dcf7) {
                return _0x4d5705 + _0x21dcf7;
            },
            bPFNZ: "fdTDO",
            iHGAh: "powershell.exe",
            yAVtB: "-NoProfile",
            axefk: "-NonInteractive",
            uXXyS: "-ExecutionPolicy",
            KABcF: "Bypass",
            WuAdA: "-File",
            KxteF: function(_0x22aba8, _0x1cb945) {
                return _0x22aba8 + _0x1cb945;
            },
            gWZEP: function(_0x24c950, _0x4c88d8) {
                return _0x24c950 + _0x4c88d8;
            },
            pmSSH: function(_0x3f93eb, _0x2983e3) {
                return _0x3f93eb + _0x2983e3;
            },
            SHwez: function(_0x5c348d, _0xbda776) {
                return _0x5c348d + _0xbda776;
            },
            cFezA: "Failed to download ",
            GFYye: "\n  Error: ",
            gCcOP: "\n\nTo install manually:\n  1. Download: ",
            QkUfr: "\n  2. Extract the binary to: ",
            evVxI: "\n  3. Ensure it is named: ",
            dbGcA: function(_0x3fabfe, _0x1064a7, _0x1037d2, _0x6c9e0c) {
                return _0x3fabfe(_0x1064a7, _0x1037d2, _0x6c9e0c);
            },
            FCYuo: "auth",
            GkAEo: "status",
            MfayU: "agent-analyzer-zip-",
            lIkpG: "__archive.zip",
            JTHut: "agent-analyzer-ps-",
            mRCul: "extract.ps1",
            pzJqk: function(_0xff7919, _0x36e750) {
                return _0xff7919 !== _0x36e750;
            },
            vcAtg: "qixCi",
            CaFKr: function(_0x4c0b13, _0x8a02e1) {
                return _0x4c0b13(_0x8a02e1);
            },
            iqVvM: function(_0x5b467d, _0x1a92fc) {
                return _0x5b467d < _0x1a92fc;
            },
            KDtLd: "zIcoW",
            aRoEJ: function(_0x54b7bb, _0x4599d9) {
                return _0x54b7bb(_0x4599d9);
            },
            bzbQL: function(_0x22a21c, _0x890e27) {
                return _0x22a21c(_0x890e27);
            },
            QERYm: "Partial GitHub data collected",
            VGJqp: function(_0x3bb16d, _0x2e74a9) {
                return _0x3bb16d(_0x2e74a9);
            },
            vhsHr: "custom",
            iaCjx: ".opencode",
            cZZpU: "opencode",
            VDmJu: ".codex",
            LRMXB: "codex",
            LWfRk: ".claude",
            jFDbD: "claude",
            sfmWh: "unknown",
            umVOa: "tJocX",
            CUivL: "ZiRsx",
            idsHU: function(_0x559f03, _0x5f3575) {
                return _0x559f03 < _0x5f3575;
            },
            GoRXD: function(_0x5db8f1, _0x4c7f7c) {
                return _0x5db8f1 === _0x4c7f7c;
            },
            ByayW: "pRNfA",
            YxfiX: "LzHAY",
            NVMDo: "OYdjx",
            hHfhs: "lslpV",
            qyDCb: function(_0x1204db, _0x4fd04e) {
                return _0x1204db || _0x4fd04e;
            },
            DJRhb: "DtRTj",
            IHcke: function(_0x47210d, _0x1795a5) {
                return _0x47210d === _0x1795a5;
            },
            ceQJy: function(_0x3bb6fe, _0x52b66c) {
                return _0x3bb6fe(_0x52b66c);
            },
            kOCJG: function(_0x3500b8, _0x2c2310, _0x4372ac, _0x406413) {
                return _0x3500b8(_0x2c2310, _0x4372ac, _0x406413);
            },
            efhMF: "areas",
            mBeRJ: function(_0x323f03, _0x1c788e) {
                return _0x323f03 > _0x1c788e;
            },
            ErmTa: function(_0x501728, _0xc70142) {
                return _0x501728 + _0xc70142;
            },
            HqmEW: function(_0x5ba710, _0x436ff9) {
                return _0x5ba710 !== _0x436ff9;
            },
            smRDX: "yBCoQ",
            XAkxZ: "IWOXW",
            tswMZ: function(_0x1d5137, _0x2d9606) {
                return _0x1d5137 === _0x2d9606;
            },
            fORSF: "function",
            gXgwB: "KseNi",
            EgNuM: function(_0x13fc2f, _0xf6334c) {
                return _0x13fc2f !== _0xf6334c;
            },
            LRzya: "cLDcC",
            SIiiZ: function(_0x23c304) {
                return _0x23c304();
            },
            ebPcf: "OhiCj",
            IoyFm: "rezhA",
            StYQC: function(_0x4385dc, _0x47bf9e) {
                return _0x4385dc !== _0x47bf9e;
            },
            sPXTl: "HfdFy",
            ZihIH: "mKCVC",
            MRsrL: "UbMzp",
            itzpS: function(_0x510acc, _0x43bc4c) {
                return _0x510acc === _0x43bc4c;
            },
            aeJPB: "boolean",
            fuUsX: function(_0x55fc76, _0x2f48c8) {
                return _0x55fc76(_0x2f48c8);
            },
            TLSKF: "`gh` CLI not found on PATH",
            kZAaG: function(_0x392c9b, _0x55931b) {
                return _0x392c9b !== _0x55931b;
            },
            WlawZ: "OIycz",
            yMlYQ: "skipped",
            CcieE: function(_0xf583c4, _0x3a8cf9, _0x582f17) {
                return _0xf583c4(_0x3a8cf9, _0x582f17);
            },
            aLjMD: function(_0xce45f8, _0x51ee28) {
                return _0xce45f8 === _0x51ee28;
            },
            wqPHL: "mSSsU",
            NEUdY: "verified",
            zgetf: "gh attestation verify exited with status ",
            yHmJd: function(_0x2fd5bd, _0x52a46f) {
                return _0x2fd5bd !== _0x52a46f;
            },
            ocFHd: function(_0x35cb27, _0x41a302) {
                return _0x35cb27 + _0x41a302;
            },
            CpLle: function(_0x2afd48, _0x50f237) {
                return _0x2afd48 === _0x50f237;
            },
            TXqSU: function(_0x15bbab, _0x577244) {
                return _0x15bbab(_0x577244);
            },
            tlKLu: function(_0x2e7e95, _0xa78a1f) {
                return _0x2e7e95 + _0xa78a1f;
            },
            xRAhW: function(_0x4620a0, _0x239869) {
                return _0x4620a0 === _0x239869;
            },
            UfbGA: function(_0x57d78a) {
                return _0x57d78a();
            },
            gfcyK: "yVFdL",
            TKiPU: function(_0x3c2313, _0x365d72) {
                return _0x3c2313 + _0x365d72;
            },
            JNxSC: function(_0xb0650d, _0xad017a) {
                return _0xb0650d + _0xad017a;
            },
            tyAhL: ". Supported platforms: ",
            VbpEH: function(_0x1c2219, _0x5554de) {
                return _0x1c2219 + _0x5554de;
            },
            kQoQm: "Downloading ",
            VcfET: " for ",
            KMVIA: "...\n",
            wIHTF: "SeOwK",
            gdnru: function(_0x49e0b1, _0xde297a) {
                return _0x49e0b1 !== _0xde297a;
            },
            gYsGI: "iwdTv",
            WpCNM: function(_0x244604, _0x4a9cb5) {
                return _0x244604 + _0x4a9cb5;
            },
            DRmsl: function(_0x1a83de, _0xa249b) {
                return _0x1a83de + _0xa249b;
            },
            cfMEM: function(_0x4fa10f, _0x403ba4) {
                return _0x4fa10f + _0x403ba4;
            },
            AHWWs: function(_0x1a25fa, _0x73ab64) {
                return _0x1a25fa + _0x73ab64;
            },
            OJcJe: function(_0x5b8bd0, _0x1693b5) {
                return _0x5b8bd0 + _0x1693b5;
            },
            VtvzV: function(_0x5e4c2a, _0x4f02df) {
                return _0x5e4c2a + _0x4f02df;
            },
            XPqIm: function(_0x42a02d, _0x12b87a) {
                return _0x42a02d + _0x12b87a;
            },
            koNzB: function(_0x1ab33b, _0x5be84c) {
                return _0x1ab33b + _0x5be84c;
            },
            QABvr: "IdcoW",
            ioTzV: "jUshO",
            lrotP: function(_0x5594c2, _0x1cfe53) {
                return _0x5594c2 + _0x1cfe53;
            },
            fcUJb: function(_0x3803c7, _0x2fa895) {
                return _0x3803c7 + _0x2fa895;
            },
            cfAnO: function(_0x33aec6, _0x404ca1) {
                return _0x33aec6 + _0x404ca1;
            },
            vuwAa: function(_0x4a7f4b, _0x44076b) {
                return _0x4a7f4b + _0x44076b;
            },
            VrfEm: function(_0x62a9b1, _0x55f102, _0x42b4cb, _0xe981e3) {
                return _0x62a9b1(_0x55f102, _0x42b4cb, _0xe981e3);
            },
            TMQDG: "[WARN] skipAttestation=true - SLSA verification disabled. This is LOCAL DEV ONLY and MUST NOT be used in production.\n",
            MICey: "agent-analyzer-slsa-",
            lSwHh: function(_0x52e4c1, _0x581cc5, _0x23c600) {
                return _0x52e4c1(_0x581cc5, _0x23c600);
            },
            EVQMo: function(_0x42fec0, _0x34f468) {
                return _0x42fec0 === _0x34f468;
            },
            NtHhA: "tMmHB",
            wmhMy: function(_0x2acb90, _0x3921c0) {
                return _0x2acb90 + _0x3921c0;
            },
            hWest: "[OK] SLSA attestation verified for ",
            sIqLs: function(_0x767425, _0x4ba42f) {
                return _0x767425 === _0x4ba42f;
            },
            gNfUb: function(_0x3f3041, _0x1ab9c3) {
                return _0x3f3041 + _0x1ab9c3;
            },
            Bbdxi: "[WARN] SLSA attestation check skipped: ",
            WkkcC: ". Install the GitHub CLI (`gh`) to enable provenance verification. Set AGENT_ANALYZER_REQUIRE_ATTESTATION=1 to require it.\n",
            OfCFA: function(_0x13268f, _0x44334e) {
                return _0x13268f + _0x44334e;
            },
            sgAeg: function(_0x51f782, _0x549d82) {
                return _0x51f782 + _0x549d82;
            },
            CdjsA: function(_0x38edde, _0x310afb) {
                return _0x38edde + _0x310afb;
            },
            excIq: "SLSA attestation verification failed for ",
            AKaLp: ". Refusing to execute binary.",
            WoFxy: function(_0x428ae1, _0x54b769) {
                return _0x428ae1 + _0x54b769;
            },
            lvWDs: "\n--- gh stderr ---\n",
            iJwye: function(_0x2745b1, _0x590f80) {
                return _0x2745b1 === _0x590f80;
            },
            JXQZl: function(_0xb4e5fd, _0x44086f) {
                return _0xb4e5fd === _0x44086f;
            },
            pmhRp: "WIaie",
            Vdvab: "CgOJs",
            eAmlT: "oSXHT",
            urLSH: "phcuK",
            OQyzq: function(_0x434177, _0x16ebbc) {
                return _0x434177 !== _0x16ebbc;
            },
            OuaWd: "CeqKw",
            DFMgB: "IAPpd",
            pePaW: function(_0x17f3bf, _0x1d3a2b) {
                return _0x17f3bf + _0x1d3a2b;
            },
            ldOTS: function(_0x41fe55, _0x244ac1) {
                return _0x41fe55 + _0x244ac1;
            },
            fQiNX: function(_0x44c5e5, _0x3e9c40) {
                return _0x44c5e5 + _0x3e9c40;
            },
            SsZNa: 'Expected binary "',
            lfCnM: '" not found inside archive ',
            LNLdn: ". Archive layout may have changed.",
            hjZwh: function(_0x273886, _0x5f191e) {
                return _0x273886(_0x5f191e);
            },
            gVjla: function(_0x44c508, _0x555bb4) {
                return _0x44c508 !== _0x555bb4;
            },
            RUWou: function(_0x17a51b, _0x5d8d05) {
                return _0x17a51b !== _0x5d8d05;
            },
            cfwlK: "qnRrJ",
            JLarI: "shvru",
            rqZmN: "ewMoc",
            Cswby: "WjAhH",
            tTPIF: function(_0x2227c1, _0xe4d141) {
                return _0x2227c1 + _0xe4d141;
            },
            GdQSp: function(_0x42fb08, _0x20dbee) {
                return _0x42fb08 + _0x20dbee;
            },
            dzmsp: "README.md",
            UrHpC: ".eslintrc",
            VWtSN: ".eslintrc.js",
            IaNal: ".eslintrc.json",
            XqMCC: "eslint.config.js",
            gtzbc: "biome.json",
            CvcXO: ".github/workflows",
            FmgCD: ".gitlab-ci.yml",
            epNDi: ".circleci",
            EbWXc: "Jenkinsfile",
            rFVzN: ".travis.yml",
            oOqNk: "tests",
            VLUXn: "__tests__",
            KMmKh: "test",
            Kabwx: "spec",
            sUpVN: function(_0x20a76d) {
                return _0x20a76d();
            },
            cTGzH: function(_0x468280, _0x2484cd, _0x459d9d) {
                return _0x468280(_0x2484cd, _0x459d9d);
            },
            IACzG: function(_0x3162b2, _0x270100) {
                return _0x3162b2 === _0x270100;
            },
            SNVeX: "LItLW",
            xlpbD: function(_0x38862a, _0x679f90, _0x401a2f) {
                return _0x38862a(_0x679f90, _0x401a2f);
            },
            ZDRMY: function(_0x40f3c3, _0x1c1d02) {
                return _0x40f3c3 === _0x1c1d02;
            },
            LRPKt: function(_0x4cd671, _0x22d362, _0x5ea3de, _0x1f39fa) {
                return _0x4cd671(_0x22d362, _0x5ea3de, _0x1f39fa);
            },
            UrhIE: "log",
            JdpVF: "--oneline",
            glsUO: "-10",
            gmukJ: function(_0xc579c4, _0x33f414, _0x559acf, _0x1d5581) {
                return _0xc579c4(_0x33f414, _0x559acf, _0x1d5581);
            },
            GcCdl: "health",
            cCZLj: function(_0x461f11, _0x5a9a0c) {
                return _0x461f11 + _0x5a9a0c;
            },
            cKRBo: "Failed to parse repo-intel update output: ",
            OlyTT: function(_0x10d0c1, _0x3624ea, _0x2ecb33) {
                return _0x10d0c1(_0x3624ea, _0x2ecb33);
            },
            kVpqj: function(_0x50f068, _0x4d3206) {
                return _0x50f068 === _0x4d3206;
            },
            SGuCE: "ICjhS",
            dFfLB: "XVEuS",
            IwbzC: function(_0x28fc93, _0x2b780e) {
                return _0x28fc93 === _0x2b780e;
            },
            rCOyk: "VpnWv",
            jSahU: "BHRsj",
            qYxZj: "var b = require(",
            myPYH: "b.ensureBinary(",
            zzAwC: "  .then(function(p) { process.stdout.write(p); })",
            mswZL: "  .catch(function(e) { process.stderr.write(e.message); process.exit(1); });",
            laIIn: "inherit",
            kFjnV: "tqXJD",
            pezEq: "Failed to ensure binary (sync): ",
            CZAMk: function(_0x5f4632) {
                return _0x5f4632();
            },
            eoMof: function(_0x4af2f7, _0x4c5ab8) {
                return _0x4af2f7(_0x4c5ab8);
            },
            Xspao: "path",
            ivGVW: function(_0x212b76, _0x5d5b64) {
                return _0x212b76(_0x5d5b64);
            },
            ZqDpa: function(_0x1b9766, _0x9be26d) {
                return _0x1b9766(_0x9be26d);
            },
            rUOJD: "https",
            pDocM: "child_process",
            PeeMx: "crypto",
            FUTXi: function(_0x2371ee, _0x12547b) {
                return _0x2371ee(_0x12547b);
            },
            Aufhr: "util",
            nzMTf: function(_0x1e801d, _0x177eeb) {
                return _0x1e801d * _0x177eeb;
            },
            ASmRI: function(_0x586ab0) {
                return _0x586ab0();
            },
            sxtZh: "aarch64-apple-darwin",
            HHXxZ: "x86_64-apple-darwin",
            ifsiP: "x86_64-unknown-linux-gnu",
            GloLl: "aarch64-unknown-linux-gnu",
            YvJxq: "x86_64-pc-windows-msvc",
            PGybm: '$ErrorActionPreference = "Stop"',
            lCTDb: "$src  = $env:SRC_ZIP",
            xInJr: "$dest = $env:DEST_DIR",
            jVYdo: "if ([string]::IsNullOrEmpty($src) -or [string]::IsNullOrEmpty($dest)) {",
            UoUdW: '  [Console]::Error.WriteLine("SRC_ZIP and DEST_DIR must both be set"); exit 2',
            RdxSg: "Add-Type -AssemblyName System.IO.Compression.FileSystem",
            VWAnn: "$destFull = [System.IO.Path]::GetFullPath($dest)",
            aWfmB: "if (-not $destFull.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {",
            nIpgc: "  $destFull = $destFull + [System.IO.Path]::DirectorySeparatorChar",
            BhnUF: "$zip = [System.IO.Compression.ZipFile]::OpenRead($src)",
            tFxYg: "try {",
            EiRfm: "  foreach ($entry in $zip.Entries) {",
            riKzk: "    $name = $entry.FullName",
            ClQNu: "    if ([string]::IsNullOrEmpty($name)) { continue }",
            jHTJt: '    $norm = $name -replace "\\\\","/"',
            akEAj: '    if ($norm.StartsWith("/") -or $norm.StartsWith("//")) {',
            zigSd: '      [Console]::Error.WriteLine("Refusing absolute/UNC entry: " + $name); exit 3',
            QPaPv: "    }",
            JcAAZ: '    if ($name -match "^[A-Za-z]:[\\\\/]") {',
            WOIJa: '      [Console]::Error.WriteLine("Refusing Windows-absolute entry: " + $name); exit 3',
            Nsyim: '    foreach ($part in ($norm -split "/")) {',
            AJENx: '      if ($part -eq "..") {',
            IgGLh: '        [Console]::Error.WriteLine("Refusing parent-traversal entry: " + $name); exit 3',
            jyCOe: "      }",
            mGGlV: "    $target = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($destFull, $norm))",
            HsMWw: "    if (-not $target.StartsWith($destFull, [System.StringComparison]::OrdinalIgnoreCase)) {",
            zcCqP: '      [Console]::Error.WriteLine("Entry escapes destination: " + $name); exit 3',
            WYVVI: '    if ($entry.FullName.EndsWith("/")) {',
            JOkXE: "      [System.IO.Directory]::CreateDirectory($target) | Out-Null",
            uGUaS: "    } else {",
            LUWXf: "      $parent = [System.IO.Path]::GetDirectoryName($target)",
            XPsBC: "      if ($parent) { [System.IO.Directory]::CreateDirectory($parent) | Out-Null }",
            FHJSW: "      [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $target, $true)",
            kaLrk: "  }",
            hJhiV: "} finally {",
            yOpXp: "  $zip.Dispose()"
        };
        var _0x2985be = _0x527584.ZDfzz(require, "fs"), _0x30d82b = _0x527584.eoMof(require, _0x527584.Xspao), _0x2bfd59 = _0x527584.ivGVW(require, "os"), _0x572849 = _0x527584.ZqDpa(require, _0x527584.rUOJD), _0x57a654 = _0x527584.bzbQL(require, _0x527584.pDocM), _0x418160 = _0x527584.TXqSU(require, _0x527584.PeeMx), {promisify: _0x499bae} = _0x527584.FUTXi(require, _0x527584.Aufhr), _0x2bb30f = _0x527584.ZqDpa(_0x499bae, _0x57a654.execFile), _0x1b37c8 = _0x527584.nzMTf(_0x527584.nzMTf(256, 1024), 1024), {ANALYZER_MIN_VERSION: _0x1c879f, BINARY_NAME: _0x8f30b7, GITHUB_REPO: _0xbb0eb4} = _0x527584.ASmRI(require_version);
        const _0x26e8bc = {};
        _0x26e8bc["darwin-arm64"] = _0x527584.sxtZh, _0x26e8bc["darwin-x64"] = _0x527584.HHXxZ, 
        _0x26e8bc["linux-x64"] = _0x527584.ifsiP, _0x26e8bc["linux-arm64"] = _0x527584.GloLl, 
        _0x26e8bc["win32-x64"] = _0x527584.YvJxq;
        var _0xb91a14 = _0x26e8bc;
        function _0x1cd9eb() {
            if (!_0x527584.OBIQl(_0x527584.MMHIX, _0x527584.VHLVV)) {
                const _0x248bd7 = _0x527584.zjoIM(process.platform, _0x527584.hFBax) ? _0x527584.kODhV : "";
                return _0x30d82b.join(_0x2bfd59.homedir(), _0x527584.GZogd, _0x527584.LRKlK, _0x527584.egwLl(_0x8f30b7, _0x248bd7));
            }
            {
                const _0x245f37 = HGRDpb.uJryk(_0x252815, _0x4e8e40, _0x334fcb);
                if (_0x245f37) {
                    const _0x1ea18e = HGRDpb.eitfM(_0x4f8c3a, _0x245f37, _0x2c6bfd);
                    _0x153d6c.files[_0x117ce9] = _0x1ea18e, _0x457251.summary.totalWords += _0x1ea18e.wordCount, 
                    HGRDpb.oIRca(_0x36a528, _0xe597ab, _0x245f37), HGRDpb.uJryk(_0xf67ad5, _0x168b59, _0x245f37), 
                    HGRDpb.oIRca(_0x577c8a, _0x3d626d, _0x245f37);
                }
            }
        }
        function _0xfe7c47() {
            if (_0x527584.VLxKH, !_0x527584.dUmVi(_0x527584.HpXoG, _0x527584.VgdXq)) {
                const _0x37c50c = _0x527584.GONOm(_0x527584.GONOm(process.platform, "-"), process.arch);
                return _0xb91a14[_0x37c50c] || null;
            }
            {
                const _0x2877ae = {
                    source: IWRwUR.uXGYH,
                    ..._0x509f54.error
                };
                _0x2a246d.errors.push(_0x2877ae);
            }
        }
        function _0x34723f(_0x3ce9ba, _0x2fa52a) {
            if (!_0x3ce9ba) {
                return !1;
            }
            const _0x4d0f02 = _0x3ce9ba.match(/^(\d+)\.(\d+)\.(\d+)/);
            if (!_0x4d0f02) {
                return !1;
            }
            const _0x555f3d = _0x4d0f02.slice(1).map(Number), _0x2ed283 = _0x2fa52a.split(".").map(Number);
            return !!_0x527584.lVfLv(_0x555f3d[0], _0x2ed283[0]) || !_0x527584.qhPBy(_0x555f3d[0], _0x2ed283[0]) && (!!_0x527584.lVfLv(_0x555f3d[1], _0x2ed283[1]) || !_0x527584.UOCjl(_0x555f3d[1], _0x2ed283[1]) && _0x527584.mulqN(_0x555f3d[2], _0x2ed283[2]));
        }
        function _0x184edf() {
            const _0x3b2873 = _0x527584.pNVAH(_0x1cd9eb);
            if (!_0x2985be.existsSync(_0x3b2873)) {
                return null;
            }
            try {
                if (!_0x527584.tFnDk(_0x527584.qtexx, _0x527584.qtexx)) {
                    const _0x2650a3 = _0x57a654.execFileSync(_0x3b2873, [ _0x527584.MTDgt ], {
                        timeout: 5e3,
                        encoding: _0x527584.MbkAi,
                        stdio: [ _0x527584.UdIBU, _0x527584.UdIBU, _0x527584.UdIBU ],
                        windowsHide: !0
                    }), _0x519ef0 = _0x2650a3.trim().match(/(\d+\.\d+\.\d+)/);
                    return _0x519ef0 ? _0x519ef0[1] : _0x2650a3.trim();
                }
                _0x1e71dd.push(_0x30e887);
            } catch (_0x1c4dda) {
                return null;
            }
        }
        function _0x40dff3() {
            const _0x5278bd = _0x527584.gjqra(_0x1cd9eb);
            if (!_0x2985be.existsSync(_0x5278bd)) {
                return !1;
            }
            const _0xa61723 = _0x527584.BZXan(_0x184edf);
            return _0x527584.QIgrg(_0x34723f, _0xa61723, _0x1c879f);
        }
        function _0x3b7ac7(_0x21debf, _0x26a2a5) {
            if (!_0x527584.tFnDk(_0x527584.lVTNU, _0x527584.lVTNU)) {
                const _0xaa201d = _0x527584.TkhRQ(process.platform, _0x527584.hFBax) ? _0x527584.bQEzQ : _0x527584.oTIAj;
                return _0x527584.egwLl(_0x527584.zybai(_0x527584.DuHKw(_0x527584.LyDnJ(_0x527584.cGiBu(_0x527584.uGIOM(_0x527584.uGIOM(_0x527584.GONOm(_0x527584.PaEwu, _0xbb0eb4), _0x527584.PtymA), _0x21debf), "/"), _0x8f30b7), "-"), _0x26a2a5), _0xaa201d);
            }
            _0x527584.uVzPc(_0x18d0b4);
        }
        function _0x2e751b(_0x5e994a) {
            const _0x1c5b27 = {
                NMqIP: function(_0x8ad91a, _0x127864) {
                    return _0x527584.Eiawi(_0x8ad91a, _0x127864);
                },
                puEfX: function(_0x4ce763, _0x3dec75) {
                    return _0x527584.cKMOT(_0x4ce763, _0x3dec75);
                },
                gkWmP: _0x527584.ngijJ,
                qxciZ: function(_0x4a910c, _0x2fd761) {
                    return _0x527584.tFnDk(_0x4a910c, _0x2fd761);
                },
                KKWGZ: _0x527584.atSQM,
                pDuKL: _0x527584.aoZOH,
                RFUGx: function(_0x41ddc0, _0x18127e) {
                    return _0x527584.YxkAr(_0x41ddc0, _0x18127e);
                },
                BRsrR: function(_0x4521d6, _0x4cbed4) {
                    return _0x527584.EnoxT(_0x4521d6, _0x4cbed4);
                },
                ChUtq: _0x527584.ePoJu,
                SuLcl: _0x527584.IBBWx,
                wyWZg: _0x527584.EVkxz,
                FFmGv: _0x527584.oRpIf,
                mVmFo: _0x527584.xhJLd,
                XiWUL: _0x527584.nGULY,
                jzygk: _0x527584.EEpMM,
                vzQMk: function(_0x473f02, _0x3b7c87) {
                    return _0x527584.xOmMo(_0x473f02, _0x3b7c87);
                },
                MlQkT: _0x527584.DmAtS,
                tiNzC: function(_0x18e4a8, _0x531d01, _0x9a8880, _0x3a8a2f) {
                    return _0x527584.cmacK(_0x18e4a8, _0x531d01, _0x9a8880, _0x3a8a2f);
                },
                viDkt: _0x527584.aCnMq,
                gdkam: _0x527584.cyiIK,
                VEPLJ: function(_0x5d0965, _0x5dbfb6) {
                    return _0x527584.TkhRQ(_0x5d0965, _0x5dbfb6);
                },
                ugOAI: function(_0x5a2a02, _0xc83fd0) {
                    return _0x527584.OBIQl(_0x5a2a02, _0xc83fd0);
                },
                JMgiH: function(_0x664d, _0xc9d975, _0x1e36ad) {
                    return _0x527584.CEMxT(_0x664d, _0xc9d975, _0x1e36ad);
                },
                MoEhx: function(_0x32a8a7, _0x11762a) {
                    return _0x527584.vGMMV(_0x32a8a7, _0x11762a);
                },
                HpfSS: function(_0x28c06e, _0x2024c9) {
                    return _0x527584.zjoIM(_0x28c06e, _0x2024c9);
                },
                aTvET: _0x527584.nKUYc,
                AnSKi: _0x527584.XhIMy,
                lmwkE: _0x527584.nzKmu,
                bRIFx: _0x527584.tJpky,
                woIhG: _0x527584.TkocM
            };
            return new Promise((function(_0x4d0b2d, _0xa4f050) {
                const _0x5d2510 = {
                    fBZRZ: function(_0x2dca5f, _0x2cdecb) {
                        return _0x1c5b27.vzQMk(_0x2dca5f, _0x2cdecb);
                    },
                    jwylU: _0x1c5b27.MlQkT,
                    EvgRN: function(_0x5b50da, _0x47bd92) {
                        return _0x1c5b27.RFUGx(_0x5b50da, _0x47bd92);
                    },
                    WSJAA: function(_0x4b1bc0, _0x4a2ec8, _0x24e8e5, _0x58d18b) {
                        return _0x1c5b27.tiNzC(_0x4b1bc0, _0x4a2ec8, _0x24e8e5, _0x58d18b);
                    },
                    PofHI: _0x1c5b27.viDkt,
                    cRayW: function(_0x57fdcd, _0x35cdcb) {
                        return _0x1c5b27.qxciZ(_0x57fdcd, _0x35cdcb);
                    },
                    eWNhK: _0x1c5b27.gdkam,
                    QoUNT: function(_0xf9796b, _0x4a8485) {
                        return _0x1c5b27.VEPLJ(_0xf9796b, _0x4a8485);
                    },
                    mYgba: function(_0x45f3e3, _0x131f6a) {
                        return _0x1c5b27.ugOAI(_0x45f3e3, _0x131f6a);
                    },
                    rfOdG: function(_0x487022, _0x5d1d74, _0x1b0b17) {
                        return _0x1c5b27.JMgiH(_0x487022, _0x5d1d74, _0x1b0b17);
                    },
                    BwnxY: function(_0x48d6aa, _0x2e5aa1) {
                        return _0x1c5b27.MoEhx(_0x48d6aa, _0x2e5aa1);
                    },
                    fYqul: function(_0x314ddc, _0x1a8ad7) {
                        return _0x1c5b27.qxciZ(_0x314ddc, _0x1a8ad7);
                    },
                    fGCCS: function(_0x202401, _0x121bef) {
                        return _0x1c5b27.HpfSS(_0x202401, _0x121bef);
                    },
                    ZCNDo: _0x1c5b27.aTvET,
                    UnvXD: function(_0x9694a9, _0x44c03b) {
                        return _0x1c5b27.puEfX(_0x9694a9, _0x44c03b);
                    },
                    eZDBh: function(_0x5ed0b9, _0xaf857a) {
                        return _0x1c5b27.puEfX(_0x5ed0b9, _0xaf857a);
                    },
                    hNfhM: function(_0x4cda1e, _0x20892b) {
                        return _0x1c5b27.MoEhx(_0x4cda1e, _0x20892b);
                    },
                    efLQn: _0x1c5b27.AnSKi,
                    iTcrD: _0x1c5b27.lmwkE,
                    GNoqz: _0x1c5b27.bRIFx,
                    YStlI: _0x1c5b27.woIhG,
                    PFOPQ: _0x1c5b27.jzygk
                }, _0x3e4f0c = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
                _0x1c5b27.JMgiH((function _0x1440d8(_0x42274b, _0x3b95ca) {
                    const _0x54ca45 = {
                        IndsS: function(_0x1edd36, _0x5a9574) {
                            return _0x1c5b27.NMqIP(_0x1edd36, _0x5a9574);
                        },
                        PonxU: function(_0x497a39, _0x8be0a) {
                            return _0x1c5b27.puEfX(_0x497a39, _0x8be0a);
                        },
                        liMjv: _0x1c5b27.gkWmP,
                        XzFdL: function(_0x12038b, _0x3b38c8) {
                            return _0x1c5b27.qxciZ(_0x12038b, _0x3b38c8);
                        },
                        RhCSm: _0x1c5b27.KKWGZ,
                        UbQVW: _0x1c5b27.pDuKL,
                        BRsbC: function(_0x5025c8, _0x15646c) {
                            return _0x1c5b27.RFUGx(_0x5025c8, _0x15646c);
                        }
                    };
                    if (_0x1c5b27.BRsrR(_0x3b95ca, 5)) {
                        if (!_0x1c5b27.qxciZ(_0x1c5b27.ChUtq, _0x1c5b27.ChUtq)) {
                            return void _0x1c5b27.RFUGx(_0xa4f050, new Error(_0x1c5b27.puEfX(_0x1c5b27.SuLcl, _0x5e994a)));
                        }
                        _0xe1e14.implementedFeatures.push(_0x40fd65);
                    }
                    const _0x43bc67 = {};
                    _0x43bc67["User-Agent"] = _0x1c5b27.wyWZg, _0x43bc67.Accept = _0x1c5b27.FFmGv;
                    const _0x5722f6 = _0x43bc67;
                    _0x3e4f0c && (_0x5722f6[_0x1c5b27.mVmFo] = _0x1c5b27.puEfX(_0x1c5b27.XiWUL, _0x3e4f0c));
                    const _0x485192 = {};
                    _0x485192.headers = _0x5722f6, _0x572849.get(_0x42274b, _0x485192, (function(_0x49df6a) {
                        const _0x688f42 = {
                            vlHJD: function(_0x53edf0, _0x234bfc) {
                                return _0x5d2510.fBZRZ(_0x53edf0, _0x234bfc);
                            },
                            NzbWv: _0x5d2510.jwylU,
                            iOjRo: function(_0x29be5b, _0x2df6a7) {
                                return _0x5d2510.EvgRN(_0x29be5b, _0x2df6a7);
                            },
                            yKToG: function(_0x52c580, _0x1b5f16, _0x145d90, _0x222432) {
                                return _0x5d2510.WSJAA(_0x52c580, _0x1b5f16, _0x145d90, _0x222432);
                            },
                            TNgwH: _0x5d2510.PofHI
                        };
                        if (_0x5d2510.cRayW(_0x5d2510.eWNhK, _0x5d2510.eWNhK)) {
                            const _0x399596 = [];
                            return _0x688f42.vlHJD(_0x3b05ad.limit, null) && _0x399596.push(_0x688f42.NzbWv, _0x688f42.iOjRo(_0x367f7c, _0x492bd0.limit)), 
                            _0x688f42.yKToG(_0x394813, _0x688f42.TNgwH, _0x399596, _0x1b2bf6);
                        }
                        {
                            const _0x196ac5 = _0x49df6a.statusCode;
                            if (_0x5d2510.QoUNT(_0x196ac5, 301) || _0x5d2510.mYgba(_0x196ac5, 302) || _0x5d2510.QoUNT(_0x196ac5, 307) || _0x5d2510.mYgba(_0x196ac5, 308)) {
                                return _0x49df6a.resume(), void _0x5d2510.rfOdG(_0x1440d8, _0x49df6a.headers.location, _0x5d2510.BwnxY(_0x3b95ca, 1));
                            }
                            if (_0x5d2510.fYqul(_0x196ac5, 200)) {
                                _0x49df6a.resume();
                                const _0x47169a = _0x5d2510.fGCCS(_0x196ac5, 403) ? _0x5d2510.ZCNDo : "";
                                return void _0x5d2510.EvgRN(_0xa4f050, new Error(_0x5d2510.BwnxY(_0x5d2510.UnvXD(_0x5d2510.eZDBh(_0x5d2510.hNfhM(_0x5d2510.efLQn, _0x196ac5), _0x47169a), _0x5d2510.iTcrD), _0x42274b)));
                            }
                            const _0x578e43 = [];
                            _0x49df6a.on(_0x5d2510.GNoqz, (function(_0x113a10) {
                                const _0x4e1126 = {
                                    arsIE: function(_0x55e9ff, _0x3386ff) {
                                        return _0x54ca45.IndsS(_0x55e9ff, _0x3386ff);
                                    },
                                    LBBFf: function(_0x378a74, _0x2bb7eb) {
                                        return _0x54ca45.PonxU(_0x378a74, _0x2bb7eb);
                                    },
                                    JZOwV: _0x54ca45.liMjv
                                };
                                if (_0x54ca45.XzFdL(_0x54ca45.RhCSm, _0x54ca45.RhCSm)) {
                                    if (_0x4e1126.arsIE(_0x28240e[_0xc8bba5], "..")) {
                                        throw new _0x3470e6(_0x4e1126.LBBFf(_0x4e1126.JZOwV, _0x2f8508));
                                    }
                                } else {
                                    _0x578e43.push(_0x113a10);
                                }
                            })), _0x49df6a.on(_0x5d2510.YStlI, (function() {
                                if (!_0x54ca45.IndsS(_0x54ca45.UbQVW, _0x54ca45.UbQVW)) {
                                    return !0;
                                }
                                _0x54ca45.BRsbC(_0x4d0b2d, Buffer.concat(_0x578e43));
                            })), _0x49df6a.on(_0x5d2510.PFOPQ, _0xa4f050);
                        }
                    })).on(_0x1c5b27.jzygk, _0xa4f050);
                }), _0x5e994a, 0);
            }));
        }
        function _0x1ab2d9(_0x45e957) {
            if (!_0x527584.IXZMr(_0x527584.IDGRb, _0x527584.YYNFf)) {
                _0x527584.xwXYC(typeof _0x45e957, _0x527584.QOBnT) && (_0x45e957 = _0x527584.YxkAr(String, _0x527584.CxZjD(_0x45e957, "")));
                const _0x55f24a = _0x45e957.trim().match(/^([A-Fa-f0-9]{64})\b/);
                if (!_0x55f24a) {
                    if (!_0x527584.JAywY(_0x527584.hvKFR, _0x527584.QaVLV)) {
                        throw new Error(_0x527584.Dmtrp);
                    }
                    _0x1c6e9b.destroy(), _0x527584.Qsrns(_0x330642, new _0x420c5e(_0x527584.vGMMV(_0x527584.GZjsv(_0x527584.zybai(_0x527584.YUHoq, _0x2b111d), _0x527584.kenXp), _0x1dd313)));
                }
                return _0x55f24a[1].toLowerCase();
            }
            _0x24e837.push(_0x484d1b.join(_0x1151e3, _0x5d147e[_0x977e8c]));
        }
        async function _0x40440e(_0x38cbcb) {
            const _0x186f82 = {
                IgkHt: _0x527584.BQInc,
                AyJTZ: function(_0x5dddf6, _0x454e85) {
                    return _0x527584.rBJqh(_0x5dddf6, _0x454e85);
                },
                aPQRZ: _0x527584.JrZtS
            };
            if (_0x527584.RuowU(_0x527584.pAAVK, _0x527584.AWZUU)) {
                const _0x54ee00 = _0x527584.CKgQE(_0x38cbcb, _0x527584.LucyW), _0x96d3c = await _0x527584.LtVjk(_0x2e751b, _0x54ee00);
                return _0x527584.LtVjk(_0x1ab2d9, _0x96d3c.toString(_0x527584.MbkAi));
            }
            return {
                status: _0x186f82.IgkHt,
                reason: _0x186f82.AyJTZ(_0x5236ef, _0x186f82.aPQRZ)
            };
        }
        function _0x11d2a8(_0x35bff4) {
            return _0x527584.ermRm, _0x527584.IBwXp(_0x527584.QtaMT, _0x527584.vfGpt) ? _0x418160.createHash(_0x527584.FBfRL).update(_0x35bff4).digest(_0x527584.CZZDa) : {
                ok: !1,
                error: {
                    type: oEsoaC.lmhlT,
                    message: "Failed to parse gh output as JSON: " + _0x16a509.message,
                    raw: _0x5c8bbb.slice(0, 500)
                }
            };
        }
        function _0x50fb3c(_0x588bed, _0x10f665, _0x46ddc5) {
            const _0x4a9f6a = {
                wkZbK: function(_0x5b8709, _0x485487) {
                    return _0x527584.Qsrns(_0x5b8709, _0x485487);
                },
                VUgOQ: function(_0x1ad1fe, _0x590ff3) {
                    return _0x527584.enILc(_0x1ad1fe, _0x590ff3);
                },
                tjmXJ: _0x527584.ofJes
            };
            if (_0x527584.RuowU(_0x527584.shceB, _0x527584.shceB)) {
                _0x4a9f6a.wkZbK(_0x5050d6, new _0x26d3cc(_0x4a9f6a.VUgOQ(_0x4a9f6a.tjmXJ, _0x3594c9 || _0x28ab80.message)));
            } else {
                const _0x341939 = _0x527584.jXhqX(String, _0x527584.JLFUU(_0x10f665, "")).toLowerCase(), _0x1c1a58 = _0x527584.jXhqX(_0x11d2a8, _0x588bed);
                if (_0x527584.IBwXp(_0x341939, _0x1c1a58)) {
                    throw new Error(_0x527584.imYhc(_0x527584.egwLl(_0x527584.CKgQE(_0x527584.cKMOT(_0x527584.cGiBu(_0x527584.DuHKw(_0x527584.WGzNR, _0x46ddc5), _0x527584.iOEOv), _0x341939), _0x527584.bKOqh), _0x1c1a58), _0x527584.lUjfO));
                }
            }
        }
        function _0x38c307(_0x153da4) {
            if (!_0x527584.fbmTK(_0x527584.CmFmW, _0x527584.CmFmW)) {
                if (!_0x115b44) {
                    return !1;
                }
                const _0x5a10a9 = _0x2652c4.match(/^(\d+)\.(\d+)\.(\d+)/);
                if (!_0x5a10a9) {
                    return !1;
                }
                const _0x1b11ad = _0x5a10a9.slice(1).map(_0x398ffb), _0x3b2399 = _0x115773.split(".").map(_0xa94b5d);
                return !!CxOKkr.Twhib(_0x1b11ad[0], _0x3b2399[0]) || !CxOKkr.cSbmZ(_0x1b11ad[0], _0x3b2399[0]) && (!!CxOKkr.yBuVq(_0x1b11ad[1], _0x3b2399[1]) || !CxOKkr.mMVKh(_0x1b11ad[1], _0x3b2399[1]) && CxOKkr.ycMZE(_0x1b11ad[2], _0x3b2399[2]));
            }
            {
                if (!_0x153da4 || _0x527584.RlsJZ(typeof _0x153da4, _0x527584.QOBnT)) {
                    throw new Error(_0x527584.tAmXi);
                }
                const _0x1f6cb6 = _0x153da4.replace(/\\/g, "/").trim();
                if (_0x527584.djptM(_0x1f6cb6.length, 0)) {
                    if (_0x527584.IBwXp(_0x527584.tNyLl, _0x527584.GJPRO)) {
                        throw new Error(_0x527584.tAmXi);
                    }
                    _0x36d677 = (_0x27beb1 = _0x375085, _0x527584.ZAlJL(_0x27beb1));
                }
                if (_0x1f6cb6.startsWith("//")) {
                    throw new Error(_0x527584.fUmfv(_0x527584.GxzgU, _0x153da4));
                }
                if (_0x1f6cb6.startsWith("/")) {
                    throw new Error(_0x527584.PktkG(_0x527584.sACJS, _0x153da4));
                }
                if (/^[A-Za-z]:[\\/]/.test(_0x153da4)) {
                    if (!_0x527584.Eiawi(_0x527584.GoGYa, _0x527584.FCqQO)) {
                        throw new Error(_0x527584.jEGwv(_0x527584.DHtql, _0x153da4));
                    }
                    {
                        _0x237fb6 = _0x24a838, _0x458ee7 = _0x438ee2, _0x527584.jXhqX(_0x237fb6, _0x458ee7);
                        const _0x4e2457 = (_0x567212 = _0x53845d, _0x219650 = _0x222134, _0x527584.YxkAr(_0x567212, _0x219650)), _0xd5d166 = {
                            ..._0x5e9169,
                            updated: (new _0x556060).toISOString()
                        };
                        _0x1c1988 = _0x790cd3, _0x21d40b = _0x4e2457, _0x268090 = _0xd5d166, _0x527584.AHjFI(_0x1c1988, _0x21d40b, _0x268090), 
                        _0x4e6d30 = _0x16a129, _0x509a29 = _0x3671f5, _0x527584.YxkAr(_0x4e6d30, _0x509a29);
                    }
                }
                const _0x1c07cc = _0x1f6cb6.split("/").filter((function(_0x4043e4) {
                    return _0x1e78e2 = _0x4043e4.length, _0x527584.lVfLv(_0x1e78e2, 0);
                    var _0x1e78e2;
                }));
                for (let _0x229524 = 0; _0x527584.qhPBy(_0x229524, _0x1c07cc.length); _0x229524++) {
                    if (_0x527584.CPBWO(_0x527584.oeBkm, _0x527584.oeBkm)) {
                        _0xb3aa3[_0x76fff7] = (_0x3ff361 = _0x2d4798, _0x992860 = _0x29345c, _0x31c5d6 = _0x1f5abe, 
                        _0x527584.RHigQ(_0x3ff361, _0x992860, _0x31c5d6));
                        const _0x3cb5b6 = _0x9057d[_0xbbf52e].symbols;
                        _0x194fa0 += (_0x360f26 = _0x3cb5b6.functions.length, _0x38f51c = _0x3cb5b6.classes.length, 
                        _0x579bb7 = _0x527584.qqEZS(_0x360f26, _0x38f51c), _0x23f714 = _0x3cb5b6.types.length, 
                        _0x240ade = _0x527584.egwLl(_0x579bb7, _0x23f714), _0x5337ee = _0x3cb5b6.constants.length, 
                        _0x527584.kJQBG(_0x240ade, _0x5337ee)), _0x106ea9 += _0x5c2a93[_0x4ca1ee].imports.length;
                    } else if (_0x527584.mpQpi(_0x1c07cc[_0x229524], "..")) {
                        if (_0x527584.zBiJl(_0x527584.sJLpj, _0x527584.sJLpj)) {
                            throw new Error(_0x527584.GYURi(_0x527584.ngijJ, _0x153da4));
                        }
                        _0x5e9ac1.add(_0x2f1aba + ":" + _0x279718.name);
                    }
                }
            }
            var _0x240ade, _0x5337ee, _0x579bb7, _0x23f714, _0x360f26, _0x38f51c, _0x3ff361, _0x992860, _0x31c5d6, _0x4e6d30, _0x509a29, _0x1c1988, _0x21d40b, _0x268090, _0x567212, _0x219650, _0x237fb6, _0x458ee7, _0x27beb1;
        }
        function _0x4699c8(_0x11f880) {
            const _0x47ca62 = {
                amhYA: function(_0xfac45d, _0x37edad) {
                    return _0x527584.LyDnJ(_0xfac45d, _0x37edad);
                },
                yMVCB: function(_0x1a0b18, _0x245cb4) {
                    return _0x527584.egwLl(_0x1a0b18, _0x245cb4);
                },
                EAIlE: function(_0x1dda40, _0x57275f) {
                    return _0x527584.miqsz(_0x1dda40, _0x57275f);
                },
                zlKba: _0x527584.Fkrsb,
                FxQyB: _0x527584.UsUfM,
                RQpdh: _0x527584.lTWQe,
                OYaOK: _0x527584.TkMIl,
                HGwZz: function(_0x484f24, _0x3d8a93) {
                    return _0x527584.otbhQ(_0x484f24, _0x3d8a93);
                },
                jSMzq: _0x527584.zLpzF,
                gKltB: function(_0x59df2a, _0x1d162e) {
                    return _0x527584.jXhqX(_0x59df2a, _0x1d162e);
                },
                KXqPP: _0x527584.AVdQa,
                CCFye: function(_0x17559b, _0x37def8) {
                    return _0x527584.dUmVi(_0x17559b, _0x37def8);
                },
                WpNjc: _0x527584.vpTxK,
                aOQDz: function(_0x229328, _0x292f60) {
                    return _0x527584.lVfLv(_0x229328, _0x292f60);
                },
                ymxAG: _0x527584.Mrqlz,
                HqrJD: function(_0xd37847, _0x373793) {
                    return _0x527584.PlnKd(_0xd37847, _0x373793);
                },
                WBXLe: function(_0x300a31, _0x43d4d5) {
                    return _0x527584.Tddfn(_0x300a31, _0x43d4d5);
                },
                xwDFr: _0x527584.qwWtP,
                WtEdo: function(_0x35fe62, _0x18668f) {
                    return _0x527584.LVNfO(_0x35fe62, _0x18668f);
                },
                nIKSJ: function(_0x1ac578, _0x3517c2) {
                    return _0x527584.zybai(_0x1ac578, _0x3517c2);
                },
                ZeUVP: _0x527584.JBclY,
                NvvcF: _0x527584.WJAhd,
                fWEQq: function(_0x47af74, _0x3f9fb2) {
                    return _0x527584.LtVjk(_0x47af74, _0x3f9fb2);
                }
            };
            return new Promise((function(_0x130fb2, _0x2819ad) {
                const _0x421e67 = _0x57a654.spawn(_0x527584.vaESp, [ _0x527584.ANUVv ], {
                    stdio: [ _0x527584.UdIBU, _0x527584.UdIBU, _0x527584.UdIBU ]
                });
                let _0x31d855 = "", _0x10397e = "";
                _0x421e67.stdout.on(_0x527584.tJpky, (function(_0x2b5b1a) {
                    const _0x1aadd0 = {
                        rYNlB: function(_0x400ec9, _0x1ba08a) {
                            return _0x47ca62.amhYA(_0x400ec9, _0x1ba08a);
                        },
                        QZjdd: function(_0x32d12c, _0x260354) {
                            return _0x47ca62.yMVCB(_0x32d12c, _0x260354);
                        },
                        GAwWS: function(_0x658be6, _0x1a411d) {
                            return _0x47ca62.EAIlE(_0x658be6, _0x1a411d);
                        },
                        eTKgg: function(_0xa9270a, _0x578ada) {
                            return _0x47ca62.amhYA(_0xa9270a, _0x578ada);
                        },
                        bpAci: function(_0x59870b, _0x14fc0d) {
                            return _0x47ca62.EAIlE(_0x59870b, _0x14fc0d);
                        },
                        tJBeu: _0x47ca62.zlKba,
                        jHJjV: _0x47ca62.FxQyB,
                        UFnwV: _0x47ca62.RQpdh,
                        kPQef: _0x47ca62.OYaOK
                    };
                    if (_0x47ca62.HGwZz(_0x47ca62.jSMzq, _0x47ca62.jSMzq)) {
                        throw new _0x21d751(_0x1aadd0.rYNlB(_0x1aadd0.QZjdd(_0x1aadd0.GAwWS(_0x1aadd0.eTKgg(_0x1aadd0.bpAci(_0x1aadd0.QZjdd(_0x1aadd0.tJBeu, _0x420bc5), _0x1aadd0.jHJjV), _0x283373), _0x1aadd0.UFnwV), _0xe9403c.message), _0x1aadd0.kPQef));
                    }
                    _0x31d855 += _0x2b5b1a;
                })), _0x421e67.stderr.on(_0x527584.tJpky, (function(_0x516668) {
                    _0x10397e += _0x516668;
                })), _0x421e67.on(_0x527584.EEpMM, _0x2819ad), _0x421e67.on(_0x527584.KiYCk, (function(_0x63b0e0) {
                    const _0x4fb5e9 = {
                        eSlDE: function(_0x5217e2, _0xe693d7) {
                            return _0x47ca62.gKltB(_0x5217e2, _0xe693d7);
                        },
                        JMaKK: function(_0x4fcb44, _0x3d1267) {
                            return _0x47ca62.EAIlE(_0x4fcb44, _0x3d1267);
                        },
                        kJqQP: _0x47ca62.KXqPP,
                        ciAZj: function(_0x5d6e1e, _0x2dca51) {
                            return _0x47ca62.EAIlE(_0x5d6e1e, _0x2dca51);
                        },
                        meFhy: function(_0x8d8a6f, _0x196fe8) {
                            return _0x47ca62.CCFye(_0x8d8a6f, _0x196fe8);
                        },
                        glIdK: _0x47ca62.WpNjc,
                        EUMVx: function(_0x49e2d6, _0xafa3) {
                            return _0x47ca62.aOQDz(_0x49e2d6, _0xafa3);
                        }
                    };
                    if (_0x47ca62.HGwZz(_0x47ca62.ymxAG, _0x47ca62.ymxAG)) {
                        _0x400958.docs = _0x4c770d.analyzeDocumentation(_0x12540f);
                    } else {
                        if (_0x47ca62.HqrJD(_0x63b0e0, 0)) {
                            return _0x47ca62.WBXLe(_0x47ca62.xwDFr, _0x47ca62.xwDFr) ? void _0x47ca62.WtEdo(_0x2819ad, new Error(_0x47ca62.amhYA(_0x47ca62.EAIlE(_0x47ca62.nIKSJ(_0x47ca62.ZeUVP, _0x63b0e0), _0x47ca62.NvvcF), _0x10397e))) : _0x4fb5e9.eSlDE(_0x447709, new _0x3d6011(_0x4fb5e9.JMaKK(_0x4fb5e9.JMaKK(_0x4fb5e9.JMaKK(_0x3acfd9.EMBED_BINARY_NAME, _0x4fb5e9.kJqQP), _0xb413e4), _0x352bb1.trim() ? _0x4fb5e9.ciAZj(": ", _0x267ff3.trim().slice(0, 500)) : "")));
                        }
                        const _0xfdbd9 = _0x31d855.split(/\r?\n/).filter((function(_0x1f7299) {
                            if (_0x4fb5e9.meFhy(_0x4fb5e9.glIdK, _0x4fb5e9.glIdK)) {
                                return _0x4fb5e9.EUMVx(_0x1f7299.length, 0);
                            }
                            try {
                                return _0x19e2d4.statSync(_0x4bd5c4).isDirectory();
                            } catch {
                                return !1;
                            }
                        }));
                        _0x47ca62.fWEQq(_0x130fb2, _0xfdbd9);
                    }
                })), _0x421e67.stdin.write(_0x11f880), _0x421e67.stdin.end();
            }));
        }
        function _0x31f08d(_0x334f6d, _0x29400a) {
            const _0x292134 = {};
            _0x292134.ytFti = _0x527584.Qnvlc;
            const _0x36b922 = _0x292134;
            if (_0x527584.otbhQ(_0x527584.kKIru, _0x527584.kKIru)) {
                _0x13b215.stderr.write(_0x36b922.ytFti);
            } else {
                const _0x1b5ab5 = _0x527584.EFKqz(_0x30d82b.resolve(_0x334f6d), _0x30d82b.sep), _0x4ed34c = _0x30d82b.resolve(_0x29400a);
                if (_0x527584.XXVpC(_0x4ed34c, _0x30d82b.resolve(_0x334f6d)) && !_0x4ed34c.startsWith(_0x1b5ab5)) {
                    if (_0x527584.nuhoz(_0x527584.tjGdi, _0x527584.EynBV)) {
                        throw new Error(_0x527584.qqEZS(_0x527584.cyQaL, _0x29400a));
                    }
                    if (_0x163d46.includes("/" + _0x44f51c + "/") || _0x4f71a6.includes("\\" + _0x26bcb4 + "\\")) {
                        return !0;
                    }
                }
            }
        }
        function _0x43ad61(_0x2ffa79) {
            if (_0x527584.Eiawi(_0x527584.gvgSa, _0x527584.seoFD)) {
                return !1;
            }
            {
                const _0x2a5f9d = [], _0x4fc831 = [ _0x2ffa79 ];
                for (;_0x527584.lVfLv(_0x4fc831.length, 0); ) {
                    if (_0x527584.djptM(_0x527584.EZyFM, _0x527584.EZyFM)) {
                        const _0x21b859 = _0x4fc831.pop(), _0x55e602 = _0x2985be.lstatSync(_0x21b859);
                        if (_0x55e602.isSymbolicLink()) {
                            throw _0x527584.AfLLI(_0x527584.eqWAc, _0x527584.nVUgT) ? new _0x17e625(_0x527584.GONOm(_0x527584.pGsgm(_0x527584.Oijjn(_0x3aaa72, _0x527584.nFLNj), _0x25e7af), _0x527584.dqsCI)) : new Error(_0x527584.LyDnJ(_0x527584.WKFfn, _0x21b859));
                        }
                        if (_0x55e602.isDirectory()) {
                            const _0xc8ebda = _0x2985be.readdirSync(_0x21b859);
                            for (let _0x4fa940 = 0; _0x527584.nQvrU(_0x4fa940, _0xc8ebda.length); _0x4fa940++) {
                                if (_0x527584.RuowU(_0x527584.Msjqk, _0x527584.Msjqk)) {
                                    throw new _0x1a45f2(_0x527584.RITMd(_0x527584.GZjsv(_0x527584.jEGwv(_0x527584.guAfv(_0x527584.xfbNp(_0x527584.bjcXl, _0x2d62c3.platform), "-"), _0x1ebd7a.arch), _0x527584.QCqHn), _0x2f6249.keys(_0x163ba1).join(", ")));
                                }
                                _0x4fc831.push(_0x30d82b.join(_0x21b859, _0xc8ebda[_0x4fa940]));
                            }
                        } else {
                            _0x55e602.isFile() && _0x2a5f9d.push(_0x21b859);
                        }
                    } else {
                        _0x49ddf2.chmodSync(_0x1bc89f, 493);
                    }
                }
                return _0x2a5f9d;
            }
        }
        function _0x4c1777(_0x1f22e2) {
            if (_0x527584.xcOyw(_0x527584.LzICr, _0x527584.ajRHq)) {
                _0x527584.bgKba(_0x218304, _0x3788c3, _0x2ca35f[_0x542110]);
            } else {
                try {
                    const _0xc03db4 = {
                        recursive: !0,
                        force: !0
                    };
                    _0x2985be.rmSync(_0x1f22e2, _0xc03db4);
                } catch (_0x5764b7) {}
            }
        }
        async function _0x14410c(_0x27a570) {
            const _0x5f14fb = {
                OJXzH: function(_0x488375, _0x687a73, _0x539b5c, _0x223277) {
                    return _0x527584.cmacK(_0x488375, _0x687a73, _0x539b5c, _0x223277);
                },
                vtBnN: _0x527584.gQlSZ,
                jMODl: _0x527584.qnNvj,
                GovQl: _0x527584.dAnwk,
                QIfgM: _0x527584.ksOJs,
                DfkcY: _0x527584.MbkAi,
                lImDW: function(_0x507154, _0x40b5fb) {
                    return _0x527584.vMKLN(_0x507154, _0x40b5fb);
                },
                YMYvO: _0x527584.hBSPt,
                eFyPD: function(_0x5c6a3f, _0x1264c3) {
                    return _0x527584.CaFse(_0x5c6a3f, _0x1264c3);
                },
                CxYVE: function(_0x53cc84, _0x4f0a28) {
                    return _0x527584.LtVjk(_0x53cc84, _0x4f0a28);
                },
                mGyJb: function(_0x421325, _0x5da360) {
                    return _0x527584.enILc(_0x421325, _0x5da360);
                },
                IztKV: _0x527584.rAQgb,
                pvdje: _0x527584.WJAhd,
                gwbkv: _0x527584.lfHUv,
                YSGeF: _0x527584.tXfyg,
                NaMpI: function(_0x16a373) {
                    return _0x527584.pNVAH(_0x16a373);
                },
                QbDDS: function(_0x2c0082, _0x1e0161) {
                    return _0x527584.zRDCg(_0x2c0082, _0x1e0161);
                },
                jjqpg: _0x527584.gjepr,
                JNOuK: _0x527584.vaESp,
                zXczo: _0x527584.UdIBU,
                LmxJZ: _0x527584.tJpky,
                VGwSR: _0x527584.EEpMM,
                axuaE: _0x527584.KiYCk,
                gZCjq: _0x527584.EkLuc,
                IzxGx: _0x527584.mJkmg,
                QtxBS: _0x527584.gPvNz,
                JTpHd: _0x527584.LRyev,
                SpTlX: _0x527584.uhFgU,
                Ulvdf: _0x527584.schbZ,
                jfETk: _0x527584.iAUGS,
                XWLbm: function(_0x38885e, _0x3c2aa6) {
                    return _0x527584.QvKIU(_0x38885e, _0x3c2aa6);
                },
                TIDzy: _0x527584.MgiTa,
                ldKbG: function(_0x69af7b, _0x3f9de4) {
                    return _0x527584.sXuYg(_0x69af7b, _0x3f9de4);
                },
                iMNUC: function(_0x2f1160, _0x333771) {
                    return _0x527584.ZDfzz(_0x2f1160, _0x333771);
                }
            };
            if (_0x527584.kakXi(_0x527584.PtqDc, _0x527584.PtqDc)) {
                return _0x527584.rGsWS(_0x1307ee);
            }
            {
                const _0x1c6838 = await _0x527584.jXhqX(_0x4699c8, _0x27a570);
                for (let _0x3b8443 = 0; _0x527584.PaptP(_0x3b8443, _0x1c6838.length); _0x3b8443++) {
                    _0x527584.RlsJZ(_0x527584.wmDvP, _0x527584.RGFqO) ? _0x527584.LtVjk(_0x38c307, _0x1c6838[_0x3b8443]) : _0x8afc96 = _0x5f14fb.OJXzH(_0x4c62d1, _0x5f14fb.vtBnN, [ _0x5f14fb.jMODl, _0x5f14fb.GovQl, _0x5f14fb.QIfgM ], {
                        cwd: _0x2528ce,
                        encoding: _0x5f14fb.DfkcY
                    }).trim();
                }
                const _0x579776 = _0x2985be.mkdtempSync(_0x30d82b.join(_0x2bfd59.tmpdir(), _0x527584.NivdE));
                try {
                    if (_0x527584.icdOK(_0x527584.YxqgQ, _0x527584.YxqgQ)) {
                        const _0xd7ac2b = _0x5f14fb.lImDW(_0x3c25d8, _0x545009.path);
                        _0xd7ac2b && _0x4d4c17.add(_0xd7ac2b), _0x52793e.name && _0xd7ac2b && _0x31bb4b.add(_0xd7ac2b + ":" + _0x494f2c.name);
                    } else {
                        await new Promise((function(_0x4eec08, _0x56428f) {
                            const _0x34f38b = {
                                pKVXp: function(_0x4a48c9, _0x2b1738) {
                                    return _0x5f14fb.QbDDS(_0x4a48c9, _0x2b1738);
                                },
                                MIeyX: _0x5f14fb.jjqpg
                            }, _0x4aae81 = _0x57a654.spawn(_0x5f14fb.JNOuK, [ "xz", "-C", _0x579776 ], {
                                stdio: [ _0x5f14fb.zXczo, _0x5f14fb.zXczo, _0x5f14fb.zXczo ]
                            });
                            let _0x46ec8a = "";
                            _0x4aae81.stderr.on(_0x5f14fb.LmxJZ, (function(_0x272c64) {
                                if (!_0x34f38b.pKVXp(_0x34f38b.MIeyX, _0x34f38b.MIeyX)) {
                                    return null;
                                }
                                _0x46ec8a += _0x272c64;
                            })), _0x4aae81.on(_0x5f14fb.VGwSR, _0x56428f), _0x4aae81.on(_0x5f14fb.axuaE, (function(_0x596bc2) {
                                const _0x3c8de3 = {};
                                _0x3c8de3.PNDFt = _0x5f14fb.YMYvO;
                                const _0xe6258f = _0x3c8de3;
                                _0x5f14fb.eFyPD(_0x596bc2, 0) ? _0x5f14fb.CxYVE(_0x56428f, new Error(_0x5f14fb.mGyJb(_0x5f14fb.mGyJb(_0x5f14fb.mGyJb(_0x5f14fb.IztKV, _0x596bc2), _0x5f14fb.pvdje), _0x46ec8a))) : _0x5f14fb.eFyPD(_0x5f14fb.gwbkv, _0x5f14fb.YSGeF) ? _0x5f14fb.NaMpI(_0x4eec08) : _0x1460d7.push(_0xe6258f.PNDFt);
                            })), _0x4aae81.stdin.write(_0x27a570), _0x4aae81.stdin.end();
                        }));
                        const _0x42c05b = _0x527584.TLTLw(_0x43ad61, _0x579776);
                        for (let _0x1e46c4 = 0; _0x527584.MeimR(_0x1e46c4, _0x42c05b.length); _0x1e46c4++) {
                            if (!_0x527584.AfLLI(_0x527584.VvWQF, _0x527584.VvWQF)) {
                                const _0x375930 = {
                                    available: !1,
                                    map: null
                                };
                                return _0x375930.fallbackReason = _0x5f14fb.gZCjq, _0x375930;
                            }
                            _0x527584.VdpSE(_0x31f08d, _0x579776, _0x42c05b[_0x1e46c4]);
                        }
                    }
                } catch (_0x4a8f81) {
                    if (!_0x527584.Eiawi(_0x527584.aFWbX, _0x527584.hPCzN)) {
                        throw _0x527584.YxkAr(_0x4c1777, _0x579776), _0x4a8f81;
                    }
                    try {
                        const _0x2b18de = _0x348835.execFileSync("gh", [ _0x5f14fb.IzxGx, _0x5f14fb.QtxBS, _0x574f74, _0x5f14fb.JTpHd, _0x134bf5, _0x5f14fb.SpTlX, _0x5f14fb.Ulvdf ], {
                            encoding: _0x5f14fb.DfkcY,
                            stdio: [ _0x5f14fb.jfETk, _0x5f14fb.zXczo, _0x5f14fb.zXczo ],
                            timeout: 6e4,
                            windowsHide: !0
                        });
                        return {
                            status: 0,
                            stdout: _0x5f14fb.XWLbm(_0x2b18de, ""),
                            stderr: ""
                        };
                    } catch (_0x56d42c) {
                        return {
                            status: _0x5f14fb.QbDDS(typeof _0x56d42c.status, _0x5f14fb.TIDzy) ? _0x56d42c.status : null,
                            stdout: _0x56d42c.stdout ? _0x5f14fb.ldKbG(_0x5d0499, _0x56d42c.stdout) : "",
                            stderr: _0x56d42c.stderr ? _0x5f14fb.iMNUC(_0x59be36, _0x56d42c.stderr) : _0x56d42c.message || ""
                        };
                    }
                }
                return _0x579776;
            }
        }
        var _0x5efa56 = [ _0x527584.PGybm, _0x527584.lCTDb, _0x527584.xInJr, _0x527584.jVYdo, _0x527584.UoUdW, "}", _0x527584.RdxSg, _0x527584.VWAnn, _0x527584.aWfmB, _0x527584.nIpgc, "}", _0x527584.BhnUF, _0x527584.tFxYg, _0x527584.EiRfm, _0x527584.riKzk, _0x527584.ClQNu, _0x527584.jHTJt, _0x527584.akEAj, _0x527584.zigSd, _0x527584.QPaPv, _0x527584.JcAAZ, _0x527584.WOIJa, _0x527584.QPaPv, _0x527584.Nsyim, _0x527584.AJENx, _0x527584.IgGLh, _0x527584.jyCOe, _0x527584.QPaPv, _0x527584.mGGlV, _0x527584.HsMWw, _0x527584.zcCqP, _0x527584.QPaPv, _0x527584.WYVVI, _0x527584.JOkXE, _0x527584.uGUaS, _0x527584.LUWXf, _0x527584.XPsBC, _0x527584.FHJSW, _0x527584.QPaPv, _0x527584.kaLrk, _0x527584.hJhiV, _0x527584.yOpXp, "}" ].join("\r\n");
        async function _0x209f8f(_0x4411d1) {
            const _0x4b18e9 = _0x2985be.mkdtempSync(_0x30d82b.join(_0x2bfd59.tmpdir(), _0x527584.MfayU)), _0x1d5fed = _0x30d82b.join(_0x4b18e9, _0x527584.lIkpG), _0x125481 = _0x2985be.mkdtempSync(_0x30d82b.join(_0x2bfd59.tmpdir(), _0x527584.JTHut)), _0x4ec6e2 = _0x30d82b.join(_0x125481, _0x527584.mRCul);
            try {
                _0x2985be.writeFileSync(_0x1d5fed, _0x4411d1), _0x2985be.writeFileSync(_0x4ec6e2, _0x5efa56, _0x527584.MbkAi), 
                await new Promise((function(_0x25ce02, _0xfbc23a) {
                    const _0x594eee = {
                        bjEfS: _0x527584.ROGKw,
                        QxAbu: function(_0x4efb34, _0x484732) {
                            return _0x527584.PrjEQ(_0x4efb34, _0x484732);
                        },
                        xwkKh: _0x527584.JVuzQ,
                        nDKNN: function(_0x3d2af3, _0x4402a8) {
                            return _0x527584.eQCii(_0x3d2af3, _0x4402a8);
                        },
                        URaRZ: function(_0x2d1fc9, _0x173190) {
                            return _0x527584.qkQpy(_0x2d1fc9, _0x173190);
                        },
                        akVUF: _0x527584.ofJes,
                        AWXVP: function(_0x1a85e1) {
                            return _0x527584.pNVAH(_0x1a85e1);
                        }
                    };
                    if (_0x527584.PlnKd(_0x527584.bPFNZ, _0x527584.bPFNZ)) {
                        const _0x263e94 = {
                            found: !1
                        };
                        return _0x263e94.error = _0x2027b6.message, _0x263e94.tool = _0x594eee.bjEfS, _0x263e94;
                    }
                    {
                        const _0x37462e = {};
                        _0x37462e.SRC_ZIP = _0x1d5fed, _0x37462e.DEST_DIR = _0x4b18e9;
                        const _0x3ee97e = _0x57a654.execFile(_0x527584.iHGAh, [ _0x527584.yAVtB, _0x527584.axefk, _0x527584.uXXyS, _0x527584.KABcF, _0x527584.WuAdA, _0x4ec6e2 ], {
                            windowsHide: !0,
                            env: Object.assign({}, process.env, _0x37462e)
                        }, (function(_0x553a93, _0x21c479, _0xba0ea1) {
                            if (_0x553a93) {
                                if (!_0x594eee.QxAbu(_0x594eee.xwkKh, _0x594eee.xwkKh)) {
                                    return _0x12764a;
                                }
                                _0x594eee.nDKNN(_0xfbc23a, new Error(_0x594eee.URaRZ(_0x594eee.akVUF, _0xba0ea1 || _0x553a93.message)));
                            } else {
                                _0x594eee.AWXVP(_0x25ce02);
                            }
                        }));
                        _0x3ee97e.stdin && _0x3ee97e.stdin.end();
                    }
                }));
                try {
                    if (_0x527584.pzJqk(_0x527584.vcAtg, _0x527584.vcAtg)) {
                        throw new _0x50abd4(_0x527584.KxteF(_0x527584.gWZEP(_0x527584.pmSSH(_0x527584.Oijjn(_0x527584.qqEZS(_0x527584.miqsz(_0x527584.DuHKw(_0x527584.SHwez(_0x527584.LyDnJ(_0x527584.qqEZS(_0x527584.xfbNp(_0x527584.cFezA, _0x3ff88c), _0x527584.UsUfM), _0x18a90a), _0x527584.GFYye), _0x4610a6.message), _0x527584.gCcOP), _0x43d4e8), _0x527584.QkUfr), _0x551a08), _0x527584.evVxI), _0x4e295f.basename(_0x1ff603)));
                    }
                    _0x2985be.unlinkSync(_0x1d5fed);
                } catch (_0x557c49) {}
                const _0x1eb850 = _0x527584.CaFKr(_0x43ad61, _0x4b18e9);
                for (let _0x1dbd36 = 0; _0x527584.iqVvM(_0x1dbd36, _0x1eb850.length); _0x1dbd36++) {
                    if (!_0x527584.TkhRQ(_0x527584.KDtLd, _0x527584.KDtLd)) {
                        return eQMdhn.dbGcA(_0x1fed91, "gh", [ eQMdhn.FCYuo, eQMdhn.GkAEo ], {
                            encoding: eQMdhn.MbkAi,
                            stdio: eQMdhn.UdIBU,
                            timeout: 5e3
                        }), !0;
                    }
                    _0x527584.RHigQ(_0x31f08d, _0x4b18e9, _0x1eb850[_0x1dbd36]);
                }
            } catch (_0x549bc4) {
                throw _0x527584.aRoEJ(_0x4c1777, _0x4b18e9), _0x549bc4;
            } finally {
                _0x527584.bzbQL(_0x4c1777, _0x125481);
            }
            return _0x4b18e9;
        }
        function _0x1718b2(_0xe142f5, _0x44d95f) {
            const _0xc472dc = {
                YumHK: _0x527584.QERYm,
                Hezqy: function(_0x448ae1, _0x3631cf) {
                    return _0x527584.VGJqp(_0x448ae1, _0x3631cf);
                },
                GcyOP: _0x527584.vhsHr,
                Ytoqb: _0x527584.iaCjx,
                yNUaj: _0x527584.cZZpU,
                DiBXc: _0x527584.VDmJu,
                DQqgX: _0x527584.LRMXB,
                Tvmpw: _0x527584.LWfRk,
                BcNut: _0x527584.jFDbD,
                yxrFy: _0x527584.sfmWh
            };
            if (!_0x527584.dUmVi(_0x527584.umVOa, _0x527584.CUivL)) {
                const _0x598d22 = _0x527584.vMKLN(_0x43ad61, _0xe142f5);
                for (let _0x36bb74 = 0; _0x527584.idsHU(_0x36bb74, _0x598d22.length); _0x36bb74++) {
                    if (_0x527584.GoRXD(_0x527584.ByayW, _0x527584.YxfiX)) {
                        _0x42313f.unlinkSync(_0x3fd957);
                    } else if (_0x527584.Eiawi(_0x30d82b.basename(_0x598d22[_0x36bb74]), _0x44d95f)) {
                        if (_0x527584.Tddfn(_0x527584.NVMDo, _0x527584.NVMDo)) {
                            return _0x527584.CEMxT(_0x31f08d, _0xe142f5, _0x598d22[_0x36bb74]), _0x598d22[_0x36bb74];
                        }
                        {
                            const _0x262968 = _0xc472dc.Hezqy(_0x11d845, _0x60e3f1);
                            if (_0x112b47.env.AI_STATE_DIR) {
                                return _0xc472dc.GcyOP;
                            }
                            switch (_0x262968) {
                              case _0xc472dc.Ytoqb:
                                return _0xc472dc.yNUaj;

                              case _0xc472dc.DiBXc:
                                return _0xc472dc.DQqgX;

                              case _0xc472dc.Tvmpw:
                                return _0xc472dc.BcNut;

                              default:
                                return _0xc472dc.yxrFy;
                            }
                        }
                    }
                }
                return null;
            }
            _0xeba48d.error = VPXaST.YumHK;
        }
        function _0x5e483e(_0x125106, _0x2e327a) {
            if (_0x527584.xwXYC(_0x527584.hHfhs, _0x527584.hHfhs)) {
                return _0xb291d3 = _0x24a7b7, _0x527584.pNVAH(_0xb291d3);
            }
            var _0xb291d3;
            try {
                const _0x57d29d = _0x57a654.execFileSync("gh", [ _0x527584.mJkmg, _0x527584.gPvNz, _0x125106, _0x527584.LRyev, _0x2e327a, _0x527584.uhFgU, _0x527584.schbZ ], {
                    encoding: _0x527584.MbkAi,
                    stdio: [ _0x527584.iAUGS, _0x527584.UdIBU, _0x527584.UdIBU ],
                    timeout: 6e4,
                    windowsHide: !0
                });
                return {
                    status: 0,
                    stdout: _0x527584.qyDCb(_0x57d29d, ""),
                    stderr: ""
                };
            } catch (_0x2be86a) {
                return _0x527584.icdOK(_0x527584.DJRhb, _0x527584.DJRhb) ? (_0x55ea16.execFileSync("gh", [ _0x527584.MTDgt ], {
                    stdio: _0x527584.iAUGS,
                    timeout: 5e3,
                    windowsHide: !0
                }), !0) : {
                    status: _0x527584.IHcke(typeof _0x2be86a.status, _0x527584.MgiTa) ? _0x2be86a.status : null,
                    stdout: _0x2be86a.stdout ? _0x527584.ZDfzz(String, _0x2be86a.stdout) : "",
                    stderr: _0x2be86a.stderr ? _0x527584.ceQJy(String, _0x2be86a.stderr) : _0x2be86a.message || ""
                };
            }
        }
        function _0x22809c(_0x2e0b73) {
            const _0x51c07e = {
                esbXF: function(_0x46e3d1, _0x32f071) {
                    return _0x527584.mBeRJ(_0x46e3d1, _0x32f071);
                },
                fbpYU: function(_0x4bb6ba, _0x385bd3) {
                    return _0x527584.ErmTa(_0x4bb6ba, _0x385bd3);
                },
                Uyagq: function(_0x564e24, _0x4671b4) {
                    return _0x527584.jXhqX(_0x564e24, _0x4671b4);
                },
                DKSuH: function(_0x1d9e43, _0x83abef) {
                    return _0x527584.HqmEW(_0x1d9e43, _0x83abef);
                },
                RDadb: _0x527584.sfmWh
            };
            if (_0x527584.TkhRQ(_0x527584.smRDX, _0x527584.XAkxZ)) {
                QPSzsh.esbXF(_0x71f014.length, 3) && !_0x540ca9.has(_0x10e41d) && (_0xfc60a8[_0x1790f5] = QPSzsh.fbpYU(_0x1719c4[_0x328d83] || 0, 1));
            } else {
                if (_0x527584.tswMZ(typeof _0x2e0b73, _0x527584.fORSF)) {
                    if (_0x527584.RlsJZ(_0x527584.gXgwB, _0x527584.gXgwB)) {
                        const _0x1e763b = _0x51c07e.Uyagq(_0x25a5e0, _0x2f4b79);
                        _0x51c07e.DKSuH(_0x1e763b, _0x51c07e.RDadb) && _0x370d42.add(_0x1e763b);
                    } else {
                        try {
                            return _0x527584.EgNuM(_0x527584.LRzya, _0x527584.LRzya) ? _0x527584.kOCJG(_0x4d5785, _0x527584.efhMF, [], _0xa89b7a) : !!_0x527584.SIiiZ(_0x2e0b73);
                        } catch (_0x3df2c4) {
                            return !1;
                        }
                    }
                }
                try {
                    if (!_0x527584.AfLLI(_0x527584.ebPcf, _0x527584.IoyFm)) {
                        return _0x57a654.execFileSync("gh", [ _0x527584.MTDgt ], {
                            stdio: _0x527584.iAUGS,
                            timeout: 5e3,
                            windowsHide: !0
                        }), !0;
                    }
                    _0x5c05b0.docsPatterns = _0x94152.collect(_0x4aaea1);
                } catch (_0x267374) {
                    if (_0x527584.StYQC(_0x527584.sPXTl, _0x527584.ZihIH)) {
                        return !1;
                    }
                    _0x5b4898 = _0x12628b.files[_0x51c07e.fbpYU("./", _0xacea1e)];
                }
            }
        }
        function _0x2ecd35(_0x57ca8e, _0x51ccde) {
            if (!_0x527584.PlnKd(_0x527584.MRsrL, _0x527584.MRsrL)) {
                const _0x43609c = _0x527584.JLFUU(_0x51ccde, {}), _0x139f1e = _0x43609c.repo || _0xbb0eb4, _0x24ee06 = _0x527584.itzpS(typeof _0x43609c.ghRunner, _0x527584.fORSF) ? _0x43609c.ghRunner : _0x5e483e, _0x265678 = _0x527584.zRDCg(typeof _0x43609c.requireAttestation, _0x527584.aeJPB) ? _0x43609c.requireAttestation : _0x527584.IXZMr(process.env.AGENT_ANALYZER_REQUIRE_ATTESTATION, "1");
                if (!_0x527584.fuUsX(_0x22809c, _0x43609c.ghProbe)) {
                    const _0x3a6c5d = _0x527584.TLSKF;
                    if (_0x265678) {
                        if (!_0x527584.kZAaG(_0x527584.WlawZ, _0x527584.WlawZ)) {
                            return {
                                status: _0x527584.BQInc,
                                reason: _0x527584.miqsz(_0x3a6c5d, _0x527584.JrZtS)
                            };
                        }
                        _0x25ce38.categorized.other.push(_0x3638c2);
                    }
                    const _0x1dc29f = {};
                    return _0x1dc29f.status = _0x527584.yMlYQ, _0x1dc29f.reason = _0x3a6c5d, _0x1dc29f;
                }
                const _0x2f9613 = _0x527584.CcieE(_0x24ee06, _0x57ca8e, _0x139f1e);
                if (_0x2f9613 && _0x527584.aLjMD(_0x2f9613.status, 0)) {
                    if (_0x527584.OBIQl(_0x527584.wqPHL, _0x527584.wqPHL)) {
                        const _0x48bdf0 = {};
                        return _0x48bdf0.status = _0x527584.NEUdY, _0x48bdf0;
                    }
                    throw new _0x401a44(_0x527584.qkQpy(_0x527584.WKFfn, _0x1ed28d));
                }
                return {
                    status: _0x527584.BQInc,
                    reason: _0x527584.RITMd(_0x527584.zgetf, _0x2f9613 && _0x527584.yHmJd(_0x2f9613.status, null) ? _0x2f9613.status : _0x527584.sfmWh),
                    stderr: _0x2f9613 && _0x2f9613.stderr || ""
                };
            }
            _0x2e8ade.topLevelDirs = _0x17aeed.dirs || [];
        }
        async function _0x886cd3(_0x37be8f, _0x2aea37) {
            const _0x26d58f = {
                ITeZa: function(_0x118cae, _0xcf7e52) {
                    return _0x527584.TXqSU(_0x118cae, _0xcf7e52);
                },
                qTSfp: _0x527584.iaCjx,
                fZdnB: function(_0x3dfeb5, _0x51d9cd) {
                    return _0x527584.tlKLu(_0x3dfeb5, _0x51d9cd);
                }
            }, _0x1b3551 = _0x527584.qyDCb(_0x2aea37, {}), _0xa308c8 = _0x527584.OBIQl(_0x1b3551.skipChecksum, !0), _0x2bba3c = _0x527584.xRAhW(_0x1b3551.skipAttestation, !0), _0x5b1aa8 = _0x527584.UfbGA(_0xfe7c47);
            if (!_0x5b1aa8) {
                if (_0x527584.nuhoz(_0x527584.gfcyK, _0x527584.gfcyK)) {
                    const _0x156155 = _0x26d58f.ITeZa(_0x4e44c6, _0x1f0a6e);
                    return _0x38be7e.includes(_0x156155.embedder);
                }
                throw new Error(_0x527584.PktkG(_0x527584.TKiPU(_0x527584.JNxSC(_0x527584.enILc(_0x527584.ocFHd(_0x527584.bjcXl, process.platform), "-"), process.arch), _0x527584.tyAhL), Object.keys(_0xb91a14).join(", ")));
            }
            const _0x5d965a = _0x527584.QIgrg(_0x3b7ac7, _0x37be8f, _0x5b1aa8), _0x2395d0 = _0x5d965a.substring(_0x527584.jEGwv(_0x5d965a.lastIndexOf("/"), 1));
            process.stderr.write(_0x527584.DuHKw(_0x527584.VbpEH(_0x527584.CKgQE(_0x527584.EFKqz(_0x527584.pGsgm(_0x527584.vGMMV(_0x527584.kQoQm, _0x8f30b7), " v"), _0x37be8f), _0x527584.VcfET), _0x5b1aa8), _0x527584.KMVIA));
            const _0x4bdab0 = _0x527584.SIiiZ(_0x1cd9eb), _0x480a29 = _0x30d82b.dirname(_0x4bdab0), _0x1da3ff = {};
            let _0x245137;
            _0x1da3ff.recursive = !0, _0x2985be.mkdirSync(_0x480a29, _0x1da3ff);
            try {
                _0x527584.djptM(_0x527584.wIHTF, _0x527584.wIHTF) ? _0x245137 = await _0x527584.ceQJy(_0x2e751b, _0x5d965a) : _0x145bd6.reason = _0x46955e + " commits behind HEAD";
            } catch (_0x35461c) {
                if (_0x527584.gdnru(_0x527584.gYsGI, _0x527584.gYsGI)) {
                    return _0x13d4d4.set(_0x5539f8, _0x26d58f.qTSfp), _0x26d58f.qTSfp;
                }
                throw new Error(_0x527584.enILc(_0x527584.fUmfv(_0x527584.WpCNM(_0x527584.DRmsl(_0x527584.cfMEM(_0x527584.AHWWs(_0x527584.TKiPU(_0x527584.OJcJe(_0x527584.VtvzV(_0x527584.XPqIm(_0x527584.koNzB(_0x527584.cFezA, _0x8f30b7), _0x527584.UsUfM), _0x5d965a), _0x527584.GFYye), _0x35461c.message), _0x527584.gCcOP), _0x5d965a), _0x527584.QkUfr), _0x480a29), _0x527584.evVxI), _0x30d82b.basename(_0x4bdab0)));
            }
            if (_0xa308c8) {
                if (_0x527584.kZAaG(_0x527584.QABvr, _0x527584.QABvr)) {
                    const _0x727571 = _0x527584.ocFHd(_0x527584.zybai(_0x5e40ac.platform, "-"), _0x65f0d3.arch);
                    return _0x17dd8f[_0x727571] || null;
                }
                process.stderr.write(_0x527584.Qnvlc);
            } else {
                let _0x513898;
                try {
                    _0x513898 = await _0x527584.ZDfzz(_0x40440e, _0x5d965a);
                } catch (_0x59ad1f) {
                    if (_0x527584.PrjEQ(_0x527584.ioTzV, _0x527584.ioTzV)) {
                        throw new Error(_0x527584.lrotP(_0x527584.SHwez(_0x527584.fcUJb(_0x527584.cfAnO(_0x527584.vuwAa(_0x527584.VbpEH(_0x527584.Fkrsb, _0x2395d0), _0x527584.UsUfM), _0x5d965a), _0x527584.lTWQe), _0x59ad1f.message), _0x527584.TkMIl));
                    }
                    _0xfaae4[_0x20937a] = dxkfCE.fZdnB(_0x198076[_0x38afb0] || 0, 1);
                }
                _0x527584.VrfEm(_0x50fb3c, _0x245137, _0x513898, _0x2395d0);
            }
            if (_0x2bba3c) {
                process.stderr.write(_0x527584.TMQDG);
            } else {
                const _0x2248e6 = _0x2985be.mkdtempSync(_0x30d82b.join(_0x2bfd59.tmpdir(), _0x527584.MICey)), _0x1d0f0b = _0x30d82b.join(_0x2248e6, _0x2395d0);
                try {
                    _0x2985be.writeFileSync(_0x1d0f0b, _0x245137);
                    const _0x1ad983 = {};
                    _0x1ad983.repo = _0xbb0eb4, _0x1ad983.requireAttestation = _0x1b3551.requireAttestation, 
                    _0x1ad983.ghRunner = _0x1b3551.ghRunner, _0x1ad983.ghProbe = _0x1b3551.ghProbe;
                    const _0x4850e4 = _0x527584.lSwHh(_0x2ecd35, _0x1d0f0b, _0x1ad983);
                    if (_0x527584.EVQMo(_0x4850e4.status, _0x527584.NEUdY)) {
                        _0x527584.Eiawi(_0x527584.NtHhA, _0x527584.NtHhA) ? process.stderr.write(_0x527584.wmhMy(_0x527584.RITMd(_0x527584.hWest, _0x2395d0), "\n")) : _0x5230d1 = _0x104b48.readFileSync(_0x2b923b.join(_0x3a55f2, _0x39233e), _0x527584.MbkAi);
                    } else {
                        if (!_0x527584.sIqLs(_0x4850e4.status, _0x527584.yMlYQ)) {
                            throw new Error(_0x527584.OfCFA(_0x527584.xfbNp(_0x527584.sgAeg(_0x527584.pGsgm(_0x527584.CdjsA(_0x527584.excIq, _0x2395d0), ": "), _0x4850e4.reason), _0x527584.AKaLp), _0x4850e4.stderr ? _0x527584.WoFxy(_0x527584.lvWDs, _0x4850e4.stderr) : ""));
                        }
                        process.stderr.write(_0x527584.gNfUb(_0x527584.RITMd(_0x527584.Bbdxi, _0x4850e4.reason), _0x527584.WkkcC));
                    }
                } finally {
                    _0x527584.TLTLw(_0x4c1777, _0x2248e6);
                }
            }
            const _0x83a231 = _0x30d82b.basename(_0x4bdab0);
            let _0xe37aa7;
            try {
                _0x527584.iJwye(process.platform, _0x527584.hFBax) ? _0x527584.JXQZl(_0x527584.pmhRp, _0x527584.Vdvab) ? _0x26d58f.ITeZa(_0x2f6202, _0xa99a1c) : _0xe37aa7 = await _0x527584.VGJqp(_0x209f8f, _0x245137) : _0x527584.tswMZ(_0x527584.eAmlT, _0x527584.urLSH) ? _0x4b1d7d.features.push(_0x20d221) : _0xe37aa7 = await _0x527584.YxkAr(_0x14410c, _0x245137);
                const _0x227f43 = _0x527584.AHjFI(_0x1718b2, _0xe37aa7, _0x83a231);
                if (!_0x227f43) {
                    if (_0x527584.OQyzq(_0x527584.OuaWd, _0x527584.DFMgB)) {
                        throw new Error(_0x527584.pePaW(_0x527584.koNzB(_0x527584.ldOTS(_0x527584.fQiNX(_0x527584.SsZNa, _0x83a231), _0x527584.lfCnM), _0x2395d0), _0x527584.LNLdn));
                    }
                    _0x5dd196 += _0x36f491;
                }
                _0x2985be.copyFileSync(_0x227f43, _0x4bdab0);
            } finally {
                _0xe37aa7 && _0x527584.hjZwh(_0x4c1777, _0xe37aa7);
            }
            if (_0x527584.gVjla(process.platform, _0x527584.hFBax)) {
                if (!_0x527584.RUWou(_0x527584.cfwlK, _0x527584.JLarI)) {
                    return null;
                }
                _0x2985be.chmodSync(_0x4bdab0, 493);
            }
            if (!_0x527584.BZXan(_0x184edf)) {
                if (_0x527584.zjoIM(_0x527584.rqZmN, _0x527584.Cswby)) {
                    return _0x527584.CpLle(typeof _0x4e0c78, _0x527584.QOBnT) && /^[0-9a-fA-F]{4,40}$/.test(_0x4d4788);
                }
                throw new Error(_0x527584.tTPIF(_0x527584.GYURi(_0x527584.GdQSp(_0x8f30b7, _0x527584.nFLNj), _0x4bdab0), _0x527584.dqsCI));
            }
            return _0x4bdab0;
        }
        async function _0x3454c2(_0x30ed3a) {
            const _0x1b0c14 = {};
            _0x1b0c14.RBdzQ = _0x527584.dzmsp, _0x1b0c14.snMup = _0x527584.UrHpC, _0x1b0c14.qkPgp = _0x527584.VWtSN, 
            _0x1b0c14.viygD = _0x527584.IaNal, _0x1b0c14.vDMGQ = _0x527584.XqMCC, _0x1b0c14.gNSnR = _0x527584.gtzbc, 
            _0x1b0c14.uHbhQ = _0x527584.CvcXO, _0x1b0c14.maZIz = _0x527584.FmgCD, _0x1b0c14.cttMo = _0x527584.epNDi, 
            _0x1b0c14.XkGzS = _0x527584.EbWXc, _0x1b0c14.Qnutv = _0x527584.rFVzN, _0x1b0c14.hXIrF = _0x527584.oOqNk, 
            _0x1b0c14.QYeBd = _0x527584.VLUXn, _0x1b0c14.uxIDs = _0x527584.KMmKh, _0x1b0c14.lkkfH = _0x527584.Kabwx;
            const _0x5e0a79 = _0x527584.qyDCb(_0x30ed3a, {}), _0x449546 = _0x5e0a79.version || _0x1c879f, _0x157055 = _0x527584.TQrHT(_0x1cd9eb);
            if (_0x2985be.existsSync(_0x157055)) {
                const _0x406087 = _0x527584.sUpVN(_0x184edf);
                if (_0x527584.cTGzH(_0x34723f, _0x406087, _0x1c879f)) {
                    if (_0x527584.IACzG(_0x527584.SNVeX, _0x527584.SNVeX)) {
                        return _0x157055;
                    }
                    {
                        _0x4cd00b.health.hasReadme = _0x4a57e7.existsSync(_0x530e11.join(_0x1dbd90, RBNzon.RBdzQ));
                        const _0x1d4257 = [ RBNzon.snMup, RBNzon.qkPgp, RBNzon.viygD, RBNzon.vDMGQ, RBNzon.gNSnR ];
                        _0x5cab19.health.hasLinting = _0x1d4257.some((_0x197d9f => _0x52793b.existsSync(_0x5bb048.join(_0x33631f, _0x197d9f))));
                        const _0x4fc6bd = [ RBNzon.uHbhQ, RBNzon.maZIz, RBNzon.cttMo, RBNzon.XkGzS, RBNzon.Qnutv ];
                        _0x44affa.health.hasCi = _0x4fc6bd.some((_0x4f2026 => _0x51610b.existsSync(_0x5d0013.join(_0x41361c, _0x4f2026))));
                        const _0x2e2f04 = [ RBNzon.hXIrF, RBNzon.QYeBd, RBNzon.uxIDs, RBNzon.lkkfH ];
                        _0x4349ac.health.hasTests = _0x2771e0.health.hasTests || _0x2e2f04.some((_0x4a8881 => _0x255116.existsSync(_0x522eff.join(_0x3b052e, _0x4a8881))));
                    }
                }
            }
            return _0x527584.xlpbD(_0x886cd3, _0x449546, {
                skipChecksum: _0x527584.mpQpi(_0x5e0a79.skipChecksum, !0),
                skipAttestation: _0x527584.ZDRMY(_0x5e0a79.skipAttestation, !0),
                requireAttestation: _0x5e0a79.requireAttestation,
                ghRunner: _0x5e0a79.ghRunner,
                ghProbe: _0x5e0a79.ghProbe
            });
        }
        function _0x16556d(_0x11f07b) {
            const _0x280532 = _0x527584.rGsWS(_0x1cd9eb);
            if (_0x2985be.existsSync(_0x280532)) {
                const _0x1a28f9 = _0x527584.uVzPc(_0x184edf);
                if (_0x527584.OlyTT(_0x34723f, _0x1a28f9, _0x1c879f)) {
                    if (!_0x527584.kVpqj(_0x527584.SGuCE, _0x527584.dFfLB)) {
                        return _0x280532;
                    }
                    {
                        const _0x4bba99 = _0x527584.LRPKt(_0x48b5c5, _0x527584.gQlSZ, [ _0x527584.UrhIE, _0x527584.JdpVF, _0x527584.glsUO, _0x527584.ksOJs ], {
                            cwd: _0x48a4ce,
                            encoding: _0x527584.MbkAi,
                            stdio: [ _0x527584.UdIBU, _0x527584.UdIBU, _0x527584.UdIBU ]
                        });
                        _0x114181 = _0x4bba99.trim().split("\n");
                    }
                }
            }
            const _0x36bb63 = _0x11f07b && _0x11f07b.version || _0x1c879f, _0x3a0524 = !(!_0x11f07b || !_0x11f07b.skipChecksum), _0x3d4309 = !(!_0x11f07b || !_0x11f07b.skipAttestation), _0x5ec6a7 = _0x11f07b && _0x527584.ZDRMY(typeof _0x11f07b.requireAttestation, _0x527584.aeJPB) ? _0x11f07b.requireAttestation : void 0, _0x2f5d15 = __filename, _0x34aba6 = {};
            _0x34aba6.version = _0x36bb63, _0x34aba6.skipChecksum = _0x3a0524, _0x34aba6.skipAttestation = _0x3d4309;
            const _0x45b4b4 = _0x34aba6;
            if (_0x527584.CPBWO(_0x5ec6a7, void 0)) {
                if (_0x527584.IwbzC(_0x527584.rCOyk, _0x527584.jSahU)) {
                    return _0x527584.gmukJ(_0x1c36d1, _0x527584.GcCdl, [], _0x458eef);
                }
                _0x45b4b4.requireAttestation = _0x5ec6a7;
            }
            const _0x2cb6fa = [ _0x527584.fQiNX(_0x527584.fUmfv(_0x527584.qYxZj, JSON.stringify(_0x2f5d15)), ");"), _0x527584.enILc(_0x527584.ocFHd(_0x527584.myPYH, JSON.stringify(_0x45b4b4)), ")"), _0x527584.zzAwC, _0x527584.mswZL ];
            try {
                const _0x464a72 = {};
                return _0x464a72.encoding = _0x527584.MbkAi, _0x464a72.stdio = [ _0x527584.UdIBU, _0x527584.UdIBU, _0x527584.laIIn ], 
                _0x464a72.timeout = 12e4, _0x57a654.execFileSync(process.execPath, [ "-e", _0x2cb6fa.join("\n") ], _0x464a72).trim() || _0x280532;
            } catch (_0x5f1c46) {
                if (_0x527584.JAywY(_0x527584.kFjnV, _0x527584.kFjnV)) {
                    throw new Error(_0x527584.Oijjn(_0x527584.pezEq, _0x5f1c46.message));
                }
                return {
                    success: !1,
                    error: _0x527584.cCZLj(_0x527584.cKRBo, _0x256111.message)
                };
            }
        }
        const _0x315e3f = {};
        _0x315e3f.ensureBinary = _0x3454c2, _0x315e3f.ensureBinarySync = _0x16556d, _0x315e3f.runAnalyzer = function(_0x1be808, _0x5538e0) {
            const _0x4c9e4f = _0x527584.BZXan(_0x16556d), _0x310e55 = {};
            _0x310e55.encoding = _0x527584.MbkAi, _0x310e55.windowsHide = !0, _0x310e55.maxBuffer = _0x1b37c8;
            const _0x47f53b = Object.assign(_0x310e55, _0x5538e0);
            _0x47f53b.stdio || (_0x47f53b.stdio = [ _0x527584.UdIBU, _0x527584.UdIBU, _0x527584.UdIBU ]);
            const _0x20cd96 = _0x57a654.execFileSync(_0x4c9e4f, _0x1be808, _0x47f53b);
            return _0x527584.Tddfn(typeof _0x20cd96, _0x527584.QOBnT) ? _0x20cd96 : _0x20cd96.toString(_0x527584.MbkAi);
        }, _0x315e3f.runAnalyzerAsync = async function(_0x314c56, _0x5c7517) {
            const _0x36a0e6 = await _0x527584.CZAMk(_0x3454c2), _0x1d77f6 = {};
            _0x1d77f6.encoding = _0x527584.MbkAi, _0x1d77f6.windowsHide = !0, _0x1d77f6.maxBuffer = _0x1b37c8;
            const _0x3a1298 = Object.assign(_0x1d77f6, _0x5c7517);
            return (await _0x527584.VrfEm(_0x2bb30f, _0x36a0e6, _0x314c56, _0x3a1298)).stdout;
        }, _0x315e3f.getBinaryPath = _0x1cd9eb, _0x315e3f.getVersion = _0x184edf, _0x315e3f.getPlatformKey = _0xfe7c47, 
        _0x315e3f.isAvailable = _0x40dff3, _0x315e3f.isAvailableAsync = async function() {
            return _0x527584.TQrHT(_0x40dff3);
        }, _0x315e3f.meetsMinimumVersion = _0x34723f, _0x315e3f.buildDownloadUrl = _0x3b7ac7, 
        _0x315e3f.PLATFORM_MAP = _0xb91a14, _0x315e3f.parseSha256Sidecar = _0x1ab2d9, _0x315e3f.verifySha256 = _0x50fb3c, 
        _0x315e3f.sha256Hex = _0x11d2a8, _0x315e3f.assertSafeArchiveEntry = _0x38c307, _0x315e3f.assertInsideRoot = _0x31f08d, 
        _0x315e3f.downloadBinary = _0x886cd3, _0x315e3f.verifySlsaAttestation = _0x2ecd35, 
        _0x315e3f.isGhAvailable = _0x22809c, _0x315e3f.extractTarGzToScratch = _0x14410c, 
        _0x315e3f.extractZipToScratch = _0x209f8f, _0x315e3f._EXTRACT_ZIP_PS1 = _0x5efa56, 
        _0x5783b3.exports = _0x315e3f;
    }
}), require_installer = __commonJS({
    "../work/agent-sh__agentsys/lib/repo-intel/installer.js"(_0x20bd32, _0x71ef88) {
        const _0x1819f1_WxaNv = function(_0x3f01f4, _0x8de815) {
            return _0x3f01f4 !== _0x8de815;
        }, _0x1819f1_ZNUKH = function(_0x4cef88, _0x3decea) {
            return _0x4cef88 === _0x3decea;
        };
        var _0x5919b9 = require_binary();
        const _0x532fa3 = {
            checkInstalled: async function() {
                if (_0x1819f1_WxaNv("PhbVL", "PhbVL")) {
                    throw new _0x1c4ac7(NILIJF.IiwNw(NILIJF.FbIob(NILIJF.pcYyv(NILIJF.rhbfw(NILIJF.NILZP(NILIJF.HwOQk(NILIJF.EXLGd, _0x1600d0), NILIJF.ywNwD), _0x208225), NILIJF.zPmtz), _0x30e979), NILIJF.jLBNA));
                }
                if (_0x5919b9.isAvailable()) {
                    return _0x1819f1_WxaNv("AmEvJ", "WswPI") ? {
                        found: !0,
                        version: _0x5919b9.getVersion(),
                        tool: "agent-analyzer"
                    } : _0x3dc380.split(/[\\/]/).some((_0xb7daf2 => _0x180313.includes(_0xb7daf2)));
                }
                try {
                    if (_0x1819f1_ZNUKH("okJGS", "okJGS")) {
                        return await _0x5919b9.ensureBinary(), {
                            found: !0,
                            version: _0x5919b9.getVersion(),
                            tool: "agent-analyzer"
                        };
                    }
                    {
                        const _0x2cbb6c = _0x38dc16.join(_0x15b848, ".opencode");
                        if (_0x56823a(_0x2cbb6c)) {
                            return _0x4f45f7.set(_0x1d6658, ".opencode"), ".opencode";
                        }
                    }
                } catch (_0x5f7c5c) {
                    const _0x3e8080 = {
                        found: !1
                    };
                    return _0x3e8080.error = _0x5f7c5c.message, _0x3e8080.tool = "agent-analyzer", _0x3e8080;
                }
            },
            checkInstalledSync: function() {
                if (_0x5919b9.isAvailable()) {
                    return {
                        found: !0,
                        version: _0x5919b9.getVersion(),
                        tool: "agent-analyzer"
                    };
                }
                try {
                    return _0x5919b9.ensureBinarySync(), {
                        found: !0,
                        version: _0x5919b9.getVersion(),
                        tool: "agent-analyzer"
                    };
                } catch (_0x507d4b) {
                    const _0x21fde8 = {
                        found: !1
                    };
                    return _0x21fde8.error = _0x507d4b.message, _0x21fde8.tool = "agent-analyzer", _0x21fde8;
                }
            },
            meetsMinimumVersion: function() {
                return !!_0x1819f1_ZNUKH("nkQlg", "nkQlg") || {
                    success: !1,
                    error: (_0x30e85f = _0x35f6db.message, "Failed to parse repo-intel output: " + _0x30e85f)
                };
                var _0x30e85f;
            },
            getInstallInstructions: function() {
                return "agent-analyzer is downloaded automatically on first use from https://github.com/agent-sh/agent-analyzer/releases";
            },
            getMinimumVersion: function() {
                return _0x1819f1_WxaNv("OjLsX", "OjLsX") ? _0x56f51a : "0.3.0";
            },
            getCommand: () => null
        };
        _0x71ef88.exports = _0x532fa3;
    }
}), require_state_dir = __commonJS({
    "../work/agent-sh__agentsys/lib/platform/state-dir.js"(_0x10e3b1, _0xfbeccc) {
        const _0x4ff08d = {
            AsyiS: "3|0|1|2|4",
            NZtJe: function(_0x12cc8c) {
                return _0x12cc8c();
            },
            QDkSw: function(_0x190ce6) {
                return _0x190ce6();
            },
            QbqXq: function(_0x354a4d, _0x10335a) {
                return _0x354a4d(_0x10335a);
            },
            WBuVx: function(_0x372cad, _0x527ddb) {
                return _0x372cad !== _0x527ddb;
            },
            NZBvq: "sSJif",
            qdMZu: "rlree",
            AdzBQ: function(_0x253569, _0x24cc59) {
                return _0x253569 + _0x24cc59;
            },
            QYbEy: "Extracted path escapes extract root: ",
            MqbAs: function(_0x410c43, _0x78c147) {
                return _0x410c43 === _0x78c147;
            },
            ttgLy: "small",
            geyes: "big",
            sGfer: "code-example",
            fZWDv: "medium",
            bNlsu: function(_0x35d933, _0x498bcd, _0x449ff4) {
                return _0x35d933(_0x498bcd, _0x449ff4);
            },
            XKglm: "Verify import path is still valid",
            DjfHd: function(_0x1ecb00, _0x8894d8) {
                return _0x1ecb00 !== _0x8894d8;
            },
            GRIJw: "srRLL",
            OJlCK: "BLNuN",
            vbBAf: "qmilN",
            IEYvo: function(_0x413e62, _0xaccc5a) {
                return _0x413e62 === _0xaccc5a;
            },
            DuONZ: "jfYrP",
            UWAHc: ".opencode",
            BDfsw: "lrBON",
            PWaiP: function(_0x21759f, _0x1f25db) {
                return _0x21759f(_0x1f25db);
            },
            TEdpb: "nrCKM",
            yzpwf: "BZmhM",
            WIFer: ".codex",
            NehUj: "CUddp",
            Eubgr: ".claude",
            pewLC: function(_0x4d59e2, _0x42c377) {
                return _0x4d59e2 !== _0x42c377;
            },
            hRfqG: "nxaig",
            slGWr: "nuVhU",
            jnEbe: function(_0x8e73cb, _0x80d18a) {
                return _0x8e73cb === _0x80d18a;
            },
            qLzOb: function(_0x4509af, _0x2029a5) {
                return _0x4509af === _0x2029a5;
            },
            etwqS: function(_0x4d16fa, _0x380847) {
                return _0x4d16fa + _0x380847;
            },
            OwncM: " exited ",
            Plcga: function(_0x45afa0, _0x2a5185) {
                return _0x45afa0 + _0x2a5185;
            },
            oaPBA: function(_0x254123, _0x9ad0d5) {
                return _0x254123 !== _0x9ad0d5;
            },
            okUPY: "agent-analyzer set-embeddings exited ",
            UTwYi: function(_0x5539c4, _0x4cc65c, _0x53441f) {
                return _0x5539c4(_0x4cc65c, _0x53441f);
            },
            jsTOl: function(_0x417ea6, _0x2d7a90, _0x3eeecd) {
                return _0x417ea6(_0x2d7a90, _0x3eeecd);
            },
            BKxfo: "pmgqG",
            vIJIA: "zjzyO",
            GPXAT: "custom",
            Ymxhr: "opencode",
            bJwEg: "codex",
            qTtYg: "claude",
            DbUMq: "unknown",
            jWCRX: " (rate limited - set GITHUB_TOKEN env var)",
            bmmWy: function(_0x4f8550, _0xe73d59) {
                return _0x4f8550(_0xe73d59);
            },
            oDAwh: function(_0x1fdcd5, _0x46e55a) {
                return _0x1fdcd5 + _0x46e55a;
            },
            asnVg: "HTTP ",
            qgeBx: " fetching ",
            stSnx: function(_0x4047f1, _0x20c8f0) {
                return _0x4047f1 === _0x20c8f0;
            },
            iQuch: "XcRYq",
            VJoRC: "aAijR",
            ENGoc: "path"
        };
        var _0x23ba57 = _0x4ff08d.bmmWy(require, "fs"), _0x3c4eee = _0x4ff08d.bmmWy(require, _0x4ff08d.ENGoc), _0x43df7f = new Map;
        function _0x40d632(_0x4974df) {
            if (_0x4ff08d.WBuVx(_0x4ff08d.NZBvq, _0x4ff08d.NZBvq)) {
                PTdRBD.KVNIB(_0x4119ef, _0x288517.concat(_0x324306));
            } else {
                try {
                    if (!_0x4ff08d.WBuVx(_0x4ff08d.qdMZu, _0x4ff08d.qdMZu)) {
                        return _0x23ba57.statSync(_0x4974df).isDirectory();
                    }
                    {
                        const _0xa19399 = _0x4ff08d.AsyiS.split("|");
                        let _0x5399f6 = 0;
                        for (;;) {
                            switch (_0xa19399[_0x5399f6++]) {
                              case "0":
                                var _0x123c2d = _0x4ff08d.NZtJe(_0x477f1a);
                                continue;

                              case "1":
                                var _0x13d6c7 = _0x4ff08d.QDkSw(_0x26a04d);
                                continue;

                              case "2":
                                var _0x1ed179 = _0x4ff08d.QDkSw(_0x294628);
                                continue;

                              case "3":
                                continue;

                              case "4":
                                const _0x2b1b45 = {};
                                _0x2b1b45.preference = _0x123c2d, _0x2b1b45.binary = _0x13d6c7, _0x2b1b45.orchestrator = _0x1ed179, 
                                _0x2b1b45.isEnabled = _0x1ed179.isEnabled, _0x2b1b45.runScan = _0x1ed179.runScan, 
                                _0x2b1b45.runUpdate = _0x1ed179.runUpdate, _0x2b1b45.status = _0x1ed179.status, 
                                _0x2bcbe7.exports = _0x2b1b45;
                                continue;
                            }
                            break;
                        }
                    }
                } catch {
                    return !1;
                }
            }
        }
        function _0x5ad6a2(_0x1c58d3 = process.cwd()) {
            const _0x24e967 = {
                WNEJF: function(_0x2dd0e9, _0x2865f2) {
                    return _0x4ff08d.AdzBQ(_0x2dd0e9, _0x2865f2);
                },
                xxmWx: _0x4ff08d.QYbEy,
                xtZYF: function(_0x3b63e7, _0x596b0f) {
                    return _0x4ff08d.MqbAs(_0x3b63e7, _0x596b0f);
                },
                QVCjA: _0x4ff08d.ttgLy,
                DSOxB: _0x4ff08d.geyes,
                SIjmQ: _0x4ff08d.sGfer,
                WBSKu: _0x4ff08d.fZWDv,
                HugPE: function(_0x5f088e, _0x26ecaf, _0x5b5705) {
                    return _0x4ff08d.bNlsu(_0x5f088e, _0x26ecaf, _0x5b5705);
                },
                vZxsT: _0x4ff08d.XKglm
            };
            if (_0x4ff08d.DjfHd(_0x4ff08d.GRIJw, _0x4ff08d.OJlCK)) {
                if (process.env.AI_STATE_DIR) {
                    if (_0x4ff08d.DjfHd(_0x4ff08d.vbBAf, _0x4ff08d.vbBAf)) {
                        throw new _0x2866b5(zMIqmm.WNEJF(zMIqmm.xxmWx, _0x29c769));
                    }
                    return process.env.AI_STATE_DIR;
                }
                const _0x4ca1c3 = _0x3c4eee.resolve(_0x1c58d3), _0x3dcec2 = _0x43df7f.get(_0x4ca1c3);
                if (_0x3dcec2) {
                    return _0x3dcec2;
                }
                if (process.env.OPENCODE_CONFIG || process.env.OPENCODE_CONFIG_DIR) {
                    if (_0x4ff08d.IEYvo(_0x4ff08d.DuONZ, _0x4ff08d.DuONZ)) {
                        return _0x43df7f.set(_0x4ca1c3, _0x4ff08d.UWAHc), _0x4ff08d.UWAHc;
                    }
                    {
                        const _0xeb62d7 = _0x35de81.read(_0x129fe9);
                        return _0x24e967.xtZYF(_0xeb62d7.embedder, _0x24e967.QVCjA) || _0x24e967.xtZYF(_0xeb62d7.embedder, _0x24e967.DSOxB);
                    }
                }
                try {
                    if (_0x4ff08d.WBuVx(_0x4ff08d.BDfsw, _0x4ff08d.BDfsw)) {
                        return 0;
                    }
                    {
                        const _0x3c8e9f = _0x3c4eee.join(_0x1c58d3, _0x4ff08d.UWAHc);
                        if (_0x4ff08d.PWaiP(_0x40d632, _0x3c8e9f)) {
                            return _0x43df7f.set(_0x4ca1c3, _0x4ff08d.UWAHc), _0x4ff08d.UWAHc;
                        }
                    }
                } catch {}
                if (process.env.CODEX_HOME) {
                    return _0x4ff08d.DjfHd(_0x4ff08d.TEdpb, _0x4ff08d.yzpwf) ? (_0x43df7f.set(_0x4ca1c3, _0x4ff08d.WIFer), 
                    _0x4ff08d.WIFer) : null;
                }
                try {
                    const _0x1f9225 = _0x3c4eee.join(_0x1c58d3, _0x4ff08d.WIFer);
                    if (_0x4ff08d.PWaiP(_0x40d632, _0x1f9225)) {
                        if (_0x4ff08d.MqbAs(_0x4ff08d.NehUj, _0x4ff08d.NehUj)) {
                            return _0x43df7f.set(_0x4ca1c3, _0x4ff08d.WIFer), _0x4ff08d.WIFer;
                        }
                        {
                            const _0x2da390 = _0x21584f[1], _0x434bc6 = _0x27f785.replace(/\.[^.]+$/, "");
                            _0x2da390.includes(_0x515d56.basename(_0x434bc6)) && _0x328fdc.push({
                                type: _0x24e967.SIjmQ,
                                severity: _0x24e967.WBSKu,
                                line: _0x24e967.HugPE(_0x35fb76, _0x160a67, _0x29efbe[0]),
                                current: _0x49c2de[0],
                                suggestion: _0x24e967.vZxsT
                            });
                        }
                    }
                } catch {}
                return _0x43df7f.set(_0x4ca1c3, _0x4ff08d.Eubgr), _0x4ff08d.Eubgr;
            }
            _0x37d69d.git = _0x4de12a.collectGitData(_0x171119);
        }
        const _0x2e667b = {};
        _0x2e667b.getStateDir = _0x5ad6a2, _0x2e667b.getStateDirPath = function(_0x4a581b = process.cwd()) {
            if (_0x4ff08d.pewLC(_0x4ff08d.hRfqG, _0x4ff08d.slGWr)) {
                return _0x3c4eee.join(_0x4a581b, _0x4ff08d.QbqXq(_0x5ad6a2, _0x4a581b));
            }
            _0x4d855d.push(_0x119e78.name);
        }, _0x2e667b.getPlatformName = function(_0x502b0a = process.cwd()) {
            if (_0x4ff08d.MqbAs(_0x4ff08d.BKxfo, _0x4ff08d.vIJIA)) {
                if (_0x37bcd5 || _0x4ff08d.jnEbe(_0xcc290d, null) || _0x4ff08d.qLzOb(_0x43837e, null)) {
                    return;
                }
                if (_0x4ff08d.pewLC(_0x4bc656, 0)) {
                    return _0x4ff08d.QbqXq(_0x18f77b, new _0x234e31(_0x4ff08d.AdzBQ(_0x4ff08d.AdzBQ(_0x4ff08d.etwqS(_0x4a247f.EMBED_BINARY_NAME, _0x4ff08d.OwncM), _0x3f36bb), _0x20258a.trim() ? _0x4ff08d.Plcga(": ", _0x120580.trim().slice(0, 500)) : "")));
                }
                if (_0x4ff08d.oaPBA(_0x5a398a, 0)) {
                    return _0x4ff08d.PWaiP(_0x192386, new _0x39c3c6(_0x4ff08d.etwqS(_0x4ff08d.AdzBQ(_0x4ff08d.okUPY, _0x199a50), _0x3456fe.trim() ? _0x4ff08d.Plcga(": ", _0x519d6d.trim().slice(0, 500)) : "")));
                }
                const _0x4465c0 = _0x12c462.match(/(\d+)\s+files?/);
                _0x4ff08d.UTwYi(_0x2f4835, null, {
                    files: _0x4465c0 ? _0x4ff08d.jsTOl(_0x776213, _0x4465c0[1], 10) : void 0
                });
            } else {
                const _0x5dc517 = _0x4ff08d.PWaiP(_0x5ad6a2, _0x502b0a);
                if (process.env.AI_STATE_DIR) {
                    return _0x4ff08d.GPXAT;
                }
                switch (_0x5dc517) {
                  case _0x4ff08d.UWAHc:
                    return _0x4ff08d.Ymxhr;

                  case _0x4ff08d.WIFer:
                    return _0x4ff08d.bJwEg;

                  case _0x4ff08d.Eubgr:
                    return _0x4ff08d.qTtYg;

                  default:
                    return _0x4ff08d.DbUMq;
                }
            }
        }, _0x2e667b.clearCache = function() {
            const _0x2e0f9a = {
                Mbnlv: function(_0x163583, _0xe9e409) {
                    return _0x4ff08d.jnEbe(_0x163583, _0xe9e409);
                },
                ugBFa: _0x4ff08d.jWCRX,
                vIyRz: function(_0x27ba7d, _0x54852b) {
                    return _0x4ff08d.bmmWy(_0x27ba7d, _0x54852b);
                },
                julFD: function(_0x5d8b0b, _0x3374d7) {
                    return _0x4ff08d.oDAwh(_0x5d8b0b, _0x3374d7);
                },
                AOGTd: function(_0x41afc1, _0x1abb62) {
                    return _0x4ff08d.etwqS(_0x41afc1, _0x1abb62);
                },
                hBfmv: _0x4ff08d.asnVg,
                vqGQa: _0x4ff08d.qgeBx
            };
            if (_0x4ff08d.stSnx(_0x4ff08d.iQuch, _0x4ff08d.VJoRC)) {
                _0x4ae78f.resume();
                const _0x10117d = _0x2e0f9a.Mbnlv(_0x103542, 403) ? _0x2e0f9a.ugBFa : "";
                _0x2e0f9a.vIyRz(_0xe2d194, new _0x280b29(_0x2e0f9a.julFD(_0x2e0f9a.AOGTd(_0x2e0f9a.AOGTd(_0x2e0f9a.julFD(_0x2e0f9a.hBfmv, _0x41a5eb), _0x10117d), _0x2e0f9a.vqGQa), _0x2e1730)));
            } else {
                _0x43df7f.clear();
            }
        }, _0xfbeccc.exports = _0x2e667b;
    }
}), require_atomic_write = __commonJS({
    "../work/agent-sh__agentsys/lib/utils/atomic-write.js"(_0x488c13, _0x1a8cee) {
        const _0x4afc06 = {
            VIuoW: function(_0x27b8e6, _0x300a67, _0xfa711c, _0xc2d220) {
                return _0x27b8e6(_0x300a67, _0xfa711c, _0xc2d220);
            },
            ISTHV: "release-info",
            ULhRT: function(_0x565cd8, _0x366794) {
                return _0x565cd8 === _0x366794;
            },
            qALQp: "oLcdK",
            InkrW: "hex",
            RLcBy: "removed-export",
            mHVaF: "high",
            PCYhF: "repo-map",
            FEUPh: "regex",
            QhDiP: "win32",
            oFvqn: ".zip",
            GZcxm: ".tar.gz",
            SElic: function(_0x2265a7, _0x513126) {
                return _0x2265a7 + _0x513126;
            },
            mYabK: function(_0x526efd, _0xff295c) {
                return _0x526efd + _0xff295c;
            },
            nmRZw: function(_0x39fb35, _0x2d90a6) {
                return _0x39fb35 + _0x2d90a6;
            },
            gBiFr: function(_0x43da44, _0x395b8e) {
                return _0x43da44 + _0x395b8e;
            },
            ClhuB: function(_0x3a2677, _0x2797fc) {
                return _0x3a2677 + _0x2797fc;
            },
            QaeJV: "https://github.com/",
            GipPd: "/releases/download/v",
            QVkKU: "url-path",
            cFcUo: function(_0x222593, _0x41c58a) {
                return _0x222593 !== _0x41c58a;
            },
            RMdsk: "ocuSv",
            yOaJZ: "utf8",
            HdWtf: function(_0x1b3a5c, _0x49da7c) {
                return _0x1b3a5c !== _0x49da7c;
            },
            UXYZc: "zFQUW",
            msDDf: "zXQtn",
            mfDHM: function(_0x3df709, _0x58e0d5) {
                return _0x3df709(_0x58e0d5);
            },
            gcYcD: function(_0x2bfdb7, _0x1fd723) {
                return _0x2bfdb7 !== _0x1fd723;
            },
            ZsLWN: "bCrjH",
            WspeV: "ayiHC",
            cTyZY: "WYSro",
            PQvSu: "mvGgR",
            NEwGK: function(_0x3fe41e, _0x4f7860) {
                return _0x3fe41e(_0x4f7860);
            },
            AXanE: "EsHCF",
            RqDGq: "hkvHv",
            FktId: function(_0x5dee37, _0x32e0ce) {
                return _0x5dee37(_0x32e0ce);
            },
            PxuwZ: function(_0x109f8f, _0x29e2ca) {
                return _0x109f8f(_0x29e2ca);
            },
            IWZAa: "path",
            ODwjz: function(_0x2da77c, _0x1b56c2) {
                return _0x2da77c(_0x1b56c2);
            },
            lEPxV: "crypto"
        };
        var _0x38f7b4 = _0x4afc06.FktId(require, "fs"), _0x35cef2 = _0x4afc06.PxuwZ(require, _0x4afc06.IWZAa), _0x1f7374 = _0x4afc06.ODwjz(require, _0x4afc06.lEPxV);
        function _0x52d94f(_0x1264cc) {
            if (_0x4afc06.ULhRT(_0x4afc06.qALQp, _0x4afc06.qALQp)) {
                const _0xe7acdc = _0x35cef2.dirname(_0x1264cc), _0x5e71bc = _0x35cef2.basename(_0x1264cc), _0x4592c8 = _0x1f7374.randomBytes(6).toString(_0x4afc06.InkrW);
                return _0x35cef2.join(_0xe7acdc, "." + _0x5e71bc + "." + _0x4592c8 + ".tmp");
            }
            return _0x4afc06.VIuoW(_0xcb8dbd, _0x4afc06.ISTHV, [], _0xea42f2);
        }
        function _0x350dda(_0x2fb9f8, _0x28d275, _0x39da3e = {}) {
            const _0xb04c5e = {
                eVysy: _0x4afc06.RLcBy,
                ZnDpC: _0x4afc06.mHVaF,
                AVpEp: _0x4afc06.PCYhF,
                KRewY: _0x4afc06.FEUPh,
                OmjgX: function(_0x4de12b, _0x2fa180) {
                    return _0x4afc06.ULhRT(_0x4de12b, _0x2fa180);
                },
                QNQjx: _0x4afc06.QhDiP,
                hpNEZ: _0x4afc06.oFvqn,
                Vrpwo: _0x4afc06.GZcxm,
                hqwVA: function(_0xf9ba94, _0x4137fe) {
                    return _0x4afc06.SElic(_0xf9ba94, _0x4137fe);
                },
                KFZhN: function(_0x532148, _0x5f3901) {
                    return _0x4afc06.mYabK(_0x532148, _0x5f3901);
                },
                uCdeS: function(_0x32272a, _0x3d2a3d) {
                    return _0x4afc06.nmRZw(_0x32272a, _0x3d2a3d);
                },
                ukuEW: function(_0x5b7d24, _0x38e538) {
                    return _0x4afc06.nmRZw(_0x5b7d24, _0x38e538);
                },
                WAtgp: function(_0x39d4c2, _0x3ee4ee) {
                    return _0x4afc06.nmRZw(_0x39d4c2, _0x3ee4ee);
                },
                OTnrM: function(_0x3a9a5c, _0x2097ac) {
                    return _0x4afc06.gBiFr(_0x3a9a5c, _0x2097ac);
                },
                vOdLU: function(_0x50d18e, _0x5dea73) {
                    return _0x4afc06.ClhuB(_0x50d18e, _0x5dea73);
                },
                htJRw: _0x4afc06.QaeJV,
                QjTms: _0x4afc06.GipPd,
                qOlUD: _0x4afc06.QVkKU
            };
            if (_0x4afc06.cFcUo(_0x4afc06.RMdsk, _0x4afc06.RMdsk)) {
                if (_0x2120f1.includes(_0x26ef2b)) {
                    const _0x9af123 = {};
                    _0x9af123.type = _0xb04c5e.eVysy, _0x9af123.severity = _0xb04c5e.ZnDpC, _0x9af123.reference = _0x3b071a, 
                    _0x9af123.suggestion = "'" + _0x52f206 + "' was removed or renamed", _0x9af123.detectionMethod = _0x31c9b1 ? _0xb04c5e.AVpEp : _0xb04c5e.KRewY, 
                    _0x4bfca2.push(_0x9af123);
                }
            } else {
                const {encoding = _0x4afc06.yOaJZ, mode = 420} = _0x39da3e, _0x484bc0 = _0x35cef2.dirname(_0x2fb9f8);
                if (!_0x38f7b4.existsSync(_0x484bc0)) {
                    if (!_0x4afc06.HdWtf(_0x4afc06.UXYZc, _0x4afc06.msDDf)) {
                        const _0x121b1a = _0xb04c5e.OmjgX(_0x29454c.platform, _0xb04c5e.QNQjx) ? _0xb04c5e.hpNEZ : _0xb04c5e.Vrpwo;
                        return _0xb04c5e.hqwVA(_0xb04c5e.KFZhN(_0xb04c5e.uCdeS(_0xb04c5e.ukuEW(_0xb04c5e.ukuEW(_0xb04c5e.WAtgp(_0xb04c5e.OTnrM(_0xb04c5e.vOdLU(_0xb04c5e.htJRw, _0x5f2671), _0xb04c5e.QjTms), _0x581098), "/"), _0x5a2393), "-"), _0x30527b), _0x121b1a);
                    }
                    {
                        const _0x48c99b = {
                            recursive: !0
                        };
                        _0x38f7b4.mkdirSync(_0x484bc0, _0x48c99b);
                    }
                }
                const _0x35c8af = _0x4afc06.mfDHM(_0x52d94f, _0x2fb9f8);
                try {
                    const _0x297a4b = {};
                    return _0x297a4b.encoding = encoding, _0x297a4b.mode = mode, _0x38f7b4.writeFileSync(_0x35c8af, _0x28d275, _0x297a4b), 
                    _0x38f7b4.renameSync(_0x35c8af, _0x2fb9f8), !0;
                } catch (_0x12e77d) {
                    if (_0x4afc06.gcYcD(_0x4afc06.ZsLWN, _0x4afc06.ZsLWN)) {
                        const _0x18ed6a = _0x4c0c81.basename(_0x59408e).replace(/\.[^.]+$/, "").toLowerCase();
                        return _0x1ae883.includes(_0x18ed6a);
                    }
                    try {
                        if (_0x4afc06.ULhRT(_0x4afc06.WspeV, _0x4afc06.WspeV)) {
                            if (_0x38f7b4.existsSync(_0x35c8af)) {
                                if (_0x4afc06.ULhRT(_0x4afc06.cTyZY, _0x4afc06.PQvSu)) {
                                    const _0x5b268c = {
                                        available: !0
                                    };
                                    return _0x5b268c.map = _0x13cc0e.map, _0x5b268c.fallbackReason = null, _0x5b268c;
                                }
                                _0x38f7b4.unlinkSync(_0x35c8af);
                            }
                        } else {
                            _0x37d9ed.push(_0xb04c5e.qOlUD);
                        }
                    } catch {}
                    throw _0x12e77d;
                }
            }
        }
        const _0x161bc1 = {};
        _0x161bc1.writeFileAtomic = _0x350dda, _0x161bc1.writeJsonAtomic = function(_0x26edd9, _0x17a0b2, _0x4fc28a = {}) {
            if (_0x4afc06.ULhRT(_0x4afc06.AXanE, _0x4afc06.RqDGq)) {
                throw sOsohk.woQmg(_0x1bd243, _0x35094f), _0x27657f;
            }
            {
                const {indent = 2, ..._0x267e67} = _0x4fc28a, _0x5e849a = JSON.stringify(_0x17a0b2, null, indent);
                return _0x4afc06.VIuoW(_0x350dda, _0x26edd9, _0x5e849a, _0x267e67);
            }
        }, _0x161bc1.getTempPath = _0x52d94f, _0x1a8cee.exports = _0x161bc1;
    }
}), require_cache = __commonJS({
    "../work/agent-sh__agentsys/lib/repo-intel/cache.js"(_0x2893cc, _0x128e38) {
        const _0x31417e_JVggz = function(_0x1e9735, _0x468ef1) {
            return _0x1e9735(_0x468ef1);
        }, _0x31417e_FAmvy = function(_0x288c48, _0x3d6b5a) {
            return _0x288c48(_0x3d6b5a);
        }, _0x31417e_TTJDk = function(_0x38eff1, _0x5def7f) {
            return _0x38eff1 === _0x5def7f;
        }, _0x31417e_QkXeO = function(_0xfecc3e, _0x21ee6d) {
            return _0xfecc3e(_0x21ee6d);
        }, _0x31417e_zelqN = function(_0x432042, _0x3fc3a2, _0x2366d8) {
            return _0x432042(_0x3fc3a2, _0x2366d8);
        }, _0x31417e_VlSjC = function(_0x2975d1) {
            return _0x2975d1();
        };
        var _0x35cb15 = _0x31417e_FAmvy(require, "fs"), _0x8a4d3d = require("path"), {getStateDirPath: _0x473ce7} = _0x31417e_VlSjC(require_state_dir), {writeJsonAtomic: _0xd01fc8, writeFileAtomic: _0x319b64} = _0x31417e_VlSjC(require_atomic_write);
        function _0x3bddbd(_0xa3e036) {
            return _0x8a4d3d.join(_0x31417e_JVggz(_0x473ce7, _0xa3e036), "repo-map.json");
        }
        function _0x24aae6(_0x186f9f) {
            return _0x31417e_TTJDk("byoDF", "byoDF") ? _0x8a4d3d.join(_0x31417e_JVggz(_0x473ce7, _0x186f9f), "repo-map.stale") : {
                exists: !1
            };
        }
        function _0x37ebcc(_0x41e9f9) {
            if (_0x31417e_TTJDk("FGdIc", "FGdIc")) {
                const _0xe287ba = _0x31417e_QkXeO(_0x473ce7, _0x41e9f9);
                if (!_0x35cb15.existsSync(_0xe287ba)) {
                    const _0x304629 = {
                        recursive: !0
                    };
                    _0x35cb15.mkdirSync(_0xe287ba, _0x304629);
                }
                return _0xe287ba;
            }
            {
                const _0x30c1b8 = (_0x40d0f0[1] || _0x262af9[0]).slice(0, 100);
                _0x48c020.plans.push(_0x30c1b8);
            }
        }
        function _0x29d689(_0x25ac12) {
            {
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
        }
        function _0x56491f(_0x112118) {
            {
                const _0x23c72e = _0x24aae6(_0x112118);
                _0x35cb15.existsSync(_0x23c72e) && _0x35cb15.unlinkSync(_0x23c72e);
            }
        }
        const _0x47cdb5 = {};
        _0x47cdb5.load = _0x29d689, _0x47cdb5.save = function(_0x1a3c9f, _0x42f8c9) {
            {
                _0x37ebcc(_0x1a3c9f);
                const _0x414e6b = _0x31417e_FAmvy(_0x3bddbd, _0x1a3c9f), _0x4095a5 = {
                    ..._0x42f8c9,
                    updated: (new Date).toISOString()
                };
                _0x31417e_zelqN(_0xd01fc8, _0x414e6b, _0x4095a5), _0x56491f(_0x1a3c9f);
            }
        }, _0x47cdb5.exists = function(_0x1477ec) {
            return _0x35cb15.existsSync(_0x3bddbd(_0x1477ec));
        }, _0x47cdb5.getStatus = function(_0x2e6a5b) {
            {
                const _0x4a379d = _0x29d689(_0x2e6a5b);
                return _0x4a379d ? {
                    generated: _0x4a379d.generated,
                    updated: _0x4a379d.updated,
                    commit: _0x4a379d.git?.commit,
                    branch: _0x4a379d.git?.branch,
                    files: Object.keys(_0x4a379d.files || {}).length,
                    symbols: _0x4a379d.stats?.totalSymbols || 0,
                    languages: _0x4a379d.project?.languages || []
                } : null;
            }
        }, _0x47cdb5.getMapPath = _0x3bddbd, _0x47cdb5.getPath = function(_0x4df774) {
            return _0x8a4d3d.join(_0x31417e_FAmvy(_0x473ce7, _0x4df774), "repo-intel.json");
        }, _0x47cdb5.getStateDirPath = _0x473ce7, _0x47cdb5.markStale = function(_0x5b7aad) {
            _0x31417e_QkXeO(_0x37ebcc, _0x5b7aad), _0x31417e_zelqN(_0x319b64, _0x31417e_JVggz(_0x24aae6, _0x5b7aad), (new Date).toISOString());
        }, _0x47cdb5.clearStale = _0x56491f, _0x47cdb5.isMarkedStale = function(_0x5dab83) {
            return _0x35cb15.existsSync(_0x31417e_JVggz(_0x24aae6, _0x5dab83));
        }, _0x128e38.exports = _0x47cdb5;
    }
}), require_updater = __commonJS({
    "../work/agent-sh__agentsys/lib/repo-intel/updater.js"(_0xf4852e, _0x37b686) {
        const _0x43054b_mPfyo = function(_0x561b83, _0x48d5a7, _0x1c81a1) {
            return _0x561b83(_0x48d5a7, _0x1c81a1);
        }, _0x43054b_LaxKJ = function(_0xe82a31, _0x295e79) {
            return _0xe82a31 === _0x295e79;
        }, _0x43054b_VLVqd = function(_0x40fb28, _0x7b1e71) {
            return _0x40fb28 !== _0x7b1e71;
        };
        var {execFileSync: _0x3daa9e} = require("child_process"), _0x38325d = require_cache();
        function _0x1602d6(_0x2524f6) {
            return "string" == typeof _0x2524f6 && /^[0-9a-fA-F]{4,40}$/.test(_0x2524f6);
        }
        function _0x1ef6b3(_0x26d74b, _0x512012) {
            if (_0x43054b_VLVqd("UyzJw", "ONtdy")) {
                if (!_0x1602d6(_0x512012)) {
                    return !1;
                }
                try {
                    return _0x3daa9e("git", [ "cat-file", "-e", _0x512012 ], {
                        cwd: _0x26d74b,
                        stdio: [ "pipe", "pipe", "pipe" ]
                    }), !0;
                } catch {
                    return !1;
                }
            } else {
                let _0x3c4e7d;
                for (;SdGNuE.eZUab(_0x3c4e7d = _0x644ce0.exec(_0x5c646e), null) && SdGNuE.TotBo(_0x568702.plans.length, 15); ) {
                    const _0x49e57d = (_0x3c4e7d[1] || _0x3c4e7d[0]).slice(0, 100);
                    _0x4b733c.plans.push(_0x49e57d);
                }
            }
        }
        const _0x2c00bb = {
            checkStaleness: function(_0x174560, _0x5d01d8) {
                if (_0x43054b_LaxKJ("pCFIE", "pCFIE")) {
                    const _0xc7fee4 = {
                        isStale: !1,
                        reason: null,
                        commitsBehind: 0,
                        suggestFullRebuild: !1
                    };
                    if (!_0x5d01d8?.git?.commit) {
                        return _0xc7fee4.isStale = !0, _0xc7fee4.reason = "Missing base commit in repo-map", 
                        _0xc7fee4.suggestFullRebuild = !0, _0xc7fee4;
                    }
                    if (_0x38325d.isMarkedStale(_0x174560)) {
                        if (!_0x43054b_LaxKJ("FlOAy", "FlOAy")) {
                            const {indent = 2, ..._0x3df642} = _0x584471, _0x72af08 = _0x578903.stringify(_0xd8824, null, indent);
                            return eqvWyS.YHgrD(_0x1f461b, _0x158e01, _0x72af08, _0x3df642);
                        }
                        _0xc7fee4.isStale = !0, _0xc7fee4.reason = "Marked stale by hook";
                    }
                    if (!_0x43054b_mPfyo(_0x1ef6b3, _0x174560, _0x5d01d8.git.commit)) {
                        if (_0x43054b_VLVqd("zLzks", "OSIuW")) {
                            return _0xc7fee4.isStale = !0, _0xc7fee4.reason = "Base commit no longer exists (rebased?)", 
                            _0xc7fee4.suggestFullRebuild = !0, _0xc7fee4;
                        }
                        {
                            const _0x4f495f = (_0x226d7e = _0x486e6d, _0x5ed850 = _0x63bfcd, _0x4c614a = _0x5db0c5, 
                            _0x43054b_mPfyo(_0x226d7e, _0x5ed850, _0x4c614a));
                            return null === _0x4f495f && _0x4863a7.push(_0x32495c), _0x4f495f;
                        }
                    }
                    const _0x217757 = function(_0x2ef13e) {
                        if (_0x43054b_LaxKJ("IDzOa", "gIKRW")) {
                            _0x16f398.push(_0x593ccc);
                        } else {
                            try {
                                return (_0x191997 = _0x3daa9e, _0x16098d = [ "rev-parse", "--abbrev-ref", "HEAD" ], 
                                _0x36d28e = {
                                    cwd: _0x2ef13e,
                                    encoding: "utf8",
                                    stdio: [ "pipe", "pipe", "pipe" ]
                                }, _0x191997("git", _0x16098d, _0x36d28e)).trim();
                            } catch {
                                return null;
                            }
                        }
                        var _0x191997, _0x16098d, _0x36d28e;
                    }(_0x174560);
                    _0x217757 && _0x5d01d8.git.branch && _0x43054b_VLVqd(_0x217757, _0x5d01d8.git.branch) && (_0xc7fee4.isStale = !0, 
                    _0xc7fee4.reason = "Branch changed from " + _0x5d01d8.git.branch + " to " + _0x217757, 
                    _0xc7fee4.suggestFullRebuild = !0);
                    const _0x2ca6c1 = function(_0x216523, _0x4fa312) {
                        if (!_0x1602d6(_0x4fa312)) {
                            return 0;
                        }
                        var _0x28b99b, _0xf17378, _0x9a064a;
                        try {
                            {
                                const _0x2bd8af = (_0x28b99b = _0x3daa9e, _0xf17378 = [ "rev-list", _0x4fa312 + "..HEAD", "--count" ], 
                                _0x9a064a = {
                                    cwd: _0x216523,
                                    encoding: "utf8",
                                    stdio: [ "pipe", "pipe", "pipe" ]
                                }, _0x28b99b("git", _0xf17378, _0x9a064a)).trim();
                                return Number(_0x2bd8af) || 0;
                            }
                        } catch {
                            return 0;
                        }
                    }(_0x174560, _0x5d01d8.git.commit);
                    return _0x2ca6c1 > 0 && (_0xc7fee4.isStale = !0, _0xc7fee4.commitsBehind = _0x2ca6c1, 
                    !_0xc7fee4.reason && (_0xc7fee4.reason = _0x2ca6c1 + " commits behind HEAD")), _0xc7fee4;
                }
                var _0x226d7e, _0x5ed850, _0x4c614a;
                {
                    const _0xc0265a = {
                        exports: {}
                    };
                    return _0x1d4771 || (0, _0x71480c[eqvWyS.nPgke(_0x59cb88, _0x5cb600)[0]])((_0x4f7984 = _0xc0265a).exports, _0x138393), 
                    _0x14036a.exports;
                }
            }
        };
        _0x37b686.exports = _0x2c00bb;
    }
}), require_converter = __commonJS({
    "../work/agent-sh__agentsys/lib/repo-intel/converter.js"(_0x12c6b3, _0x14aeb1) {
        const _0x5c2e8e_miFbF = function(_0x591d65, _0x24bd03) {
            return _0x591d65 === _0x24bd03;
        }, _0x5c2e8e_ghGLs = function(_0x42fabc, _0x1d0643) {
            return _0x42fabc(_0x1d0643);
        }, _0x5c2e8e_QZrza = function(_0x198865, _0x590c8e) {
            return _0x198865 !== _0x590c8e;
        }, _0x5c2e8e_DJkgA = function(_0x55c683, _0x3ce073) {
            return _0x55c683 + _0x3ce073;
        };
        var _0x872745 = require("path"), _0x1e7ca5 = {
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
        }, _0x27c465 = new Set([ "class", "struct", "interface", "enum", "impl" ]), _0x2e2d6f = new Set([ "trait", "type-alias" ]), _0x1d3eb8 = new Set([ "method", "arrow", "closure" ]), _0x511249 = new Set([ "constant", "variable", "const", "field", "property" ]);
        function _0x5cc9c1(_0x8cd2b9) {
            return _0x1e7ca5[_0x872745.extname(_0x8cd2b9).toLowerCase()] || "unknown";
        }
        function _0x5b3bd2(_0x287018) {
            const _0x4a6649 = new Set;
            for (const _0x97f1dc of _0x287018) {
                if (_0x5c2e8e_miFbF("ahFoW", "ahFoW")) {
                    const _0x3c3aa4 = _0x5c2e8e_ghGLs(_0x5cc9c1, _0x97f1dc);
                    _0x5c2e8e_QZrza(_0x3c3aa4, "unknown") && _0x4a6649.add(_0x3c3aa4);
                } else {
                    try {
                        const _0x366505 = _0x317bfa.parse(_0x2fd572);
                        luKcFO.XBuZA(_0x5e67e1, _0x463302, _0x366505), luKcFO.XBuZA(_0x512ffe, _0x26fa6f, _0x366505);
                    } catch {}
                }
            }
            return Array.from(_0x4a6649);
        }
        function _0x51f9fb(_0x16bda8, _0x4affb4) {
            if (_0x5c2e8e_miFbF("IMMkT", "oIZLi")) {
                return [];
            }
            {
                const _0x43f1d1 = new Set((_0x4affb4.exports || []).map((_0x34138e => _0x34138e.name))), _0x7cdcab = (_0x4affb4.exports || []).map((_0x16759b => ({
                    name: _0x16759b.name,
                    kind: _0x16759b.kind,
                    line: _0x16759b.line
                }))), _0x4c5066 = [], _0x59289d = [], _0x5ad908 = [], _0x5589c9 = [];
                for (const _0x20c91b of _0x4affb4.definitions || []) {
                    const _0x146961 = {
                        name: _0x20c91b.name,
                        kind: _0x20c91b.kind,
                        line: _0x20c91b.line,
                        exported: _0x43f1d1.has(_0x20c91b.name)
                    };
                    if (_0x5c2e8e_miFbF(_0x20c91b.kind, "function") || _0x1d3eb8.has(_0x20c91b.kind)) {
                        if (!_0x5c2e8e_QZrza("GcziL", "CBoAn")) {
                            if (!_0x104c0f?.entryPointSymbols) {
                                return !1;
                            }
                            const _0x5ceaf0 = _0x5c2e8e_ghGLs(_0x352054, _0x556a85);
                            return _0x48489e.entryPointSymbols.has(_0x5ceaf0 + ":" + _0x577d2a) || _0x2277b5.entryPointSet.has(_0x5ceaf0);
                        }
                        _0x4c5066.push(_0x146961);
                    } else {
                        _0x27c465.has(_0x20c91b.kind) ? _0x59289d.push(_0x146961) : _0x2e2d6f.has(_0x20c91b.kind) ? _0x5ad908.push(_0x146961) : (_0x511249.has(_0x20c91b.kind), 
                        _0x5589c9.push(_0x146961));
                    }
                }
                const _0x94ff64 = (_0x4affb4.imports || []).map((_0x4bf86d => ({
                    source: _0x4bf86d.from,
                    kind: "import",
                    names: _0x4bf86d.names || []
                }))), _0x1d7461 = {};
                return _0x1d7461.exports = _0x7cdcab, _0x1d7461.functions = _0x4c5066, _0x1d7461.classes = _0x59289d, 
                _0x1d7461.types = _0x5ad908, _0x1d7461.constants = _0x5589c9, {
                    language: _0x5c2e8e_ghGLs(_0x5cc9c1, _0x16bda8),
                    symbols: _0x1d7461,
                    imports: _0x94ff64
                };
            }
        }
        const _0x2a670f = {
            convertIntelToRepoMap: function(_0xfe0b71) {
                if (_0x5c2e8e_QZrza("VAysi", "VAysi")) {
                    const _0x47ab1f = [];
                    return null != _0x3ce1b3.limit && _0x47ab1f.push("--top", _0x5c2e8e_ghGLs(_0x6bed96, _0x1d6aab.limit)), 
                    _0x4e9b4d("painspots", _0x47ab1f, _0x8bc819);
                }
                {
                    const _0x489f85 = {};
                    let _0x15145f = 0, _0x38af3d = 0;
                    for (const [_0x3e3b58, _0x453455] of Object.entries(_0xfe0b71.symbols || {})) {
                        _0x489f85[_0x3e3b58] = _0x51f9fb(_0x3e3b58, _0x453455);
                        const _0x17d517 = _0x489f85[_0x3e3b58].symbols;
                        _0x15145f += _0x5c2e8e_DJkgA(_0x5c2e8e_DJkgA(_0x5c2e8e_DJkgA(_0x17d517.functions.length, _0x17d517.classes.length), _0x17d517.types.length), _0x17d517.constants.length), 
                        _0x38af3d += _0x489f85[_0x3e3b58].imports.length;
                    }
                    return {
                        version: "2.0",
                        generated: _0xfe0b71.generated || (new Date).toISOString(),
                        git: _0xfe0b71.git ? {
                            commit: _0xfe0b71.git.analyzedUpTo
                        } : void 0,
                        project: {
                            languages: _0x5c2e8e_ghGLs(_0x5b3bd2, Object.keys(_0x489f85))
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
            }
        };
        _0x2a670f.convertFile = _0x51f9fb, _0x2a670f.detectLanguage = _0x5cc9c1, _0x14aeb1.exports = _0x2a670f;
    }
}), require_queries = __commonJS({
    "../work/agent-sh__agentsys/lib/repo-intel/queries.js"(_0x2577ab, _0x2c749a) {
        const _0x467906_hEFgA = function(_0x3849ce, _0x9d6933) {
            return _0x3849ce(_0x9d6933);
        }, _0x467906_cDCGB = function(_0x268a4b, _0x3d37e6) {
            return _0x268a4b < _0x3d37e6;
        }, _0x467906_CsGyy = function(_0x1cb0b2, _0x4ecd2f) {
            return _0x1cb0b2 > _0x4ecd2f;
        }, _0x467906_vDcMw = function(_0x4fa1eb, _0x4c44d9) {
            return _0x4fa1eb === _0x4c44d9;
        }, _0x467906_SfBqT = function(_0x5915ba, _0x6ca52a) {
            return _0x5915ba === _0x6ca52a;
        }, _0x467906_XOnTx = function(_0x20a3cb, _0xd256d3) {
            return _0x20a3cb(_0xd256d3);
        }, _0x467906_SwPvX = function(_0x2d4f2d, _0x1860a6) {
            return _0x2d4f2d !== _0x1860a6;
        }, _0x467906_sXbpP = function(_0x4d7b4e, _0x29529a) {
            return _0x4d7b4e !== _0x29529a;
        }, _0x467906_GafHD = function(_0x14c3f5, _0x9cba7) {
            return _0x14c3f5 !== _0x9cba7;
        }, _0x467906_lHzie = function(_0x13f094, _0x51686f) {
            return _0x13f094 != _0x51686f;
        }, _0x467906_qPLpe = function(_0x3a1938, _0x63bb36) {
            return _0x3a1938(_0x63bb36);
        }, _0x467906_CYats = function(_0x168456, _0x278992, _0x38a759, _0x4621b6) {
            return _0x168456(_0x278992, _0x38a759, _0x4621b6);
        }, _0x467906_AtXcV = function(_0x142b13, _0x550ec3, _0x102a78) {
            return _0x142b13(_0x550ec3, _0x102a78);
        }, _0x467906_vGipn = function(_0x2f8644, _0x3ec1e7, _0x3fa408) {
            return _0x2f8644(_0x3ec1e7, _0x3fa408);
        }, _0x467906_VYtlR = function(_0x36180a, _0x369f64, _0x2cd633, _0x20a189) {
            return _0x36180a(_0x369f64, _0x2cd633, _0x20a189);
        }, _0x467906_LTWQJ = function(_0xf96deb, _0x373086) {
            return _0xf96deb(_0x373086);
        }, _0x467906_LnkEb = function(_0x59004a, _0x36a3cc) {
            return _0x59004a === _0x36a3cc;
        }, _0x467906_glRtR = function(_0xb28a62, _0x13b90c) {
            return _0xb28a62 === _0x13b90c;
        }, _0x467906_qbWBe = function(_0x1b1134, _0x2990cf) {
            return _0x1b1134(_0x2990cf);
        }, _0x467906_TLJJP = function(_0x2eee2f, _0x173867, _0x27288c, _0xbb983b) {
            return _0x2eee2f(_0x173867, _0x27288c, _0xbb983b);
        }, _0x467906_cZUdB = function(_0x57f5af, _0x32c9d2) {
            return _0x57f5af !== _0x32c9d2;
        }, _0x467906_WgwYD = function(_0x394b3e, _0xb5153e, _0x531af1, _0x102f41) {
            return _0x394b3e(_0xb5153e, _0x531af1, _0x102f41);
        }, _0x467906_bsaIU = function(_0x40b434, _0xbfc556, _0x4f4c1b, _0x14eb8e) {
            return _0x40b434(_0xbfc556, _0x4f4c1b, _0x14eb8e);
        }, _0x467906_lRNEc = function(_0x459447, _0x3010fa) {
            return _0x459447 != _0x3010fa;
        }, _0x467906_kARlL = function(_0x5af2b4, _0x32cd0b, _0x2d6a32, _0x23a7c2) {
            return _0x5af2b4(_0x32cd0b, _0x2d6a32, _0x23a7c2);
        }, _0x467906_ZDUAY = function(_0x58b922, _0x2279e5) {
            return _0x58b922 !== _0x2279e5;
        }, _0x467906_jLwDt = function(_0x33b494, _0x13a37b, _0x4edb16, _0x4638d6) {
            return _0x33b494(_0x13a37b, _0x4edb16, _0x4638d6);
        }, _0x467906_BQiaH = function(_0x33b2cf, _0xb77e48, _0x46f142, _0x49c5d8) {
            return _0x33b2cf(_0xb77e48, _0x46f142, _0x49c5d8);
        }, _0x467906_HTdnK = function(_0x34c7c7, _0x1e0594) {
            return _0x34c7c7 !== _0x1e0594;
        }, _0x467906_wspQY = function(_0x39fe3f, _0x4b8e4f, _0x3261f7, _0x2bb9c6) {
            return _0x39fe3f(_0x4b8e4f, _0x3261f7, _0x2bb9c6);
        }, _0x467906_tJWLV = function(_0x455f68, _0x2651bc, _0x5bf534, _0x42f5ed) {
            return _0x455f68(_0x2651bc, _0x5bf534, _0x42f5ed);
        }, _0x467906_aqqvu = function(_0x377362, _0x22265c) {
            return _0x377362(_0x22265c);
        };
        var _0xd56cbd = require("fs"), _0x5ab9ea = _0x467906_hEFgA(require, "path"), {getStateDir: _0x2b4795} = require_state_dir(), _0x37988e = require_binary(), _0x26d5cc = class extends Error {
            constructor(_0x55c9b8) {
                super("repo-intel map not found at " + _0x55c9b8 + ". Run `agentsys repo-intel update` to generate it first."), 
                this.name = "RepoIntelMissingError", this.code = "REPO_INTEL_MISSING", this.mapFile = _0x55c9b8;
            }
        };
        function _0x177c3b(_0x417fb7) {
            const _0x45f473 = _0x467906_hEFgA(_0x2b4795, _0x417fb7);
            return _0x5ab9ea.join(_0x417fb7, _0x45f473, "repo-intel.json");
        }
        function _0x2374d0(_0x49b819) {
            if (!_0x467906_vDcMw("fjhhy", "DSrIz")) {
                const _0x7de15e = _0x467906_hEFgA(_0x177c3b, _0x49b819);
                if (!_0xd56cbd.existsSync(_0x7de15e)) {
                    throw new _0x26d5cc(_0x7de15e);
                }
                return _0x7de15e;
            }
            {
                const _0x449071 = _0x163d14[_0x4bd062] || 0, _0x3ae845 = _0x1b9be3[_0x1ac1ae] || 0;
                if (_0x467906_cDCGB(_0x449071, _0x3ae845)) {
                    return -1;
                }
                if (_0x467906_CsGyy(_0x449071, _0x3ae845)) {
                    return 1;
                }
            }
        }
        function _0x322386(_0x34ff14, _0x442e10, _0x396ea8) {
            if (_0x467906_SfBqT("DIQbc", "cXqUm")) {
                const _0x213c34 = {};
                return _0x213c34.encoding = FXrUlB.HUOKL, _0x213c34.stdio = [ FXrUlB.RVDiR, FXrUlB.RVDiR, FXrUlB.FQrOj ], 
                _0x213c34.timeout = 12e4, _0x5ae661.execFileSync(_0x51ab60.execPath, [ "-e", _0x5e645b.join("\n") ], _0x213c34).trim() || _0x2d5599;
            }
            {
                const _0x3bad02 = [ "repo-intel", "query", _0x34ff14, ..._0x442e10, "--map-file", _0x467906_XOnTx(_0x2374d0, _0x396ea8), _0x396ea8 ];
                let _0x50110b, _0x2a43cf;
                try {
                    _0x50110b = _0x37988e.runAnalyzer(_0x3bad02);
                } catch (_0x3aee03) {
                    if (!_0x467906_SwPvX("EighG", "EighG")) {
                        throw new Error("repo-intel query failed [" + _0x34ff14 + "]: " + _0x3aee03.message, {
                            cause: _0x3aee03
                        });
                    }
                    {
                        const _0x365a85 = {};
                        _0x365a85.type = FXrUlB.GhMOS, _0x365a85.file = FXrUlB.fehIm, _0x365a85.section = FXrUlB.qbmJL, 
                        _0x365a85.severity = FXrUlB.iUIit, _0x32a0f5.gaps.push(_0x365a85);
                    }
                }
                try {
                    if (!_0x467906_sXbpP("TZIyK", "YEoPj")) {
                        const _0x5bcc02 = {
                            available: !1
                        };
                        return _0x5bcc02.error = "Git analysis failed: " + _0x474185.message, _0x5bcc02;
                    }
                    _0x2a43cf = JSON.parse(_0x50110b);
                } catch (_0x5d3cb8) {
                    if (_0x467906_vDcMw("sOyik", "sOyik")) {
                        const _0x134b68 = _0x50110b.slice(0, 200);
                        throw new Error("repo-intel query [" + _0x34ff14 + "] returned non-JSON output: " + _0x134b68);
                    }
                    {
                        const _0xc13cdb = _0x40f1ce.resolve(_0x5c2722, _0x461c98);
                        if (!InHbBw.xoTPo(_0x490127, _0x482e7c, _0x4ad67f)) {
                            return null;
                        }
                        try {
                            return _0x101cc3.readFileSync(_0xc13cdb, InHbBw.PQgsA);
                        } catch {
                            return null;
                        }
                    }
                }
                return _0x2a43cf;
            }
        }
        function _0x1df337(_0x1f2dfc, _0x1dbd9e) {
            if (_0x467906_GafHD(typeof _0x1f2dfc, "string") || _0x467906_vDcMw(_0x1f2dfc.length, 0)) {
                throw new TypeError(_0x1dbd9e + " must be a non-empty string");
            }
        }
        const _0x54b640 = {};
        _0x54b640.RepoIntelMissingError = _0x26d5cc, _0x54b640.hotspots = function(_0x56f961, _0x13d35b = {}) {
            if (_0x467906_SfBqT("Oxoli", "Oxoli")) {
                const _0x18982a = [];
                return _0x467906_lHzie(_0x13d35b.limit, null) && _0x18982a.push("--top", _0x467906_qPLpe(String, _0x13d35b.limit)), 
                _0x467906_CYats(_0x322386, "hotspots", _0x18982a, _0x56f961);
            }
            _0x36f009 += _0x7cd6e8;
        }, _0x54b640.coupling = function(_0x431c2f, _0x96960a, _0x422dce = {}) {
            if (_0x467906_vDcMw("uTCqG", "uTCqG")) {
                _0x467906_vGipn(_0x1df337, _0x96960a, "coupling: file");
                const _0x4cba07 = [ _0x96960a ];
                return _0x467906_lHzie(_0x422dce.limit, null) && _0x4cba07.push("--top", _0x467906_qPLpe(String, _0x422dce.limit)), 
                _0x467906_CYats(_0x322386, "coupling", _0x4cba07, _0x431c2f);
            }
            {
                const _0x1f905f = InHbBw.AtXcV(_0x394e75, _0x4394cc, _0x4ca379);
                return _0x1f905f.ok ? _0x1f905f.data : null;
            }
        }, _0x54b640.busFactor = function(_0x56320c, _0x2e3480 = {}) {
            if (_0x467906_vDcMw("FfWmI", "FfWmI")) {
                const _0xd269d1 = [];
                return _0x2e3480.adjustForAi && _0xd269d1.push("--adjust-for-ai"), null != _0x2e3480.limit && _0xd269d1.push("--top", String(_0x2e3480.limit)), 
                _0x467906_VYtlR(_0x322386, "bus-factor", _0xd269d1, _0x56320c);
            }
            {
                const _0x28bb4b = fddRuM.shfPK(_0x1b3045);
                if (fddRuM.ZqLJJ(_0x2b4a82, _0x28bb4b, _0x3935b7)) {
                    return _0x567111;
                }
            }
        }, _0x54b640.testGaps = function(_0x205a0b, _0x476104 = {}) {
            const _0x400541 = [];
            return _0x467906_lHzie(_0x476104.limit, null) && _0x400541.push("--top", _0x467906_LTWQJ(String, _0x476104.limit)), 
            null != _0x476104.minChanges && _0x400541.push("--min-changes", _0x467906_qPLpe(String, _0x476104.minChanges)), 
            _0x467906_VYtlR(_0x322386, "test-gaps", _0x400541, _0x205a0b);
        }, _0x54b640.diffRisk = function(_0x4a3250, _0x16b53e) {
            if (_0x467906_LnkEb("xiYQq", "xiYQq")) {
                if (!Array.isArray(_0x16b53e)) {
                    if (_0x467906_glRtR("RVULZ", "RVULZ")) {
                        throw new TypeError("diffRisk: files must be an array of strings");
                    }
                    {
                        const _0x2ff4e2 = new _0x1bc605("Not a regular file: " + _0x585cb3);
                        throw _0x2ff4e2.code = InHbBw.XTnSn, _0x2ff4e2;
                    }
                }
                if (!_0x16b53e.every((_0x5408d1 => "string" == typeof _0x5408d1))) {
                    if (_0x467906_GafHD("EgQyv", "EgQyv")) {
                        return _0x467906_VYtlR(_0x41f995, "project-info", [], _0x4fcd67);
                    }
                    throw new TypeError("diffRisk: all entries in files must be strings");
                }
                const _0x57344b = _0x16b53e.join(",");
                if (_0x467906_CsGyy(_0x57344b.length, 3e4)) {
                    throw new RangeError("diffRisk: files argument exceeds 30000 character limit (got " + _0x57344b.length + ")");
                }
                return _0x467906_VYtlR(_0x322386, "diff-risk", [ "--files", _0x57344b ], _0x4a3250);
            }
            return _0x4d6b76 = _0x457dd5, _0x34e4c1 = _0x2f229e, _0x467906_VYtlR(_0x4d6b76, "onboard", [], _0x34e4c1);
            var _0x4d6b76, _0x34e4c1;
        }, _0x54b640.dependents = function(_0x3fc73b, _0x49324e, _0x1e26e2) {
            if (_0x467906_LnkEb("BKIZC", "BKIZC")) {
                _0x467906_vGipn(_0x1df337, _0x49324e, "dependents: symbol");
                const _0xf2282f = [ _0x49324e ];
                return null != _0x1e26e2 && (_0x467906_AtXcV(_0x1df337, _0x1e26e2, "dependents: file"), 
                _0xf2282f.push("--file", _0x1e26e2)), _0x467906_CYats(_0x322386, "dependents", _0xf2282f, _0x3fc73b);
            }
            iOesrf.UovtL(_0x205a1a, _0x32a516);
        }, _0x54b640.bugspots = function(_0x577835, _0x4463c2 = {}) {
            const _0x408673 = [];
            return null != _0x4463c2.limit && _0x408673.push("--top", String(_0x4463c2.limit)), 
            _0x467906_TLJJP(_0x322386, "bugspots", _0x408673, _0x577835);
        }, _0x54b640.health = function(_0x2375dd) {
            if (_0x467906_SwPvX("HciFH", "amDeN")) {
                return _0x467906_TLJJP(_0x322386, "health", [], _0x2375dd);
            }
            throw new _0x242f6c(_0x1b0dc9);
        }, _0x54b640.communities = function(_0x39b075) {
            return _0x467906_cZUdB("CPBkV", "FXMkc") ? _0x467906_TLJJP(_0x322386, "communities", [], _0x39b075) : uGRwLl.nPbOM;
        }, _0x54b640.boundaries = function(_0x34ec1d, _0x44211d = {}) {
            if (_0x467906_GafHD("BCOmg", "XMPAb")) {
                const _0x250c41 = [];
                return null != _0x44211d.limit && _0x250c41.push("--top", _0x467906_LTWQJ(String, _0x44211d.limit)), 
                _0x467906_WgwYD(_0x322386, "boundaries", _0x250c41, _0x34ec1d);
            }
            _0xdeb828.unlinkSync(_0x16a980);
        }, _0x54b640.areaOf = function(_0x5f20f1, _0x42d558) {
            return _0x467906_glRtR("AecAg", "AecAg") ? (_0x467906_vGipn(_0x1df337, _0x42d558, "areaOf: file"), 
            _0x467906_bsaIU(_0x322386, "area-of", [ _0x42d558 ], _0x5f20f1)) : _0x34f66e.env.AI_STATE_DIR;
        }, _0x54b640.communityHealth = function(_0x5e81c1, _0x1134d1) {
            if (_0x467906_sXbpP("FAFWL", "uyQBA")) {
                if (_0x467906_sXbpP(typeof _0x1134d1, "number") || !Number.isInteger(_0x1134d1) || _0x467906_cDCGB(_0x1134d1, 0)) {
                    throw new TypeError("communityHealth: id must be a non-negative integer");
                }
                return _0x322386("community-health", [ _0x467906_qbWBe(String, _0x1134d1) ], _0x5e81c1);
            }
            _0x1a45b0();
        }, _0x54b640.coldspots = function(_0x477e75, _0x3f1afd = {}) {
            if (_0x467906_cZUdB("UFfbX", "jkboy")) {
                const _0x434c1e = [];
                return _0x467906_lRNEc(_0x3f1afd.limit, null) && _0x434c1e.push("--top", _0x467906_LTWQJ(String, _0x3f1afd.limit)), 
                _0x467906_kARlL(_0x322386, "coldspots", _0x434c1e, _0x477e75);
            }
            _0x49237a = _0x59bd63.parse(_0x1d3481);
        }, _0x54b640.ownership = function(_0xc825e1, _0x4badba) {
            if (!_0x467906_ZDUAY("YRrUq", "YRrUq")) {
                return _0x467906_AtXcV(_0x1df337, _0x4badba, "ownership: file"), _0x467906_CYats(_0x322386, "ownership", [ _0x4badba ], _0xc825e1);
            }
            nyrhBc.KZBBg(_0x5e945e, _0xdf4577);
        }, _0x54b640.norms = function(_0x1deeef) {
            return _0x467906_jLwDt(_0x322386, "norms", [], _0x1deeef);
        }, _0x54b640.areas = function(_0x1d4ea5) {
            if (_0x467906_sXbpP("KOoba", "rtnOA")) {
                return _0x467906_BQiaH(_0x322386, "areas", [], _0x1d4ea5);
            }
            {
                const _0x5add69 = _0xde55e7.load(_0x4e2418), _0x5d2db6 = {
                    available: !0
                };
                return _0x5d2db6.map = _0x5add69, _0x5d2db6.fallbackReason = null, _0x5d2db6;
            }
        }, _0x54b640.contributors = function(_0x31f2d1, _0x22a1ee = {}) {
            {
                const _0x51612f = [];
                return null != _0x22a1ee.limit && _0x51612f.push("--top", String(_0x22a1ee.limit)), 
                _0x467906_BQiaH(_0x322386, "contributors", _0x51612f, _0x31f2d1);
            }
        }, _0x54b640.releaseInfo = function(_0x3bf496) {
            if (_0x467906_HTdnK("aJXks", "dFEAb")) {
                return _0x467906_jLwDt(_0x322386, "release-info", [], _0x3bf496);
            }
            {
                const _0x1c56df = {};
                return _0x1c56df.encoding = _0xd4246d, _0x1c56df.mode = _0x47a4cd, _0xfae94.writeFileSync(_0x437d26, _0x272a96, _0x1c56df), 
                _0x3ba0e0.renameSync(_0x2b80cc, _0x3021f1), !0;
            }
        }, _0x54b640.fileHistory = function(_0x32a0c3, _0x36e5b8) {
            return _0x1df337(_0x36e5b8, "fileHistory: file"), _0x467906_BQiaH(_0x322386, "file-history", [ _0x36e5b8 ], _0x32a0c3);
        }, _0x54b640.conventions = function(_0x42ee82) {
            if (!_0x467906_LnkEb("ADyMy", "SnGvD")) {
                return _0x322386("conventions", [], _0x42ee82);
            }
            _0x286f7c.push(_0x3c56eb);
        }, _0x54b640.docDrift = function(_0x1789d6, _0x422498 = {}) {
            const _0x16252e = [];
            return null != _0x422498.limit && _0x16252e.push("--top", _0x467906_XOnTx(String, _0x422498.limit)), 
            _0x467906_wspQY(_0x322386, "doc-drift", _0x16252e, _0x1789d6);
        }, _0x54b640.onboard = function(_0x5d9696) {
            return _0x322386("onboard", [], _0x5d9696);
        }, _0x54b640.canIHelp = function(_0x3aaf0f) {
            if (!_0x467906_HTdnK("QezKf", "QezKf")) {
                return _0x467906_bsaIU(_0x322386, "can-i-help", [], _0x3aaf0f);
            }
            {
                const _0x24b62b = {};
                _0x24b62b.type = LNltQC.usqWr, _0x24b62b.file = LNltQC.lHbPl, _0x24b62b.severity = LNltQC.ZbjGQ, 
                _0x4cd09e.gaps.push(_0x24b62b);
            }
        }, _0x54b640.painspots = function(_0x24460f, _0x212ef8 = {}) {
            const _0x236d4b = [];
            return null != _0x212ef8.limit && _0x236d4b.push("--top", String(_0x212ef8.limit)), 
            _0x467906_bsaIU(_0x322386, "painspots", _0x236d4b, _0x24460f);
        }, _0x54b640.entryPoints = function(_0x24f46d, _0x489e5c = {}) {
            const _0x252da5 = [];
            if (_0x489e5c.files) {
                const _0x1353bb = Array.isArray(_0x489e5c.files) ? _0x489e5c.files.join(",") : String(_0x489e5c.files);
                _0x252da5.push("--files", _0x1353bb);
            }
            return _0x467906_tJWLV(_0x322386, "entry-points", _0x252da5, _0x24f46d);
        }, _0x54b640.projectInfo = function(_0x4f680a) {
            return _0x467906_wspQY(_0x322386, "project-info", [], _0x4f680a);
        }, _0x54b640.symbols = function(_0x243dad, _0x2963c6) {
            return _0x1df337(_0x2963c6, "symbols: file"), _0x467906_tJWLV(_0x322386, "symbols", [ _0x2963c6 ], _0x243dad);
        }, _0x54b640.staleDocs = function(_0x48ee02, _0x539d64 = {}) {
            if (_0x467906_cZUdB("WwlDZ", "ypJLB")) {
                const _0x273132 = [];
                return _0x467906_lHzie(_0x539d64.limit, null) && _0x273132.push("--top", _0x467906_hEFgA(String, _0x539d64.limit)), 
                _0x322386("stale-docs", _0x273132, _0x48ee02);
            }
            return _0x121892.readFileSync(_0x46e473, hfztKx.pOqdN);
        }, _0x54b640.find = function(_0x4f9573, _0x22862d, _0x1de48e = {}) {
            {
                _0x467906_AtXcV(_0x1df337, _0x22862d, "find: query");
                const _0x35fe51 = [ _0x22862d ];
                return null != _0x1de48e.limit && _0x35fe51.push("--top", _0x467906_aqqvu(String, _0x1de48e.limit)), 
                _0x467906_WgwYD(_0x322386, "find", _0x35fe51, _0x4f9573);
            }
        }, _0x54b640.slopFixes = function(_0x3ce422) {
            if (!_0x467906_SwPvX("XcYUa", "XcYUa")) {
                return _0x467906_kARlL(_0x322386, "slop-fixes", [], _0x3ce422);
            }
            try {
                return OHEEpd.QRfcb(_0xb5f288, OHEEpd.jRHih, [ OHEEpd.Bhhcx, OHEEpd.CAYue, OHEEpd.UKMld ], {
                    cwd: _0x1ef313,
                    encoding: OHEEpd.OdJPy,
                    stdio: [ OHEEpd.cJycG, OHEEpd.cJycG, OHEEpd.cJycG ]
                }).trim();
            } catch {
                return null;
            }
        }, _0x54b640.slopTargets = function(_0x5f3ab1, _0x5311be = {}) {
            const _0x412890 = [];
            return null != _0x5311be.top && _0x412890.push("--top", String(_0x5311be.top)), 
            _0x467906_jLwDt(_0x322386, "slop-targets", _0x412890, _0x5f3ab1);
        }, _0x54b640.summary = function(_0x57dbca, _0x428bc8 = {}) {
            var _0x4ab34c, _0x159879, _0x47c3de;
            {
                const _0x49104f = _0x467906_qbWBe(_0x2374d0, _0x57dbca), _0x3d08cd = [];
                null != _0x428bc8.depth && _0x3d08cd.push("--depth", _0x467906_aqqvu(String, _0x428bc8.depth));
                const _0x5aa134 = [ "repo-intel", "query", "summary", ..._0x3d08cd, "--map-file", _0x49104f, _0x57dbca ];
                let _0x3e45cc;
                try {
                    _0x3e45cc = _0x37988e.runAnalyzer(_0x5aa134).trim();
                } catch (_0x9396d) {
                    throw new Error("repo-intel query failed [summary]: " + _0x9396d.message, {
                        cause: _0x9396d
                    });
                }
                if ("null" === _0x3e45cc) {
                    return null;
                }
                if (_0x467906_lRNEc(_0x428bc8.depth, null)) {
                    return _0x3e45cc;
                }
                try {
                    return JSON.parse(_0x3e45cc);
                } catch (_0x5dd6cd) {
                    if (_0x467906_ZDUAY("dKHcb", "twmxr")) {
                        throw new Error("repo-intel query [summary] returned non-JSON output: " + _0x3e45cc.slice(0, 200));
                    }
                    _0x30609e.push({
                        type: "code-example",
                        severity: "medium",
                        line: (_0x4ab34c = _0x32704c, _0x159879 = _0x2c7b83, _0x47c3de = _0x5931d6[0], _0x4ab34c(_0x159879, _0x47c3de)),
                        current: _0x24e2c1[0],
                        suggestion: "Verify import path is still valid"
                    });
                }
            }
        }, _0x2c749a.exports = _0x54b640;
    }
}), require_preference = __commonJS({
    "../work/agent-sh__agentsys/lib/repo-intel/embed/preference.js"(_0x139bc3, _0x2ecc86) {
        const _0x57b24d_ujQJs = function(_0x4229de, _0xb6d5fe) {
            return _0x4229de === _0xb6d5fe;
        }, _0x57b24d_WhaYw = function(_0x4b3c43, _0x21c91f) {
            return _0x4b3c43(_0x21c91f);
        }, _0x57b24d_vsEKB = function(_0x333b02, _0x3fb1dd) {
            return _0x333b02 !== _0x3fb1dd;
        }, _0x57b24d_WwWKo = function(_0x3a6938, _0x4df10e) {
            return _0x3a6938(_0x4df10e);
        };
        var _0x20c0c7 = require("fs"), _0x32a59c = require("path"), _0x41021c = require_cache(), _0x3331ac = [ "none", "small", "big" ], _0x12070b = [ "compact", "balanced", "maximum" ];
        function _0xd5b23f(_0x4cde51) {
            if (_0x57b24d_ujQJs("HKAxX", "HKAxX")) {
                return _0x32a59c.join(_0x41021c.getStateDirPath(_0x4cde51), "sources", "preference.json");
            }
            {
                const _0x147aa4 = {};
                _0x147aa4.type = MkLUsM.phfKZ, _0x147aa4.file = MkLUsM.mEglu, _0x147aa4.severity = MkLUsM.ucycL, 
                _0x27124a.gaps.push(_0x147aa4);
            }
        }
        function _0x37a08f(_0x26eada) {
            {
                const _0x365809 = _0x57b24d_WhaYw(_0xd5b23f, _0x26eada);
                if (!_0x20c0c7.existsSync(_0x365809)) {
                    return {};
                }
                try {
                    const _0xead58 = JSON.parse(_0x20c0c7.readFileSync(_0x365809, "utf8"));
                    return _0xead58 && _0x57b24d_ujQJs(typeof _0xead58, "object") ? _0xead58 : {};
                } catch (_0x20805e) {
                    return {};
                }
            }
        }
        const _0x18dcf4 = {};
        _0x18dcf4.read = _0x37a08f, _0x18dcf4.update = function(_0x42b0c1, _0x261933) {
            if (!_0x57b24d_vsEKB("rLkDz", "rLkDz")) {
                const _0x24da1c = _0x57b24d_WhaYw(_0x37a08f, _0x42b0c1), _0x1fa003 = Object.assign({}, _0x24da1c, _0x261933 || {}), _0x4e2c11 = _0xd5b23f(_0x42b0c1), _0x153af6 = {
                    recursive: !0
                };
                return _0x20c0c7.mkdirSync(_0x32a59c.dirname(_0x4e2c11), _0x153af6), _0x20c0c7.writeFileSync(_0x4e2c11, JSON.stringify(_0x1fa003, null, 2)), 
                _0x1fa003;
            }
            _0xd50aa6.clear();
        }, _0x18dcf4.reset = function(_0x5db1ba) {
            const _0x4751e3 = _0x57b24d_WwWKo(_0x37a08f, _0x5db1ba);
            delete _0x4751e3.embedder, delete _0x4751e3.embedderDetail;
            const _0x2baf13 = _0x57b24d_WwWKo(_0xd5b23f, _0x5db1ba);
            _0x20c0c7.mkdirSync(_0x32a59c.dirname(_0x2baf13), {
                recursive: !0
            }), _0x20c0c7.writeFileSync(_0x2baf13, JSON.stringify(_0x4751e3, null, 2));
        }, _0x18dcf4.hasEmbedderChoice = function(_0x83c518) {
            if (_0x57b24d_vsEKB("QVmWz", "ajLrN")) {
                const _0x353623 = _0x37a08f(_0x83c518);
                return _0x3331ac.includes(_0x353623.embedder);
            }
            {
                const _0x348d9d = kfNGMw.iloAa(_0x3cceab, _0x1db5fd);
                return _0x348d9d ? {
                    generated: _0x348d9d.generated,
                    updated: _0x348d9d.updated,
                    commit: _0x348d9d.git?.commit,
                    branch: _0x348d9d.git?.branch,
                    files: _0x7afb13.keys(_0x348d9d.files || {}).length,
                    symbols: _0x348d9d.stats?.totalSymbols || 0,
                    languages: _0x348d9d.project?.languages || []
                } : null;
            }
        }, _0x18dcf4.hasDetailChoice = function(_0x1ed776) {
            {
                const _0x239a7b = _0x57b24d_WwWKo(_0x37a08f, _0x1ed776);
                return _0x12070b.includes(_0x239a7b.embedderDetail);
            }
        }, _0x18dcf4.detailToCliArg = function(_0x5e0a80) {
            switch (_0x5e0a80) {
              case "compact":
                return "compact";

              case "maximum":
                return "maximum";

              default:
                return "balanced";
            }
        }, _0x18dcf4.preferencePath = _0xd5b23f, _0x18dcf4.VALID_EMBEDDER = _0x3331ac, _0x18dcf4.VALID_DETAIL = _0x12070b, 
        _0x2ecc86.exports = _0x18dcf4;
    }
}), require_shared_helpers = __commonJS({
    "../work/agent-sh__agentsys/lib/binary/shared-helpers.js"(_0x55ac76, _0x24e277) {
        const _0x1e1b36_QoRAO = function(_0x18356a) {
            return _0x18356a();
        }, _0x1e1b36_vCszO = function(_0xda0898, _0x2e7727) {
            return _0xda0898 !== _0x2e7727;
        }, _0x1e1b36_GPVIO = function(_0x4a6412, _0x3178f8) {
            return _0x4a6412 === _0x3178f8;
        }, _0x1e1b36_BYHtc = function(_0x2dbade, _0x4cae5) {
            return _0x2dbade === _0x4cae5;
        }, _0x1e1b36_nBDXQ = function(_0x226791, _0xf2262a) {
            return _0x226791 === _0xf2262a;
        }, _0x1e1b36_LxJqU = function(_0x49605d, _0x253bfd) {
            return _0x49605d + _0x253bfd;
        }, _0x1e1b36_ElNAF = function(_0x25de93, _0x51fca1, _0x3a3810) {
            return _0x25de93(_0x51fca1, _0x3a3810);
        }, _0x1e1b36_qUKpK = function(_0x3bd69e, _0x5ea9db) {
            return _0x3bd69e + _0x5ea9db;
        }, _0x1e1b36_CHCVx = function(_0x100f8f, _0x15508e) {
            return _0x100f8f === _0x15508e;
        }, _0x1e1b36_beHwj = function(_0x131b1f, _0x5c926d) {
            return _0x131b1f(_0x5c926d);
        }, _0x1e1b36_mkgMz = function(_0x22f501, _0x14d698) {
            return _0x22f501 + _0x14d698;
        }, _0x1e1b36_hwFPt = function(_0x495d4e, _0x5c2589) {
            return _0x495d4e(_0x5c2589);
        }, _0x1e1b36_obAVF = function(_0x4a1238, _0x59b9a2) {
            return _0x4a1238 !== _0x59b9a2;
        };
        var _0x510398 = _0x1e1b36_hwFPt(require, "fs"), _0x151590 = require("path"), _0x9d390e = require("os"), _0x2cf535 = _0x1e1b36_beHwj(require, "https"), _0x273a71 = require("child_process");
        const _0x1e4d8e = {
            downloadToBuffer: function(_0x2cbc45, _0xa2c7a9) {
                const _0x2da290_YUEQf = function(_0x12fe9d, _0x5b60f1) {
                    return _0x1e1b36_CHCVx(_0x12fe9d, _0x5b60f1);
                }, _0x2da290_FCeAR = function(_0x834550, _0x100d9d) {
                    return _0x1e1b36_hwFPt(_0x834550, _0x100d9d);
                }, _0x2da290_SCfjS = function(_0x5ad5f6, _0x3b8a2c) {
                    return _0x1e1b36_LxJqU(_0x5ad5f6, _0x3b8a2c);
                }, _0x1c8fc5 = _0xa2c7a9 || {}, _0xe99fe7 = _0x1c8fc5.userAgent || "agent-sh/binary-resolver", _0x4a3f7d = _0x1c8fc5.timeoutMs || 3e4;
                return new Promise((function(_0xbcc8a4, _0x375621) {
                    const _0x553523_eYjgc = function(_0x1d76ae, _0x31abeb) {
                        return _0x1e1b36_vCszO(_0x1d76ae, _0x31abeb);
                    }, _0x553523_yVAwf = function(_0x24cf84, _0x19cbca) {
                        return _0x1e1b36_GPVIO(_0x24cf84, _0x19cbca);
                    }, _0x553523_vlHex = function(_0x5eafcf, _0x2b0b3f) {
                        return _0x1e1b36_nBDXQ(_0x5eafcf, _0x2b0b3f);
                    }, _0x553523_gofEp = function(_0x22ff0d, _0x1b442e) {
                        return _0x1e1b36_mkgMz(_0x22ff0d, _0x1b442e);
                    }, _0x163194 = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
                    _0x1e1b36_ElNAF((function _0x2d5469(_0x43649c, _0x5cd584) {
                        const _0x14e343_MGFFz = function(_0x49c8c0, _0x2e9d4b) {
                            return _0x2da290_SCfjS(_0x49c8c0, _0x2e9d4b);
                        };
                        if (_0x5cd584 > 5) {
                            return void _0x2da290_FCeAR(_0x375621, new Error(_0x2da290_SCfjS("Too many redirects fetching from ", _0x2cbc45)));
                        }
                        const _0x5c2000 = {};
                        _0x5c2000["User-Agent"] = _0xe99fe7, _0x5c2000.Accept = "application/octet-stream";
                        const _0x4cd4d4 = _0x5c2000;
                        _0x163194 && (_0x4cd4d4.Authorization = "Bearer " + _0x163194);
                        const _0x1c2faf = {};
                        _0x1c2faf.headers = _0x4cd4d4, _0x1c2faf.timeout = _0x4a3f7d;
                        const _0x27d95f = _0x2cf535.get(_0x43649c, _0x1c2faf, (function(_0x2bb990) {
                            if (_0x553523_eYjgc("JTLmT", "JTLmT")) {
                                const _0x53d7a4 = {
                                    userAgent: "agent-sh/embed-resolver"
                                };
                                return _0x9bba1d.downloadToBuffer(_0x52dc95, _0x53d7a4);
                            }
                            {
                                const _0x21f4ae = _0x2bb990.statusCode;
                                if (_0x553523_yVAwf(_0x21f4ae, 301) || _0x553523_yVAwf(_0x21f4ae, 302) || _0x553523_yVAwf(_0x21f4ae, 307) || _0x553523_yVAwf(_0x21f4ae, 308)) {
                                    if (!_0x1e1b36_BYHtc("RONLV", "nrybE")) {
                                        _0x2bb990.resume();
                                        var _0x35d3e7 = _0x2bb990.headers.location;
                                        return _0x35d3e7 && !_0x35d3e7.startsWith("https://") ? _0x553523_vlHex("qNbkl", "WAxmA") ? {
                                            ok: !0,
                                            data: _0x56ceb5.parse(_0x4e433f)
                                        } : void _0x375621(new Error(_0x1e1b36_LxJqU("Refusing non-HTTPS redirect to ", _0x35d3e7))) : (_0x25ec34 = _0x2d5469, 
                                        _0x2f210a = _0x35d3e7, _0x2829f9 = _0x1e1b36_qUKpK(_0x5cd584, 1), void _0x1e1b36_ElNAF(_0x25ec34, _0x2f210a, _0x2829f9));
                                    }
                                    {
                                        const _0x2d70a2 = RnvYvZ.DIfYr(_0x27a584.resolve(_0xaa378c), _0x5bd3a7.sep), _0x1d6765 = _0x25c13c.resolve(_0x54edc2);
                                        if (RnvYvZ.NyKgS(_0x1d6765, _0x5e21f8.resolve(_0x5246cd)) && !_0x1d6765.startsWith(_0x2d70a2)) {
                                            throw new _0xb0ba92(RnvYvZ.DIfYr(RnvYvZ.kjqpb, _0x414ce3));
                                        }
                                    }
                                }
                                if (_0x553523_eYjgc(_0x21f4ae, 200)) {
                                    if (_0x1e1b36_CHCVx("ISGmn", "hBKvA")) {
                                        return _0x37fa06.existsSync((_0xb42cd9 = _0x15d575, _0x1e1b36_QoRAO(_0xb42cd9)));
                                    }
                                    {
                                        _0x2bb990.resume();
                                        const _0x467e80 = _0x553523_vlHex(_0x21f4ae, 403) ? " (rate limited - set GITHUB_TOKEN env var)" : "";
                                        return _0x265c91 = _0x375621, _0xe3cbdd = new Error(_0x553523_gofEp(_0x553523_gofEp((_0x18f87e = _0x1e1b36_LxJqU("HTTP ", _0x21f4ae), 
                                        _0x1e1b36_qUKpK(_0x18f87e, _0x467e80)), " fetching "), _0x43649c)), void _0x1e1b36_beHwj(_0x265c91, _0xe3cbdd);
                                    }
                                }
                                const _0x45c582 = [];
                                _0x2bb990.on("data", (function(_0x1604f2) {
                                    if (!_0x2da290_YUEQf("WnHco", "WnHco")) {
                                        throw new _0x3203c7("applySummary requires {depth1, depth3, depth10, inputHash}");
                                    }
                                    _0x45c582.push(_0x1604f2);
                                })), _0x2bb990.on("end", (function() {
                                    var _0x42312b, _0x2e97bb;
                                    _0x42312b = _0xbcc8a4, _0x2e97bb = Buffer.concat(_0x45c582), _0x2da290_FCeAR(_0x42312b, _0x2e97bb);
                                })), _0x2bb990.on("error", _0x375621);
                            }
                            var _0xb42cd9, _0x265c91, _0xe3cbdd, _0x18f87e, _0x25ec34, _0x2f210a, _0x2829f9;
                        }));
                        _0x27d95f.on("error", _0x375621), _0x27d95f.on("timeout", (function() {
                            if (_0x2da290_YUEQf("hNWMh", "IkNiB")) {
                                const _0x1681e9 = {
                                    ..._0x10e977
                                };
                                _0x1681e9.structure = _0x380a29, RnvYvZ.jqZNy(_0x46f692, _0x1681e9, _0xd79e6d), 
                                _0x19c52d.symbols = RnvYvZ.erjXz(_0x53436f, _0x1e445c, _0x2061fa.topLevelDirs);
                            } else {
                                _0x27d95f.destroy(), _0x21763e = _0x375621, _0x17c827 = new Error((_0x2a3e4e = _0x14e343_MGFFz(_0x14e343_MGFFz("Timeout (", _0x4a3f7d), "ms) fetching "), 
                                _0x1e1b36_mkgMz(_0x2a3e4e, _0x43649c))), _0x1e1b36_beHwj(_0x21763e, _0x17c827);
                            }
                            var _0x21763e, _0x17c827, _0x2a3e4e;
                        }));
                    }), _0x2cbc45, 0);
                }));
            },
            extractTarGz: function(_0x5407dc, _0x2d9e46) {
                const _0xfee69e = {
                    WtqfK: function(_0x19b679, _0x38e45d, _0x5b9b52) {
                        return _0x19b679(_0x38e45d, _0x5b9b52);
                    },
                    szfOR: "find: query",
                    pmFgg: function(_0x4a4b5a, _0x73f7ae) {
                        return _0x4a4b5a != _0x73f7ae;
                    },
                    TcbaA: "--top",
                    LLuDW: function(_0x2fdfef, _0x390e5d) {
                        return _0x1e1b36_hwFPt(_0x2fdfef, _0x390e5d);
                    },
                    dPKpX: function(_0x12d129, _0x489e4c, _0x1a4615, _0xb0378) {
                        return _0x12d129(_0x489e4c, _0x1a4615, _0xb0378);
                    },
                    aQCYF: "find",
                    KLIIA: function(_0x231b47, _0x2dcd97) {
                        return _0x1e1b36_obAVF(_0x231b47, _0x2dcd97);
                    },
                    CTVaD: function(_0x58f8c4, _0x2093b3) {
                        return _0x1e1b36_qUKpK(_0x58f8c4, _0x2093b3);
                    },
                    bNXWq: function(_0x3360da, _0x175465) {
                        return _0x1e1b36_qUKpK(_0x3360da, _0x175465);
                    },
                    hsUoW: function(_0x2001b7, _0x173056) {
                        return _0x2001b7 + _0x173056;
                    },
                    QNuWa: "tar extraction failed (code ",
                    NarTh: "): ",
                    csbln: function(_0x5f30ef) {
                        return _0x1e1b36_QoRAO(_0x5f30ef);
                    },
                    NyaRg: function(_0x21e0df, _0x5d8f58) {
                        return _0x21e0df === _0x5d8f58;
                    },
                    tQkPv: "vgoWH",
                    XVMcV: "NAnVI",
                    CHmxl: "win32",
                    iyRlm: "tar",
                    Plzeg: "pipe",
                    gxdbJ: "data",
                    CaKJQ: "close",
                    yEtYG: "error",
                    mXvXS: "3|2|0|1|4",
                    hlobz: "https://",
                    gYZEN: function(_0x3b0c55, _0x1cef87) {
                        return _0x3b0c55(_0x1cef87);
                    },
                    fxAAc: "Refusing non-HTTPS redirect to ",
                    HstiP: function(_0x4466ce, _0x37aa81, _0x181632) {
                        return _0x4466ce(_0x37aa81, _0x181632);
                    },
                    FDtDh: function(_0x438fa2, _0x3ff200) {
                        return _0x438fa2 + _0x3ff200;
                    }
                };
                if (_0x1e1b36_BYHtc("YGXVp", "YGXVp")) {
                    return new Promise((function(_0x1f9648, _0x35c4fa) {
                        const _0x4f262c = {
                            FoGtq: function(_0x368597, _0x1c0882, _0x2c3064) {
                                return _0xfee69e.WtqfK(_0x368597, _0x1c0882, _0x2c3064);
                            },
                            MBpqp: _0xfee69e.szfOR,
                            drOxQ: function(_0x9b8d20, _0x2ee781) {
                                return _0xfee69e.pmFgg(_0x9b8d20, _0x2ee781);
                            },
                            PiGOn: _0xfee69e.TcbaA,
                            dFEEF: function(_0x2c75b7, _0x35a3b3) {
                                return _0xfee69e.LLuDW(_0x2c75b7, _0x35a3b3);
                            },
                            owBZN: function(_0x3f22c4, _0x3dc806, _0x12eae7, _0x1a856e) {
                                return _0xfee69e.dPKpX(_0x3f22c4, _0x3dc806, _0x12eae7, _0x1a856e);
                            },
                            bEkyr: _0xfee69e.aQCYF,
                            CVcaw: function(_0x7779d7, _0x3a3d60) {
                                return _0xfee69e.KLIIA(_0x7779d7, _0x3a3d60);
                            },
                            jSFfD: function(_0x47f63a, _0x420e1d) {
                                return _0xfee69e.CTVaD(_0x47f63a, _0x420e1d);
                            },
                            JzwXO: function(_0x44513a, _0x771c0) {
                                return _0xfee69e.bNXWq(_0x44513a, _0x771c0);
                            },
                            DpmgI: function(_0x7c1a9, _0x279e3e) {
                                return _0xfee69e.hsUoW(_0x7c1a9, _0x279e3e);
                            },
                            MUOuH: _0xfee69e.QNuWa,
                            OOrih: _0xfee69e.NarTh,
                            FVDCc: function(_0x304242) {
                                return _0xfee69e.csbln(_0x304242);
                            }
                        };
                        if (_0xfee69e.NyaRg(_0xfee69e.tQkPv, _0xfee69e.XVMcV)) {
                            yQwjRs.FoGtq(_0x1e5ab2, _0x2737bd, yQwjRs.MBpqp);
                            const _0x1856fe = [ _0x4caef1 ];
                            return yQwjRs.drOxQ(_0x13a349.limit, null) && _0x1856fe.push(yQwjRs.PiGOn, yQwjRs.dFEEF(_0x111cca, _0x5e69fe.limit)), 
                            yQwjRs.owBZN(_0x4a880d, yQwjRs.bEkyr, _0x1856fe, _0x220c0d);
                        }
                        {
                            const _0x2fd288 = _0xfee69e.NyaRg(process.platform, _0xfee69e.CHmxl) ? _0x2d9e46.replace(/\\/g, "/") : _0x2d9e46, _0x219bd2 = _0x273a71.spawn(_0xfee69e.iyRlm, [ "xz", "-C", _0x2fd288 ], {
                                stdio: [ _0xfee69e.Plzeg, _0xfee69e.Plzeg, _0xfee69e.Plzeg ]
                            });
                            let _0x1a9b63 = "";
                            _0x219bd2.stderr.on(_0xfee69e.gxdbJ, (function(_0x4087ed) {
                                _0x1a9b63 += _0x4087ed;
                            })), _0x219bd2.stdin.write(_0x5407dc), _0x219bd2.stdin.end(), _0x219bd2.on(_0xfee69e.CaKJQ, (function(_0x2b65a2) {
                                _0x4f262c.CVcaw(_0x2b65a2, 0) ? _0x4f262c.dFEEF(_0x35c4fa, new Error(_0x4f262c.jSFfD(_0x4f262c.JzwXO(_0x4f262c.DpmgI(_0x4f262c.MUOuH, _0x2b65a2), _0x4f262c.OOrih), _0x1a9b63))) : _0x4f262c.FVDCc(_0x1f9648);
                            })), _0x219bd2.on(_0xfee69e.yEtYG, _0x35c4fa);
                        }
                    }));
                }
                {
                    const _0x2ba24e = _0xfee69e.mXvXS.split("|");
                    let _0x57961f = 0;
                    for (;;) {
                        switch (_0x2ba24e[_0x57961f++]) {
                          case "0":
                            if (_0x1f69f8 && !_0x1f69f8.startsWith(vjraCY.hlobz)) {
                                return void vjraCY.gYZEN(_0x30f89, new _0x5d2a3e(vjraCY.hsUoW(vjraCY.fxAAc, _0x1f69f8)));
                            }
                            continue;

                          case "1":
                            vjraCY.HstiP(_0x349c60, _0x1f69f8, vjraCY.FDtDh(_0x3a9e4f, 1));
                            continue;

                          case "2":
                            var _0x1f69f8 = _0x6c0f6.headers.location;
                            continue;

                          case "3":
                            _0x4eba86.resume();
                            continue;

                          case "4":
                            return;
                        }
                        break;
                    }
                }
            },
            extractZip: function(_0x46b009, _0x2c2c53, _0x40de3b) {
                const _0x1c08ac_IdArJ = function(_0x1b04c3, _0x545bd3) {
                    return _0x1e1b36_vCszO(_0x1b04c3, _0x545bd3);
                };
                return _0x1e1b36_GPVIO("CgQGo", "thQzX") ? (_0x1e226f.isStale = !0, _0x23cd91.reason = UrwlTN.xCwZc, 
                _0x45205a.suggestFullRebuild = !0, _0xffe33e) : new Promise((function(_0x464477, _0x3cd11f) {
                    if (!_0x1e1b36_nBDXQ("sJZID", "sJZID")) {
                        return [];
                    }
                    var _0x4e2cfa = _0x510398.mkdtempSync(_0x151590.join(_0x9d390e.tmpdir(), _0x40de3b + "-")), _0x163465 = _0x151590.join(_0x4e2cfa, "archive.zip");
                    _0x510398.writeFileSync(_0x163465, _0x46b009);
                    var _0x3e3b96 = _0x273a71.spawn("powershell", [ "-NoProfile", "-NonInteractive", "-Command", "Expand-Archive", "-Path", _0x163465, "-DestinationPath", _0x2c2c53, "-Force" ], {
                        stdio: [ "ignore", "pipe", "pipe" ]
                    }), _0x54f919 = "";
                    _0x3e3b96.stderr.on("data", (function(_0x2c2849) {
                        _0x54f919 += _0x2c2849;
                    })), _0x3e3b96.on("close", (function(_0x295eaf) {
                        if (_0x1c08ac_IdArJ("vGTyL", "vGTyL")) {
                            const _0x1c6211 = koewSU.vSuXV(koewSU.aKkPL(_0x4fbfeb.platform, "-"), _0x5db3e5.arch);
                            return _0xaac8e2[_0x1c6211] || null;
                        }
                        try {
                            if (_0x1c08ac_IdArJ("SbofW", "SbofW")) {
                                _0x1f7596.isStale = !0, _0x2fb6b6.commitsBehind = _0x20f2cd, !_0xbb7291.reason && (_0x239058.reason = _0x3c91d3 + " commits behind HEAD");
                            } else {
                                const _0x107238 = {
                                    recursive: !0,
                                    force: !0
                                };
                                _0x510398.rmSync(_0x4e2cfa, _0x107238);
                            }
                        } catch (_0x43eb62) {}
                        var _0x957414;
                        0 !== _0x295eaf ? _0x1e1b36_obAVF("RpDGB", "RpDGB") ? _0x296dca.code = _0x2c42a6.scanCodebase(_0x43acb8) : _0x3cd11f(new Error((_0x957414 = _0x1e1b36_mkgMz("zip extraction failed (code ", _0x295eaf), 
                        _0x1e1b36_qUKpK(_0x957414, "): ") + _0x54f919))) : _0x1e1b36_QoRAO(_0x464477);
                    })), _0x3e3b96.on("error", _0x3cd11f);
                }));
            },
            DEFAULT_DOWNLOAD_TIMEOUT_MS: 3e4
        };
        _0x24e277.exports = _0x1e4d8e;
    }
}), require_binary2 = __commonJS({
    "../work/agent-sh__agentsys/lib/repo-intel/embed/binary.js"(_0x277958, _0x18b3b7) {
        const _0x4fc10d_TQhke = function(_0x54f122, _0x405321) {
            return _0x54f122 === _0x405321;
        }, _0x4fc10d_gxgev = function(_0x1304af, _0x39a4e8) {
            return _0x1304af + _0x39a4e8;
        }, _0x4fc10d_fYWcU = function(_0x599110, _0x27c578) {
            return _0x599110 === _0x27c578;
        }, _0x4fc10d_EsWPA = function(_0x9785a1) {
            return _0x9785a1();
        }, _0x4fc10d_EduKk = function(_0x501843, _0x586e30) {
            return _0x501843 !== _0x586e30;
        }, _0x4fc10d_fXuNz = function(_0x321be7, _0x4daf16) {
            return _0x321be7 + _0x4daf16;
        }, _0x4fc10d_XsoQF = function(_0x1846f1, _0x151d49) {
            return _0x1846f1 !== _0x151d49;
        }, _0x4fc10d_FdByr = function(_0x12e62e) {
            return _0x12e62e();
        }, _0x4fc10d_KQmxD = function(_0x3dc152) {
            return _0x3dc152();
        }, _0x4fc10d_VRnnD = function(_0x3527d3, _0x245318) {
            return _0x3527d3 === _0x245318;
        }, _0x4fc10d_EYtIV = function(_0x2430b2, _0x38afab) {
            return _0x2430b2(_0x38afab);
        }, _0x4fc10d_NGxdy = function(_0x582724, _0x5b468e) {
            return _0x582724 === _0x5b468e;
        }, _0x4fc10d_yWkQB = function(_0x4d8981, _0xb9b445) {
            return _0x4d8981(_0xb9b445);
        }, _0x4fc10d_YcswA = function(_0x20b571, _0x271837) {
            return _0x20b571 + _0x271837;
        }, _0x4fc10d_zIRge = function(_0x52a6c9, _0x26b112) {
            return _0x52a6c9 === _0x26b112;
        }, _0x4fc10d_yzqgs = function(_0x565fc8, _0x27a4b0) {
            return _0x565fc8 + _0x27a4b0;
        }, _0x4fc10d_ovsUa = function(_0x111957, _0x20bc47) {
            return _0x111957 !== _0x20bc47;
        }, _0x4fc10d_RWLIz = function(_0x12d8ca, _0x51ef31) {
            return _0x12d8ca + _0x51ef31;
        }, _0x4fc10d_NyxTG = function(_0x3cb902, _0x399c24) {
            return _0x3cb902 + _0x399c24;
        }, _0x4fc10d_pTdgC = function(_0x562ad9, _0x555121) {
            return _0x562ad9 + _0x555121;
        }, _0x4fc10d_mUHLQ = function(_0x2ad903, _0xb369d) {
            return _0x2ad903 !== _0xb369d;
        }, _0x4fc10d_eMFhn = function(_0xb7e45f) {
            return _0xb7e45f();
        }, _0x4fc10d_Tncyj = function(_0x3822a8, _0x537d99) {
            return _0x3822a8(_0x537d99);
        }, _0x4fc10d_htvQo = function(_0x354129, _0x4ca5ba) {
            return _0x354129 * _0x4ca5ba;
        };
        var _0x63669 = _0x4fc10d_Tncyj(require, "fs"), _0x5c9331 = _0x4fc10d_Tncyj(require, "path"), _0x4d3e4d = require("os"), _0x4a8997 = require("https"), _0x18b7b7 = _0x4fc10d_yWkQB(require, "child_process"), _0x1d4472 = _0x4fc10d_KQmxD(require_binary), _0x490d1e = _0x4fc10d_eMFhn(require_shared_helpers), _0x24500f = "agent-analyzer-embed", _0x258112 = _0x4fc10d_htvQo(_0x4fc10d_htvQo(60, 60), 1e3), _0x548706 = _0x1d4472.PLATFORM_MAP;
        function _0x447912() {
            const _0x2b7c67 = _0x4fc10d_TQhke(process.platform, "win32") ? ".exe" : "";
            return _0x5c9331.join(_0x4d3e4d.homedir(), ".agent-sh", "bin", _0x4fc10d_gxgev(_0x24500f, _0x2b7c67));
        }
        function _0x5b09e3() {
            return _0x4fc10d_TQhke(process.platform, "win32") ? "onnxruntime.dll" : _0x4fc10d_fYWcU(process.platform, "darwin") ? "libonnxruntime.dylib" : "libonnxruntime.so";
        }
        function _0x473545() {
            return _0x5c9331.join(_0x5c9331.dirname(_0x4fc10d_EsWPA(_0x447912)), _0x5b09e3());
        }
        function _0x5df390() {
            const _0x1d914b = _0x127e1e();
            return !!_0x1d914b && !_0x1d914b.includes("musl");
        }
        function _0x127e1e() {
            if (_0x4fc10d_EduKk("PaBrK", "DkdBH")) {
                const _0x2dc181 = _0x4fc10d_gxgev(_0x4fc10d_fXuNz(process.platform, "-"), process.arch);
                return _0x548706[_0x2dc181] || null;
            }
            if (_0x588719[1].includes(",")) {
                const _0x3abf14 = _0x2270e3[1].split(",").map((_0x3d0c0f => _0x3d0c0f.trim().split(/\s+as\s+/)[0].trim()));
                _0x122052.push(..._0x3abf14.filter((_0x2f7c39 => _0x2f7c39 && /^\w+$/.test(_0x2f7c39))));
            } else {
                _0x3c0145.push(_0xecbd52[1]);
            }
        }
        var _0x52f179 = null;
        async function _0x350e99() {
            if (_0x4fc10d_VRnnD("vpnEF", "aNYqt")) {
                const _0x6f8c60 = FFsQIs.AMqOG(_0x47d9c7, {}), _0x5386fc = _0x6f8c60.version || _0x34dc4f, _0x1bd238 = FFsQIs.ebCCH(_0x45289b);
                if (_0x148371.existsSync(_0x1bd238)) {
                    const _0xaf636b = FFsQIs.KQmxD(_0x3dd964);
                    if (FFsQIs.snRzE(_0x46d057, _0xaf636b, _0x4bbf0e)) {
                        return _0x1bd238;
                    }
                }
                return FFsQIs.snRzE(_0x42fba3, _0x5386fc, {
                    skipChecksum: FFsQIs.LKfAB(_0x6f8c60.skipChecksum, !0),
                    skipAttestation: FFsQIs.VRnnD(_0x6f8c60.skipAttestation, !0),
                    requireAttestation: _0x6f8c60.requireAttestation,
                    ghRunner: _0x6f8c60.ghRunner,
                    ghProbe: _0x6f8c60.ghProbe
                });
            }
            if (_0x52f179 && Date.now() - _0x52f179.fetchedAt < _0x258112) {
                if (_0x4fc10d_NGxdy("OoQwx", "OoQwx")) {
                    return _0x52f179.version;
                }
                throw new _0x440b03(QxhyWF.arHXd(QxhyWF.ohxqE, _0x3991f6));
            }
            return new Promise((function(_0x1c533f, _0x4dafa8) {
                const _0x50f9da_EcgXQ = function(_0x2c153b, _0x490fcf) {
                    return _0x2c153b !== _0x490fcf;
                }, _0x50f9da_XAfnt = function(_0x55fe19, _0x37d405) {
                    return _0x4fc10d_EYtIV(_0x55fe19, _0x37d405);
                }, _0x50f9da_RlILw = function(_0x562fca, _0x486f98) {
                    return _0x4fc10d_gxgev(_0x562fca, _0x486f98);
                }, _0x50f9da_ydnAV = function(_0x433a0f, _0x2f2fa7) {
                    return _0x4fc10d_XsoQF(_0x433a0f, _0x2f2fa7);
                }, _0x50f9da_zwlTC = function(_0x33987a, _0x122a21) {
                    return _0x4fc10d_NGxdy(_0x33987a, _0x122a21);
                }, _0x50f9da_Shfya = function(_0x414684, _0x5f3bc7) {
                    return _0x4fc10d_yWkQB(_0x414684, _0x5f3bc7);
                };
                if (_0x4fc10d_VRnnD("bhswN", "zosXu")) {
                    const _0x4fe557 = _0x106dc7.match(/^##\s{1,1000}(.+)$/gm) || [], _0x4fc56c = _0x4fe557.slice(0, 10).map((_0x122d9c => _0x122d9c.replace(/^##\s+/, ""))), _0x1f362d = _0x4fc56c.map((_0xc49be1 => _0xc49be1.toLowerCase())).join(" ");
                    return {
                        path: _0x348d33,
                        sectionCount: _0x4fe557.length,
                        sections: _0x4fc56c,
                        hasInstallation: /install|setup|getting.started/i.test(_0x1f362d),
                        hasUsage: /usage|how.to|example/i.test(_0x1f362d),
                        hasApi: /api|reference|methods/i.test(_0x1f362d),
                        hasTesting: /test|spec|coverage/i.test(_0x1f362d),
                        codeBlocks: _0x2b7592.floor(QxhyWF.wyZOY((_0x2b70c4.match(/```/g) || []).length, 2)),
                        wordCount: _0x29708e.split(/\s+/).length
                    };
                }
                {
                    const _0x8b8f76 = process.env.GITHUB_TOKEN || process.env.GH_TOKEN, _0x1ec4f5 = {
                        "User-Agent": "agent-sh/embed-resolver",
                        Accept: "application/vnd.github+json"
                    };
                    _0x8b8f76 && (_0x1ec4f5.Authorization = _0x4fc10d_fXuNz("Bearer ", _0x8b8f76));
                    const _0x5aae9a = _0x4fc10d_fXuNz(_0x4fc10d_YcswA("https://api.github.com/repos/", "agent-sh/agent-analyzer"), "/releases/latest"), _0x47ad93 = function(_0x5d9d3c) {
                        const _0x36c8b3_UEXph = "No repo map found. Run init first.";
                        if (!_0x50f9da_EcgXQ("fcnKZ", "KZTPh")) {
                            const _0x3dce1f = {
                                success: !1
                            };
                            return _0x3dce1f.error = _0x36c8b3_UEXph, _0x3dce1f;
                        }
                        var _0x3a3b37;
                        _0x50f9da_XAfnt(_0x4dafa8, new Error((_0x3a3b37 = _0x4fc10d_gxgev(_0x5d9d3c, " fetching "), 
                        _0x4fc10d_gxgev(_0x3a3b37, _0x5aae9a))));
                    }, _0x3f6397 = {};
                    _0x3f6397.headers = _0x1ec4f5, _0x3f6397.timeout = 5e3;
                    const _0x4afe02 = _0x4a8997.get(_0x5aae9a, _0x3f6397, (function(_0x2f8809) {
                        if (_0x545db3 = _0x2f8809.statusCode, _0x4fc10d_EduKk(_0x545db3, 200)) {
                            return _0x4fc10d_TQhke("SZGDT", "zgfUg") ? {
                                success: !1,
                                error: "Repo map already exists. Use --force to rebuild or update to refresh.",
                                existing: _0x145eb1.getStatus(_0x173ea9)
                            } : (_0x2f8809.resume(), _0x5d124a = _0x47ad93, _0x3321e1 = _0x2f8809.statusCode, 
                            void _0x4fc10d_EYtIV(_0x5d124a, "HTTP " + _0x3321e1));
                        }
                        var _0x5d124a, _0x3321e1, _0x545db3;
                        const _0x433cd8 = [];
                        _0x2f8809.on("data", (function(_0x15b6e7) {
                            _0x433cd8.push(_0x15b6e7);
                        })), _0x2f8809.on("end", (function() {
                            try {
                                if (!_0x50f9da_EcgXQ("ObsAA", "ZnxLT")) {
                                    return _0x4f5f81.exists(_0xab34e6);
                                }
                                {
                                    const _0x287e00 = JSON.parse(Buffer.concat(_0x433cd8).toString("utf8")), _0x4b3eac = (_0x287e00 && _0x287e00.tag_name || "").replace(/^v/, "");
                                    /^\d+\.\d+\.\d+/.test(_0x4b3eac) ? _0x50f9da_ydnAV("wRhgT", "TYJws") ? (_0x52f179 = {
                                        version: _0x4b3eac,
                                        fetchedAt: Date.now()
                                    }, _0x50f9da_XAfnt(_0x1c533f, _0x4b3eac)) : _0x191f18 = _0x232332.files[_0x294f89.slice(2)] : _0x50f9da_ydnAV("GWLlz", "pWjon") ? _0x50f9da_XAfnt(_0x47ad93, "No valid release tag") : _0x1e018f += _0x2909ea.toString("utf8");
                                }
                            } catch (_0x560a92) {
                                _0x50f9da_zwlTC("ZtnmA", "eVWcD") ? !_0x4d7960.includes(_0x303bfd.name) && !_0x4dab74.name.startsWith(".") && (_0xb17e04 = _0x274151, 
                                _0x2aa54b = _0x175577, _0x52b2d4 = _0x438657, _0xb17e04(_0x2aa54b, _0x50f9da_RlILw(_0x52b2d4, 1))) : _0x50f9da_Shfya(_0x47ad93, _0x50f9da_RlILw("Failed to parse release JSON: ", _0x560a92.message));
                            }
                            var _0xb17e04, _0x2aa54b, _0x52b2d4;
                        })), _0x2f8809.on("error", (function(_0x1ab942) {
                            _0x50f9da_zwlTC("Etdfo", "Etdfo") ? _0x50f9da_XAfnt(_0x47ad93, _0x1ab942.message) : dGZDLE.NRXDI(_0x551cad, _0x59efa8, _0x270687[_0x300f31]);
                        }));
                    }));
                    _0x4afe02.on("error", (function(_0x2f844b) {
                        _0x50f9da_Shfya(_0x47ad93, _0x2f844b.message);
                    })), _0x4afe02.on("timeout", (function() {
                        _0x4afe02.destroy(), _0x47ad93("Timeout");
                    }));
                }
            }));
        }
        function _0x3181c2(_0x5c4781, _0x368e2c) {
            {
                const _0x4638a8 = _0x4fc10d_zIRge(process.platform, "win32") ? ".zip" : ".tar.gz";
                return _0x4fc10d_yzqgs(_0x4fc10d_gxgev(_0x4fc10d_YcswA("https://github.com/agent-sh/agent-analyzer", "/releases/download/v"), _0x5c4781) + "/", _0x24500f) + "-" + _0x368e2c + _0x4638a8;
            }
        }
        function _0x32a63f(_0x3bcd8e) {
            return _0x490d1e.downloadToBuffer(_0x3bcd8e, {
                userAgent: "agent-sh/embed-resolver"
            });
        }
        var _0x29f05b = _0x490d1e.extractTarGz, _0x4fa8d5 = _0x490d1e.extractZip;
        async function _0x37f72e(_0x4977b8) {
            const _0x3e8494_WARsC = function(_0x18e1d0, _0xffc87b) {
                return _0x18e1d0 + _0xffc87b;
            };
            {
                const _0x339261 = _0x127e1e();
                if (!_0x339261) {
                    if (_0x4fc10d_ovsUa("ENVPZ", "vTWCw")) {
                        throw new Error(_0x4fc10d_YcswA(_0x4fc10d_fXuNz("Unsupported platform: " + process.platform, "-") + process.arch, ". Supported: ") + Object.keys(_0x548706).join(", "));
                    }
                    _0x1a0b63.stderr.write(FFsQIs.VZKGL);
                }
                const _0x2f57b3 = _0x3181c2(_0x4977b8, _0x339261);
                process.stderr.write(_0x4fc10d_RWLIz(_0x4fc10d_NyxTG(_0x4fc10d_gxgev("Downloading ", _0x24500f), " v") + _0x4977b8, " for ") + _0x339261 + "...\n");
                const _0x3e1479 = _0x447912(), _0x3abc69 = _0x5c9331.dirname(_0x3e1479), _0x40fcc1 = {};
                let _0x464853;
                _0x40fcc1.recursive = !0, _0x63669.mkdirSync(_0x3abc69, _0x40fcc1);
                try {
                    if (!_0x4fc10d_zIRge("oUDxw", "oUDxw")) {
                        throw new _0x13f851(_0x3e8494_WARsC(_0x3e8494_WARsC("No repo-intel artifact for ", _0x267aa7), "; run init first."));
                    }
                    _0x464853 = await (_0x1ef0cb = _0x32a63f, _0x4fc89a = _0x2f57b3, _0x1ef0cb(_0x4fc89a));
                } catch (_0x1c8c84) {
                    throw _0x4fc10d_XsoQF("cPPIK", "CprJv") ? new Error(_0x4fc10d_yzqgs(_0x4fc10d_pTdgC(_0x4fc10d_NyxTG(_0x4fc10d_pTdgC(_0x4fc10d_RWLIz(_0x4fc10d_fXuNz("Failed to download ", _0x24500f) + ":\n  URL: ", _0x2f57b3), "\n  Error: "), _0x1c8c84.message) + "\n\nTo install manually:\n  1. Download: " + _0x2f57b3, "\n  2. Extract the binary to: ") + _0x3abc69 + "\n  3. Ensure it is named: ", _0x5c9331.basename(_0x3e1479))) : new _0x2f3386(FFsQIs.RpTKo(FFsQIs.tWvve(FFsQIs.dqzDp(FFsQIs.UvlWU(FFsQIs.YPDNT(FFsQIs.mdxgQ, _0x1de0ec), ": "), _0x44ab02.reason), FFsQIs.VsVqf), _0x619b3f.stderr ? FFsQIs.AwgtE(FFsQIs.nvskC, _0x3d1c50.stderr) : ""));
                }
                if (_0x4fc10d_VRnnD(process.platform, "win32")) {
                    await (_0x5b6ab1 = _0x4fa8d5, _0x4a2bc7 = _0x464853, _0x2e721b = _0x3abc69, _0xe0570d = _0x5c9331.basename(_0x3e1479), 
                    _0x5b6ab1(_0x4a2bc7, _0x2e721b, _0xe0570d));
                } else {
                    if (!_0x4fc10d_NGxdy("oLyRr", "oLyRr")) {
                        return _0x56f343.resolve(_0x1fbc83, _0x279863).startsWith(_0x420d41.resolve(_0x5b3017));
                    }
                    await (_0x1135e1 = _0x29f05b, _0x59f653 = _0x464853, _0x2f1b0b = _0x3abc69, _0x1135e1(_0x59f653, _0x2f1b0b));
                }
                return _0x4fc10d_mUHLQ(process.platform, "win32") && _0x63669.chmodSync(_0x3e1479, 493), 
                _0x3e1479;
            }
            var _0x1135e1, _0x59f653, _0x2f1b0b, _0x5b6ab1, _0x4a2bc7, _0x2e721b, _0xe0570d, _0x1ef0cb, _0x4fc89a;
        }
        const _0x43f451 = {};
        _0x43f451.EMBED_BINARY_NAME = _0x24500f, _0x43f451.getBinaryPath = _0x447912, _0x43f451.getBundledOrtName = _0x5b09e3, 
        _0x43f451.getBundledOrtPath = _0x473545, _0x43f451.platformBundlesOrt = _0x5df390, 
        _0x43f451.getVersion = function() {
            if (_0x4fc10d_EduKk("rSgTK", "pQLyz")) {
                const _0x10023a = _0x4fc10d_EsWPA(_0x447912);
                if (!_0x63669.existsSync(_0x10023a)) {
                    return null;
                }
                try {
                    if (!_0x4fc10d_XsoQF("JjcFB", "JjcFB")) {
                        const _0x5d9433 = _0x18b7b7.execFileSync(_0x10023a, [ "--version" ], {
                            timeout: 5e3,
                            encoding: "utf8",
                            stdio: [ "pipe", "pipe", "pipe" ],
                            windowsHide: !0
                        }), _0x444872 = _0x5d9433.trim().match(/(\d+\.\d+\.\d+)/);
                        return _0x444872 ? _0x444872[1] : _0x5d9433.trim();
                    }
                    _0x4e85b8 && FFsQIs.QktOK(_0x2e9903, _0x208e21);
                } catch (_0x43884d) {
                    return _0x4fc10d_TQhke("gMsmt", "zqVOW"), null;
                }
            } else {
                FFsQIs.QktOK(_0x7ef145, _0x4c13c6.concat(_0x429147));
            }
        }, _0x43f451.getPlatformKey = _0x127e1e, _0x43f451.getLatestReleaseVersion = _0x350e99, 
        _0x43f451.isAvailable = function() {
            return _0x4fc10d_fYWcU("AIhJH", "AIhJH") ? _0x63669.existsSync(_0x4fc10d_FdByr(_0x447912)) : {
                status: FFsQIs.TQhke(typeof _0x575de8.status, FFsQIs.dFLat) ? _0x2112b5.status : null,
                stdout: _0xec7dc.stdout ? FFsQIs.cyssd(_0x8016b1, _0x5c41f5.stdout) : "",
                stderr: _0x2f3f18.stderr ? FFsQIs.ZFBSY(_0x3feed7, _0x1f0f12.stderr) : _0x2d9939.message || ""
            };
        }, _0x43f451.ensureBinary = async function(_0x19c2be) {
            if (_0x4fc10d_mUHLQ("CygXG", "AXdIm")) {
                const _0x1b4740 = _0x19c2be || {}, _0x2c3f9c = _0x4fc10d_FdByr(_0x447912);
                if (_0x63669.existsSync(_0x2c3f9c)) {
                    if (_0x4fc10d_ovsUa("kOVbw", "INyaj")) {
                        return _0x4fc10d_eMFhn(_0x5df390) && !_0x63669.existsSync((_0x3d3dbf = _0x473545, 
                        _0x3d3dbf())) ? _0x37f72e(_0x1b4740.version || await _0x4fc10d_EsWPA(_0x350e99)) : _0x2c3f9c;
                    }
                    {
                        const _0x24717d = {
                            ..._0x3eb832.dependencies,
                            ..._0x5b3215.devDependencies
                        }, _0xa06962 = {};
                        _0xa06962.react = OVBFaN.lJgqH, _0xa06962["react-dom"] = OVBFaN.lJgqH, _0xa06962.next = OVBFaN.OXZez, 
                        _0xa06962.vue = OVBFaN.bhCue, _0xa06962.nuxt = OVBFaN.tMHQL, _0xa06962.angular = OVBFaN.UgnmT, 
                        _0xa06962.express = OVBFaN.GeSjr, _0xa06962.fastify = OVBFaN.NPaLv, _0xa06962.koa = OVBFaN.kNiEv, 
                        _0xa06962.nestjs = OVBFaN.BlCqg;
                        const _0x1bd02f = _0xa06962;
                        for (const [_0x5aa434, _0x4865fc] of _0xb7c00c.entries(_0x1bd02f)) {
                            _0x24717d[_0x5aa434] && _0x444114.frameworks.push(_0x4865fc);
                        }
                        _0x41a6e6.frameworks = [ ...new _0x58e13f(_0x55745a.frameworks) ];
                    }
                }
                const _0x14ebda = _0x1b4740.version || await _0x4fc10d_KQmxD(_0x350e99);
                return _0x4fc10d_yWkQB(_0x37f72e, _0x14ebda);
            }
            var _0x3d3dbf;
            _0x149272(new _0x4a7d3d("agent-analyzer " + _0x1abf86.join(" ") + " exited " + _0x20eaa3 + ": " + (_0xa0a545.trim() || _0x16c8db.trim())));
        }, _0x43f451.buildDownloadUrl = _0x3181c2, _0x18b3b7.exports = _0x43f451;
    }
}), require_orchestrator = __commonJS({
    "../work/agent-sh__agentsys/lib/repo-intel/embed/orchestrator.js"(_0x4a962e, _0x56175d) {
        const _0x2855f9_elssG = function(_0x49cb6f, _0x2b2cf8) {
            return _0x49cb6f !== _0x2b2cf8;
        }, _0x2855f9_XtmfA = function(_0x17ec51, _0x5a1025) {
            return _0x17ec51 === _0x5a1025;
        }, _0x2855f9_TSOje = function(_0x253eea, _0x11ea69) {
            return _0x253eea !== _0x11ea69;
        }, _0x2855f9_eTYNV = function(_0x4711dc, _0x4cca41) {
            return _0x4711dc(_0x4cca41);
        }, _0x2855f9_lKTVN = function(_0x3a3b36, _0x5469d6) {
            return _0x3a3b36 === _0x5469d6;
        }, _0x2855f9_BawHM = function(_0x47b878, _0x438279) {
            return _0x47b878 + _0x438279;
        }, _0x2855f9_SduZJ = function(_0x3786f2, _0x415bf0) {
            return _0x3786f2(_0x415bf0);
        }, _0x2855f9_jtiVo = function(_0x447c52) {
            return _0x447c52();
        };
        var _0xc21e03 = _0x2855f9_eTYNV(require, "fs"), _0xa18f01 = require("path"), _0x10a7ee = require("child_process"), _0x480c36 = _0x2855f9_jtiVo(require_preference), _0x2003a4 = _0x2855f9_jtiVo(require_binary2), _0x14fe14 = _0x2855f9_jtiVo(require_binary), _0x16fa0b = require_cache();
        function _0x44afbf(_0x7c2aae) {
            if (_0x2855f9_elssG("teJdw", "jqoah")) {
                const _0x3ded34 = _0x480c36.read(_0x7c2aae);
                return _0x2855f9_XtmfA(_0x3ded34.embedder, "small") || _0x2855f9_XtmfA(_0x3ded34.embedder, "big");
            }
            {
                const _0x4e736c = _0x4c0751[1].split(",").map((_0x5efbbc => _0x5efbbc.trim().split(":")[0].trim()));
                _0x58550d.exports.push(..._0x4e736c.filter((_0x1c45b4 => _0x1c45b4 && /^[a-zA-Z_$]/.test(_0x1c45b4))));
            }
        }
        function _0x365cb7(_0x17953f, _0x57460a, _0x21a3e1, _0x12d815) {
            const _0x2fb239_ecMST = function(_0x439bbc, _0x3b3b6c) {
                return _0x439bbc(_0x3b3b6c);
            }, _0x2fb239_xkpIP = function(_0x2b2a66) {
                return _0x2b2a66();
            }, _0x2fb239_BGIVs = function(_0xf8ed6e, _0x3de506) {
                return _0xf8ed6e != _0x3de506;
            }, _0x2fb239_HFxuu = function(_0x25fac6, _0x588a9c) {
                return _0x2855f9_SduZJ(_0x25fac6, _0x588a9c);
            }, _0x2fb239_cQgCt = function(_0xc5bbaa, _0x282db8) {
                return _0xc5bbaa === _0x282db8;
            }, _0x2fb239_xtMGj = function(_0x1ff284, _0x4cf2f5) {
                return _0x1ff284 !== _0x4cf2f5;
            }, _0x2fb239_PFNKB = function(_0xbc4e58, _0x37d331) {
                return _0xbc4e58(_0x37d331);
            }, _0x2fb239_NOcmJ = function(_0x5bf78c, _0x5df3ae) {
                return _0x2855f9_BawHM(_0x5bf78c, _0x5df3ae);
            }, _0x2fb239_WidMb = function(_0x22e761, _0xd6eb72) {
                return _0x2855f9_BawHM(_0x22e761, _0xd6eb72);
            }, _0x2fb239_gNOVA = function(_0x41bfa3, _0x51cbdc, _0x1a8cad) {
                return _0x41bfa3(_0x51cbdc, _0x1a8cad);
            };
            return _0x2855f9_XtmfA("oUTGU", "oUTGU") ? new Promise((function(_0x597c89, _0x3c8ba9) {
                const _0x57da2e = {
                    fCIDB: "init-error",
                    uFMdt: function(_0x9afc53, _0x3a1dd4) {
                        return _0x2fb239_BGIVs(_0x9afc53, _0x3a1dd4);
                    },
                    ESDww: "--top",
                    MKpoN: function(_0x30b857, _0x18b281) {
                        return _0x2fb239_HFxuu(_0x30b857, _0x18b281);
                    },
                    XKyeD: function(_0x10d138, _0x45db70, _0x37bcff, _0x144705) {
                        return _0x10d138(_0x45db70, _0x37bcff, _0x144705);
                    },
                    PiHSr: "stale-docs",
                    BhuNu: function(_0x1858da, _0x307772) {
                        return _0x1858da === _0x307772;
                    },
                    taxTz: "epBzq",
                    Zkykk: "AtYCG",
                    IGwRd: "raUrz",
                    OUgjA: function(_0x5998bc, _0x55a5c8) {
                        return _0x2fb239_cQgCt(_0x5998bc, _0x55a5c8);
                    },
                    FDDIF: "rhHie",
                    mofVQ: "dpgvX",
                    ZLZQg: "SIGTERM",
                    wCbxJ: function(_0x2029fe, _0x5a51de) {
                        return _0x2fb239_xtMGj(_0x2029fe, _0x5a51de);
                    },
                    LqLto: "LrySs",
                    QTMml: "ITwRW",
                    BwKEa: function(_0x2ddafc, _0x189de2) {
                        return _0x2fb239_ecMST(_0x2ddafc, _0x189de2);
                    },
                    AHOiC: function(_0x34c560, _0x1fe421) {
                        return _0x2fb239_PFNKB(_0x34c560, _0x1fe421);
                    },
                    FxuQL: function(_0x1af8a4, _0x5e6f57) {
                        return _0x2fb239_NOcmJ(_0x1af8a4, _0x5e6f57);
                    },
                    JgrhT: "Refusing to extract archive with Windows absolute entry: ",
                    fGzCN: function(_0x2a47ec, _0x3f2390) {
                        return _0x2fb239_cQgCt(_0x2a47ec, _0x3f2390);
                    },
                    pGSHv: "MKDau",
                    bAEKv: "FmaDz",
                    gGUAK: function(_0x318c38, _0x57669f) {
                        return _0x2fb239_PFNKB(_0x318c38, _0x57669f);
                    },
                    WKLik: function(_0x504cf3, _0x3b09e5) {
                        return _0x2fb239_NOcmJ(_0x504cf3, _0x3b09e5);
                    },
                    jxTuo: " exited ",
                    otDzc: function(_0x369312, _0x5b7e37) {
                        return _0x2fb239_xtMGj(_0x369312, _0x5b7e37);
                    },
                    OyzjM: function(_0x487506, _0x417989) {
                        return _0x2fb239_HFxuu(_0x487506, _0x417989);
                    },
                    ytqGr: function(_0x3a14ae, _0x2eac22) {
                        return _0x2fb239_WidMb(_0x3a14ae, _0x2eac22);
                    },
                    uGQkK: function(_0x4d6cc1, _0x2f8a5d) {
                        return _0x2fb239_WidMb(_0x4d6cc1, _0x2f8a5d);
                    },
                    NxdOu: "agent-analyzer set-embeddings exited ",
                    uMTLL: function(_0x15301c, _0x5ef7e1, _0x407c37) {
                        return _0x2fb239_gNOVA(_0x15301c, _0x5ef7e1, _0x407c37);
                    },
                    vPTeX: function(_0x23fed1, _0x156bd0, _0x5e4b61) {
                        return _0x2fb239_gNOVA(_0x23fed1, _0x156bd0, _0x5e4b61);
                    },
                    ZZlmT: "repo-intel",
                    MYgRH: "init",
                    CHlRM: "utf8",
                    ycIQQ: function(_0x5997c4, _0x24d4a8, _0x2ac947) {
                        return _0x5997c4(_0x24d4a8, _0x2ac947);
                    },
                    nELKC: "dependents: symbol",
                    bmUAf: function(_0x332426, _0x2b9d2d) {
                        return _0x2fb239_BGIVs(_0x332426, _0x2b9d2d);
                    },
                    mYVUT: function(_0x18a275, _0x3cb25d, _0x4291ce) {
                        return _0x2fb239_gNOVA(_0x18a275, _0x3cb25d, _0x4291ce);
                    },
                    EQHNZ: "dependents: file",
                    SOseE: "--file",
                    sWpwy: "dependents",
                    GKKED: "GzACj",
                    klXuw: "communityHealth: id must be a non-negative integer",
                    auWFf: "pNWli",
                    enjou: "CGZYK",
                    IWwfV: function(_0x330edf, _0x195cfa) {
                        return _0x330edf !== _0x195cfa;
                    },
                    dAPMd: "EPIPE",
                    HVFFm: "KsmmP",
                    nYxvj: function(_0x17efd1) {
                        return _0x2fb239_xkpIP(_0x17efd1);
                    },
                    HtwMJ: function(_0x38a388, _0x4afd84) {
                        return _0x38a388(_0x4afd84);
                    }
                };
                if (!_0x2fb239_cQgCt("Jcmjt", "Jcmjt")) {
                    return _0x48af03.existsSync(qBLxWY.HtwMJ(_0x5d7740, _0xd0757a));
                }
                {
                    const _0x2182f4 = {
                        stdio: [ "ignore", "pipe", "pipe" ],
                        windowsHide: !0
                    }, _0x2541a7 = _0x10a7ee.spawn(_0x17953f, _0x57460a, _0x2182f4), _0x4b6095 = _0x10a7ee.spawn(_0x21a3e1, [ "repo-intel", "set-embeddings", "--map-file", _0x12d815, "--input", "-" ], {
                        stdio: [ "pipe", "pipe", "pipe" ],
                        windowsHide: !0
                    });
                    let _0x4f162f = null, _0x2468f0 = null, _0xd43d4b = !1, _0x24a0bd = "", _0xdbbeca = "", _0x20672e = "";
                    function _0x44a2d9(_0x27164b, _0x734cc2) {
                        if (_0x57da2e.BhuNu(_0x57da2e.taxTz, _0x57da2e.Zkykk)) {
                            const _0x30e505 = {
                                available: !1,
                                map: null
                            };
                            return _0x30e505.fallbackReason = _0x32f43f.message || _0x57da2e.fCIDB, _0x30e505;
                        }
                        if (!_0xd43d4b) {
                            if (_0xd43d4b = !0, _0x27164b) {
                                if (_0x57da2e.BhuNu(_0x57da2e.IGwRd, _0x57da2e.IGwRd)) {
                                    try {
                                        if (_0x57da2e.OUgjA(_0x57da2e.FDDIF, _0x57da2e.mofVQ)) {
                                            const _0x220d3b = {
                                                recursive: !0
                                            };
                                            _0x3b7141.mkdirSync(_0x323e39, _0x220d3b);
                                        } else {
                                            _0x2541a7.kill(_0x57da2e.ZLZQg);
                                        }
                                    } catch (_0x1b5934) {}
                                    try {
                                        if (!_0x57da2e.wCbxJ(_0x57da2e.LqLto, _0x57da2e.QTMml)) {
                                            const _0x300b6c = [];
                                            return qBLxWY.uFMdt(_0x1f93e1.limit, null) && _0x300b6c.push(qBLxWY.ESDww, qBLxWY.MKpoN(_0x565a18, _0x3dd3c9.limit)), 
                                            qBLxWY.XKyeD(_0x589f79, qBLxWY.PiHSr, _0x300b6c, _0x56e86e);
                                        }
                                        _0x4b6095.kill(_0x57da2e.ZLZQg);
                                    } catch (_0x154fcb) {}
                                    _0x57da2e.BwKEa(_0x3c8ba9, _0x27164b);
                                } else {
                                    _0x2a5e4e.push(_0x3b027c);
                                }
                            } else {
                                _0x57da2e.AHOiC(_0x597c89, _0x734cc2);
                            }
                        }
                    }
                    function _0x1de986() {
                        if (_0x57da2e.JgrhT, _0xd43d4b || _0x57da2e.fGzCN(_0x4f162f, null) || _0x57da2e.fGzCN(_0x2468f0, null)) {
                            return;
                        }
                        if (_0x57da2e.wCbxJ(_0x4f162f, 0)) {
                            if (_0x57da2e.wCbxJ(_0x57da2e.pGSHv, _0x57da2e.bAEKv)) {
                                return _0x57da2e.gGUAK(_0x44a2d9, new Error(_0x57da2e.WKLik(_0x57da2e.FxuQL(_0x57da2e.WKLik(_0x2003a4.EMBED_BINARY_NAME, _0x57da2e.jxTuo), _0x4f162f), _0xdbbeca.trim() ? _0x57da2e.WKLik(": ", _0xdbbeca.trim().slice(0, 500)) : "")));
                            }
                            throw new _0x3fa2eb(MMxAYL.stTHS(MMxAYL.zyMCW, _0xedd541));
                        }
                        if (_0x57da2e.otDzc(_0x2468f0, 0)) {
                            return _0x57da2e.OyzjM(_0x44a2d9, new Error(_0x57da2e.ytqGr(_0x57da2e.uGQkK(_0x57da2e.NxdOu, _0x2468f0), _0x20672e.trim() ? _0x57da2e.WKLik(": ", _0x20672e.trim().slice(0, 500)) : "")));
                        }
                        const _0x3015c6 = _0x24a0bd.match(/(\d+)\s+files?/);
                        _0x57da2e.uMTLL(_0x44a2d9, null, {
                            files: _0x3015c6 ? _0x57da2e.vPTeX(parseInt, _0x3015c6[1], 10) : void 0
                        });
                    }
                    _0x2541a7.stderr.on("data", (function(_0x43b834) {
                        if (_0x2855f9_elssG("onXLn", "pASaf")) {
                            _0xdbbeca += _0x43b834.toString("utf8");
                        } else {
                            const _0x3928ff = _0x408eec.runAnalyzer([ _0x57da2e.ZZlmT, _0x57da2e.MYgRH, _0x2237eb ]);
                            _0x544740 = _0x56dd41.parse(_0x3928ff);
                        }
                    })), _0x4b6095.stderr.on("data", (function(_0x13608a) {
                        _0x20672e += _0x13608a.toString(_0x57da2e.CHlRM);
                    })), _0x4b6095.stdout.on("data", (function(_0x2f7c5b) {
                        _0x24a0bd += _0x2f7c5b.toString(_0x57da2e.CHlRM);
                    })), _0x2541a7.stdout.on("error", (function(_0x2ff1b6) {
                        if (_0x57da2e.nELKC, _0x57da2e.EQHNZ, _0x57da2e.SOseE, _0x57da2e.sWpwy, !_0x57da2e.fGzCN(_0x57da2e.GKKED, _0x57da2e.GKKED)) {
                            RSptFr.TKgvG(_0x3e4d27, _0x181781, RSptFr.GSLLM);
                            const _0xc34853 = [ _0x4672e4 ];
                            return RSptFr.pnqGF(_0x48e434, null) && (RSptFr.aZGWB(_0x1ee31f, _0x52f674, RSptFr.PJnZA), 
                            _0xc34853.push(RSptFr.yFNxu, _0x277d27)), RSptFr.Lsdae(_0x590402, RSptFr.qlqoc, _0xc34853, _0xd7200);
                        }
                        _0x57da2e.AHOiC(_0x44a2d9, _0x2ff1b6);
                    })), _0x4b6095.stdin.on("error", (function(_0x3d41bf) {
                        if (_0x57da2e.fGzCN(_0x57da2e.auWFf, _0x57da2e.enjou)) {
                            throw new _0x3b5c26(qBLxWY.klXuw);
                        }
                        _0x3d41bf && _0x57da2e.IWwfV(_0x3d41bf.code, _0x57da2e.dAPMd) && _0x57da2e.AHOiC(_0x44a2d9, _0x3d41bf);
                    })), _0x2541a7.stdout.pipe(_0x4b6095.stdin), _0x2541a7.on("error", (function(_0x178ddf) {
                        _0x2fb239_ecMST(_0x44a2d9, _0x178ddf);
                    })), _0x4b6095.on("error", (function(_0x182b0d) {
                        _0x57da2e.OUgjA(_0x57da2e.HVFFm, _0x57da2e.HVFFm) ? _0x57da2e.gGUAK(_0x44a2d9, _0x182b0d) : _0x3b3b70 = _0x5ab87f.sources;
                    })), _0x2541a7.on("close", (function(_0x140f0b) {
                        _0x4f162f = _0x140f0b, _0x2fb239_xkpIP(_0x1de986);
                    })), _0x4b6095.on("close", (function(_0x2ad562) {
                        _0x2468f0 = _0x2ad562, _0x57da2e.nYxvj(_0x1de986);
                    }));
                }
            })) : _0x4253cc.join(pbNrqP.ecMST(_0x1a6243, _0x12726f), _0x39d4f5);
        }
        function _0x4b4162(_0x16367c) {
            if (_0x2855f9_elssG("MnWzQ", "hqviI")) {
                if (!_0x16367c) {
                    return "";
                }
                const _0x1d62db = _0xa18f01.dirname(_0x16367c), _0x378b78 = _0xa18f01.basename(_0x16367c, _0xa18f01.extname(_0x16367c));
                return _0xa18f01.join(_0x1d62db, _0x378b78 + ".embeddings.bin");
            }
            {
                const _0x578efc = (_0x330e9c.match(/^[-*]\s+\[x\]/gim) || []).length, _0x63aa3 = (_0xce726c.match(/^[-*]\s+\[\s\]/gim) || []).length;
                _0x476069.checkboxes.checked += _0x578efc, _0x57851c.checkboxes.unchecked += _0x63aa3, 
                _0x3002c4.checkboxes.total += uAaeyk.TvBrl(_0x578efc, _0x63aa3);
            }
        }
        const _0x52c3f6 = {};
        _0x52c3f6.isEnabled = _0x44afbf, _0x52c3f6.runScan = async function(_0x225872) {
            if (!_0x2855f9_TSOje("vzPUj", "vzPUj")) {
                if (!_0x2855f9_eTYNV(_0x44afbf, _0x225872)) {
                    return {
                        ran: !1,
                        reason: 'embedder preference is "none" or unset'
                    };
                }
                const _0x48f22f = _0x480c36.read(_0x225872), _0x4905f9 = _0x480c36.detailToCliArg(_0x48f22f.embedderDetail || "balanced"), _0x4e098b = _0x16fa0b.getPath(_0x225872);
                if (!_0xc21e03.existsSync(_0x4e098b)) {
                    return _0x2855f9_lKTVN("PXLUj", "szwst") ? [] : {
                        ran: !1,
                        reason: "no repo-intel map found; run `/repo-intel init` first"
                    };
                }
                const _0x29943a = Date.now(), _0x16be72 = await _0x2003a4.ensureBinary(), _0x5484cc = await _0x14fe14.ensureBinary(), _0x1080b4 = await (_0x814864 = _0x365cb7, 
                _0x1b9c64 = _0x16be72, _0x55c726 = [ "scan", _0x225872, "--variant", _0x48f22f.embedder, "--detail", _0x4905f9 ], 
                _0x39c391 = _0x5484cc, _0x2d99e7 = _0x4e098b, _0x814864(_0x1b9c64, _0x55c726, _0x39c391, _0x2d99e7));
                return Object.assign({
                    ran: !0,
                    durationMs: (_0x1eed15 = Date.now(), _0x5bd2f5 = _0x29943a, _0x1eed15 - _0x5bd2f5)
                }, _0x1080b4);
            }
            var _0x1eed15, _0x5bd2f5, _0x814864, _0x1b9c64, _0x55c726, _0x39c391, _0x2d99e7;
            _0x291c32.unlinkSync(_0x516388);
        }, _0x52c3f6.runUpdate = async function(_0x607b9d) {
            if (_0x2855f9_lKTVN("WVojX", "WVojX")) {
                if (!_0x2855f9_eTYNV(_0x44afbf, _0x607b9d)) {
                    return {
                        ran: !1,
                        reason: 'embedder preference is "none" or unset'
                    };
                }
                const _0x468533 = _0x480c36.read(_0x607b9d), _0x3f633c = _0x480c36.detailToCliArg(_0x468533.embedderDetail || "balanced"), _0x2648f6 = _0x16fa0b.getPath(_0x607b9d);
                if (!_0xc21e03.existsSync(_0x2648f6)) {
                    if (_0x2855f9_TSOje("IOskh", "CzARt")) {
                        return {
                            ran: !1,
                            reason: "no repo-intel map; run `/repo-intel init` then `enrich`"
                        };
                    }
                    {
                        if (!_0x3f3714 || !_0x4b34d4.files) {
                            return null;
                        }
                        const _0x2c0c7f = _0x38aec8.replace(/\\/g, "/");
                        let _0x5c664a = _0x24eb4a.files[_0x2c0c7f];
                        return !_0x5c664a && _0x2c0c7f.startsWith("./") && (_0x5c664a = _0x6113f2.files[_0x2c0c7f.slice(2)]), 
                        !_0x5c664a && !_0x2c0c7f.startsWith("./") && (_0x5c664a = _0x1c0b05.files[_0x2855f9_BawHM("./", _0x2c0c7f)]), 
                        _0x5c664a && _0x5c664a.symbols && _0x5c664a.symbols.exports ? _0x5c664a.symbols.exports.map((_0x33e03c => _0x33e03c.name)) : null;
                    }
                }
                const _0x1900e8 = Date.now(), _0x1637f6 = await _0x2003a4.ensureBinary(), _0x3073d0 = await _0x14fe14.ensureBinary(), _0x22ef39 = await (_0x1a148e = _0x365cb7, 
                _0x151906 = _0x1637f6, _0x4768a0 = [ "update", _0x607b9d, "--map-file", _0x2648f6, "--variant", _0x468533.embedder, "--detail", _0x3f633c ], 
                _0x50c4c0 = _0x3073d0, _0x5ec3b1 = _0x2648f6, _0x1a148e(_0x151906, _0x4768a0, _0x50c4c0, _0x5ec3b1));
                return Object.assign({
                    ran: !0,
                    durationMs: (_0x176104 = Date.now(), _0x3930d6 = _0x1900e8, _0x176104 - _0x3930d6)
                }, _0x22ef39);
            }
            var _0x176104, _0x3930d6, _0x1a148e, _0x151906, _0x4768a0, _0x50c4c0, _0x5ec3b1;
            return null;
        }, _0x52c3f6.status = function(_0x421d65) {
            if (_0x2855f9_lKTVN("WNLlY", "umCBD")) {
                const _0x54714b = {
                    ..._0x47bc99
                };
                return _0x54714b.reason = "repo-intel-map-missing", _0x54714b;
            }
            {
                const _0x55acf4 = _0x480c36.read(_0x421d65), _0x48a18f = _0x16fa0b.getPath(_0x421d65), _0x4e7345 = _0x2855f9_SduZJ(_0x4b4162, _0x48a18f);
                return {
                    enabled: _0x2855f9_eTYNV(_0x44afbf, _0x421d65),
                    embedder: _0x55acf4.embedder,
                    embedderDetail: _0x55acf4.embedderDetail,
                    binaryInstalled: _0x2003a4.isAvailable(),
                    ortBundled: !_0x2003a4.platformBundlesOrt() || _0xc21e03.existsSync(_0x2003a4.getBundledOrtPath()),
                    sidecarExists: _0xc21e03.existsSync(_0x4e7345),
                    sidecarPath: _0x4e7345
                };
            }
        }, _0x52c3f6.streamEmbedToSetEmbeddings = _0x365cb7, _0x56175d.exports = _0x52c3f6;
    }
}), require_embed = __commonJS({
    "../work/agent-sh__agentsys/lib/repo-intel/embed/index.js"(_0x918778, _0x12325c) {
        const _0x352961 = {
            YSYjT: "1|4|3|2|0",
            WLyjE: function(_0x46ab9d) {
                return _0x46ab9d();
            },
            pviBs: function(_0x3b68f7) {
                return _0x3b68f7();
            },
            YnssA: function(_0x2e0eed) {
                return _0x2e0eed();
            }
        }, _0x45b592 = _0x352961.YSYjT.split("|");
        let _0x518508 = 0;
        for (;;) {
            switch (_0x45b592[_0x518508++]) {
              case "0":
                const _0x54501f = {};
                _0x54501f.preference = _0x345f29, _0x54501f.binary = _0x397316, _0x54501f.orchestrator = _0x3fb614, 
                _0x54501f.isEnabled = _0x3fb614.isEnabled, _0x54501f.runScan = _0x3fb614.runScan, 
                _0x54501f.runUpdate = _0x3fb614.runUpdate, _0x54501f.status = _0x3fb614.status, 
                _0x12325c.exports = _0x54501f;
                continue;

              case "1":
                continue;

              case "2":
                var _0x3fb614 = _0x352961.WLyjE(require_orchestrator);
                continue;

              case "3":
                var _0x397316 = _0x352961.pviBs(require_binary2);
                continue;

              case "4":
                var _0x345f29 = _0x352961.YnssA(require_preference);
                continue;
            }
            break;
        }
    }
}), require_repo_intel = __commonJS({
    "../work/agent-sh__agentsys/lib/repo-intel/index.js"(_0x4315f0, _0x48738e) {
        const _0x588495_EEmnp = function(_0x5ca080, _0x134ec5) {
            return _0x5ca080 === _0x134ec5;
        }, _0x588495_gUstc = function(_0x9d0d83, _0x1adaa7) {
            return _0x9d0d83(_0x1adaa7);
        }, _0x588495_HGzTr = function(_0x34c8d8, _0x4afd89) {
            return _0x34c8d8 !== _0x4afd89;
        }, _0x588495_sPONa = function(_0x300bf4, _0x51077f) {
            return _0x300bf4 + _0x51077f;
        }, _0x588495_EKlEH = function(_0x3a4156, _0x5ec928) {
            return _0x3a4156 === _0x5ec928;
        }, _0x588495_SuMXb = function(_0x17c906, _0x118f9c) {
            return _0x17c906(_0x118f9c);
        }, _0x588495_IWqDo = function(_0x16de85, _0x1197ac) {
            return _0x16de85 === _0x1197ac;
        }, _0x588495_qPgXS = function(_0x2776f1, _0x22777d, _0x4e2861) {
            return _0x2776f1(_0x22777d, _0x4e2861);
        }, _0x588495_vHGal = function(_0x480011, _0x4b7641) {
            return _0x480011 !== _0x4b7641;
        }, _0x588495_BJtwL = function(_0x4c3825, _0x15ca9e) {
            return _0x4c3825 + _0x15ca9e;
        }, _0x588495_AUzmc = function(_0x3d2d43, _0x11aa09) {
            return _0x3d2d43 !== _0x11aa09;
        }, _0x588495_HZfdz = function(_0x41d8e2, _0x2277c2, _0x73ffca) {
            return _0x41d8e2(_0x2277c2, _0x73ffca);
        }, _0x588495_jrIql = function(_0x5058a0) {
            return _0x5058a0();
        }, _0x588495_YFzxA = function(_0x59a128, _0xa87b43) {
            return _0x59a128(_0xa87b43);
        }, _0x588495_GtMUC = function(_0x53920d) {
            return _0x53920d();
        }, _0x588495_FiArS = function(_0x4cc067) {
            return _0x4cc067();
        };
        var _0x3344c2 = _0x588495_YFzxA(require, "fs"), _0x449dff = require("path"), _0x2fe30e = _0x588495_YFzxA(require, "child_process"), {execFileSync: _0x2d4178} = _0x2fe30e, _0x53014c = _0x588495_GtMUC(require_installer), _0x26a751 = _0x588495_jrIql(require_cache), _0x5e3fbf = _0x588495_jrIql(require_updater), _0x2d2d6c = require_converter(), _0x3fba0f = _0x588495_GtMUC(require_queries), _0x5f5c6 = _0x588495_FiArS(require_binary), {getStateDirPath: _0x37b29e} = _0x588495_FiArS(require_state_dir), {writeJsonAtomic: _0x31d4e2} = _0x588495_jrIql(require_atomic_write);
        function _0x57549a(_0xcfc3f7) {
            if (_0x588495_EEmnp("JpWro", "JpWro")) {
                return _0x449dff.join(_0x588495_gUstc(_0x37b29e, _0xcfc3f7), "repo-intel.json");
            }
            _0xb51d22.set(_0x231fa1, []);
        }
        async function _0x5789a6(_0xb7ec75, _0x259e80 = {}) {
            const _0xc06487 = await _0x53014c.checkInstalled();
            if (!_0xc06487.found) {
                return {
                    success: !1,
                    error: (_0x213f95 = _0xc06487.error || "unknown error", "agent-analyzer binary unavailable: " + _0x213f95),
                    installSuggestion: _0x53014c.getInstallInstructions()
                };
            }
            var _0x213f95;
            if (_0x26a751.load(_0xb7ec75) && !_0x259e80.force) {
                return {
                    success: !1,
                    error: "Repo map already exists. Use --force to rebuild or update to refresh.",
                    existing: _0x26a751.getStatus(_0xb7ec75)
                };
            }
            const _0xb17e1c = Date.now();
            let _0x3dc883, _0x33e9c7;
            try {
                if (_0x588495_HGzTr("WuYGq", "WuYGq")) {
                    const _0x1a2b10 = zRVdpn.gUstc(_0x1120c0, _0x3fd87a);
                    if (!_0x3a81b7.existsSync(_0x1a2b10)) {
                        return null;
                    }
                    try {
                        const _0x2400c4 = _0x1edc9d.readFileSync(_0x1a2b10, zRVdpn.Stvzj);
                        return _0x7b6b72.parse(_0x2400c4);
                    } catch {
                        return null;
                    }
                } else {
                    _0x3dc883 = await _0x5f5c6.runAnalyzerAsync([ "repo-intel", "init", _0xb7ec75 ]);
                }
            } catch (_0x3f3dc6) {
                if (_0x588495_EEmnp("mSzaT", "mSzaT")) {
                    return {
                        success: !1,
                        error: _0x588495_sPONa("agent-analyzer repo-intel init failed: ", _0x3f3dc6.message)
                    };
                }
                _0x137e1f.chmodSync(_0x36dd28, 493);
            }
            try {
                if (_0x588495_HGzTr("FWXaw", "FeYMZ")) {
                    _0x33e9c7 = JSON.parse(_0x3dc883);
                } else {
                    try {
                        const _0x50efd5 = _0x27fb02.runAnalyzer(_0x2bb4a1);
                        return _0x161bc2.parse(_0x50efd5);
                    } catch {
                        return null;
                    }
                }
            } catch (_0x34cf80) {
                if (_0x588495_EKlEH("ZTjwP", "ZTjwP")) {
                    return {
                        success: !1,
                        error: _0x588495_sPONa("Failed to parse repo-intel output: ", _0x34cf80.message)
                    };
                }
                if (!OBnVIP.JECiv(_0x4b9fea, _0x57e10d)) {
                    return !1;
                }
                try {
                    return OBnVIP.QFXrl(_0x185bf9, OBnVIP.wyCtA, [ OBnVIP.JfTTz, "-e", _0x15abc6 ], {
                        cwd: _0x5073b6,
                        stdio: [ OBnVIP.tcjsV, OBnVIP.tcjsV, OBnVIP.tcjsV ]
                    }), !0;
                } catch {
                    return !1;
                }
            }
            const _0x11a9e3 = _0x588495_gUstc(_0x57549a, _0xb7ec75);
            try {
                _0x31d4e2(_0x11a9e3, _0x33e9c7);
            } catch {}
            const _0x2d105f = _0x2d2d6c.convertIntelToRepoMap(_0x33e9c7);
            return _0x2d105f.stats.scanDurationMs = Date.now() - _0xb17e1c, _0x26a751.save(_0xb7ec75, _0x2d105f), 
            {
                success: !0,
                map: _0x2d105f,
                summary: {
                    files: Object.keys(_0x2d105f.files).length,
                    symbols: _0x2d105f.stats.totalSymbols,
                    languages: _0x2d105f.project.languages,
                    duration: _0x2d105f.stats.scanDurationMs
                }
            };
        }
        async function _0x1d46c6(_0x4b0a4c, _0x30829c) {
            const _0x4f00e0_wQTFm = function(_0x10bbae, _0x2b9f9f) {
                return _0x10bbae === _0x2b9f9f;
            };
            if (!_0x588495_IWqDo("cLwvW", "IaAep")) {
                const _0x4e706a = await _0x5f5c6.ensureBinary();
                return new Promise(((_0x1aeb3d, _0x2ba42f) => {
                    const _0xc8b279_ERLKu = function(_0x18a6a3, _0x111911) {
                        return _0x4f00e0_wQTFm(_0x18a6a3, _0x111911);
                    };
                    {
                        const _0x46151c = {
                            stdio: [ "pipe", "pipe", "pipe" ],
                            windowsHide: !0
                        }, _0x3ca986 = _0x2fe30e.spawn(_0x4e706a, _0x4b0a4c, _0x46151c);
                        let _0x4ae000 = "", _0x5e840b = "";
                        _0x3ca986.stdout.on("data", (_0x1923ee => {
                            if (!_0xc8b279_ERLKu("dCMyn", "dCMyn")) {
                                return {};
                            }
                            _0x4ae000 += _0x1923ee.toString("utf8");
                        })), _0x3ca986.stderr.on("data", (_0x5595be => {
                            if (_0xc8b279_ERLKu("tHWyv", "CxuHu")) {
                                const _0xa73615 = [];
                                return TUHKJM.pxLWj(_0x2b660d.limit, null) && _0xa73615.push(TUHKJM.dyUva, TUHKJM.WmzKo(_0x42f230, _0x982c58.limit)), 
                                TUHKJM.aEDVD(_0x524985, TUHKJM.LdsCN, _0xa73615, _0x5d1c72);
                            }
                            _0x5e840b += _0x5595be.toString("utf8");
                        })), _0x3ca986.on("error", _0x2ba42f), _0x3ca986.on("close", (_0x1ef5c0 => {
                            if (_0x4f00e0_wQTFm("VTYAo", "OVrGa")) {
                                return _0x526c4a.parse(_0x5045c);
                            }
                            if (_0x4f00e0_wQTFm(_0x1ef5c0, 0)) {
                                if (_0x4f00e0_wQTFm("qJgin", "HaZUf")) {
                                    _0x437e55 = _0x21c151.parse(_0x5e21a9);
                                } else {
                                    const _0x488feb = {};
                                    _0x488feb.stdout = _0x4ae000, _0x488feb.stderr = _0x5e840b, _0x1aeb3d(_0x488feb);
                                }
                            } else if (_0x588495_HGzTr("ispUn", "WAuRS")) {
                                _0x1a8109 = _0x2ba42f, _0x1e13c6 = new Error("agent-analyzer " + _0x4b0a4c.join(" ") + " exited " + _0x1ef5c0 + ": " + (_0x5e840b.trim() || _0x4ae000.trim())), 
                                _0x588495_SuMXb(_0x1a8109, _0x1e13c6);
                            } else {
                                switch (_0x4198cd) {
                                  case wksVos.zDDiU:
                                    return wksVos.zDDiU;

                                  case wksVos.xWhKk:
                                    return wksVos.xWhKk;

                                  case wksVos.CSHWn:
                                  default:
                                    return wksVos.CSHWn;
                                }
                            }
                            var _0x1a8109, _0x1e13c6;
                        })), _0x3ca986.stdin.write(_0x30829c), _0x3ca986.stdin.end();
                    }
                }));
            }
            _0x1d9abe.requireAttestation = _0x12349;
        }
        const _0x224263 = {};
        _0x224263.init = _0x5789a6, _0x224263.update = async function(_0x1c0153, _0x5e2dd2 = {}) {
            const _0x3a023a = await _0x53014c.checkInstalled();
            if (!_0x3a023a.found) {
                return {
                    success: !1,
                    error: (_0x5740dc = _0x3a023a.error || "unknown error", "agent-analyzer binary unavailable: " + _0x5740dc),
                    installSuggestion: _0x53014c.getInstallInstructions()
                };
            }
            var _0x5740dc;
            if (!_0x26a751.exists(_0x1c0153)) {
                if (_0x588495_IWqDo("mDmYO", "mDmYO")) {
                    return {
                        success: !1,
                        error: "No repo map found. Run init first."
                    };
                }
                mCtttO.WvRBw(_0x49a1ca, _0x3de6f2[_0x6ecbd2]);
            }
            if (_0x5e2dd2.full) {
                return _0x588495_qPgXS(_0x5789a6, _0x1c0153, {
                    force: !0
                });
            }
            const _0x105628 = _0x588495_SuMXb(_0x57549a, _0x1c0153);
            if (!_0x3344c2.existsSync(_0x105628)) {
                return _0x588495_qPgXS(_0x5789a6, _0x1c0153, {
                    force: !0
                });
            }
            const _0x1d1e11 = Date.now();
            let _0x18a44f, _0x43c053;
            try {
                if (!_0x588495_EEmnp("CCaEi", "CCaEi")) {
                    throw zRVdpn.gUstc(_0x57bffd, _0x171c9c), _0x5e5de1;
                }
                _0x18a44f = await _0x5f5c6.runAnalyzerAsync([ "repo-intel", "update", "--map-file", _0x105628, _0x1c0153 ]);
            } catch (_0x22d61d) {
                return _0x588495_vHGal("kPNHN", "kPNHN") ? null : {
                    success: !1,
                    error: _0x588495_BJtwL("agent-analyzer repo-intel update failed: ", _0x22d61d.message)
                };
            }
            try {
                _0x43c053 = JSON.parse(_0x18a44f);
            } catch (_0x202b27) {
                return !_0x588495_EEmnp("wkYci", "PEIqx") && {
                    success: !1,
                    error: _0x588495_BJtwL("Failed to parse repo-intel update output: ", _0x202b27.message)
                };
            }
            try {
                _0x31d4e2(_0x105628, _0x43c053);
            } catch {}
            const _0x460f4a = _0x2d2d6c.convertIntelToRepoMap(_0x43c053);
            return _0x460f4a.stats.scanDurationMs = Date.now() - _0x1d1e11, _0x26a751.save(_0x1c0153, _0x460f4a), 
            {
                success: !0,
                map: _0x460f4a,
                summary: {
                    files: Object.keys(_0x460f4a.files).length,
                    symbols: _0x460f4a.stats.totalSymbols,
                    duration: _0x460f4a.stats.scanDurationMs
                }
            };
        }, _0x224263.status = function(_0x3b1ffe) {
            const _0x408f24 = _0x26a751.load(_0x3b1ffe);
            if (!_0x408f24) {
                return {
                    exists: !1
                };
            }
            const _0x163c4e = _0x5e3fbf.checkStaleness(_0x3b1ffe, _0x408f24);
            let _0xd10da1;
            try {
                _0x588495_EKlEH("svdHU", "svdHU") ? _0xd10da1 = (_0x5237e4 = _0x2d4178, _0x46f36d = [ "rev-parse", "--abbrev-ref", "HEAD" ], 
                _0x309c0c = {
                    cwd: _0x3b1ffe,
                    encoding: "utf8"
                }, _0x5237e4("git", _0x46f36d, _0x309c0c)).trim() : _0x5bbed3 = _0x36ea13.readFileSync(_0x4941b2, "utf8");
            } catch {}
            var _0x5237e4, _0x46f36d, _0x309c0c;
            return {
                exists: !0,
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
        }, _0x224263.load = function(_0x213624) {
            return _0x588495_vHGal("IGvvi", "YlXQa") ? _0x26a751.load(_0x213624) : null;
        }, _0x224263.loadRaw = function(_0x484998) {
            const _0x5dc5c4 = _0x588495_gUstc(_0x57549a, _0x484998);
            if (!_0x3344c2.existsSync(_0x5dc5c4)) {
                return null;
            }
            try {
                if (_0x588495_AUzmc("NAbij", "sPIVh")) {
                    return JSON.parse(_0x3344c2.readFileSync(_0x5dc5c4, "utf8"));
                }
                try {
                    _0x1115a5 = _0x4e0571();
                } catch (_0xacb524) {
                    _0x5b3827 = _0xacb524.message || "Failed to load repo-map module", _0x1d19b2 = null;
                }
            } catch {
                if (_0x588495_EEmnp("qJRos", "NxxPX")) {
                    throw new _0x1a6fd3(AGreqJ.ZCxNm);
                }
                return null;
            }
        }, _0x224263.exists = function(_0x20dc0e) {
            return _0x26a751.exists(_0x20dc0e);
        }, _0x224263.applyDescriptors = async function(_0x598d91, _0x214294) {
            {
                if (!_0x214294 || _0x588495_AUzmc(typeof _0x214294, "object")) {
                    throw new Error("applyDescriptors requires an object {path: descriptor}");
                }
                const _0x163986 = _0x588495_SuMXb(_0x57549a, _0x598d91);
                if (!_0x3344c2.existsSync(_0x163986)) {
                    throw new Error("No repo-intel artifact for " + _0x598d91 + "; run init first.");
                }
                await _0x588495_HZfdz(_0x1d46c6, [ "repo-intel", "set-descriptors", "--map-file", _0x163986, "--input", "-" ], JSON.stringify(_0x214294));
            }
        }, _0x224263.applySummary = async function(_0x5995d5, _0x3d0e6c) {
            if (!(_0x3d0e6c && _0x3d0e6c.depth1 && _0x3d0e6c.depth3 && _0x3d0e6c.depth10)) {
                throw new Error("applySummary requires {depth1, depth3, depth10, inputHash}");
            }
            const _0x29360c = _0x57549a(_0x5995d5);
            if (!_0x3344c2.existsSync(_0x29360c)) {
                throw new Error("No repo-intel artifact for " + _0x5995d5 + "; run init first.");
            }
            await _0x588495_HZfdz(_0x1d46c6, [ "repo-intel", "set-summary", "--map-file", _0x29360c, "--input", "-" ], JSON.stringify(_0x3d0e6c));
        }, _0x224263.checkAstGrepInstalled = async function() {
            return _0x53014c.checkInstalled();
        }, _0x224263.getInstallInstructions = function() {
            if (!_0x588495_EKlEH("hROHk", "AkdHp")) {
                return _0x53014c.getInstallInstructions();
            }
            vfgRJN.Sumyv(_0x3b923b, new _0x3137cd(vfgRJN.fAaSK(vfgRJN.qJCYU(vfgRJN.sWyDF(vfgRJN.lmYoh, _0x1216bb), vfgRJN.MCsHi), _0x15da4a)));
        }, _0x224263.queries = _0x3fba0f, _0x224263.installer = _0x53014c, _0x224263.cache = _0x26a751, 
        _0x224263.updater = _0x5e3fbf, _0x224263.converter = _0x2d2d6c, _0x48738e.exports = _0x224263, 
        Object.defineProperty(_0x48738e.exports, "embed", {
            enumerable: !0,
            get: () => _0x588495_jrIql(require_embed)
        });
    }
}), require_repo_map = __commonJS({
    "../work/agent-sh__agentsys/lib/repo-map/index.js"(_0x4164cd, _0x356534) {
        var _0x59a0a6 = require_repo_intel();
        const _0x19e687 = {};
        _0x19e687.init = _0x59a0a6.init, _0x19e687.update = _0x59a0a6.update, _0x19e687.status = _0x59a0a6.status, 
        _0x19e687.load = _0x59a0a6.load, _0x19e687.exists = _0x59a0a6.exists, _0x19e687.checkAstGrepInstalled = _0x59a0a6.checkAstGrepInstalled, 
        _0x19e687.getInstallInstructions = _0x59a0a6.getInstallInstructions, _0x19e687.installer = _0x59a0a6.installer, 
        _0x19e687.cache = _0x59a0a6.cache, _0x19e687.updater = _0x59a0a6.updater, _0x356534.exports = _0x19e687;
    }
}), require_docs_patterns = __commonJS({
    "../work/agent-sh__agentsys/lib/collectors/docs-patterns.js"(_0x3a988a, _0x5e87bb) {
        const _0x5acf9a = {
            Gwzef: function(_0x53b6c7, _0x155736) {
                return _0x53b6c7 && _0x155736;
            },
            ZUWnk: function(_0xf7107a) {
                return _0xf7107a();
            },
            Vuhdb: "Failed to load repo-map module",
            ujtiN: function(_0x3e3236, _0x151a6e) {
                return _0x3e3236 + _0x151a6e;
            },
            TJliI: function(_0x3597bd, _0x44bdc6) {
                return _0x3597bd + _0x44bdc6;
            },
            tldRT: function(_0x2723cb, _0x299079) {
                return _0x2723cb + _0x299079;
            },
            JWcEc: function(_0x4c9ad1, _0x262b8f) {
                return _0x4c9ad1 + _0x262b8f;
            },
            vXhAT: function(_0x2f8ea5, _0x217510) {
                return _0x2f8ea5 + _0x217510;
            },
            MpBfa: "Failed to download ",
            kYwYj: ":\n  URL: ",
            GnOda: "\n  Error: ",
            JWtdN: "\n\nTo install manually:\n  1. Download: ",
            QzkGh: "\n  2. Extract the binary to: ",
            GzgNA: "\n  3. Ensure it is named: ",
            ccNjJ: function(_0x1ab415, _0x390478) {
                return _0x1ab415 !== _0x390478;
            },
            uwpya: "buCdd",
            VFhkn: "OPAhZ",
            JhcQs: function(_0x37e9f1, _0x331f2f) {
                return _0x37e9f1 !== _0x331f2f;
            },
            TdgzG: "EPIPE",
            znuYR: function(_0x40b130, _0x449042) {
                return _0x40b130(_0x449042);
            },
            NMuQa: function(_0x54d546, _0x1c4a6f) {
                return _0x54d546 !== _0x1c4a6f;
            },
            aHaRW: "JRKIr",
            hAzfB: "\\$&",
            nOrsR: function(_0x48f1fe, _0x3ef3a4) {
                return _0x48f1fe !== _0x3ef3a4;
            },
            GeLMU: "unknown",
            xXZeC: function(_0x4ffb06, _0x4b9548) {
                return _0x4ffb06 === _0x4b9548;
            },
            Hfnzt: "XJHPy",
            iOtCq: "eFhVj",
            vbmNu: "dKLNk",
            MglGH: "TQjjc",
            EkjGJ: function(_0x279474, _0x49caec) {
                return _0x279474 !== _0x49caec;
            },
            WyilJ: "bOsxc",
            avIMS: "MYDGC",
            LZDbw: function(_0x85fdef, _0x4f8930) {
                return _0x85fdef + _0x4f8930;
            },
            gAMeD: "tar extraction failed (code ",
            rWxEp: "): ",
            jzyLL: "lHQGw",
            ndiIJ: "jJwVO",
            aVcDE: function(_0x4ced0b) {
                return _0x4ced0b();
            },
            WslEb: function(_0x49679f, _0x35f564, _0x97707b, _0xc00765) {
                return _0x49679f(_0x35f564, _0x97707b, _0xc00765);
            },
            HSvwV: "norms",
            pXEpj: function(_0x1b6370, _0x3e6447, _0x2869d0, _0x418627) {
                return _0x1b6370(_0x3e6447, _0x2869d0, _0x418627);
            },
            svaOe: "git",
            jaOnV: "cat-file",
            tJPLF: "pipe",
            bouoz: ".codex",
            ZsyWZ: function(_0x1911e3, _0x21a4fd) {
                return _0x1911e3 !== _0x21a4fd;
            },
            RRAtj: "string",
            YRScE: function(_0x2f853e, _0x1aecf5) {
                return _0x2f853e !== _0x1aecf5;
            },
            dFIAA: "AJcZO",
            rimmf: function(_0x51f8d0) {
                return _0x51f8d0();
            },
            nrACi: function(_0x3587be, _0x112b08) {
                return _0x3587be !== _0x112b08;
            },
            iknsf: "lIYAU",
            OooOt: "dcpdb",
            WvbWd: "repo-map-module-not-found",
            wkSzW: function(_0x26cb51, _0x2d2436) {
                return _0x26cb51 !== _0x2d2436;
            },
            HJYgR: "fSnXc",
            PDOsM: "zdOPx",
            WVUxI: "TGoxF",
            sPUsB: "ast-grep not found. Install for better doc sync accuracy?",
            aoUAe: "ast-grep Required",
            AqkwY: "Yes, show instructions",
            DwpEO: "Better accuracy with AST-based symbol detection",
            DJzEJ: "No, use regex fallback",
            uLpik: "Less accurate but works without additional install",
            YnLuZ: "Yes",
            nzSMl: function(_0x87070c, _0x386731) {
                return _0x87070c === _0x386731;
            },
            ZIyfo: "CKfeU",
            mmpAO: "ast-grep-install-pending",
            aIQXF: "ast-grep-not-installed",
            zpWFC: "tAXBx",
            wvLRC: "CrQRU",
            jssxJ: function(_0x34fe5a, _0x1f310b) {
                return _0x34fe5a === _0x1f310b;
            },
            vRiyi: "EVaHg",
            OLwDl: "already exists",
            CowoS: "init-failed",
            xlclz: "init-error",
            fRNqd: function(_0x5529a7) {
                return _0x5529a7();
            },
            JctTd: "repo-map-not-initialized",
            XyYQE: "attestation",
            irqLv: "verify",
            vvEhu: "--repo",
            SuVYB: "--format",
            EimSs: "json",
            wXxdE: "utf8",
            azmgZ: "ignore",
            GVaMQ: function(_0x34fd5d, _0x3b079b) {
                return _0x34fd5d || _0x3b079b;
            },
            FHAgU: "--version",
            GlBrX: "missing-section",
            MZYBg: "README.md",
            Nmizs: "Usage",
            KMyBs: "medium",
            mdKtg: "ZhofK",
            aZBcq: function(_0x1597a5, _0x1d6d68) {
                return _0x1597a5 === _0x1d6d68;
            },
            TyZtM: "ozMdQ",
            CvOCm: "Ruafm",
            TmcpJ: function(_0x1a019a, _0x3e0b7f) {
                return _0x1a019a + _0x3e0b7f;
            },
            ezYdl: function(_0x31a740, _0x271600) {
                return _0x31a740 === _0x271600;
            },
            jQCfi: "GliuG",
            QScoC: "uYVBp",
            pnDqc: "0|3|2|4|1",
            Nbsko: "agent-analyzer",
            iylTv: "0.3.0",
            lQuGQ: "agent-sh/agent-analyzer",
            hdvhv: function(_0x1061c6, _0xce8b69) {
                return _0x1061c6 < _0xce8b69;
            },
            hcdjZ: function(_0x1c216c, _0x4a2be7) {
                return _0x1c216c > _0x4a2be7;
            },
            USsVH: function(_0xf9d731, _0xe2f0eb) {
                return _0xf9d731 < _0xe2f0eb;
            },
            VTmuD: "musl",
            sgxOO: "import",
            sEQjh: function(_0x223783, _0x55cc59) {
                return _0x223783(_0x55cc59);
            },
            FxBjy: function(_0x5ac3bc, _0x125bff) {
                return _0x5ac3bc === _0x125bff;
            },
            lhRWZ: "ILKuo",
            tamOz: "mlMFC",
            ZInQr: function(_0x4e2a80, _0x28857a) {
                return _0x4e2a80(_0x28857a);
            },
            ROTsw: function(_0x367e59, _0x561ba9) {
                return _0x367e59 !== _0x561ba9;
            },
            cdJrY: "xoIRY",
            iAClv: function(_0x5a662a, _0x3646b3) {
                return _0x5a662a(_0x3646b3);
            },
            Gzavd: "WrocT",
            rQQKE: "ojgYY",
            ayNHm: "gSSlg",
            Irlwu: function(_0x3ab70b, _0x5dc2c0) {
                return _0x3ab70b + _0x5dc2c0;
            },
            lMGMH: function(_0x4d9c42, _0x2870c9) {
                return _0x4d9c42 !== _0x2870c9;
            },
            pxljw: "tmdcB",
            XJehw: function(_0x358be7, _0x5e6153, _0x66836) {
                return _0x358be7(_0x5e6153, _0x66836);
            },
            YARKz: function(_0x1b0246, _0x10cd85) {
                return _0x1b0246(_0x10cd85);
            },
            SuWaN: function(_0x4071bd, _0x14f44f) {
                return _0x4071bd(_0x14f44f);
            },
            gbTwD: "undocumented-export",
            hjUtN: "low",
            qslAG: "export",
            ZoNCc: "MEDIUM",
            lRlwa: "--adjust-for-ai",
            Strkb: function(_0x268e12, _0x87cd03) {
                return _0x268e12 != _0x87cd03;
            },
            snNmY: "--top",
            DCfFc: "bus-factor",
            AeErQ: "Base commit no longer exists (rebased?)",
            jldgI: function(_0x271592, _0x412baf, _0x4d3aa3) {
                return _0x271592(_0x412baf, _0x4d3aa3);
            },
            CBYwk: function(_0x119224, _0x1762e7) {
                return _0x119224 !== _0x1762e7;
            },
            TbFot: function(_0x3196bb, _0x492e0d) {
                return _0x3196bb === _0x492e0d;
            },
            mCzpq: "BtNYP",
            JXyZP: "pxiOp",
            HwfTi: function(_0x38d71e, _0x42e015) {
                return _0x38d71e(_0x42e015);
            },
            WiNuh: "BWana",
            RXfIT: "wvHzv",
            Jdjwh: "lSPhv",
            vdZTJ: "OssMp",
            WyYni: function(_0x20dc24, _0x378203) {
                return _0x20dc24 !== _0x378203;
            },
            MCxhB: "lOwVz",
            faoUv: "filename",
            aUMhS: "full-path",
            jtayl: "lsTqv",
            WEgzv: "skONc",
            GVKYB: "require",
            OGDla: "zDiKo",
            ZQdUl: "url-path",
            wXUtL: function(_0x1fe6d7, _0x1654da) {
                return _0x1fe6d7 > _0x1654da;
            },
            PXpbi: "sfeeh",
            WGDNM: "pnXnI",
            XimqE: "QfwOn",
            TyxBD: function(_0x4cf87c, _0x1d76c2, _0x1b4172) {
                return _0x4cf87c(_0x1d76c2, _0x1b4172);
            },
            qKfxC: function(_0x24c580, _0x3bc94a) {
                return _0x24c580 + _0x3bc94a;
            },
            tflcu: ".md",
            waUPD: function(_0x155f3d, _0x58e3a8) {
                return _0x155f3d === _0x58e3a8;
            },
            UNxvs: "wpmYj",
            ifagC: function(_0x1230aa, _0x35d09c) {
                return _0x1230aa === _0x35d09c;
            },
            tWTjS: "BGbKz",
            tqJnr: "node_modules",
            izKjO: "dist",
            lfmVX: "build",
            sLCTt: ".git",
            NHEER: "coverage",
            wwXHW: "vendor",
            bUojw: function(_0x58ebb6, _0x57814d) {
                return _0x58ebb6(_0x57814d);
            },
            BOWih: "contributors",
            QEvHN: "../agentsys",
            LZqeu: function(_0x69df09, _0x4645d2, _0x302cb5) {
                return _0x69df09(_0x4645d2, _0x302cb5);
            },
            xIchi: "symbols: file",
            eRUZA: "symbols",
            cujve: function(_0x474ea7, _0x5b0a95) {
                return _0x474ea7(_0x5b0a95);
            },
            JdUqz: function(_0x48cac3, _0x25e38c, _0xbc803b, _0x174ced) {
                return _0x48cac3(_0x25e38c, _0xbc803b, _0x174ced);
            },
            lQDhe: "rev-list",
            CXRXb: "--count",
            Nnyer: function(_0xc604e9, _0x32ac95) {
                return _0xc604e9(_0x32ac95);
            },
            DuWik: "issues",
            SDUsM: function(_0x28265, _0x580591) {
                return _0x28265(_0x580591);
            },
            pOZmP: "diffRisk: files must be an array of strings",
            qAZmR: "diffRisk: all entries in files must be strings",
            ENDso: function(_0x4200e7, _0x2a9237) {
                return _0x4200e7 > _0x2a9237;
            },
            ikLSZ: "--files",
            RwIZO: function(_0x3af474, _0x5ee840, _0x39eb32, _0x58c6c4) {
                return _0x3af474(_0x5ee840, _0x39eb32, _0x58c6c4);
            },
            RiACD: "diff-risk",
            LbjbL: "vyxls",
            kUCQb: "ufMsD",
            GYKzX: "Woswg",
            EWEjo: "emMgK",
            sHZkT: function(_0x27d1fa, _0x49c3f4) {
                return _0x27d1fa !== _0x49c3f4;
            },
            NcGWI: "ryfnI",
            QFyzp: "MfzPv",
            uCeVR: "RIKEU",
            UtICN: "code-example",
            aYUMr: "Verify import path is still valid",
            ptytC: function(_0x228c22, _0x4b5f5b) {
                return _0x228c22(_0x4b5f5b);
            },
            XJTWu: "oGTmu",
            WoEhD: "LKfQA",
            eiEGK: function(_0x4187e6, _0x459c10, _0x5790fe, _0x79f912) {
                return _0x4187e6(_0x459c10, _0x5790fe, _0x79f912);
            },
            mSyoC: "HEAD~1",
            FaxWA: function(_0x4a4e77, _0x1098d0, _0xf8953d, _0x56dd3f) {
                return _0x4a4e77(_0x1098d0, _0xf8953d, _0x56dd3f);
            },
            dspnV: "HEAD",
            PiFol: function(_0x1f69c3, _0x16f5ff) {
                return _0x1f69c3 === _0x16f5ff;
            },
            akFXQ: "eqjTs",
            prFLd: "ZuFSW",
            uqTVA: function(_0x43c42d, _0x3b463f) {
                return _0x43c42d === _0x3b463f;
            },
            TRoqI: "eWoWB",
            ZeuAG: "removed-export",
            iZMNi: "high",
            sUpht: "repo-map",
            gfMvD: "regex",
            rqGKW: function(_0x43c709, _0x14d2b) {
                return _0x43c709 !== _0x14d2b;
            },
            VEYDH: "FOImO",
            zcvVD: "package.json",
            grlYm: function(_0x46c325, _0x21f7da) {
                return _0x46c325 !== _0x21f7da;
            },
            yEefc: function(_0x52ed99, _0x5b3866, _0x4db7f8) {
                return _0x52ed99(_0x5b3866, _0x4db7f8);
            },
            LpQdt: "hhHYH",
            RtpnB: "OLBpZ",
            KMfaM: "outdated-version",
            DIOWE: function(_0x1821bc, _0x5a4c0b, _0x38d65a) {
                return _0x1821bc(_0x5a4c0b, _0x38d65a);
            },
            zsvSF: "tkJhk",
            bggBe: function(_0x103392, _0x3cbb0d) {
                return _0x103392 === _0x3cbb0d;
            },
            AdpzD: function(_0x36460d, _0x4f24b3, _0x2a0fcd, _0x13a71f) {
                return _0x36460d(_0x4f24b3, _0x2a0fcd, _0x13a71f);
            },
            JleGP: function(_0x4a8e40, _0x4c1828) {
                return _0x4a8e40(_0x4c1828);
            },
            jmDKL: "LalBd",
            tFoZx: "hZtkA",
            BvjBq: function(_0x39668f, _0x41cf90) {
                return _0x39668f || _0x41cf90;
            },
            mZbXR: function(_0x455ac5, _0x1427d7) {
                return _0x455ac5 === _0x1427d7;
            },
            rTaqZ: "function",
            cpzqy: "boolean",
            YKlWF: "`gh` CLI not found on PATH",
            MwfwD: "failed",
            cMiUE: function(_0x4f76b4, _0x51b85a) {
                return _0x4f76b4 + _0x51b85a;
            },
            hAFiu: " (AGENT_ANALYZER_REQUIRE_ATTESTATION=1)",
            qwNWw: "skipped",
            INtxI: function(_0x14fd1d, _0x8f7cce, _0x2a9d7e) {
                return _0x14fd1d(_0x8f7cce, _0x2a9d7e);
            },
            Cndcn: function(_0x21443c, _0x3323a1) {
                return _0x21443c === _0x3323a1;
            },
            VgzHx: "verified",
            TwvBf: "gh attestation verify exited with status ",
            FDrGa: "agent-analyzer repo-intel update failed: ",
            XaKhS: function(_0x430ddc) {
                return _0x430ddc();
            },
            hryvN: "WRXUR",
            KHTfA: function(_0x3dbbec, _0x44dcb9, _0x226dde, _0x3d17a3) {
                return _0x3dbbec(_0x44dcb9, _0x226dde, _0x3d17a3);
            },
            oqkPH: "show",
            xyVFd: "ghVjT",
            hLfSS: "CifuC",
            yqUOl: function(_0x211704, _0x5af308) {
                return _0x211704 !== _0x5af308;
            },
            TzUNi: function(_0x5e2196, _0x3ed476) {
                return _0x5e2196 === _0x3ed476;
            },
            uxdKD: "fKlMc",
            rbUkp: function(_0x3a8cf2, _0x189772) {
                return _0x3a8cf2 !== _0x189772;
            },
            yUJWx: "bltGa",
            AdxAW: "fOaOT",
            QxbdZ: 'embedder preference is "none" or unset',
            zPBLp: function(_0x25777d, _0x52380b) {
                return _0x25777d === _0x52380b;
            },
            kdvyl: "VGTdf",
            xgwXZ: function(_0x593e1d) {
                return _0x593e1d();
            },
            xQWVg: "dependents: file",
            ODAYX: "--file",
            Vtrmv: function(_0x30c6b7) {
                return _0x30c6b7();
            },
            OtzJG: function(_0x259a61, _0x17102b) {
                return _0x259a61 !== _0x17102b;
            },
            VaxEm: "LgNBY",
            ssvxl: "CHANGELOG.md",
            lvPSO: "PVCID",
            XeqZt: "Could not read CHANGELOG.md",
            BoRan: "## [Unreleased]",
            JIrgb: "log",
            byaYb: "--oneline",
            izCUP: "-10",
            KLnRi: "ScyFq",
            saCUT: "xbCJh",
            iIyQj: "LnNXW",
            qTUCR: function(_0x4775f1, _0x54b929) {
                return _0x4775f1 > _0x54b929;
            },
            AtzXw: function(_0x4a9b63, _0x14acbf) {
                return _0x4a9b63(_0x14acbf);
            },
            cRPgs: function(_0x99522a, _0x3e813, _0x257e4e) {
                return _0x99522a(_0x3e813, _0x257e4e);
            },
            nYZuf: function(_0x4798a3, _0x5e3dd3, _0x5d4c49) {
                return _0x4798a3(_0x5e3dd3, _0x5d4c49);
            },
            EOsqI: function(_0x1a14ce, _0x4b68b1) {
                return _0x1a14ce(_0x4b68b1);
            },
            rDXks: "path",
            CwrSx: function(_0x16e0eb, _0x5779f4) {
                return _0x16e0eb(_0x5779f4);
            },
            eDJaW: "child_process",
            MDUxv: "internal",
            pQqgS: "private",
            ucOxS: "utils",
            lmUqv: "helpers",
            LzXpM: "__tests__",
            FNwjW: "test",
            yXfuo: "tests",
            LDryC: "index",
            ZDjfP: "main",
            RDMIn: "app",
            sFAXZ: "server",
            Wymmm: "cli",
            rfeLb: "bin"
        };
        var _0x38b6f9 = _0x5acf9a.ZInQr(require, "fs"), _0x10caed = _0x5acf9a.EOsqI(require, _0x5acf9a.rDXks), {execFileSync: _0x2a943a} = _0x5acf9a.CwrSx(require, _0x5acf9a.eDJaW), _0x5ddbbd = null, _0x456bc2 = null;
        function _0x3f49b2() {
            if (_0x5acf9a.Gwzef(!_0x5ddbbd, !_0x456bc2)) {
                try {
                    _0x5ddbbd = _0x5acf9a.ZUWnk(require_repo_map);
                } catch (_0x1063b0) {
                    _0x456bc2 = _0x1063b0.message || _0x5acf9a.Vuhdb, _0x5ddbbd = null;
                }
            }
            return _0x5ddbbd;
        }
        var _0x1319b0 = {
            cwd: process.cwd()
        }, _0x10b849 = [ _0x5acf9a.MDUxv, _0x5acf9a.pQqgS, _0x5acf9a.ucOxS, _0x5acf9a.lmUqv, _0x5acf9a.LzXpM, _0x5acf9a.FNwjW, _0x5acf9a.yXfuo ], _0x7ea6f7 = [ _0x5acf9a.LDryC, _0x5acf9a.ZDjfP, _0x5acf9a.RDMIn, _0x5acf9a.sFAXZ, _0x5acf9a.Wymmm, _0x5acf9a.rfeLb ], _0x564288 = [ /export\s+(?:function|class|const|let|var)\s+(\w+)/g, /export\s+\{([^}]+)\}/g, /module\.exports\s*=\s*\{([^}]+)\}/ ];
        function _0x370aaa(_0x1d152f) {
            if (!_0x5acf9a.NMuQa(_0x5acf9a.aHaRW, _0x5acf9a.aHaRW)) {
                return _0x1d152f.replace(/[.*+?^${}()|[\]\\]/g, _0x5acf9a.hAzfB);
            }
            _0xc28fd4 && ICCKHo.JhcQs(_0x558f02.code, ICCKHo.TdgzG) && ICCKHo.znuYR(_0x3943b8, _0x34fe46);
        }
        function _0x5a7e60(_0x2fdf55, _0x49a7bb) {
            if (_0x5acf9a.xXZeC(_0x5acf9a.Hfnzt, _0x5acf9a.iOtCq)) {
                const _0x5904ce = new _0x52542e;
                for (const _0x270637 of _0x47cc16) {
                    const _0x40a619 = ICCKHo.znuYR(_0x13a6a9, _0x270637);
                    ICCKHo.nOrsR(_0x40a619, ICCKHo.GeLMU) && _0x5904ce.add(_0x40a619);
                }
                return _0x12ee37.from(_0x5904ce);
            }
            {
                if (_0x2fdf55.startsWith("_")) {
                    return !0;
                }
                const _0x2ecea1 = _0x49a7bb.toLowerCase();
                for (const _0x33cae8 of _0x10b849) {
                    if (_0x5acf9a.xXZeC(_0x5acf9a.vbmNu, _0x5acf9a.MglGH)) {
                        _0x54758a = _0xfb843c.parse(_0x4ab4bb);
                    } else if (_0x2ecea1.includes("/" + _0x33cae8 + "/") || _0x2ecea1.includes("\\" + _0x33cae8 + "\\")) {
                        if (_0x5acf9a.EkjGJ(_0x5acf9a.WyilJ, _0x5acf9a.avIMS)) {
                            return !0;
                        }
                        try {
                            _0x2aff33.existsSync(_0x2dd057) && _0x200c75.unlinkSync(_0x53ba48);
                        } catch {}
                        throw _0x115969;
                    }
                }
                return !!/\.(test|spec)\.[jt]sx?$/.test(_0x49a7bb);
            }
        }
        function _0x1f17a7(_0x4fd947) {
            if (_0x5acf9a.gAMeD, _0x5acf9a.rWxEp, _0x5acf9a.NMuQa(_0x5acf9a.jzyLL, _0x5acf9a.ndiIJ)) {
                const _0x4d195c = _0x10caed.basename(_0x4fd947).replace(/\.[^.]+$/, "").toLowerCase();
                return _0x7ea6f7.includes(_0x4d195c);
            }
            jPKcRD.jMLXd(_0x5ece1d, new _0x2edc6b(jPKcRD.MkWvJ(jPKcRD.eLaJN(jPKcRD.UToSk(jPKcRD.KQxVX, _0x3c35fb), jPKcRD.zsEzM), _0x4ca842)));
        }
        function _0x3c83cf(_0x5d22a2 = {}) {
            const {cwd = process.cwd()} = _0x5d22a2, _0x460051 = _0x5acf9a.fRNqd(_0x3f49b2);
            if (!_0x460051) {
                const _0x1d4fc8 = {
                    available: !1,
                    map: null
                };
                return _0x1d4fc8.fallbackReason = _0x5acf9a.WvbWd, _0x1d4fc8;
            }
            if (_0x460051.exists(cwd)) {
                const _0x1a9906 = _0x460051.load(cwd), _0x232f68 = {
                    available: !0
                };
                return _0x232f68.map = _0x1a9906, _0x232f68.fallbackReason = null, _0x232f68;
            }
            const _0x96f918 = {
                available: !1,
                map: null
            };
            return _0x96f918.fallbackReason = _0x5acf9a.JctTd, _0x96f918;
        }
        function _0xd85078(_0x1f6b2b, _0x41f380) {
            const _0x3b90e7 = {};
            if (_0x3b90e7.dKgwi = _0x5acf9a.GlBrX, _0x3b90e7.riHjt = _0x5acf9a.MZYBg, _0x3b90e7.dJjFN = _0x5acf9a.Nmizs, 
            _0x3b90e7.JckNh = _0x5acf9a.KMyBs, _0x5acf9a.xXZeC(_0x5acf9a.mdKtg, _0x5acf9a.mdKtg)) {
                if (!_0x41f380 || !_0x41f380.files) {
                    return null;
                }
                const _0xbf511 = _0x1f6b2b.replace(/\\/g, "/");
                let _0x11b0d2 = _0x41f380.files[_0xbf511];
                if (!_0x11b0d2 && _0xbf511.startsWith("./")) {
                    if (_0x5acf9a.aZBcq(_0x5acf9a.TyZtM, _0x5acf9a.CvOCm)) {
                        const _0x545b7e = _0x4f605e.execFileSync("gh", [ ICCKHo.XyYQE, ICCKHo.irqLv, _0x3220d8, ICCKHo.vvEhu, _0x32cdb7, ICCKHo.SuVYB, ICCKHo.EimSs ], {
                            encoding: ICCKHo.wXxdE,
                            stdio: [ ICCKHo.azmgZ, ICCKHo.tJPLF, ICCKHo.tJPLF ],
                            timeout: 6e4,
                            windowsHide: !0
                        });
                        return {
                            status: 0,
                            stdout: ICCKHo.GVaMQ(_0x545b7e, ""),
                            stderr: ""
                        };
                    }
                    _0x11b0d2 = _0x41f380.files[_0xbf511.slice(2)];
                }
                if (!_0x11b0d2 && !_0xbf511.startsWith("./") && (_0x11b0d2 = _0x41f380.files[_0x5acf9a.TmcpJ("./", _0xbf511)]), 
                !_0x11b0d2 || !_0x11b0d2.symbols || !_0x11b0d2.symbols.exports) {
                    if (!_0x5acf9a.ezYdl(_0x5acf9a.jQCfi, _0x5acf9a.QScoC)) {
                        return null;
                    }
                    {
                        const _0x2d5458 = {};
                        _0x2d5458.type = RjmkhS.dKgwi, _0x2d5458.file = RjmkhS.riHjt, _0x2d5458.section = RjmkhS.dJjFN, 
                        _0x2d5458.severity = RjmkhS.JckNh, _0x42223d.gaps.push(_0x2d5458);
                    }
                }
                return _0x11b0d2.symbols.exports.map((_0x42913f => _0x42913f.name));
            }
            {
                const _0x546be9 = _0x26cf9a.execFileSync(_0x56e409, [ ICCKHo.FHAgU ], {
                    timeout: 5e3,
                    encoding: ICCKHo.wXxdE,
                    stdio: [ ICCKHo.tJPLF, ICCKHo.tJPLF, ICCKHo.tJPLF ],
                    windowsHide: !0
                }), _0x377454 = _0x546be9.trim().match(/(\d+\.\d+\.\d+)/);
                return _0x377454 ? _0x377454[1] : _0x546be9.trim();
            }
        }
        function _0x237c93(_0x4404a8, _0xa4d942 = {}) {
            const _0x23d594 = {
                mlCGQ: _0x5acf9a.sgxOO,
                CElzP: function(_0x53c0bc, _0x7138fc) {
                    return _0x5acf9a.znuYR(_0x53c0bc, _0x7138fc);
                },
                dsIuN: function(_0x160d9f, _0x19b6b7) {
                    return _0x5acf9a.sEQjh(_0x160d9f, _0x19b6b7);
                }
            };
            if (!_0x5acf9a.FxBjy(_0x5acf9a.lhRWZ, _0x5acf9a.tamOz)) {
                const _0x5ac8c9 = {
                    ..._0x1319b0,
                    ..._0xa4d942
                }, _0x39c793 = _0x5ac8c9.repoMapStatus || _0x5acf9a.ZInQr(_0x3c83cf, _0x5ac8c9);
                if (!_0x39c793.available || !_0x39c793.map) {
                    if (!_0x5acf9a.ROTsw(_0x5acf9a.cdJrY, _0x5acf9a.cdJrY)) {
                        return [];
                    }
                    {
                        const _0xdc235d = _0x5acf9a.pnDqc.split("|");
                        let _0x44db67 = 0;
                        for (;;) {
                            switch (_0xdc235d[_0x44db67++]) {
                              case "0":
                                continue;

                              case "1":
                                const _0x3d7d13 = {};
                                _0x3d7d13.ANALYZER_MIN_VERSION = _0x3ef055, _0x3d7d13.BINARY_NAME = _0x40d21a, _0x3d7d13.GITHUB_REPO = _0x1d9b04, 
                                _0x3b04a6.exports = _0x3d7d13;
                                continue;

                              case "2":
                                var _0x40d21a = ICCKHo.Nbsko;
                                continue;

                              case "3":
                                var _0x3ef055 = ICCKHo.iylTv;
                                continue;

                              case "4":
                                var _0x1d9b04 = ICCKHo.lQuGQ;
                                continue;
                            }
                            break;
                        }
                    }
                }
                const _0x468ce4 = _0x39c793.map, _0x345d38 = _0x5acf9a.iAClv(_0x2053f9, _0x5ac8c9.cwd);
                let _0xd10fe3 = "";
                for (const _0x3bbff3 of _0x345d38) {
                    if (_0x5acf9a.YRScE(_0x5acf9a.Gzavd, _0x5acf9a.Gzavd)) {
                        const _0x152810 = /^[-*]\s{1,100}\*{0,2}([^\n]{1,2000}?)\*{0,2}(?:\s{0,100}[-–]\s{0,100}([^\n]{1,2000}))?$/gm;
                        let _0x5b2019;
                        for (;ICCKHo.nrACi(_0x5b2019 = _0x152810.exec(_0x185e71), null) && ICCKHo.hdvhv(_0x794d13.features.length, 20); ) {
                            const _0x4900d1 = _0x5b2019[1].trim();
                            ICCKHo.hcdjZ(_0x4900d1.length, 5) && ICCKHo.USsVH(_0x4900d1.length, 80) && _0x2d0b0a.features.push(_0x4900d1);
                        }
                        _0xec5c1a.features = [ ...new _0x16d88b(_0x2b1bf1.features) ].slice(0, 20);
                    } else {
                        try {
                            if (!_0x5acf9a.NMuQa(_0x5acf9a.rQQKE, _0x5acf9a.ayNHm)) {
                                const _0x1a211e = ICCKHo.aVcDE(_0x279f7a);
                                return !!_0x1a211e && !_0x1a211e.includes(ICCKHo.VTmuD);
                            }
                            _0xd10fe3 += _0x5acf9a.Irlwu(_0x38b6f9.readFileSync(_0x10caed.join(_0x5ac8c9.cwd, _0x3bbff3), _0x5acf9a.wXxdE), "\n");
                        } catch {}
                    }
                }
                const _0x5dac9b = [];
                for (const _0x2dc76a of _0x4404a8) {
                    const _0x3c0b61 = _0x2dc76a.replace(/\\/g, "/"), _0x26dbf4 = _0x468ce4.files[_0x3c0b61] || _0x468ce4.files[_0x3c0b61.replace(/^\.\//, "")];
                    if (_0x26dbf4 && _0x26dbf4.symbols && _0x26dbf4.symbols.exports) {
                        for (const _0x4a0475 of _0x26dbf4.symbols.exports) {
                            if (_0x5acf9a.lMGMH(_0x5acf9a.pxljw, _0x5acf9a.pxljw)) {
                                const _0x4b99cc = _0xf65826.read(_0x497fc0), _0x29169f = _0x36a729.getPath(_0x67ee75), _0x4212c7 = NezFwD.CElzP(_0x461410, _0x29169f);
                                return {
                                    enabled: NezFwD.dsIuN(_0x26eb01, _0x129afa),
                                    embedder: _0x4b99cc.embedder,
                                    embedderDetail: _0x4b99cc.embedderDetail,
                                    binaryInstalled: _0x1c1109.isAvailable(),
                                    ortBundled: !_0x30aff2.platformBundlesOrt() || _0x38d39e.existsSync(_0x2aa5a3.getBundledOrtPath()),
                                    sidecarExists: _0x5fb2a3.existsSync(_0x4212c7),
                                    sidecarPath: _0x4212c7
                                };
                            }
                            if (!_0x5acf9a.XJehw(_0x5a7e60, _0x4a0475.name, _0x3c0b61) && !_0x5acf9a.YARKz(_0x1f17a7, _0x3c0b61) && !new RegExp("\\b" + _0x5acf9a.SuWaN(_0x370aaa, _0x4a0475.name) + "\\b").test(_0xd10fe3)) {
                                const _0x1fe8aa = {};
                                _0x1fe8aa.type = _0x5acf9a.gbTwD, _0x1fe8aa.severity = _0x5acf9a.hjUtN, _0x1fe8aa.file = _0x3c0b61, 
                                _0x1fe8aa.name = _0x4a0475.name, _0x1fe8aa.line = _0x4a0475.line || 0, _0x1fe8aa.kind = _0x4a0475.kind || _0x5acf9a.qslAG, 
                                _0x1fe8aa.certainty = _0x5acf9a.ZoNCc, _0x1fe8aa.suggestion = "Export '" + _0x4a0475.name + "' in " + _0x3c0b61 + " is not mentioned in any documentation", 
                                _0x5dac9b.push(_0x1fe8aa);
                            }
                        }
                    }
                }
                return _0x5dac9b;
            }
            _0x5101c0.push(_0x23d594.mlCGQ);
        }
        function _0x1d8aac(_0x93d5f2, _0x52fa1b = {}) {
            if (_0x5acf9a.RRAtj, _0x5acf9a.wkSzW(_0x5acf9a.mCzpq, _0x5acf9a.JXyZP)) {
                const _0x39f014 = {
                    ..._0x1319b0,
                    ..._0x52fa1b
                }.cwd, _0x103f32 = [], _0x589de8 = _0x5acf9a.HwfTi(_0x2053f9, _0x39f014);
                for (const _0x319ace of _0x93d5f2) {
                    if (_0x5acf9a.xXZeC(_0x5acf9a.WiNuh, _0x5acf9a.RXfIT)) {
                        return ToqyFW.pptqG(_0x2bcece, _0x2e267d, _0xff443d[_0x1986cb]), _0x50f17c[_0x2bc583];
                    }
                    {
                        const _0x33f5d1 = _0x10caed.basename(_0x319ace).replace(/\.[^.]+$/, ""), _0x47bf21 = _0x319ace.replace(/\.[^.]+$/, "");
                        _0x10caed.dirname(_0x319ace);
                        for (const _0x430bda of _0x589de8) {
                            if (!_0x5acf9a.NMuQa(_0x5acf9a.Jdjwh, _0x5acf9a.vdZTJ)) {
                                return _0x1dc8e2.isStale = !0, _0x9ce19e.reason = ICCKHo.AeErQ, _0x95ecdb.suggestFullRebuild = !0, 
                                _0xc5aa5b;
                            }
                            {
                                let _0x212f79;
                                try {
                                    _0x212f79 = _0x38b6f9.readFileSync(_0x10caed.join(_0x39f014, _0x430bda), _0x5acf9a.wXxdE);
                                } catch {
                                    continue;
                                }
                                const _0x31afec = [];
                                if (_0x212f79.includes(_0x33f5d1)) {
                                    if (_0x5acf9a.WyYni(_0x5acf9a.MCxhB, _0x5acf9a.MCxhB)) {
                                        const _0x162159 = [];
                                        return _0x265152.adjustForAi && _0x162159.push(ICCKHo.lRlwa), ICCKHo.Strkb(_0x5e8678.limit, null) && _0x162159.push(ICCKHo.snNmY, ICCKHo.SuWaN(_0x36bb5b, _0x31a611.limit)), 
                                        ICCKHo.pXEpj(_0x56d236, ICCKHo.DCfFc, _0x162159, _0x319365);
                                    }
                                    _0x31afec.push(_0x5acf9a.faoUv);
                                }
                                if (_0x212f79.includes(_0x319ace) && _0x31afec.push(_0x5acf9a.aUMhS), _0x212f79.includes("from '" + _0x47bf21 + "'") || _0x212f79.includes('from "' + _0x47bf21 + '"')) {
                                    if (!_0x5acf9a.ccNjJ(_0x5acf9a.jtayl, _0x5acf9a.WEgzv)) {
                                        return ICCKHo.iylTv;
                                    }
                                    _0x31afec.push(_0x5acf9a.sgxOO);
                                }
                                if ((_0x212f79.includes("require('" + _0x47bf21 + "')") || _0x212f79.includes('require("' + _0x47bf21 + '")')) && _0x31afec.push(_0x5acf9a.GVKYB), 
                                (_0x212f79.includes("/" + _0x33f5d1) || _0x212f79.includes("/" + _0x33f5d1 + ".")) && (_0x5acf9a.lMGMH(_0x5acf9a.OGDla, _0x5acf9a.OGDla) ? _0x3721d2[_0x574e6e] && _0x50f71c.frameworks.push(_0x278f6c) : _0x31afec.push(_0x5acf9a.ZQdUl)), 
                                _0x5acf9a.wXUtL(_0x31afec.length, 0)) {
                                    const _0xbf915e = {};
                                    _0xbf915e.doc = _0x430bda, _0xbf915e.referencedFile = _0x319ace, _0xbf915e.referenceTypes = _0x31afec, 
                                    _0x103f32.push(_0xbf915e);
                                }
                            }
                        }
                    }
                }
                return _0x103f32;
            }
            if (ToqyFW.LaPic(typeof _0x18c7bc, ToqyFW.GZUDe) || ToqyFW.sjZzy(_0x7ec459.length, 0)) {
                throw new _0x4fcf81(_0x496610 + " must be a non-empty string");
            }
        }
        function _0x2053f9(_0x1b18cc) {
            const _0x38cb8b = {};
            if (_0x38cb8b.kJEYk = _0x5acf9a.hAzfB, _0x38cb8b.FcgJj = _0x5acf9a.Nbsko, _0x5acf9a.ifagC(_0x5acf9a.tWTjS, _0x5acf9a.tWTjS)) {
                const _0x268e08 = [], _0x3fa118 = [ _0x5acf9a.tqJnr, _0x5acf9a.izKjO, _0x5acf9a.lfmVX, _0x5acf9a.sLCTt, _0x5acf9a.NHEER, _0x5acf9a.wwXHW ];
                function _0x4a5868(_0x14ccc3, _0x109dd4 = 0) {
                    if (!_0x5acf9a.wXUtL(_0x109dd4, 5) && !_0x5acf9a.hcdjZ(_0x268e08.length, 200)) {
                        try {
                            const _0x2b203b = {
                                withFileTypes: !0
                            }, _0x3c2100 = _0x38b6f9.readdirSync(_0x14ccc3, _0x2b203b);
                            for (const _0x332a2d of _0x3c2100) {
                                if (_0x5acf9a.nzSMl(_0x5acf9a.PXpbi, _0x5acf9a.PXpbi)) {
                                    const _0x10e2c9 = _0x10caed.join(_0x14ccc3, _0x332a2d.name), _0x592f98 = _0x10caed.relative(_0x1b18cc, _0x10e2c9);
                                    if (_0x332a2d.isDirectory()) {
                                        if (!_0x3fa118.includes(_0x332a2d.name) && !_0x332a2d.name.startsWith(".")) {
                                            if (!_0x5acf9a.CBYwk(_0x5acf9a.WGDNM, _0x5acf9a.XimqE)) {
                                                return _0x1ea219.replace(/[.*+?^${}()|[\]\\]/g, oLmRXe.kJEYk);
                                            }
                                            _0x5acf9a.TyxBD(_0x4a5868, _0x10e2c9, _0x5acf9a.qKfxC(_0x109dd4, 1));
                                        }
                                    } else {
                                        _0x332a2d.isFile() && _0x332a2d.name.endsWith(_0x5acf9a.tflcu) && (_0x5acf9a.waUPD(_0x5acf9a.UNxvs, _0x5acf9a.UNxvs) ? _0x268e08.push(_0x592f98) : _0x40f84a += _0x1e4320);
                                    }
                                } else {
                                    _0x795215.isStale = !0, _0xbf23b2.reason = "Branch changed from " + _0x136f7c.git.branch + " to " + _0x43a17f, 
                                    _0x4a6785.suggestFullRebuild = !0;
                                }
                            }
                        } catch {}
                    }
                }
                return _0x5acf9a.sEQjh(_0x4a5868, _0x1b18cc), _0x268e08;
            }
            return {
                found: !0,
                version: _0x4c8d53.getVersion(),
                tool: oLmRXe.FcgJj
            };
        }
        function _0xbc1c88(_0x5297f7, _0x384dbc) {
            if (_0x5acf9a.FxBjy(_0x5acf9a.zsvSF, _0x5acf9a.zsvSF)) {
                const _0x277b06 = _0x5297f7.indexOf(_0x384dbc);
                return _0x5acf9a.bggBe(_0x277b06, -1) ? 0 : _0x5297f7.substring(0, _0x277b06).split("\n").length;
            }
            return _0x2f9fc4.isArray(_0x33d7e6) ? _0x29a91c : [];
        }
        function _0x2fc28d(_0x531ba3) {
            if (_0x5acf9a.svaOe, _0x5acf9a.lQDhe, _0x5acf9a.CXRXb, _0x5acf9a.wXxdE, _0x5acf9a.tJPLF, 
            _0x5acf9a.FxBjy(_0x5acf9a.jmDKL, _0x5acf9a.tFoZx)) {
                const _0x339a47 = AtPepr.wSHeO(_0x4efb04, AtPepr.peLPZ, [ AtPepr.AHtUl, _0x1f6c4d + "..HEAD", AtPepr.UXXom ], {
                    cwd: _0x2b3a97,
                    encoding: AtPepr.GIxwF,
                    stdio: [ AtPepr.tPpkl, AtPepr.tPpkl, AtPepr.tPpkl ]
                }).trim();
                return AtPepr.aQGPD(_0x1f4298, _0x339a47) || 0;
            }
            return !(_0x5acf9a.ZsyWZ(typeof _0x531ba3, _0x5acf9a.RRAtj) || !_0x531ba3) && /^[a-zA-Z0-9_./-]+(?:[~^][0-9]+)?$/.test(_0x531ba3);
        }
        function _0x593140(_0x336ee0, _0x6e8cd, _0x366977 = {}) {
            _0x5acf9a.rTaqZ, _0x5acf9a.cpzqy, _0x5acf9a.YKlWF, _0x5acf9a.MwfwD, _0x5acf9a.hAFiu, 
            _0x5acf9a.qwNWw, _0x5acf9a.VgzHx, _0x5acf9a.TwvBf, _0x5acf9a.GeLMU, _0x5acf9a.FDrGa;
            const _0x10fdd2 = {
                ..._0x1319b0,
                ..._0x366977
            };
            if (!_0x5acf9a.cujve(_0x2fc28d, _0x6e8cd)) {
                if (_0x5acf9a.rqGKW(_0x5acf9a.hryvN, _0x5acf9a.hryvN)) {
                    const _0x4a54f7 = JjrDko.pwOiq(_0x34258f, {}), _0x5266d2 = _0x4a54f7.repo || _0x7eeeee, _0x4ba4c6 = JjrDko.irpLd(typeof _0x4a54f7.ghRunner, JjrDko.qpxgJ) ? _0x4a54f7.ghRunner : _0x3e6243, _0x44b1b4 = JjrDko.HuPLK(typeof _0x4a54f7.requireAttestation, JjrDko.WoGPE) ? _0x4a54f7.requireAttestation : JjrDko.irpLd(_0x350ab0.env.AGENT_ANALYZER_REQUIRE_ATTESTATION, "1");
                    if (!JjrDko.lKDzg(_0x1907a8, _0x4a54f7.ghProbe)) {
                        const _0xaf8049 = JjrDko.AEySF;
                        if (_0x44b1b4) {
                            return {
                                status: JjrDko.kCtuJ,
                                reason: JjrDko.aAxww(_0xaf8049, JjrDko.etTdi)
                            };
                        }
                        const _0x56ee58 = {};
                        return _0x56ee58.status = JjrDko.OPzUF, _0x56ee58.reason = _0xaf8049, _0x56ee58;
                    }
                    const _0x210d46 = JjrDko.TsAgm(_0x4ba4c6, _0x487b1a, _0x5266d2);
                    if (_0x210d46 && JjrDko.YnsJe(_0x210d46.status, 0)) {
                        const _0x506948 = {};
                        return _0x506948.status = JjrDko.DSHFH, _0x506948;
                    }
                    return {
                        status: JjrDko.kCtuJ,
                        reason: JjrDko.aAxww(JjrDko.ynfnK, _0x210d46 && JjrDko.okita(_0x210d46.status, null) ? _0x210d46.status : JjrDko.WDBzl),
                        stderr: _0x210d46 && _0x210d46.stderr || ""
                    };
                }
                return [];
            }
            try {
                const _0x26cfa7 = _0x5acf9a.KHTfA(_0x2a943a, _0x5acf9a.svaOe, [ _0x5acf9a.oqkPH, _0x6e8cd + ":" + _0x336ee0 ], {
                    cwd: _0x10fdd2.cwd,
                    encoding: _0x5acf9a.wXxdE,
                    stdio: [ _0x5acf9a.tJPLF, _0x5acf9a.tJPLF, _0x5acf9a.tJPLF ]
                }), _0x504f13 = [];
                for (const _0x2f7274 of _0x564288) {
                    if (_0x5acf9a.ZsyWZ(_0x5acf9a.xyVFd, _0x5acf9a.hLfSS)) {
                        const _0x1d5ac5 = new RegExp(_0x2f7274.source, _0x2f7274.flags);
                        let _0x22c6fa;
                        for (;_0x5acf9a.yqUOl(_0x22c6fa = _0x1d5ac5.exec(_0x26cfa7), null); ) {
                            if (_0x5acf9a.TzUNi(_0x5acf9a.uxdKD, _0x5acf9a.uxdKD)) {
                                if (_0x22c6fa[1].includes(",")) {
                                    const _0x52742f = _0x22c6fa[1].split(",").map((_0x4fb835 => _0x4fb835.trim().split(/\s+as\s+/)[0].trim()));
                                    _0x504f13.push(..._0x52742f.filter((_0x2878dc => _0x2878dc && /^\w+$/.test(_0x2878dc))));
                                } else {
                                    if (!_0x5acf9a.rbUkp(_0x5acf9a.yUJWx, _0x5acf9a.AdxAW)) {
                                        return {
                                            success: !1,
                                            error: JjrDko.gVCOO(JjrDko.GNOZa, _0x399ff0.message)
                                        };
                                    }
                                    _0x504f13.push(_0x22c6fa[1]);
                                }
                            } else {
                                try {
                                    return !!JjrDko.YQDDc(_0x703844);
                                } catch (_0x283837) {
                                    return !1;
                                }
                            }
                        }
                    } else {
                        _0x40ceb3 += _0x593a54.toString(ICCKHo.wXxdE);
                    }
                }
                return [ ...new Set(_0x504f13) ];
            } catch {
                return [];
            }
        }
        function _0xf67ea0(_0x2f2dd0, _0xadce63) {
            if (_0x5acf9a.zPBLp(_0x5acf9a.kdvyl, _0x5acf9a.kdvyl)) {
                const _0x35d7c9 = _0x2f2dd0.split(".").map(Number), _0x1ea7f2 = _0xadce63.split(".").map(Number);
                for (let _0x19e1c5 = 0; _0x5acf9a.USsVH(_0x19e1c5, 3); _0x19e1c5++) {
                    const _0x5ecf44 = _0x35d7c9[_0x19e1c5] || 0, _0x276337 = _0x1ea7f2[_0x19e1c5] || 0;
                    if (_0x5acf9a.hdvhv(_0x5ecf44, _0x276337)) {
                        return -1;
                    }
                    if (_0x5acf9a.ENDso(_0x5ecf44, _0x276337)) {
                        return 1;
                    }
                }
                return 0;
            }
            {
                const _0x1c9f92 = {
                    ran: !1
                };
                return _0x1c9f92.reason = ICCKHo.QxbdZ, _0x1c9f92;
            }
        }
        function _0x2dcb71(_0x11cf2a, _0x3767c9 = {}) {
            if (!_0x5acf9a.OtzJG(_0x5acf9a.VaxEm, _0x5acf9a.VaxEm)) {
                const _0x5739fa = {
                    ..._0x1319b0,
                    ..._0x3767c9
                }.cwd, _0x5e01ab = _0x10caed.join(_0x5739fa, _0x5acf9a.ssvxl);
                if (!_0x38b6f9.existsSync(_0x5e01ab)) {
                    return {
                        exists: !1
                    };
                }
                let _0x10c90d;
                try {
                    _0x10c90d = _0x38b6f9.readFileSync(_0x5e01ab, _0x5acf9a.wXxdE);
                } catch {
                    if (!_0x5acf9a.OtzJG(_0x5acf9a.lvPSO, _0x5acf9a.lvPSO)) {
                        const _0x2aec76 = {
                            exists: !1
                        };
                        return _0x2aec76.error = _0x5acf9a.XeqZt, _0x2aec76;
                    }
                    ICCKHo.yEefc(_0x3ca8a6, _0x35e806, ICCKHo.xQWVg), _0x302b99.push(ICCKHo.ODAYX, _0x2e34c4);
                }
                const _0x119cc3 = _0x10c90d.includes(_0x5acf9a.BoRan);
                let _0xe639d3 = [];
                try {
                    _0xe639d3 = _0x5acf9a.eiEGK(_0x2a943a, _0x5acf9a.svaOe, [ _0x5acf9a.JIrgb, _0x5acf9a.byaYb, _0x5acf9a.izCUP, _0x5acf9a.dspnV ], {
                        cwd: _0x5739fa,
                        encoding: _0x5acf9a.wXxdE,
                        stdio: [ _0x5acf9a.tJPLF, _0x5acf9a.tJPLF, _0x5acf9a.tJPLF ]
                    }).trim().split("\n");
                } catch {}
                const _0x42a469 = [], _0x2711fb = [];
                for (const _0x51069a of _0xe639d3) {
                    if (_0x5acf9a.jssxJ(_0x5acf9a.KLnRi, _0x5acf9a.KLnRi)) {
                        if (!_0x51069a) {
                            continue;
                        }
                        const _0x4ba7de = _0x51069a.substring(8);
                        _0x10c90d.includes(_0x4ba7de) || _0x10c90d.includes(_0x51069a.substring(0, 7)) ? _0x5acf9a.ifagC(_0x5acf9a.saCUT, _0x5acf9a.iIyQj) ? DabKtW.DluVO(_0x57a1a4) : _0x42a469.push(_0x4ba7de) : _0x4ba7de.match(/^(feat|fix|breaking)/i) && _0x2711fb.push(_0x4ba7de);
                    } else {
                        DabKtW.TDfsE(_0x1af6d3, _0x52bdd6);
                    }
                }
                return {
                    exists: !0,
                    hasUnreleased: _0x119cc3,
                    documented: _0x42a469,
                    undocumented: _0x2711fb,
                    suggestion: _0x5acf9a.qTUCR(_0x2711fb.length, 0) ? _0x2711fb.length + " commits may need CHANGELOG entries" : null
                };
            }
            _0x1dd252 = _0x126055, ICCKHo.xgwXZ(_0x51f234);
        }
        const _0x5a2fc7 = {};
        _0x5a2fc7.DEFAULT_OPTIONS = _0x1319b0, _0x5a2fc7.findRelatedDocs = _0x1d8aac, _0x5a2fc7.findMarkdownFiles = _0x2053f9, 
        _0x5a2fc7.analyzeDocIssues = function(_0x36329f, _0x58b5a0, _0x511877 = {}) {
            if (_0x5acf9a.DuWik, _0x5acf9a.bouoz, _0x5acf9a.Nbsko, _0x5acf9a.pOZmP, _0x5acf9a.qAZmR, 
            _0x5acf9a.ikLSZ, _0x5acf9a.RiACD, _0x5acf9a.ezYdl(_0x5acf9a.LbjbL, _0x5acf9a.LbjbL)) {
                const _0x41ef21 = {
                    ..._0x1319b0,
                    ..._0x511877
                }, _0x121d67 = _0x41ef21.cwd, _0x1505b7 = [];
                let _0x518be4;
                try {
                    if (!_0x5acf9a.ZsyWZ(_0x5acf9a.kUCQb, _0x5acf9a.GYKzX)) {
                        const _0x2278c0 = [];
                        return ICCKHo.Strkb(_0x4ad640.limit, null) && _0x2278c0.push(ICCKHo.snNmY, ICCKHo.bUojw(_0x52391b, _0x75d70e.limit)), 
                        ICCKHo.pXEpj(_0x61a2a, ICCKHo.BOWih, _0x2278c0, _0x3fb3c5);
                    }
                    _0x518be4 = _0x38b6f9.readFileSync(_0x10caed.join(_0x121d67, _0x36329f), _0x5acf9a.wXxdE);
                } catch {
                    if (!_0x5acf9a.YRScE(_0x5acf9a.EWEjo, _0x5acf9a.EWEjo)) {
                        return _0x1505b7;
                    }
                    {
                        const _0x389dda = {
                            source: cjzeSC.usuVf,
                            ..._0x14e9c2.error
                        };
                        _0x1275a8.errors.push(_0x389dda);
                    }
                }
                _0x518be4.split("\n");
                const _0x41f589 = /```[\s\S]*?```/g, _0x2a3ca8 = _0x518be4.match(_0x41f589) || [];
                for (const _0x15458c of _0x2a3ca8) {
                    const _0x5c3926 = /import .* from ['"]([^'"]+)['"]/g;
                    let _0x48c526;
                    for (;_0x5acf9a.CBYwk(_0x48c526 = _0x5c3926.exec(_0x15458c), null); ) {
                        if (_0x5acf9a.sHZkT(_0x5acf9a.NcGWI, _0x5acf9a.QFyzp)) {
                            const _0x46cc82 = _0x48c526[1], _0x12c250 = _0x58b5a0.replace(/\.[^.]+$/, "");
                            if (_0x46cc82.includes(_0x10caed.basename(_0x12c250))) {
                                if (!_0x5acf9a.TbFot(_0x5acf9a.uCeVR, _0x5acf9a.uCeVR)) {
                                    return _0x1829dc.set(_0x4ae6fe, cjzeSC.ZlPpR), cjzeSC.ZlPpR;
                                }
                                _0x1505b7.push({
                                    type: _0x5acf9a.UtICN,
                                    severity: _0x5acf9a.KMyBs,
                                    line: _0x5acf9a.jldgI(_0xbc1c88, _0x518be4, _0x48c526[0]),
                                    current: _0x48c526[0],
                                    suggestion: _0x5acf9a.aYUMr
                                });
                            }
                        } else {
                            var _0x5ded9c = ICCKHo.fRNqd(_0x5a6f9b);
                            const _0x2166b7 = {};
                            _0x2166b7.init = _0x5ded9c.init, _0x2166b7.update = _0x5ded9c.update, _0x2166b7.status = _0x5ded9c.status, 
                            _0x2166b7.load = _0x5ded9c.load, _0x2166b7.exists = _0x5ded9c.exists, _0x2166b7.checkAstGrepInstalled = _0x5ded9c.checkAstGrepInstalled, 
                            _0x2166b7.getInstallInstructions = _0x5ded9c.getInstallInstructions, _0x2166b7.installer = _0x5ded9c.installer, 
                            _0x2166b7.cache = _0x5ded9c.cache, _0x2166b7.updater = _0x5ded9c.updater, _0x32a891.exports = _0x2166b7;
                        }
                    }
                }
                const _0x5464c4 = _0x5acf9a.ptytC(_0x3c83cf, _0x41ef21);
                let _0x170fbb, _0x33bed9, _0x207dde = !1;
                if (_0x5464c4.available && _0x5464c4.map) {
                    const _0x521443 = _0x5acf9a.TyxBD(_0xd85078, _0x58b5a0, _0x5464c4.map);
                    if (_0x521443) {
                        if (_0x5acf9a.JhcQs(_0x5acf9a.XJTWu, _0x5acf9a.WoEhD)) {
                            _0x33bed9 = _0x521443, _0x170fbb = _0x5acf9a.eiEGK(_0x593140, _0x58b5a0, _0x5acf9a.mSyoC, _0x41ef21), 
                            _0x207dde = !0;
                        } else {
                            const _0x1a6b89 = cjzeSC.WEzEc(_0x30346a, _0x52ce6a);
                            _0x352b59.existsSync(_0x1a6b89) && _0x487f10.unlinkSync(_0x1a6b89);
                        }
                    }
                }
                !_0x207dde && (_0x170fbb = _0x5acf9a.FaxWA(_0x593140, _0x58b5a0, _0x5acf9a.mSyoC, _0x41ef21), 
                _0x33bed9 = _0x5acf9a.RwIZO(_0x593140, _0x58b5a0, _0x5acf9a.dspnV, _0x41ef21));
                const _0x5028f2 = _0x170fbb.filter((_0x569aff => !_0x33bed9.includes(_0x569aff)));
                for (const _0x5293c3 of _0x5028f2) {
                    if (_0x5acf9a.PiFol(_0x5acf9a.akFXQ, _0x5acf9a.prFLd)) {
                        const {binary: _0x4b838b} = _0x5acf9a.iAClv(_0x40c127, _0x5acf9a.QEvHN).get();
                        if (_0x4b838b) {
                            return _0x4b838b;
                        }
                    } else if (_0x518be4.includes(_0x5293c3)) {
                        if (!_0x5acf9a.uqTVA(_0x5acf9a.TRoqI, _0x5acf9a.TRoqI)) {
                            return ICCKHo.LZqeu(_0x5e24e9, _0x51eef2, ICCKHo.xIchi), ICCKHo.pXEpj(_0x50a874, ICCKHo.eRUZA, [ _0x2b7232 ], _0x34312f);
                        }
                        {
                            const _0x5bda98 = {};
                            _0x5bda98.type = _0x5acf9a.ZeuAG, _0x5bda98.severity = _0x5acf9a.iZMNi, _0x5bda98.reference = _0x5293c3, 
                            _0x5bda98.suggestion = "'" + _0x5293c3 + "' was removed or renamed", _0x5bda98.detectionMethod = _0x207dde ? _0x5acf9a.sUpht : _0x5acf9a.gfMvD, 
                            _0x1505b7.push(_0x5bda98);
                        }
                    }
                }
                try {
                    if (_0x5acf9a.rqGKW(_0x5acf9a.VEYDH, _0x5acf9a.VEYDH)) {
                        if (_0x10d068.isAvailable()) {
                            return {
                                found: !0,
                                version: _0x49c7c6.getVersion(),
                                tool: cjzeSC.Iwvbu
                            };
                        }
                        try {
                            return _0x49660c.ensureBinarySync(), {
                                found: !0,
                                version: _0x3d7505.getVersion(),
                                tool: cjzeSC.Iwvbu
                            };
                        } catch (_0x5998f7) {
                            const _0x303c98 = {
                                found: !1
                            };
                            return _0x303c98.error = _0x5998f7.message, _0x303c98.tool = cjzeSC.Iwvbu, _0x303c98;
                        }
                    } else {
                        const _0x278922 = _0x38b6f9.readFileSync(_0x10caed.join(_0x121d67, _0x5acf9a.zcvVD), _0x5acf9a.wXxdE), _0x3d22f2 = JSON.parse(_0x278922).version, _0x48b2e2 = _0x518be4.matchAll(/version[:\s]+['"]?(\d+\.\d+\.\d+)/gi);
                        for (const _0x9d7f60 of _0x48b2e2) {
                            const _0x18e2e4 = _0x9d7f60[1];
                            if (_0x5acf9a.grlYm(_0x18e2e4, _0x3d22f2) && _0x5acf9a.hdvhv(_0x5acf9a.yEefc(_0xf67ea0, _0x18e2e4, _0x3d22f2), 0)) {
                                if (!_0x5acf9a.rqGKW(_0x5acf9a.LpQdt, _0x5acf9a.RtpnB)) {
                                    if (!_0x4652c7.isArray(_0x3e5773)) {
                                        throw new _0x3a3830(cjzeSC.OeITo);
                                    }
                                    if (!_0x23b975.every((_0x43e453 => "string" == typeof _0x43e453))) {
                                        throw new _0x42e9c6(cjzeSC.MiuXO);
                                    }
                                    const _0x1976d5 = _0x453d22.join(",");
                                    if (cjzeSC.qTAmW(_0x1976d5.length, 3e4)) {
                                        throw new _0x59f24f("diffRisk: files argument exceeds 30000 character limit (got " + _0x1976d5.length + ")");
                                    }
                                    const _0x3d4252 = [ cjzeSC.SFNOt, _0x1976d5 ];
                                    return cjzeSC.ndlwj(_0x5d5963, cjzeSC.gPlfh, _0x3d4252, _0x2f9369);
                                }
                                _0x1505b7.push({
                                    type: _0x5acf9a.KMfaM,
                                    severity: _0x5acf9a.hjUtN,
                                    line: _0x5acf9a.DIOWE(_0xbc1c88, _0x518be4, _0x9d7f60[0]),
                                    current: _0x18e2e4,
                                    expected: _0x3d22f2,
                                    suggestion: "Update version from " + _0x18e2e4 + " to " + _0x3d22f2
                                });
                            }
                        }
                    }
                } catch {}
                return _0x1505b7;
            }
            if (!ICCKHo.cujve(_0x4f6861, _0x5677e3)) {
                return 0;
            }
            try {
                const _0x5705d9 = ICCKHo.JdUqz(_0x5f1e7d, ICCKHo.svaOe, [ ICCKHo.lQDhe, _0x4bc280 + "..HEAD", ICCKHo.CXRXb ], {
                    cwd: _0x1a43a0,
                    encoding: ICCKHo.wXxdE,
                    stdio: [ ICCKHo.tJPLF, ICCKHo.tJPLF, ICCKHo.tJPLF ]
                }).trim();
                return ICCKHo.Nnyer(_0xfdf179, _0x5705d9) || 0;
            } catch {
                return 0;
            }
        }, _0x5a2fc7.checkChangelog = _0x2dcb71, _0x5a2fc7.getExportsFromGit = _0x593140, 
        _0x5a2fc7.compareVersions = _0xf67ea0, _0x5a2fc7.findLineNumber = _0xbc1c88, _0x5a2fc7.collect = function(_0x476c52 = {}) {
            const _0x12dce7 = {
                ..._0x1319b0,
                ..._0x476c52
            }, _0x77b0d6 = _0x12dce7.changedFiles || [], _0x2cd840 = _0x5acf9a.AtzXw(_0x3c83cf, _0x12dce7);
            return {
                relatedDocs: _0x5acf9a.TyxBD(_0x1d8aac, _0x77b0d6, _0x12dce7),
                changelog: _0x5acf9a.cRPgs(_0x2dcb71, _0x77b0d6, _0x12dce7),
                markdownFiles: _0x5acf9a.AtzXw(_0x2053f9, _0x12dce7.cwd),
                repoMap: {
                    available: _0x2cd840.available,
                    fallbackReason: _0x2cd840.fallbackReason,
                    stats: _0x2cd840.map ? {
                        files: Object.keys(_0x2cd840.map.files || {}).length,
                        symbols: _0x2cd840.map.stats?.totalSymbols || 0
                    } : null
                },
                undocumentedExports: _0x2cd840.available ? _0x5acf9a.nYZuf(_0x237c93, _0x77b0d6, {
                    ..._0x12dce7,
                    repoMapStatus: _0x2cd840
                }) : []
            };
        }, _0x5a2fc7.ensureRepoMap = async function(_0x11a9e8 = {}) {
            const _0x3f40a1 = {
                nbOUC: function(_0x6a4061, _0x1f36c6, _0x5bb1cc, _0x3c7704) {
                    return _0x5acf9a.pXEpj(_0x6a4061, _0x1f36c6, _0x5bb1cc, _0x3c7704);
                },
                FJqJA: _0x5acf9a.svaOe,
                GLLvc: _0x5acf9a.jaOnV,
                whfUZ: _0x5acf9a.tJPLF,
                icziN: _0x5acf9a.bouoz,
                FIpxD: function(_0x1b5013, _0xbf6844) {
                    return _0x5acf9a.znuYR(_0x1b5013, _0xbf6844);
                },
                ctohs: function(_0x2cf1f0, _0x36e263) {
                    return _0x5acf9a.ZsyWZ(_0x2cf1f0, _0x36e263);
                },
                odzbZ: _0x5acf9a.RRAtj
            };
            if (_0x5acf9a.YRScE(_0x5acf9a.dFIAA, _0x5acf9a.dFIAA)) {
                return CuDssH.nbOUC(_0xc1ac3c, CuDssH.FJqJA, [ CuDssH.GLLvc, "-e", _0xf45511 ], {
                    cwd: _0x4fa17e,
                    stdio: [ CuDssH.whfUZ, CuDssH.whfUZ, CuDssH.whfUZ ]
                }), !0;
            }
            {
                const {cwd = process.cwd(), askUser: _0x2b0f10} = _0x11a9e8, _0x399169 = _0x5acf9a.rimmf(_0x3f49b2);
                if (!_0x399169) {
                    if (_0x5acf9a.nrACi(_0x5acf9a.iknsf, _0x5acf9a.OooOt)) {
                        const _0x22fd8d = {
                            available: !1,
                            map: null
                        };
                        return _0x22fd8d.fallbackReason = _0x5acf9a.WvbWd, _0x22fd8d;
                    }
                    {
                        const _0x457006 = _0x4f3f66.join(_0x4c6b27, CuDssH.icziN);
                        if (CuDssH.FIpxD(_0x20afbb, _0x457006)) {
                            return _0x48e427.set(_0x5325be, CuDssH.icziN), CuDssH.icziN;
                        }
                    }
                }
                if (_0x399169.exists(cwd)) {
                    if (!_0x5acf9a.wkSzW(_0x5acf9a.HJYgR, _0x5acf9a.HJYgR)) {
                        const _0x57a4cf = _0x399169.load(cwd), _0x471ced = {
                            available: !0
                        };
                        return _0x471ced.map = _0x57a4cf, _0x471ced.fallbackReason = null, _0x471ced;
                    }
                    _0x135284 = _0x14405e.runAnalyzer(_0x5051ce).trim();
                }
                if (!(await _0x399169.checkAstGrepInstalled()).found) {
                    if (_0x5acf9a.xXZeC(_0x5acf9a.PDOsM, _0x5acf9a.PDOsM)) {
                        if (_0x2b0f10) {
                            if (_0x5acf9a.JhcQs(_0x5acf9a.WVUxI, _0x5acf9a.WVUxI)) {
                                !_0x5ca807.includes(_0x405373.name) && _0x25fdc1.push(_0x395034.name);
                            } else {
                                const _0x40d849 = await _0x5acf9a.znuYR(_0x2b0f10, {
                                    question: _0x5acf9a.sPUsB,
                                    header: _0x5acf9a.aoUAe,
                                    options: [ {
                                        label: _0x5acf9a.AqkwY,
                                        description: _0x5acf9a.DwpEO
                                    }, {
                                        label: _0x5acf9a.DJzEJ,
                                        description: _0x5acf9a.uLpik
                                    } ]
                                });
                                if (_0x40d849 && _0x40d849.includes(_0x5acf9a.YnLuZ)) {
                                    if (_0x5acf9a.nzSMl(_0x5acf9a.ZIyfo, _0x5acf9a.ZIyfo)) {
                                        const _0x24baca = _0x399169.getInstallInstructions(), _0x1ae390 = {
                                            available: !1,
                                            map: null
                                        };
                                        return _0x1ae390.fallbackReason = _0x5acf9a.mmpAO, _0x1ae390.installInstructions = _0x24baca, 
                                        _0x1ae390;
                                    }
                                    return !(_0x3f40a1.ctohs(typeof _0x12e688, _0x3f40a1.odzbZ) || !_0x225c6a) && /^[a-zA-Z0-9_./-]+(?:[~^][0-9]+)?$/.test(_0x43396d);
                                }
                            }
                        }
                        const _0x4e1e67 = {
                            available: !1,
                            map: null
                        };
                        return _0x4e1e67.fallbackReason = _0x5acf9a.aIQXF, _0x4e1e67;
                    }
                    return _0x3cbf25.join(_0x1585cb.dirname(ICCKHo.ZUWnk(_0xf7e68)), ICCKHo.aVcDE(_0x301c61));
                }
                try {
                    if (_0x5acf9a.nzSMl(_0x5acf9a.zpWFC, _0x5acf9a.wvLRC)) {
                        return ICCKHo.WslEb(_0x22ba2e, ICCKHo.HSvwV, [], _0x5edac8);
                    }
                    {
                        const _0x2312b3 = {
                            force: !1
                        }, _0x3b7fcd = await _0x399169.init(cwd, _0x2312b3);
                        if (_0x3b7fcd.success) {
                            if (_0x5acf9a.jssxJ(_0x5acf9a.vRiyi, _0x5acf9a.vRiyi)) {
                                const _0x3e642f = {
                                    available: !0
                                };
                                return _0x3e642f.map = _0x3b7fcd.map, _0x3e642f.fallbackReason = null, _0x3e642f;
                            }
                            {
                                const _0x4cfd20 = {};
                                _0x4cfd20.stdout = _0x36913c, _0x4cfd20.stderr = _0x22e708, ICCKHo.znuYR(_0x24db50, _0x4cfd20);
                            }
                        }
                        if (_0x3b7fcd.error && _0x3b7fcd.error.includes(_0x5acf9a.OLwDl)) {
                            const _0x5932c6 = _0x399169.load(cwd), _0x5be792 = {
                                available: !0
                            };
                            return _0x5be792.map = _0x5932c6, _0x5be792.fallbackReason = null, _0x5be792;
                        }
                        const _0x2c19d0 = {
                            available: !1,
                            map: null
                        };
                        return _0x2c19d0.fallbackReason = _0x3b7fcd.error || _0x5acf9a.CowoS, _0x2c19d0;
                    }
                } catch (_0x113d46) {
                    const _0x1c37fd = {
                        available: !1,
                        map: null
                    };
                    return _0x1c37fd.fallbackReason = _0x113d46.message || _0x5acf9a.xlclz, _0x1c37fd;
                }
            }
        }, _0x5a2fc7.ensureRepoMapSync = _0x3c83cf, _0x5a2fc7.getExportsFromRepoMap = _0xd85078, 
        _0x5a2fc7.findUndocumentedExports = _0x237c93, _0x5a2fc7.isInternalExport = _0x5a7e60, 
        _0x5a2fc7.isEntryPoint = _0x1f17a7, _0x5a2fc7.escapeRegex = _0x370aaa, _0x5a2fc7.getRepoMapLoadError = function() {
            if (_0x5acf9a.ccNjJ(_0x5acf9a.uwpya, _0x5acf9a.VFhkn)) {
                return _0x456bc2;
            }
            throw new _0x478be5(ICCKHo.ujtiN(ICCKHo.ujtiN(ICCKHo.TJliI(ICCKHo.TJliI(ICCKHo.tldRT(ICCKHo.JWcEc(ICCKHo.vXhAT(ICCKHo.vXhAT(ICCKHo.ujtiN(ICCKHo.TJliI(ICCKHo.vXhAT(ICCKHo.MpBfa, _0x2e8565), ICCKHo.kYwYj), _0x526e4c), ICCKHo.GnOda), _0x4ae181.message), ICCKHo.JWtdN), _0x39a5e0), ICCKHo.QzkGh), _0xea7624), ICCKHo.GzgNA), _0xa36930.basename(_0x9363e1)));
        }, _0x5e87bb.exports = _0x5a2fc7;
    }
}), require_git = __commonJS({
    "../work/agent-sh__agentsys/lib/collectors/git.js"(_0x2c4b55, _0x212c6b) {
        const _0x44e1cc_iGsUJ = function(_0x161e0e, _0x1c1f67) {
            return _0x161e0e / _0x1c1f67;
        }, _0x44e1cc_hiSsl = function(_0x50f8ba, _0x19b84e) {
            return _0x50f8ba > _0x19b84e;
        }, _0x44e1cc_owflX = function(_0x3a7611, _0xa830f6) {
            return _0x3a7611 * _0xa830f6;
        };
        var _0x328312 = require_binary(), _0x128537 = {
            top: 20,
            adjustForAi: !1,
            cwd: process.cwd()
        };
        const _0x3815c8 = {
            collectGitData: function(_0x320aed = {}) {
                const _0x4ddbfa = {
                    ..._0x128537,
                    ..._0x320aed
                }, _0x4382f8 = _0x4ddbfa.cwd || process.cwd();
                try {
                    _0x328312.ensureBinarySync();
                } catch (_0x53d8b6) {
                    const _0x345f49 = {
                        available: !1
                    };
                    return _0x345f49.error = "Binary not available: " + _0x53d8b6.message, _0x345f49;
                }
                let _0x17b5cc;
                try {
                    const _0x438d07 = _0x328312.runAnalyzer([ "repo-intel", "init", _0x4382f8 ]);
                    _0x17b5cc = JSON.parse(_0x438d07);
                } catch (_0x3fb7d2) {
                    {
                        const _0x35fa88 = {
                            available: !1
                        };
                        return _0x35fa88.error = "Git analysis failed: " + _0x3fb7d2.message, _0x35fa88;
                    }
                }
                const _0x24317b = _0x17b5cc.fileActivity || {}, _0x3a28e6 = _0x17b5cc.contributors || {}, _0x3ed2e7 = _0x17b5cc.aiAttribution || {}, _0xd7079e = _0x17b5cc.conventions || {}, _0x10069a = _0x17b5cc.releases || {}, _0x8b7dcc = Object.entries(_0x24317b).map((([_0xd9476c, _0x270c95]) => ({
                    path: _0xd9476c,
                    changes: _0x270c95.totalChanges || 0,
                    recentChanges: _0x270c95.recentChanges || 0,
                    authors: _0x270c95.authors ? Object.keys(_0x270c95.authors).length : 0,
                    lastChanged: _0x270c95.lastChanged || null
                }))).sort(((_0x41ed9a, _0x2766b0) => _0x2766b0.changes - _0x41ed9a.changes)).slice(0, _0x4ddbfa.top), _0x227da7 = _0x3a28e6.humans || {}, _0x16ad7a = Object.entries(_0x227da7).map((([_0x4865c6, _0x226db4]) => ({
                    name: _0x4865c6,
                    commits: _0x226db4.commitCount || 0,
                    firstSeen: _0x226db4.firstSeen || null,
                    lastSeen: _0x226db4.lastSeen || null
                }))).sort(((_0x758958, _0x322938) => _0x322938.commits - _0x758958.commits)), _0x4d160d = _0x16ad7a.reduce(((_0x4ac2d7, _0x1b18a2) => _0x4ac2d7 + _0x1b18a2.commits), 0);
                let _0xb31f6b = 0, _0x30667b = 0;
                for (const _0x5249e2 of _0x16ad7a) {
                    if (_0xb31f6b += _0x5249e2.commits, _0x30667b++, _0xb31f6b >= .8 * _0x4d160d) {
                        break;
                    }
                }
                const _0x3e1b11 = (_0x3ed2e7.attributed || 0) + (_0x3ed2e7.heuristic || 0), _0x468ed2 = _0x17b5cc.git?.totalCommitsAnalyzed || _0x4d160d, _0x288b3c = _0x468ed2 > 0 ? _0x44e1cc_iGsUJ(_0x3e1b11, _0x468ed2) : 0, _0x29ab23 = {};
                var _0x54caf3, _0xc8f045;
                return _0x29ab23.style = _0xd7079e.style || null, _0x29ab23.prefixes = _0xd7079e.prefixes || {}, 
                _0x29ab23.usesScopes = _0xd7079e.usesScopes || !1, {
                    available: !0,
                    health: {
                        active: _0x44e1cc_hiSsl(_0x16ad7a.length, 0),
                        busFactor: _0x30667b,
                        aiRatio: _0x44e1cc_iGsUJ(Math.round(_0x44e1cc_owflX(_0x288b3c, 100)), 100),
                        totalCommits: _0x468ed2,
                        totalContributors: _0x16ad7a.length
                    },
                    hotspots: _0x8b7dcc,
                    contributors: _0x16ad7a.slice(0, 10),
                    aiAttribution: {
                        ratio: (_0xc8f045 = Math.round(_0x44e1cc_owflX(_0x288b3c, 100)), _0xc8f045 / 100),
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
                        lastRelease: _0x10069a.tags && _0x44e1cc_hiSsl(_0x10069a.tags.length, 0) ? _0x10069a.tags[(_0x54caf3 = _0x10069a.tags.length, 
                        _0x54caf3 - 1)] : null,
                        cadence: _0x10069a.cadence || null
                    }
                };
            }
        };
        _0x3815c8.DEFAULT_OPTIONS = _0x128537, _0x212c6b.exports = _0x3815c8;
    }
}), require_analyzer_queries = __commonJS({
    "../work/agent-sh__agentsys/lib/collectors/analyzer-queries.js"(_0x5da6d0, _0x38c73e) {
        const _0x49f7f5_ttxHJ = function(_0x49be5b, _0x20d5ef) {
            return _0x49be5b === _0x20d5ef;
        }, _0x49f7f5_jqKgm = function(_0x26dc2, _0xf5e693, _0x11db15) {
            return _0x26dc2(_0xf5e693, _0x11db15);
        }, _0x49f7f5_nTBpV = function(_0x5e9cd7, _0x2e2a18) {
            return _0x5e9cd7(_0x2e2a18);
        }, _0x49f7f5_RlXyL = function(_0x5433b8, _0x3ec7c8) {
            return _0x5433b8 === _0x3ec7c8;
        }, _0x49f7f5_ZcySk = function(_0x40a265, _0x8a4fa9) {
            return _0x40a265(_0x8a4fa9);
        }, _0x49f7f5_BzpSc = function(_0x33fb1c, _0x382e31) {
            return _0x33fb1c !== _0x382e31;
        }, _0x49f7f5_gVpzH = function(_0x9989aa, _0x42fbe7) {
            return _0x9989aa(_0x42fbe7);
        }, _0x49f7f5_illpw = function(_0x548cad, _0x4fdc5f) {
            return _0x548cad === _0x4fdc5f;
        }, _0x49f7f5_LWbTf = function(_0x30815e, _0x2d5c48) {
            return _0x30815e === _0x2d5c48;
        }, _0x49f7f5_QiBbI = function(_0x1c32a0, _0x597fe3, _0x14bb99) {
            return _0x1c32a0(_0x597fe3, _0x14bb99);
        }, _0x49f7f5_SItks = function(_0x514d60, _0x22dd31) {
            return _0x514d60(_0x22dd31);
        };
        var _0x28ed3d = require("fs"), _0x37db40 = require("path"), _0x5afc50 = {
            cwd: process.cwd()
        }, _0x39b281 = [ /(^|\/)versioned_docs\//, /(^|\/)versioned_sidebars\//, /(^|\/)tests\/fixtures\//, /(^|\/)__fixtures__\//, /(^|\/)generated\//, /\.generated\.md$/, /(^|\/)CHANGELOG\.md$/i, /(^|\/)node_modules\//, /(^|\/)target\//, /(^|\/)dist\//, /(^|\/)build\// ];
        function _0x205f01(_0x599ced) {
            if (_0x49f7f5_ttxHJ("epAUs", "epAUs")) {
                for (const _0x362b5d of [ ".claude", ".opencode", ".codex" ]) {
                    if (_0x49f7f5_RlXyL("UxCDu", "UxCDu")) {
                        if (_0x28ed3d.existsSync(_0x37db40.join(_0x599ced, _0x362b5d))) {
                            return _0x362b5d;
                        }
                    } else if (pKwdti.ttxHJ(_0x3faa47.basename(_0x11c8bd[_0x5091f4]), _0x17b5c8)) {
                        return pKwdti.jqKgm(_0xdf7b38, _0x2cf800, _0x53eab1[_0x4f04f2]), _0x4330fe[_0x5b0401];
                    }
                }
                return ".claude";
            }
            {
                const _0x484880 = pKwdti.nTBpV(_0x49b30e, _0x55d979), _0x2557df = _0x4def54.assign({}, _0x484880, pKwdti.mhGxQ(_0x4986de, {})), _0x267bb2 = pKwdti.nTBpV(_0x2138b9, _0x2bb03d), _0x3fc8f5 = {
                    recursive: !0
                };
                return _0x35f7eb.mkdirSync(_0x3ff23e.dirname(_0x267bb2), _0x3fc8f5), _0x18f500.writeFileSync(_0x267bb2, _0x18ef61.stringify(_0x2557df, null, 2)), 
                _0x2557df;
            }
        }
        function _0x250cf7(_0x5a03e7) {
            if (_0x49f7f5_ttxHJ("VcuIt", "IzFUF")) {
                const _0x462f51 = _0x480c29.split(".").map(_0x488379), _0x2bc54d = _0xc6bab8.split(".").map(_0x2d046e);
                for (let _0x10d509 = 0; pKwdti.PlEJF(_0x10d509, 3); _0x10d509++) {
                    const _0x409909 = _0x462f51[_0x10d509] || 0, _0x922811 = _0x2bc54d[_0x10d509] || 0;
                    if (pKwdti.PlEJF(_0x409909, _0x922811)) {
                        return -1;
                    }
                    if (pKwdti.ZwcWD(_0x409909, _0x922811)) {
                        return 1;
                    }
                }
                return 0;
            }
            return _0x37db40.join(_0x5a03e7, _0x49f7f5_ZcySk(_0x205f01, _0x5a03e7), "repo-intel.json");
        }
        function _0x45c310(_0xf855bc, _0x43bb9b) {
            if (_0x49f7f5_BzpSc("KYPoK", "qctWi")) {
                try {
                    if (_0x49f7f5_illpw("DJFGO", "DJFGO")) {
                        const _0x105750 = _0xf855bc.runAnalyzer(_0x43bb9b);
                        return JSON.parse(_0x105750);
                    }
                    return _0x46afb0.parse(_0x1cd71b.readFileSync(_0x25f6da, pKwdti.hiSxd));
                } catch {
                    return _0x49f7f5_LWbTf("YOWCq", "aWTEL") ? {
                        success: !1,
                        error: pKwdti.JwITP(pKwdti.Widnv, _0x106e9b.error || pKwdti.UdCDr),
                        installSuggestion: _0x33403f.getInstallInstructions()
                    } : null;
                }
            } else {
                _0x2a9597.push(_0x5b9c7e);
            }
        }
        function _0x933fe9(_0xd13a75) {
            if (_0x49f7f5_illpw("dGHDf", "dGHDf")) {
                return (_0x5eea9f = _0xd13a75, _0x5eea9f || "").replace(/\\/g, "/");
            }
            var _0x5eea9f;
            _0xe35d74.push(_0x20cd23);
        }
        function _0x27d84c(_0x26b075) {
            return Array.isArray(_0x26b075) ? _0x26b075 : [];
        }
        const _0x5cecd4 = {};
        _0x5cecd4.DEFAULT_OPTIONS = _0x5afc50, _0x5cecd4.DEFAULT_DOC_DRIFT_IGNORE = _0x39b281, 
        _0x5cecd4.collect = function(_0x2f634b = {}) {
            const _0x3bb385 = {
                ..._0x5afc50,
                ..._0x2f634b
            }, _0x324e1f = _0x3bb385.cwd, _0x368617 = _0x250cf7(_0x324e1f), _0x43b277 = {
                available: !1,
                reason: null,
                queryErrors: []
            };
            _0x43b277.mapFile = _0x368617, _0x43b277.staleDocs = null, _0x43b277.staleDocsByKey = null, 
            _0x43b277.staleDocsByDoc = null, _0x43b277.docDrift = null, _0x43b277.docDriftAll = null, 
            _0x43b277.entryPoints = null, _0x43b277.entryPointSet = null, _0x43b277.entryPointSymbols = null, 
            _0x43b277.slopFixes = null, _0x43b277.orphanExports = null, _0x43b277.passthroughWrappers = null, 
            _0x43b277.alwaysTrueConditions = null, _0x43b277.commentedOutCode = null, _0x43b277.staleSuppressions = null;
            const _0x31890d = _0x43b277, _0x28b5e5 = function() {
                if (_0x49f7f5_BzpSc("lXevu", "lXevu")) {
                    return {
                        number: _0x4a4071.number,
                        title: _0x11798f.title,
                        labels: (_0x3cff72.labels || []).map((_0x40076e => _0x40076e.name || _0x40076e)),
                        isDraft: _0x10c125.isDraft,
                        createdAt: _0x32b7f3.createdAt,
                        updatedAt: _0x40c5aa.updatedAt,
                        files: _0x2661b7.files || [],
                        snippet: _0x50b617.body ? VMpocA.osEeP(_0x236245.body.slice(0, 150).replace(/\n/g, " ").trim(), VMpocA.DlNGG(_0x4ea895.body.length, 150) ? VMpocA.xAPCY : "") : ""
                    };
                }
                try {
                    {
                        const {binary: _0x474011} = _0x49f7f5_gVpzH(require, "../agentsys").get();
                        if (_0x474011) {
                            return _0x474011;
                        }
                    }
                } catch {}
                try {
                    if (_0x49f7f5_BzpSc("iTZcG", "iTZcG")) {
                        const _0x588602 = {
                            force: !0
                        };
                        return VMpocA.HcxgC(_0x5c0622, _0x5ad0bd, _0x588602);
                    }
                    return require_binary();
                } catch {
                    if (!_0x49f7f5_RlXyL("rwQUQ", "akBua")) {
                        return null;
                    }
                    {
                        const _0x437a12 = {};
                        _0x437a12.type = VMpocA.oPAfC, _0x437a12.severity = VMpocA.xeOLu, _0x437a12.reference = _0x5df3cb, 
                        _0x437a12.suggestion = "'" + _0x4ace0d + "' was removed or renamed", _0x437a12.detectionMethod = _0xa27654 ? VMpocA.CoLRu : VMpocA.fHtlO, 
                        _0x18da77.push(_0x437a12);
                    }
                }
            }();
            if (!_0x28b5e5) {
                if (_0x49f7f5_illpw("iTRxE", "XlzgD")) {
                    if (!_0x551407) {
                        return "";
                    }
                    const _0x52dab6 = _0x1c5989.dirname(_0x4b8fb7), _0x3360de = _0x328bb9.basename(_0x41bc23, _0x69f53d.extname(_0x1e8a74));
                    return _0x49b74c.join(_0x52dab6, pKwdti.OHxJm(_0x3360de, pKwdti.yOVBM));
                }
                {
                    const _0x1d7015 = {
                        ..._0x31890d
                    };
                    return _0x1d7015.reason = "analyzer-binary-unavailable", _0x1d7015;
                }
            }
            if (!_0x28ed3d.existsSync(_0x368617)) {
                const _0xa6bfbb = {
                    ..._0x31890d
                };
                return _0xa6bfbb.reason = "repo-intel-map-missing", _0xa6bfbb;
            }
            const _0x143b91 = _0x3bb385.staleDocsTop ?? 500, _0x5c1763 = _0x3bb385.docDriftTop ?? 50, _0x1b8b01 = [], _0x273873 = (_0x24f709, _0x2a7439) => {
                const _0x457aa4 = _0x49f7f5_jqKgm(_0x45c310, _0x28b5e5, _0x2a7439);
                if (_0x49f7f5_RlXyL(_0x457aa4, null)) {
                    if (_0x49f7f5_BzpSc("KpVBj", "KpVBj")) {
                        const _0x288366 = {
                            found: !1
                        };
                        return _0x288366.error = _0x408fe7.message, _0x288366.tool = EWFdrc.eGXmf, _0x288366;
                    }
                    _0x1b8b01.push(_0x24f709);
                }
                return _0x457aa4;
            }, _0x5826b5 = _0x49f7f5_ZcySk(_0x27d84c, _0x49f7f5_QiBbI(_0x273873, "stale-docs", [ "repo-intel", "query", "stale-docs", "--top", _0x49f7f5_gVpzH(String, _0x143b91), "--map-file", _0x368617, _0x324e1f ])), _0x4c9043 = _0x49f7f5_ZcySk(_0x27d84c, _0x49f7f5_QiBbI(_0x273873, "doc-drift", [ "repo-intel", "query", "doc-drift", "--top", (_0x116c73 = String, 
            _0x593dd0 = _0x5c1763, _0x116c73(_0x593dd0)), "--map-file", _0x368617, _0x324e1f ])), _0x1bd93d = _0x49f7f5_nTBpV(_0x27d84c, _0x49f7f5_jqKgm(_0x273873, "entry-points", [ "repo-intel", "query", "entry-points", "--map-file", _0x368617, _0x324e1f ])), _0x2a8007 = _0x273873("slop-fixes", [ "repo-intel", "query", "slop-fixes", "--map-file", _0x368617, _0x324e1f ]), _0x188c6d = Array.isArray(_0x2a8007) ? _0x2a8007 : _0x49f7f5_SItks(_0x27d84c, _0x2a8007?.fixes), _0x491a6c = new Map, _0x6f71fb = new Map;
            var _0x116c73, _0x593dd0;
            for (const _0x399101 of _0x5826b5) {
                const _0x4a9872 = _0x49f7f5_SItks(_0x933fe9, _0x399101.doc);
                _0x399101.doc = _0x4a9872;
                const _0x268dd6 = _0x4a9872 + ":" + _0x399101.line + ":" + _0x399101.reference;
                _0x491a6c.set(_0x268dd6, _0x399101), !_0x6f71fb.has(_0x4a9872) && (_0x49f7f5_BzpSc("qEwPM", "Ptdva") ? _0x6f71fb.set(_0x4a9872, []) : (Ncsudn.LMQZR(_0x52184f, _0x2e3e9c), 
                Ncsudn.GBhNw(_0x5ccd43, Ncsudn.LMQZR(_0x3ef9e3, _0x3ec41c), (new _0x4bb3ba).toISOString()))), 
                _0x6f71fb.get(_0x4a9872).push(_0x399101);
            }
            const _0xaeeef5 = new Set, _0x255b9f = new Set;
            for (const _0xe44053 of _0x1bd93d) {
                const _0xbf1fbf = _0x49f7f5_gVpzH(_0x933fe9, _0xe44053.path);
                _0xbf1fbf && _0xaeeef5.add(_0xbf1fbf), _0xe44053.name && _0xbf1fbf && _0x255b9f.add(_0xbf1fbf + ":" + _0xe44053.name);
            }
            const _0x5b0ffe = _0x3bb385.docDriftIgnore || _0x39b281, _0x457773 = _0x4c9043.filter((_0x14ade5 => {
                if (_0x49f7f5_ttxHJ("CCShH", "CCShH")) {
                    const _0x555936 = (_0x17df4f = _0x933fe9, _0x1843b7 = _0x14ade5.path, _0x49f7f5_nTBpV(_0x17df4f, _0x1843b7));
                    return !_0x5b0ffe.some((_0x25c746 => _0x25c746.test(_0x555936)));
                }
                var _0x17df4f, _0x1843b7;
                {
                    const _0x4c6317 = new _0x50c0fc("File too large: " + _0x100677.size + " > " + _0x56ae29 + " bytes");
                    throw _0x4c6317.code = Ncsudn.LtEjO, _0x4c6317;
                }
            })), _0x2d2139 = {
                "orphan-export": "orphanExports",
                "passthrough-wrapper": "passthroughWrappers",
                "always-true-condition": "alwaysTrueConditions",
                "commented-out-code": "commentedOutCode",
                "stale-suppression": "staleSuppressions"
            }, _0x1f131e = [], _0x3fdbd0 = [], _0x2cbb12 = [], _0x58f3fd = [], _0x3610a5 = [], _0x55bf8d = {};
            _0x55bf8d.orphanExports = _0x1f131e, _0x55bf8d.passthroughWrappers = _0x3fdbd0, 
            _0x55bf8d.alwaysTrueConditions = _0x2cbb12, _0x55bf8d.commentedOutCode = _0x58f3fd, 
            _0x55bf8d.staleSuppressions = _0x3610a5;
            const _0x2d36b2 = _0x55bf8d;
            for (const _0x3d817a of _0x188c6d) {
                if (!_0x49f7f5_LWbTf("gLbts", "gLbts")) {
                    return Ncsudn.IBWJQ(_0x5b05d7, _0x976815, Ncsudn.QUdkI), Ncsudn.POiyz(_0x1034b3, Ncsudn.ZOAQB, [ _0xefc29c ], _0xfd204);
                }
                {
                    const _0x2cb29b = _0x2d2139[_0x3d817a.category];
                    _0x2cb29b && _0x2d36b2[_0x2cb29b].push(_0x3d817a);
                }
            }
            const _0x3a110a = _0x1b8b01.length < 4, _0x598f39 = {};
            return _0x598f39.available = _0x3a110a, _0x598f39.reason = _0x3a110a ? null : "all-queries-failed", 
            _0x598f39.queryErrors = _0x1b8b01, _0x598f39.mapFile = _0x368617, _0x598f39.staleDocs = _0x5826b5, 
            _0x598f39.staleDocsByKey = _0x491a6c, _0x598f39.staleDocsByDoc = _0x6f71fb, _0x598f39.docDrift = _0x457773, 
            _0x598f39.docDriftAll = _0x4c9043, _0x598f39.entryPoints = _0x1bd93d, _0x598f39.entryPointSet = _0xaeeef5, 
            _0x598f39.entryPointSymbols = _0x255b9f, _0x598f39.slopFixes = _0x188c6d, _0x598f39.orphanExports = _0x1f131e, 
            _0x598f39.passthroughWrappers = _0x3fdbd0, _0x598f39.alwaysTrueConditions = _0x2cbb12, 
            _0x598f39.commentedOutCode = _0x58f3fd, _0x598f39.staleSuppressions = _0x3610a5, 
            _0x598f39;
        }, _0x5cecd4.isEntryPointSymbol = function(_0x5228f6, _0x1863fc, _0x365c3e) {
            if (!_0x5228f6?.entryPointSymbols) {
                return !1;
            }
            const _0x331e0c = _0x49f7f5_gVpzH(_0x933fe9, _0x1863fc);
            return _0x5228f6.entryPointSymbols.has(_0x331e0c + ":" + _0x365c3e) || _0x5228f6.entryPointSet.has(_0x331e0c);
        }, _0x5cecd4.resolveMapFile = _0x250cf7, _0x5cecd4.resolveStateDir = _0x205f01, 
        _0x38c73e.exports = _0x5cecd4;
    }
}), github = require_github(), documentation = require_documentation(), codebase = require_codebase(), docsPatterns = require_docs_patterns(), git = require_git(), analyzerQueries = require_analyzer_queries(), DEFAULT_OPTIONS = {
    collectors: [ "github", "docs", "code" ],
    depth: "thorough",
    cwd: process.cwd()
};

function collect(_0x2af305 = {}) {
    const _0x548b30 = {
        ...DEFAULT_OPTIONS,
        ..._0x2af305
    }, _0x1f82b1 = Array.isArray(_0x548b30.collectors) ? _0x548b30.collectors : DEFAULT_OPTIONS.collectors, _0x2cddfa = {
        timestamp: (new Date).toISOString(),
        options: _0x548b30,
        github: null,
        docs: null,
        code: null,
        docsPatterns: null,
        git: null,
        analyzer: null
    };
    return _0x1f82b1.includes("analyzer") && (_0x2cddfa.analyzer = analyzerQueries.collect(_0x548b30), 
    _0x548b30.analyzer = _0x2cddfa.analyzer), _0x1f82b1.includes("github") && (_0x2cddfa.github = github.scanGitHubState(_0x548b30)), 
    _0x1f82b1.includes("docs") && (_0x2cddfa.docs = documentation.analyzeDocumentation(_0x548b30)), 
    _0x1f82b1.includes("code") && (_0x2cddfa.code = codebase.scanCodebase(_0x548b30)), 
    _0x1f82b1.includes("docs-patterns") && (_0x2cddfa.docsPatterns = docsPatterns.collect(_0x548b30)), 
    _0x1f82b1.includes("git") && (_0x2cddfa.git = git.collectGitData(_0x548b30)), _0x2cddfa;
}

const _0x5aec83 = {};

_0x5aec83.collect = collect, _0x5aec83.collectAllData = function(_0x1cf5f7 = {}) {
    let _0x483797 = [ "github", "docs", "code" ];
    _0x1cf5f7.sources ? _0x483797 = _0x1cf5f7.sources : _0x1cf5f7.collectors && (_0x483797 = _0x1cf5f7.collectors);
    const _0x70e195 = {
        ..._0x1cf5f7
    };
    return _0x70e195.collectors = _0x483797, collect(_0x70e195);
}, _0x5aec83.github = github, _0x5aec83.documentation = documentation, _0x5aec83.codebase = codebase, 
_0x5aec83.docsPatterns = docsPatterns, _0x5aec83.git = git, _0x5aec83.analyzerQueries = analyzerQueries, 
_0x5aec83.scanGitHubState = github.scanGitHubState, _0x5aec83.isGhAvailable = github.isGhAvailable, 
_0x5aec83.analyzeDocumentation = documentation.analyzeDocumentation, _0x5aec83.scanCodebase = codebase.scanCodebase, 
_0x5aec83.findRelatedDocs = docsPatterns.findRelatedDocs, _0x5aec83.analyzeDocIssues = docsPatterns.analyzeDocIssues, 
_0x5aec83.checkChangelog = docsPatterns.checkChangelog, _0x5aec83.ensureRepoMap = docsPatterns.ensureRepoMap, 
_0x5aec83.ensureRepoMapSync = docsPatterns.ensureRepoMapSync, _0x5aec83.getExportsFromRepoMap = docsPatterns.getExportsFromRepoMap, 
_0x5aec83.findUndocumentedExports = docsPatterns.findUndocumentedExports, _0x5aec83.isInternalExport = docsPatterns.isInternalExport, 
_0x5aec83.isEntryPoint = docsPatterns.isEntryPoint, _0x5aec83.collectGitData = git.collectGitData, 
_0x5aec83.DEFAULT_OPTIONS = DEFAULT_OPTIONS, module.exports = _0x5aec83;
