'use strict';

const postcss = require('postcss');

const InlineStyle = class _InlineStyle {
  constructor(style) {
    this.decls = {};

    if (typeof style === 'string') {
      const root = postcss.parse(style, { from: undefined });
      for (const node of root.nodes) {
        if (node.type === 'decl') this.decls[node.prop] = node.value;
      }
    } else if (style !== null && style !== undefined) {
      for (const property of Reflect.ownKeys(Object(style))) {
        const descriptor = Object.getOwnPropertyDescriptor(style, property);
        if (descriptor && descriptor.enumerable) {
          Object.defineProperty(this.decls, property, {
            value: style[property],
            writable: true,
            enumerable: true,
            configurable: true,
          });
        }
      }
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
    return Object.entries(this.decls)
      .map(([property, value]) => {
        try {
          const root = postcss.parse(`${property}:${value}`, { from: undefined });
          if (!root.first || root.first.type !== 'decl') return '';
          return root.first.prop === property
            ? `${property}:${value};`
            : ';';
        } catch {
          return '';
        }
      })
      .join('');
  }
};

Object.defineProperty(exports, '__esModule', { value: true });
Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: () => InlineStyle,
});
