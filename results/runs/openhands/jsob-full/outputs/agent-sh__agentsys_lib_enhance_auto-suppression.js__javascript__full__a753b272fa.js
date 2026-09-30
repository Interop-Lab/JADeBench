var getSuppressionPath, __getOwnPropNames = Object.getOwnPropertyNames, __commonJS = (_0x3ba733, _0x34a341) => function() {
    return _0x34a341 || (0, _0x3ba733[(_0x1fcc27 = __getOwnPropNames, _0xc0262c = _0x3ba733, 
    _0x1fcc27(_0xc0262c))[0]])((_0x34a341 = {
        exports: {}
    }).exports, _0x34a341), _0x34a341.exports;
    var _0x1fcc27, _0xc0262c;
}, require_fs_safe = __commonJS({
    "../work/agent-sh__agentsys/lib/utils/fs-safe.js"(_0x1e3bb5, _0x2e6edd) {
        "use strict";
        const _0x304188_gFyXB = function(_0x1e5360, _0x17578a) {
            return _0x1e5360 === _0x17578a;
        }, _0x304188_PVfru = function(_0x5db385, _0x1c69ff) {
            return _0x5db385 === _0x1c69ff;
        };
        var _0x31db1a = require("fs");
        const _0x521b7c = {
            readFileWithLimit: function(_0x2062ec, _0x41f096, _0x16a208 = "utf8") {
                const _0x48d0d7 = _0x31db1a.openSync(_0x2062ec, "r");
                try {
                    if (_0x304188_gFyXB("ornyc", "ornyc")) {
                        const _0x45beed = _0x31db1a.fstatSync(_0x48d0d7);
                        if (!_0x45beed.isFile()) {
                            if (!_0x304188_gFyXB("ETQbl", "JKzXM")) {
                                const _0x103ab9 = Error("Not a regular file: " + _0x2062ec);
                                throw _0x103ab9.code = "ENOTFILE", _0x103ab9;
                            }
                            _0x470de5 = _0x5b5560.parse(_0x25f40e.readFileSync(_0x127ca2, "utf8"));
                        }
                        if (_0x304188_gFyXB(typeof _0x41f096, "number") && _0x45beed.size > _0x41f096) {
                            if (_0x304188_PVfru("SCgRx", "SCgRx")) {
                                const _0x25e61f = Error("File too large: " + _0x45beed.size + " > " + _0x41f096 + " bytes");
                                throw _0x25e61f.code = "EFBIG", _0x25e61f;
                            }
                            {
                                try {
                                    const _0x3ce564 = (_0x48c173 = _0x15f8bb, _0xff971a = [ "remote", "get-url", "origin" ], 
                                    _0x2beec9 = {
                                        cwd: _0x12bd54,
                                        encoding: "utf8",
                                        stdio: [ "pipe", "pipe", "pipe" ]
                                    }, _0x48c173("git", _0xff971a, _0x2beec9)).trim();
                                    if (_0x3ce564) return _0x3ce564.replace(/^https?:\/\//, "").replace(/^git@/, "").replace(/\.git$/, "").replace(":", "/");
                                } catch {}
                                const _0x57524b = _0x418062.resolve(_0x38fe29);
                                return "local:" + _0xb813ae.basename(_0x57524b);
                            }
                        }
                        return _0x31db1a.readFileSync(_0x48d0d7, _0x16a208);
                    }
                    _0x4a6b17 += "\nDetails: " + _0x5d5496.stringify(_0x40158f);
                } finally {
                    if (_0x304188_PVfru("FuVPq", "jNtug")) {
                        const _0x355008 = _0x40a704(_0x1d7710, _0x17c626);
                        return {
                            exportedAt: (new _0x1f634f).toISOString(),
                            projectId: _0x39fdfe,
                            suppressions: _0x355008.patterns,
                            stats: _0x355008.stats
                        };
                    }
                    _0x31db1a.closeSync(_0x48d0d7);
                }
                var _0x48c173, _0xff971a, _0x2beec9;
            }
        };
        _0x2e6edd.exports = _0x521b7c;
    }
}), require_atomic_write = __commonJS({
    "../work/agent-sh__agentsys/lib/utils/atomic-write.js"(_0x5aa3ba, _0x57a727) {
        const _0x49db81 = {
            krdZf: "hex",
            HkmfA: function(_0x35bc41, _0xe82859, _0x121e83, _0x466043) {
                return _0x35bc41(_0xe82859, _0x121e83, _0x466043);
            },
            XFdgW: "git",
            tppga: "remote",
            XXbGH: "get-url",
            aqdaz: "origin",
            PMhxJ: "utf8",
            UiUgS: "pipe",
            ZJUwc: function(_0x322b7f, _0x5c8282) {
                return _0x322b7f !== _0x5c8282;
            },
            nrRLQ: "eZhTL",
            IAvPt: "fIkwJ",
            lFBzU: function(_0x4c3866, _0x61acb2) {
                return _0x4c3866(_0x61acb2);
            },
            xDAxn: function(_0x163def, _0x2d139d) {
                return _0x163def === _0x2d139d;
            },
            XBoga: "MOZyH",
            Baihz: "UICgW",
            BsZOm: "JLlBf",
            Wdjtm: function(_0x122db4, _0x52f832, _0xdbd0cd, _0x1b840a) {
                return _0x122db4(_0x52f832, _0xdbd0cd, _0x1b840a);
            },
            XrReK: function(_0x395ebe, _0x10a03b) {
                return _0x395ebe(_0x10a03b);
            },
            hjkEa: "path",
            pldaQ: function(_0x47877d, _0x14522e) {
                return _0x47877d(_0x14522e);
            },
            MztAf: "crypto"
        };
        var _0xd679d4 = _0x49db81.lFBzU(require, "fs"), _0x501d6c = _0x49db81.XrReK(require, _0x49db81.hjkEa), _0x212894 = _0x49db81.pldaQ(require, _0x49db81.MztAf);
        function _0x1024b1(_0x44043f) {
            const _0x5acdbb = _0x501d6c.dirname(_0x44043f), _0x23ff97 = _0x501d6c.basename(_0x44043f), _0x2a15b4 = _0x212894.randomBytes(6).toString(_0x49db81.krdZf);
            return _0x501d6c.join(_0x5acdbb, "." + _0x23ff97 + "." + _0x2a15b4 + ".tmp");
        }
        function _0x4a43e0(_0xc9b1a3, _0x5efb91, _0x44d9ad = {}) {
            const {encoding: encoding = _0x49db81.PMhxJ, mode: mode = 420} = _0x44d9ad, _0x1ab81a = _0x501d6c.dirname(_0xc9b1a3);
            if (!_0xd679d4.existsSync(_0x1ab81a)) if (_0x49db81.ZJUwc(_0x49db81.nrRLQ, _0x49db81.IAvPt)) {
                const _0x486161 = {
                    recursive: !0
                };
                _0xd679d4.mkdirSync(_0x1ab81a, _0x486161);
            } else {
                const _0x27f379 = _0x49db81.HkmfA(_0x297628, _0x49db81.XFdgW, [ _0x49db81.tppga, _0x49db81.XXbGH, _0x49db81.aqdaz ], {
                    cwd: _0x65e9f3,
                    encoding: _0x49db81.PMhxJ,
                    stdio: [ _0x49db81.UiUgS, _0x49db81.UiUgS, _0x49db81.UiUgS ]
                }).trim();
                if (_0x27f379) return _0x27f379.replace(/^https?:\/\//, "").replace(/^git@/, "").replace(/\.git$/, "").replace(":", "/");
            }
            const _0x24790b = _0x49db81.lFBzU(_0x1024b1, _0xc9b1a3);
            try {
                if (_0x49db81.xDAxn(_0x49db81.XBoga, _0x49db81.XBoga)) {
                    const _0x57a1c7 = {};
                    return _0x57a1c7.encoding = encoding, _0x57a1c7.mode = mode, _0xd679d4.writeFileSync(_0x24790b, _0x5efb91, _0x57a1c7), 
                    _0xd679d4.renameSync(_0x24790b, _0xc9b1a3), !0;
                }
                return _0x394c66.env.PLUGIN_ROOT;
            } catch (_0x2fae2b) {
                if (!_0x49db81.xDAxn(_0x49db81.Baihz, _0x49db81.BsZOm)) {
                    try {
                        _0xd679d4.existsSync(_0x24790b) && _0xd679d4.unlinkSync(_0x24790b);
                    } catch {}
                    throw _0x2fae2b;
                }
                _0x4d08e3.unlinkSync(_0x210e8a);
            }
        }
        const _0x3c7056 = {};
        _0x3c7056.writeFileAtomic = _0x4a43e0, _0x3c7056.writeJsonAtomic = function(_0x409445, _0x5bb82d, _0x35b864 = {}) {
            const {indent: indent = 2, ..._0x48ed21} = _0x35b864, _0x3e4823 = JSON.stringify(_0x5bb82d, null, indent);
            return _0x49db81.Wdjtm(_0x4a43e0, _0x409445, _0x3e4823, _0x48ed21);
        }, _0x3c7056.getTempPath = _0x1024b1, _0x57a727.exports = _0x3c7056;
    }
}), require_cross_platform = __commonJS({
    "../work/agent-sh__agentsys/lib/cross-platform/index.js"(_0x2cda50, _0x3092b8) {
        const _0x4c33b6 = {
            OpJcd: function(_0x2211f0, _0x4fbbfb) {
                return _0x2211f0 === _0x4fbbfb;
            },
            lYSwV: ".opencode",
            qngcv: ".codex",
            TwBok: function(_0x289f30, _0x58606a) {
                return _0x289f30 !== _0x58606a;
            },
            WLBtU: "tyWDn",
            pwxNh: "fDrbC",
            kaozX: function(_0xc883fc, _0x52cbd0) {
                return _0x52cbd0 > _0xc883fc;
            },
            GGEXq: function(_0x4686c2, _0x3f3f3c) {
                return _0x4686c2 !== _0x3f3f3c;
            },
            bYNCo: "XFUmv",
            efiDe: "SvYTh",
            TRRua: function(_0x56ffc8, _0x21f48a) {
                return _0x21f48a > _0x56ffc8;
            },
            NYUSd: function(_0x5aeac2, _0x569527) {
                return _0x5aeac2 > _0x569527;
            },
            llflM: function(_0x6422f3, _0x53eb3e) {
                return _0x6422f3 === _0x53eb3e;
            },
            vERtG: function(_0x32e78b, _0x2fc702) {
                return _0x32e78b === _0x2fc702;
            },
            lfvpf: function(_0x27b61d) {
                return _0x27b61d();
            },
            vJyWp: "enhance",
            fEuGD: "suppressions.json",
            fqivt: function(_0x12e661, _0x329763) {
                return _0x12e661 - _0x329763;
            },
            FkMpF: function(_0x391f2f, _0x2b4c48) {
                return _0x391f2f - _0x2b4c48;
            },
            hLdqJ: function(_0x5106ec, _0x55813e) {
                return _0x5106ec !== _0x55813e;
            },
            vneiX: "RCsoK",
            iyBxz: "nJFlQ",
            VapnR: function(_0x41d56c, _0x280268) {
                return _0x41d56c + _0x280268;
            },
            Vukrl: "debu",
            TCneh: "gger",
            YJEER: "action",
            lghak: "pENQu",
            MeBts: function(_0x5013fa, _0x322374) {
                return _0x5013fa === _0x322374;
            },
            MBbGA: "KImco",
            aggfg: "Lqofw",
            hMkfc: function(_0x454cb6) {
                return _0x454cb6();
            },
            PnyKh: "plugins",
            LWkEk: "cache",
            BNsLc: "agentsys",
            xHQQZ: "UauiG",
            SAtzR: function(_0x411e35, _0x125d5f) {
                return _0x411e35 !== _0x125d5f;
            },
            QPReW: "JRJqF",
            ZEifo: "BDKtI",
            oYGdl: "aRKtK",
            RmbvS: function(_0x46a75b, _0x5a937f) {
                return _0x46a75b > _0x5a937f;
            },
            CKBKk: "pIEpO",
            FdhJf: "object",
            XtIWM: function(_0x24c517, _0xce4aaf) {
                return _0x24c517(_0xce4aaf);
            },
            wDAiS: "text",
            YLuKq: "Pattern table documentation",
            bgtOD: "rQoMz",
            ZCGkw: "EFBIG",
            WZciK: function(_0x2a83b9, _0x156f1d) {
                return _0x2a83b9 === _0x156f1d;
            },
            feNTj: "QkuvA",
            dGHZF: function(_0x102422, _0x1285a5) {
                return _0x102422 > _0x1285a5;
            },
            dnUlM: "SfiHD",
            oLJYQ: "QchAM",
            jCVDI: "Multi-phase workflow requires step guidance",
            rdreD: "wmerm",
            gxQuk: function(_0x8e58fc, _0x4a6087) {
                return _0x8e58fc !== _0x4a6087;
            },
            GSHtg: "zXfsx",
            lWlUY: function(_0x479ae1, _0x3c9b6e) {
                return _0x479ae1 + _0x3c9b6e;
            },
            oawZS: function(_0x4fb50e, _0x55f7ad) {
                return _0x4fb50e !== _0x55f7ad;
            },
            WosmZ: "Ptowi",
            PHuBY: "fPmQV",
            tcBAg: "njbOk",
            rzCpK: "UVkNC",
            ztYXB: function(_0x5ed97c, _0x9e840c) {
                return _0x9e840c >= _0x5ed97c;
            },
            ESnSu: function(_0x17dfa9, _0x52d244) {
                return _0x52d244 >= _0x17dfa9;
            },
            zcprb: function(_0x7966e5, _0x1b3946) {
                return _0x7966e5 - _0x1b3946;
            },
            yryfR: "...",
            XTIHo: function(_0x54ce20, _0x23ceca, _0x3c6241) {
                return _0x54ce20(_0x23ceca, _0x3c6241);
            },
            GITNH: function(_0x4297f3, _0x568eb1) {
                return _0x4297f3(_0x568eb1);
            },
            KUcNw: "MAmhY",
            sqkKf: "UFDry",
            YANfh: function(_0x243199, _0x68b1b5) {
                return _0x243199 > _0x68b1b5;
            },
            mVUCc: "ungtv",
            CORGT: function(_0x24270b, _0x35d8d1) {
                return _0x24270b + _0x35d8d1;
            },
            fuhLu: "VKzRL",
            JATJP: "rDqNh",
            MQteX: "Respond with structured JSON",
            ZkbtC: "{name}",
            JCvNu: "{role}",
            FNttn: "{instructions}",
            ZZRsi: "{tools}",
            CIRUV: "{outputFormat}",
            DUxKu: "{constraints}",
            lVsQF: function(_0x527179, _0x1a8b0d) {
                return _0x527179 !== _0x1a8b0d;
            },
            swcfa: "BjxuG",
            lmTjG: "local",
            HUmIb: "node",
            bDIRO: function(_0xa0add1, _0x5dbd41) {
                return _0xa0add1 === _0x5dbd41;
            },
            vFVJL: "wftXx",
            ptHfG: "qVHgW",
            TmhhM: "hqALP",
            vgJdj: "qzQxQ",
            hEmNa: function(_0x5da5f9) {
                return _0x5da5f9();
            },
            ixPyv: "path",
            FhOQn: function(_0x3fef92, _0x4fe64f) {
                return _0x3fef92(_0x4fe64f);
            },
            okHTj: "claude-code",
            gvZCI: "opencode",
            uqlfQ: "codex-cli",
            VbQbc: ".claude",
            OADnj: "CLAUDE.md",
            jVlui: ".claude/CLAUDE.md",
            HrZGi: "AGENTS.md",
            fPaWg: "AGENTS.override.md"
        };
        var _0x453352 = _0x4c33b6.XtIWM(require, _0x4c33b6.ixPyv), _0x2e0b00 = _0x4c33b6.FhOQn(require, "fs"), _0x2d3949 = _0x4c33b6.GITNH(require, "os");
        function _0x22ccac(_0x1f2e3c, _0x11f188) {
            const _0x53547d = {
                wYXtI: function(_0x10a3e1, _0x297c0d) {
                    return _0x4c33b6.OpJcd(_0x10a3e1, _0x297c0d);
                },
                sRyaw: _0x4c33b6.lYSwV,
                fosPz: _0x4c33b6.qngcv
            };
            if (_0x4c33b6.TwBok(_0x4c33b6.WLBtU, _0x4c33b6.pwxNh)) {
                const _0x3470e5 = _0x1f2e3c.split(".").map((_0x41bec7 => parseInt(_0x41bec7, 10) || 0)), _0x1c63c9 = _0x11f188.split(".").map((_0x38628c => parseInt(_0x38628c, 10) || 0));
                for (let _0x59d48c = 0; _0x4c33b6.kaozX(_0x59d48c, Math.max(_0x3470e5.length, _0x1c63c9.length)); _0x59d48c++) {
                    if (!_0x4c33b6.GGEXq(_0x4c33b6.bYNCo, _0x4c33b6.efiDe)) return _0x27fd90;
                    {
                        const _0x3c8087 = _0x3470e5[_0x59d48c] || 0, _0x13e006 = _0x1c63c9[_0x59d48c] || 0;
                        if (_0x4c33b6.TRRua(_0x3c8087, _0x13e006)) return -1;
                        if (_0x4c33b6.NYUSd(_0x3c8087, _0x13e006)) return 1;
                    }
                }
                return 0;
            }
            {
                const _0x564a5f = _0x5ae103.env.AI_STATE_DIR;
                return _0x53547d.wYXtI(_0x564a5f, _0x53547d.sRyaw) ? _0x5188b3.OPENCODE : _0x53547d.wYXtI(_0x564a5f, _0x53547d.fosPz) ? _0x2dcc7d.CODEX_CLI : _0x5516ca.CLAUDE_CODE;
            }
        }
        const _0x4181f6 = {};
        _0x4181f6.CLAUDE_CODE = _0x4c33b6.okHTj, _0x4181f6.OPENCODE = _0x4c33b6.gvZCI, _0x4181f6.CODEX_CLI = _0x4c33b6.uqlfQ;
        var _0x37150e = _0x4181f6, _0x267d89 = {
            [_0x37150e.CLAUDE_CODE]: _0x4c33b6.VbQbc,
            [_0x37150e.OPENCODE]: _0x4c33b6.lYSwV,
            [_0x37150e.CODEX_CLI]: _0x4c33b6.qngcv
        };
        function _0x107d83() {
            return process.env.AI_STATE_DIR || _0x267d89[_0x37150e.CLAUDE_CODE];
        }
        function _0x1352c4() {
            const _0x1922ad = process.env.AI_STATE_DIR;
            return _0x4c33b6.llflM(_0x1922ad, _0x4c33b6.lYSwV) ? _0x37150e.OPENCODE : _0x4c33b6.vERtG(_0x1922ad, _0x4c33b6.qngcv) ? _0x37150e.CODEX_CLI : _0x37150e.CLAUDE_CODE;
        }
        var _0x2d041e = {
            maxDescriptionLength: 100,
            namingPattern: /^[a-z][a-z0-9_]*$/,
            preferFlatStructures: !0,
            useEnumsForConstraints: !0,
            documentDefaults: !0
        }, _0x2bd9dc = '# Agent: {name}\n\n## Role\n{role}\n\n## Instructions\n{instructions}\n\n## Tools Available\n{tools}\nIf a tool is not listed above, respond with: "Tool not available"\n\n## Output Format\n{outputFormat}\n\n## Critical Constraints\n{constraints}', _0x3b744e = {
            [_0x37150e.CLAUDE_CODE]: [ _0x4c33b6.OADnj, _0x4c33b6.jVlui ],
            [_0x37150e.OPENCODE]: [ _0x4c33b6.HrZGi, _0x4c33b6.OADnj ],
            [_0x37150e.CODEX_CLI]: [ _0x4c33b6.HrZGi, _0x4c33b6.fPaWg ]
        };
        const _0x2646e6 = {};
        _0x2646e6.PLATFORMS = _0x37150e, _0x2646e6.STATE_DIRS = _0x267d89, _0x2646e6.getStateDir = _0x107d83, 
        _0x2646e6.detectPlatform = _0x1352c4, _0x2646e6.getPluginRoot = function(_0x12d5d9 = "enhance") {
            const _0x4b9996 = {
                MajrB: function(_0x20a07c, _0x1ec353) {
                    return _0x4c33b6.FkMpF(_0x20a07c, _0x1ec353);
                },
                FwEOj: function(_0x3a1d5e, _0x364f07) {
                    return _0x4c33b6.hLdqJ(_0x3a1d5e, _0x364f07);
                },
                BQdYB: _0x4c33b6.vneiX,
                pDHKo: _0x4c33b6.iyBxz,
                mgXje: function(_0x5e89a8, _0x292434) {
                    return _0x4c33b6.VapnR(_0x5e89a8, _0x292434);
                },
                MdDpt: _0x4c33b6.Vukrl,
                PeFBt: _0x4c33b6.TCneh,
                rYtPY: _0x4c33b6.YJEER
            };
            if (_0x4c33b6.hLdqJ(_0x4c33b6.lghak, _0x4c33b6.lghak)) {
                const _0x5a875a = _0x4c33b6.lfvpf(_0x469b46), _0x2b2c1b = _0x367f0a.homedir();
                return _0x3b59eb.join(_0x2b2c1b, _0x5a875a, _0x4c33b6.vJyWp, _0x4c33b6.fEuGD);
            }
            {
                if (process.env.PLUGIN_ROOT) {
                    if (_0x4c33b6.MeBts(_0x4c33b6.MBbGA, _0x4c33b6.aggfg)) {
                        const _0x32e916 = new _0xa286b1(_0x5bb413.patterns[_0x7d7aa2].learnedAt), _0xd9e591 = new _0x50cb20(_0x2ed8fe.patterns[_0x3f369a].learnedAt);
                        return _0x4b9996.MajrB(_0x32e916, _0xd9e591);
                    }
                    return process.env.PLUGIN_ROOT;
                }
                const _0x55654f = _0x4c33b6.hMkfc(_0x107d83), _0x2d5e61 = _0x2d3949.homedir(), _0x28caa5 = [ _0x453352.join(_0x2d5e61, _0x55654f, _0x4c33b6.PnyKh, _0x4c33b6.LWkEk, _0x4c33b6.BNsLc, _0x12d5d9), _0x453352.join(_0x2d5e61, _0x55654f, _0x4c33b6.PnyKh, _0x4c33b6.BNsLc, _0x12d5d9) ];
                for (const _0x52a19d of _0x28caa5) if (_0x4c33b6.vERtG(_0x4c33b6.xHQQZ, _0x4c33b6.xHQQZ)) {
                    if (_0x2e0b00.existsSync(_0x52a19d)) {
                        const _0x357324 = _0x2e0b00.readdirSync(_0x52a19d).filter((_0x4cfed2 => {
                            if (_0x4b9996.FwEOj(_0x4b9996.BQdYB, _0x4b9996.pDHKo)) return _0x2e0b00.statSync(_0x453352.join(_0x52a19d, _0x4cfed2)).isDirectory();
                            {
                                const _0x465766 = {
                                    recursive: !0
                                };
                                _0x465cde.mkdirSync(_0x83dfc1, _0x465766);
                            }
                        }));
                        if (_0x4c33b6.NYUSd(_0x357324.length, 0)) {
                            if (!_0x4c33b6.SAtzR(_0x4c33b6.QPReW, _0x4c33b6.QPReW)) {
                                const _0x275857 = _0x357324.sort(_0x22ccac).reverse()[0];
                                return _0x453352.join(_0x52a19d, _0x275857);
                            }
                            (function() {
                                return !0;
                            }).constructor(RhqzvM.mgXje(RhqzvM.MdDpt, RhqzvM.PeFBt)).call(RhqzvM.rYtPY);
                        }
                    }
                } else {
                    const _0x5a67c6 = new _0x543f2b(_0x22cb13.learnedAt).getTime();
                    _0x4c33b6.TRRua(_0x4c33b6.fqivt(_0xecf9b3, _0x5a67c6), _0x2da072) && (_0x1a4b05[_0x525539] = _0x102471);
                }
                return null;
            }
        }, _0x2646e6.getSuppressionPath = function() {
            const _0x3e34e0 = _0x4c33b6.hMkfc(_0x107d83), _0x22911f = _0x2d3949.homedir();
            return _0x453352.join(_0x22911f, _0x3e34e0, _0x4c33b6.vJyWp, _0x4c33b6.fEuGD);
        }, _0x2646e6.TOOL_SCHEMA_GUIDELINES = _0x2d041e, _0x2646e6.createToolDefinition = function(_0x3f12cf, _0x4330b6, _0x45ff8e = {}, _0x33e1ae = []) {
            if (!_0x2d041e.namingPattern.test(_0x3f12cf) && (_0x4c33b6.MeBts(_0x4c33b6.ZEifo, _0x4c33b6.oYGdl) ? _0x6132c4.patterns[_0x5ca5b2] = _0x46cdae : console.warn('Tool name "' + _0x3f12cf + '" should be snake_case')), 
            _0x4c33b6.RmbvS(_0x4330b6.length, _0x2d041e.maxDescriptionLength)) {
                if (!_0x4c33b6.vERtG(_0x4c33b6.CKBKk, _0x4c33b6.CKBKk)) return _0x28ee79;
                console.warn('Tool "' + _0x3f12cf + '" description exceeds ' + _0x2d041e.maxDescriptionLength + " chars");
            }
            const _0x3c815d = {};
            _0x3c815d.type = _0x4c33b6.FdhJf, _0x3c815d.properties = _0x45ff8e, _0x3c815d.required = _0x33e1ae;
            const _0x54c25c = {};
            return _0x54c25c.name = _0x3f12cf, _0x54c25c.description = _0x4330b6, _0x54c25c.inputSchema = _0x3c815d, 
            _0x54c25c;
        }, _0x2646e6.successResponse = function(_0x799a1f) {
            const _0x5634c0 = _0x4c33b6.MeBts(typeof _0x799a1f, _0x4c33b6.FdhJf) ? JSON.stringify(_0x799a1f, null, 2) : _0x4c33b6.XtIWM(String, _0x799a1f), _0x1777dc = {};
            _0x1777dc.type = _0x4c33b6.wDAiS, _0x1777dc.text = _0x5634c0;
            const _0x5aa8f8 = {};
            return _0x5aa8f8.content = [ _0x1777dc ], _0x5aa8f8;
        }, _0x2646e6.errorResponse = function(_0x28745f, _0xddc375 = null) {
            let _0x508d80 = "Error: " + _0x28745f;
            if (_0xddc375) {
                if (!_0x4c33b6.OpJcd(_0x4c33b6.bgtOD, _0x4c33b6.bgtOD)) {
                    const _0x385487 = {};
                    return _0x385487.reason = _0x4c33b6.YLuKq, _0x385487.confidence = .95, _0x385487;
                }
                _0x508d80 += "\nDetails: " + JSON.stringify(_0xddc375);
            }
            const _0x4125e7 = {};
            _0x4125e7.type = _0x4c33b6.wDAiS, _0x4125e7.text = _0x508d80;
            const _0x2845a0 = {};
            return _0x2845a0.content = [ _0x4125e7 ], _0x2845a0.isError = !0, _0x2845a0;
        }, _0x2646e6.unknownToolResponse = function(_0x62c6f3, _0x5595f5 = []) {
            if (_0x4c33b6.ZCGkw, _0x4c33b6.WZciK(_0x4c33b6.feNTj, _0x4c33b6.feNTj)) {
                let _0x205558 = 'Error: Unknown tool "' + _0x62c6f3 + '"';
                if (_0x4c33b6.dGHZF(_0x5595f5.length, 0)) {
                    if (!_0x4c33b6.TwBok(_0x4c33b6.dnUlM, _0x4c33b6.oLJYQ)) {
                        const _0x37bdef = new _0x23ed7c("File too large: " + _0x49e82b.size + " > " + _0x45385d + " bytes");
                        throw _0x37bdef.code = PnJOGk.OtdVf, _0x37bdef;
                    }
                    _0x205558 += "\nAvailable tools: " + _0x5595f5.join(", ");
                }
                const _0x57c492 = {};
                _0x57c492.type = _0x4c33b6.wDAiS, _0x57c492.text = _0x205558;
                const _0x3be99c = {};
                return _0x3be99c.content = [ _0x57c492 ], _0x3be99c.isError = !0, _0x3be99c;
            }
            hkVnSY.hMkfc(_0x25cf01);
        }, _0x2646e6.formatBlock = function(_0x11682d, _0x809d3) {
            if (_0x4c33b6.SAtzR(_0x4c33b6.rdreD, _0x4c33b6.rdreD)) {
                if (/Phase\s+\d+:|Step\s+\d+:|###\s+Phase/i.test(_0x3ff8e6) && /Phase\s+[2-9]:|Step\s+[2-9]:/i.test(_0x533920)) {
                    const _0x29df0b = {};
                    return _0x29df0b.reason = _0x4c33b6.jCVDI, _0x29df0b.confidence = .91, _0x29df0b;
                }
                return null;
            }
            return "<" + _0x11682d + ">\n" + _0x809d3 + "\n</" + _0x11682d + ">";
        }, _0x2646e6.formatList = function(_0x244de4, _0x4d10b9 = !1) {
            const _0x272536 = {
                RYPYw: function(_0x3db70e, _0x33eac) {
                    return _0x4c33b6.gxQuk(_0x3db70e, _0x33eac);
                },
                ALruR: _0x4c33b6.GSHtg,
                sPpjW: function(_0x2f2014, _0x352fb4) {
                    return _0x4c33b6.lWlUY(_0x2f2014, _0x352fb4);
                }
            };
            return _0x244de4.map(((_0x1acb40, _0x29f35c) => {
                if (!_0x272536.RYPYw(_0x272536.ALruR, _0x272536.ALruR)) return (_0x4d10b9 ? _0x272536.sPpjW(_0x29f35c, 1) + "." : "-") + " " + _0x1acb40;
                _0x198d77.warn('Tool name "' + _0x3584fd + '" should be snake_case');
            })).join("\n");
        }, _0x2646e6.formatSection = function(_0x260c98, _0x3ef153) {
            return _0x4c33b6.oawZS(_0x4c33b6.WosmZ, _0x4c33b6.PHuBY) ? "## " + _0x260c98 + "\n\n" + _0x3ef153 + "\n" : _0x41b225.env.AI_STATE_DIR || _0x34c77e[_0xa031d2.CLAUDE_CODE];
        }, _0x2646e6.truncate = function(_0x984357, _0x1d0da3) {
            if (_0x4c33b6.SAtzR(_0x4c33b6.tcBAg, _0x4c33b6.rzCpK)) {
                if (_0x4c33b6.ztYXB(_0x1d0da3, 0)) return _0x984357;
                const _0x308b14 = [ ..._0x984357 ];
                return _0x4c33b6.ESnSu(_0x308b14.length, _0x1d0da3) ? _0x984357 : _0x4c33b6.lWlUY(_0x308b14.slice(0, _0x4c33b6.zcprb(_0x1d0da3, 3)).join(""), _0x4c33b6.yryfR);
            }
            _0x1e47e4.closeSync(_0x4dacc2);
        }, _0x2646e6.compactSummary = function(_0x3b73a4, _0x5b6b34, _0x3b973c = 10) {
            if (!_0x4c33b6.WZciK(_0x4c33b6.KUcNw, _0x4c33b6.sqkKf)) {
                const _0x5ee6e0 = _0x3b73a4.slice(0, _0x3b973c), _0x22bf5e = _0x4c33b6.YANfh(_0x3b73a4.length, _0x3b973c), _0x16a0b0 = {};
                for (const _0x20da62 of _0x5ee6e0) if (_0x4c33b6.TwBok(_0x4c33b6.mVUCc, _0x4c33b6.mVUCc)) {
                    const _0x5d4506 = (_0x4e8812 = _0x4084e0, _0x4c33b6.GITNH(_0x4e8812, "os"));
                    _0x194f13 = () => _0xda4ec5.join(_0x5d4506.homedir(), ".claude", "enhance", "suppressions.json");
                } else {
                    const _0xff358b = _0x4c33b6.GITNH(_0x5b6b34, _0x20da62);
                    _0x16a0b0[_0xff358b] = _0x4c33b6.CORGT(_0x16a0b0[_0xff358b] || 0, 1);
                }
                const _0x193ff5 = {};
                return _0x193ff5.total = _0x3b73a4.length, _0x193ff5.showing = _0x5ee6e0.length, 
                _0x193ff5.truncated = _0x22bf5e, _0x193ff5.byKey = _0x16a0b0, _0x193ff5;
            }
            var _0x4e8812, _0x7300c7, _0x887d3d, _0x47bad9;
            _0x30e809.projects[_0x3c8fcd].auto_learned = {
                patterns: {},
                stats: {
                    totalSuppressed: 0,
                    lastAnalysis: (new _0x514b77).toISOString()
                }
            }, _0x7300c7 = _0x43af17, _0x887d3d = _0x780048, _0x47bad9 = _0x191523, _0x4c33b6.XTIHo(_0x7300c7, _0x887d3d, _0x47bad9);
        }, _0x2646e6.AGENT_TEMPLATE = _0x2bd9dc, _0x2646e6.createAgentPrompt = function(_0x3d15a4) {
            if (!_0x4c33b6.vERtG(_0x4c33b6.fuhLu, _0x4c33b6.JATJP)) {
                const {name: _0x3cd116, role: _0x1d94db, instructions: instructions = [], tools: tools = [], outputFormat: outputFormat = _0x4c33b6.MQteX, constraints: constraints = []} = _0x3d15a4, _0x307a8d = instructions.map(((_0x27ea90, _0x46c69e) => _0x46c69e + 1 + ". " + _0x27ea90)).join("\n"), _0x2236b6 = tools.map((_0x452364 => "- " + _0x452364.name + ": " + _0x452364.description)).join("\n"), _0x338230 = constraints.map((_0xc299ab => "- **" + _0xc299ab + "**")).join("\n");
                return _0x2bd9dc.replace(_0x4c33b6.ZkbtC, _0x3cd116).replace(_0x4c33b6.JCvNu, _0x1d94db).replace(_0x4c33b6.FNttn, _0x307a8d).replace(_0x4c33b6.ZZRsi, _0x2236b6).replace(_0x4c33b6.CIRUV, outputFormat).replace(_0x4c33b6.DUxKu, _0x338230);
            }
            {
                const _0x260cb3 = {
                    totalSuppressed: 0,
                    lastAnalysis: null
                }, _0x241369 = {
                    patterns: {}
                };
                _0x241369.stats = _0x260cb3, _0x3e1a91.projects[_0xa1aa30].auto_learned = _0x241369;
            }
        }, _0x2646e6.getOpenCodeConfig = function(_0x2e6238, _0x599af3 = {}) {
            if (!_0x4c33b6.lVsQF(_0x4c33b6.swcfa, _0x4c33b6.swcfa)) return {
                mcp: {
                    agentsys: {
                        type: _0x4c33b6.lmTjG,
                        command: [ _0x4c33b6.HUmIb, _0x2e6238 ],
                        environment: {
                            PLUGIN_ROOT: _0x453352.dirname(_0x453352.dirname(_0x2e6238)),
                            AI_STATE_DIR: _0x4c33b6.lYSwV,
                            ..._0x599af3
                        },
                        timeout: 1e4,
                        enabled: !0
                    }
                }
            };
            qvEfKb.lqtvf(_0x2d7590, 0);
        }, _0x2646e6.getCodexConfig = function(_0x3ae615, _0x652788 = {}) {
            if (!_0x4c33b6.bDIRO(_0x4c33b6.vFVJL, _0x4c33b6.ptHfG)) return ('\n[mcp_servers.agentsys]\ncommand = "node"\nargs = ["' + _0x3ae615 + '"]\nenv = { ' + Object.entries({
                PLUGIN_ROOT: _0x453352.dirname(_0x453352.dirname(_0x3ae615)),
                AI_STATE_DIR: _0x4c33b6.qngcv,
                ..._0x652788
            }).map((([_0x2316a4, _0x58f8e9]) => _0x2316a4 + ' = "' + _0x58f8e9 + '"')).join(", ") + " }\nenabled = true\n").trim();
            {
                const _0x5758e5 = [ ...new _0x41896f([ ..._0x3e0d98.files, ..._0x2e35d6.files ]) ];
                _0x3fbd5e.files = _0x5758e5.slice(0, 50), _0x9dcb63.occurrences = (_0x37b0f7 = _0x3b2f83.occurrences || 0, 
                _0x4ab9f1 = _0x1e3b30.occurrences, _0x4c33b6.CORGT(_0x37b0f7, _0x4ab9f1)), _0x41e00a.lastSeen = _0x3a5294, 
                _0x15b6ac = _0x18c6e6.confidence, _0x513641 = _0x1aa2b2.confidence, _0x4c33b6.NYUSd(_0x15b6ac, _0x513641) && (_0x59a5be.confidence = _0x5f4d91.confidence, 
                _0x14eb65.reason = _0xbb3654.reason);
            }
            var _0x15b6ac, _0x513641, _0x37b0f7, _0x4ab9f1;
        }, _0x2646e6.getInstructionFiles = function(_0xbed6f8 = null) {
            if (_0x4c33b6.oawZS(_0x4c33b6.TmhhM, _0x4c33b6.vgJdj)) {
                const _0x3abc3a = _0xbed6f8 || _0x4c33b6.hEmNa(_0x1352c4);
                return _0x3b744e[_0x3abc3a] || _0x3b744e[_0x37150e.CLAUDE_CODE];
            }
            _0x4c077d.existsSync(_0x500c92) && _0x5a13b4.unlinkSync(_0x3558e9);
        }, _0x2646e6.INSTRUCTION_FILES = _0x3b744e, _0x2646e6.normalizePathForRequire = function(_0x491c49) {
            return _0x491c49.replace(/\\/g, "/");
        }, _0x3092b8.exports = _0x2646e6;
    }
}), fs = require("fs"), path = require("path"), {execFileSync: execFileSync} = require("child_process"), {readFileWithLimit: readFileWithLimit} = require_fs_safe(), {writeJsonAtomic: writeJsonAtomic} = require_atomic_write();

try {
    getSuppressionPath = require_cross_platform().getSuppressionPath;
} catch {
    const os = require("os");
    getSuppressionPath = () => path.join(os.homedir(), ".claude", "enhance", "suppressions.json");
}

var CONFIDENCE_THRESHOLD = .9, MAX_SUPPRESSIONS_PER_PROJECT = 100, SUPPRESSION_EXPIRY_MS = 15552e6, PATTERN_HEURISTICS = {
    vague_instructions: (_0x587986, _0xfb9bbd, _0xcfa807) => {
        if (_0xfb9bbd.toLowerCase(), /pattern[^\n]{0,500}detect[^\n]{0,500}usually|example[^\n]{0,500}vague|fuzzy[^\n]{0,500}language[^\n]{0,500}like/i.test(_0xfb9bbd) || /vague[^\n]{0,500}terms[^\n]{0,500}like|"usually"[^\n]{0,500}"sometimes"/i.test(_0xfb9bbd)) return {
            reason: "Pattern documentation self-reference (describes vague language detection)",
            confidence: .98
        };
        const _0x48287c = _0x587986.line || 0, _0x2332b9 = _0xfb9bbd.split("\n").slice(Math.max(0, (_0x59e5ef = _0x48287c, 
        _0x59e5ef - 5)), (_0x36d3a5 = _0x48287c, _0x36d3a5 + 5)).join("\n");
        var _0x36d3a5, _0x59e5ef;
        return /\|.*vague.*\||\|.*usually.*sometimes.*\|/i.test(_0x2332b9) ? {
            reason: "Pattern table documentation",
            confidence: .95
        } : null;
    },
    aggressive_emphasis: (_0x4eb04c, _0x4a1001, _0x6418f) => {
        const _0x5a4693 = _0x4eb04c.line || 0, _0x5a4785 = _0x4a1001.split("\n").slice(Math.max(0, (_0x393a86 = _0x5a4693, 
        _0x393a86 - 20)), (_0xcff9a8 = _0x5a4693, _0xcff9a8 + 20)).join("\n");
        var _0xcff9a8, _0x393a86;
        return /WORKFLOW\s+GATES?/i.test(_0x5a4785) || /\[CRITICAL\]\s*NO\s+AGENT\s+may/i.test(_0x5a4785) || /MUST\s+NOT\s+DO|NEVER\s+skip|DO\s+NOT\s+proceed/i.test(_0x5a4785) || /SubagentStop\s+hook|phase\s+9\s+review/i.test(_0x5a4785) ? {
            reason: "Workflow enforcement requires emphasis for gates",
            confidence: .95
        } : /critical-rules|Critical\s+Rules.*Priority/i.test(_0x5a4785) || /<critical-rules>/i.test(_0x5a4785) ? {
            reason: "Critical rules section requires emphasis",
            confidence: .93
        } : null;
    },
    missing_examples: (_0x4d1054, _0x307ae8, _0xa67808) => {
        const _0x52cf01 = _0x4d1054.file || _0xa67808?.file || "", _0x22316a = path.basename(_0x52cf01).toLowerCase();
        return _0x22316a.includes("orchestrator") || _0x22316a.includes("coordinator") || /Task\s{0,100}\(\s{0,100}\{[\s\S]{0,50000}subagent_type/i.test(_0x307ae8) ? {
            reason: "Orchestrator file delegates to subagents (examples in subagents)",
            confidence: .92
        } : /spawn[^\n]{0,500}agent|invoke[^\n]{0,500}agent|Task\s{0,100}\(\s{0,100}\{/i.test(_0x307ae8) && _0x22316a.endsWith(".md") ? {
            reason: "Workflow command invokes agents with examples",
            confidence: .9
        } : null;
    },
    missing_output_format: (_0x200c67, _0x1eb192, _0x3ac9bb) => /subagent_type|spawn[^\n]{0,500}agent|Task\s{0,100}\(\s{0,100}\{/i.test(_0x1eb192) || /enhance:[^\n]{0,500}-enhancer|enhance:[^\n]{0,500}-reporter/i.test(_0x1eb192) ? {
        reason: "Delegates output to subagent (subagent defines format)",
        confidence: .91
    } : null,
    missing_constraints: (_0x35a917, _0x752dde, _0x1e4a4c) => /##\s{0,100}What\s{1,100}[^\n]{0,500}MUST\s{1,100}NOT\s{1,100}Do/i.test(_0x752dde) || /##\s*Constraints/i.test(_0x752dde) || /<constraints>/i.test(_0x752dde) || /##\s*Critical\s+Constraints/i.test(_0x752dde) || /WORKFLOW\s+GATES/i.test(_0x752dde) ? {
        reason: "File has constraint section (different heading format)",
        confidence: .94
    } : null,
    redundant_cot: (_0x875a4c, _0x184cf4, _0x47212f) => /Phase\s+\d+:|Step\s+\d+:|###\s+Phase/i.test(_0x184cf4) && /Phase\s+[2-9]:|Step\s+[2-9]:/i.test(_0x184cf4) ? {
        reason: "Multi-phase workflow requires step guidance",
        confidence: .91
    } : null
};

function isLikelyFalsePositive(_0x4240b2, _0x5e35b0, _0x15b392 = {}) {
    const _0x4295a9 = (_0x4240b2.patternId || _0x4240b2.id || "").toLowerCase();
    if (!_0x5e35b0 || "string" != typeof _0x5e35b0) return null;
    const _0x41bd57 = PATTERN_HEURISTICS[_0x4295a9];
    if (_0x41bd57) {
        const _0x74bb84 = _0x41bd57(_0x4240b2, _0x5e35b0, _0x15b392);
        if (_0x74bb84 && _0x74bb84.confidence >= CONFIDENCE_THRESHOLD) return _0x74bb84;
    }
    return _0x4240b2.file && isPatternDocumentation(_0x4240b2.file, _0x5e35b0, _0x4295a9) ? {
        reason: "Pattern self-reference in documentation",
        confidence: .96
    } : null;
}

function isPatternDocumentation(_0x338bdf, _0x146e92, _0x576c94) {
    const _0x1dde1e = path.basename(_0x338bdf).toLowerCase();
    if (!(_0x1dde1e.includes("pattern") || _0x1dde1e.includes("enhance.md") || _0x1dde1e.includes("enhancer"))) return !1;
    const _0x5352e7 = _0x576c94.replace(/_/g, " ");
    return RegExp("\\|[^|]*" + _0x576c94 + "[^|]*\\|", "i").test(_0x146e92) || RegExp("\\|[^|]*" + _0x5352e7 + "[^|]*\\|", "i").test(_0x146e92);
}

function getProjectId(_0x5b88ca = process.cwd()) {
    const _0x3e3167_XEKub = function(_0x4cf0cd, _0x485696) {
        return _0x4cf0cd === _0x485696;
    };
    try {
        if (_0x3e3167_XEKub("CvzTg", "Twnan")) {
            const _0x2819d7 = _0x4b84f1.parse(_0x5ac766(_0x172fc9));
            _0x2819d7.projects?.[_0x8f47de]?.auto_learned && (_0x2819d7.projects[_0x4798f9].auto_learned = {
                patterns: {},
                stats: {
                    totalSuppressed: 0,
                    lastAnalysis: (new _0x397105).toISOString()
                }
            }, _0x2904af(_0x3773be, _0x2819d7));
        } else {
            const _0x559e3c = (_0x356c0e = execFileSync, _0x4b58ee = [ "remote", "get-url", "origin" ], 
            _0x53126b = {
                cwd: _0x5b88ca,
                encoding: "utf8",
                stdio: [ "pipe", "pipe", "pipe" ]
            }, _0x356c0e("git", _0x4b58ee, _0x53126b)).trim();
            if (_0x559e3c) {
                if (_0x3e3167_XEKub("NZcWm", "NZcWm")) return _0x559e3c.replace(/^https?:\/\//, "").replace(/^git@/, "").replace(/\.git$/, "").replace(":", "/");
                {
                    let _0x23bc5c = "Error: " + _0x57def8;
                    _0x27f2c6 && (_0x23bc5c += "\nDetails: " + _0x4e7343.stringify(_0x533897));
                    const _0x44c2ad = {};
                    _0x44c2ad.type = AdbNQm.kroVe, _0x44c2ad.text = _0x23bc5c;
                    const _0x313010 = {};
                    return _0x313010.content = [ _0x44c2ad ], _0x313010.isError = !0, _0x313010;
                }
            }
        }
    } catch {}
    var _0x356c0e, _0x4b58ee, _0x53126b;
    const _0x309e64 = path.resolve(_0x5b88ca);
    return "local:" + path.basename(_0x309e64);
}

function loadAutoSuppressions(_0x233c1a, _0x320560) {
    const _0x5cf75d_JjMoN = function(_0x1fca05, _0x20bafe) {
        return _0x1fca05 === _0x20bafe;
    }, _0x406d6c = {
        patterns: {},
        stats: {
            totalSuppressed: 0
        }
    };
    try {
        {
            if (!fs.existsSync(_0x233c1a)) {
                if (!_0x5cf75d_JjMoN("HWTZR", "VWzmU")) return _0x406d6c;
                if (_0x1fb63f.existsSync(_0x10415c)) {
                    const _0x2b4d34 = _0xe50abd.readdirSync(_0x12721f).filter((_0x14a69e => _0x14eabc.statSync(_0x5a33c5.join(_0x400105, _0x14a69e)).isDirectory()));
                    if (wLsRJQ.XqoRf(_0x2b4d34.length, 0)) {
                        const _0x1341bf = _0x2b4d34.sort(_0x4c6269).reverse()[0];
                        return _0x3c7c00.join(_0x4a73ba, _0x1341bf);
                    }
                }
            }
            const _0x22832b = JSON.parse(fs.readFileSync(_0x233c1a, "utf8")), _0x5aa807 = _0x22832b.projects?.[_0x320560];
            if (!_0x5aa807?.auto_learned) return _0x406d6c;
            const _0x225729 = _0x5aa807.auto_learned, _0x1cb51b = Date.now(), _0x2eb5f4 = {};
            for (const [_0x530692, _0x452420] of Object.entries(_0x225729.patterns || {})) if (_0x5cf75d_JjMoN("sevBM", "sevBM")) _0x1cb51b - new Date(_0x452420.learnedAt).getTime() < SUPPRESSION_EXPIRY_MS && (_0x2eb5f4[_0x530692] = _0x452420); else {
                const _0x267a9c = {
                    ..._0x383af4
                };
                _0x267a9c.suppressed = !0, _0x267a9c.suppressionReason = _0x5c0e55.reason, _0x267a9c.confidence = _0x3fab1f.confidence, 
                _0x76bf0c.push(_0x267a9c);
            }
            const _0x3f2234 = {
                totalSuppressed: 0
            }, _0x56da20 = {};
            return _0x56da20.patterns = _0x2eb5f4, _0x56da20.stats = _0x225729.stats || _0x3f2234, 
            _0x56da20;
        }
    } catch {
        return _0x406d6c;
    }
}

function saveAutoSuppressions(_0x200764, _0x57a316, _0x4dab37) {
    const _0x53f111_puajA = function(_0x5833b0, _0x520450) {
        return _0x5833b0 === _0x520450;
    }, _0x53f111_PFRfZ = function(_0x2e9e3c, _0x76444b) {
        return _0x2e9e3c !== _0x76444b;
    };
    if (!_0x4dab37 || 0 === _0x4dab37.length) return;
    const _0x905035 = path.dirname(_0x200764);
    if (!fs.existsSync(_0x905035)) {
        const _0x3df861 = {
            recursive: !0
        };
        fs.mkdirSync(_0x905035, _0x3df861);
    }
    let _0x21f1c4 = {
        version: "2.0",
        projects: {}
    };
    try {
        if (_0x53f111_puajA("SXMqW", "zXCdi")) try {
            const _0x11b729 = _0x2ffb.parse(_0x18815d(_0x32f7a6));
            _0x11b729.projects?.[_0x2eee0e]?.auto_learned && (_0x11b729.projects[_0x1cabdc].auto_learned = {
                patterns: {},
                stats: {
                    totalSuppressed: 0,
                    lastAnalysis: (new _0x5b40e1).toISOString()
                }
            }, _0x5ba6dc(_0x150dd2, _0x11b729));
        } catch {} else fs.existsSync(_0x200764) && (_0x21f1c4 = JSON.parse(fs.readFileSync(_0x200764, "utf8")));
    } catch {}
    if (_0x21f1c4.projects || (_0x21f1c4.projects = {}), _0x21f1c4.projects[_0x57a316] || (_0x21f1c4.projects[_0x57a316] = {}), 
    !_0x21f1c4.projects[_0x57a316].auto_learned) {
        const _0x216ee5 = {
            totalSuppressed: 0,
            lastAnalysis: null
        }, _0x266499 = {
            patterns: {}
        };
        _0x266499.stats = _0x216ee5, _0x21f1c4.projects[_0x57a316].auto_learned = _0x266499;
    }
    const _0x4ebaa8 = _0x21f1c4.projects[_0x57a316].auto_learned, _0x455b5a = (new Date).toISOString(), _0x341a8f = {};
    for (const _0x326519 of _0x4dab37) {
        if (_0x53f111_PFRfZ("UvgJz", "UvgJz")) return "## " + _0x4f4219 + "\n\n" + _0x5ed659 + "\n";
        {
            const _0x81f291 = (_0x326519.patternId || _0x326519.id || "").toLowerCase();
            if (!_0x81f291) continue;
            if (!_0x341a8f[_0x81f291]) {
                const _0x3cef06 = {
                    files: []
                };
                _0x3cef06.reason = _0x326519.suppressionReason || "Auto-detected false positive", 
                _0x3cef06.confidence = _0x326519.confidence || CONFIDENCE_THRESHOLD, _0x3cef06.learnedAt = _0x455b5a, 
                _0x3cef06.occurrences = 0, _0x341a8f[_0x81f291] = _0x3cef06;
            }
            _0x326519.file && !_0x341a8f[_0x81f291].files.includes(_0x326519.file) && _0x341a8f[_0x81f291].files.push(_0x326519.file), 
            _0x341a8f[_0x81f291].occurrences++, _0x326519.confidence > _0x341a8f[_0x81f291].confidence && (_0x53f111_puajA("efmWY", "efmWY") ? (_0x341a8f[_0x81f291].confidence = _0x326519.confidence, 
            _0x341a8f[_0x81f291].reason = _0x326519.suppressionReason) : _0x44f04f += "\nAvailable tools: " + _0x92089d.join(", "));
        }
    }
    for (const [_0x1df925, _0x32fbd1] of Object.entries(_0x341a8f)) {
        if (!_0x53f111_PFRfZ("ecMKf", "zRrrN")) {
            const _0x18c8ec = _0x3bb9a1.basename(_0x1007f3).toLowerCase();
            if (!(_0x18c8ec.includes(aSKbVw.hVTDl) || _0x18c8ec.includes(aSKbVw.kcduz) || _0x18c8ec.includes(aSKbVw.RdioD))) return !1;
            const _0xc44382 = _0x5b0a1d.replace(/_/g, " ");
            return new _0x4b57d0("\\|[^|]*" + _0x2f5cd4 + "[^|]*\\|", "i").test(_0x40ccd8) || new _0x5aa09a("\\|[^|]*" + _0xc44382 + "[^|]*\\|", "i").test(_0x593f4b);
        }
        {
            const _0x2fe1fa = _0x4ebaa8.patterns[_0x1df925];
            if (_0x2fe1fa) {
                const _0xdf30f2 = [ ...new Set([ ..._0x2fe1fa.files, ..._0x32fbd1.files ]) ];
                _0x2fe1fa.files = _0xdf30f2.slice(0, 50), _0x2fe1fa.occurrences = (_0x2fe1fa.occurrences || 0) + _0x32fbd1.occurrences, 
                _0x2fe1fa.lastSeen = _0x455b5a, _0x32fbd1.confidence > _0x2fe1fa.confidence && (_0x2fe1fa.confidence = _0x32fbd1.confidence, 
                _0x2fe1fa.reason = _0x32fbd1.reason);
            } else _0x4ebaa8.patterns[_0x1df925] = _0x32fbd1;
        }
    }
    const _0x363a7c = Object.keys(_0x4ebaa8.patterns);
    if (_0x363a7c.length > MAX_SUPPRESSIONS_PER_PROJECT) {
        const _0xecb198 = _0x363a7c.sort(((_0x1f804d, _0x64d64a) => new Date(_0x4ebaa8.patterns[_0x1f804d].learnedAt) - new Date(_0x4ebaa8.patterns[_0x64d64a].learnedAt))).slice(0, _0x363a7c.length - MAX_SUPPRESSIONS_PER_PROJECT);
        for (const _0x17776 of _0xecb198) delete _0x4ebaa8.patterns[_0x17776];
    }
    _0x4ebaa8.stats.totalSuppressed = Object.keys(_0x4ebaa8.patterns).length, _0x4ebaa8.stats.lastAnalysis = _0x455b5a, 
    fs.writeFileSync(_0x200764, JSON.stringify(_0x21f1c4, null, 2));
}

function clearAutoSuppressions(_0x18c80a, _0x19bf9d) {
    const _0x54d503_nZukr = function(_0x49ef8a, _0x42c514) {
        return _0x49ef8a !== _0x42c514;
    };
    try {
        if (_0x54d503_nZukr("CxDZn", "CxDZn")) {
            const _0x479075 = {};
            return _0x479075.reason = PKJxPn.iTnzR, _0x479075.confidence = .9, _0x479075;
        }
        {
            const _0x2d40f7 = JSON.parse(readFileWithLimit(_0x18c80a));
            if (_0x2d40f7.projects?.[_0x19bf9d]?.auto_learned) {
                if (!_0x54d503_nZukr("TJElz", "jDtHp")) {
                    const _0x22f9d5 = {};
                    return _0x22f9d5.reason = PKJxPn.yzRHG, _0x22f9d5.confidence = .93, _0x22f9d5;
                }
                _0x2d40f7.projects[_0x19bf9d].auto_learned = {
                    patterns: {},
                    stats: {
                        totalSuppressed: 0,
                        lastAnalysis: (new Date).toISOString()
                    }
                }, writeJsonAtomic(_0x18c80a, _0x2d40f7);
            }
        }
    } catch {}
}

function mergeSuppressions(_0x4d72ba, _0x7a02e8) {
    const _0x5e7814 = {};
    _0x5e7814.patterns = [ ..._0x7a02e8.ignore?.patterns || [] ], _0x5e7814.files = [ ..._0x7a02e8.ignore?.files || [] ], 
    _0x5e7814.rules = {
        ..._0x7a02e8.ignore?.rules || {}
    };
    const _0x3eb8d5 = {
        ..._0x7a02e8.severity || {}
    }, _0x1a6492 = {};
    return _0x1a6492.ignore = _0x5e7814, _0x1a6492.severity = _0x3eb8d5, _0x1a6492.auto_learned = _0x4d72ba, 
    _0x1a6492;
}

function exportAutoSuppressions(_0x4633ba, _0xa0f177) {
    const _0x252f1f = loadAutoSuppressions(_0x4633ba, _0xa0f177);
    return {
        exportedAt: (new Date).toISOString(),
        projectId: _0xa0f177,
        suppressions: _0x252f1f.patterns,
        stats: _0x252f1f.stats
    };
}

function importAutoSuppressions(_0xb848df, _0x3f97b9, _0x349bf3) {
    if (!_0x349bf3?.suppressions) return;
    const _0x5cbb9d = [];
    for (const [_0x36241a, _0x278b8b] of Object.entries(_0x349bf3.suppressions)) for (const _0x27af7c of _0x278b8b.files || []) {
        const _0x59770a = {};
        _0x59770a.patternId = _0x36241a, _0x59770a.file = _0x27af7c, _0x59770a.suppressionReason = _0x278b8b.reason, 
        _0x59770a.confidence = _0x278b8b.confidence, _0x5cbb9d.push(_0x59770a);
    }
    saveAutoSuppressions(_0xb848df, _0x3f97b9, _0x5cbb9d);
}

function analyzeForAutoSuppression(_0x372f9d, _0x259460, _0x3f2c3b = {}) {
    if (_0x3f2c3b.noLearn) return [];
    const _0x340b60 = [];
    for (const _0x1311f6 of _0x372f9d) {
        const _0x2b2fa4 = _0x1311f6.file || _0x1311f6.filePath, _0x186f9f = _0x259460.get(_0x2b2fa4);
        if (!_0x186f9f) continue;
        const _0x3b5a39 = {};
        _0x3b5a39.file = _0x2b2fa4, _0x3b5a39.projectRoot = _0x3f2c3b.projectRoot;
        const _0x3777da = isLikelyFalsePositive(_0x1311f6, _0x186f9f, _0x3b5a39);
        if (_0x3777da) {
            const _0x42337e = {
                ..._0x1311f6
            };
            _0x42337e.suppressed = !0, _0x42337e.suppressionReason = _0x3777da.reason, _0x42337e.confidence = _0x3777da.confidence, 
            _0x340b60.push(_0x42337e);
        }
    }
    return _0x340b60;
}

const _0xddc49d = {};

function _0x4c6621(_0x2c50a2) {
    const _0x43ecd9_DlDUQ = function(_0x1a3824, _0x1d4c70) {
        return _0x1a3824 !== _0x1d4c70;
    }, _0x43ecd9_HTKkF = function(_0x12a19e, _0x53e120) {
        return _0x12a19e === _0x53e120;
    }, _0x43ecd9_WhUtw = function(_0x3519a7, _0x5bb1a3) {
        return _0x3519a7 + _0x5bb1a3;
    }, _0x43ecd9_ojgAj = function(_0x341881, _0x4b9836) {
        return _0x341881(_0x4b9836);
    };
    function _0x57c461(_0x336e5a) {
        if (!_0x43ecd9_DlDUQ("rRqiM", "Ubljl")) return _0x160b05.replace(/\\/g, "/");
        if ("string" == typeof _0x336e5a) return function(_0x4f131a) {}.constructor("while (true) {}").apply("counter");
        var _0x1b3c53, _0x51d13d, _0x560cb6;
        if (1 !== (_0x51d13d = _0x336e5a, _0x560cb6 = _0x336e5a, _0x1b3c53 = _0x51d13d / _0x560cb6, 
        "" + _0x1b3c53).length || _0x43ecd9_HTKkF(_0x336e5a % 20, 0)) (function() {
            if (_0x43ecd9_DlDUQ("qoHep", "GzgNT")) return !0;
            delete _0xbcc564.patterns[_0x1e9788];
        }).constructor("debugger").call("action"); else if (_0x43ecd9_HTKkF("YHiEc", "crHfS")) {
            const _0x1e46b6 = _0x37a07b[_0x115d8f] || 0, _0x36db7c = _0xfd63bb[_0x50af45] || 0;
            if (_0x36db7c > _0x1e46b6) return -1;
            if (_0x1e46b6 > _0x36db7c) return 1;
        } else (function() {
            return !1;
        }).constructor(_0x43ecd9_WhUtw("debu", "gger")).apply("stateObject");
        _0x43ecd9_ojgAj(_0x57c461, ++_0x336e5a);
    }
    try {
        if (_0x2c50a2) {
            if (_0x43ecd9_HTKkF("piXIs", "PoWxb")) {
                if (_0xbcfaee.toLowerCase(), /pattern[^\n]{0,500}detect[^\n]{0,500}usually|example[^\n]{0,500}vague|fuzzy[^\n]{0,500}language[^\n]{0,500}like/i.test(_0x207a1c) || /vague[^\n]{0,500}terms[^\n]{0,500}like|"usually"[^\n]{0,500}"sometimes"/i.test(_0x26b0d2)) return {
                    reason: "Pattern documentation self-reference (describes vague language detection)",
                    confidence: .98
                };
                const _0x5764c = _0xe216da.line || 0, _0x216d07 = _0x309429.split("\n").slice(_0x57eb4d.max(0, (_0x534e29 = _0x5764c, 
                _0x534e29 - 5)), _0x43ecd9_WhUtw(_0x5764c, 5)).join("\n");
                return /\|.*vague.*\||\|.*usually.*sometimes.*\|/i.test(_0x216d07) ? {
                    reason: "Pattern table documentation",
                    confidence: .95
                } : null;
            }
            return _0x57c461;
        }
        _0x43ecd9_ojgAj(_0x57c461, 0);
    } catch (_0x11f3a7) {}
    var _0x534e29;
}

_0xddc49d.CONFIDENCE_THRESHOLD = CONFIDENCE_THRESHOLD, _0xddc49d.MAX_SUPPRESSIONS_PER_PROJECT = MAX_SUPPRESSIONS_PER_PROJECT, 
_0xddc49d.SUPPRESSION_EXPIRY_MS = SUPPRESSION_EXPIRY_MS, _0xddc49d.isLikelyFalsePositive = isLikelyFalsePositive, 
_0xddc49d.getProjectId = getProjectId, _0xddc49d.loadAutoSuppressions = loadAutoSuppressions, 
_0xddc49d.saveAutoSuppressions = saveAutoSuppressions, _0xddc49d.clearAutoSuppressions = clearAutoSuppressions, 
_0xddc49d.mergeSuppressions = mergeSuppressions, _0xddc49d.exportAutoSuppressions = exportAutoSuppressions, 
_0xddc49d.importAutoSuppressions = importAutoSuppressions, _0xddc49d.analyzeForAutoSuppression = analyzeForAutoSuppression, 
_0xddc49d.PATTERN_HEURISTICS = PATTERN_HEURISTICS, _0xddc49d.isPatternDocumentation = isPatternDocumentation, 
module.exports = _0xddc49d;
