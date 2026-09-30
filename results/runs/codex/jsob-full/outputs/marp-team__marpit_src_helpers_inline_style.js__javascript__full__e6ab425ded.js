'use strict';

const postcss = require('postcss');

class InlineStyle {
  constructor(input) {
    this.decls = {};
    if (!input) return;
    if (input instanceof InlineStyle) {
      this.decls = { ...input.decls };
      return;
    }
    if (typeof input !== 'string') {
      this.decls = { ...input };
      return;
    }
    const root = postcss.parse(input, { from: undefined });
    root.walkDecls((declaration) => {
      this.decls[declaration.prop] = declaration.value.replace(/\s*!important\s*$/, '');
    });
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
    let result = '';
    for (const property of Object.keys(this.decls)) {
      let declaration;
      try {
        declaration = postcss.parse(`${property}:${this.decls[property]}`, { from: undefined }).first;
      } catch {
        continue;
      }
      if (!declaration) continue;
      if (this.decls[property] === '!important') {
        result += `${property}:!important;`;
        continue;
      }
      declaration.raws.before = '';
      declaration.raws.between = ':';
      declaration.raws.value = { raw: String(this.decls[property]), value: String(this.decls[property]) };
      declaration.raws.important = false;
      declaration.raws.semicolon = false;
      result += declaration.toString() + ';';
    }
    return result;
  }
}

module.exports = { default: InlineStyle };
