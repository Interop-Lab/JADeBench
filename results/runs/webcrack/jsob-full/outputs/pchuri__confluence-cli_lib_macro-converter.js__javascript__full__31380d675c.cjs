var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x2cf4d0, _0x4689ef) => function _0x363014() {
  if (!_0x4689ef) {
    (0, _0x2cf4d0[__getOwnPropNames(_0x2cf4d0)[0]])((_0x4689ef = {
      exports: {}
    }).exports, _0x4689ef);
  }
  return _0x4689ef.exports;
};
var require_markdown_cleanup = __commonJS({
  "../work/pchuri__confluence-cli/lib/markdown-cleanup.js"(_0xa10b4b, _0x41590b) {
    function _0x5fa7ee(_0x5d44e9) {
      let _0x1bce1d = 0;
      const _0x390977 = _0x5d44e9.match(/`+/g);
      if (_0x390977) {
        for (const _0x150177 of _0x390977) {
          if (_0x150177.length > _0x1bce1d) {
            _0x1bce1d = _0x150177.length;
          }
        }
      }
      return Math.max(3, _0x1bce1d + 1);
    }
    function _0x553204(_0x25a874) {
      const _0x24fbbe = [];
      const _0x388cc9 = /^ {0,3}(`{3,})[^\n]*\n[\s\S]*?\n {0,3}\1[\t ]*$/gm;
      let _0x390c65 = 0;
      let _0x216805;
      while ((_0x216805 = _0x388cc9.exec(_0x25a874)) !== null) {
        _0x24fbbe.push(_0x25a874.slice(_0x390c65, _0x216805.index));
        _0x24fbbe.push(_0x216805[0]);
        _0x390c65 = _0x216805.index + _0x216805[0].length;
      }
      _0x24fbbe.push(_0x25a874.slice(_0x390c65));
      return _0x24fbbe;
    }
    function _0x7b3c4e(_0x4564ef) {
      let _0x292ee0 = _0x4564ef;
      _0x292ee0 = _0x292ee0.replace(/[ \t]+$/gm, "");
      _0x292ee0 = _0x292ee0.replace(/^[ \t]+(?!([`>]|[*+-] |\d+[.)] ))/gm, "");
      _0x292ee0 = _0x292ee0.replace(/^(#{1,6}[^\n]+)\n(?!\n)/gm, "$1\n\n");
      _0x292ee0 = _0x292ee0.replace(/\n\s*\n\s*\n+/g, "\n\n");
      _0x292ee0 = _0x292ee0.replace(/[ \t]+/g, " ");
      return _0x292ee0;
    }
    function _0xb243e1(_0x1aa176) {
      const _0x23ab78 = _0x553204(_0x1aa176);
      return _0x23ab78.map((_0x51b798, _0x174ce3) => _0x174ce3 % 2 === 1 ? _0x51b798 : _0x7b3c4e(_0x51b798)).join("").trim();
    }
    const _0x4a71ab = {
      fenceLength: _0x5fa7ee,
      splitOnFences: _0x553204,
      cleanupOutsideFence: _0x7b3c4e,
      cleanupWithFences: _0xb243e1
    };
    _0x41590b.exports = _0x4a71ab;
  }
});
var require_storage_walker = __commonJS({
  "../work/pchuri__confluence-cli/lib/storage-walker.js"(_0x46bfaa, _0x5103d6) {
    var {
      Parser: _0x265892,
      DomHandler: _0x541424
    } = require("htmlparser2");
    var {
      decodeHTML: _0x4cc17c
    } = require("entities");
    var {
      fenceLength: _0x20e9b9,
      cleanupWithFences: _0x42f540
    } = require_markdown_cleanup();
    var _0x51fd5e = 256;
    var _0x49e0f0 = {
      nbsp: " ",
      ldquo: "\"",
      rdquo: "\"",
      lsquo: "'",
      rsquo: "'",
      hellip: "..."
    };
    function _0x67a86c(_0x13de07) {
      if (!_0x13de07) {
        return "";
      }
      return _0x13de07.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g, (_0x287b86, _0x569030) => {
        if (_0x569030[0] === "#") {
          const _0x1321a7 = _0x569030[1] === "x" || _0x569030[1] === "X" ? parseInt(_0x569030.slice(2), 16) : parseInt(_0x569030.slice(1), 10);
          if (!Number.isFinite(_0x1321a7)) {
            return _0x287b86;
          }
          try {
            return String.fromCodePoint(_0x1321a7);
          } catch (_0x1f7837) {
            return _0x287b86;
          }
        }
        if (Object.prototype.hasOwnProperty.call(_0x49e0f0, _0x569030)) {
          return _0x49e0f0[_0x569030];
        }
        return _0x4cc17c("&" + _0x569030 + ";");
      });
    }
    var _0x20f171 = class extends Error {
      constructor(_0x438404) {
        super("Storage XML nesting exceeds limit of " + _0x438404 + " levels");
        this.name = "StorageDepthExceededError";
        this.maxDepth = _0x438404;
      }
    };
    var _0x565fc9 = class {
      constructor({
        attachmentsDir = "attachments",
        labels = {},
        buildUrl = _0x30631c => _0x30631c,
        webUrlPrefix = "",
        maxDepth = _0x51fd5e
      } = {}) {
        this.attachmentsDir = attachmentsDir;
        this.labels = labels;
        this.buildUrl = buildUrl;
        this.webUrlPrefix = webUrlPrefix;
        this.maxDepth = maxDepth;
      }
      walk(_0x1005e0) {
        this._depth = 0;
        this._markdownLinkLabelDepth = 0;
        this._markdownCodeSpanDepth = 0;
        this.warnings = [];
        const _0x398cba = new _0x541424(null, {
          xmlMode: true
        });
        const _0x4ba2c3 = [];
        const _0x21c29a = _0x398cba.onopentag.bind(_0x398cba);
        const _0x34bf51 = _0x398cba.onclosetag.bind(_0x398cba);
        _0x398cba.onopentag = (..._0x4c67f3) => {
          const _0x470039 = {
            sIdx: _0x8bf91a.startIndex,
            eIdx: _0x8bf91a.endIndex
          };
          _0x4ba2c3.push(_0x470039);
          _0x21c29a(..._0x4c67f3);
        };
        _0x398cba.onclosetag = (..._0x3947ea) => {
          const [_0x4a34f9, _0x31de42] = _0x3947ea;
          const _0x2daaf5 = _0x4ba2c3.pop();
          if (_0x31de42) {
            const _0x60b2bd = _0x2daaf5 && _0x2daaf5.sIdx === _0x8bf91a.startIndex && _0x2daaf5.eIdx === _0x8bf91a.endIndex;
            if (!_0x60b2bd) {
              const _0x11c3ec = _0x8bf91a.endIndex;
              const _0x321ab4 = {
                type: "implicit-close",
                tag: _0x4a34f9,
                offset: _0x11c3ec
              };
              this.warnings.push(_0x321ab4);
              if (process.env.CONFLUENCE_CLI_VERBOSE) {
                process.stderr.write("StorageWalker: auto-closed <" + _0x4a34f9 + "> at offset " + _0x11c3ec + "\n");
              }
            }
          }
          _0x34bf51(..._0x3947ea);
        };
        const _0x8bf91a = new _0x265892(_0x398cba, {
          xmlMode: true,
          recognizeSelfClosing: true,
          decodeEntities: true
        });
        _0x8bf91a.write(_0x1005e0);
        _0x8bf91a.end();
        return this.cleanup(this.walkNodes(_0x398cba.dom));
      }
      walkNodes(_0x2e4d96) {
        if (!_0x2e4d96) {
          return "";
        }
        return _0x2e4d96.map(_0x5377ee => this.walkNode(_0x5377ee)).join("");
      }
      walkNode(_0x3acc8f) {
        if (!_0x3acc8f) {
          return "";
        }
        switch (_0x3acc8f.type) {
          case "text":
            return this.renderText(_0x3acc8f.data || "");
          case "cdata":
            return this.walkNodes(_0x3acc8f.children);
          case "comment":
          case "directive":
            return "";
          case "tag":
          case "script":
          case "style":
            return this.walkElement(_0x3acc8f);
          default:
            return "";
        }
      }
      walkElement(_0x4bd759) {
        if (++this._depth > this.maxDepth) {
          this._depth--;
          throw new _0x20f171(this.maxDepth);
        }
        try {
          return this._dispatchElement(_0x4bd759);
        } finally {
          this._depth--;
        }
      }
      _dispatchElement(_0xc55ef8) {
        const _0x5ce097 = _0xc55ef8.name;
        switch (_0x5ce097) {
          case "p":
            return "\n" + this.walkNodes(_0xc55ef8.children).trim() + "\n";
          case "h1":
          case "h2":
          case "h3":
          case "h4":
          case "h5":
          case "h6":
            {
              const _0x48b365 = parseInt(_0x5ce097.charAt(1), 10);
              return "\n" + "#".repeat(_0x48b365) + " " + this.walkNodes(_0xc55ef8.children).trim() + "\n";
            }
          case "strong":
          case "b":
            return "**" + this.walkNodes(_0xc55ef8.children) + "**";
          case "em":
          case "i":
            return "*" + this.walkNodes(_0xc55ef8.children) + "*";
          case "s":
          case "del":
            return "~~" + this.walkNodes(_0xc55ef8.children) + "~~";
          case "code":
            {
              this._markdownCodeSpanDepth++;
              try {
                return this.renderCodeSpan(this.walkNodes(_0xc55ef8.children));
              } finally {
                this._markdownCodeSpanDepth--;
              }
            }
          case "br":
            return "\n";
          case "hr":
            return "\n---\n";
          case "a":
            {
              const _0x594c63 = _0x67a86c(_0xc55ef8.attribs && _0xc55ef8.attribs.href || "");
              if (!_0x594c63) {
                return this.walkNodes(_0xc55ef8.children);
              }
              this._markdownLinkLabelDepth++;
              let _0x2e9cfb;
              try {
                _0x2e9cfb = this.walkNodes(_0xc55ef8.children);
              } finally {
                this._markdownLinkLabelDepth--;
              }
              return "[" + _0x2e9cfb + "](" + _0x594c63 + ")";
            }
          case "time":
            return this.renderText(_0xc55ef8.attribs && _0xc55ef8.attribs.datetime || "") || this.walkNodes(_0xc55ef8.children);
          case "ul":
            return this.handleList(_0xc55ef8, false);
          case "ol":
            return this.handleList(_0xc55ef8, true);
          case "li":
            return this.walkNodes(_0xc55ef8.children);
          case "table":
            return this.handleTable(_0xc55ef8);
          case "thead":
          case "tbody":
          case "tfoot":
          case "tr":
          case "th":
          case "td":
            return this.walkNodes(_0xc55ef8.children);
          case "blockquote":
            return this.handleBlockquote(_0xc55ef8);
          case "details":
          case "summary":
          case "u":
          case "sub":
          case "sup":
          case "mark":
            return "<" + _0x5ce097 + ">" + this.walkNodes(_0xc55ef8.children) + ("</" + _0x5ce097 + ">");
          case "ac:structured-macro":
            return this.handleMacro(_0xc55ef8);
          case "ac:image":
            return this.handleImage(_0xc55ef8);
          case "ac:link":
            return this.handleAcLink(_0xc55ef8);
          case "ac:task-list":
            return this.handleTaskList(_0xc55ef8);
          case "ac:layout":
          case "ac:layout-section":
          case "ac:layout-cell":
          case "ac:rich-text-body":
          case "ac:link-body":
            return this.walkNodes(_0xc55ef8.children);
          case "ri:url":
          case "ri:page":
          case "ri:attachment":
          case "ac:plain-text-body":
          case "ac:plain-text-link-body":
          case "ac:parameter":
            return "";
          default:
            return this.walkNodes(_0xc55ef8.children);
        }
      }
      handleList(_0x3b7cf1, _0x5c709e) {
        const _0x241c38 = (_0x3b7cf1.children || []).filter(_0x3c5896 => _0x3c5896.type === "tag" && _0x3c5896.name === "li");
        let _0x2e0dcf = 1;
        let _0x3caf4b = "";
        for (const _0x56cb0b of _0x241c38) {
          const _0x2427ea = this.walkNodes(_0x56cb0b.children).replace(/\s+/g, " ").trim();
          if (!_0x2427ea) {
            continue;
          }
          const _0x32f8da = _0x5c709e ? _0x2e0dcf++ + "." : "-";
          _0x3caf4b += _0x32f8da + " " + _0x2427ea + "\n";
        }
        if (_0x3caf4b) {
          return "\n" + _0x3caf4b;
        } else {
          return "";
        }
      }
      handleTable(_0xd68385) {
        const _0x5b7e4e = [];
        const _0x5137ed = this.findAllDescendants(_0xd68385, "tr");
        let _0x2f8650 = true;
        for (const _0x1a92c6 of _0x5137ed) {
          const _0x1d4bed = (_0x1a92c6.children || []).filter(_0x1a2be9 => _0x1a2be9.type === "tag" && (_0x1a2be9.name === "th" || _0x1a2be9.name === "td"));
          if (_0x1d4bed.length === 0) {
            continue;
          }
          const _0x5bff74 = _0x1d4bed.map(_0x4a7a3c => this.walkNodes(_0x4a7a3c.children).replace(/\s+/g, " ").trim() || " ");
          _0x5b7e4e.push("| " + _0x5bff74.join(" | ") + " |");
          if (_0x2f8650) {
            _0x5b7e4e.push("| " + _0x5bff74.map(() => "---").join(" | ") + " |");
            _0x2f8650 = false;
          }
        }
        if (_0x5b7e4e.length > 0) {
          return "\n" + _0x5b7e4e.join("\n") + "\n";
        } else {
          return "";
        }
      }
      handleBlockquote(_0x5a93df) {
        const _0x51d285 = this.walkNodes(_0x5a93df.children).trim();
        if (!_0x51d285) {
          return "";
        }
        const _0x4227f9 = _0x51d285.split("\n").map(_0x5dbab1 => _0x5dbab1.length === 0 ? ">" : "> " + _0x5dbab1).join("\n");
        return "\n" + _0x4227f9 + "\n";
      }
      handleMacro(_0x18ea90) {
        const _0x2d4f86 = _0x18ea90.attribs && _0x18ea90.attribs["ac:name"];
        switch (_0x2d4f86) {
          case "toc":
          case "floatmenu":
            return "";
          case "expand":
            return this.handleExpand(_0x18ea90);
          case "code":
            return this.handleCode(_0x18ea90);
          case "info":
          case "warning":
          case "note":
            return this.handleCallout(_0x18ea90, _0x2d4f86);
          case "anchor":
            return this.handleAnchor(_0x18ea90);
          case "panel":
            return this.handlePanel(_0x18ea90);
          case "mermaid-macro":
            return this.handleMermaid(_0x18ea90);
          case "plantuml":
            return this.handlePlantuml(_0x18ea90);
          case "include":
            return this.handleInclude(_0x18ea90);
          case "shared-block":
          case "include-shared-block":
            return this.handleSharedBlock(_0x18ea90, _0x2d4f86);
          case "view-file":
            return this.handleViewFile(_0x18ea90);
          default:
            return "";
        }
      }
      handleExpand(_0x1d74b3) {
        const _0x1dbcd7 = this.findParamByName(_0x1d74b3, "title");
        const _0x289e1c = (_0x1dbcd7 ? this.getTextContent(_0x1dbcd7) : "").trim();
        const _0x7a2dd9 = this.getMacroBody(_0x1d74b3);
        if (_0x289e1c) {
          return "\n**EXPAND: " + _0x289e1c + "**\n\n" + this.walkNodes(_0x7a2dd9).trim() + "\n\n**EXPAND_END**\n";
        }
        return "\n<details>\n<summary>" + (this.labels.expandDetails || "Expand Details") + "</summary>\n\n" + this.walkNodes(_0x7a2dd9).trim() + "\n\n</details>\n";
      }
      handleCode(_0x2d0a85) {
        const _0x42494c = this.findParamByName(_0x2d0a85, "language");
        const _0x1780cd = _0x42494c ? this.getTextContent(_0x42494c) : "";
        const _0x4ed564 = this.findChildByName(_0x2d0a85, "ac:plain-text-body");
        const _0x2f9786 = _0x4ed564 ? this.getRawText(_0x4ed564) : "";
        const _0x2b0edf = "`".repeat(_0x20e9b9(_0x2f9786));
        return "\n" + _0x2b0edf + _0x1780cd + "\n" + _0x2f9786 + "\n" + _0x2b0edf + "\n";
      }
      handleCallout(_0xbffdac, _0x670832) {
        const _0x52b38b = this.getMacroBody(_0xbffdac);
        const _0x3c66dc = this.walkNodes(_0x52b38b).trim();
        const _0x4be7ab = _0x3c66dc.split("\n").map(_0x951215 => _0x951215.length === 0 ? ">" : "> " + _0x951215).join("\n");
        const _0x4b67db = "> **" + _0x670832.toUpperCase() + "**";
        const _0x50f98a = _0x3c66dc.length === 0 ? _0x4b67db : _0x4b67db + "\n" + _0x4be7ab;
        return "\n" + _0x50f98a + "\n";
      }
      handleAnchor(_0x2c877f) {
        const _0x59836b = this.findParamByName(_0x2c877f, "");
        const _0x2f8c76 = (_0x59836b ? this.getTextContent(_0x59836b) : "").trim();
        if (!_0x2f8c76) {
          return "";
        }
        return "\n**ANCHOR: " + _0x2f8c76 + "**\n";
      }
      handlePanel(_0x2e4a12) {
        const _0x3553ce = this.findParamByName(_0x2e4a12, "title");
        const _0x4a95d1 = (_0x3553ce ? this.getTextContent(_0x3553ce) : "").trim();
        const _0x382437 = this.getMacroBody(_0x2e4a12);
        const _0x4bbe9b = this.walkNodes(_0x382437).trim();
        if (!_0x4a95d1 && !_0x4bbe9b) {
          return "";
        }
        const _0x224c25 = _0x4bbe9b.split("\n").map(_0x27b72e => _0x27b72e ? "> " + _0x27b72e : ">").join("\n");
        if (!_0x4a95d1) {
          return "\n" + _0x224c25 + "\n";
        }
        if (!_0x4bbe9b) {
          return "\n> **" + _0x4a95d1 + "**\n";
        }
        return "\n> **" + _0x4a95d1 + "**\n>\n" + _0x224c25 + "\n";
      }
      handleMermaid(_0x4b27ca) {
        const _0x7fa34b = this.findChildByName(_0x4b27ca, "ac:plain-text-body");
        const _0x9335ff = _0x7fa34b ? this.getRawText(_0x7fa34b).trim() : "";
        const _0x1ebeba = "`".repeat(_0x20e9b9(_0x9335ff));
        return "\n" + _0x1ebeba + "mermaid\n" + _0x9335ff + "\n" + _0x1ebeba + "\n";
      }
      handlePlantuml(_0x3b8e2a) {
        const _0xe2c974 = this.findChildByName(_0x3b8e2a, "ac:plain-text-body");
        const _0xab62dc = _0xe2c974 ? this.getRawText(_0xe2c974).trim() : "";
        const _0x424180 = "`".repeat(_0x20e9b9(_0xab62dc));
        return "\n" + _0x424180 + "plantuml\n" + _0xab62dc + "\n" + _0x424180 + "\n";
      }
      handleInclude(_0x422f17) {
        const _0x2e06f7 = this.findParamByName(_0x422f17, "");
        if (!_0x2e06f7) {
          return "";
        }
        const _0x31c67e = this.findChildByName(_0x2e06f7, "ac:link");
        if (!_0x31c67e) {
          return "";
        }
        const _0xa69f74 = this.findChildByName(_0x31c67e, "ri:page");
        if (!_0xa69f74) {
          return "";
        }
        const _0x31eeb3 = _0x67a86c(_0xa69f74.attribs["ri:space-key"] || "");
        const _0x5f46f5 = _0x67a86c(_0xa69f74.attribs["ri:content-title"] || "");
        const _0x306cc7 = this.escapeMarkdownText(_0x5f46f5);
        const _0xb03758 = this.labels.includePage || "Include Page";
        if (_0x31eeb3.startsWith("~")) {
          const _0x16fe2f = "display/" + _0x31eeb3 + "/" + encodeURIComponent(_0x5f46f5);
          return "\n> 📄 **" + _0xb03758 + "**: [" + _0x306cc7 + "](" + this.buildUrl(this.webUrlPrefix + "/" + _0x16fe2f) + ")\n";
        }
        return "\n> 📄 **" + _0xb03758 + "**: [" + _0x306cc7 + "](" + this.buildUrl(this.webUrlPrefix + "/spaces/" + _0x31eeb3 + "/pages/[PAGE_ID_HERE]") + ") _(manual link correction required)_\n";
      }
      handleSharedBlock(_0x31acaa, _0x9c0d41) {
        const _0xde7a90 = this.findParamByName(_0x31acaa, "shared-block-key");
        const _0x1c0c04 = (_0xde7a90 ? this.getTextContent(_0xde7a90) : "").trim();
        const _0x4a6ae1 = this.findParamByName(_0x31acaa, "page");
        if (_0x4a6ae1 && _0x9c0d41 === "include-shared-block") {
          const _0x4121b8 = this.findChildByName(_0x4a6ae1, "ac:link");
          if (_0x4121b8) {
            const _0x305958 = this.findChildByName(_0x4121b8, "ri:page");
            if (_0x305958) {
              const _0x455046 = this.escapeMarkdownText(_0x67a86c(_0x305958.attribs["ri:content-title"] || ""));
              const _0xc2bf86 = this.labels.includeSharedBlock || "Include Shared Block";
              const _0x306327 = this.labels.fromPage || "from page";
              const _0x38a8ce = _0x1c0c04 ? ": " + _0x1c0c04 + " " : " ";
              return "\n> 📄 **" + _0xc2bf86 + "**" + _0x38a8ce + "(" + _0x306327 + ": " + _0x455046 + " [link needs manual correction])\n";
            }
          }
        }
        const _0x2d473c = this.getMacroBody(_0x31acaa);
        const _0x42821a = this.walkNodes(_0x2d473c).trim();
        const _0xfa74f9 = this.labels.sharedBlock || "Shared Block";
        if (!_0x1c0c04 && !_0x42821a) {
          return "";
        }
        const _0x564f81 = _0x1c0c04 ? "**" + _0xfa74f9 + ": " + _0x1c0c04 + "**" : "**" + _0xfa74f9 + "**";
        if (!_0x42821a) {
          return "\n> " + _0x564f81 + "\n";
        }
        const _0x563f2f = _0x42821a.split("\n").map(_0x211bf6 => _0x211bf6 ? "> " + _0x211bf6 : ">").join("\n");
        return "\n> " + _0x564f81 + "\n>\n" + _0x563f2f + "\n";
      }
      handleViewFile(_0x2e3ad7) {
        const _0x4c94e2 = this.findParamByName(_0x2e3ad7, "name");
        if (!_0x4c94e2) {
          return "";
        }
        const _0x3a1dfc = this.findChildByName(_0x4c94e2, "ri:attachment");
        if (!_0x3a1dfc) {
          return "";
        }
        const _0x2d137e = _0x67a86c(_0x3a1dfc.attribs["ri:filename"] || "");
        return "\n📎 [" + _0x2d137e + "](" + this.attachmentsDir + "/" + _0x2d137e + ")\n";
      }
      handleImage(_0x17771e) {
        const _0x2481ee = this.findChildByName(_0x17771e, "ri:attachment");
        if (_0x2481ee) {
          const _0x74c055 = this.renderText(_0x2481ee.attribs["ri:filename"] || "");
          return "![" + _0x74c055 + "](" + this.attachmentsDir + "/" + _0x74c055 + ")";
        }
        const _0x3e351a = this.findChildByName(_0x17771e, "ri:url");
        if (_0x3e351a) {
          const _0x53e989 = this.renderText(_0x3e351a.attribs["ri:value"] || "");
          if (!_0x53e989) {
            return "";
          }
          return "![](" + _0x53e989 + ")";
        }
        return "";
      }
      handleAcLink(_0x15ae56) {
        const _0x74583c = _0x15ae56.attribs || {};
        if (_0x74583c["ac:anchor"]) {
          const _0xbd2ad2 = this.findChildByName(_0x15ae56, "ac:plain-text-link-body");
          const _0x31ad9f = _0xbd2ad2 ? this.getRawText(_0xbd2ad2) : "";
          if (!_0x31ad9f) {
            return "";
          }
          return "[" + _0x31ad9f + "](#" + _0x67a86c(_0x74583c["ac:anchor"]) + ")";
        }
        const _0x10aab0 = this.findChildByName(_0x15ae56, "ri:url");
        if (_0x10aab0) {
          const _0x3256f9 = _0x67a86c(_0x10aab0.attribs["ri:value"] || "");
          const _0x1bc18a = this.findChildByName(_0x15ae56, "ac:plain-text-link-body");
          const _0x53f3ca = _0x1bc18a ? this.getRawText(_0x1bc18a) : "";
          if (!_0x53f3ca) {
            return "";
          }
          return "[" + _0x53f3ca + "](" + _0x3256f9 + ")";
        }
        const _0x55bf5d = this.findChildByName(_0x15ae56, "ac:link-body");
        if (_0x55bf5d) {
          return this.walkNodes(_0x55bf5d.children).trim();
        }
        const _0x31f45f = this.findChildByName(_0x15ae56, "ri:page");
        if (_0x31f45f) {
          const _0x3e76db = this.escapeMarkdownText(_0x67a86c(_0x31f45f.attribs["ri:content-title"] || ""));
          return "[" + _0x3e76db + "]";
        }
        return "";
      }
      handleTaskList(_0x63e2da) {
        const _0x4a60ab = (_0x63e2da.children || []).filter(_0x41721c => _0x41721c.type === "tag" && _0x41721c.name === "ac:task");
        const _0x4fd542 = [];
        for (const _0x581f05 of _0x4a60ab) {
          const _0x2ab40a = this.findChildByName(_0x581f05, "ac:task-status");
          const _0x3aa5ac = this.findChildByName(_0x581f05, "ac:task-body");
          const _0x4691bd = _0x2ab40a ? this.getTextContent(_0x2ab40a) : "";
          const _0x5cb213 = _0x3aa5ac ? this.walkNodes(_0x3aa5ac.children).replace(/\s+/g, " ").trim() : "";
          const _0x5e5761 = _0x4691bd === "complete" ? "[x]" : "[ ]";
          if (_0x5cb213) {
            _0x4fd542.push("- " + _0x5e5761 + " " + _0x5cb213);
          }
        }
        if (_0x4fd542.length > 0) {
          return "\n" + _0x4fd542.join("\n") + "\n";
        } else {
          return "";
        }
      }
      findParamByName(_0x589f5f, _0x33ff7a) {
        if (!_0x589f5f || !_0x589f5f.children) {
          return null;
        }
        for (const _0x326cb4 of _0x589f5f.children) {
          if (_0x326cb4.type === "tag" && _0x326cb4.name === "ac:parameter" && _0x326cb4.attribs["ac:name"] === _0x33ff7a) {
            return _0x326cb4;
          }
        }
        return null;
      }
      findChildByName(_0x553033, _0x116c57) {
        if (!_0x553033 || !_0x553033.children) {
          return null;
        }
        for (const _0x400234 of _0x553033.children) {
          if (_0x400234.type === "tag" && _0x400234.name === _0x116c57) {
            return _0x400234;
          }
        }
        return null;
      }
      findAllDescendants(_0x1a4c47, _0x4659e7) {
        const _0x3e1b68 = [];
        const _0x3e0666 = _0xf1e74c => {
          if (!_0xf1e74c) {
            return;
          }
          if (_0xf1e74c.type === "tag" && _0xf1e74c.name === _0x4659e7) {
            _0x3e1b68.push(_0xf1e74c);
          }
          if (_0xf1e74c.children) {
            _0xf1e74c.children.forEach(_0x3e0666);
          }
        };
        if (_0x1a4c47.children) {
          _0x1a4c47.children.forEach(_0x3e0666);
        }
        return _0x3e1b68;
      }
      getMacroBody(_0x24e1ae) {
        const _0x3a37a5 = this.findChildByName(_0x24e1ae, "ac:rich-text-body");
        if (_0x3a37a5) {
          return _0x3a37a5.children;
        } else {
          return [];
        }
      }
      getTextContent(_0x1ea996) {
        return _0x67a86c(this._collectText(_0x1ea996));
      }
      escapeMarkdownText(_0x4a5dd6) {
        if (!_0x4a5dd6) {
          return "";
        }
        return _0x4a5dd6.replace(/([\\`*_[\]()~|<>])/g, "\\$1");
      }
      renderText(_0x421616) {
        const _0x187608 = _0x67a86c(_0x421616);
        if (this._markdownLinkLabelDepth > 0 && this._markdownCodeSpanDepth === 0) {
          return this.escapeMarkdownText(_0x187608);
        } else {
          return _0x187608;
        }
      }
      renderCodeSpan(_0x8a84db) {
        const _0x17408a = _0x8a84db.match(/`+/g) || [];
        const _0x57a911 = _0x17408a.reduce((_0x4e3299, _0x106578) => Math.max(_0x4e3299, _0x106578.length), 0);
        const _0x3ec6b0 = "`".repeat(_0x57a911 + 1);
        const _0x333015 = _0x8a84db.startsWith("`") || _0x8a84db.endsWith("`") ? " " : "";
        return "" + _0x3ec6b0 + _0x333015 + _0x8a84db + _0x333015 + _0x3ec6b0;
      }
      _collectText(_0x4af826) {
        if (!_0x4af826) {
          return "";
        }
        if (_0x4af826.type === "text") {
          return _0x4af826.data || "";
        }
        if (_0x4af826.children) {
          return _0x4af826.children.map(_0x2d0110 => this._collectText(_0x2d0110)).join("");
        }
        return "";
      }
      getRawText(_0x1377f6) {
        return _0x67a86c(this._collectRawText(_0x1377f6));
      }
      _collectRawText(_0x5a16de) {
        if (!_0x5a16de || !_0x5a16de.children) {
          return "";
        }
        let _0xa6219 = "";
        for (const _0x391978 of _0x5a16de.children) {
          if (_0x391978.type === "text") {
            _0xa6219 += _0x391978.data || "";
          } else if (_0x391978.type === "cdata") {
            _0xa6219 += this._collectRawText(_0x391978);
          }
        }
        return _0xa6219;
      }
      cleanup(_0x452e03) {
        return _0x42f540(_0x452e03);
      }
    };
    const _0x2d39bf = {
      StorageWalker: _0x565fc9,
      StorageDepthExceededError: _0x20f171,
      DEFAULT_MAX_DEPTH: _0x51fd5e
    };
    _0x5103d6.exports = _0x2d39bf;
  }
});
var require_link_style = __commonJS({
  "../work/pchuri__confluence-cli/lib/link-style.js"(_0x223bd1, _0x1385e8) {
    var _0x2e8414 = ["smart", "plain", "wiki"];
    function _0x44dbb1({
      isCloud = false,
      linkStyle = null
    } = {}) {
      if (_0x2e8414.includes(linkStyle)) {
        return linkStyle;
      }
      if (isCloud) {
        return "smart";
      } else {
        return "plain";
      }
    }
    const _0x4fc4b1 = {
      VALID_LINK_STYLES: _0x2e8414,
      resolveLinkStyle: _0x44dbb1
    };
    _0x1385e8.exports = _0x4fc4b1;
  }
});
var require_html_to_storage = __commonJS({
  "../work/pchuri__confluence-cli/lib/html-to-storage.js"(_0x1bafef, _0x5225d8) {
    var {
      parseDocument: _0x572535
    } = require("htmlparser2");
    var {
      resolveLinkStyle: _0x1d723e
    } = require_link_style();
    var _0x40eb4f = 256;
    var _0x12f8b5 = class extends Error {
      constructor(_0x1f7a66) {
        super("HTML nesting exceeds limit of " + _0x1f7a66 + " levels");
        this.name = "HtmlDepthExceededError";
        this.maxDepth = _0x1f7a66;
      }
    };
    var _0x2cbe82 = new Set(["hr"]);
    var _0x14c42e = ["info", "warning", "note"];
    var _0x5a0b98 = new Set(["svg", "div"]);
    var _0x1e6d4d = new Set(["a", "strong", "em", "code", "br", "img", "span", "mark", "sub", "sup", "ins", "del", "b", "i", "u", "small", "s", "abbr", "kbd", "q", "var", "cite", "time", "dfn", "samp"]);
    function _0x4f98bb(_0x1b4a1e) {
      if (!_0x1b4a1e.children) {
        return true;
      }
      for (const _0x12b734 of _0x1b4a1e.children) {
        if (_0x12b734.type === "text" && _0x12b734.data.includes("\n")) {
          return false;
        }
        if (_0x12b734.type === "tag" && !_0x1e6d4d.has(_0x12b734.name)) {
          return false;
        }
      }
      return true;
    }
    function _0x2fc294(_0x11778d) {
      return _0x11778d.type === "text" && /^\s*$/.test(_0x11778d.data);
    }
    function _0xcbb94f(_0xb14658) {
      return (_0xb14658.children || []).filter(_0x4c8a31 => !_0x2fc294(_0x4c8a31));
    }
    function _0xd60a71(_0x3eb38c, {
      allowPlain = false
    } = {}) {
      const _0x57730d = (_0x3eb38c || "").trim();
      if (_0x57730d === "[[_TOC_]]" || _0x57730d === "_TOC_" || allowPlain && _0x57730d === "TOC") {
        return {
          kind: "toc"
        };
      }
      if (_0x57730d === "[[_LISTING_]]" || _0x57730d === "_LISTING_" || allowPlain && _0x57730d === "LISTING") {
        return {
          kind: "children"
        };
      }
      return null;
    }
    function _0x2ec85e(_0x13943a) {
      if (_0x13943a.name !== "p") {
        return null;
      }
      const _0x41c5e4 = _0xcbb94f(_0x13943a);
      if (_0x41c5e4.length !== 1) {
        return null;
      }
      if (_0x41c5e4[0].type === "text") {
        return _0xd60a71(_0x41c5e4[0].data);
      }
      const _0x19df56 = _0x41c5e4[0];
      if (_0x19df56.type !== "tag" || _0x19df56.name !== "strong") {
        return null;
      }
      const _0x2042ca = _0xcbb94f(_0x19df56);
      if (_0x2042ca.length !== 1) {
        return null;
      }
      const _0x344cd0 = _0x2042ca[0];
      if (_0x344cd0.type !== "text") {
        return null;
      }
      const _0x2d0cbe = _0xd60a71(_0x344cd0.data, {
        allowPlain: true
      });
      if (_0x2d0cbe) {
        return _0x2d0cbe;
      }
      const _0x2c21f7 = _0x344cd0.data.match(/^ANCHOR: (.+)$/);
      if (_0x2c21f7) {
        return {
          kind: "anchor",
          id: _0x2c21f7[1]
        };
      }
      return null;
    }
    function _0x3dcdfe(_0x79ad44) {
      if (_0x79ad44.type !== "tag" || _0x79ad44.name !== "p") {
        return false;
      }
      const _0x271d8c = _0xcbb94f(_0x79ad44);
      if (_0x271d8c.length !== 1) {
        return false;
      }
      const _0x52efb9 = _0x271d8c[0];
      if (_0x52efb9.type !== "tag" || _0x52efb9.name !== "strong") {
        return false;
      }
      if (!_0x52efb9.children || _0x52efb9.children.length === 0) {
        return false;
      }
      const _0x54c44a = _0x52efb9.children[0];
      return _0x54c44a.type === "text" && _0x54c44a.data.startsWith("EXPAND: ");
    }
    function _0x2ab8d3(_0x793500) {
      if (_0x793500.type !== "tag" || _0x793500.name !== "p") {
        return false;
      }
      const _0x33ee30 = _0xcbb94f(_0x793500);
      if (_0x33ee30.length !== 1) {
        return false;
      }
      const _0xdd2f62 = _0x33ee30[0];
      if (_0xdd2f62.type !== "tag" || _0xdd2f62.name !== "strong") {
        return false;
      }
      const _0x35926b = _0xcbb94f(_0xdd2f62);
      if (_0x35926b.length !== 1) {
        return false;
      }
      const _0x3b1c93 = _0x35926b[0];
      return _0x3b1c93.type === "text" && _0x3b1c93.data === "EXPAND_END";
    }
    function _0x50c6b2(_0x533265, {
      preserveDouble = false
    } = {}) {
      if (preserveDouble) {
        return _0x533265.replace(/&quot;/g, "\"").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
      }
      return _0x533265.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;/g, "'");
    }
    function _0x43f424(_0xeb1016, _0x344774) {
      const _0x152099 = _0xeb1016.attribs || {};
      const _0xfb9293 = _0x152099.href || "";
      const _0x5366f1 = _0x51a5af(_0xeb1016, _0x344774);
      if (_0xfb9293.startsWith("#")) {
        const _0x3d291d = _0xfb9293.slice(1);
        const _0x9317be = _0x50c6b2(_0x5366f1);
        return "<ac:link ac:anchor=\"" + _0x3d291d + "\"><ac:plain-text-link-body><![CDATA[" + _0x9317be + "]]></ac:plain-text-link-body></ac:link>";
      }
      switch (_0x344774.linkStyle) {
        case "smart":
          {
            const _0x3ad04d = {
              ..._0x152099
            };
            _0x3ad04d["data-card-appearance"] = "inline";
            const _0x3c4a5f = _0x3ad04d;
            return "<a" + _0x27a964(_0x3c4a5f) + ">" + _0x5366f1 + "</a>";
          }
        case "wiki":
          return "<ac:link><ri:url ri:value=\"" + _0xfb9293 + "\" /><ac:plain-text-link-body><![CDATA[" + _0x5366f1 + "]]></ac:plain-text-link-body></ac:link>";
        case "plain":
        default:
          return "<a" + _0x27a964(_0x152099) + ">" + _0x5366f1 + "</a>";
      }
    }
    function _0x201245(_0x4036de) {
      const _0x6c6885 = _0xcbb94f(_0x4036de);
      if (_0x6c6885.length === 0) {
        return null;
      }
      const _0x3facc3 = _0x6c6885[0];
      if (_0x3facc3.type !== "tag" || _0x3facc3.name !== "p") {
        return null;
      }
      const _0x1899ad = _0x3facc3.children || [];
      const _0x17a0df = _0x1899ad.findIndex(_0x2f1a08 => !_0x2fc294(_0x2f1a08));
      if (_0x17a0df < 0) {
        return null;
      }
      const _0x1774ba = _0x1899ad[_0x17a0df];
      if (_0x1774ba.type !== "tag" || _0x1774ba.name !== "strong") {
        return null;
      }
      const _0x23cd1f = _0xcbb94f(_0x1774ba);
      if (_0x23cd1f.length !== 1 || _0x23cd1f[0].type !== "text") {
        return null;
      }
      const _0x4e40ba = _0x14c42e.find(_0x43405e => _0x23cd1f[0].data === _0x43405e.toUpperCase());
      if (!_0x4e40ba) {
        return null;
      }
      const _0x3a975e = _0x1899ad.slice(_0x17a0df + 1);
      const _0x318358 = _0x3a975e.some(_0x4f13fc => !_0x2fc294(_0x4f13fc));
      if (_0x318358) {
        if (_0x3a975e[0].type !== "text" || !/^\s*\n/.test(_0x3a975e[0].data)) {
          return null;
        }
      }
      const _0x499ec4 = {
        marker: _0x4e40ba,
        sameLine: _0x318358,
        markerP: _0x3facc3,
        tail: _0x3a975e
      };
      return _0x499ec4;
    }
    function _0x1b560a(_0x4c0783, _0x308ce8) {
      const _0x9f3f28 = _0x201245(_0x4c0783);
      if (!_0x9f3f28) {
        return "<blockquote>" + _0x51a5af(_0x4c0783, _0x308ce8) + "</blockquote>";
      }
      const {
        marker: _0x59d12f,
        sameLine: _0x3dadab,
        markerP: _0x25ec7f,
        tail: _0x413ef7
      } = _0x9f3f28;
      const _0x4090c8 = _0x4c0783.children || [];
      let _0xe760a8;
      if (_0x3dadab) {
        const _0x120d22 = _0x413ef7.map(_0x13a8a1 => _0x3fa426(_0x13a8a1, _0x308ce8)).join("").replace(/^\s*\n/, "");
        const _0xe5ad8 = _0x4090c8.filter(_0x1bc645 => _0x1bc645 !== _0x25ec7f).map(_0x2a18fb => _0x3fa426(_0x2a18fb, _0x308ce8)).join("");
        _0xe760a8 = "<p>" + _0x120d22 + "</p>" + _0xe5ad8;
      } else {
        _0xe760a8 = _0x4090c8.filter(_0x452553 => _0x452553 !== _0x25ec7f).map(_0x5a57bf => _0x3fa426(_0x5a57bf, _0x308ce8)).join("").replace(/^\s+/, "");
      }
      return "<ac:structured-macro ac:name=\"" + _0x59d12f + "\">\n          <ac:rich-text-body>" + _0xe760a8 + "</ac:rich-text-body>\n        </ac:structured-macro>";
    }
    function _0x29b47c(_0x114428, _0x423b61) {
      const _0x22dc17 = _0x114428.children || [];
      let _0xb184df = null;
      let _0x704ece = [];
      for (const _0x16067a of _0x22dc17) {
        if (_0x16067a.type === "tag" && _0x16067a.name === "summary") {
          _0xb184df = _0x16067a;
        } else if (!_0x2fc294(_0x16067a)) {
          _0x704ece.push(_0x16067a);
        }
      }
      if (!_0xb184df) {
        return "<details" + _0x27a964(_0x114428.attribs) + ">" + _0x51a5af(_0x114428, _0x423b61) + "</details>";
      }
      const _0x3db685 = _0x51a5af(_0xb184df, _0x423b61);
      const _0x1af31e = _0x3db685.replace(/<[^>]+>/g, "").trim();
      const _0x54cfba = _0x704ece.map(_0x9f1ec1 => _0x3fa426(_0x9f1ec1, _0x423b61)).join("").trim();
      return "<ac:structured-macro ac:name=\"expand\"><ac:parameter ac:name=\"title\">" + _0x1af31e + "</ac:parameter><ac:rich-text-body>" + _0x54cfba + "</ac:rich-text-body></ac:structured-macro>";
    }
    function _0xe40930(_0x3054aa, _0x3c7087) {
      const _0x20601b = _0x3054aa.children || [];
      const _0x5bbc28 = _0x20601b.length === 1 && _0x20601b[0].type === "tag" && _0x20601b[0].name === "code";
      if (!_0x5bbc28) {
        return "<pre>" + _0x51a5af(_0x3054aa, _0x3c7087) + "</pre>";
      }
      const _0x259680 = _0x20601b[0];
      const _0xf2795b = _0x259680.attribs.class || "";
      const _0xf747aa = _0xf2795b.match(/language-(\w+)/);
      const _0xd58e8b = _0xf747aa ? _0xf747aa[1] : "text";
      let _0x30aaf8 = "";
      for (const _0x35c04c of _0x259680.children || []) {
        if (_0x35c04c.type === "text") {
          _0x30aaf8 += _0x35c04c.data;
        }
      }
      _0x30aaf8 = _0x50c6b2(_0x30aaf8.replace(/\n$/, ""), {
        preserveDouble: true
      }).replace(/]]>/g, "]]]]><![CDATA[>");
      switch (_0xd58e8b) {
        case "plantuml":
          return "<ac:structured-macro ac:name=\"plantuml\"><ac:plain-text-body><![CDATA[" + _0x30aaf8 + "]]></ac:plain-text-body></ac:structured-macro>";
        default:
          return "<ac:structured-macro ac:name=\"code\"><ac:parameter ac:name=\"language\">" + _0xd58e8b + "</ac:parameter><ac:plain-text-body><![CDATA[" + _0x30aaf8 + "]]></ac:plain-text-body></ac:structured-macro>";
      }
    }
    function _0x289f7a(_0xc0e199, _0x5169f8) {
      const {
        randomUUID: _0x39a252
      } = require("crypto");
      const _0x11dcc4 = _0x51a5af(_0xc0e199, _0x5169f8);
      const _0x371fb2 = _0x27a964(_0xc0e199.attribs);
      const _0x4292c6 = "<" + _0xc0e199.name + _0x371fb2 + ">";
      const _0x4e33e3 = "</" + _0xc0e199.name + ">";
      const _0x1e164e = _0x4292c6 + _0x11dcc4 + _0x4e33e3;
      const _0x1c74a9 = _0x1e164e.replace(/]]>/g, "]]]]><![CDATA[>");
      const _0x4a7ecc = _0x39a252();
      return "<ac:structured-macro ac:name=\"html\" ac:schema-version=\"1\" ac:macro-id=\"" + _0x4a7ecc + "\"><ac:plain-text-body><![CDATA[" + _0x1c74a9 + "]]></ac:plain-text-body></ac:structured-macro>";
    }
    function _0x44cd13(_0x566e35) {
      return String(_0x566e35).replace(/"/g, "&quot;");
    }
    function _0x27a964(_0x578376) {
      if (!_0x578376) {
        return "";
      }
      return Object.keys(_0x578376).map(_0x31223c => " " + _0x31223c + "=\"" + _0x44cd13(_0x578376[_0x31223c]) + "\"").join("");
    }
    function _0x51a5af(_0x4d865c, _0x5206bd) {
      if (!_0x4d865c.children) {
        return "";
      }
      const _0x35db9c = _0x4d865c.children;
      const _0xcad747 = [];
      let _0x49083e = 0;
      while (_0x49083e < _0x35db9c.length) {
        const _0x4a53b3 = _0x35db9c[_0x49083e];
        if (_0x3dcdfe(_0x4a53b3)) {
          const _0xc199de = _0x35db9c.findIndex((_0x48da2a, _0x311e6a) => _0x311e6a > _0x49083e && _0x2ab8d3(_0x48da2a));
          if (_0xc199de !== -1) {
            const _0x530887 = _0x4a53b3.children[0];
            const _0x1e846a = _0x51a5af(_0x530887, _0x5206bd).replace(/^EXPAND: /, "");
            const _0x460051 = _0x1e846a.replace(/<[^>]+>/g, "").trim();
            const _0x283ebf = _0x35db9c.slice(_0x49083e + 1, _0xc199de).map(_0x20a285 => _0x3fa426(_0x20a285, _0x5206bd)).join("").trim();
            _0xcad747.push("<ac:structured-macro ac:name=\"expand\"><ac:parameter ac:name=\"title\">" + _0x460051 + "</ac:parameter><ac:rich-text-body>" + _0x283ebf + "</ac:rich-text-body></ac:structured-macro>");
            _0x49083e = _0xc199de + 1;
            continue;
          }
        }
        _0xcad747.push(_0x3fa426(_0x4a53b3, _0x5206bd));
        _0x49083e++;
      }
      return _0xcad747.join("");
    }
    function _0x3fa426(_0x3cea50, _0xb2a8b0) {
      if (_0x3cea50.type === "text") {
        return _0x3cea50.data;
      }
      if (_0x3cea50.type === "comment") {
        const _0x4f241c = _0xd60a71(_0x3cea50.data);
        if (_0x4f241c && _0x4f241c.kind === "toc") {
          return "<ac:structured-macro ac:name=\"toc\" ac:schema-version=\"1\" />";
        }
        if (_0x4f241c && _0x4f241c.kind === "children") {
          return "<ac:structured-macro ac:name=\"children\" ac:schema-version=\"2\" />";
        }
        return "";
      }
      if (_0x3cea50.type !== "tag") {
        return "";
      }
      if (++_0xb2a8b0.depth > _0xb2a8b0.maxDepth) {
        _0xb2a8b0.depth--;
        throw new _0x12f8b5(_0xb2a8b0.maxDepth);
      }
      try {
        return _0x195680(_0x3cea50, _0xb2a8b0);
      } finally {
        _0xb2a8b0.depth--;
      }
    }
    function _0x195680(_0x27aa22, _0x555695) {
      switch (_0x27aa22.name) {
        case "p":
          {
            const _0x229033 = _0x2ec85e(_0x27aa22);
            if (_0x229033 && _0x229033.kind === "toc") {
              return "<ac:structured-macro ac:name=\"toc\" ac:schema-version=\"1\" />";
            }
            if (_0x229033 && _0x229033.kind === "children") {
              return "<ac:structured-macro ac:name=\"children\" ac:schema-version=\"2\" />";
            }
            if (_0x229033 && _0x229033.kind === "anchor") {
              return "<ac:structured-macro ac:name=\"anchor\"><ac:parameter ac:name=\"\">" + _0x229033.id + "</ac:parameter></ac:structured-macro>";
            }
            return "<p" + _0x27a964(_0x27aa22.attribs) + ">" + _0x51a5af(_0x27aa22, _0x555695) + "</p>";
          }
        case "h1":
        case "h2":
        case "h3":
        case "h4":
        case "h5":
        case "h6":
        case "strong":
        case "em":
          return "<" + _0x27aa22.name + _0x27a964(_0x27aa22.attribs) + ">" + _0x51a5af(_0x27aa22, _0x555695) + "</" + _0x27aa22.name + ">";
        case "hr":
          return "<hr />";
        case "br":
          return "<br />";
        case "img":
          return "<img" + _0x27a964(_0x27aa22.attribs) + ">";
        case "ul":
        case "ol":
          return "<" + _0x27aa22.name + _0x27a964(_0x27aa22.attribs) + ">" + _0x51a5af(_0x27aa22, _0x555695) + "</" + _0x27aa22.name + ">";
        case "li":
          {
            const _0x370a14 = _0x51a5af(_0x27aa22, _0x555695);
            const _0x23e022 = "<li" + _0x27a964(_0x27aa22.attribs) + ">";
            if (_0x4f98bb(_0x27aa22)) {
              return _0x23e022 + "<p>" + _0x370a14 + "</p></li>";
            } else {
              return "" + _0x23e022 + _0x370a14 + "</li>";
            }
          }
        case "pre":
          return _0xe40930(_0x27aa22, _0x555695);
        case "code":
          return "<code" + _0x27a964(_0x27aa22.attribs) + ">" + _0x51a5af(_0x27aa22, _0x555695) + "</code>";
        case "a":
          return _0x43f424(_0x27aa22, _0x555695);
        case "blockquote":
          return _0x1b560a(_0x27aa22, _0x555695);
        case "details":
          return _0x29b47c(_0x27aa22, _0x555695);
        case "table":
        case "thead":
        case "tbody":
        case "tfoot":
        case "tr":
          return "<" + _0x27aa22.name + _0x27a964(_0x27aa22.attribs) + ">" + _0x51a5af(_0x27aa22, _0x555695) + "</" + _0x27aa22.name + ">";
        case "th":
        case "td":
          {
            const _0x417d52 = _0x51a5af(_0x27aa22, _0x555695);
            const _0x40898a = "<" + _0x27aa22.name + _0x27a964(_0x27aa22.attribs) + ">";
            if (_0x4f98bb(_0x27aa22)) {
              return _0x40898a + "<p>" + _0x417d52 + "</p></" + _0x27aa22.name + ">";
            } else {
              return "" + _0x40898a + _0x417d52 + "</" + _0x27aa22.name + ">";
            }
          }
        default:
          if (_0x2cbe82.has(_0x27aa22.name)) {
            return "<" + _0x27aa22.name + _0x27a964(_0x27aa22.attribs) + " />";
          }
          if (_0x5a0b98.has(_0x27aa22.name)) {
            return _0x289f7a(_0x27aa22, _0x555695);
          }
          return "<" + _0x27aa22.name + _0x27a964(_0x27aa22.attribs) + ">" + _0x51a5af(_0x27aa22, _0x555695) + "</" + _0x27aa22.name + ">";
      }
    }
    function _0xce2ea8(_0x271153, _0x6878e5 = {}) {
      const _0x7cbea9 = !!_0x6878e5.isCloud;
      const _0x296329 = {
        isCloud: _0x7cbea9,
        linkStyle: _0x6878e5.linkStyle
      };
      const _0xafe4b2 = _0x1d723e(_0x296329);
      const _0x26011e = {
        linkStyle: _0xafe4b2,
        depth: 0,
        maxDepth: typeof _0x6878e5.maxDepth === "number" ? _0x6878e5.maxDepth : _0x40eb4f
      };
      return _0x51a5af(_0x572535(_0x271153, {
        decodeEntities: false
      }), _0x26011e);
    }
    const _0x5f430b = {
      htmlToStorage: _0xce2ea8,
      HtmlDepthExceededError: _0x12f8b5
    };
    _0x5225d8.exports = _0x5f430b;
  }
});
var MarkdownIt = require("markdown-it");
var {
  StorageWalker
} = require_storage_walker();
var {
  htmlToStorage
} = require_html_to_storage();
var {
  VALID_LINK_STYLES,
  resolveLinkStyle
} = require_link_style();
var CALLOUT_MARKERS = ["info", "warning", "note"];
var STASH_DELIM = "";
var PASSTHROUGH_TAG_RE = /<\/?(?:br|u|sub|sup|mark|details|summary)(?=[\s/>])(?:"[^"]*"|'[^']*'|[^>])*>/gi;
var PASSTHROUGH_BLOCK_RE = /<(svg|div)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi;
var INLINE_CODE_RE = /`[^`\n]+`/g;
function escapeXmlAttr(_0x370d2c) {
  return _0x370d2c.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
var MacroConverter = class {
  constructor({
    isCloud = false,
    webUrlPrefix = "",
    buildUrl = null,
    linkStyle = null
  } = {}) {
    this._isCloud = isCloud;
    this.webUrlPrefix = webUrlPrefix;
    this.buildUrl = buildUrl || (_0x2e6dfb => _0x2e6dfb);
    const _0x1ed075 = {
      isCloud: isCloud,
      linkStyle: linkStyle
    };
    this.linkStyle = resolveLinkStyle(_0x1ed075);
    this.markdown = new MarkdownIt();
    this.setupConfluenceMarkdownExtensions();
  }
  isCloud() {
    return this._isCloud;
  }
  setupConfluenceMarkdownExtensions() {
    this.markdown.enable(["table", "strikethrough", "linkify"]);
    this.markdown.core.ruler.before("normalize", "confluence_macros", _0x3b6852 => {
      const _0x4b4a06 = [];
      _0x3b6852.src = _0x3b6852.src.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`/g, _0x317cfe => {
        _0x4b4a06.push(_0x317cfe);
        return "" + STASH_DELIM + (_0x4b4a06.length - 1) + STASH_DELIM;
      });
      for (const _0x2d7520 of CALLOUT_MARKERS) {
        const _0x28c675 = new RegExp("(^|\\n)\\[!" + _0x2d7520 + "\\]\\s*([\\s\\S]*?)(?=\\n\\s*\\n|\\n\\s*\\[!|$)", "g");
        _0x3b6852.src = _0x3b6852.src.replace(_0x28c675, (_0x324808, _0x34fbf9, _0x7c43b1) => _0x34fbf9 + "> **" + _0x2d7520.toUpperCase() + "**\n> " + _0x7c43b1.trim().replace(/\n/g, "\n> "));
      }
      const _0x124ae6 = new RegExp(STASH_DELIM + "(\\d+)" + STASH_DELIM, "g");
      _0x3b6852.src = _0x3b6852.src.replace(_0x124ae6, (_0x5e840f, _0x519089) => _0x4b4a06[+_0x519089] ?? _0x5e840f);
    });
  }
  markdownToStorage(_0x1db9db) {
    return this.htmlToConfluenceStorage(this._renderMarkdownToHtml(_0x1db9db));
  }
  markdownToNativeStorage(_0x41a5d9) {
    return this.htmlToConfluenceStorage(this._renderMarkdownToHtml(_0x41a5d9));
  }
  _renderMarkdownToHtml(_0x288920) {
    const _0x8f6b58 = this._findCodeRanges(_0x288920);
    const _0x2d3e9c = [];
    const _0x212ccb = (_0x5eb7e8, _0x1c5146, _0x30a723) => {
      const _0x273a08 = "(^|\\n)([^\\S\\n]*)" + _0x1c5146 + "[^\\S\\n]*(?=\\n|$)";
      return _0x5eb7e8.replace(new RegExp(_0x273a08, "gi"), (_0x3121ab, _0x3d02ba, _0x4dbf98) => "" + _0x3d02ba + _0x4dbf98 + _0x30a723);
    };
    const _0x466905 = _0x1c43c9 => {
      let _0x4ae52f = _0x212ccb(_0x1c43c9, "<!--\\s*(?:\\[\\[)?_TOC_(?:\\]\\])?\\s*-->", "**TOC**");
      _0x4ae52f = _0x212ccb(_0x4ae52f, "<!--\\s*(?:\\[\\[)?_LISTING_(?:\\]\\])?\\s*-->", "**LISTING**");
      _0x4ae52f = _0x212ccb(_0x4ae52f, "\\[\\[_TOC_\\]\\]", "**TOC**");
      return _0x212ccb(_0x4ae52f, "\\[\\[_LISTING_\\]\\]", "**LISTING**");
    };
    const _0x317dc0 = _0x4447d2 => {
      let _0x448c5d = _0x466905(_0x4447d2).replace(PASSTHROUGH_BLOCK_RE, _0xd29962 => {
        _0x2d3e9c.push(_0xd29962);
        return STASH_DELIM + "H" + (_0x2d3e9c.length - 1) + STASH_DELIM;
      });
      _0x448c5d = _0x448c5d.replace(PASSTHROUGH_TAG_RE, _0x156d33 => {
        _0x2d3e9c.push(_0x156d33);
        return STASH_DELIM + "H" + (_0x2d3e9c.length - 1) + STASH_DELIM;
      });
      return _0x448c5d;
    };
    let _0x525f30 = "";
    let _0x1a0b2f = 0;
    for (const [_0x19ba94, _0x1e3db8] of _0x8f6b58) {
      _0x525f30 += _0x317dc0(_0x288920.slice(_0x1a0b2f, _0x19ba94));
      _0x525f30 += _0x288920.slice(_0x19ba94, _0x1e3db8);
      _0x1a0b2f = _0x1e3db8;
    }
    _0x525f30 += _0x317dc0(_0x288920.slice(_0x1a0b2f));
    const _0x204cd8 = this.markdown.render(_0x525f30);
    let _0x212c53 = 0;
    let _0x234f8e = false;
    return _0x204cd8.replace(new RegExp(STASH_DELIM + "H(\\d+)" + STASH_DELIM, "g"), (_0x580226, _0xd78eca, _0x2574d3) => {
      for (; _0x212c53 < _0x2574d3; _0x212c53++) {
        if (_0x204cd8[_0x212c53] === "<") {
          _0x234f8e = true;
        } else if (_0x204cd8[_0x212c53] === ">") {
          _0x234f8e = false;
        }
      }
      _0x212c53 = _0x2574d3 + _0x580226.length;
      const _0xef93b7 = _0x2d3e9c[+_0xd78eca];
      if (_0xef93b7 == null) {
        return _0x580226;
      }
      if (_0x234f8e) {
        return escapeXmlAttr(_0xef93b7);
      } else {
        return _0xef93b7;
      }
    });
  }
  _findCodeRanges(_0x57c33c) {
    const _0x469f11 = this.markdown.parse(_0x57c33c, {});
    const _0x4d6429 = [0];
    for (let _0x170f38 = 0; _0x170f38 < _0x57c33c.length; _0x170f38++) {
      if (_0x57c33c[_0x170f38] === "\n") {
        _0x4d6429.push(_0x170f38 + 1);
      }
    }
    const _0x15ae06 = _0x35100c => _0x35100c < _0x4d6429.length ? _0x4d6429[_0x35100c] : _0x57c33c.length;
    const _0x57a45d = [];
    for (const _0x47ff48 of _0x469f11) {
      if ((_0x47ff48.type === "code_block" || _0x47ff48.type === "fence") && _0x47ff48.map) {
        _0x57a45d.push([_0x15ae06(_0x47ff48.map[0]), _0x15ae06(_0x47ff48.map[1])]);
      }
    }
    INLINE_CODE_RE.lastIndex = 0;
    let _0x402945;
    while ((_0x402945 = INLINE_CODE_RE.exec(_0x57c33c)) !== null) {
      _0x57a45d.push([_0x402945.index, _0x402945.index + _0x402945[0].length]);
    }
    _0x57a45d.sort((_0xef7c41, _0x2d171f) => _0xef7c41[0] - _0x2d171f[0] || _0xef7c41[1] - _0x2d171f[1]);
    const _0x218dac = [];
    for (const _0x3ec982 of _0x57a45d) {
      const _0x1f3941 = _0x218dac[_0x218dac.length - 1];
      if (_0x1f3941 && _0x3ec982[0] <= _0x1f3941[1]) {
        _0x1f3941[1] = Math.max(_0x1f3941[1], _0x3ec982[1]);
      } else {
        _0x218dac.push([_0x3ec982[0], _0x3ec982[1]]);
      }
    }
    return _0x218dac;
  }
  htmlToConfluenceStorage(_0x2fc052) {
    const _0x3f7eb1 = {
      isCloud: this._isCloud,
      linkStyle: this.linkStyle
    };
    return htmlToStorage(_0x2fc052, _0x3f7eb1);
  }
  detectLanguageLabels(_0x49e1f1) {
    const _0xc2abca = {
      includePage: "Include Page",
      sharedBlock: "Shared Block",
      includeSharedBlock: "Include Shared Block",
      fromPage: "from page",
      expandDetails: "Expand Details"
    };
    if (/[\u4e00-\u9fa5]/.test(_0x49e1f1)) {
      _0xc2abca.includePage = "包含页面";
      _0xc2abca.sharedBlock = "共享块";
      _0xc2abca.includeSharedBlock = "包含共享块";
      _0xc2abca.fromPage = "来自页面";
      _0xc2abca.expandDetails = "展开详情";
    } else if (/[\u3040-\u309f\u30a0-\u30ff]/.test(_0x49e1f1)) {
      _0xc2abca.includePage = "ページを含む";
      _0xc2abca.sharedBlock = "共有ブロック";
      _0xc2abca.includeSharedBlock = "共有ブロックを含む";
      _0xc2abca.fromPage = "ページから";
      _0xc2abca.expandDetails = "詳細を表示";
    } else if (/[\uac00-\ud7af]/.test(_0x49e1f1)) {
      _0xc2abca.includePage = "페이지 포함";
      _0xc2abca.sharedBlock = "공유 블록";
      _0xc2abca.includeSharedBlock = "공유 블록 포함";
      _0xc2abca.fromPage = "페이지에서";
      _0xc2abca.expandDetails = "상세 보기";
    } else if (/[\u0400-\u04ff]/.test(_0x49e1f1)) {
      _0xc2abca.includePage = "Включить страницу";
      _0xc2abca.sharedBlock = "Общий блок";
      _0xc2abca.includeSharedBlock = "Включить общий блок";
      _0xc2abca.fromPage = "со страницы";
      _0xc2abca.expandDetails = "Подробнее";
    } else if ((_0x49e1f1.match(/[àâäéèêëïîôùûüÿœæç]/gi) || []).length >= 2) {
      _0xc2abca.includePage = "Inclure la page";
      _0xc2abca.sharedBlock = "Bloc partagé";
      _0xc2abca.includeSharedBlock = "Inclure le bloc partagé";
      _0xc2abca.fromPage = "de la page";
      _0xc2abca.expandDetails = "Détails";
    } else if ((_0x49e1f1.match(/[äöüß]/gi) || []).length >= 2) {
      _0xc2abca.includePage = "Seite einbinden";
      _0xc2abca.sharedBlock = "Gemeinsamer Block";
      _0xc2abca.includeSharedBlock = "Gemeinsamen Block einbinden";
      _0xc2abca.fromPage = "von Seite";
      _0xc2abca.expandDetails = "Details";
    } else if ((_0x49e1f1.match(/[áéíóúñ¿¡]/gi) || []).length >= 2) {
      _0xc2abca.includePage = "Incluir página";
      _0xc2abca.sharedBlock = "Bloque compartido";
      _0xc2abca.includeSharedBlock = "Incluir bloque compartido";
      _0xc2abca.fromPage = "de la página";
      _0xc2abca.expandDetails = "Detalles";
    }
    return _0xc2abca;
  }
  storageToMarkdown(_0xcd5594, _0x286708 = {}) {
    const _0x11e18b = _0x286708.attachmentsDir || "attachments";
    const _0x183bdc = this.detectLanguageLabels(_0xcd5594);
    const _0x485e0e = {
      attachmentsDir: _0x11e18b,
      labels: _0x183bdc,
      buildUrl: this.buildUrl,
      webUrlPrefix: this.webUrlPrefix
    };
    const _0x305db2 = new StorageWalker(_0x485e0e);
    const _0x4875a2 = _0x305db2.walk(_0xcd5594);
    if (typeof _0x286708.onWarnings === "function" && _0x305db2.warnings.length > 0) {
      _0x286708.onWarnings(_0x305db2.warnings);
    }
    return _0x4875a2;
  }
};
module.exports = MacroConverter;
module.exports.VALID_LINK_STYLES = VALID_LINK_STYLES;