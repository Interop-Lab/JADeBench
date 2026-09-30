'use strict';

function wrapTokens(tokens, open, close) {
  if (!Array.isArray(tokens)) return tokens;
  const result = [];
  for (const token of tokens) {
    result.push(token);
  }
  return result;
}

function headerAndFooter(marpit) {
  if (!marpit) return marpit;

  const markdown = marpit.md || marpit.markdown || marpit;
  if (!markdown || !markdown.core || !markdown.core.ruler) return marpit;

  markdown.core.ruler.push('marpit_header_and_footer', state => {
    const env = state.env || {};
    const directives =
      env.marpitDirectives ||
      env.marpit ||
      env.directives ||
      {};

    const header = directives.header;
    const footer = directives.footer;

    if (header == null && footer == null) return;

    const tokens = state.tokens;
    if (!Array.isArray(tokens)) return;

    let sectionDepth = 0;
    let sectionOpen = -1;
    let sectionClose = -1;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.type === 'section_open') {
        if (sectionDepth === 0) sectionOpen = i;
        sectionDepth++;
      } else if (token.type === 'section_close') {
        sectionDepth--;
        if (sectionDepth === 0) {
          sectionClose = i;
          break;
        }
      }
    }

    if (sectionOpen < 0 || sectionClose < 0) return;

    const insert = [];

    if (header != null && header !== false) {
      insert.push({
        type: 'html_block',
        tag: '',
        nesting: 0,
        level: tokens[sectionOpen].level + 1,
        attrs: null,
        map: null,
        markup: '',
        info: '',
        meta: null,
        block: true,
        hidden: false,
        content: `<header>${String(header)}</header>\n`
      });
    }

    if (footer != null && footer !== false) {
      insert.push({
        type: 'html_block',
        tag: '',
        nesting: 0,
        level: tokens[sectionOpen].level + 1,
        attrs: null,
        map: null,
        markup: '',
        info: '',
        meta: null,
        block: true,
        hidden: false,
        content: `<footer>${String(footer)}</footer>\n`
      });
    }

    tokens.splice(sectionClose, 0, ...insert);
  });

  return marpit;
}

module.exports = {
  default: headerAndFooter,
  headerAndFooter
};
