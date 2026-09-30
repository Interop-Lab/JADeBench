"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const __commonJS = (cb) => {
  let module = { exports: {} };
  cb(module, module.exports);
  return module.exports;
};

const require_plugin = __commonJS((module, exports) => {
  function marpitPlugin(fn) {
    const marpitPlugin = function (markdownit, ...params) {
      if (markdownit.marpit) return fn.call(this, markdownit, ...params);
      throw new Error("Marpit plugin can only be used by Marpit.");
    };
    Object.defineProperty(marpitPlugin, "marpit", { value: marpitPlugin });
    Object.defineProperty(marpitPlugin, "marpitPlugin", { value: marpitPlugin });
    Object.defineProperty(marpitPlugin, "default", { value: marpitPlugin });
    exports.marpitPlugin = marpitPlugin;
  }
  module.exports = marpitPlugin;
});

const import_plugin = require_plugin();

function split(tokens, separator, includeSeparator = false) {
  const result = [[]];
  for (const token of tokens) {
    if (token === separator) {
      result.push(includeSeparator ? [token] : []);
    } else {
      result[result.length - 1].push(token);
    }
  }
  return result;
}

var split_default = split;

function wrapTokens(Token, prefix, token, tokens = []) {
  const { tag } = token;
  for (const t of tokens) t.level += 1;

  const openToken = new Token(`${prefix}_open`, tag, 1);
  const closeToken = new Token(`${prefix}_close`, tag, -1);

  var openAttrs = { ...token.open || {} };
  Object.assign(openToken, openAttrs);

  var closeAttrs = { ...token.close || {} };
  Object.assign(closeToken, closeAttrs);

  for (const key of Object.keys(token)) {
    if (!["open", "close", "tag"].includes(key) && token[key] != null) {
      openToken[key] = token[key];
    }
  }

  return [openToken, ...tokens, closeToken];
}

var wrap_tokens_default = wrapTokens;

const defaultAnchorCallback = (index) => `${index + 1}`;

function _slide(md, opts = {}) {
  const anchor = opts.anchor !== void 0 ? !!opts.anchor : opts.anchor;
  const anchorCallback = (() => {
    if (typeof anchor === "function") return anchor;
    if (anchor) return defaultAnchorCallback;
    return () => void 0;
  })();

  md.core.ruler.after("normalize", "marpit_slide", (state) => {
    if (state.inlineMode) return;

    const splitted = split(state.tokens, (t) => t.type === "hr" && t.level === 0, true);
    const { length } = splitted;

    state.tokens = splitted.reduce((acc, tokens, slideNum) => {
      const firstHr = tokens[0] && tokens[0].type === "hr" ? tokens[0] : void 0;
      const map = firstHr || tokens.find((t) => t.map);

      return [
        ...acc,
        ...wrapTokens(
          state.Token,
          "marpit_slide",
          {
            ...(opts.slideContainer || {}),
            tag: "section",
            id: anchorCallback(slideNum),
            open: {
              block: true,
              meta: { marpitSlide: slideNum, marpitSlideTotal: length, marpitSlideElement: 1 },
              map: map ? map.map : [0, 0],
            },
            close: {
              block: true,
              meta: { marpitSlide: slideNum, marpitSlideTotal: length, marpitSlideElement: -1 },
            },
          },
          tokens.slice(firstHr ? 1 : 0)
        ),
      ];
    }, []);
  });
}

const slide = import_plugin(_slide);
var slide_default = slide;

exports.defaultAnchorCallback = defaultAnchorCallback;
exports.slide = slide;
