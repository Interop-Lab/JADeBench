const __commonJS = (modules, module) => function requireCommonJS() {
  if (!module) {
    module = { exports: {} };
    const moduleFactory = modules[Object.getOwnPropertyNames(modules)[0]];
    moduleFactory(module.exports, module);
  }
  return module.exports;
};

const __toESM = (moduleValue, isNodeMode, target) => {
  target = moduleValue != null ? Object.create(Object.getPrototypeOf(moduleValue)) : {};
  __copyProps(target, moduleValue, "default");
  if (!moduleValue || !moduleValue.__esModule) Object.defineProperty(target, "default", { value: moduleValue, enumerable: true });
  return target;
};

const __copyProps = (target, source, except, descriptor) => {
  if (source && (typeof source === "object" || typeof source === "function")) {
    for (const key of Object.getOwnPropertyNames(source)) {
      if (!Object.prototype.hasOwnProperty.call(target, key) && key !== except) {
        Object.defineProperty(target, key, {
          get: () => source[key],
          enumerable: !(descriptor = Object.getOwnPropertyDescriptor(source, key)) || descriptor.enumerable
        });
      }
    }
  }
  return target;
};

const __export = (target, exports) => {
  for (const key in exports) Object.defineProperty(target, key, { get: exports[key], enumerable: true });
};

