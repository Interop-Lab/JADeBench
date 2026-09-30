var __defProp = Object.defineProperty, __getOwnPropNames = Object.getOwnPropertyNames, __esm = (value1, value2) => function() {
    return value1 && (value2 = (0, value1[(value3 = __getOwnPropNames, value4 = value1, 
    value3(value4))[0]])(value1 = 0)), value2;
    var value3, value4;
}, __export = (value5, value6) => {
    for (var value7 in value6) __defProp(value5, value7, {
        get: value6[value7],
        enumerable: !0
    });
}, kingfisher_rules_exports = {};

const value8 = {};

function validateParentheses(value9) {
    const value10 = {
        HFdTl: "0|3|1|4|2",
        FgJIc: function(value11, value12) {
            return value11 > value12;
        },
        Yulbp: "...",
        ZYWiH: function(value13, value14) {
            return value13 < value14;
        },
        OoMzd: function(value15, value16) {
            return value15 - value16;
        },
        JcACw: function(value17, value18) {
            return value17 > value18;
        },
        YJXiM: function(value19, value20) {
            return value19 - value20;
        },
        XbACE: function(value21, value22) {
            return value21 === value22;
        },
        nnfBW: function(value23, value24) {
            return value23 !== value24;
        },
        CzEql: "NdRZY",
        TAmpb: function(value25, value26) {
            return value25 === value26;
        },
        yUCcW: "GLQYI",
        KtbXh: "LvhyL",
        jqUSO: function(value27, value28) {
            return value27 < value28;
        },
        NxiLu: function(value29, value30) {
            return value29 === value30;
        },
        vuNzk: "XQqZr"
    };
    let value31 = 0, value32 = !1, value33 = 0;
    const value34 = [];
    for (;value33 < value9.length; ) {
        const value35 = value9[value33], value36 = value33 > 0 ? value9[value33 - 1] : "", value37 = value33 > 1 ? value9[value33 - 2] : "";
        if ("\\" === value36 && "\\" !== value37) {
            if (value10.CzEql != value10.CzEql) {
                const value38 = new value39(value40);
                return value38.protocol + "//" + value38.host + value38.pathname;
            }
            value33++;
        } else if ("[" !== value35 || value32) if ("]" === value35 && value32) value32 = !1, 
        value33++; else {
            if (!value32) if (value10.yUCcW === value10.KtbXh) try {
                const value41 = new value42(value43, value44), value45 = {
                    ...value46
                };
                return value45.compiledRegex = value41, value45.cleanedPattern = value47, value45;
            } catch (value48) {
                const value49 = value10.HFdTl.split("|");
                let value50 = 0;
                for (;;) {
                    switch (value49[value50++]) {
                      case "0":
                        value51.warn("Invalid pattern for rule " + (value52.id || value53.name) + ": " + value54.error);
                        continue;

                      case "1":
                        value55.warn("Original pattern: " + value56.pattern.substring(0, 150) + (value57.pattern.length > 150 ? value10.Yulbp : ""));
                        continue;

                      case "2":
                        return null;

                      case "3":
                        value58.warn("Compilation also failed: " + value48.message);
                        continue;

                      case "4":
                        value59.warn("Converted pattern: " + value60.substring(0, 200) + (value61.length > 200 ? value10.Yulbp : ""));
                        continue;
                    }
                    break;
                }
            } else if ("(" === value35) value31++, value34.push(value33); else if (")" === value35) {
                if (value31--, value31 < 0) {
                    const value62 = {
                        valid: !1
                    };
                    return value62.error = "Unmatched closing parenthesis at position " + value33, value62;
                }
                value34.pop();
            }
            value33++;
        } else value32 = !0, value33++;
    }
    if (0 !== value31) {
        if (value10.vuNzk == value10.vuNzk) {
            const value63 = value34[0] || 0, value64 = {
                valid: !1
            };
            return value64.error = "Unmatched opening parenthesis (depth: " + value31 + ") at position " + value63, 
            value64;
        }
        value65 = !0;
    }
    return {
        valid: !0
    };
}

function stripComments(value66, value67 = !1) {
    return value66 = value66.replace(/\(\?#[^)]*\)/g, ""), value67 ? value66.split("\n").map((value68 => {
        {
            let value69 = "", value70 = !1, value71 = 0, value72 = -1;
            for (;value71 < value68.length; ) {
                const value73 = value68[value71];
                if ("\\" !== (value71 > 0 ? value68[value71 - 1] : "")) if ("[" !== value73 || value70) if ("]" === value73 && value70) value70 = !1, 
                value69 += value73, value71++; else {
                    if (!value70 && "#" === value73 && -1 === value72) {
                        const value74 = 0 === value71, value75 = value71 > 0 && /\s/.test(value68[value71 - 1]);
                        if (value74 || value75) {
                            value72 = value71;
                            break;
                        }
                    }
                    value69 += value73, value71++;
                } else value70 = !0, value69 += value73, value71++; else value69 += value73, value71++;
            }
            return value69;
        }
    })).join("\n") : value66.replace(/\s#[\s\w]*$/gm, "");
}

