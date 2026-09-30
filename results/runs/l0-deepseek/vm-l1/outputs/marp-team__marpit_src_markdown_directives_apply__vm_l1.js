const __commonJS = (cb, mod) => function __require() {
  return cb((mod = { exports: {} }).exports, mod), mod.exports;
};

const require_plugin = __commonJS((exports, module) => {
  "use strict";
  module.exports = (marpit) => {
    marpit.themeSet.metaType = Object.assign(marpit.themeSet.metaType || {}, {
      "inline-style": String,
    });
  };
});

var apply_exports = {};
__export(apply_exports, {
  apply: () => apply,
  default: () => apply_default
});
module.exports = __toCommonJS(apply_exports);

var import_postcss = require("postcss");

class InlineStyle {
  constructor(style) {
    this.style = style;
  }
  postcss(root) {
    root.walkDecls((decl) => {
      decl.value = `var(--${decl.prop}, ${decl.value})`;
    });
  }
  set(root, style) {
    root.walkDecls((decl) => {
      decl.value = `var(--${decl.prop}, ${decl.value})`;
    });
  }
  toString() {
    return this.style;
  }
}

var globals = Object.assign(Object.create(null), {
  headingDivider: (value) => value,
  style: (value) => value,
  theme: (value, fallback) => value || fallback,
  lang: (value) => value
});

var locals = Object.assign(Object.create(null), {
  backgroundColor: (value) => value,
  backgroundImage: (value) => value,
  backgroundPosition: (value) => value,
  backgroundRepeat: (value) => value,
  backgroundSize: (value) => value,
  class: (value) => value,
  color: (value) => value,
  footer: (value) => value,
  header: (value) => value,
  paginate: (value) => value
});

var directives_default = [...Object.keys(globals), ...Object.keys(locals)];

var import_lodash = __toESM(require("lodash.kebabcase"));
var import_plugin = __toESM(require_plugin());

function _apply(marpit) {
  marpit.use(import_plugin.default);

  marpit.themeSet.metaType = Object.assign(marpit.themeSet.metaType || {}, {
    "inline-style": String,
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline") return true;
        const match = child.content.match(/^<style\s*>([\s\S]*)<\/style>$/i);
        if (!match) return true;
        const style = match[1];
        const inlineStyle = new InlineStyle(style);
        child.content = inlineStyle.toString();
        return true;
      });
    }
  });

  marpit.core.ruler.after("inline", (state) => {
    const { tokens } = state;
    for (const token of tokens) {
      if (token.type !== "inline") continue;
      token.children = token.children.filter((child) => {
        if (child.type !== "html_inline")