const __toCommonJS = exports => __copyProps(
  Object.defineProperty({}, "__esModule", { value: true }),
  exports
);
const esModuleMarker = { value: true };
var require_plugin = __commonJS( {
  '../work/marp-team__marpit/src/plugin.js'(pluginExports, value4) {
    const value5 = {
      value6: 'WwBn', value7: 0x289, value8: 0x4d7, value9: 0x2aa, value10: 'lP@#', value11: 0x4ae, value12: 'jh^O', value13: 'w[q*', value14: '0^DG', value15: '7kDY', value16: 'h9[U', value17: 0x4b9, value18: 0x45d, value19: '0^DG', value20: 0x44a, value21: 'LPXl', value22: 0x436, value23: 'v5n6', value24: '(W6W', value25: 0x3dd, value26: 'ln@0', value27: '6YGa', value28: 0x47e, value29: 'VWND', value30: 'D#(2', value31: 0x3c5, value32: '5KF4', value33: 0x52a, value34: 0x529
    }, value35 = {
      value36: 'h9[U', value37: 0x703, value38: ']w2S', value39: 0x7e0
    }, value40 = {
      value41: 0x17c
    }, value42 = {
    };
    value42["TEHhF"] = "Marpit plugin has detected incompatible markdown-it instance.", value42["yWvAP"] = "__esModule", value42["JTxGL"] = "default", value42["MTAmw"] = "marpitPlugin";
    const value43 = value42;
    function requireMarpitPlugin(value45) {
      const value46 = {
        value47: 0xc2, value48: '95M[', value49: '7kDY'
      }, value50 = {
        value51: 0x585
      }, value52 = {
      };
      value52["HZTld"] = value43["TEHhF"];
      const value53 = value52;
      return function(value54, ...value55) {
        const value56 = {
          value57: 0x16b
        };
        if (value54["marpit"])return value45["call"](this, value54, ...value55);
        throw new Error(value53["HZTld"]);
      };
    }
    const value58 = {
    };
    value58["value"] = true, Object["defineProperty"](value44, value43["yWvAP"], value58), Object["defineProperty"](value44, value43["JTxGL"], {
      'value': value44
    }), Object["defineProperty"](value44, value43["MTAmw"], {
      'value': value44
    }), value4["exports"] = value44;
  }
}),parse_exports = {
};
const value59 = {
};
value59["default"] = () => parse_default;
value59["parse"] = () => parseWithFrontMatter,__export(parse_exports,value59),module["exports"] = __toCommonJS(parse_exports);
var globals = Object["assign"](Object["create"](null), {
  'headingDivider': value60 => {
    const value61 = {
      value62: 'OAkQ', value63: 0x293, value64: 0xcc, value65: 'nTX8', value66: 0x2d4, value67: 'Dr7H', value68: 'ln@0', value69: 0x73, value70: ']w2S', value71: 0xb3
    }, value72 = {
      'LioGz': function(value73, value74) {
        return value73(value74);
      }, 'DOQtk': function(value75, value76) {
        return value75 === value76;
      }, 'MTsOq': "false"
    }, value77 = [1, 2, 3, 4, 5, 6], value78 = value79 => Array["isArray"](value79) || Number["isNaN"](value79) ? value79: Number["parseInt"](value79, 10), value80 = value72["LioGz"](value78, value60);
    if (Array["isArray"](value80)) {
      const value81 = value80["map"](value78);
      return {
        'headingDivider': value77["filter"](value82 => value81["includes"](value82))
      };
    }
    const value83 = {
    };
    value83["headingDivider"] = false;
    if (value72["DOQtk"](value60, value72["MTsOq"]))return value83;
    if (value77["includes"](value80))return {
      'headingDivider': value80
    };
    return {
    };
  }, 'style': value84 => ( {
    'style': value84
  }), 'theme': (value85, value86) => value86["themeSet"]["has"](value85) ? {
    'theme': value85
  }
  : {
  }, 'lang': value87 => ( {
    'lang': value87
  })
}),locals = Object["assign"](Object["create"](null), {
  'backgroundColor': value88 => ( {
    'backgroundColor': value88
  }), 'backgroundImage': value89 => ( {
    'backgroundImage': value89
  }), 'backgroundPosition': value90 => ( {
    'backgroundPosition': value90
  }), 'backgroundRepeat': value91 => ( {
    'backgroundRepeat': value91
  }), 'backgroundSize': value92 => ( {
    'backgroundSize': value92
  }), 'class': value93 => ( {
    'class': Array["isArray"](value93) ? value93["join"]('\x20'): value93
  }), 'color': value94 => ( {
    'color': value94
  }), 'footer': value95 => typeof value95 === "string" ? {
    'footer': value95
  }
  : {
  }, 'header': value96 => typeof value96 === "string" ? {
    'header': value96
  }
  : {
  }, 'paginate': value97 => {
    const value98 = {
      value99: 'OAkQ', value100: 0x4c8, value101: 'h9[U', value102: 0x708, value103: 0x5fb, value104: 0x53c, value105: 'v5n6', value106: 0x709, value107: 'PkpW', value108: ']w2S', value109: 0x4c6, value110: 'WwBn', value111: 'ln@0', value112: 0x4d1, value113: 0x59c, value114: '5KF4', value115: 0x5f3, value116: 'uTdm'
    }, value117 = {
      value118: 0x606
    }, value119 = {
    };
    value119["ZWnkk"] = function(value120, value121) {
      return value120 || value121;
    }, value119["KcXbl"] = "hold", value119["ohGgP"] = "skip", value119["TGplY"] = function(value122, value123) {
      return value122 === value123;
    }, value119["JGqTx"] = "true";
    const value124 = value119, value125 = value124["ZWnkk"](value97, '')["toLowerCase"]();
    if ([value124["KcXbl"], value124["ohGgP"]]["includes"](value125))return {
      'paginate': value125
    };
    return {
      'paginate': value124["TGplY"](value125, value124["JGqTx"])
    };
  }
}),directives_default = [...Object["keys"](globals),...Object["keys"](locals)],import_js_yaml = require("js-yaml"),createPatterns = directives => {
  const patterns = new Set();
  for (const directive of directives) {
    const escaped = "_?" + directive.replace(/[.*+?^=!:${}()|[\]\\]/g, "\\$&");
    patterns.add(escaped);
    patterns.add('\x22' + escaped + '\x22');
    patterns.add('\x27' + escaped + '\x27');
  }
  return [...patterns];
},yamlSpecialChars = "[\"'{|>~&*";
function parseYaml(value) {
  try {
    const parsed = import_js_yaml.load(value, { schema: import_js_yaml.FAILSAFE_SCHEMA });
    if (parsed === null || typeof parsed !== "object") return false;
    return parsed;
  } catch {
    return false;
  }
}
function convertLoose(source, directives) {
  const pattern = new RegExp("^(" + createPatterns(directives).join("|") + "\\s*:)(.+)$");
  return source.split(/\r?\n/).map(line => line.replace(pattern, (match, key, value) => {
    const trimmed = value.trim();
    if (trimmed.length === 0 || yamlSpecialChars.includes(trimmed[0])) return match;
    const indentation = value.length - value.trimLeft().length;
    return key + value.substring(0, indentation) + '"' + trimmed.split('"').join('\\"') + '"';
  })).join("\n").trim();
}
var yaml = (value281,value282 = false) => parseYaml(value282 ? convertLoose(value281,[...directives_default,...Array["isArray"](value282) ? value282: []]): value281),yaml_default = yaml,import_plugin = __toESM(require_plugin()),commentMatcher = /<!--+\s*([\s\S]*?)\s*--+>/,commentMatcherOpening = /^<!--/,commentMatcherClosing = /-->/,magicCommentMatchers = [/^prettier-ignore(-(start|end))?$/,/^markdownlint-((disable|enable).*|capture|restore)$/,/^lint (disable|enable|ignore).*$/];
function markAsParsed(token, value) {
  token.meta = token.meta || {};
  token.meta.marpitCommentParsed = value;
}
function parseComment(value294) {
  const value295 = {
    value296: 0x165, value297: '!ES*', value298: 0x19e, value299: 0x32, value300: '6YGa', value301: 0xb, value302: '@8Ad', value303: 0xde, value304: 0xd6, value305: 'ZrHz', value306: 0x540, value307: 0x1e8, value308: '(W6W', value309: 0x618, value310: 0x183, value311: 'vyc$', value312: 0x700, value313: 0x55d, value314: '5ajG', value315: 0x6a1, value316: 'I6e#', value317: 0x9a, value318: 'Dr7H', value319: '1M43', value320: 0x88, value321: 0x603, value322: 'e(BU', value323: 0x59, value324: 'I6e#', value325: 0x581, value326: '&!Iq', value327: 0x18, value328: 0x1ae, value329: 0x1b6, value330: '$Vco', value331: 'LPXl', value332: 0x7f, value333: 'prg1', value334: 0x59f, value335: 'ZrHz', value336: 0xf5, value337: 'w[q*', value338: '95M[', value339: 0xf5
  }, value340 = {
    value341: 0x12b, value342: 'lP@#', value343: 'g50X', value344: 'UXN]', value345: 'OAkQ', value346: 0x1d2, value347: 0x28b, value348: 0x1c3, value349: '1M43', value350: 0x2e0, value351: 0x252, value352: 0x8c, value353: '@8Ad', value354: 0x1a8, value355: 0x1f8, value356: 0x127, value357: 'w[q*', value358: 0x37, value359: 0x19b, value360: 'I6e#', value361: 0x16d, value362: 0xc4, value363: ']w2S', value364: 0x2d2, value365: 'g50X', value366: 0xe0, value367: 'PkpW', value368: 0x45, value369: 'g50X', value370: 0x28a, value371: '6YGa', value372: 0x1c7, value373: 'rink', value374: 'zx6E', value375: 'ln@0', value376: 0x254, value377: 0x40
  }, value378 = {
    value379: 'OGGg', value380: '&kl%', value381: 0x3b3, value382: 'zx6E', value383: 'J(Uy', value384: 0x5ee, value385: 'g50X', value386: 0x714, value387: 'kigD', value388: 0x48b, value389: '&kl%', value390: 0x56f, value391: 'uTdm', value392: 'g50X', value393: 0x5f2, value394: 'uTdm', value395: '$2nZ', value396: 'Um9b', value397: 'wQTj', value398: 0x2dd, value399: 0x17d, value400: 0x453, value401: 'prg1', value402: 0x427, value403: 0x66f, value404: 0x4cc, value405: 'nTX8', value406: 0x410, value407: 'I6e#', value408: 0x5aa, value409: 'v5n6', value410: 0x182, value411: 0x1a5, value412: '5KF4', value413: 0x5f6, value414: 'D#(2', value415: 0x42c, value416: 'ZrHz', value417: 0x4b7, value418: 0x5d1, value419: 0x451, value420: 0x442, value421: 'Kl9(', value422: 0x3a4, value423: 0x5f8, value424: ']w2S', value425: 0x579, value426: '&!Iq', value427: 'AstC', value428: 0x3ca, value429: 'VWND', value430: 0x3aa, value431: 0x3d4, value432: 0x604, value433: 0x6f6, value434: 'WwBn', value435: 'Dr7H', value436: 0x478, value437: '$2nZ', value438: 0x1c5, value439: '5ajG', value440: 0x393, value441: 0x560, value442: 'PkpW', value443: 0x1cc, value444: 0x24d
  }, value445 = {
    value446: 'g50X', value447: 0x745
  }, value448 = {
    value449: 0x1fc
  }, value450 = {
    value451: 'wQTj', value452: 0x3a0, value453: 'jh^O', value454: 0x24c, value455: 'uTdm', value456: 0x2dd, value457: 0x4c7, value458: 0x451, value459: 'OAkQ', value460: 0x341, value461: 0x391, value462: '5KF4', value463: 0x3a3, value464: 'D#(2', value465: 'kigD', value466: 'ZrHz', value467: 0x435, value468: '1M43', value469: 0x367, value470: 0x399, value471: '6YGa', value472: 'OGGg', value473: 0x28e, value474: '&!Iq', value475: 0x3f2, value476: 'prg1', value477: 'J(Uy', value478: 0x210, value479: '&!Iq', value480: 0x305, value481: 'ln@0', value482: 0x2b7, value483: 0x46d, value484: '95M[', value485: 0x24b, value486: 0x593, value487: 'AstC', value488: 0x221, value489: 'Kl9(', value490: 'I6e#', value491: 0x1d9, value492: 0x440, value493: 0x357
  }, value494 = {
    value495: 0x4b9
  }, value496 = {
    value497: 0x3e0
  }, value498 = {
    'WiDYv': function(value499, value500) {
      return value499(value500);
    }, 'pCcWu': function(value501, value502, value503) {
      return value501(value502, value503);
    }, 'Kewal': "directive", 'QbwFf': function(value504, value505) {
      return value504(value505);
    }, 'RdMKY': function(value506, value507) {
      return value506(value507);
    }, 'WQxxQ': function(value508, value509, value510) {
      return value508(value509, value510);
    }, 'paCko': function(value511, value512) {
      return value511 !== value512;
    }, 'vUOXY': "Mptbr", 'rdfLm': function(value513, value514, value515) {
      return value513(value514, value515);
    }, 'BAXLY': function(value516, value517) {
      return value516 === value517;
    }, 'hIvMM': function(value518, value519) {
      return value518 !== value519;
    }, 'nSwks': "kVKso", 'ahjUC': "eAYxQ", 'KEWCM': function(value520, value521, value522) {
      return value520(value521, value522);
    }, 'PBkOP': "well-known-magic-comment", 'QytEH': function(value523, value524) {
      return value523 !== value524;
    }, 'IUJMH': "object", 'hsxVd': function(value525, value526) {
      return value525 || value526;
    }, 'yJcTB': "hold", 'WTJgp': "skip", 'hWaFj': "true", 'uxkaH': function(value527, value528) {
      return value527 === value528;
    }, 'UBiuC': "false", 'xRtDQ': function(value529, value530) {
      return value529 !== value530;
    }, 'MNmSv': "CRoGw", 'qIzfN': function(value531, value532) {
      return value531 + value532;
    }, 'kfhEQ': function(value533, value534) {
      return value533 !== value534;
    }, 'pyPzQ': function(value535, value536) {
      return value535 + value536;
    }, 'ZCDNr': function(value537, value538) {
      return value537 !== value538;
    }, 'EFcPf': "KvOek", 'lHHMd': function(value539, value540) {
      return value539 < value540;
    }, 'xqDWB': function(value541, value542) {
      return value541 !== value542;
    }, 'NPtJm': "RvTug", 'MFNAg': "jTIjw", 'YwiZp': function(value543, value544) {
      return value543 < value544;
    }, 'HGGqT': function(value545, value546) {
      return value545 + value546;
    }, 'yWdya': "marpit_comment", 'huZiE': function(value547, value548, value549) {
      return value547(value548, value549);
    }, 'fdwKF': function(value550, value551) {
      return value550(value551);
    }, 'ZSXsy': function(value552, value553, value554, value555) {
      return value552(value553, value554, value555);
    }, 'jnqsY': function(value556, value557, value558) {
      return value556(value557, value558);
    }, 'hKEUm': function(value559, value560) {
      return value559 !== value560;
    }, 'dsZHc': "QqbNZ", 'XyCuy': "arZdC", 'PpShd': function(value561, value562) {
      return value561 >= value562;
    }, 'qYWYq': function(value563, value564) {
      return value563 + value564;
    }, 'cGaaS': function(value565, value566, value567) {
      return value565(value566, value567);
    }, 'Ncrab': "html_block", 'VRoTe': "html_inline", 'dYRgY': "marpit_inline_comment"
  };
  const value568 = (value569, value570) => {
    const value571 = {
      value572: 0x21
    }, value573 = {
      value574: 'wQTj', value575: 0x106
    }, value576 = {
      value577: 0x306
    }, value578 = {
      'FHKwK': function(value579, value580) {
        return value498["QbwFf"](value579, value580);
      }, 'PFiYD': function(value581, value582) {
        return value498["RdMKY"](value581, value582);
      }, 'iRawN': function(value583, value584, value585) {
        return value498["WQxxQ"](value583, value584, value585);
      }, 'uDMVC': value498["Kewal"]
    };
    if (value498["paCko"](value498["vUOXY"], value498["vUOXY"]))for (const value586 of value587["children"]) {
      if (value498["WiDYv"](value588, value586) && value498["WiDYv"](value589, value586["meta"]["marpitParsedDirectives"]))value498["pCcWu"](value590, value586, value498["Kewal"]);
    } else {
      const value591 = value498["rdfLm"](yaml, value570, ! ! value294["marpit"]["options"]["looseYAML"]);
      value569["meta"] = value569["meta"] || {
      }, value569["meta"]["marpitParsedDirectives"] = value498["BAXLY"](value591, false) ? {
      }
      : value591;
      for (const value592 of magicCommentMatchers) {
        if (value592["test"](value570["trim"]())) {
          if (value498["hIvMM"](value498["nSwks"], value498["ahjUC"])) {
            value498["KEWCM"](markAsParsed, value569, value498["PBkOP"]);
            break;
          } else {
            if (value578["FHKwK"](value593, value594) && value578["PFiYD"](value595, value596["meta"]["marpitParsedDirectives"]))value578["iRawN"](value597, value598, value578["uDMVC"]);
          }
        }
      }
    }
  };
  value294["block"]["ruler"]["before"](value498["Ncrab"], value498["yWdya"], (value599, value600, value601, value602) => {
    const value603 = {
      value604: 0x309
    }, value605 = {
      value606: 0x2d1
    };
    const value607 = {
      'UiRPc': function(value608, value609) {
        return value498["WiDYv"](value608, value609);
      }, 'MWyCT': function(value610, value611) {
        return value498["uxkaH"](value610, value611);
      }, 'sLIaN': value498["UBiuC"]
    };
    if (value498["xRtDQ"](value498["MNmSv"], value498["MNmSv"])) {
      const value612 = [1, 2, 3, 4, 5, 6], value613 = value614 => value615["isArray"](value614) || value616["isNaN"](value614) ? value614: value617["parseInt"](value614, 10), value618 = urrHLP["UiRPc"](value613, value619);
      if (value620["isArray"](value618)) {
        const value621 = value618["map"](value613);
        return {
          'headingDivider': value612["filter"](value622 => value621["includes"](value622))
        };
      }
      const value623 = {
      };
      value623["headingDivider"] = false;
      if (urrHLP["MWyCT"](value624, urrHLP["sLIaN"]))return value623;
      if (value612["includes"](value618))return {
        'headingDivider': value618
      };
      return {
      };
    } else {
      let value625 = value498["qIzfN"](value599["bMarks"][value600], value599["tShift"][value600]);
      if (value498["kfhEQ"](value599["src"]["charCodeAt"](value625), 60))returnfalse;
      let value626 = value599["eMarks"][value600], value627 = value599["src"]["slice"](value625, value626);
      if (! commentMatcherOpening["test"](value627))returnfalse;
      if (value602)returntrue;
      let value628 = value498["pyPzQ"](value600, 1);
      if (! commentMatcherClosing["test"](value627)) {
        if (value498["ZCDNr"](value498["EFcPf"], value498["EFcPf"])) {
          const value629 = {
          };
          value629["schema"] = value630["FAILSAFE_SCHEMA"];
          const value631 = (0, value632["load"])(value633, value629);
          if (yvNDjI["BAXLY"](value631, null) || yvNDjI["QytEH"](typeof value631, yvNDjI["IUJMH"]))returnfalse;
          return value631;
        } else while (value498["lHHMd"](value628, value601)) {
          if (value498["xqDWB"](value498["NPtJm"], value498["MFNAg"])) {
            if (value498["YwiZp"](value599["sCount"][value628], value599["blkIndent"]))break;
            value625 = value498["HGGqT"](value599["bMarks"][value628], value599["tShift"][value628]), value626 = value599["eMarks"][value628], value627 = value599["src"]["slice"](value625, value626), value628 += 1;
            if (commentMatcherClosing["test"](value627))break;
          } else {
            const value634 = yvNDjI["hsxVd"](value635, '')["toLowerCase"]();
            if ([yvNDjI["yJcTB"], yvNDjI["WTJgp"]]["includes"](value634))return {
              'paginate': value634
            };
            return {
              'paginate': yvNDjI["BAXLY"](value634, yvNDjI["hWaFj"])
            };
          }
        }
      }
      value599["line"] = value628;
      const value636 = value599["push"](value498["yWdya"], '', 0);
      value636["map"] = [value600, value628], value636["markup"] = value599["getLines"](value600, value628, value599["blkIndent"], true), value636["hidden"] = true;
      const value637 = commentMatcher["exec"](value636["markup"]);
      return value636["content"] = value637 ? value637[1]["trim"](): '', value498["huZiE"](value568, value636, value636["content"]), true;
    }
  }), value294["inline"]["ruler"]["before"](value498["VRoTe"], value498["dYRgY"], (value638, value639) => {
    const value640 = {
      value641: 0x512
    };
    if (value498["hKEUm"](value498["dsZHc"], value498["XyCuy"])) {
      const {
        posMax: value642, src: value643
      }
       = value638;
      if (value498["PpShd"](value498["qIzfN"](value638["pos"], 2), value642) || value498["xRtDQ"](value643["charCodeAt"](value638["pos"]), 60) || value498["ZCDNr"](value643["charCodeAt"](value498["HGGqT"](value638["pos"], 1)), 33))returnfalse;
      const value644 = value643["slice"](value638["pos"])["match"](commentMatcher);
      if (! value644)returnfalse;
      if (! value639) {
        const value645 = value638["push"](value498["yWdya"], '', 0);
        value645["hidden"] = true, value645["markup"] = value643["slice"](value638["pos"], value498["qYWYq"](value638["pos"], value644[0]["length"])), value645["content"] = value644[1]["trim"](), value498["cGaaS"](value568, value645, value645["content"]);
      }
      return value638["pos"]+= value644[0]["length"], true;
    } else {
      for (let value646 of yvNDjI["fdwKF"](value647, value648))if (! value649["call"](value650, value646) && yvNDjI["QytEH"](value646, value651))yvNDjI["ZSXsy"](value652, value653, value646, {
        'get': () => value654[value646], 'enumerable': !(value655 = yvNDjI["jnqsY"](value656, value657, value646)) || value658["enumerable"]
      });
    }
  });
}
var comment = (0,import_plugin["default"])(parseComment),comment_default = comment,import_markdown_it_front_matter = __toESM(require("markdown-it-front-matter")),import_plugin2 = __toESM(require_plugin()),isDirectiveComment = value659 => value659["type"] === "marpit_comment" && value659["meta"]["marpitParsedDirectives"];
function parseMarkdown(value660,value661 = {
}) {
  const value662 = {
    value663: 0x67d, value664: '!ES*', value665: '5KF4', value666: 0xb, value667: 0x64f, value668: 'D#(2', value669: 0x14b, value670: 'VWND', value671: 0x484, value672: '!ES*', value673: 0x6e, value674: 'w[q*', value675: 0x3a8, value676: '5ajG', value677: 0x536, value678: 0x520, value679: 'p16)', value680: '1M43', value681: 0x148, value682: 0x632, value683: 'ZrHz', value684: 0x1e6, value685: 0xd5, value686: 'vyc$', value687: 0xe2, value688: 'UXN]', value689: 'YSD%', value690: 0x74, value691: 0x3cb, value692: '58VR', value693: '$2nZ', value694: 0x81, value695: 'jh^O', value696: 'kigD', value697: 0x69d, value698: 0x1a7, value699: 0xf7, value700: 'rink', value701: 0x3c9, value702: 'ZrHz', value703: 0x43d, value704: 'prg1', value705: 'YSD%', value706: 0x9a, value707: 'e(BU', value708: 0x57, value709: 0x190, value710: 0x118, value711: 0x47, value712: 0x1f4, value713: 0x602, value714: 0x3ae, value715: 0x58f, value716: '0^DG', value717: 0x171, value718: 0xe4, value719: 0x639, value720: 'ln@0', value721: 0x61b, value722: 'Kl9(', value723: 0x50, value724: 0x14f, value725: 0x17b, value726: 0x111, value727: 'ZrHz', value728: 'g50X', value729: 0x3c4, value730: '0^DG', value731: 0x58d, value732: 0x47e, value733: 0x59
  }, value734 = {
    value735: 0x128, value736: 0x3d6, value737: 0x656, value738: 0x3ee, value739: 'WwBn', value740: '5Bn]', value741: 0x3e9, value742: 0x11d, value743: 'ZrHz', value744: 0x68e, value745: 'rink', value746: 0x115, value747: 0x50f, value748: '@8Ad', value749: 'OGGg', value750: '$2nZ', value751: 0x444, value752: '5KF4', value753: 0x469, value754: 0x3dc, value755: 'ln@0', value756: 'LPXl', value757: 0x65f, value758: 0x17f, value759: 0x443, value760: 0x16e, value761: 0x47a, value762: 'D#(2', value763: 0x3b, value764: 0x4aa, value765: 0x572, value766: 'Kl9(', value767: 0x546, value768: '(W6W', value769: 0x6d1, value770: 0x90, value771: 0x3c, value772: 0x4e8, value773: 0x45e, value774: 'w[q*', value775: 0x4d0, value776: 0x112, value777: 'zx6E', value778: 0x5e2, value779: 'VWND', value780: 0x89, value781: '7kDY', value782: 'UXN]', value783: 0xa2, value784: '!ES*', value785: 'jh^O', value786: 0x492, value787: 0x4, value788: '5ajG', value789: 0xc, value790: '0^DG', value791: 0x4cc, value792: '1M43', value793: 0x5ca, value794: 0x1d, value795: 'v5n6', value796: 0xff, value797: 'UXN]', value798: 'jh^O', value799: 0x1d2, value800: 'vyc$', value801: 'h9[U', value802: 0x3d7, value803: 0x5b2, value804: 'jh^O', value805: 'p16)', value806: 'Um9b', value807: 0x68b, value808: 'nTX8', value809: 0x63b, value810: 0x570, value811: 'UXN]', value812: 0x45, value813: 'g50X', value814: 0x10d, value815: 0x77, value816: 0x8a, value817: 0xdc, value818: 'prg1', value819: '95M[', value820: 0x43, value821: 0x1ca, value822: 0x602, value823: 0x59b, value824: 0xa6, value825: 0xbf, value826: 0x9e, value827: '6YGa', value828: 0x3b8, value829: 0xc1, value830: 'Dr7H', value831: 0x151, value832: 0xd8, value833: 0x58, value834: '7kDY', value835: 0x11e, value836: 'vyc$', value837: 'YSD%', value838: 0x623, value839: 0x1a, value840: 0x3ec, value841: '@8Ad', value842: 0x64a, value843: 0x3b, value844: 'WwBn', value845: 0x46d, value846: '!ES*', value847: 'rink', value848: 0x175, value849: 0x582
  }, value850 = {
    value851: 0x2c3
  }, value852 = {
    value853: 0x32c, value854: ']w2S'
  }, value855 = {
    value856: 'OGGg'
  }, value857 = {
    value858: 0x4b
  }, value859 = {
    value860: 'OAkQ'
  }, value861 = {
    value862: '5ajG'
  }, value863 = {
    value864: 0x2e3
  }, value865 = {
    value866: '58VR', value867: 0x5d7, value868: '7kDY', value869: '5ajG', value870: 'lP@#', value871: 'D#(2', value872: 0x599, value873: 0x652, value874: 0x540, value875: 0x1a5, value876: 0x4f8, value877: 0x11b, value878: 0x786, value879: 'Um9b', value880: 0x797, value881: 'WwBn', value882: 'e(BU', value883: 0x63b, value884: 'ln@0', value885: 'VWND', value886: 0x6c3, value887: 0x609, value888: 'prg1', value889: 0x101, value890: 0x159, value891: '!ES*', value892: 'w[q*', value893: 0x5ac, value894: 0x790, value895: 'ln@0', value896: 0x7e6, value897: '7kDY', value898: 'vyc$', value899: 0x7b9, value900: 0xab, value901: 'YSD%'
  }, value902 = {
    value903: 0x4af, value904: 'UXN]', value905: 0x1b6, value906: 0x51c, value907: 0x1af, value908: 'Dr7H', value909: 'e(BU', value910: 0x39c, value911: '$Vco', value912: 0x466, value913: 0x3e7, value914: 'w[q*', value915: 'AstC', value916: 0xa7, value917: 0x530, value918: 0x199, value919: 'wQTj', value920: 0x20f, value921: 'OGGg', value922: 0x494
  }, value923 = {
    value924: 'OAkQ', value925: 0x3c1
  }, value926 = {
    value927: 'wQTj', value928: 0x4db, value929: 0x39d, value930: 'YSD%', value931: 'PkpW', value932: 0x493, value933: '(W6W', value934: 'vyc$', value935: '5Bn]', value936: 0x5f2, value937: 0x41b, value938: '0^DG', value939: 0x589, value940: 'OAkQ', value941: 0x3dc, value942: 'J(Uy', value943: 0x6b6, value944: 0x58f, value945: 0x391, value946: 0x5a1
  }, value947 = {
    value948: 0x3aa, value949: 'WwBn'
  }, value950 = {
    value951: 0xdc, value952: 0x1f9, value953: 'VWND', value954: 0x155
  }, value955 = {
    value956: 0x3a5
  }, value957 = {
    value958: '@8Ad', value959: '$2nZ', value960: 0x1e3, value961: 'zx6E', value962: 0xc8, value963: 'nTX8', value964: 0x2e6, value965: '@8Ad', value966: 0x54
  }, value967 = {
    value968: 0x16
  }, value969 = {
    'kMhEi': "Marpit plugin has detected incompatible markdown-it instance.", 'VXzvt': function(value970, value971) {
      return value970 === value971;
    }, 'DRBjp': "DvIuW", 'zMUFs': "IVWqT", 'uFmeP': function(value972, value973, value974) {
      return value972(value973, value974);
    }, 'YbewF': function(value975, value976) {
      return value975 + value976;
    }, 'UonkS': "\\$&", 'NxAci': "LYOHt", 'ywHoz': "ZGSAg", 'uUtGO': function(value977, value978, value979) {
      return value977(value978, value979);
    }, 'xdcxm': function(value980, value981) {
      return value980 !== value981;
    }, 'rhfpp': function(value982, value983, value984, value985) {
      return value982(value983, value984, value985);
    }, 'CAunm': function(value986, value987) {
      return value986 === value987;
    }, 'REIcP': "object", 'TKshH': "ITodo", 'IPMah': function(value988, value989) {
      return value988 === value989;
    }, 'MgyZx': "dQukV", 'mGOFv': function(value990, value991) {
      return value990 === value991;
    }, 'wFCZK': "HPqLn", 'QXqnH': "HOciE", 'OlTau': function(value992, value993) {
      return value992(value993);
    }, 'ZfHPv': function(value994, value995, value996) {
      return value994(value995, value996);
    }, 'JwQNN': "directive", 'YgxQn': "inline", 'xdfhO': "ngpiw", 'diurT': function(value997, value998) {
      return value997(value998);
    }, 'fNpAu': function(value999, value1000, value1001) {
      return value999(value1000, value1001);
    }, 'OzYGO': function(value1002, value1003) {
      return value1002 - value1003;
    }, 'OuiBf': function(value1004, value1005) {
      return value1004(value1005);
    }, 'keAtn': function(value1006, value1007, value1008) {
      return value1006(value1007, value1008);
    }, 'zLbpX': "GaUOX", 'sJKsx': "Scuxk", 'gWNLs': function(value1009, value1010) {
      return value1009 !== value1010;
    }, 'qorXZ': "IyjGS", 'jKxiB': "XxMYB", 'aKakK': "dKcfW", 'NGDjE': "tahFe", 'kSMUA': "nuXyg", 'fiewI': "gWnul", 'WLFMc': function(value1011, value1012) {
      return value1011 >= value1012;
    }, 'BQiUA': function(value1013, value1014) {
      return value1013 + value1014;
    }, 'GTosZ': function(value1015, value1016) {
      return value1015 + value1016;
    }, 'ciagN': "marpit_comment", 'KFjrF': function(value1017, value1018) {
      return value1017 + value1018;
    }, 'czGvy': function(value1019, value1020) {
      return value1019 === value1020;
    }, 'zJjjo': function(value1021, value1022) {
      return value1021 !== value1022;
    }, 'SbpUa': "eooqS", 'tZtZc': "bqcFe", 'jTnSW': function(value1023, value1024) {
      return value1023 === value1024;
    }, 'MFJsB': function(value1025, value1026) {
      return value1025 !== value1026;
    }, 'CNCWo': "cDSdj", 'QPpIn': function(value1027, value1028) {
      return value1027(value1028);
    }, 'vnQMm': function(value1029, value1030) {
      return value1029 === value1030;
    }, 'YIODG': "MYICp", 'upnvz': "NluAe", 'wuZDG': function(value1031, value1032, value1033) {
      return value1031(value1032, value1033);
    }, 'VkxrZ': function(value1034, value1035) {
      return value1034(value1035);
    }, 'YIUvK': function(value1036, value1037, value1038) {
      return value1036(value1037, value1038);
    }, 'DMRkp': function(value1039, value1040) {
      return value1039 === value1040;
    }, 'orPux': "aDKPZ", 'UnFfc': "PmFXT", 'nwxdE': "block", 'mviQE': "marpit_directives_front_matter", 'bzFqF': "marpit_directives_global_parse", 'njmUo': "marpit_slide", 'WdRIn': "marpit_directives_parse"
  }, {
    marpit: value1041
  }
   = value660, value1042 = (value1043, value1044) => {
    if (value969["VXzvt"](value969["DRBjp"], value969["DRBjp"])) {
      let value1045 = {
      };
      for (const value1046 of Object["keys"](value1043)) {
        if (value969["VXzvt"](value969["zMUFs"], value969["zMUFs"]))value1044[value1046] ? value1045 = {
          ...value1045, ...value1044[value1046](value1043[value1046], value1041)
        }
        : value1045[value1046] = value1043[value1046];
        else {
          const value1047 = {
            value1048: 0x113, value1049: 0x12b
          }, value1050 = {
          };
          value1050["uMjbZ"] = IdWvwF["kMhEi"];
          const value1051 = value1050;
          return function(value1052, ...value1053) {
            const value1054 = {
              value1055: 0x4f
            }, value1056 = {
              value1057: 0x291
            };
            if (value1052["marpit"])return value1058["call"](this, value1052, ...value1053);
            throw new value1059(value1051["uMjbZ"]);
          };
        }
      }
      return value1045;
    } else value1060 = {
      ...value1061, ...value1062[value1063](value1064[value1065], value1066)
    };
  }, value1067 = value969["vnQMm"](value661["frontMatter"], void(0)) ? true: ! ! value661["frontMatter"];
  let value1068 = {
  };
  value1067 && (value969["DMRkp"](value969["orPux"], value969["UnFfc"]) ? (value1069 = true, value1070["local"] = {
    ...value1071["local"], ...value969["uFmeP"](value1072, value1073["customDirectives"]["local"][value1074](value1075[value1076], value1077), value1078)
  }): (value660["core"]["ruler"]["before"](value969["nwxdE"], value969["mviQE"], value1079 => {
    value1068 = {
    };
    if (! value1079["inlineMode"])value1041["lastGlobalDirectives"] = {
    };
  }), value660["use"](import_markdown_it_front_matter["default"], value1080 => {
    const value1081 = {
      'cscBy': function(value1082, value1083) {
        const value1084 = {
          value1085: 0x15b
        };
        return value969["YbewF"](value1082, value1083);
      }, 'xulbY': value969["UonkS"]
    };
    if (value969["VXzvt"](value969["NxAci"], value969["ywHoz"])) {
      const value1086 = new value1087();
      for (const value1088 of value1089) {
        const value1090 = aFuEYe["cscBy"]('_?', value1088["replace"](/[.*+?^=!:${}()|[\]\\/]/g, aFuEYe["xulbY"]));
        value1086["add"](value1090), value1086["add"]('\x22' + value1090 + '\x22'), value1086["add"]('\x27' + value1090 + '\x27');
      }
      return[...value1086["values"]()];
    } else {
      value1068["text"] = value1080;
      const value1091 = value969["uUtGO"](yaml, value1080, value1041["options"]["looseYAML"] ? [...Object["keys"](value1041["customDirectives"]["global"]), ...Object["keys"](value1041["customDirectives"]["local"])]: false);
      if (value969["xdcxm"](value1091, false))value1068["yaml"] = value1091;
    }
  })));
  value660["core"]["ruler"]["after"](value969["YgxQn"], value969["bzFqF"], value1092 => {
    const value1093 = {
      value1094: 0x371
    }, value1095 = {
      value1096: 0xa6
    }, value1097 = {
      value1098: 0x2ad
    };
    const value1099 = {
      'pBAbp': function(value1100, value1101, value1102, value1103) {
        const value1104 = {
          value1105: 0x1fe
        };
        return value969["rhfpp"](value1100, value1101, value1102, value1103);
      }, 'kPrEC': function(value1106, value1107, value1108) {
        return value969["uUtGO"](value1106, value1107, value1108);
      }, 'hFLog': function(value1109, value1110) {
        return value969["CAunm"](value1109, value1110);
      }, 'ZOoEM': function(value1111, value1112) {
        return value969["xdcxm"](value1111, value1112);
      }, 'RHBCY': value969["REIcP"], 'XJmyD': value969["TKshH"], 'vWDxd': function(value1113, value1114) {
        const value1115 = {
          value1116: 0x393
        };
        return value969["IPMah"](value1113, value1114);
      }, 'DwSBC': value969["MgyZx"], 'UPybP': function(value1117, value1118, value1119) {
        const value1120 = {
          value1121: 0x288
        };
        return value969["uFmeP"](value1117, value1118, value1119);
      }
    };
    if (value969["mGOFv"](value969["wFCZK"], value969["QXqnH"])) {
      for (var value1122 in value1123)kpAzPa["pBAbp"](value1124, value1125, value1122, {
        'get': value1126[value1122], 'enumerable': true
      });
    } else {
      if (value1092["inlineMode"])return;
      let value1127 = {
      };
      const value1128 = value1129 => {
        const value1130 = {
          value1131: '@8Ad'
        }, value1132 = {
          'zWGmW': function(value1133, value1134) {
            return value1099["hFLog"](value1133, value1134);
          }, 'tSrQI': function(value1135, value1136) {
            const value1137 = {
              value1138: 0x1c4
            };
            return value1099["ZOoEM"](value1135, value1136);
          }, 'NgWag': value1099["RHBCY"]
        };
        let value1139 = false;
        for (const value1140 of Object["keys"](value1129)) {
          if (globals[value1140]) {
            if (value1099["ZOoEM"](value1099["XJmyD"], value1099["XJmyD"])) {
              if (value1141[value1142])value1143 = true, value1144 = {
                ...value1145, ...value1146[value1147](value1148[value1149], value1150)
              };
              else value1151["customDirectives"]["global"][value1152] && (value1153 = true, value1154 = {
                ...value1155, ...value1099["kPrEC"](value1156, value1157["customDirectives"]["global"][value1158](value1159[value1160], value1161), value1162)
              });
            } else value1139 = true, value1127 = {
              ...value1127, ...globals[value1140](value1129[value1140], value1041)
            };
          } else {
            if (value1041["customDirectives"]["global"][value1140]) {
              if (value1099["vWDxd"](value1099["DwSBC"], value1099["DwSBC"]))value1139 = true, value1127 = {
                ...value1127, ...value1099["UPybP"](value1042, value1041["customDirectives"]["global"][value1140](value1129[value1140], value1041), globals)
              };
              else try {
                const value1163 = {
                };
                value1163["schema"] = value1164["FAILSAFE_SCHEMA"];
                const value1165 = (0, value1166["load"])(value1167, value1163);
                if (pnMCss["zWGmW"](value1165, null) || pnMCss["tSrQI"](typeof value1165, pnMCss["NgWag"]))returnfalse;
                return value1165;
              } catch {
                returnfalse;
              }
            }
          }
        }
        return value1139;
      };
      if (value1068["yaml"])value969["OlTau"](value1128, value1068["yaml"]);
      for (const value1168 of value1092["tokens"]) {
        if (value969["OlTau"](isDirectiveComment, value1168) && value969["OlTau"](value1128, value1168["meta"]["marpitParsedDirectives"]))value969["ZfHPv"](markAsParsed, value1168, value969["JwQNN"]);
        else {
          if (value969["CAunm"](value1168["type"], value969["YgxQn"])) {
            if (value969["mGOFv"](value969["xdfhO"], value969["xdfhO"]))for (const value1169 of value1168["children"]) {
              if (value969["diurT"](isDirectiveComment, value1169) && value969["diurT"](value1128, value1169["meta"]["marpitParsedDirectives"]))value969["fNpAu"](markAsParsed, value1169, value969["JwQNN"]);
            } else returnfalse;
          }
        }
      }
      const value1170 = {
        ...value1127
      };
      value1041["lastGlobalDirectives"] = value1170;
    }
  });
  value660["core"]["ruler"]["after"](value969["njmUo"], value969["WdRIn"], value1171 => {
    const value1172 = {
      value1173: 0x1f3, value1174: 'h9[U', value1175: 0x1ec, value1176: 0x4ca, value1177: '1M43', value1178: 0x170, value1179: 'vyc$', value1180: 0x5d, value1181: 'Dr7H', value1182: 0x92, value1183: 0x18d, value1184: '$2nZ', value1185: 0x46d, value1186: 'nTX8', value1187: 'PkpW', value1188: 0x276, value1189: '95M[', value1190: 0x2a1, value1191: 'OGGg', value1192: 0x264, value1193: '5KF4', value1194: 'rink', value1195: 0xc8, value1196: 0x7, value1197: '5ajG', value1198: 0xb7, value1199: 0x1e0, value1200: 0x2c3, value1201: 0x537, value1202: 'D#(2', value1203: 0xd7, value1204: 0x41, value1205: 0x18e, value1206: 'zx6E', value1207: '1M43', value1208: 0x4e9, value1209: '$Vco', value1210: 0x2e1, value1211: 'ZrHz', value1212: '&kl%', value1213: 0x60, value1214: 'v5n6', value1215: 0x16d, value1216: 'ln@0', value1217: 0xfa, value1218: 'Um9b', value1219: '&!Iq', value1220: 0x353, value1221: 0x1d2, value1222: 0x17, value1223: 'prg1', value1224: 0x30, value1225: 'Kl9(', value1226: 0x11d, value1227: 0x415, value1228: 0x3d6, value1229: 0x49a, value1230: '(W6W', value1231: 0x484, value1232: 'wQTj', value1233: 0x20d, value1234: '0^DG', value1235: 0x28f, value1236: 0x245, value1237: 0x466, value1238: 'vyc$', value1239: '&!Iq', value1240: '&kl%', value1241: 0x362, value1242: 'PkpW', value1243: 0x1c7, value1244: 0xd, value1245: 0x34e
    }, value1246 = {
      value1247: 'AstC'
    }, value1248 = {
      value1249: 0x638, value1250: 'WwBn'
    }, value1251 = {
      value1252: 'v5n6'
    }, value1253 = {
      value1254: 'lP@#'
    }, value1255 = {
      value1256: 0x10c
    }, value1257 = {
      value1258: 'prg1'
    }, value1259 = {
      value1260: 0x7d
    }, value1261 = {
      'uEFyU': function(value1262, value1263) {
        return value969["OlTau"](value1262, value1263);
      }, 'yetVc': function(value1264, value1265, value1266) {
        return value969["ZfHPv"](value1264, value1265, value1266);
      }, 'fnqEv': function(value1267, value1268) {
        return value969["mGOFv"](value1267, value1268);
      }, 'XFNZO': function(value1269, value1270) {
        return value969["OzYGO"](value1269, value1270);
      }, 'fzsbw': function(value1271, value1272) {
        const value1273 = {
          value1274: 0x9f
        };
        return value969["OuiBf"](value1271, value1272);
      }, 'nrBGf': function(value1275, value1276, value1277) {
        return value969["keAtn"](value1275, value1276, value1277);
      }, 'EOPTV': function(value1278, value1279) {
        const value1280 = {
          value1281: 0x1e9
        };
        return value969["CAunm"](value1278, value1279);
      }, 'rRzkv': value969["zLbpX"], 'OduRE': value969["sJKsx"], 'hSVLa': function(value1282, value1283) {
        const value1284 = {
          value1285: 0x52
        };
        return value969["gWNLs"](value1282, value1283);
      }, 'HbhMI': value969["qorXZ"], 'RumuY': value969["jKxiB"], 'fRryN': value969["aKakK"], 'CcvqF': function(value1286, value1287) {
        const value1288 = {
          value1289: 0x135
        };
        return value969["gWNLs"](value1286, value1287);
      }, 'nyriI': value969["NGDjE"], 'cPzJP': value969["kSMUA"], 'rWhaB': value969["fiewI"], 'AZfYJ': function(value1290, value1291) {
        const value1292 = {
          value1293: 0xd8
        };
        return value969["WLFMc"](value1290, value1291);
      }, 'lMOqs': function(value1294, value1295) {
        return value969["BQiUA"](value1294, value1295);
      }, 'uNHXm': function(value1296, value1297) {
        return value969["GTosZ"](value1296, value1297);
      }, 'feQIV': value969["ciagN"], 'gClUT': function(value1298, value1299) {
        const value1300 = {
          value1301: 0x442
        };
        return value969["KFjrF"](value1298, value1299);
      }, 'GkFlq': function(value1302, value1303, value1304) {
        return value969["uUtGO"](value1302, value1303, value1304);
      }
    };
    if (value1171["inlineMode"])return;
    const value1305 = [], value1306 = {
    };
    value1306["slide"] = void(0), value1306["local"] = {
    };
    value1306["spot"] = {
    };
    const value1307 = value1306, value1308 = value1309 => {
      const value1310 = {
        value1311: '$Vco', value1312: 0x5c9, value1313: 0x685, value1314: 'WwBn', value1315: '(W6W', value1316: 'uTdm', value1317: 0x6e0, value1318: '5Bn]', value1319: 0x65b
      };
      const value1320 = {
        'wrNRw': function(value1321, value1322, value1323) {
          return value1261["nrBGf"](value1321, value1322, value1323);
        }
      };
      if (value1261["EOPTV"](value1261["rRzkv"], value1261["OduRE"])) {
        const value1324 = {
        };
        return value1324["exports"] = {
        }, (value1325 || (0, value1326[uWjmzO["uEFyU"](value1327, value1328)[0]])((value1329 = value1324)["exports"], value1330), value1331["exports"]);
      } else {
        let value1332 = false;
        for (const value1333 of Object["keys"](value1309)) {
          if (value1261["hSVLa"](value1261["HbhMI"], value1261["RumuY"])) {
            if (locals[value1333])value1332 = true, value1307["local"] = {
              ...value1307["local"], ...locals[value1333](value1309[value1333], value1041)
            };
            else value1041["customDirectives"]["local"][value1333] && (value1261["hSVLa"](value1261["fRryN"], value1261["fRryN"]) ? (value1334 = true, value1335["spot"] = {
              ...value1336["spot"], ...value1261["yetVc"](value1337, value1338["customDirectives"]["local"][value1339](value1340[value1341], value1342), value1343)
            }): (value1332 = true, value1307["local"] = {
              ...value1307["local"], ...value1261["nrBGf"](value1042, value1041["customDirectives"]["local"][value1333](value1309[value1333], value1041), locals)
            }));
            if (value1333["startsWith"]('_')) {
              const value1344 = value1333["slice"](1);
              if (locals[value1344]) {
                if (value1261["CcvqF"](value1261["nyriI"], value1261["nyriI"])) {
                  const value1345 = {
                    'piaVA': function(value1346, value1347) {
                      return uWjmzO["fnqEv"](value1346, value1347);
                    }, 'xXuOg': function(value1348, value1349) {
                      return uWjmzO["XFNZO"](value1348, value1349);
                    }
                  }, value1350 = "(?:" + uWjmzO["fzsbw"](value1351, value1352)["join"]('|') + ')', value1353 = new value1354('^(' + value1350 + ("\\s*:)(.+)$"));
                  let value1355 = '';
                  for (const value1356 of value1357["split"](/\r?\n/))value1355 += value1356["replace"](value1353, (value1358, value1359, value1360) => {
                    const value1361 = value1360["trim"]();
                    if (value1345["piaVA"](value1361["length"], 0) || value1362["includes"](value1361[0]))return value1358;
                    const value1363 = value1345["xXuOg"](value1360["length"], value1360["trimLeft"]()["length"]), value1364 = value1360["substring"](0, value1363);
                    return '' + value1359 + value1364 + '\x22' + value1361["split"]('\x22')["join"]('\x5c\x22') + '\x22';
                  }) + '\x0a';
                  return value1355["trim"]();
                } else value1332 = true, value1307["spot"] = {
                  ...value1307["spot"], ...locals[value1344](value1309[value1333], value1041)
                };
              } else value1041["customDirectives"]["local"][value1344] && (value1261["fnqEv"](value1261["cPzJP"], value1261["rWhaB"]) ? (value1365["meta"] = value1366["meta"] || {
              }, value1367["meta"]["marpitCommentParsed"] = value1368): (value1332 = true, value1307["spot"] = {
                ...value1307["spot"], ...value1261["nrBGf"](value1042, value1041["customDirectives"]["local"][value1344](value1309[value1333], value1041), locals)
              }));
            }
          } else {
            let value1369 = false;
            for (const value1370 of value1371["keys"](value1372)) {
              if (value1373[value1370])value1369 = true, value1374 = {
                ...value1375, ...value1376[value1370](value1377[value1370], value1378)
              };
              else value1379["customDirectives"]["global"][value1370] && (value1369 = true, value1380 = {
                ...value1381, ...pPmdao["wrNRw"](value1382, value1383["customDirectives"]["global"][value1370](value1384[value1370], value1385), value1386)
              });
            }
            return value1369;
          }
        }
        return value1332;
      }
    };
    if (value1068["yaml"])value969["diurT"](value1308, value1068["yaml"]);
    for (const value1387 of value1171["tokens"]) {
      if (value1387["meta"] && value969["czGvy"](value1387["meta"]["marpitSlideElement"], 1)) {
        if (value969["zJjjo"](value969["SbpUa"], value969["tZtZc"]))value1387["meta"]["marpitDirectives"] = {
        }, value1305["push"](value1387), value1307["slide"] = value1387;
        else {
          const {
            posMax: value1388, src: value1389
          }
           = value1390;
          if (uWjmzO["AZfYJ"](uWjmzO["lMOqs"](value1391["pos"], 2), value1388) || uWjmzO["CcvqF"](value1389["charCodeAt"](value1392["pos"]), 60) || uWjmzO["CcvqF"](value1389["charCodeAt"](uWjmzO["uNHXm"](value1393["pos"], 1)), 33))returnfalse;
          const value1394 = value1389["slice"](value1395["pos"])["match"](value1396);
          if (! value1394)returnfalse;
          if (! value1397) {
            const value1398 = value1399["push"](uWjmzO["feQIV"], '', 0);
            value1398["hidden"] = true, value1398["markup"] = value1389["slice"](value1400["pos"], uWjmzO["gClUT"](value1401["pos"], value1394[0]["length"])), value1398["content"] = value1394[1]["trim"](), uWjmzO["GkFlq"](value1402, value1398, value1398["content"]);
          }
          return value1403["pos"]+= value1394[0]["length"], true;
        }
      } else {
        if (value1387["meta"] && value969["jTnSW"](value1387["meta"]["marpitSlideElement"],  - (1)))value969["MFJsB"](value969["CNCWo"], value969["CNCWo"]) ? (value1404["meta"]["marpitDirectives"] = {
        }, value1405["push"](value1406), value1407["slide"] = value1408): (value1307["slide"]["meta"]["marpitDirectives"] = {
          ...value1307["slide"]["meta"]["marpitDirectives"], ...value1307["local"], ...value1307["spot"]
        }, value1307["spot"] = {
        });
        else {
          if (value969["QPpIn"](isDirectiveComment, value1387) && value969["QPpIn"](value1308, value1387["meta"]["marpitParsedDirectives"])) {
            if (value969["vnQMm"](value969["YIODG"], value969["upnvz"])) {
              const value1409 = {
                ...value1410["slide"]["meta"]["marpitDirectives"], ...value1411["local"], ...value1412["spot"]
              };
              value1413["slide"]["meta"]["marpitDirectives"] = value1409, value1414["spot"] = {
              };
            } else value969["wuZDG"](markAsParsed, value1387, value969["JwQNN"]);
          } else {
            if (value969["jTnSW"](value1387["type"], value969["YgxQn"]))for (const value1415 of value1387["children"]) {
              if (value969["VkxrZ"](isDirectiveComment, value1415) && value969["OuiBf"](value1308, value1415["meta"]["marpitParsedDirectives"]))value969["YIUvK"](markAsParsed, value1415, value969["JwQNN"]);
            }
          }
        }
      }
    }
    for (const value1416 of value1305)value1416["meta"]["marpitDirectives"] = {
      ...value1416["meta"]["marpitDirectives"], ...value1041["lastGlobalDirectives"]
    };
  });
}
var parseWithFrontMatter = (0, import_plugin2["default"])(parseMarkdown), parse_default = parseWithFrontMatter;

