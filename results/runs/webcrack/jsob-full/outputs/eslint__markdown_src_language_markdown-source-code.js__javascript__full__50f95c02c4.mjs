var lineEndingPattern = /\r\n|[\r\n]/u;
var illegalShorthandTailPattern = /\]\[\s+\]$/u;
var htmlCommentPattern = /<!--[\s\S]*?-->/gu;
function frontmatterHasTitle(_0x27dd3d, _0x800aaf) {
  if (!_0x800aaf) {
    return false;
  }
  const _0x52e6ce = _0x27dd3d.split(lineEndingPattern);
  for (const _0x1b2e15 of _0x52e6ce) {
    if (_0x800aaf.test(_0x1b2e15)) {
      return true;
    }
  }
  return false;
}
function stripHtmlComments(_0x4d493f) {
  return _0x4d493f.replace(htmlCommentPattern, _0x268123 => _0x268123.replace(/[^\r\n]/g, " "));
}
import { VisitNodeStep, TextSourceCodeBase, ConfigCommentParser, Directive } from "@eslint/plugin-kit";
var commentParser = new ConfigCommentParser();
var configCommentStart = /<!--\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|-->)/u;
var htmlComment = /<!--(.*?)-->/gsu;
var InlineConfigComment = class {
  value;
  position;
  constructor({
    value: _0x17d791,
    position: _0x6835a8
  }) {
    this.value = _0x17d791.trim();
    this.position = _0x6835a8;
  }
};
function extractInlineConfigCommentsFromHTML(_0x21afd0, _0x2fcee7) {
  if (!configCommentStart.test(_0x21afd0.value)) {
    return [];
  }
  const _0x12293f = [];
  let _0x16d634;
  while (_0x16d634 = htmlComment.exec(_0x21afd0.value)) {
    if (configCommentStart.test(_0x16d634[0])) {
      const _0x3f8e68 = _0x16d634.index + _0x21afd0.position.start.offset;
      const _0x5b34eb = _0x3f8e68 + _0x16d634[0].length;
      _0x12293f.push(new InlineConfigComment({
        value: _0x16d634[1].trim(),
        position: {
          start: {
            ..._0x2fcee7.getLocFromIndex(_0x3f8e68),
            offset: _0x3f8e68
          },
          end: {
            ..._0x2fcee7.getLocFromIndex(_0x5b34eb),
            offset: _0x5b34eb
          }
        }
      }));
    }
  }
  return _0x12293f;
}
var MarkdownSourceCode = class extends TextSourceCodeBase {
  #steps;
  #parents = new WeakMap();
  #htmlNodes = [];
  #inlineConfigComments;
  ast = undefined;
  constructor({
    text: _0x27eabc,
    ast: _0x4507ca
  }) {
    const _0x548e74 = {
      ast: _0x4507ca,
      text: _0x27eabc,
      lineEndingPattern: lineEndingPattern
    };
    super(_0x548e74);
    this.ast = _0x4507ca;
    this.traverse();
  }
  getParent(_0x5d081d) {
    return this.#parents.get(_0x5d081d);
  }
  getInlineConfigNodes() {
    if (!this.#inlineConfigComments) {
      this.#inlineConfigComments = this.#htmlNodes.flatMap(_0x451e13 => extractInlineConfigCommentsFromHTML(_0x451e13, this));
    }
    return this.#inlineConfigComments;
  }
  getDisableDirectives() {
    const _0xdaddbc = [];
    const _0x14e60f = [];
    this.getInlineConfigNodes().forEach(_0x5b6515 => {
      const {
        label: _0x5e36d4,
        value: _0x3a94b8,
        justification: _0x580104
      } = commentParser.parseDirective(_0x5b6515.value);
      if (_0x5e36d4 === "eslint-disable-line" && _0x5b6515.position.start.line !== _0x5b6515.position.end.line) {
        const _0x5d89ea = _0x5e36d4 + " comment should not span multiple lines.";
        const _0x97b8a6 = {
          ruleId: null,
          message: _0x5d89ea,
          loc: _0x5b6515.position
        };
        _0xdaddbc.push(_0x97b8a6);
        return;
      }
      switch (_0x5e36d4) {
        case "eslint-disable":
        case "eslint-enable":
        case "eslint-disable-next-line":
        case "eslint-disable-line":
          {
            const _0x24b607 = _0x5e36d4.slice("eslint-".length);
            const _0x24e8b0 = {
              type: _0x24b607,
              node: _0x5b6515,
              value: _0x3a94b8,
              justification: _0x580104
            };
            _0x14e60f.push(new Directive(_0x24e8b0));
          }
      }
    });
    const _0x796af6 = {
      problems: _0xdaddbc,
      directives: _0x14e60f
    };
    return _0x796af6;
  }
  applyInlineConfig() {
    const _0xfd46bc = [];
    const _0x1625c0 = [];
    this.getInlineConfigNodes().forEach(_0x5c884a => {
      const {
        label: _0x15c86f,
        value: _0x2483bb
      } = commentParser.parseDirective(_0x5c884a.value);
      if (_0x15c86f === "eslint") {
        const _0x45c584 = commentParser.parseJSONLikeConfig(_0x2483bb);
        if (_0x45c584.ok) {
          const _0x47308c = {
            rules: _0x45c584.config
          };
          const _0x34f6fd = {
            config: _0x47308c,
            loc: _0x5c884a.position
          };
          _0x1625c0.push(_0x34f6fd);
        } else {
          const _0x2fc98b = {
            ruleId: null,
            message: _0x45c584.error.message,
            loc: _0x5c884a.position
          };
          _0xfd46bc.push(_0x2fc98b);
        }
      }
    });
    const _0x4b2a45 = {
      configs: _0x1625c0,
      problems: _0xfd46bc
    };
    return _0x4b2a45;
  }
  traverse() {
    if (this.#steps) {
      return this.#steps.values();
    }
    const _0x293f67 = this.#steps = [];
    const _0x2a5ae6 = (_0x1fbbed, _0x29b040) => {
      this.#parents.set(_0x1fbbed, _0x29b040);
      const _0x7f8f9b = {
        target: _0x1fbbed,
        phase: 1,
        args: [_0x1fbbed, _0x29b040]
      };
      _0x293f67.push(new VisitNodeStep(_0x7f8f9b));
      if (_0x1fbbed.type === "html") {
        this.#htmlNodes.push(_0x1fbbed);
      }
      if ("children" in _0x1fbbed) {
        const _0x117c72 = _0x1fbbed;
        _0x117c72.children.forEach(_0x28ac54 => {
          _0x2a5ae6(_0x28ac54, _0x117c72);
        });
      }
      const _0x5950dc = {
        target: _0x1fbbed,
        phase: 2,
        args: [_0x1fbbed, _0x29b040]
      };
      _0x293f67.push(new VisitNodeStep(_0x5950dc));
    };
    _0x2a5ae6(this.ast);
    return _0x293f67.values();
  }
};
export { InlineConfigComment, MarkdownSourceCode };