function convertNamedGroups(value76) {
    return value76.replace(/\(\?P<([^>]+)>/g, "(?<$1>");
}

function convertInlineFlagGroups(value77, value78) {
    let value79 = value77 = convertNamedGroups(value77), value80 = value78.includes("i"), value81 = value78.includes("s"), value82 = !1, value83 = !1;
    const value84 = /\(\?([-]?[imsux]+):/g;
    let value85;
    const value86 = [];
    for (value84.lastIndex = 0; null !== (value85 = value84.exec(value79)); ) {
        const value87 = value85.index, value88 = value85[1], value89 = value85.index + value85[0].length;
        value88.includes("i") && !value88.startsWith("-") && !value88.includes("-i") && !value80 && (value82 = !0), 
        value88.includes("s") && !value88.startsWith("-") && !value88.includes("-s") && !value81 && (value83 = !0);
        let value90 = 1, value91 = value89, value92 = -1, value93 = !1;
        for (;value91 < value79.length && value90 > 0; ) {
            const value94 = value79[value91];
            if ("\\" !== (value91 > 0 ? value79[value91 - 1] : "")) if ("[" !== value94 || value93) {
                if ("]" === value94 && value93) {
                    value93 = !1, value91++;
                    continue;
                }
                value93 || ("(" === value94 ? value90++ : ")" === value94 && value90--), value91++;
            } else value93 = !0, value91++; else value91++;
        }
        if (0 === value90) {
            value92 = value91 - 1;
            const value95 = value79.substring(value89, value92), value96 = {};
            value96.start = value87, value96.end = value91, value96.replacement = "(" + value95 + ")", 
            value86.push(value96);
        }
    }
    value86.reverse().forEach((value97 => {
        value79 = value79.substring(0, value97.start) + value97.replacement + value79.substring(value97.end);
    })), value82 && !value80 && (value78 += "i"), value83 && !value81 && (value78 += "s");
    const value98 = {};
    return value98.pattern = value79, value98.flags = value78, value98;
}

function convertPatternFlags(value99) {
    const value100 = {
        NqcAZ: "Rule missing pattern:",
        Yhuyf: function(value101, value102) {
            return value101 !== value102;
        },
        GUIpU: "TnxFQ",
        SBfVq: "WgduR",
        NGNAG: "4|2|3|1|0",
        iJSfq: "YmRUT",
        ZhcGC: function(value103, value104, value105) {
            return value103(value104, value105);
        },
        kpbsS: function(value106, value107) {
            return value106(value107);
        }
    };
    let value108 = "g", value109 = value99, value110 = !1;
    const value111 = value99.match(/^\(\?([imsux]+)\)/);
    if (value111) if (value100.iJSfq != value100.iJSfq) {
        const value112 = value113[1];
        value114 = value115.replace(/^\(\?[imsux]+\)/, ""), value112.includes("i") && (value116 += "i"), 
        value112.includes("m") && (value117 += "m"), value112.includes("s") && (value118 += "s"), 
        value112.includes("x") && (value119 = !0);
    } else {
        const value120 = value111[1];
        value109 = value99.replace(/^\(\?[imsux]+\)/, ""), value120.includes("i") && (value108 += "i"), 
        value120.includes("m") && (value108 += "m"), value120.includes("s") && (value108 += "s"), 
        value120.includes("x") && (value110 = !0);
    }
    const value121 = convertInlineFlagGroups(value109, value108);
    value109 = value121.pattern, value108 = value121.flags, value109 = value109.replace(/\(\?([imsux]+)\)/g, ((value122, value123) => {
        const value124 = {};
        value124.jVYeX = value100.NqcAZ;
        const value125 = value124;
        if (value100.GUIpU === value100.SBfVq) return value126.warn(value125.jVYeX, value127.id || value128.name), 
        null;
        {
            const value129 = value100.NGNAG.split("|");
            let value130 = 0;
            for (;;) {
                switch (value129[value130++]) {
                  case "0":
                    return "";

                  case "1":
                    value123.includes("x") && !value110 && (value110 = !0);
                    continue;

                  case "2":
                    value123.includes("m") && !value108.includes("m") && (value108 += "m");
                    continue;

                  case "3":
                    value123.includes("s") && !value108.includes("s") && (value108 += "s");
                    continue;

                  case "4":
                    value123.includes("i") && !value108.includes("i") && (value108 += "i");
                    continue;
                }
                break;
            }
        }
    })), value110 && (value109 = stripWhitespaceInExtendedMode(value109));
    const value131 = {};
    return value131.pattern = value109, value131.flags = value108, value131;
}

function stripWhitespaceInExtendedMode(value132) {
    let value133 = "", value134 = !1, value135 = 0;
    for (;value135 < value132.length; ) {
        const value136 = value132[value135], value137 = value135 + 1 < value132.length ? value132[value135 + 1] : "";
        if ("[" !== value136) if ("]" === value136 && value134) value134 = !1, value133 += value136, 
        value135++; else if (value134) value133 += value136, value135++; else if ("\\" === value136) value133 += value136, 
        value137 ? (value133 += value137, value135 += 2) : value135++; else {
            if (!value134 && /[\s\n\r\t]/.test(value136)) {
                value135++;
                continue;
            }
            value133 += value136, value135++;
        } else value134 = !0, value133 += value136, value135++;
    }
    return value133;
}

function validatePatternRequirements(value138, value139, value140 = null) {
    const value141 = function(value142, value143) {
        return value142 !== value143;
    }, value144 = function(value145, value146) {
        return value145 === value146;
    };
    if (!value139) return {
        passed: !0
    };
    const value147 = value138;
    if (value141(value139.min_digits, void 0)) {
        const value148 = (value147.match(/\d/g) || []).length;
        if (value148 < value139.min_digits) {
            const value149 = {
                passed: !1
            };
            return value149.reason = "Requires at least " + value139.min_digits + " digits, found " + value148, 
            value149;
        }
    }
    if (value141(value139.min_uppercase, void 0)) {
        const value150 = (value147.match(/[A-Z]/g) || []).length;
        if (value150 < value139.min_uppercase) {
            if (!value144("nGIqm", "KMMOW")) {
                const value151 = {
                    passed: !1
                };
                return value151.reason = "Requires at least " + value139.min_uppercase + " uppercase letters, found " + value150, 
                value151;
            }
            value152.warn("Failed to load rules from " + value153 + ":", value154);
        }
    }
    if (value141(value139.min_lowercase, void 0)) {
        const value155 = (value147.match(/[a-z]/g) || []).length;
        if (value155 < value139.min_lowercase) {
            if (value144("mYLYa", "AnAUj")) return value156;
            {
                const value157 = {
                    passed: !1
                };
                return value157.reason = "Requires at least " + value139.min_lowercase + " lowercase letters, found " + value155, 
                value157;
            }
        }
    }
    if (value141(value139.min_special_chars, void 0)) {
        const value158 = value139.special_chars || "!@#$%^&*()_+-=[]{}|;:'\",.<>?/\\`~", value159 = (value147.match(new RegExp("[" + value158.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "]", "g")) || []).length;
        if (value159 < value139.min_special_chars) {
            const value160 = {
                passed: !1
            };
            return value160.reason = "Requires at least " + value139.min_special_chars + " special characters, found " + value159, 
            value160;
        }
    }
    if (value139.ignore_if_contains) {
        const value161 = value147.toLowerCase();
        for (const value162 of value139.ignore_if_contains) {
            if (!value144("QwyVK", "QwyVK")) {
                if (/data:[\w/-]+;base64,/.test(value163)) return !0;
                if (/={1,2}$/.test(value164) && value165.length > 100) return !0;
                if (value166.length > 200 && /^[A-Za-z0-9+/=]+$/.test(value167)) return !0;
                const value168 = value169.substring(0, 100);
                return !!/"(?:data|content|image|icon|font|media|src|href|asset|resource)"\s*:\s*"[^"]*$/i.test(value168) || !!/(?:const|let|var)\s+(?:data|image|icon|font|asset|resource|content)\w*\s*=\s*["`'][^"`']*$/i.test(value168);
            }
            {
                const value170 = value162.trim();
                if (value170 && value161.includes(value170.toLowerCase())) {
                    const value171 = {
                        passed: !1
                    };
                    return value171.reason = "Contains ignored term: " + value170, value171.ignored = !0, 
                    value171;
                }
            }
        }
    }
    return {
        passed: !0
    };
}

async function loadKingfisherRules(value172) {
    const value173 = {
        TuMFn: function(value174, value175) {
            return value174 > value175;
        },
        jqeIe: function(value176, value177) {
            return value176(value177);
        },
        BTtZH: function(value178, value179) {
            return value178 !== value179;
        },
        EMZHk: "jOWfD",
        Niiav: "Rule missing pattern:",
        MQsYM: function(value180, value181, value182) {
            return value180(value181, value182);
        },
        ZyECw: function(value183, value184) {
            return value183(value184);
        },
        FThKN: "zgSEN",
        IdKbi: "PtCxb",
        CgUsO: "umpnB",
        dUIHb: "0|2|1|3|4",
        GVHkT: function(value185, value186) {
            return value185 > value186;
        },
        kABsu: "...",
        hRiXq: function(value187, value188) {
            return value187 === value188;
        },
        fLURR: "CYUEm",
        xqJXT: function(value189, value190) {
            return value189 > value190;
        },
        IRJRn: "pwlcV",
        DfbsL: "undefined",
        UzzQS: function(value191, value192) {
            return value191 === value192;
        },
        MKYDu: function(value193, value194) {
            return value193 === value194;
        },
        uKSid: "Fallback parser could not parse YAML",
        aSOMU: "Failed to parse YAML rules:"
    };
    let value195;
    try {
        if (value173.IRJRn == value173.IRJRn) {
            if (typeof window !== value173.DfbsL && window.jsyaml && window.jsyaml.load) value195 = window.jsyaml.load(value172); else if (value195 = parseYamlRulesFallback(value172), 
            !value195 || value195.rules && 0 === value195.rules.length || Array.isArray(value195) && 0 === value195.length) throw new Error(value173.uKSid);
        } else value196 += "i";
    } catch (value197) {
        return console.error(value173.aSOMU, value197), [];
    }
    return (value195.rules || (Array.isArray(value195) ? value195 : [])).map((value198 => {
        if (value173.EMZHk != value173.EMZHk) value199 && value200.length > 0 && (value201.pattern = value202.join("\n").trim(), 
        value203 = []), value204.push(value205); else {
            if (!value198 || !value198.pattern) return console.warn(value173.Niiav, value198.id || value198.name), 
            null;
            const value206 = /^\(\?([imsux]+)\)/.test(value198.pattern) && /^\(\?([imsux]+)\)/.exec(value198.pattern)[1].includes("x"), value207 = stripComments(value198.pattern, value206), {pattern: value208, flags: value209} = convertPatternFlags(value207), value210 = validateParentheses(value208);
            if (!value210.valid) if (value173.FThKN != value173.FThKN) value211.pattern = value212.join("\n").trim(), 
            value213 = []; else try {
                const value214 = new RegExp(value208, value209), value215 = {
                    ...value198
                };
                return value215.compiledRegex = value214, value215.cleanedPattern = value208, value215;
            } catch (value216) {
                if (value173.IdKbi !== value173.CgUsO) {
                    const value217 = value173.dUIHb.split("|");
                    let value218 = 0;
                    for (;;) {
                        switch (value217[value218++]) {
                          case "0":
                            console.warn("Invalid pattern for rule " + (value198.id || value198.name) + ": " + value210.error);
                            continue;

                          case "1":
                            console.warn("Original pattern: " + value198.pattern.substring(0, 150) + (value198.pattern.length > 150 ? value173.kABsu : ""));
                            continue;

                          case "2":
                            console.warn("Compilation also failed: " + value216.message);
                            continue;

                          case "3":
                            console.warn("Converted pattern: " + value208.substring(0, 200) + (value208.length > 200 ? value173.kABsu : ""));
                            continue;

                          case "4":
                            return null;
                        }
                        break;
                    }
                } else value219 = !1, value220.min_entropy = value221(value222.replace(/^min_entropy:\s*/, ""));
            }
            try {
                const value223 = new RegExp(value208, value209), value224 = {
                    ...value198
                };
                return value224.compiledRegex = value223, value224.cleanedPattern = value208, value224;
            } catch (value225) {
                if (value173.fLURR == value173.fLURR) return console.warn("Failed to compile regex for rule " + (value198.id || value198.name) + ":", value225.message), 
                console.warn("Pattern: " + value208.substring(0, 200) + (value208.length > 200 ? value173.kABsu : "")), 
                null;
                value226 = value227.jsyaml.load(value228);
            }
        }
    })).filter(Boolean);
}

function parseYamlRulesFallback(value229) {
    console.warn("Using fallback YAML parser - consider bundling js-yaml for better support");
    try {
        {
            const value230 = [], value231 = value229.split("\n");
            let value232 = null, value233 = !1, value234 = [];
            for (let value235 = 0; value235 < value231.length; value235++) {
                const value236 = value231[value235], value237 = value236.trim();
                if (value237 && !value237.startsWith("#")) if (value237.startsWith("- name:")) value232 && (value233 && value234.length > 0 && (value232.pattern = value234.join("\n").trim(), 
                value234 = []), value230.push(value232)), value232 = {
                    name: value237.replace(/^- name:\s*/, "").replace(/^["']|["']$/g, "")
                }, value233 = !1; else if (value232) if (value237.startsWith("id:")) value232.id = value237.replace(/^id:\s*/, "").replace(/^["']|["']$/g, ""); else if (value237.startsWith("pattern:")) {
                    value233 = !0;
                    const value238 = value237.replace(/^pattern:\s*\|?\s*/, "");
                    value238 && value234.push(value238);
                } else value233 && (value236.startsWith(" ") || value236.startsWith("\t")) ? value234.push(value236) : value237.startsWith("min_entropy:") ? (value233 = !1, 
                value232.min_entropy = parseFloat(value237.replace(/^min_entropy:\s*/, ""))) : value237.startsWith("pattern_requirements:") ? (value233 = !1, 
                value232.pattern_requirements = {}) : value232.pattern_requirements && value237.startsWith("min_digits:") ? value232.pattern_requirements.min_digits = parseInt(value237.replace(/^min_digits:\s*/, "")) : value237.match(/^[a-z_]+:/) && !value237.startsWith("pattern") && (value233 = !1);
            }
            value232 && (value233 && value234.length > 0 && (value232.pattern = value234.join("\n").trim()), 
            value232.pattern && value230.push(value232));
            const value239 = {};
            return value239.rules = value230, value239;
        }
    } catch (value240) {
        return console.error("Fallback YAML parser failed:", value240), {
            rules: []
        };
    }
}

async function loadKingfisherRulesFromJSON(value241) {
    try {
        const value242 = "string" == typeof value241 ? JSON.parse(value241) : value241;
        return (value242.rules || (Array.isArray(value242) ? value242 : [])).map((value243 => {
            if (!value243 || !value243.pattern) return null;
            const value244 = /^\(\?([imsux]+)\)/.test(value243.pattern) && /^\(\?([imsux]+)\)/.exec(value243.pattern)[1].includes("x"), value245 = stripComments(value243.pattern, value244), {pattern: value246, flags: value247} = convertPatternFlags(value245);
            try {
                const value248 = new RegExp(value246, value247), value249 = {
                    ...value243
                };
                return value249.compiledRegex = value248, value249.cleanedPattern = value246, value249;
            } catch (value250) {
                return console.warn("Failed to compile regex for rule " + (value243.id || value243.name) + ":", value250), 
                null;
            }
        })).filter(Boolean);
    } catch (value251) {
        return console.error("Failed to load JSON rules:", value251), [];
    }
}

async function loadKingfisherRulesFromFile(value252) {
    try {
        const value253 = await fetch(chrome.runtime.getURL(value252)), value254 = await value253.json();
        return await loadKingfisherRulesFromJSON(value254);
    } catch (value255) {
        return console.error("Failed to load rules from " + value252 + ":", value255), [];
    }
}

function scanWithKingfisherRules(value256, value257, value258 = {}) {
    const value259 = {
        IWvru: function(value260, value261) {
            return value260 === value261;
        },
        zSGTc: function(value262, value263) {
            return value262 === value263;
        },
        kdQKu: function(value264, value265) {
            return value264 < value265;
        },
        ikFfw: function(value266, value267) {
            return value266(value267);
        },
        FWiVn: function(value268, value269) {
            return value268 - value269;
        },
        xLwzs: "1|0|3|4|2",
        eWDab: function(value270, value271) {
            return value270 || value271;
        },
        UmVTj: function(value272, value273) {
            return value272 === value273;
        },
        poavj: function(value274, value275) {
            return value274 === value275;
        },
        gqoSo: "zovvU",
        TlnIi: function(value276, value277) {
            return value276 !== value277;
        },
        WIdee: "jNbJX",
        dlzTz: "FPizu",
        IGBJb: function(value278, value279) {
            return value278 !== value279;
        },
        IcbPk: function(value280, value281) {
            return value280 !== value281;
        },
        oWViY: "NuKBJ",
        boOTS: "IpRSe",
        uGAeG: "PDQJf",
        BGkql: "PVnSQ",
        xYOyc: "AWcGq",
        rzvym: function(value282, value283) {
            return value282 === value283;
        },
        apCcR: "EtKKF",
        gbQtK: "lEDLP",
        xKMvx: function(value284, value285, value286, value287) {
            return value284(value285, value286, value287);
        },
        ZRRis: function(value288, value289) {
            return value288 === value289;
        },
        dUPaO: "CcmiQ",
        hZNLj: "eusqO",
        XSBTf: function(value290, value291) {
            return value290 - value291;
        },
        SVSlp: function(value292, value293) {
            return value292 + value293;
        },
        cuzfm: "medium",
        wWiMU: function(value294, value295) {
            return value294(value295);
        },
        XhuSF: function(value296, value297) {
            return value296 !== value297;
        },
        YXrOJ: "KgdXr",
        nYfEo: "almBb"
    }, value298 = [];
    if (!value256 || !value257 || 0 === value257.length) return value298;
    const {minEntropy: minEntropy = 0, checkPatternRequirements: checkPatternRequirements = !0, getEntropy: value299 = null} = value258;
    for (const value300 of value257) {
        if (!value300.compiledRegex) {
            if (value259.gqoSo == value259.gqoSo) continue;
            if (prtDhB.IWvru(value301, "(")) value302++, value303.push(value304); else if (prtDhB.zSGTc(value305, ")")) {
                if (value306--, prtDhB.kdQKu(value307, 0)) {
                    const value308 = {
                        valid: !1
                    };
                    return value308.error = "Unmatched closing parenthesis at position " + value309, 
                    value308;
                }
                value310.pop();
            }
        }
        try {
            if (value259.WIdee !== value259.dlzTz) {
                const value311 = value300.compiledRegex;
                let value312;
                for (value311.lastIndex = 0; null !== (value312 = value311.exec(value256)); ) {
                    if (value259.oWViY != value259.oWViY) return value313;
                    {
                        const value314 = value312[0], value315 = value312.index;
                        if (value299 && value300.min_entropy) if (value259.boOTS !== value259.uGAeG) {
                            if (value299(value314) < value300.min_entropy) {
                                if (value259.BGkql !== value259.xYOyc) continue;
                                value316.pattern_requirements.min_digits = prtDhB.ikFfw(value317, value318.replace(/^min_digits:\s*/, ""));
                            }
                        } else {
                            value319 = prtDhB.FWiVn(value320, 1);
                            const value321 = value322.substring(value323, value324), value325 = {};
                            value325.start = value326, value325.end = value327, value325.replacement = "(" + value321 + ")", 
                            value328.push(value325);
                        }
                        if (checkPatternRequirements && value300.pattern_requirements) {
                            if (value259.apCcR === value259.gbQtK) return value329.warn("Failed to compile regex for rule " + (value330.id || value331.name) + ":", value332), 
                            null;
                            {
                                const value333 = {};
                                value333.captures = value312;
                                const value334 = validatePatternRequirements(value314, value300.pattern_requirements, value333);
                                if (!value334.passed && !value334.ignored) {
                                    if (value259.dUPaO !== value259.hZNLj) continue;
                                    {
                                        const value335 = value259.xLwzs.split("|");
                                        let value336 = 0;
                                        for (;;) {
                                            switch (value335[value336++]) {
                                              case "0":
                                                value337.includes("m") && !value338.includes("m") && (value339 += "m");
                                                continue;

                                              case "1":
                                                value340.includes("i") && !value341.includes("i") && (value342 += "i");
                                                continue;

                                              case "2":
                                                return "";

                                              case "3":
                                                value343.includes("s") && !value344.includes("s") && (value345 += "s");
                                                continue;

                                              case "4":
                                                value346.includes("x") && !value347 && (value348 = !0);
                                                continue;
                                            }
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        const value349 = Math.max(0, value315 - 100), value350 = Math.min(value256.length, value315 + value314.length + 100), value351 = value256.substring(value349, value350);
                        value298.push({
                            ruleId: value300.id,
                            ruleName: value300.name,
                            match: value314,
                            index: value315,
                            confidence: value300.confidence || value259.cuzfm,
                            entropy: value299 ? value299(value314).toFixed(2) : null,
                            context: value351,
                            validation: value300.validation || null
                        });
                    }
                }
            } else value352 = value353.responseBody || "";
        } catch (value354) {
            if (value259.YXrOJ === value259.nYfEo) throw new value355("HTTP " + value356.status + ": " + value357.statusText);
            console.warn("Error scanning with rule " + value300.id + ":", value354);
        }
    }
    return value298;
}

async function loadKingfisherRulesFromLocalFile(value358) {
    try {
        {
            const value359 = chrome.runtime.getURL("rules/" + value358), value360 = await fetch(value359);
            if (!value360.ok) throw new Error("HTTP " + value360.status + ": " + value360.statusText);
            const value361 = await value360.text();
            return await loadKingfisherRules(value361);
        }
    } catch (value362) {
        return console.error("Failed to load Kingfisher rules from " + value358 + ":", value362), 
        [];
    }
}

async function loadKingfisherRulesFromLocalFiles(value363) {
    const value364 = [];
    for (const value365 of value363) try {
        {
            const value366 = await loadKingfisherRulesFromLocalFile(value365);
            value364.push(...value366);
        }
    } catch (value367) {
        console.warn("Failed to load rules from " + value365 + ":", value367);
    }
    return value364;
}

async function loadAllKingfisherRulesFromLocal() {
    try {
        {
            const value368 = chrome.runtime.getURL("rules/_manifest.json"), value369 = await fetch(value368);
            if (value369.ok) {
                const value370 = await value369.json();
                if (value370.files && Array.isArray(value370.files)) return await loadKingfisherRulesFromLocalFiles(value370.files);
            }
        }
    } catch (value371) {}
    const value372 = [ "slack.yaml", "aws.yaml", "github.yaml", "google.yaml", "stripe.yaml", "twilio.yaml", "azure.yaml", "heroku.yaml", "mailgun.yaml", "sendgrid.yaml", "paypal.yaml", "square.yaml" ], value373 = [];
    for (const value374 of value372) try {
        const value375 = await loadKingfisherRulesFromLocalFile(value374);
        value375.length > 0 && value373.push(...value375);
    } catch (value376) {}
    return value373;
}

async function loadKingfisherRulesFromURL(value377) {
    try {
        {
            const value378 = await fetch(value377), value379 = await value378.text();
            return await loadKingfisherRules(value379);
        }
    } catch (value380) {
        return console.error("Failed to load Kingfisher rules from URL:", value380), [];
    }
}

async function loadKingfisherRulesFromURLs(value381) {
    const value382 = [];
    for (const value383 of value381) try {
        {
            const value384 = await loadKingfisherRulesFromURL(value383);
            value382.push(...value384);
        }
    } catch (value385) {
        console.warn("Failed to load rules from " + value383 + ":", value385);
    }
    return value382;
}

value8.loadAllKingfisherRulesFromLocal = () => loadAllKingfisherRulesFromLocal, 
value8.loadKingfisherRules = () => loadKingfisherRules, value8.loadKingfisherRulesFromFile = () => loadKingfisherRulesFromFile, 
value8.loadKingfisherRulesFromJSON = () => loadKingfisherRulesFromJSON, value8.loadKingfisherRulesFromLocalFile = () => loadKingfisherRulesFromLocalFile, 
value8.loadKingfisherRulesFromLocalFiles = () => loadKingfisherRulesFromLocalFiles, 
value8.loadKingfisherRulesFromURL = () => loadKingfisherRulesFromURL, value8.loadKingfisherRulesFromURLs = () => loadKingfisherRulesFromURLs, 
value8.scanWithKingfisherRules = () => scanWithKingfisherRules, __export(kingfisher_rules_exports, value8);

const value386 = {
    "../work/repplus__rep-chrome/js/features/extractors/kingfisher-rules.js": function() {}
};

var init_kingfisher_rules = __esm(value386), KNOWN_FALSE_POSITIVE_PATTERNS = [ /^[a-f0-9]{40}$/i, /^[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]+)+$/, /^[a-z][a-zA-Z0-9]+(?:[A-Z][a-z0-9]+)+$/, /^(?:map|filter|reduce|forEach|slice|splice|concat)/i, /^_react|_emotion|_styled|_next/i, /sourceMappingURL/i, /^__webpack/i, /^module\./i, /^exports\./i ], FALSE_POSITIVE_CONTEXT_PATTERNS = [ /base64,/i, /data:image/i, /;base64/i, /"(?:publicKey|privateKey|data|content|image|icon|font|logo|avatar|thumbnail|media|src|href)":/i, /iVBOR|AAAA|\/png|\/jpeg|\/jpg|\/gif|\/webp|\/svg/i, /sourceMappingURL=/i, /webpack:\/\//i, /__webpack/i, /\.chunk\.js/i, /\/\*#\s*source/i, /import\s+.*\s+from\s+['"]/i, /require\s*\(['"]/i, /["']data["']\s*:/i, /["']image["']\s*:/i, /\/\/ data:image/i ];

function getEntropy(value387) {
    const value388 = value387.length, value389 = {};
    for (let value390 = 0; value390 < value388; value390++) {
        const value391 = value387[value390];
        value389[value391] = (value389[value391] || 0) + 1;
    }
    let value392 = 0;
    for (const value393 in value389) {
        const value394 = value389[value393] / value388;
        value392 -= value394 * Math.log2(value394);
    }
    return value392;
}

function isLikelyBase64Data(value395, value396) {
    if (/data:[\w/-]+;base64,/.test(value396)) return !0;
    if (/={1,2}$/.test(value395) && value395.length > 100) return !0;
    if (value395.length > 200 && /^[A-Za-z0-9+/=]+$/.test(value395)) return !0;
    const value397 = value396.substring(0, 100);
    return !!/"(?:data|content|image|icon|font|media|src|href|asset|resource)"\s*:\s*"[^"]*$/i.test(value397) || !!/(?:const|let|var)\s+(?:data|image|icon|font|asset|resource|content)\w*\s*=\s*["`'][^"`']*$/i.test(value397);
}

function isInComment(value398) {
    const value399 = value398.trim();
    return /^\s*\/\//.test(value399) || /^\s*\*/.test(value399) || /^\s*\/\*/.test(value399);
}

function normalizeSourceFile(value400) {
    if (!value400) return value400;
    try {
        const value401 = new URL(value400);
        return value401.protocol + "//" + value401.host + value401.pathname;
    } catch (value402) {
        return value400.split("?")[0].split("#")[0];
    }
}

function deduplicateResults(value403) {
    const value404 = new Set;
    return value403.filter((value405 => {
        {
            const value406 = normalizeSourceFile(value405.file || ""), value407 = value405.type + ":" + value405.match + ":" + value406;
            return !value404.has(value407) && (value404.add(value407), !0);
        }
    }));
}

var kingfisherRulesCache = null;

async function loadKingfisherRules2() {
    if (kingfisherRulesCache) return kingfisherRulesCache;
    try {
        {
            const {loadAllKingfisherRulesFromLocal: value408, scanWithKingfisherRules: value409} = await Promise.resolve().then((() => (init_kingfisher_rules(), 
            kingfisher_rules_exports))), value410 = await value408(), value411 = {};
            return value411.rules = value410, value411.scanWithKingfisherRules = value409, kingfisherRulesCache = value411;
        }
    } catch (value412) {
        return console.error("Failed to load Kingfisher rules:", value412), kingfisherRulesCache = {
            rules: [],
            scanWithKingfisherRules: null
        };
    }
}

function scanContent(value413, value414) {
    return [];
}

async function scanContentWithKingfisher(value415, value416) {
    const value417 = {
        ySQtq: function(value418, value419) {
            return value418(value419);
        },
        yNQNC: function(value420, value421) {
            return value420 / value421;
        },
        uXvZr: function(value422, value423) {
            return value422 * value423;
        },
        VJPMf: "1|0|4|3|2",
        MguYg: function(value424, value425) {
            return value424 > value425;
        },
        VcsSN: "...",
        eugWG: function(value426, value427) {
            return value426 > value427;
        },
        FvQoM: function(value428, value429) {
            return value428 === value429;
        },
        DqIuc: "tDprn",
        bTKHU: "QoFjq",
        pRaOw: function(value430) {
            return value430();
        },
        wBQqQ: function(value431, value432) {
            return value431 === value432;
        },
        nELyf: "wwLGU",
        TcSzy: "KBVve",
        UPAuO: function(value433, value434, value435, value436) {
            return value433(value434, value435, value436);
        },
        Wnrcu: function(value437, value438) {
            return value437 - value438;
        },
        klAZb: function(value439, value440) {
            return value439 + value440;
        },
        XsMdy: function(value441, value442) {
            return value441 !== value442;
        },
        hYDyK: "KrAiO",
        IyYfQ: "cvWlR",
        exAyU: "eydZu",
        LTJDW: "rsUvj",
        PmtUx: function(value443, value444) {
            return value443 !== value444;
        },
        iPwbK: "TUVnW",
        mDnbb: "TVxxL",
        ZfcsJ: function(value445, value446, value447) {
            return value445(value446, value447);
        },
        IgXDw: function(value448, value449) {
            return value448 + value449;
        },
        EDJda: function(value450, value451) {
            return value450 === value451;
        },
        uBNgo: "high",
        lIGmw: "medium",
        kqVFj: function(value452, value453) {
            return value452 === value453;
        },
        wupDH: "WsJHe",
        ZVYOp: function(value454, value455) {
            return value454 < value455;
        },
        viGUo: function(value456, value457) {
            return value456 < value457;
        },
        itnib: "Unknown Secret",
        WcnAq: "0.00",
        hZWIT: function(value458, value459) {
            return value458 === value459;
        },
        kIjJz: "mJJRR",
        Gnzmy: "zJpkP",
        swGtW: "Error scanning with Kingfisher rules:"
    }, value460 = [];
    if (!value415) {
        if (value417.DqIuc !== value417.bTKHU) return value460;
        value461(new value462(value463.runtime.lastError.message));
    }
    try {
        const {rules: value464, scanWithKingfisherRules: value465} = await loadKingfisherRules2();
        if (!value464 || 0 === value464.length || !value465) {
            if (value417.nELyf !== value417.TcSzy) return value460;
            {
                const value466 = ezaGcN.yNQNC(value467[value468], value469);
                value470 -= ezaGcN.uXvZr(value466, value471.log2(value466));
            }
        }
        const value472 = {};
        value472.getEntropy = getEntropy, value472.checkPatternRequirements = !0;
        const value473 = value465(value415, value464, value472);
        for (const value474 of value473) {
            const value475 = Math.max(0, value474.index - 100), value476 = Math.min(value415.length, value474.index + value474.match.length + 100), value477 = value415.substring(value475, value476);
            let value478 = !1;
            for (const value479 of KNOWN_FALSE_POSITIVE_PATTERNS) if (value417.hYDyK != value417.hYDyK) {
                const value480 = value481.trim();
                if (value480 && value482.includes(value480.toLowerCase())) {
                    const value483 = {
                        passed: !1
                    };
                    return value483.reason = "Contains ignored term: " + value480, value483.ignored = !0, 
                    value483;
                }
            } else if (value479.test(value474.match)) {
                if (value417.IyYfQ == value417.IyYfQ) {
                    value478 = !0;
                    break;
                }
                value484.error("Error scanning request " + value485 + ":", value486);
            }
            if (value478) continue;
            let value487 = !1;
            for (const value488 of FALSE_POSITIVE_CONTEXT_PATTERNS) if (value417.exAyU === value417.LTJDW) {
                const value489 = value490.toLowerCase();
                for (const value491 of value492.ignore_if_contains) {
                    const value493 = value491.trim();
                    if (value493 && value489.includes(value493.toLowerCase())) {
                        const value494 = {
                            passed: !1
                        };
                        return value494.reason = "Contains ignored term: " + value493, value494.ignored = !0, 
                        value494;
                    }
                }
            } else if (value488.test(value477)) {
                if (value417.iPwbK !== value417.mDnbb) {
                    value487 = !0;
                    break;
                }
                return !0;
            }
            if (value487) continue;
            if (isLikelyBase64Data(value474.match, value477)) continue;
            const value495 = value415.lastIndexOf("\n", value474.index) + 1, value496 = value415.indexOf("\n", value474.index);
            if (isInComment(value415.substring(value495, -1 === value496 ? value415.length : value496))) continue;
            let value497 = 50;
            if (value497 = value474.confidence === value417.uBNgo ? 85 : value474.confidence === value417.lIGmw ? 70 : 60, 
            value474.entropy) if (value417.wupDH == value417.wupDH) {
                const value498 = parseFloat(value474.entropy);
                value498 > 4.5 ? value497 += 10 : value498 < 3.5 && (value497 -= 10);
            } else {
                const value499 = value417.VJPMf.split("|");
                let value500 = 0;
                for (;;) {
                    switch (value499[value500++]) {
                      case "0":
                        value501.warn("Compilation also failed: " + value502.message);
                        continue;

                      case "1":
                        value503.warn("Invalid pattern for rule " + (value504.id || value505.name) + ": " + value506.error);
                        continue;

                      case "2":
                        return null;

                      case "3":
                        value507.warn("Converted pattern: " + value508.substring(0, 200) + (ezaGcN.MguYg(value509.length, 200) ? ezaGcN.VcsSN : ""));
                        continue;

                      case "4":
                        value510.warn("Original pattern: " + value511.pattern.substring(0, 150) + (ezaGcN.eugWG(value512.pattern.length, 150) ? ezaGcN.VcsSN : ""));
                        continue;
                    }
                    break;
                }
            }
            if (value497 < 60) continue;
            const value513 = value474.ruleName || value474.ruleId || value417.itnib;
            value460.push({
                file: value416,
                type: value513,
                match: value474.match,
                index: value474.index,
                confidence: Math.min(100, value497),
                entropy: value474.entropy || value417.WcnAq,
                ruleName: value474.ruleName,
                ruleId: value474.ruleId
            });
        }
    } catch (value514) {
        value417.kIjJz === value417.Gnzmy ? value515.push(value516) : console.warn(value417.swGtW, value514);
    }
    return value460;
}

async function scanForSecrets(value517, value518, value519) {
    const value520 = [], value521 = new Set;
    let value522 = 0;
    const value523 = value517.length;
    for (const value524 of value517) {
        try {
            if (!value524 || !value524.request || !value524.response) {
                value522++, value518 && value518(value522, value523);
                continue;
            }
            const value525 = value524.request.url.toLowerCase(), value526 = value524.response?.content?.mimeType?.toLowerCase() || "";
            if (value525.endsWith(".js") || value526.includes("javascript") || value526.includes("ecmascript") || value526.includes("application/javascript")) try {
                {
                    let value527 = null;
                    if (void 0 !== value524.responseBody) value527 = value524.responseBody || ""; else {
                        if ("function" != typeof value524.getContent) {
                            value522++, value518 && value518(value522, value523);
                            continue;
                        }
                        value527 = await new Promise(((value528, value529) => {
                            value524.getContent(((value530, value531) => {
                                chrome.runtime.lastError ? value529(new Error(chrome.runtime.lastError.message)) : value528(value530 || "");
                            }));
                        }));
                    }
                    if (value527) try {
                        const value532 = await scanContentWithKingfisher(value527, value524.request.url);
                        for (const value533 of value532) {
                            const value534 = value533.type + ":" + value533.match;
                            !value521.has(value534) && (value521.add(value534), value520.push(value533), value519 && value519(value533));
                        }
                    } catch (value535) {
                        console.warn("Error scanning with Kingfisher:", value535);
                    }
                }
            } catch (value536) {
                console.error("Error scanning request " + value525 + ":", value536);
            }
        } catch (value537) {
            console.error("Error processing request:", value537);
        }
        value522++, value518 && value518(value522, value523);
    }
    return value520;
}

export { scanContent, scanContentWithKingfisher, scanForSecrets };
