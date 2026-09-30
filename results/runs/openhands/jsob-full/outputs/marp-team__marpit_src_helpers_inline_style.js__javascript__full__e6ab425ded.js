const inlineStyleExports = {};
Object.defineProperty(inlineStyleExports, '__esModule', { value: true });
Object.defineProperty(inlineStyleExports, 'InlineStyle', {
  get: () => InlineStyle,
  enumerable: true,
});
module.exports = inlineStyleExports;

const postcss = require('postcss');

const InlineStyle = class _InlineStyle {
  constructor(style) {
    this.decls = {};

    if (!style) return;

    if (style instanceof _InlineStyle || typeof style === 'string') {
      const root = postcss.parse(style.toString(), { from: void 0 });
      root.walkDecls((declaration) => {
        if (declaration.parent === root) {
          this.decls[declaration.prop] = declaration.value;
        }
      });
    } else {
      this.decls = { ...style };
    }
  }

  delete(property) {
    delete this.decls[property];
    return this;
  }

  set(property, value) {
    this.decls[property] = value;
    return this;
  }

  toString() {
    let serializedStyle = '';

    for (const property of Object.keys(this.decls)) {
      let declarationRoot;
      try {
        declarationRoot = postcss.parse(property + ':' + this.decls[property], {
          from: void 0,
        });
      } catch {
        continue;
      }

      if (!declarationRoot) continue;

      declarationRoot.walkDecls((declaration) => {
        if (declaration.parent !== declarationRoot || declaration.prop !== property) {
          declaration.remove();
        }
      });
      serializedStyle += declarationRoot.toString() + ';';
    }

    return serializedStyle;
  }
};
