const __commonJS = (cb, mod) => function __require() {
  return cb((mod = { exports: {} }).exports, mod), mod.exports;
};

const require_plugin = __commonJS((exports, module) => {
  "use strict";
  module.exports = (md) => {
    md.core.ruler.push("marpit_slide", (state) => {
      if (state.env.marpitSlide === false) return;
      const tokens = [];
      let cursor = 0;
      for (const token of state.tokens) {
        if (token.type === "inline" && token.content === "---") {
          tokens.push(new state.Token("marpit_slide_open", "section", 1));
          tokens.push(new state.Token("marpit_slide_close", "section", -1));
          cursor = 0;
        } else {
          if (cursor === 0) {
            tokens.push(new state.Token("marpit_slide_open", "section", 1));
          }
          tokens.push(token);
          cursor++;
        }
      }
      if (cursor > 0) {
        tokens.push(new state.Token("marpit_slide_close", "section", -1));
      }
      state.tokens = tokens;
    });
  };
});

const slide_exports = {};
__export(slide_exports, {
  default: () => slide_default,
  defaultAnchorCallback: () => defaultAnchorCallback,
  slide: () => slide
});
module.exports = __toCommonJS(slide_exports);

function split(marpit, markdown) {
  const tokens = marpit.parse(markdown);
  const slides = [];
  let current = [];
  for (const token of tokens) {
    if (token.type === "marpit_slide_open") {
      current = [];
    } else if (token.type === "marpit_slide_close") {
      slides.push(current);
    } else {
      current.push(token);
    }
  }
  return slides;
}

var split_default = split;

function wrapTokens(tokens, marpit) {
  const wrapped = [];
  for (const slide of tokens) {
    const state = new marpit.core.State("", {}, []);
    state.tokens = slide;
    marpit.core.process(state);
    wrapped.push(state.tokens);
  }
  return wrapped;
}

var wrap_tokens_default = wrapTokens;

var import_plugin = __toESM(require_plugin());

function defaultAnchorCallback(element) {
  const id = element.getAttribute("id");
  if (id) return id;
  const text = element.textContent.trim().toLowerCase().replace(/[^\w\- ]/g, "").replace(/ /g, "-");
  return text || "slide";
}

function _slide(marpit) {
  return function slide(markdown) {
    const tokens = split(marpit, markdown);
    const wrapped = wrapTokens(tokens, marpit);
    return wrapped.map((tokens, index) => {
      const element = document.createElement("section");
      element.className = "slide";
      element.id = defaultAnchorCallback(element) || `${index + 1}`;
      element.innerHTML = marpit.renderer.render(tokens, marpit.options, {});
      return element;
    });
  };
}

var slide = (0, import_plugin.default)(_slide);
var slide_default = slide;
