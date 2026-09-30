var n = Object.getOwnPropertyNames, e = (e, t) => function() {
    return t || (0, e[(r = n, c = e, r(c))[0]])((t = {
        exports: {}
    }).exports, t), t.exports;
    var r, c;
}, t = e({
    "../work/pchuri__confluence-cli/lib/markdown-cleanup.js"(n, e) {
        const t = function(n, e) {
            return n === e;
        };
        function r(n) {
            const e = [], t = /^ {0,3}(`{3,})[^\n]*\n[\s\S]*?\n {0,3}\1[\t ]*$/gm;
            let r, c = 0;
            for (;null !== (r = t.exec(n)); ) e.push(n.slice(c, r.index)), e.push(r[0]), c = r.index + r[0].length;
            return e.push(n.slice(c)), e;
        }
        function c(n) {
            if (t("PWjOj", "PWjOj")) {
                let e = n;
                return e = e.replace(/[ \t]+$/gm, ""), e = e.replace(/^[ \t]+(?!([`>]|[*+-] |\d+[.)] ))/gm, ""), 
                e = e.replace(/^(#{1,6}[^\n]+)\n(?!\n)/gm, "$1\n\n"), e = e.replace(/\n\s*\n\s*\n+/g, "\n\n"), 
                e = e.replace(/[ \t]+/g, " "), e;
            }
            return !("text" === temporary1.type && temporary2.data.includes("\n") || t(temporary3.type, "tag") && !temporary5.has(temporary4.name)) && void 0;
        }
        const i = {
            fenceLength: function(n) {
                let e = 0;
                const t = n.match(/`+/g);
                if (t) for (const n of t) n.length > e && (e = n.length);
                return Math.max(3, e + 1);
            }
        };
        i.splitOnFences = r, i.cleanupOutsideFence = c, i.cleanupWithFences = function(n) {
            var e, t;
            return (e = r, t = n, e(t)).map(((n, e) => e % 2 == 1 ? n : c(n))).join("").trim();
        }, e.exports = i;
    }
}), r = e({
    "../work/pchuri__confluence-cli/lib/storage-walker.js"(n, e) {
        const r = {
            QhRvv: function(n, e) {
                return n === e;
            },
            IHBsS: function(n, e) {
                return n === e;
            },
            zcXaS: "TgvSR",
            qRjqT: "NzDnZ",
            iscmk: function(n, e) {
                return n === e;
            },
            UphzZ: function(n, e) {
                return n === e;
            },
            hrAIz: function(n, e, t) {
                return n(e, t);
            },
            gIqcq: "iEaMJ",
            ASllA: "tdeeY",
            wPoZK: "SzuKI",
            wyhnx: function(n, e) {
                return n !== e;
            },
            dYKFA: "NxygD",
            Haflj: "lIYDz",
            UPVpu: function(n, e) {
                return n(e);
            },
            SCsxH: function(n, ...e) {
                return n(...e);
            },
            KlCBw: function(n, e) {
                return n !== e;
            },
            EUmQW: "qXuMr",
            QGbyA: "jJIJI",
            YMEXu: "&amp;",
            goqye: "&lt;",
            sRtsU: "&gt;",
            SFBCo: "&quot;",
            nrbVY: function(n, e) {
                return n === e;
            },
            giOac: "KQiQQ",
            XbtLl: "StorageDepthExceededError",
            UFdQn: "3|2|0|4|1",
            rCeGU: function(n, ...e) {
                return n(...e);
            },
            IRJHK: "tag",
            NQDvr: "text",
            ZmePF: function(n, e) {
                return n !== e;
            },
            BpBSN: "kxokE",
            UAYjG: "eXDZD",
            WAGoQ: "implicit-close",
            QAeQj: function(n, e) {
                return n === e;
            },
            ayIDc: "gxfbG",
            IUSUX: "KXPAY",
            qOzgO: function(n, ...e) {
                return n(...e);
            },
            nmpue: function(n, e) {
                return n(e);
            },
            DmfbJ: "uDRjE",
            iYylr: "akmRM",
            SLqtD: "cdata",
            msKhO: "comment",
            KZGAQ: "directive",
            WDYjf: "script",
            ikeaM: "style",
            GLYrv: function(n, e) {
                return n === e;
            },
            qbzjN: function(n, e) {
                return n > e;
            },
            ZoTZl: "jGFlx",
            BlEpd: "xVuxt",
            uSOnD: function(n, e) {
                return n !== e;
            },
            ZkRgK: "sLVBT",
            CaSjn: "bqNnv",
            MJCxk: "number",
            vISpp: "ri:value",
            HTXpb: "ac:plain-text-link-body",
            cznON: function(n, e) {
                return n === e;
            },
            FPwhj: "uknOO",
            VyhrD: "gaMOz",
            YOmZt: function(n, e) {
                return n + e;
            },
            PjvdL: function(n, e) {
                return n + e;
            },
            Xwkld: function(n, e) {
                return n + e;
            },
            EQIRR: "strong",
            XbiSs: function(n, e) {
                return n + e;
            },
            dHAKM: function(n, e) {
                return n + e;
            },
            bYquH: "del",
            dkKTn: function(n, e) {
                return n + e;
            },
            vCVHe: function(n, e) {
                return n + e;
            },
            tiQYy: "code",
            iBVfw: function(n, e) {
                return n === e;
            },
            ahcqb: "PmWvH",
            SNCMs: "UaxSn",
            AtLfm: "gnCdJ",
            UatdJ: "jCgQS",
            JDUfb: "uJxmx",
            QeHSV: "\n---\n",
            bHMad: "nOwqu",
            cGZvr: function(n, e) {
                return n(e);
            },
            HQaXl: "ZLqRv",
            CUlCn: "yOITn",
            UdSzo: "time",
            ttOiH: "table",
            vUxgK: "thead",
            SULIU: "tbody",
            lzWda: "tfoot",
            BzGbh: "blockquote",
            JGNZH: "details",
            rZwhJ: "summary",
            HEJwb: "sub",
            PJpxc: "sup",
            dgsGo: "mark",
            pbylu: function(n, e) {
                return n + e;
            },
            CYxva: function(n, e) {
                return n + e;
            },
            PQKXx: "ac:structured-macro",
            XDJZP: "ac:image",
            WbIVZ: "ac:link",
            fDdNQ: "ac:task-list",
            MvOnd: "ac:layout",
            JFAOZ: "ac:layout-section",
            jSNOr: "ac:layout-cell",
            Cfsjg: "ac:rich-text-body",
            WZOwy: "ac:link-body",
            aXDMV: "ri:url",
            qAEBc: "ri:page",
            hMGTs: "ri:attachment",
            UuEJp: "ac:plain-text-body",
            UJDkw: "ac:parameter",
            KVvSU: "vwDQx",
            cDshO: "RTGUJ",
            BmxOw: function(n, e) {
                return n === e;
            },
            VDqdW: "qfsuq",
            UGMKE: function(n, e) {
                return n + e;
            },
            IJfpN: function(n, e) {
                return n + e;
            },
            ZdrMR: " | ",
            nKsII: function(n, e) {
                return n + e;
            },
            Vcwwx: function(n, e) {
                return n + e;
            },
            WFhlN: function(n, e, t) {
                return n(e, t);
            },
            WiOdn: function(n, e) {
                return n(e);
            },
            gevRW: function(n, e) {
                return n(e);
            },
            bgixH: function(n, e) {
                return n !== e;
            },
            roBkY: "GRAfb",
            FsQTb: "vlurV",
            LEKDn: "title",
            iprFT: "Expand Details",
            Ntgqv: "CKduK",
            IJsNQ: "gCaMT",
            BkkMU: "ac:name",
            dHPEW: "toc",
            RJNwU: "floatmenu",
            oHaxv: "expand",
            gIUJM: "info",
            HKnmh: "warning",
            DmBgv: "note",
            nwtOY: "anchor",
            HodGT: "panel",
            ZORnX: "mermaid-macro",
            rcKmv: "plantuml",
            ePvUP: "include",
            lDbwM: "shared-block",
            rSkrC: "include-shared-block",
            yskTj: "view-file",
            oPmzp: function(n, e) {
                return n - e;
            },
            HweMc: function(n, e) {
                return n === e;
            },
            XmalL: "MxtQc",
            mgAVY: "language",
            kWmRN: function(n, e) {
                return n - e;
            },
            WlsEO: "sZVmd",
            CXOiX: function(n, e) {
                return n !== e;
            },
            VgnqF: "BTVle",
            LsCJj: "RBTrQ",
            FkBnP: function(n, e) {
                return n && e;
            },
            PlNeg: function(n, e) {
                return n(e);
            },
            hTVnL: function(n, e) {
                return n === e;
            },
            McXdN: "nStKK",
            wFGKW: "Fzpbb",
            HGiec: function(n, e) {
                return n(e);
            },
            yZeWD: "4|2|3|0|1",
            jiWsz: "페이지에서",
            gXOXS: "상세 보기",
            TFjTu: "공유 블록",
            ZKveQ: "공유 블록 포함",
            RbAlG: "페이지 포함",
            nAZJR: function(n, e) {
                return n !== e;
            },
            iwOsi: "ddXad",
            TeNbu: "CcFwM",
            EMvzs: "crypto",
            Bunzm: function(n, e, t) {
                return n(e, t);
            },
            IxOiU: function(n, e) {
                return n(e);
            },
            mtCjw: "]]]]><![CDATA[>",
            ujHGQ: function(n) {
                return n();
            },
            livvB: function(n, e) {
                return n === e;
            },
            JiHND: "IhKfV",
            aFZrm: function(n, e) {
                return n(e);
            },
            awCvO: "ri:space-key",
            cgvRh: "ri:content-title",
            iJMih: "Include Page",
            UFrjl: "hkFJN",
            YUvBa: function(n, e) {
                return n(e);
            },
            BIQlk: function(n, e) {
                return n === e;
            },
            rRhkT: function(n, e) {
                return n(e);
            },
            cLgIJ: "Include Shared Block",
            JGvxd: "from page",
            taWCb: function(n, e) {
                return n > e;
            },
            ThJlt: "RkPeP",
            LZmfr: "shared-block-key",
            IBqEZ: "page",
            NNHgG: function(n, e) {
                return n === e;
            },
            FXoAt: function(n, e) {
                return n === e;
            },
            bQixf: "DddjR",
            IPLvn: function(n, e) {
                return n !== e;
            },
            hGCVZ: "Rwboq",
            mElsu: function(n, e) {
                return n === e;
            },
            pENYt: "WrRoe",
            bYlWo: function(n, e) {
                return n(e);
            },
            vrVlT: "Shared Block",
            VgCbY: "name",
            UMkLM: function(n, e) {
                return n(e);
            },
            SpVMT: "ri:filename",
            zHCRN: function(n, e) {
                return n(e);
            },
            YuFLP: function(n, e) {
                return n !== e;
            },
            dRTbq: function(n, e) {
                return n < e;
            },
            bKKps: function(n, e) {
                return n(e);
            },
            feSvp: function(n, e) {
                return n !== e;
            },
            gaqPw: "MhwMK",
            BuTAz: "gxdYb",
            PgHgJ: function(n, e) {
                return n !== e;
            },
            vuQZm: "BxRMl",
            HQvrS: function(n, e) {
                return n === e;
            },
            MbkOm: function(n, e) {
                return n === e;
            },
            dsUrE: function(n, e, t) {
                return n(e, t);
            },
            NqtPC: function(n, e) {
                return n === e;
            },
            dFZcn: function(n, e) {
                return n !== e;
            },
            JbScK: function(n, e) {
                return n !== e;
            },
            xmfzF: function(n, e) {
                return n === e;
            },
            YPEAb: function(n, e) {
                return n === e;
            },
            TQgLR: "EXPAND: ",
            tcbvo: "KlmrO",
            sppTS: "KENJC",
            SZvIX: "ac:anchor",
            YaKIP: "vYzPQ",
            iVOGB: "fgrep",
            WwjKC: function(n, e) {
                return n === e;
            },
            lNvLw: "ALKpC",
            ZVhiY: function(n, e) {
                return n(e);
            },
            cMKGZ: "WtLRw",
            YJVQq: "VyEZo",
            OVaaD: "ac:task-status",
            PZYmY: "ac:task-body",
            FtOoh: function(n, e) {
                return n === e;
            },
            mDhnI: "complete",
            ZBwts: "[x]",
            QSkib: "[ ]",
            utauA: function(n, e) {
                return n + e;
            },
            jdiVV: function(n, e) {
                return n + e;
            },
            qXFvK: function(n, e) {
                return n + e;
            },
            wcIdE: "VqFFb",
            TQoTB: "fFFSA",
            okTMG: function(n, e) {
                return n !== e;
            },
            Emxwp: "pcvrp",
            Lgecj: "THRnF",
            SBMKl: function(n, e) {
                return n === e;
            },
            dPbhz: function(n, e) {
                return n === e;
            },
            plygS: "lMuqd",
            Kxkaw: function(n, e) {
                return n === e;
            },
            cHxyn: function(n, e) {
                return n === e;
            },
            HGXZV: "HdtrR",
            DoYUl: "QFJtF",
            SsQEk: function(n, e) {
                return n === e;
            },
            CzvbJ: "qwwhN",
            uAekj: function(n, e) {
                return n(e);
            },
            plOJe: "MqyYL",
            AqNlZ: "LPsQq",
            loTnW: function(n, e) {
                return n > e;
            },
            ULpFp: function(n, e) {
                return n + e;
            },
            UeOmb: "UNyqQ",
            PMQOS: "RObzQ",
            yutRv: function(n, e) {
                return n(e);
            },
            iRYfp: function(n, e, t, r) {
                return n(e, t, r);
            },
            dtVlj: "\x3c!--\\s*(?:\\[\\[)?_TOC_(?:\\]\\])?\\s*--\x3e",
            UzcOM: "**TOC**",
            xObCc: function(n, e, t, r) {
                return n(e, t, r);
            },
            qqshk: "\x3c!--\\s*(?:\\[\\[)?_LISTING_(?:\\]\\])?\\s*--\x3e",
            uvbfT: "**LISTING**",
            bNhRZ: "\\[\\[_TOC_\\]\\]",
            nUdoW: "\\[\\[_LISTING_\\]\\]",
            JvCEW: "gIeaX",
            DUjIB: "lScGZ",
            PCRvP: "\\$1",
            wSrxY: function(n, e) {
                return n === e;
            },
            WXqUQ: function(n, e) {
                return n + e;
            },
            fKKjS: function(n, e) {
                return n !== e;
            },
            yqbJx: "UejOv",
            gtvrc: function(n, e) {
                return n(e);
            },
            Oqyjn: function(n, e) {
                return n > e;
            },
            CXaHq: function(n, e) {
                return n + e;
            },
            tPsWs: function(n, e) {
                return n(e);
            },
            amUmv: function(n, e) {
                return n === e;
            },
            Htaqr: "uDcye",
            KLifs: "iciIm",
            yWvkU: function(n, e) {
                return n === e;
            },
            iKIHm: function(n, e) {
                return n && e;
            },
            wPndY: "eqXDM",
            Mbjdf: function(n, e) {
                return n === e;
            },
            TjxnI: function(n, e) {
                return n + e;
            },
            EonBn: function(n, e) {
                return n === e;
            },
            qoMUQ: "OZajL",
            UXQzW: "nksgU",
            uvzpV: function(n, e) {
                return n === e;
            },
            pIpXp: function(n, e) {
                return n === e;
            },
            QyDha: "NOkCB",
            ZcToQ: "TFdtn",
            MdKvT: function(n, e) {
                return n(e);
            },
            DkaVn: "htmlparser2",
            oSdxY: function(n, e) {
                return n(e);
            },
            SrSJR: "entities",
            HSHog: "..."
        };
        var {Parser: c, DomHandler: i} = r.MdKvT(require, r.DkaVn), {decodeHTML: a} = r.oSdxY(require, r.SrSJR), {fenceLength: u, cleanupWithFences: s} = r.ujHGQ(t);
        const o = {
            nbsp: " ",
            ldquo: '"',
            rdquo: '"',
            lsquo: "'",
            rsquo: "'"
        };
        o.hellip = r.HSHog;
        var l = o;
        function d(n) {
            if (r.KlCBw(r.EUmQW, r.QGbyA)) return n ? n.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g, ((n, e) => {
                if (r.QhRvv(e[0], "#")) {
                    if (r.IHBsS(r.zcXaS, r.qRjqT)) return qtdrgd.aKlMb(temporary7, temporary8).map(((n, e) => e % 2 == 1 ? n : temporary6(n))).join("").trim();
                    {
                        const t = r.iscmk(e[1], "x") || r.UphzZ(e[1], "X") ? r.hrAIz(parseInt, e.slice(2), 16) : r.hrAIz(parseInt, e.slice(1), 10);
                        if (!Number.isFinite(t)) return n;
                        try {
                            if (!r.UphzZ(r.gIqcq, r.ASllA)) return String.fromCodePoint(t);
                            {
                                const n = {};
                                n.sIdx = temporary9.startIndex, n.eIdx = temporary10.endIndex, temporary11.push(n), function(n, ...e) {
                                    r.SCsxH(n, ...e);
                                }(temporary12, ...temporary13);
                            }
                        } catch (e) {
                            if (r.UphzZ(r.wPoZK, r.wPoZK)) return n;
                            {
                                const n = "(^|\\n)([^\\S\\n]*)" + temporary14 + "[^\\S\\n]*(?=\\n|$)";
                                return temporary17.replace(new temporary15(n, "gi"), ((n, e, t) => "" + e + t + temporary16));
                            }
                        }
                    }
                }
                if (Object.prototype.hasOwnProperty.call(l, e)) {
                    if (r.wyhnx(r.dYKFA, r.Haflj)) return l[e];
                    throw temporary18.depth--, new temporary20(temporary19.maxDepth);
                }
                return r.UPVpu(a, "&" + e + ";");
            })) : "";
            temporary21 = temporary22;
        }
        var f = class extends Error {
            constructor(n) {
                const e = {};
                e.bjxkp = r.YMEXu, e.BgBTs = r.goqye, e.qRLgD = r.sRtsU, e.XuuYw = r.SFBCo;
                const t = e;
                if (!r.nrbVY(r.giOac, r.giOac)) return temporary23.replace(/&/g, t.bjxkp).replace(/</g, t.BgBTs).replace(/>/g, t.qRLgD).replace(/"/g, t.XuuYw);
                super("Storage XML nesting exceeds limit of " + n + " levels"), this.name = r.XbtLl, 
                this.maxDepth = n;
            }
        };
        const h = {
            StorageWalker: class {
                constructor({attachmentsDir: n = "attachments", labels: e = {}, buildUrl: t = (n => n), webUrlPrefix: c = "", maxDepth: i = 256} = {}) {
                    const a = r.UFdQn.split("|");
                    let u = 0;
                    for (;;) {
                        switch (a[u++]) {
                          case "0":
                            this.buildUrl = t;
                            continue;

                          case "1":
                            this.maxDepth = i;
                            continue;

                          case "2":
                            this.labels = e;
                            continue;

                          case "3":
                            this.attachmentsDir = n;
                            continue;

                          case "4":
                            this.webUrlPrefix = c;
                            continue;
                        }
                        break;
                    }
                }
                walk(n) {
                    const e = {
                        HGmWV: function(n, ...e) {
                            return r.rCeGU(n, ...e);
                        },
                        PYyCb: function(n, e) {
                            return r.UPVpu(n, e);
                        },
                        YLaFB: function(n, e) {
                            return r.iscmk(n, e);
                        },
                        qfoHH: r.IRJHK,
                        DhgVJ: r.NQDvr,
                        SWYcf: function(n, e) {
                            return r.ZmePF(n, e);
                        },
                        SByaX: r.BpBSN,
                        sreQZ: function(n, e) {
                            return r.UphzZ(n, e);
                        },
                        bQeto: function(n, e) {
                            return r.nrbVY(n, e);
                        },
                        LioaK: function(n, e) {
                            return r.iscmk(n, e);
                        },
                        Mjkse: r.UAYjG,
                        CENzg: r.WAGoQ,
                        lqsuT: function(n, e) {
                            return r.QAeQj(n, e);
                        },
                        GmUsN: r.ayIDc,
                        IvsLV: r.IUSUX,
                        VNGwR: function(n, ...e) {
                            return r.qOzgO(n, ...e);
                        }
                    };
                    this._depth = 0, this._markdownLinkLabelDepth = 0, this._markdownCodeSpanDepth = 0, 
                    this.warnings = [];
                    const t = new i(null, {
                        xmlMode: !0
                    }), a = [], u = t.onopentag.bind(t), s = t.onclosetag.bind(t);
                    t.onopentag = (...n) => {
                        const t = {};
                        t.sIdx = o.startIndex, t.eIdx = o.endIndex, a.push(t), e.HGmWV(u, ...n);
                    }, t.onclosetag = (...n) => {
                        const t = {
                            NHren: function(n, t) {
                                return e.YLaFB(n, t);
                            },
                            kJIWb: e.qfoHH,
                            jhZQq: function(n, t) {
                                return e.YLaFB(n, t);
                            },
                            PmbJh: function(n, t) {
                                return e.YLaFB(n, t);
                            },
                            LTQsl: e.DhgVJ
                        };
                        if (e.SWYcf(e.SByaX, e.SByaX)) {
                            if (!temporary24) return;
                            t.NHren(temporary25.type, t.kJIWb) && t.jhZQq(temporary26.name, temporary27) && temporary29.push(temporary28), 
                            temporary30.children && temporary32.children.forEach(temporary31);
                        } else {
                            const [r, c] = n, i = a.pop();
                            if (c && !(i && e.sreQZ(i.sIdx, o.startIndex) && e.bQeto(i.eIdx, o.endIndex))) {
                                if (!e.LioaK(e.Mjkse, e.Mjkse)) return e.PYyCb(temporary33, this._collectText(temporary34));
                                {
                                    const n = o.endIndex, c = {};
                                    if (c.type = e.CENzg, c.tag = r, c.offset = n, this.warnings.push(c), process.env.CONFLUENCE_CLI_VERBOSE) {
                                        if (e.lqsuT(e.GmUsN, e.IvsLV)) return temporary35 ? t.PmbJh(temporary36.type, t.LTQsl) ? temporary37.data || "" : temporary38.children ? temporary39.children.map((n => this._collectText(n))).join("") : "" : "";
                                        process.stderr.write("StorageWalker: auto-closed <" + r + "> at offset " + n + "\n");
                                    }
                                }
                            }
                            e.VNGwR(s, ...n);
                        }
                    };
                    const o = new c(t, {
                        xmlMode: !0,
                        recognizeSelfClosing: !0,
                        decodeEntities: !0
                    });
                    return o.write(n), o.end(), this.cleanup(this.walkNodes(t.dom));
                }
                walkNodes(n) {
                    if (r.wyhnx(r.DmfbJ, r.iYylr)) return n ? n.map((n => this.walkNode(n))).join("") : "";
                    {
                        const n = {
                            exports: {}
                        };
                        return temporary40 || (0, temporary43[lggoxy.BpPRF(temporary44, temporary45)[0]])((temporary41 = n).exports, temporary42), 
                        temporary46.exports;
                    }
                }
                walkNode(n) {
                    if (!n) return "";
                    switch (n.type) {
                      case r.NQDvr:
                        return this.renderText(n.data || "");

                      case r.SLqtD:
                        return this.walkNodes(n.children);

                      case r.msKhO:
                      case r.KZGAQ:
                        return "";

                      case r.IRJHK:
                      case r.WDYjf:
                      case r.ikeaM:
                        return this.walkElement(n);

                      default:
                        return "";
                    }
                }
                walkElement(n) {
                    const e = {
                        BCwGw: function(n, e) {
                            return r.GLYrv(n, e);
                        },
                        BveqD: r.NQDvr,
                        Vanzb: r.SLqtD
                    };
                    if (r.qbzjN(++this._depth, this.maxDepth)) {
                        if (r.UphzZ(r.ZoTZl, r.BlEpd)) return temporary47;
                        throw this._depth--, new f(this.maxDepth);
                    }
                    try {
                        if (!r.uSOnD(r.ZkRgK, r.ZkRgK)) return this._dispatchElement(n);
                        e.BCwGw(temporary48.type, e.BveqD) ? temporary49 += temporary50.data || "" : e.BCwGw(temporary51.type, e.Vanzb) && (temporary52 += this._collectRawText(temporary53));
                    } finally {
                        if (r.KlCBw(r.CaSjn, r.CaSjn)) return "<" + temporary54.name + r.UPVpu(temporary55, temporary56.attribs) + " />";
                        this._depth--;
                    }
                }
                _dispatchElement(n) {
                    const e = {
                        rPdrG: function(n, e) {
                            return r.nmpue(n, e);
                        },
                        OCPpP: function(n, e) {
                            return r.IHBsS(n, e);
                        },
                        nZtkI: r.MJCxk,
                        oqJsR: function(n, e, t) {
                            return r.hrAIz(n, e, t);
                        },
                        wwJSi: r.vISpp,
                        gLNAZ: r.HTXpb
                    };
                    if (r.cznON(r.FPwhj, r.VyhrD)) {
                        const n = !!temporary57.isCloud, t = {};
                        t.isCloud = n, t.linkStyle = temporary58.linkStyle;
                        const r = {
                            linkStyle: e.rPdrG(temporary59, t),
                            depth: 0,
                            maxDepth: e.OCPpP(typeof temporary60.maxDepth, e.nZtkI) ? temporary61.maxDepth : temporary62
                        };
                        return e.oqJsR(temporary63, e.oqJsR(temporary64, temporary65, {
                            decodeEntities: !1
                        }), r);
                    }
                    {
                        const t = n.name;
                        switch (t) {
                          case "p":
                            return r.YOmZt(r.PjvdL("\n", this.walkNodes(n.children).trim()), "\n");

                          case "h1":
                          case "h2":
                          case "h3":
                          case "h4":
                          case "h5":
                          case "h6":
                            {
                                const e = r.hrAIz(parseInt, t.charAt(1), 10);
                                return r.Xwkld(r.YOmZt(r.PjvdL(r.Xwkld("\n", "#".repeat(e)), " "), this.walkNodes(n.children).trim()), "\n");
                            }

                          case r.EQIRR:
                          case "b":
                            return r.Xwkld(r.XbiSs("**", this.walkNodes(n.children)), "**");

                          case "em":
                          case "i":
                            return r.Xwkld(r.dHAKM("*", this.walkNodes(n.children)), "*");

                          case "s":
                          case r.bYquH:
                            return r.dkKTn(r.vCVHe("~~", this.walkNodes(n.children)), "~~");

                          case r.tiQYy:
                            if (r.iBVfw(r.ahcqb, r.SNCMs)) temporary66 = this.walkNodes(temporary67.children); else {
                                this._markdownCodeSpanDepth++;
                                try {
                                    if (r.iscmk(r.AtLfm, r.UatdJ)) {
                                        const n = e.rPdrG(temporary68, temporary69.attribs[e.wwJSi] || ""), t = this.findChildByName(temporary70, e.gLNAZ), r = t ? this.getRawText(t) : "";
                                        return r ? "[" + r + "](" + n + ")" : "";
                                    }
                                    return this.renderCodeSpan(this.walkNodes(n.children));
                                } finally {
                                    if (!r.cznON(r.JDUfb, r.JDUfb)) return this.walkNodes(temporary71.children).trim();
                                    this._markdownCodeSpanDepth--;
                                }
                            }

                          case "br":
                            return "\n";

                          case "hr":
                            return r.QeHSV;

                          case "a":
                            if (r.uSOnD(r.bHMad, r.bHMad)) return '<ac:structured-macro ac:name="anchor"><ac:parameter ac:name="">' + temporary72.id + "</ac:parameter></ac:structured-macro>";
                            {
                                const e = r.cGZvr(d, n.attribs && n.attribs.href || "");
                                if (!e) return this.walkNodes(n.children);
                                let t;
                                this._markdownLinkLabelDepth++;
                                try {
                                    r.IHBsS(r.HQaXl, r.CUlCn) ? r.IHBsS(temporary73.type, r.NQDvr) && (temporary74 += temporary75.data) : t = this.walkNodes(n.children);
                                } finally {
                                    this._markdownLinkLabelDepth--;
                                }
                                return "[" + t + "](" + e + ")";
                            }

                          case r.UdSzo:
                            return this.renderText(n.attribs && n.attribs.datetime || "") || this.walkNodes(n.children);

                          case "ul":
                            return this.handleList(n, !1);

                          case "ol":
                            return this.handleList(n, !0);

                          case "li":
                            return this.walkNodes(n.children);

                          case r.ttOiH:
                            return this.handleTable(n);

                          case r.vUxgK:
                          case r.SULIU:
                          case r.lzWda:
                          case "tr":
                          case "th":
                          case "td":
                            return this.walkNodes(n.children);

                          case r.BzGbh:
                            return this.handleBlockquote(n);

                          case r.JGNZH:
                          case r.rZwhJ:
                          case "u":
                          case r.HEJwb:
                          case r.PJpxc:
                          case r.dgsGo:
                            return r.pbylu(r.CYxva("<" + t + ">", this.walkNodes(n.children)), "</" + t + ">");

                          case r.PQKXx:
                            return this.handleMacro(n);

                          case r.XDJZP:
                            return this.handleImage(n);

                          case r.WbIVZ:
                            return this.handleAcLink(n);

                          case r.fDdNQ:
                            return this.handleTaskList(n);

                          case r.MvOnd:
                          case r.JFAOZ:
                          case r.jSNOr:
                          case r.Cfsjg:
                          case r.WZOwy:
                            return this.walkNodes(n.children);

                          case r.aXDMV:
                          case r.qAEBc:
                          case r.hMGTs:
                          case r.UuEJp:
                          case r.HTXpb:
                          case r.UJDkw:
                            return "";

                          default:
                            return this.walkNodes(n.children);
                        }
                    }
                }
                handleList(n, e) {
                    const t = (n.children || []).filter((n => "tag" === n.type && "li" === n.name));
                    let c = 1, i = "";
                    for (const n of t) {
                        if (!r.uSOnD(r.KVvSU, r.cDshO)) return this.htmlToConfluenceStorage(this._renderMarkdownToHtml(temporary76));
                        {
                            const t = this.walkNodes(n.children).replace(/\s+/g, " ").trim();
                            if (!t) continue;
                            i += (e ? c++ + "." : "-") + " " + t + "\n";
                        }
                    }
                    return i ? r.Xwkld("\n", i) : "";
                }
                handleTable(n) {
                    if (r.BmxOw(r.VDqdW, r.VDqdW)) {
                        const e = [], t = this.findAllDescendants(n, "tr");
                        let c = !0;
                        for (const n of t) {
                            const t = (n.children || []).filter((n => "tag" === n.type && ("th" === n.name || "td" === n.name)));
                            if (r.QAeQj(t.length, 0)) continue;
                            const i = t.map((n => this.walkNodes(n.children).replace(/\s+/g, " ").trim() || " "));
                            e.push(r.UGMKE(r.IJfpN("| ", i.join(r.ZdrMR)), " |")), c && (e.push(r.UGMKE(r.nKsII("| ", i.map((() => "---")).join(r.ZdrMR)), " |")), 
                            c = !1);
                        }
                        return r.qbzjN(e.length, 0) ? r.Vcwwx(r.CYxva("\n", e.join("\n")), "\n") : "";
                    }
                    temporary77[1] = temporary80.max(temporary78[1], temporary79[1]);
                }
                handleBlockquote(n) {
                    if (r.bgixH(r.roBkY, r.FsQTb)) {
                        const e = this.walkNodes(n.children).trim();
                        if (!e) return "";
                        const t = e.split("\n").map((n => 0 === n.length ? ">" : "> " + n)).join("\n");
                        return r.CYxva(r.UGMKE("\n", t), "\n");
                    }
                    {
                        const n = r.WFhlN(temporary81, temporary82, temporary83), e = "<" + temporary84.name + r.WiOdn(temporary85, temporary86.attribs) + ">";
                        return r.gevRW(temporary87, temporary88) ? e + "<p>" + n + "</p></" + temporary89.name + ">" : "" + e + n + "</" + temporary90.name + ">";
                    }
                }
                handleMacro(n) {
                    if (r.iscmk(r.Ntgqv, r.IJsNQ)) {
                        const n = this.findParamByName(temporary91, r.LEKDn), e = (n ? this.getTextContent(n) : "").trim(), t = this.getMacroBody(temporary92);
                        return e ? "\n**EXPAND: " + e + "**\n\n" + this.walkNodes(t).trim() + "\n\n**EXPAND_END**\n" : "\n<details>\n<summary>" + (this.labels.expandDetails || r.iprFT) + "</summary>\n\n" + this.walkNodes(t).trim() + "\n\n</details>\n";
                    }
                    {
                        const e = n.attribs && n.attribs[r.BkkMU];
                        switch (e) {
                          case r.dHPEW:
                          case r.RJNwU:
                            return "";

                          case r.oHaxv:
                            return this.handleExpand(n);

                          case r.tiQYy:
                            return this.handleCode(n);

                          case r.gIUJM:
                          case r.HKnmh:
                          case r.DmBgv:
                            return this.handleCallout(n, e);

                          case r.nwtOY:
                            return this.handleAnchor(n);

                          case r.HodGT:
                            return this.handlePanel(n);

                          case r.ZORnX:
                            return this.handleMermaid(n);

                          case r.rcKmv:
                            return this.handlePlantuml(n);

                          case r.ePvUP:
                            return this.handleInclude(n);

                          case r.lDbwM:
                          case r.rSkrC:
                            return this.handleSharedBlock(n, e);

                          case r.yskTj:
                            return this.handleViewFile(n);

                          default:
                            return "";
                        }
                    }
                }
                handleExpand(n) {
                    const e = this.findParamByName(n, r.LEKDn), t = (e ? this.getTextContent(e) : "").trim(), c = this.getMacroBody(n);
                    return t ? r.HweMc(r.XmalL, r.XmalL) ? "\n**EXPAND: " + t + "**\n\n" + this.walkNodes(c).trim() + "\n\n**EXPAND_END**\n" : (temporary94.push(temporary93), 
                    temporary95 + "H" + r.oPmzp(temporary96.length, 1) + temporary97) : "\n<details>\n<summary>" + (this.labels.expandDetails || r.iprFT) + "</summary>\n\n" + this.walkNodes(c).trim() + "\n\n</details>\n";
                }
                handleCode(n) {
                    const e = this.findParamByName(n, r.mgAVY), t = e ? this.getTextContent(e) : "", c = this.findChildByName(n, r.UuEJp), i = c ? this.getRawText(c) : "", a = "`".repeat(r.nmpue(u, i));
                    return "\n" + a + t + "\n" + i + "\n" + a + "\n";
                }
                handleCallout(n, e) {
                    const t = this.getMacroBody(n), c = this.walkNodes(t).trim(), i = c.split("\n").map((n => 0 === n.length ? ">" : "> " + n)).join("\n"), a = "> **" + e.toUpperCase() + "**";
                    return "\n" + (r.QhRvv(c.length, 0) ? a : a + "\n" + i) + "\n";
                }
                handleAnchor(n) {
                    if (r.QAeQj(r.WlsEO, r.WlsEO)) {
                        const e = this.findParamByName(n, ""), t = (e ? this.getTextContent(e) : "").trim();
                        return t ? "\n**ANCHOR: " + t + "**\n" : "";
                    }
                    return temporary99.push(temporary98), "" + temporary100 + r.kWmRN(temporary101.length, 1) + temporary102;
                }
                handlePanel(n) {
                    if (r.CXOiX(r.VgnqF, r.LsCJj)) {
                        const e = this.findParamByName(n, r.LEKDn), t = (e ? this.getTextContent(e) : "").trim(), c = this.getMacroBody(n), i = this.walkNodes(c).trim();
                        if (r.FkBnP(!t, !i)) return "";
                        const a = i.split("\n").map((n => n ? "> " + n : ">")).join("\n");
                        return t ? i ? "\n> **" + t + "**\n>\n" + a + "\n" : "\n> **" + t + "**\n" : "\n" + a + "\n";
                    }
                    temporary104.push(r.IJfpN(r.XbiSs("| ", temporary103.map((() => "---")).join(r.ZdrMR)), " |")), 
                    temporary105 = !1;
                }
                handleMermaid(n) {
                    if (!r.hTVnL(r.McXdN, r.wFGKW)) {
                        const e = this.findChildByName(n, r.UuEJp), t = e ? this.getRawText(e).trim() : "", c = "`".repeat(r.HGiec(u, t));
                        return "\n" + c + "mermaid\n" + t + "\n" + c + "\n";
                    }
                    temporary110.push([ r.nmpue(temporary106, temporary107.map[0]), r.PlNeg(temporary108, temporary109.map[1]) ]);
                }
                handlePlantuml(n) {
                    const e = {};
                    e.VzEBF = r.yZeWD, e.hPQUp = r.jiWsz, e.XsVbH = r.gXOXS, e.aQNkL = r.TFjTu, e.lcEEy = r.ZKveQ, 
                    e.vRYci = r.RbAlG;
                    const t = e;
                    if (r.nAZJR(r.iwOsi, r.TeNbu)) {
                        const e = this.findChildByName(n, r.UuEJp), t = e ? this.getRawText(e).trim() : "", c = "`".repeat(r.nmpue(u, t));
                        return "\n" + c + "plantuml\n" + t + "\n" + c + "\n";
                    }
                    {
                        const n = t.VzEBF.split("|");
                        let e = 0;
                        for (;;) {
                            switch (n[e++]) {
                              case "0":
                                temporary111.fromPage = t.hPQUp;
                                continue;

                              case "1":
                                temporary112.expandDetails = t.XsVbH;
                                continue;

                              case "2":
                                temporary113.sharedBlock = t.aQNkL;
                                continue;

                              case "3":
                                temporary114.includeSharedBlock = t.lcEEy;
                                continue;

                              case "4":
                                temporary115.includePage = t.vRYci;
                                continue;
                            }
                            break;
                        }
                    }
                }
                handleInclude(n) {
                    if (r.livvB(r.JiHND, r.JiHND)) {
                        const e = this.findParamByName(n, "");
                        if (!e) return "";
                        const t = this.findChildByName(e, r.WbIVZ);
                        if (!t) return "";
                        const c = this.findChildByName(t, r.qAEBc);
                        if (!c) return "";
                        const i = r.aFZrm(d, c.attribs[r.awCvO] || ""), a = r.PlNeg(d, c.attribs[r.cgvRh] || ""), u = this.escapeMarkdownText(a), s = this.labels.includePage || r.iJMih;
                        if (i.startsWith("~")) {
                            if (r.hTVnL(r.UFrjl, r.UFrjl)) {
                                const n = "display/" + i + "/" + r.YUvBa(encodeURIComponent, a);
                                return "\n> 📄 **" + s + "**: [" + u + "](" + this.buildUrl(this.webUrlPrefix + "/" + n) + ")\n";
                            }
                            temporary117.onWarnings(temporary116.warnings);
                        }
                        return "\n> 📄 **" + s + "**: [" + u + "](" + this.buildUrl(this.webUrlPrefix + "/spaces/" + i + "/pages/[PAGE_ID_HERE]") + ") _(manual link correction required)_\n";
                    }
                    {
                        const {randomUUID: n} = r.gevRW(temporary118, r.EMvzs), e = r.Bunzm(temporary119, temporary120, temporary121), t = r.IxOiU(temporary122, temporary123.attribs), c = "<" + temporary124.name + t + ">", i = "</" + temporary125.name + ">", a = r.CYxva(r.nKsII(c, e), i).replace(/]]>/g, r.mtCjw);
                        return '<ac:structured-macro ac:name="html" ac:schema-version="1" ac:macro-id="' + r.ujHGQ(n) + '"><ac:plain-text-body><![CDATA[' + a + "]]></ac:plain-text-body></ac:structured-macro>";
                    }
                }
                handleSharedBlock(n, e) {
                    if (r.bgixH(r.ThJlt, r.ThJlt)) {
                        const n = (t = temporary126, c = temporary127, r.nmpue(t, c));
                        return r.taWCb(this._markdownLinkLabelDepth, 0) && r.IHBsS(this._markdownCodeSpanDepth, 0) ? this.escapeMarkdownText(n) : n;
                    }
                    var t, c;
                    {
                        const t = this.findParamByName(n, r.LZmfr), c = (t ? this.getTextContent(t) : "").trim(), i = this.findParamByName(n, r.IBqEZ);
                        if (i && r.NNHgG(e, r.rSkrC)) if (r.FXoAt(r.bQixf, r.bQixf)) {
                            const n = this.findChildByName(i, r.WbIVZ);
                            if (n) if (r.IPLvn(r.hGCVZ, r.hGCVZ)) r.hTVnL(temporary128[temporary129], "<") ? temporary130 = !0 : r.BIQlk(temporary131[temporary132], ">") && (temporary133 = !1); else {
                                const e = this.findChildByName(n, r.qAEBc);
                                if (e) {
                                    if (r.mElsu(r.pENYt, r.pENYt)) {
                                        const n = this.escapeMarkdownText(r.bYlWo(d, e.attribs[r.cgvRh] || ""));
                                        return "\n> 📄 **" + (this.labels.includeSharedBlock || r.cLgIJ) + "**" + (c ? ": " + c + " " : " ") + "(" + (this.labels.fromPage || r.JGvxd) + ": " + n + " [link needs manual correction])\n";
                                    }
                                    {
                                        const n = temporary134.endIndex, e = {};
                                        e.type = CKKeSN.npHMx, e.tag = temporary135, e.offset = n, this.warnings.push(e), temporary136.env.CONFLUENCE_CLI_VERBOSE && temporary138.stderr.write("StorageWalker: auto-closed <" + temporary137 + "> at offset " + n + "\n");
                                    }
                                }
                            }
                        } else {
                            const n = this.findChildByName(temporary139, r.WbIVZ);
                            if (n) {
                                const e = this.findChildByName(n, r.qAEBc);
                                if (e) {
                                    const n = this.escapeMarkdownText(r.rRhkT(temporary140, e.attribs[r.cgvRh] || ""));
                                    return "\n> 📄 **" + (this.labels.includeSharedBlock || r.cLgIJ) + "**" + (temporary141 ? ": " + temporary142 + " " : " ") + "(" + (this.labels.fromPage || r.JGvxd) + ": " + n + " [link needs manual correction])\n";
                                }
                            }
                        }
                        const a = this.getMacroBody(n), u = this.walkNodes(a).trim(), s = this.labels.sharedBlock || r.vrVlT;
                        if (r.FkBnP(!c, !u)) return "";
                        const o = c ? "**" + s + ": " + c + "**" : "**" + s + "**";
                        return u ? "\n> " + o + "\n>\n" + u.split("\n").map((n => n ? "> " + n : ">")).join("\n") + "\n" : "\n> " + o + "\n";
                    }
                }
                handleViewFile(n) {
                    const e = this.findParamByName(n, r.VgCbY);
                    if (!e) return "";
                    const t = this.findChildByName(e, r.hMGTs);
                    if (!t) return "";
                    const c = r.UMkLM(d, t.attribs[r.SpVMT] || "");
                    return "\n📎 [" + c + "](" + this.attachmentsDir + "/" + c + ")\n";
                }
                handleImage(n) {
                    const e = {
                        TvOpt: function(n, e) {
                            return r.zHCRN(n, e);
                        },
                        DlZDz: function(n, e) {
                            return r.QAeQj(n, e);
                        },
                        TvAxM: function(n, e) {
                            return r.nAZJR(n, e);
                        },
                        fhMvv: r.IRJHK,
                        rFDFW: function(n, e) {
                            return r.YuFLP(n, e);
                        },
                        oiIMQ: function(n, e) {
                            return r.dRTbq(n, e);
                        },
                        jlyUr: function(n, e) {
                            return r.YuFLP(n, e);
                        },
                        ARviA: r.EQIRR,
                        csjfN: function(n, e) {
                            return r.bKKps(n, e);
                        },
                        nNeYl: function(n, e) {
                            return r.IPLvn(n, e);
                        },
                        LVoAF: function(n, e) {
                            return r.feSvp(n, e);
                        },
                        yFljt: r.NQDvr,
                        AfZur: function(n, e) {
                            return r.YOmZt(n, e);
                        },
                        eUpwu: function(n, e) {
                            return r.wyhnx(n, e);
                        },
                        gCzFY: r.WbIVZ,
                        ewCdm: r.qAEBc,
                        PxOsn: function(n, e) {
                            return r.cGZvr(n, e);
                        },
                        sXIXx: r.awCvO,
                        hTGGn: r.cgvRh,
                        Nhdci: r.iJMih
                    };
                    if (r.GLYrv(r.gaqPw, r.BuTAz)) {
                        const n = e.TvOpt(temporary143, temporary144);
                        if (e.DlZDz(n.length, 0)) return null;
                        const t = n[0];
                        if (e.TvAxM(t.type, e.fhMvv) || e.rFDFW(t.name, "p")) return null;
                        const r = t.children || [], c = r.findIndex((n => !temporary145(n)));
                        if (e.oiIMQ(c, 0)) return null;
                        const i = r[c];
                        if (e.rFDFW(i.type, e.fhMvv) || e.jlyUr(i.name, e.ARviA)) return null;
                        const a = e.csjfN(temporary146, i);
                        if (e.nNeYl(a.length, 1) || e.LVoAF(a[0].type, e.yFljt)) return null;
                        const u = temporary147.find((n => a[0].data === n.toUpperCase()));
                        if (!u) return null;
                        const s = r.slice(e.AfZur(c, 1)), o = s.some((n => !temporary148(n)));
                        if (o && (e.eUpwu(s[0].type, e.yFljt) || !/^\s*\n/.test(s[0].data))) return null;
                        const l = {};
                        return l.marker = u, l.sameLine = o, l.markerP = t, l.tail = s, l;
                    }
                    {
                        const e = this.findChildByName(n, r.hMGTs);
                        if (e) {
                            const n = this.renderText(e.attribs[r.SpVMT] || "");
                            return "![" + n + "](" + this.attachmentsDir + "/" + n + ")";
                        }
                        const t = this.findChildByName(n, r.aXDMV);
                        if (t) {
                            if (r.PgHgJ(r.vuQZm, r.vuQZm)) {
                                const n = this.findParamByName(temporary149, "");
                                if (!n) return "";
                                const e = this.findChildByName(n, NtHfzK.gCzFY);
                                if (!e) return "";
                                const t = this.findChildByName(e, NtHfzK.ewCdm);
                                if (!t) return "";
                                const r = NtHfzK.PxOsn(temporary150, t.attribs[NtHfzK.sXIXx] || ""), c = NtHfzK.PxOsn(temporary151, t.attribs[NtHfzK.hTGGn] || ""), i = this.escapeMarkdownText(c), a = this.labels.includePage || NtHfzK.Nhdci;
                                if (r.startsWith("~")) {
                                    const n = "display/" + r + "/" + NtHfzK.TvOpt(temporary152, c);
                                    return "\n> 📄 **" + a + "**: [" + i + "](" + this.buildUrl(this.webUrlPrefix + "/" + n) + ")\n";
                                }
                                return "\n> 📄 **" + a + "**: [" + i + "](" + this.buildUrl(this.webUrlPrefix + "/spaces/" + r + "/pages/[PAGE_ID_HERE]") + ") _(manual link correction required)_\n";
                            }
                            {
                                const n = this.renderText(t.attribs[r.vISpp] || "");
                                return n ? "![](" + n + ")" : "";
                            }
                        }
                        return "";
                    }
                }
                handleAcLink(n) {
                    if (!r.MbkOm(r.tcbvo, r.sppTS)) {
                        const e = n.attribs || {};
                        if (e[r.SZvIX]) {
                            if (r.YuFLP(r.YaKIP, r.YaKIP)) {
                                const n = temporary153.children || [];
                                if (!(r.HQvrS(n.length, 1) && r.MbkOm(n[0].type, r.IRJHK) && r.livvB(n[0].name, r.tiQYy))) return "<pre>" + r.dsUrE(temporary154, temporary155, temporary156) + "</pre>";
                                const e = n[0], t = (e.attribs.class || "").match(/language-(\w+)/), c = t ? t[1] : r.NQDvr;
                                let i = "";
                                for (const n of e.children || []) r.NqtPC(n.type, r.NQDvr) && (i += n.data);
                                const a = {
                                    preserveDouble: !0
                                };
                                return i = r.WFhlN(temporary157, i.replace(/\n$/, ""), a).replace(/]]>/g, r.mtCjw), 
                                c === r.rcKmv ? '<ac:structured-macro ac:name="plantuml"><ac:plain-text-body><![CDATA[' + i + "]]></ac:plain-text-body></ac:structured-macro>" : '<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">' + c + "</ac:parameter><ac:plain-text-body><![CDATA[" + i + "]]></ac:plain-text-body></ac:structured-macro>";
                            }
                            {
                                const t = this.findChildByName(n, r.HTXpb), c = t ? this.getRawText(t) : "";
                                return c ? "[" + c + "](#" + r.rRhkT(d, e[r.SZvIX]) + ")" : "";
                            }
                        }
                        const t = this.findChildByName(n, r.aXDMV);
                        if (t) {
                            const e = r.PlNeg(d, t.attribs[r.vISpp] || ""), c = this.findChildByName(n, r.HTXpb), i = c ? this.getRawText(c) : "";
                            return i ? "[" + i + "](" + e + ")" : "";
                        }
                        const c = this.findChildByName(n, r.WZOwy);
                        if (c) {
                            if (r.HweMc(r.iVOGB, r.iVOGB)) return this.walkNodes(c.children).trim();
                            {
                                const n = this.renderText(temporary158.attribs[r.SpVMT] || "");
                                return "![" + n + "](" + this.attachmentsDir + "/" + n + ")";
                            }
                        }
                        const i = this.findChildByName(n, r.qAEBc);
                        if (i) {
                            if (r.WwjKC(r.lNvLw, r.lNvLw)) return "[" + this.escapeMarkdownText(r.ZVhiY(d, i.attribs[r.cgvRh] || "")) + "]";
                            {
                                if (r.uSOnD(temporary159.type, r.IRJHK) || r.dFZcn(temporary160.name, "p")) return !1;
                                const n = r.gevRW(temporary161, temporary162);
                                if (r.JbScK(n.length, 1)) return !1;
                                const e = n[0];
                                if (r.KlCBw(e.type, r.IRJHK) || r.CXOiX(e.name, r.EQIRR)) return !1;
                                if (!e.children || r.xmfzF(e.children.length, 0)) return !1;
                                const t = e.children[0];
                                return r.YPEAb(t.type, r.NQDvr) && t.data.startsWith(r.TQgLR);
                            }
                        }
                        return "";
                    }
                    {
                        const n = temporary165.map((n => temporary164(n, temporary163))).join("").replace(/^\s*\n/, ""), e = temporary169.filter((n => n !== temporary168)).map((n => temporary167(n, temporary166))).join("");
                        temporary170 = "<p>" + n + "</p>" + e;
                    }
                }
                handleTaskList(n) {
                    function e(n, e) {
                        return m(n - 757 - -817, e);
                    }
                    if (!r.GLYrv(r.cMKGZ, r.YJVQq)) {
                        const e = (n.children || []).filter((n => "tag" === n.type && "ac:task" === n.name)), t = [];
                        for (const n of e) {
                            const e = this.findChildByName(n, r.OVaaD), c = this.findChildByName(n, r.PZYmY), i = e ? this.getTextContent(e) : "", a = c ? this.walkNodes(c.children).replace(/\s+/g, " ").trim() : "", u = r.FtOoh(i, r.mDhnI) ? r.ZBwts : r.QSkib;
                            a && t.push("- " + u + " " + a);
                        }
                        return r.qbzjN(t.length, 0) ? r.utauA(r.jdiVV("\n", t.join("\n")), "\n") : "";
                    }
                    {
                        const n = {
                            opaqueProperty1: "pYj8",
                            opaqueProperty2: 500,
                            opaqueProperty3: 1798,
                            opaqueProperty4: "kuXE"
                        }, t = {
                            KIOfx: function(n, e) {
                                return r.oPmzp(n, e);
                            }
                        }, c = [];
                        temporary171.src = temporary174.src.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`/g, (r => {
                            var i;
                            function a(n, t) {
                                return e(n - -1542, t);
                            }
                            return c[(i = n.opaqueProperty1, e(4467, i))](r), "" + temporary172 + t[a(n.opaqueProperty2, "ivcn")](c[a(n.opaqueProperty3, n.opaqueProperty4)], 1) + temporary173;
                        }));
                        for (const n of temporary175) {
                            const e = new temporary176("(^|\\n)\\[!" + n + "\\]\\s*([\\s\\S]*?)(?=\\n\\s*\\n|\\n\\s*\\[!|$)", "g");
                            temporary177.src = temporary178.src.replace(e, ((e, t, r) => t + "> **" + n.toUpperCase() + "**\n> " + r.trim().replace(/\n/g, "\n> ")));
                        }
                        const i = new temporary181(temporary179 + "(\\d+)" + temporary180, "g");
                        temporary182.src = temporary183.src.replace(i, ((n, e) => c[+e] ?? n));
                    }
                }
                findParamByName(n, e) {
                    if (!r.YPEAb(r.wcIdE, r.TQoTB)) {
                        if (!n || !n.children) return null;
                        for (const t of n.children) {
                            if (!r.okTMG(r.Emxwp, r.Lgecj)) {
                                const n = (temporary185.match(/`+/g) || []).reduce(((n, e) => temporary184.max(n, e.length)), 0), e = "`".repeat(r.qXFvK(n, 1)), t = temporary186.startsWith("`") || temporary187.endsWith("`") ? " " : "";
                                return "" + e + t + temporary188 + t + e;
                            }
                            if (r.SBMKl(t.type, r.IRJHK) && r.WwjKC(t.name, r.UJDkw) && r.BIQlk(t.attribs[r.BkkMU], e)) {
                                if (r.dPbhz(r.plygS, r.plygS)) return t;
                                {
                                    const n = new temporary190("(^|\\n)\\[!" + temporary189 + "\\]\\s*([\\s\\S]*?)(?=\\n\\s*\\n|\\n\\s*\\[!|$)", "g");
                                    temporary191.src = temporary193.src.replace(n, ((n, e, t) => e + "> **" + temporary192.toUpperCase() + "**\n> " + t.trim().replace(/\n/g, "\n> ")));
                                }
                            }
                        }
                        return null;
                    }
                    this._depth--;
                }
                findChildByName(n, e) {
                    if (!n || !n.children) return null;
                    for (const t of n.children) if (r.Kxkaw(t.type, r.IRJHK) && r.cHxyn(t.name, e)) return t;
                    return null;
                }
                findAllDescendants(n, e) {
                    const t = {
                        fZJzp: function(n, e) {
                            return r.YuFLP(n, e);
                        },
                        FQIXr: r.HGXZV,
                        PoloZ: r.DoYUl,
                        tAuoK: function(n, e) {
                            return r.MbkOm(n, e);
                        },
                        UfKIa: r.IRJHK,
                        ZQSJH: r.UuEJp,
                        jsvEa: function(n, e) {
                            return r.aFZrm(n, e);
                        }
                    };
                    if (r.SsQEk(r.CzvbJ, r.CzvbJ)) {
                        const r = [], c = n => {
                            if (!t.fZJzp(t.FQIXr, t.PoloZ)) return (temporary195.children || []).filter((n => !temporary194(n)));
                            n && (t.tAuoK(n.type, t.UfKIa) && t.tAuoK(n.name, e) && r.push(n), n.children && n.children.forEach(c));
                        };
                        return n.children && n.children.forEach(c), r;
                    }
                    {
                        const n = this.findChildByName(temporary196, qhLeio.ZQSJH), e = n ? this.getRawText(n).trim() : "", t = "`".repeat(qhLeio.jsvEa(temporary197, e));
                        return "\n" + t + "plantuml\n" + e + "\n" + t + "\n";
                    }
                }
                getMacroBody(n) {
                    if (r.UphzZ(r.plOJe, r.AqNlZ)) {
                        const n = LhtvWs.lwrCL(temporary198, temporary199.attribs && temporary200.attribs.href || "");
                        if (!n) return this.walkNodes(temporary201.children);
                        let e;
                        this._markdownLinkLabelDepth++;
                        try {
                            e = this.walkNodes(temporary202.children);
                        } finally {
                            this._markdownLinkLabelDepth--;
                        }
                        return "[" + e + "](" + n + ")";
                    }
                    {
                        const e = this.findChildByName(n, r.Cfsjg);
                        return e ? e.children : [];
                    }
                }
                getTextContent(n) {
                    if (r.SsQEk(r.UeOmb, r.PMQOS)) {
                        let n = 0;
                        const e = temporary203.match(/`+/g);
                        if (e) for (const t of e) HIeAlG.loTnW(t.length, n) && (n = t.length);
                        return temporary204.max(3, HIeAlG.ULpFp(n, 1));
                    }
                    return r.yutRv(d, this._collectText(n));
                }
                escapeMarkdownText(n) {
                    const e = {
                        gQUMu: function(n, e, t, c) {
                            return r.iRYfp(n, e, t, c);
                        },
                        uOiCm: r.dtVlj,
                        Cvtff: r.UzcOM,
                        yEvaT: function(n, e, t, c) {
                            return r.xObCc(n, e, t, c);
                        },
                        sWNSC: r.qqshk,
                        AVVGX: r.uvbfT,
                        rFOIM: r.bNhRZ,
                        VicVJ: r.nUdoW
                    };
                    if (r.IHBsS(r.JvCEW, r.DUjIB)) {
                        let n = e.gQUMu(temporary205, temporary206, e.uOiCm, e.Cvtff);
                        return n = e.yEvaT(temporary207, n, e.sWNSC, e.AVVGX), n = e.gQUMu(temporary208, n, e.rFOIM, e.Cvtff), 
                        e.yEvaT(temporary209, n, e.VicVJ, e.AVVGX);
                    }
                    return n ? n.replace(/([\\`*_[\]()~|<>])/g, r.PCRvP) : "";
                }
                renderText(n) {
                    if (!r.fKKjS(r.yqbJx, r.yqbJx)) {
                        const e = r.gtvrc(d, n);
                        return r.Oqyjn(this._markdownLinkLabelDepth, 0) && r.QAeQj(this._markdownCodeSpanDepth, 0) ? this.escapeMarkdownText(e) : e;
                    }
                    r.wSrxY(temporary210[temporary211], "\n") && temporary213.push(r.WXqUQ(temporary212, 1));
                }
                renderCodeSpan(n) {
                    const e = (n.match(/`+/g) || []).reduce(((n, e) => Math.max(n, e.length)), 0), t = "`".repeat(r.CXaHq(e, 1)), c = n.startsWith("`") || n.endsWith("`") ? " " : "";
                    return "" + t + c + n + c + t;
                }
                _collectText(n) {
                    if (r.amUmv(r.Htaqr, r.KLifs)) {
                        const n = this.findParamByName(temporary214, r.VgCbY);
                        if (!n) return "";
                        const e = this.findChildByName(n, r.hMGTs);
                        if (!e) return "";
                        const t = r.tPsWs(temporary215, e.attribs[r.SpVMT] || "");
                        return "\n📎 [" + t + "](" + this.attachmentsDir + "/" + t + ")\n";
                    }
                    return n ? r.yWvkU(n.type, r.NQDvr) ? n.data || "" : n.children ? n.children.map((n => this._collectText(n))).join("") : "" : "";
                }
                getRawText(n) {
                    if (r.uSOnD(r.wPndY, r.wPndY)) {
                        const n = this.findParamByName(temporary216, r.LEKDn), e = (n ? this.getTextContent(n) : "").trim(), t = this.getMacroBody(temporary217), c = this.walkNodes(t).trim();
                        if (r.iKIHm(!e, !c)) return "";
                        const i = c.split("\n").map((n => n ? "> " + n : ">")).join("\n");
                        return e ? c ? "\n> **" + e + "**\n>\n" + i + "\n" : "\n> **" + e + "**\n" : "\n" + i + "\n";
                    }
                    return r.gevRW(d, this._collectRawText(n));
                }
                _collectRawText(n) {
                    if (r.EonBn(r.qoMUQ, r.qoMUQ)) {
                        if (!n || !n.children) return "";
                        let e = "";
                        for (const t of n.children) {
                            if (r.PgHgJ(r.UXQzW, r.UXQzW)) {
                                const n = this.findParamByName(temporary218, r.LZmfr), e = (n ? this.getTextContent(n) : "").trim(), t = this.findParamByName(temporary219, r.IBqEZ);
                                if (t && r.Mbjdf(temporary220, r.rSkrC)) {
                                    const n = this.findChildByName(t, r.WbIVZ);
                                    if (n) {
                                        const t = this.findChildByName(n, r.qAEBc);
                                        if (t) {
                                            const n = this.escapeMarkdownText(r.WiOdn(temporary221, t.attribs[r.cgvRh] || ""));
                                            return "\n> 📄 **" + (this.labels.includeSharedBlock || r.cLgIJ) + "**" + (e ? ": " + e + " " : " ") + "(" + (this.labels.fromPage || r.JGvxd) + ": " + n + " [link needs manual correction])\n";
                                        }
                                    }
                                }
                                const c = this.getMacroBody(temporary222), i = this.walkNodes(c).trim(), a = this.labels.sharedBlock || r.vrVlT;
                                if (r.iKIHm(!e, !i)) return "";
                                const u = e ? "**" + a + ": " + e + "**" : "**" + a + "**";
                                return i ? "\n> " + u + "\n>\n" + i.split("\n").map((n => n ? "> " + n : ">")).join("\n") + "\n" : "\n> " + u + "\n";
                            }
                            r.uvzpV(t.type, r.NQDvr) ? e += t.data || "" : r.pIpXp(t.type, r.SLqtD) && (e += this._collectRawText(t));
                        }
                        return e;
                    }
                    {
                        const n = this.walkNodes(temporary223.children).trim();
                        if (!n) return "";
                        const e = n.split("\n").map((n => 0 === n.length ? ">" : "> " + n)).join("\n");
                        return IqTZBR.ubxYP(IqTZBR.ubxYP("\n", e), "\n");
                    }
                }
                cleanup(n) {
                    return r.IPLvn(r.QyDha, r.ZcToQ) ? r.rRhkT(s, n) : this._isCloud;
                }
            }
        };
        h.StorageDepthExceededError = f, h.DEFAULT_MAX_DEPTH = 256, e.exports = h;
    }
}), c = e({
    "../work/pchuri__confluence-cli/lib/link-style.js"(n, e) {
        var t = [ "smart", "plain", "wiki" ];
        const r = {};
        r.VALID_LINK_STYLES = t, r.resolveLinkStyle = function({isCloud: n = !1, linkStyle: e = null} = {}) {
            return t.includes(e) ? e : n ? "smart" : "plain";
        }, e.exports = r;
    }
}), i = e({
    "../work/pchuri__confluence-cli/lib/html-to-storage.js"(n, e) {
        const t = {
            fIokX: function(n, e) {
                return n === e;
            },
            rcSSV: "QmKAp",
            wsPZU: "blSLp",
            WekCy: "HtmlDepthExceededError",
            bCIKL: "text",
            mjTYF: "tag",
            uhGyG: function(n, e) {
                return n === e;
            },
            iZSzP: function(n, e) {
                return n === e;
            },
            kFzgN: "summary",
            VLChh: function(n, e) {
                return n(e);
            },
            cPsSl: function(n, e) {
                return n !== e;
            },
            AcBhl: "TBiAQ",
            ALTBD: "vDXxX",
            IHwHK: function(n, e) {
                return n !== e;
            },
            SPjlm: "VYvMz",
            VliCW: "ExAzx",
            bCsuH: function(n, e) {
                return n || e;
            },
            rhUOz: function(n, e) {
                return n === e;
            },
            rLqqa: "[[_TOC_]]",
            ijXfG: function(n, e) {
                return n === e;
            },
            bnZtM: "_TOC_",
            Scygi: function(n, e) {
                return n === e;
            },
            vdpgN: "TOC",
            DJYJH: "toc",
            QXcMX: "[[_LISTING_]]",
            YWxdy: "_LISTING_",
            IMCVG: "LISTING",
            wIZaU: function(n, e) {
                return n === e;
            },
            zVRZa: "rMbqX",
            Snqlm: "HOUjn",
            bmIUi: "children",
            UjHLN: "GhoiJ",
            jvhIc: function(n, e) {
                return n === e;
            },
            YGCnI: function(n, e) {
                return n !== e;
            },
            GYwOY: "SKBWH",
            xmqeO: function(n, e) {
                return n !== e;
            },
            RVOMo: "strong",
            OIfey: function(n, e) {
                return n !== e;
            },
            XNLFg: function(n, e, t) {
                return n(e, t);
            },
            vwxtq: "anchor",
            bOmhA: "MbdXM",
            CEZhH: function(n, e) {
                return n !== e;
            },
            QlCVx: function(n, e) {
                return n !== e;
            },
            tDZXW: function(n, e) {
                return n !== e;
            },
            yQJDc: function(n, e) {
                return n === e;
            },
            ZJmOl: "EXPAND: ",
            TxSBV: function(n, e) {
                return n !== e;
            },
            psBmZ: function(n, e) {
                return n(e);
            },
            uOGQl: function(n, e) {
                return n !== e;
            },
            pGfPd: function(n, e) {
                return n !== e;
            },
            ObThM: function(n, e) {
                return n !== e;
            },
            tyaAl: function(n, e) {
                return n !== e;
            },
            SofXE: function(n, e) {
                return n === e;
            },
            IqsWJ: "EXPAND_END",
            NGmrX: function(n, e) {
                return n(e);
            },
            ROUDt: "cdata",
            nuhjm: "comment",
            Daqfn: "directive",
            Fodpt: "script",
            TnQay: "style",
            tjXmH: "SLupe",
            KcAoD: "taZgV",
            LMCuA: function(n, e) {
                return n !== e;
            },
            zFjys: "NxewX",
            YsazY: "inline",
            vwbPZ: function(n, e) {
                return n === e;
            },
            WWBBT: "Wnfjp",
            WFurJ: "smart",
            WBIBM: function(n, e) {
                return n !== e;
            },
            dfbYe: "UXuDy",
            EDiMs: "fByAX",
            xyFyY: "wiki",
            CQgmC: "plain",
            tjnQB: function(n, e) {
                return n < e;
            },
            ZfuYt: function(n, e) {
                return n(e);
            },
            PpIyj: function(n, e) {
                return n + e;
            },
            YtDjw: "4|3|0|2|1",
            Xuaag: "Inclure le bloc partagé",
            LKRHr: "Détails",
            STIdw: "de la page",
            twVhu: "Bloc partagé",
            xMXrv: "Inclure la page",
            JoRcI: "ktbbs",
            itORF: "MhicU",
            wHYtF: function(n, e) {
                return n(e);
            },
            KRnWu: function(n, e, t) {
                return n(e, t);
            },
            LhxRu: "uHKrK",
            zxgHC: function(n, e) {
                return n + e;
            },
            RAkji: function(n, e) {
                return n(e);
            },
            iBqeR: function(n, e, t) {
                return n(e, t);
            },
            QgAcY: "dVhbs",
            Wxhdx: "LZPRe",
            dOSMQ: function(n, e) {
                return n === e;
            },
            bnJlm: "zrNFu",
            wsmRH: function(n, e) {
                return n !== e;
            },
            WdKVz: "ylKvj",
            SuQOY: "MZUHW",
            vqurL: function(n, e) {
                return n !== e;
            },
            cuLIc: "KCPgG",
            HDBhV: function(n, e, t) {
                return n(e, t);
            },
            NXXDo: function(n, e) {
                return n === e;
            },
            AHOTl: function(n, e) {
                return n === e;
            },
            fLgNd: function(n, e) {
                return n === e;
            },
            ZJHkJ: "code",
            epkEo: "hdNvO",
            phpHn: "IXqQe",
            qdaPq: function(n, e, t) {
                return n(e, t);
            },
            pNgOW: "hNzsy",
            fdCFY: function(n, e) {
                return n === e;
            },
            jwZWY: function(n, e, t) {
                return n(e, t);
            },
            EfXyg: "]]]]><![CDATA[>",
            wRVxb: "plantuml",
            MXPJO: function(n, e) {
                return n(e);
            },
            bhvPX: function(n, e) {
                return n !== e;
            },
            DJxAT: function(n, e) {
                return n === e;
            },
            jzHNW: function(n, e) {
                return n(e);
            },
            RCLde: function(n, e) {
                return n !== e;
            },
            VTNrO: function(n, e) {
                return n !== e;
            },
            ZDaKG: function(n, e) {
                return n !== e;
            },
            QIRXa: function(n, e, t) {
                return n(e, t);
            },
            GcGfx: "wmDuZ",
            kVngd: "oZbKL",
            meQSN: function(n, e) {
                return n(e);
            },
            ZJlFH: "crypto",
            pkxYR: function(n, e) {
                return n(e);
            },
            djNqz: function(n, e) {
                return n + e;
            },
            kRvWz: function(n) {
                return n();
            },
            HrPHb: function(n, e) {
                return n === e;
            },
            xkvRm: "code_block",
            GvYKb: "fence",
            oORGe: function(n, e) {
                return n(e);
            },
            YSgMz: function(n, e) {
                return n === e;
            },
            ZihwN: "EpAFz",
            HHagd: "gxxPv",
            beMCY: function(n, e) {
                return n(e);
            },
            jcnYJ: "&quot;",
            hMhhc: "kxZVp",
            HPqba: "language",
            DDIjc: "ac:plain-text-body",
            daoIo: function(n, e) {
                return n === e;
            },
            uJYhi: "TGCiC",
            wPlKq: "KnbnE",
            BQbUJ: function(n, e) {
                return n === e;
            },
            NwfaA: "acELK",
            diqYo: "UIZtZ",
            EJcEo: function(n, e) {
                return n !== e;
            },
            fkrbL: function(n, e, t) {
                return n(e, t);
            },
            bByRC: function(n, e) {
                return n + e;
            },
            afoex: function(n, e, t) {
                return n(e, t);
            },
            FalCl: "1|4|2|0|3",
            joYOm: "de la página",
            RGTlP: "Incluir página",
            mrbaA: "Incluir bloque compartido",
            SOZVF: "Detalles",
            VynGS: "Bloque compartido",
            gIpyY: "1|3|2|0|4",
            tQGxJ: "ページから",
            ezfwk: "ページを含む",
            QRxnf: "共有ブロックを含む",
            qSVgL: "共有ブロック",
            ENRLo: "詳細を表示",
            sxNTy: "tKFqX",
            xlvGQ: function(n, e) {
                return n !== e;
            },
            BNoKl: "fOUSp",
            suhYI: "nSTKF",
            hbEla: function(n, e) {
                return n(e);
            },
            iJIEn: '<ac:structured-macro ac:name="toc" ac:schema-version="1" />',
            eKyGV: '<ac:structured-macro ac:name="children" ac:schema-version="2" />',
            Mscnd: function(n, e) {
                return n > e;
            },
            RIvdm: function(n, e) {
                return n === e;
            },
            LNOwQ: "OHTnh",
            phPLO: function(n, e) {
                return n - e;
            },
            iUgbt: function(n, e) {
                return n(e);
            },
            Vsnev: "4|1|2|3|0",
            RgEXH: "Details",
            nfPqt: "Gemeinsamer Block",
            iJBNy: "Gemeinsamen Block einbinden",
            oYXki: "von Seite",
            sRRsS: "Seite einbinden",
            BNPEM: function(n, e) {
                return n(e);
            },
            PKqqP: "vajSD",
            skIKL: function(n, e) {
                return n === e;
            },
            DEteJ: "WZSyN",
            uMhZc: "QwvCk",
            enoQC: function(n, e) {
                return n === e;
            },
            RgaTc: function(n, e) {
                return n === e;
            },
            uWNuq: "yNqeN",
            gKLKi: function(n, e) {
                return n(e);
            },
            STSdX: function(n, e, t) {
                return n(e, t);
            },
            jIdVs: function(n, e) {
                return n(e);
            },
            Mjoph: function(n, e, t) {
                return n(e, t);
            },
            dulUZ: "<hr />",
            nrDhx: "<br />",
            SMezc: "img",
            EfSJB: "pre",
            pWYHT: function(n, e) {
                return n(e);
            },
            Umbps: "blockquote",
            Nxgsn: "details",
            rtejH: function(n, e, t) {
                return n(e, t);
            },
            UOPFv: "table",
            YzAtl: "thead",
            fhJXF: "tbody",
            tjKLy: "tfoot",
            lzNdK: function(n, e) {
                return n(e);
            },
            qqQwS: function(n, e, t) {
                return n(e, t);
            },
            SQNMa: function(n, e) {
                return n(e);
            },
            vvqUv: function(n, e) {
                return n === e;
            },
            Blucw: "IMlVT",
            DRfXX: function(n, e, t) {
                return n(e, t);
            },
            QJzfo: function(n, e) {
                return n + e;
            },
            Awkpb: "UlJIV",
            VMcKy: "JJRxH",
            gCkdy: function(n, e) {
                return n === e;
            },
            srrXQ: "number",
            VcSsL: function(n, e, t) {
                return n(e, t);
            },
            wGyFy: function(n, e) {
                return n(e);
            },
            kgPPP: "htmlparser2",
            xHQHo: "info",
            UewnK: "warning",
            hpjQf: "note",
            efAZS: "svg",
            hRkZG: "div",
            bzjuI: "span",
            wWcYy: "mark",
            IdJcI: "sub",
            dnogz: "sup",
            mgHlF: "ins",
            cvtsc: "del",
            vdWFB: "small",
            MMzvn: "abbr",
            kXDLA: "kbd",
            lIViC: "var",
            AcGvJ: "cite",
            XzgFJ: "time",
            HBLwt: "dfn",
            FOwio: "samp"
        };
        var {parseDocument: r} = t.wGyFy(require, t.kgPPP), {resolveLinkStyle: i} = t.kRvWz(c), a = class extends Error {
            constructor(n) {
                if (t.fIokX(t.rcSSV, t.wsPZU)) {
                    this._markdownCodeSpanDepth++;
                    try {
                        return this.renderCodeSpan(this.walkNodes(temporary224.children));
                    } finally {
                        this._markdownCodeSpanDepth--;
                    }
                } else super("HTML nesting exceeds limit of " + n + " levels"), this.name = t.WekCy, 
                this.maxDepth = n;
            }
        }, u = new Set([ "hr" ]), s = [ t.xHQHo, t.UewnK, t.hpjQf ], o = new Set([ t.efAZS, t.hRkZG ]), l = new Set([ "a", t.RVOMo, "em", t.ZJHkJ, "br", t.SMezc, t.bzjuI, t.wWcYy, t.IdJcI, t.dnogz, t.mgHlF, t.cvtsc, "b", "i", "u", t.vdWFB, "s", t.MMzvn, t.kXDLA, "q", t.lIViC, t.AcGvJ, t.XzgFJ, t.HBLwt, t.FOwio ]);
        function d(n) {
            if (!n.children) return !0;
            for (const e of n.children) {
                if (t.fIokX(e.type, t.bCIKL) && e.data.includes("\n")) return !1;
                if (t.fIokX(e.type, t.mjTYF) && !l.has(e.name)) return !1;
            }
            return !0;
        }
        function f(n) {
            return t.fIokX(n.type, t.bCIKL) && /^\s*$/.test(n.data);
        }
        function h(n) {
            const e = {
                Qpzaz: function(n, e) {
                    return t.uhGyG(n, e);
                },
                mJASg: t.mjTYF,
                JKvak: function(n, e) {
                    return t.iZSzP(n, e);
                },
                Jhetc: t.kFzgN,
                BPTnO: function(n, e) {
                    return t.VLChh(n, e);
                }
            };
            if (t.cPsSl(t.AcBhl, t.ALTBD)) return (n.children || []).filter((n => !f(n)));
            e.Qpzaz(temporary225.type, e.mJASg) && e.JKvak(temporary226.name, e.Jhetc) ? temporary227 = temporary228 : !e.BPTnO(temporary229, temporary230) && temporary232.push(temporary231);
        }
        function x(n, {allowPlain: e = !1} = {}) {
            if (t.IHwHK(t.SPjlm, t.VliCW)) {
                const r = t.bCsuH(n, "").trim();
                if (t.rhUOz(r, t.rLqqa) || t.ijXfG(r, t.bnZtM) || e && t.Scygi(r, t.vdpgN)) {
                    const n = {};
                    return n.kind = t.DJYJH, n;
                }
                if (t.uhGyG(r, t.QXcMX) || t.uhGyG(r, t.YWxdy) || e && t.uhGyG(r, t.IMCVG)) {
                    if (t.wIZaU(t.zVRZa, t.Snqlm)) return temporary233[temporary234];
                    {
                        const n = {};
                        return n.kind = t.bmIUi, n;
                    }
                }
                return null;
            }
            temporary235 = temporary239.filter((n => n !== temporary238)).map((n => temporary237(n, temporary236))).join("").replace(/^\s+/, "");
        }
        function p(n) {
            if (t.IHwHK(t.UjHLN, t.UjHLN)) return "\n**EXPAND: " + temporary240 + "**\n\n" + this.walkNodes(temporary241).trim() + "\n\n**EXPAND_END**\n";
            {
                if (t.IHwHK(n.name, "p")) return null;
                const e = t.VLChh(h, n);
                if (t.IHwHK(e.length, 1)) return null;
                if (t.jvhIc(e[0].type, t.bCIKL)) {
                    if (t.YGCnI(t.GYwOY, t.GYwOY)) {
                        const n = {};
                        return n.kind = t.bmIUi, n;
                    }
                    return t.VLChh(x, e[0].data);
                }
                const r = e[0];
                if (t.xmqeO(r.type, t.mjTYF) || t.cPsSl(r.name, t.RVOMo)) return null;
                const c = t.VLChh(h, r);
                if (t.OIfey(c.length, 1)) return null;
                const i = c[0];
                if (t.YGCnI(i.type, t.bCIKL)) return null;
                const a = t.XNLFg(x, i.data, {
                    allowPlain: !0
                });
                if (a) return a;
                const u = i.data.match(/^ANCHOR: (.+)$/);
                return u ? {
                    kind: t.vwxtq,
                    id: u[1]
                } : null;
            }
        }
        function m(n) {
            if (!t.IHwHK(t.bOmhA, t.bOmhA)) {
                if (t.CEZhH(n.type, t.mjTYF) || t.CEZhH(n.name, "p")) return !1;
                const e = t.VLChh(h, n);
                if (t.IHwHK(e.length, 1)) return !1;
                const r = e[0];
                if (t.QlCVx(r.type, t.mjTYF) || t.tDZXW(r.name, t.RVOMo)) return !1;
                if (!r.children || t.yQJDc(r.children.length, 0)) return !1;
                const c = r.children[0];
                return t.iZSzP(c.type, t.bCIKL) && c.data.startsWith(t.ZJmOl);
            }
            temporary243.push(temporary242);
        }
        function b(n) {
            if (t.CEZhH(n.type, t.mjTYF) || t.TxSBV(n.name, "p")) return !1;
            const e = t.psBmZ(h, n);
            if (t.uOGQl(e.length, 1)) return !1;
            const r = e[0];
            if (t.pGfPd(r.type, t.mjTYF) || t.ObThM(r.name, t.RVOMo)) return !1;
            const c = t.psBmZ(h, r);
            if (t.tyaAl(c.length, 1)) return !1;
            const i = c[0];
            return t.SofXE(i.type, t.bCIKL) && t.ijXfG(i.data, t.IqsWJ);
        }
        function _(n, {preserveDouble: e = !1} = {}) {
            if (t.uOGQl(t.tjXmH, t.KcAoD)) {
                if (e) {
                    if (!t.LMCuA(t.zFjys, t.zFjys)) return n.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
                    temporary244 += (r = temporary245, c = temporary248.slice(temporary246, temporary247), t.NGmrX(r, c)), 
                    temporary249 += temporary252.slice(temporary250, temporary251), temporary253 = temporary254;
                }
                return n.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
            }
            var r, c;
            if (!temporary255) return "";
            switch (temporary256.type) {
              case HoNper.ChSuY:
                return this.renderText(temporary257.data || "");

              case HoNper.fnZDd:
                return this.walkNodes(temporary258.children);

              case HoNper.aMEFP:
              case HoNper.egiRx:
                return "";

              case HoNper.RYbqG:
              case HoNper.hYztm:
              case HoNper.pPgCe:
                return this.walkElement(temporary259);

              default:
                return "";
            }
        }
        function g(n, e) {
            if (t.IHwHK(t.WWBBT, t.WWBBT)) {
                const n = {
                    ...temporary260
                };
                return n["data-card-appearance"] = t.YsazY, "<a" + t.NGmrX(temporary261, n) + ">" + temporary262 + "</a>";
            }
            {
                const r = n.attribs || {}, c = r.href || "", i = t.XNLFg(S, n, e);
                if (c.startsWith("#")) return '<ac:link ac:anchor="' + c.slice(1) + '"><ac:plain-text-link-body><![CDATA[' + t.psBmZ(_, i) + "]]></ac:plain-text-link-body></ac:link>";
                switch (e.linkStyle) {
                  case t.WFurJ:
                    if (t.WBIBM(t.dfbYe, t.EDiMs)) {
                        const n = {
                            ...r
                        };
                        return n["data-card-appearance"] = t.YsazY, "<a" + t.VLChh(C, n) + ">" + i + "</a>";
                    }
                    if (!temporary263.children) return !0;
                    for (const n of temporary264.children) {
                        if (QIWDtv.uJyOn(n.type, QIWDtv.lnLia) && n.data.includes("\n")) return !1;
                        if (QIWDtv.uJyOn(n.type, QIWDtv.LhOPj) && !temporary265.has(n.name)) return !1;
                    }
                    return !0;

                  case t.xyFyY:
                    return '<ac:link><ri:url ri:value="' + c + '" /><ac:plain-text-link-body><![CDATA[' + i + "]]></ac:plain-text-link-body></ac:link>";

                  default:
                    return "<a" + t.NGmrX(C, r) + ">" + i + "</a>";
                }
            }
        }
        function k(n) {
            const e = t.NGmrX(h, n);
            if (t.yQJDc(e.length, 0)) return null;
            const r = e[0];
            if (t.tDZXW(r.type, t.mjTYF) || t.IHwHK(r.name, "p")) return null;
            const c = r.children || [], i = c.findIndex((n => !f(n)));
            if (t.tjnQB(i, 0)) return null;
            const a = c[i];
            if (t.LMCuA(a.type, t.mjTYF) || t.ObThM(a.name, t.RVOMo)) return null;
            const u = t.ZfuYt(h, a);
            if (t.YGCnI(u.length, 1) || t.IHwHK(u[0].type, t.bCIKL)) return null;
            const o = s.find((n => u[0].data === n.toUpperCase()));
            if (!o) return null;
            const l = c.slice(t.PpIyj(i, 1)), d = l.some((n => !f(n)));
            if (d && (t.QlCVx(l[0].type, t.bCIKL) || !/^\s*\n/.test(l[0].data))) return null;
            const x = {};
            return x.marker = o, x.sameLine = d, x.markerP = r, x.tail = l, x;
        }
        function w(n, e) {
            const r = {};
            r.exxAt = t.YtDjw, r.RCazM = t.Xuaag, r.jdMsP = t.LKRHr, r.iMhgm = t.STIdw, r.BPhxg = t.twVhu, 
            r.WndEf = t.xMXrv;
            const c = r;
            if (t.IHwHK(t.JoRcI, t.itORF)) {
                const r = t.wHYtF(k, n);
                if (!r) return "<blockquote>" + t.KRnWu(S, n, e) + "</blockquote>";
                const {marker: i, sameLine: a, markerP: u, tail: s} = r, o = n.children || [];
                let l;
                if (a) if (t.LMCuA(t.LhxRu, t.LhxRu)) {
                    const n = c.exxAt.split("|");
                    let e = 0;
                    for (;;) {
                        switch (n[e++]) {
                          case "0":
                            temporary266.includeSharedBlock = c.RCazM;
                            continue;

                          case "1":
                            temporary267.expandDetails = c.jdMsP;
                            continue;

                          case "2":
                            temporary268.fromPage = c.iMhgm;
                            continue;

                          case "3":
                            temporary269.sharedBlock = c.BPhxg;
                            continue;

                          case "4":
                            temporary270.includePage = c.WndEf;
                            continue;
                        }
                        break;
                    }
                } else l = "<p>" + s.map((n => v(n, e))).join("").replace(/^\s*\n/, "") + "</p>" + o.filter((n => n !== u)).map((n => v(n, e))).join(""); else l = o.filter((n => n !== u)).map((n => v(n, e))).join("").replace(/^\s+/, "");
                return '<ac:structured-macro ac:name="' + i + '">\n          <ac:rich-text-body>' + l + "</ac:rich-text-body>\n        </ac:structured-macro>";
            }
            return this.renderCodeSpan(this.walkNodes(temporary271.children));
        }
        function y(n, e) {
            if (!t.Scygi(t.QgAcY, t.Wxhdx)) {
                const d = n.children || [];
                let h = null, x = [];
                for (const n of d) if (t.SofXE(n.type, t.mjTYF) && t.dOSMQ(n.name, t.kFzgN)) {
                    if (!t.ijXfG(t.bnJlm, t.bnJlm)) {
                        const n = [], e = /^ {0,3}(`{3,})[^\n]*\n[\s\S]*?\n {0,3}\1[\t ]*$/gm;
                        let t, r = 0;
                        for (;IhQyRl.pGfPd(t = e.exec(temporary272), null); ) n.push(temporary273.slice(r, t.index)), 
                        n.push(t[0]), r = IhQyRl.zxgHC(t.index, t[0].length);
                        return n.push(temporary274.slice(r)), n;
                    }
                    h = n;
                } else if (!t.wHYtF(f, n)) {
                    if (!t.wsmRH(t.WdKVz, t.SuQOY)) return s = temporary275, o = temporary276, l = temporary277, 
                    t.XNLFg(s, o, l);
                    x.push(n);
                }
                return h ? '<ac:structured-macro ac:name="expand"><ac:parameter ac:name="title">' + t.HDBhV(S, h, e).replace(/<[^>]+>/g, "").trim() + "</ac:parameter><ac:rich-text-body>" + x.map((n => v(n, e))).join("").trim() + "</ac:rich-text-body></ac:structured-macro>" : t.vqurL(t.cuLIc, t.cuLIc) ? "<details" + (a = temporary278, 
                u = temporary279.attribs, t.RAkji(a, u) + ">") + (r = temporary280, c = temporary281, i = temporary282, 
                t.iBqeR(r, c, i) + "</details>") : "<details" + t.wHYtF(C, n.attribs) + ">" + t.iBqeR(S, n, e) + "</details>";
            }
            var r, c, i, a, u, s, o, l;
            temporary286.push(temporary285.slice(temporary283, temporary284.index)), temporary288.push(temporary287[0]), 
            temporary289 = IhQyRl.zxgHC(temporary290.index, temporary291[0].length);
        }
        function N(n, e) {
            const r = n.children || [];
            if (!(t.NXXDo(r.length, 1) && t.AHOTl(r[0].type, t.mjTYF) && t.fLgNd(r[0].name, t.ZJHkJ))) {
                if (!t.ijXfG(t.epkEo, t.phpHn)) return "<pre>" + t.qdaPq(S, n, e) + "</pre>";
                this._markdownCodeSpanDepth--;
            }
            const c = r[0], i = (c.attribs.class || "").match(/language-(\w+)/), a = i ? i[1] : t.bCIKL;
            let u = "";
            for (const n of c.children || []) {
                if (!t.fLgNd(t.pNgOW, t.pNgOW)) return temporary292.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
                t.fdCFY(n.type, t.bCIKL) && (u += n.data);
            }
            return u = t.jwZWY(_, u.replace(/\n$/, ""), {
                preserveDouble: !0
            }).replace(/]]>/g, t.EfXyg), a === t.wRVxb ? '<ac:structured-macro ac:name="plantuml"><ac:plain-text-body><![CDATA[' + u + "]]></ac:plain-text-body></ac:structured-macro>" : '<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">' + a + "</ac:parameter><ac:plain-text-body><![CDATA[" + u + "]]></ac:plain-text-body></ac:structured-macro>";
        }
        function I(n, e) {
            if (t.yQJDc(t.GcGfx, t.kVngd)) {
                if (t.LMCuA(temporary293.name, "p")) return null;
                const n = t.MXPJO(temporary294, temporary295);
                if (t.bhvPX(n.length, 1)) return null;
                if (t.DJxAT(n[0].type, t.bCIKL)) return t.jzHNW(temporary296, n[0].data);
                const e = n[0];
                if (t.RCLde(e.type, t.mjTYF) || t.VTNrO(e.name, t.RVOMo)) return null;
                const r = t.wHYtF(temporary297, e);
                if (t.uOGQl(r.length, 1)) return null;
                const c = r[0];
                if (t.ZDaKG(c.type, t.bCIKL)) return null;
                const i = t.QIRXa(temporary298, c.data, {
                    allowPlain: !0
                });
                if (i) return i;
                const a = c.data.match(/^ANCHOR: (.+)$/);
                return a ? {
                    kind: t.vwxtq,
                    id: a[1]
                } : null;
            }
            {
                const {randomUUID: r} = t.meQSN(require, t.ZJlFH), c = t.iBqeR(S, n, e), i = t.pkxYR(C, n.attribs), a = "</" + n.name + ">", u = t.PpIyj(t.djNqz("<" + n.name + i + ">", c), a).replace(/]]>/g, t.EfXyg);
                return '<ac:structured-macro ac:name="html" ac:schema-version="1" ac:macro-id="' + t.kRvWz(r) + '"><ac:plain-text-body><![CDATA[' + u + "]]></ac:plain-text-body></ac:structured-macro>";
            }
        }
        function C(n) {
            const e = {};
            return e.ETwTh = t.WFurJ, e.PZSXY = t.CQgmC, t.VTNrO(t.hMhhc, t.hMhhc) ? temporary300.includes(temporary299) ? temporary301 : temporary302 ? bJUdBK.ETwTh : bJUdBK.PZSXY : n ? Object.keys(n).map((e => " " + e + '="' + function(n) {
                const e = {
                    DNkVU: function(n, e) {
                        return t.HrPHb(n, e);
                    },
                    VcPRz: t.xkvRm,
                    EEYDT: function(n, e) {
                        return t.rhUOz(n, e);
                    },
                    DMPws: t.GvYKb,
                    NrOms: function(n, e) {
                        return t.RAkji(n, e);
                    },
                    yxnzM: function(n, e) {
                        return t.oORGe(n, e);
                    }
                };
                if (!t.YSgMz(t.ZihwN, t.HHagd)) return t.beMCY(String, n).replace(/"/g, t.jcnYJ);
                (e.DNkVU(temporary303.type, e.VcPRz) || e.EEYDT(temporary304.type, e.DMPws)) && temporary305.map && temporary310.push([ e.NrOms(temporary306, temporary307.map[0]), e.yxnzM(temporary308, temporary309.map[1]) ]);
            }(n[e]) + '"')).join("") : "";
        }
        function S(n, e) {
            if (t.daoIo(t.uJYhi, t.wPlKq)) {
                const n = this.findParamByName(temporary311, IhQyRl.HPqba), e = n ? this.getTextContent(n) : "", t = this.findChildByName(temporary312, IhQyRl.DDIjc), r = t ? this.getRawText(t) : "", c = "`".repeat(IhQyRl.psBmZ(temporary313, r));
                return "\n" + c + e + "\n" + r + "\n" + c + "\n";
            }
            {
                if (!n.children) return "";
                const r = n.children, c = [];
                let i = 0;
                for (;t.tjnQB(i, r.length); ) {
                    const n = r[i];
                    if (t.MXPJO(m, n)) {
                        if (t.BQbUJ(t.NwfaA, t.diqYo)) return temporary314;
                        {
                            const a = r.findIndex(((n, e) => e > i && b(n)));
                            if (t.EJcEo(a, -1)) {
                                const u = t.fkrbL(S, n.children[0], e).replace(/^EXPAND: /, "").replace(/<[^>]+>/g, "").trim(), s = r.slice(t.bByRC(i, 1), a).map((n => v(n, e))).join("").trim();
                                c.push('<ac:structured-macro ac:name="expand"><ac:parameter ac:name="title">' + u + "</ac:parameter><ac:rich-text-body>" + s + "</ac:rich-text-body></ac:structured-macro>"), 
                                i = t.bByRC(a, 1);
                                continue;
                            }
                        }
                    }
                    c.push(t.afoex(v, n, e)), i++;
                }
                return c.join("");
            }
        }
        function v(n, e) {
            if (t.CEZhH(t.sxNTy, t.sxNTy)) {
                const n = t.FalCl.split("|");
                let e = 0;
                for (;;) {
                    switch (n[e++]) {
                      case "0":
                        temporary315.fromPage = t.joYOm;
                        continue;

                      case "1":
                        temporary316.includePage = t.RGTlP;
                        continue;

                      case "2":
                        temporary317.includeSharedBlock = t.mrbaA;
                        continue;

                      case "3":
                        temporary318.expandDetails = t.SOZVF;
                        continue;

                      case "4":
                        temporary319.sharedBlock = t.VynGS;
                        continue;
                    }
                    break;
                }
            } else {
                if (t.yQJDc(n.type, t.bCIKL)) return n.data;
                if (t.yQJDc(n.type, t.nuhjm)) {
                    if (t.xlvGQ(t.BNoKl, t.suhYI)) {
                        const e = t.hbEla(x, n.data);
                        return e && t.jvhIc(e.kind, t.DJYJH) ? t.iJIEn : e && t.fIokX(e.kind, t.bmIUi) ? t.eKyGV : "";
                    }
                    {
                        const n = t.gIpyY.split("|");
                        let e = 0;
                        for (;;) {
                            switch (n[e++]) {
                              case "0":
                                temporary320.fromPage = t.tQGxJ;
                                continue;

                              case "1":
                                temporary321.includePage = t.ezfwk;
                                continue;

                              case "2":
                                temporary322.includeSharedBlock = t.QRxnf;
                                continue;

                              case "3":
                                temporary323.sharedBlock = t.qSVgL;
                                continue;

                              case "4":
                                temporary324.expandDetails = t.ENRLo;
                                continue;
                            }
                            break;
                        }
                    }
                }
                if (t.TxSBV(n.type, t.mjTYF)) return "";
                if (t.Mscnd(++e.depth, e.maxDepth)) throw e.depth--, new a(e.maxDepth);
                try {
                    return t.RIvdm(t.LNOwQ, t.LNOwQ) ? t.fkrbL(T, n, e) : temporary325 ? temporary326.map((n => this.walkNode(n))).join("") : "";
                } finally {
                    e.depth--;
                }
            }
        }
        function T(n, e) {
            function r(n, e) {
                return temporary327(e, n - -1725 - 374);
            }
            const c = {
                WqlJj: function(n, e) {
                    return t.phPLO(n, e);
                },
                YduxD: t.Vsnev,
                PIkim: t.RgEXH,
                APuSJ: t.nfPqt,
                ntkNY: t.iJBNy,
                LaUGj: t.oYXki,
                ddbHE: t.sRRsS,
                VBCTu: function(n, e) {
                    return t.BNPEM(n, e);
                },
                cXuaX: function(n, e) {
                    return t.wIZaU(n, e);
                },
                RDAZl: t.DJYJH,
                RpNzU: t.iJIEn,
                EaMqK: t.bmIUi,
                zxLYk: t.eKyGV
            };
            if (!t.fLgNd(t.PKqqP, t.PKqqP)) {
                const n = EIUYxH.VBCTu(temporary328, temporary329.data);
                return n && EIUYxH.cXuaX(n.kind, EIUYxH.RDAZl) ? EIUYxH.RpNzU : n && EIUYxH.cXuaX(n.kind, EIUYxH.EaMqK) ? EIUYxH.zxLYk : "";
            }
            switch (n.name) {
              case "p":
                if (t.skIKL(t.DEteJ, t.uMhZc)) {
                    const n = {
                        opaqueProperty5: 1277,
                        opaqueProperty6: 1057
                    }, e = {
                        opaqueProperty7: 256
                    }, i = {
                        opaqueProperty8: 28
                    }, a = {
                        oAEOA: function(n, e) {
                            return t[r(3020 - i.opaqueProperty8, "p&@5")](n, e);
                        }
                    };
                    let u = t.iUgbt(temporary335, temporary336).replace(temporary330, (n => (temporary331.push(n), 
                    temporary332 + "H" + c.WqlJj(temporary333.length, 1) + temporary334)));
                    return u = u.replace(temporary337, (t => {
                        return temporary338[(c = n.opaqueProperty5, r(c - 1133, "ohGb"))](t), temporary339 + "H" + a.oAEOA(temporary340[(i = n.opaqueProperty6, 
                        r(i - e.opaqueProperty7, "#aoX"))], 1) + temporary341;
                        var c, i;
                    })), u;
                }
                {
                    const r = t.VLChh(p, n);
                    if (r && t.enoQC(r.kind, t.DJYJH)) return t.iJIEn;
                    if (r && t.RgaTc(r.kind, t.bmIUi)) return t.eKyGV;
                    if (r && t.NXXDo(r.kind, t.vwxtq)) {
                        if (t.pGfPd(t.uWNuq, t.uWNuq)) {
                            const n = "display/" + temporary342 + "/" + IhQyRl.MXPJO(temporary343, temporary344);
                            return "\n> 📄 **" + temporary345 + "**: [" + temporary346 + "](" + this.buildUrl(this.webUrlPrefix + "/" + n) + ")\n";
                        }
                        return '<ac:structured-macro ac:name="anchor"><ac:parameter ac:name="">' + r.id + "</ac:parameter></ac:structured-macro>";
                    }
                    return "<p" + t.gKLKi(C, n.attribs) + ">" + t.STSdX(S, n, e) + "</p>";
                }

              case "h1":
              case "h2":
              case "h3":
              case "h4":
              case "h5":
              case "h6":
              case t.RVOMo:
              case "em":
                return "<" + n.name + t.jIdVs(C, n.attribs) + ">" + t.Mjoph(S, n, e) + "</" + n.name + ">";

              case "hr":
                return t.dulUZ;

              case "br":
                return t.nrDhx;

              case t.SMezc:
                return "<img" + t.jzHNW(C, n.attribs) + ">";

              case "ul":
              case "ol":
                return "<" + n.name + t.iUgbt(C, n.attribs) + ">" + t.iBqeR(S, n, e) + "</" + n.name + ">";

              case "li":
                {
                    const r = t.HDBhV(S, n, e), c = "<li" + t.iUgbt(C, n.attribs) + ">";
                    return t.BNPEM(d, n) ? c + "<p>" + r + "</p></li>" : "" + c + r + "</li>";
                }

              case t.EfSJB:
                return t.HDBhV(N, n, e);

              case t.ZJHkJ:
                return "<code" + t.pWYHT(C, n.attribs) + ">" + t.jwZWY(S, n, e) + "</code>";

              case "a":
                return t.XNLFg(g, n, e);

              case t.Umbps:
                return t.HDBhV(w, n, e);

              case t.Nxgsn:
                return t.rtejH(y, n, e);

              case t.UOPFv:
              case t.YzAtl:
              case t.fhJXF:
              case t.tjKLy:
              case "tr":
                return "<" + n.name + t.lzNdK(C, n.attribs) + ">" + t.XNLFg(S, n, e) + "</" + n.name + ">";

              case "th":
              case "td":
                {
                    const r = t.qqQwS(S, n, e), c = "<" + n.name + t.iUgbt(C, n.attribs) + ">";
                    return t.SQNMa(d, n) ? c + "<p>" + r + "</p></" + n.name + ">" : "" + c + r + "</" + n.name + ">";
                }

              default:
                if (u.has(n.name)) return "<" + n.name + t.RAkji(C, n.attribs) + " />";
                if (o.has(n.name)) {
                    if (t.vvqUv(t.Blucw, t.Blucw)) return t.DRfXX(I, n, e);
                    {
                        const n = c.YduxD.split("|");
                        let e = 0;
                        for (;;) {
                            switch (n[e++]) {
                              case "0":
                                temporary347.expandDetails = c.PIkim;
                                continue;

                              case "1":
                                temporary348.sharedBlock = c.APuSJ;
                                continue;

                              case "2":
                                temporary349.includeSharedBlock = c.ntkNY;
                                continue;

                              case "3":
                                temporary350.fromPage = c.LaUGj;
                                continue;

                              case "4":
                                temporary351.includePage = c.ddbHE;
                                continue;
                            }
                            break;
                        }
                    }
                }
                return "<" + n.name + t.NGmrX(C, n.attribs) + ">" + t.QIRXa(S, n, e) + "</" + n.name + ">";
            }
        }
        const P = {
            htmlToStorage: function(n, e = {}) {
                if (!t.ijXfG(t.Awkpb, t.VMcKy)) {
                    const c = {};
                    c.isCloud = !!e.isCloud, c.linkStyle = e.linkStyle;
                    const a = {
                        linkStyle: t.oORGe(i, c),
                        depth: 0,
                        maxDepth: t.gCkdy(typeof e.maxDepth, t.srrXQ) ? e.maxDepth : 256
                    };
                    return t.XNLFg(S, t.VcSsL(r, n, {
                        decodeEntities: !1
                    }), a);
                }
                temporary355.push([ temporary352.index, t.QJzfo(temporary353.index, temporary354[0].length) ]);
            }
        };
        P.HtmlDepthExceededError = a, e.exports = P;
    }
}), a = require("markdown-it"), {StorageWalker: u} = r(), {htmlToStorage: s} = i(), {VALID_LINK_STYLES: o, resolveLinkStyle: l} = c(), d = [ "info", "warning", "note" ], f = "", h = /<\/?(?:br|u|sub|sup|mark|details|summary)(?=[\s/>])(?:"[^"]*"|'[^']*'|[^>])*>/gi, x = /<(svg|div)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi, p = /`[^`\n]+`/g;

function m(n, e) {
    return temporary356(n - 981, e);
}

function b(n) {
    return n.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

var _ = class {
    constructor({isCloud: n = !1, webUrlPrefix: e = "", buildUrl: t = null, linkStyle: r = null} = {}) {
        const c = {
            bubuq: "0|2|5|4|1|3",
            ojzHu: function(n, e) {
                return n(e);
            }
        }, i = c.bubuq.split("|");
        let u = 0;
        for (;;) {
            switch (i[u++]) {
              case "0":
                this._isCloud = n;
                continue;

              case "1":
                this.markdown = new a;
                continue;

              case "2":
                this.webUrlPrefix = e;
                continue;

              case "3":
                this.setupConfluenceMarkdownExtensions();
                continue;

              case "4":
                const i = {};
                i.isCloud = n, i.linkStyle = r, this.linkStyle = c.ojzHu(l, i);
                continue;

              case "5":
                this.buildUrl = t || (n => n);
                continue;
            }
            break;
        }
    }
    isCloud() {
        return this._isCloud;
    }
    setupConfluenceMarkdownExtensions() {
        this.markdown.enable([ "table", "strikethrough", "linkify" ]), this.markdown.core.ruler.before("normalize", "confluence_macros", (n => {
            const e = [];
            n.src = n.src.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`/g, (n => (e.push(n), 
            "" + f + (e.length - 1) + f)));
            for (const e of d) {
                const t = RegExp("(^|\\n)\\[!" + e + "\\]\\s*([\\s\\S]*?)(?=\\n\\s*\\n|\\n\\s*\\[!|$)", "g");
                n.src = n.src.replace(t, ((n, t, r) => t + "> **" + e.toUpperCase() + "**\n> " + r.trim().replace(/\n/g, "\n> ")));
            }
            const t = RegExp(f + "(\\d+)" + f, "g");
            n.src = n.src.replace(t, ((n, t) => e[+t] ?? n));
        }));
    }
    markdownToStorage(n) {
        return this.htmlToConfluenceStorage(this._renderMarkdownToHtml(n));
    }
    markdownToNativeStorage(n) {
        return this.htmlToConfluenceStorage(this._renderMarkdownToHtml(n));
    }
    _renderMarkdownToHtml(n) {
        const e = function(n, e) {
            return n(e);
        }, t = function(n, e) {
            return n === e;
        }, r = function(n, e, t, r) {
            return n(e, t, r);
        }, c = function(n, e) {
            return n !== e;
        }, i = this._findCodeRanges(n), a = [], u = (n, e, r) => t("ANWYs", "ANWYs") ? n.replace(RegExp("(^|\\n)([^\\S\\n]*)" + e + "[^\\S\\n]*(?=\\n|$)", "gi"), ((n, e, t) => "" + e + t + r)) : JXNvpC.tWShA(temporary357, temporary358).replace(/"/g, JXNvpC.AGZJG), s = n => {
            let e = u(n, "\x3c!--\\s*(?:\\[\\[)?_TOC_(?:\\]\\])?\\s*--\x3e", "**TOC**");
            return e = r(u, e, "\x3c!--\\s*(?:\\[\\[)?_LISTING_(?:\\]\\])?\\s*--\x3e", "**LISTING**"), 
            e = u(e, "\\[\\[_TOC_\\]\\]", "**TOC**"), r(u, e, "\\[\\[_LISTING_\\]\\]", "**LISTING**");
        }, o = n => {
            if (t("sXdVj", "sXdVj")) {
                let r = e(s, n).replace(x, (n => t("tpWOC", "MqsMS") ? "<blockquote>" + hDNsrp.HMWdV(temporary359, temporary360, temporary361) + "</blockquote>" : (a.push(n), 
                f + "H" + (a.length - 1) + f)));
                return r = r.replace(h, (n => {
                    if (c("fzTzT", "QEoKy")) return a.push(n), f + "H" + (a.length - 1) + f;
                    {
                        const n = this.getMacroBody(temporary362), e = this.walkNodes(n).trim(), t = e.split("\n").map((n => 0 === n.length ? ">" : "> " + n)).join("\n"), r = "> **" + temporary363.toUpperCase() + "**";
                        return "\n" + (RFLPAz.RzcAN(e.length, 0) ? r : r + "\n" + t) + "\n";
                    }
                })), r;
            }
            return temporary364 ? temporary368.keys(temporary367).map((n => " " + n + '="' + temporary366(temporary365[n]) + '"')).join("") : "";
        };
        let l = "", d = 0;
        for (const [e, r] of i) t("muRpI", "muRpI") ? (l += o(n.slice(d, e)), l += n.slice(e, r), 
        d = r) : temporary369.depth--;
        l += e(o, n.slice(d));
        const p = this.markdown.render(l);
        let m = 0, _ = !1;
        return p.replace(RegExp(f + "H(\\d+)" + f, "g"), ((n, e, t) => {
            if (c("QmeHZ", "vMhln")) {
                for (;m < t; m++) "<" === p[m] ? _ = !0 : ">" === p[m] && (_ = !1);
                m = t + n.length;
                const r = a[+e];
                return null == r ? n : _ ? b(r) : r;
            }
            for (const n of temporary370) xKcUMp.LYark(n.length, temporary371) && (temporary372 = n.length);
        }));
    }
    _findCodeRanges(n) {
        const e = function(n, e) {
            return n !== e;
        }, t = this.markdown.parse(n, {}), r = [ 0 ];
        for (let e = 0; e < n.length; e++) "\n" === n[e] && r.push(e + 1);
        const c = e => e < r.length ? r[e] : n.length, i = [];
        for (const n of t) {
            if (e("eEhiw", "eEhiw")) return temporary373 ? temporary374.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&") : temporary375.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
            if (("code_block" === n.type || "fence" === n.type) && n.map) {
                if (e("cpZRK", "cpZRK")) {
                    const n = hxiewt.dRYyu(temporary376, temporary377);
                    return n && hxiewt.kbeFU(n.kind, hxiewt.juMld) ? hxiewt.nCuwE : n && hxiewt.QTopd(n.kind, hxiewt.PiTLG) ? hxiewt.SVlfR : n && hxiewt.QTopd(n.kind, hxiewt.lzHqR) ? '<ac:structured-macro ac:name="anchor"><ac:parameter ac:name="">' + n.id + "</ac:parameter></ac:structured-macro>" : "<p" + hxiewt.DnqLg(temporary378, temporary379.attribs) + ">" + hxiewt.kspvW(temporary380, temporary381, temporary382) + "</p>";
                }
                i.push([ (s = c, o = n.map[0], s(o)), (a = c, u = n.map[1], a(u)) ]);
            }
        }
        var a, u, s, o;
        let l;
        for (p.lastIndex = 0; null !== (l = p.exec(n)); ) i.push([ l.index, (d = l.index, 
        f = l[0].length, d + f) ]);
        var d, f;
        i.sort(((n, e) => n[0] - e[0] || n[1] - e[1]));
        const h = [];
        for (const n of i) {
            const e = h[(x = h.length, x - 1)];
            e && n[0] <= e[1] ? e[1] = Math.max(e[1], n[1]) : h.push([ n[0], n[1] ]);
        }
        var x;
        return h;
    }
    htmlToConfluenceStorage(n) {
        const e = {};
        return e.isCloud = this._isCloud, e.linkStyle = this.linkStyle, s(n, e);
    }
    detectLanguageLabels(n) {
        const e = {
            stVHU: "ri:page",
            gKAku: function(n, e) {
                return n(e);
            },
            ukXJT: "ri:content-title",
            IJoGu: "Include Shared Block",
            JJIJE: "from page",
            fDdtT: function(n, e, t) {
                return n(e, t);
            },
            oIcAH: function(n, e) {
                return n + e;
            },
            HzHPS: function(n, e) {
                return n + e;
            },
            ppXvs: "Include Page",
            HauxM: "Shared Block",
            wsvwy: "Expand Details",
            FLoQq: "2|1|3|0|4",
            hUfPY: "来自页面",
            nFTzl: "共享块",
            YVPyT: "包含页面",
            WaEov: "包含共享块",
            oCzmv: "展开详情",
            sNIXh: "4|1|3|2|0",
            zEynj: "詳細を表示",
            NbgTf: "共有ブロック",
            sMtsE: "ページから",
            WRpFa: "共有ブロックを含む",
            YBBwg: "ページを含む",
            KWtPd: function(n, e) {
                return n === e;
            },
            rVziT: "jVLcH",
            ZwOmy: "WEhlM",
            FzFpe: "3|4|2|1|0",
            ORmoU: "상세 보기",
            CuTVq: "페이지에서",
            FREmN: "공유 블록 포함",
            VMhOs: "페이지 포함",
            SWDjX: "공유 블록",
            Piqtq: "CvFuu",
            LECvV: "rwkkJ",
            YrFyM: "2|3|4|1|0",
            Leqwz: "Подробнее",
            vMNqG: "со страницы",
            RQnqp: "Включить страницу",
            AEtUz: "Общий блок",
            VLpVb: "Включить общий блок",
            BLMYU: function(n, e) {
                return n >= e;
            },
            EAvdt: "1|2|3|4|0",
            VtEEa: "Détails",
            mUDKA: "Inclure la page",
            xBkIP: "Bloc partagé",
            LmgGY: "Inclure le bloc partagé",
            rJjJr: "de la page",
            Woppk: "OVpJP",
            AULwT: "lHWgC",
            vhvxH: "3|0|1|4|2",
            qfbqc: "Gemeinsamer Block",
            MIdAw: "Gemeinsamen Block einbinden",
            UFWYz: "Details",
            BDVTe: "Seite einbinden",
            zuoQO: "von Seite",
            PrRxE: function(n, e) {
                return n >= e;
            },
            nqTli: "1|2|0|4|3",
            JQYHO: "Incluir bloque compartido",
            JOhET: "Incluir página",
            HyHmM: "Bloque compartido",
            UkVRn: "Detalles",
            CKItH: "de la página"
        }, t = {};
        t.includePage = e.ppXvs, t.sharedBlock = e.HauxM, t.includeSharedBlock = e.IJoGu, 
        t.fromPage = e.JJIJE, t.expandDetails = e.wsvwy;
        const r = t;
        if (/[\u4e00-\u9fa5]/.test(n)) {
            const n = e.FLoQq.split("|");
            let t = 0;
            for (;;) {
                switch (n[t++]) {
                  case "0":
                    r.fromPage = e.hUfPY;
                    continue;

                  case "1":
                    r.sharedBlock = e.nFTzl;
                    continue;

                  case "2":
                    r.includePage = e.YVPyT;
                    continue;

                  case "3":
                    r.includeSharedBlock = e.WaEov;
                    continue;

                  case "4":
                    r.expandDetails = e.oCzmv;
                    continue;
                }
                break;
            }
        } else if (/[\u3040-\u309f\u30a0-\u30ff]/.test(n)) {
            const n = e.sNIXh.split("|");
            let t = 0;
            for (;;) {
                switch (n[t++]) {
                  case "0":
                    r.expandDetails = e.zEynj;
                    continue;

                  case "1":
                    r.sharedBlock = e.NbgTf;
                    continue;

                  case "2":
                    r.fromPage = e.sMtsE;
                    continue;

                  case "3":
                    r.includeSharedBlock = e.WRpFa;
                    continue;

                  case "4":
                    r.includePage = e.YBBwg;
                    continue;
                }
                break;
            }
        } else if (/[\uac00-\ud7af]/.test(n)) if (e.KWtPd(e.rVziT, e.ZwOmy)) {
            const n = this.findChildByName(temporary383, uhUEKy.stVHU);
            if (n) {
                const e = this.escapeMarkdownText(uhUEKy.gKAku(temporary384, n.attribs[uhUEKy.ukXJT] || "")), t = this.labels.includeSharedBlock || uhUEKy.IJoGu, r = this.labels.fromPage || uhUEKy.JJIJE;
                return "\n> 📄 **" + t + "**" + (temporary385 ? ": " + temporary386 + " " : " ") + "(" + r + ": " + e + " [link needs manual correction])\n";
            }
        } else {
            const n = e.FzFpe.split("|");
            let t = 0;
            for (;;) {
                switch (n[t++]) {
                  case "0":
                    r.expandDetails = e.ORmoU;
                    continue;

                  case "1":
                    r.fromPage = e.CuTVq;
                    continue;

                  case "2":
                    r.includeSharedBlock = e.FREmN;
                    continue;

                  case "3":
                    r.includePage = e.VMhOs;
                    continue;

                  case "4":
                    r.sharedBlock = e.SWDjX;
                    continue;
                }
                break;
            }
        } else if (/[\u0400-\u04ff]/.test(n)) {
            if (e.KWtPd(e.Piqtq, e.LECvV)) return '<ac:link ac:anchor="' + temporary387.slice(1) + '"><ac:plain-text-link-body><![CDATA[' + uhUEKy.gKAku(temporary388, temporary389) + "]]></ac:plain-text-link-body></ac:link>";
            {
                const n = e.YrFyM.split("|");
                let t = 0;
                for (;;) {
                    switch (n[t++]) {
                      case "0":
                        r.expandDetails = e.Leqwz;
                        continue;

                      case "1":
                        r.fromPage = e.vMNqG;
                        continue;

                      case "2":
                        r.includePage = e.RQnqp;
                        continue;

                      case "3":
                        r.sharedBlock = e.AEtUz;
                        continue;

                      case "4":
                        r.includeSharedBlock = e.VLpVb;
                        continue;
                    }
                    break;
                }
            }
        } else if (e.BLMYU((n.match(/[àâäéèêëïîôùûüÿœæç]/gi) || []).length, 2)) {
            const n = e.EAvdt.split("|");
            let t = 0;
            for (;;) {
                switch (n[t++]) {
                  case "0":
                    r.expandDetails = e.VtEEa;
                    continue;

                  case "1":
                    r.includePage = e.mUDKA;
                    continue;

                  case "2":
                    r.sharedBlock = e.xBkIP;
                    continue;

                  case "3":
                    r.includeSharedBlock = e.LmgGY;
                    continue;

                  case "4":
                    r.fromPage = e.rJjJr;
                    continue;
                }
                break;
            }
        } else if (e.BLMYU((n.match(/[äöüß]/gi) || []).length, 2)) {
            if (e.KWtPd(e.Woppk, e.AULwT)) {
                const n = uhUEKy.fDdtT(temporary390, temporary391.charAt(1), 10);
                return uhUEKy.oIcAH(uhUEKy.oIcAH(uhUEKy.oIcAH(uhUEKy.HzHPS("\n", "#".repeat(n)), " "), this.walkNodes(temporary392.children).trim()), "\n");
            }
            {
                const n = e.vhvxH.split("|");
                let t = 0;
                for (;;) {
                    switch (n[t++]) {
                      case "0":
                        r.sharedBlock = e.qfbqc;
                        continue;

                      case "1":
                        r.includeSharedBlock = e.MIdAw;
                        continue;

                      case "2":
                        r.expandDetails = e.UFWYz;
                        continue;

                      case "3":
                        r.includePage = e.BDVTe;
                        continue;

                      case "4":
                        r.fromPage = e.zuoQO;
                        continue;
                    }
                    break;
                }
            }
        } else if (e.PrRxE((n.match(/[áéíóúñ¿¡]/gi) || []).length, 2)) {
            const n = e.nqTli.split("|");
            let t = 0;
            for (;;) {
                switch (n[t++]) {
                  case "0":
                    r.includeSharedBlock = e.JQYHO;
                    continue;

                  case "1":
                    r.includePage = e.JOhET;
                    continue;

                  case "2":
                    r.sharedBlock = e.HyHmM;
                    continue;

                  case "3":
                    r.expandDetails = e.UkVRn;
                    continue;

                  case "4":
                    r.fromPage = e.CKItH;
                    continue;
                }
                break;
            }
        }
        return r;
    }
    storageToMarkdown(n, e = {}) {
        const t = e.attachmentsDir || "attachments", r = this.detectLanguageLabels(n), c = {};
        c.attachmentsDir = t, c.labels = r, c.buildUrl = this.buildUrl, c.webUrlPrefix = this.webUrlPrefix;
        const i = new u(c), a = i.walk(n);
        return "function" == typeof e.onWarnings && i.warnings.length > 0 && e.onWarnings(i.warnings), 
        a;
    }
};

module.exports = _, module.exports.VALID_LINK_STYLES = o;
