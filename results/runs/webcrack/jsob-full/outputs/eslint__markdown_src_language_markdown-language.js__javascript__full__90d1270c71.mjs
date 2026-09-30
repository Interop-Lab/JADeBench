var lineEndingPattern = /\r\n|[\r\n]/u;
var illegalShorthandTailPattern = /\]\[\s+\]$/u;
var htmlCommentPattern = /<!--[\s\S]*?-->/gu;
function frontmatterHasTitle(_0x1859ab, _0x2a74cb) {
  if (!_0x2a74cb) {
    return false;
  }
  const _0x1e052d = _0x1859ab.split(lineEndingPattern);
  for (const _0x3cda43 of _0x1e052d) {
    if (_0x2a74cb.test(_0x3cda43)) {
      return true;
    }
  }
  return false;
}
function stripHtmlComments(_0x3d2271) {
  return _0x3d2271.replace(htmlCommentPattern, _0x1bef77 => _0x1bef77.replace(/[^\r\n]/g, " "));
}
import { VisitNodeStep, TextSourceCodeBase, ConfigCommentParser, Directive } from "@eslint/plugin-kit";
var commentParser = new ConfigCommentParser();
var configCommentStart = /<!--\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|-->)/u;
var htmlComment = /<!--(.*?)-->/gsu;
var InlineConfigComment = class {
  value;
  position;
  constructor({
    value: _0x4a3a4c,
    position: _0x21cb4b
  }) {
    this.value = _0x4a3a4c.trim();
    this.position = _0x21cb4b;
  }
};
function extractInlineConfigCommentsFromHTML(_0x2e0a25, _0x56f2b1) {
  if (!configCommentStart.test(_0x2e0a25.value)) {
    return [];
  }
  const _0x197ff7 = [];
  let _0x4efc03;
  while (_0x4efc03 = htmlComment.exec(_0x2e0a25.value)) {
    if (configCommentStart.test(_0x4efc03[0])) {
      const _0x4c44c3 = _0x4efc03.index + _0x2e0a25.position.start.offset;
      const _0x3080aa = _0x4c44c3 + _0x4efc03[0].length;
      _0x197ff7.push(new InlineConfigComment({
        value: _0x4efc03[1].trim(),
        position: {
          start: {
            ..._0x56f2b1.getLocFromIndex(_0x4c44c3),
            offset: _0x4c44c3
          },
          end: {
            ..._0x56f2b1.getLocFromIndex(_0x3080aa),
            offset: _0x3080aa
          }
        }
      }));
    }
  }
  return _0x197ff7;
}
var MarkdownSourceCode = class extends TextSourceCodeBase {
  #steps;
  #parents = new WeakMap();
  #htmlNodes = [];
  #inlineConfigComments;
  ast = undefined;
  constructor({
    text: _0x1acb84,
    ast: _0x206fe2
  }) {
    const _0x168ec9 = {
      ast: _0x206fe2,
      text: _0x1acb84,
      lineEndingPattern: lineEndingPattern
    };
    super(_0x168ec9);
    this.ast = _0x206fe2;
    this.traverse();
  }
  getParent(_0x326922) {
    return this.#parents.get(_0x326922);
  }
  getInlineConfigNodes() {
    if (!this.#inlineConfigComments) {
      this.#inlineConfigComments = this.#htmlNodes.flatMap(_0x162cc2 => extractInlineConfigCommentsFromHTML(_0x162cc2, this));
    }
    return this.#inlineConfigComments;
  }
  getDisableDirectives() {
    const _0x5bb48a = [];
    const _0x37994d = [];
    this.getInlineConfigNodes().forEach(_0x4d2347 => {
      const {
        label: _0x381fe8,
        value: _0x4a00f7,
        justification: _0x405e7e
      } = commentParser.parseDirective(_0x4d2347.value);
      if (_0x381fe8 === "eslint-disable-line" && _0x4d2347.position.start.line !== _0x4d2347.position.end.line) {
        const _0x35feb = _0x381fe8 + " comment should not span multiple lines.";
        const _0x426512 = {
          ruleId: null,
          message: _0x35feb,
          loc: _0x4d2347.position
        };
        _0x5bb48a.push(_0x426512);
        return;
      }
      switch (_0x381fe8) {
        case "eslint-disable":
        case "eslint-enable":
        case "eslint-disable-next-line":
        case "eslint-disable-line":
          {
            const _0x11a152 = _0x381fe8.slice("eslint-".length);
            const _0x14e14a = {
              type: _0x11a152,
              node: _0x4d2347,
              value: _0x4a00f7,
              justification: _0x405e7e
            };
            _0x37994d.push(new Directive(_0x14e14a));
          }
      }
    });
    const _0x52c541 = {
      problems: _0x5bb48a,
      directives: _0x37994d
    };
    return _0x52c541;
  }
  applyInlineConfig() {
    const _0xe89571 = [];
    const _0x4b801f = [];
    this.getInlineConfigNodes().forEach(_0x23edaf => {
      const {
        label: _0xcb2d3f,
        value: _0x517840
      } = commentParser.parseDirective(_0x23edaf.value);
      if (_0xcb2d3f === "eslint") {
        const _0x1b08e8 = commentParser.parseJSONLikeConfig(_0x517840);
        if (_0x1b08e8.ok) {
          const _0x236964 = {
            rules: _0x1b08e8.config
          };
          const _0xe48c35 = {
            config: _0x236964,
            loc: _0x23edaf.position
          };
          _0x4b801f.push(_0xe48c35);
        } else {
          const _0xca6021 = {
            ruleId: null,
            message: _0x1b08e8.error.message,
            loc: _0x23edaf.position
          };
          _0xe89571.push(_0xca6021);
        }
      }
    });
    const _0x29f1cb = {
      configs: _0x4b801f,
      problems: _0xe89571
    };
    return _0x29f1cb;
  }
  traverse() {
    if (this.#steps) {
      return this.#steps.values();
    }
    const _0x1db789 = this.#steps = [];
    const _0x1d2f12 = (_0x54c722, _0x34fa46) => {
      this.#parents.set(_0x54c722, _0x34fa46);
      const _0x4a3e6b = {
        target: _0x54c722,
        phase: 1,
        args: [_0x54c722, _0x34fa46]
      };
      _0x1db789.push(new VisitNodeStep(_0x4a3e6b));
      if (_0x54c722.type === "html") {
        this.#htmlNodes.push(_0x54c722);
      }
      if ("children" in _0x54c722) {
        const _0x4ff634 = _0x54c722;
        _0x4ff634.children.forEach(_0x47f4a6 => {
          _0x1d2f12(_0x47f4a6, _0x4ff634);
        });
      }
      const _0x238e24 = {
        target: _0x54c722,
        phase: 2,
        args: [_0x54c722, _0x34fa46]
      };
      _0x1db789.push(new VisitNodeStep(_0x238e24));
    };
    _0x1d2f12(this.ast);
    return _0x1db789.values();
  }
};
import { fromMarkdown } from "mdast-util-from-markdown";
import { frontmatterFromMarkdown } from "mdast-util-frontmatter";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { mathFromMarkdown } from "mdast-util-math";
import { frontmatter } from "micromark-extension-frontmatter";
import { gfm } from "micromark-extension-gfm";
import { math } from "micromark-extension-math";
var jsonFrontmatterConfig = {
  type: "json",
  marker: "-"
};
function createParserOptions(_0x5cb88c, _0xce1516) {
  const _0x30e3f5 = [];
  const _0x263233 = [];
  if (_0x5cb88c === "gfm") {
    _0x30e3f5.push(gfm());
    _0x263233.push(gfmFromMarkdown());
  }
  const _0x10fabb = _0xce1516?.frontmatter;
  if (_0x10fabb !== false) {
    if (_0x10fabb === "yaml") {
      _0x30e3f5.push(frontmatter(["yaml"]));
      _0x263233.push(frontmatterFromMarkdown(["yaml"]));
    } else if (_0x10fabb === "toml") {
      _0x30e3f5.push(frontmatter(["toml"]));
      _0x263233.push(frontmatterFromMarkdown(["toml"]));
    } else if (_0x10fabb === "json") {
      _0x30e3f5.push(frontmatter(jsonFrontmatterConfig));
      _0x263233.push(frontmatterFromMarkdown(jsonFrontmatterConfig));
    }
  }
  const _0x4ffad1 = _0xce1516?.math;
  if (_0x4ffad1 === true) {
    _0x30e3f5.push(math());
    _0x263233.push(mathFromMarkdown());
  }
  const _0x9bc03b = {
    extensions: _0x30e3f5,
    mdastExtensions: _0x263233
  };
  return _0x9bc03b;
}
const _0x209fbb = {
  frontmatter: false,
  math: false
};
var MarkdownLanguage = class {
  fileType = "text";
  lineStart = 1;
  columnStart = 1;
  nodeTypeKey = "type";
  defaultLanguageOptions = _0x209fbb;
  #mode = "commonmark";
  constructor({
    mode: _0x40c784
  } = {}) {
    if (_0x40c784) {
      this.#mode = _0x40c784;
    }
  }
  validateLanguageOptions(_0x311041) {
    const _0x2cce78 = _0x311041?.frontmatter;
    const _0x330059 = new Set([false, "yaml", "toml", "json"]);
    if (_0x2cce78 !== undefined && !_0x330059.has(_0x2cce78)) {
      throw new Error("Invalid language option value `" + _0x2cce78 + "` for frontmatter. Expected one of `false`, `\"yaml\"`, `\"toml\"`, or `\"json\"`.");
    }
    const _0x1e239b = _0x311041?.math;
    if (_0x1e239b !== undefined && typeof _0x1e239b !== "boolean") {
      throw new Error("Invalid language option value `" + _0x1e239b + "` for math. Expected a boolean.");
    }
  }
  parse(_0x355433, _0x319a5c) {
    const _0x56b979 = _0x355433.body;
    try {
      const _0x540495 = createParserOptions(this.#mode, _0x319a5c?.languageOptions);
      const _0x5c5d7a = fromMarkdown(_0x56b979, _0x540495);
      const _0x1a9de9 = {
        ok: true,
        ast: _0x5c5d7a
      };
      return _0x1a9de9;
    } catch (_0x11f614) {
      const _0x4b3ed4 = {
        ok: false,
        errors: [_0x11f614]
      };
      return _0x4b3ed4;
    }
  }
  createSourceCode(_0x21f083, _0x5982b5) {
    const _0x79d80b = {
      text: _0x21f083.body,
      ast: _0x5982b5.ast
    };
    return new MarkdownSourceCode(_0x79d80b);
  }
};
export { MarkdownLanguage };