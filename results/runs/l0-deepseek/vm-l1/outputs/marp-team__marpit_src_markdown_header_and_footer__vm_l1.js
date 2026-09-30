const plugin = require('../work/marp-team__marpit/src/plugin.js');

function wrapTokens(tokens, options = {}) {
  const { header = '', footer = '' } = options;
  if (!header && !footer) return tokens;
  const wrapped = [];
  if (header) {
    wrapped.push({
      type: 'marpit_header',
      tag: 'header',
      content: header,
      map: [0, 0],
      hidden: false
    });
  }
  wrapped.push(...tokens);
  if (footer) {
    wrapped.push({
      type: 'marpit_footer',
      tag: 'footer',
      content: footer,
      map: [0, 0],
      hidden: false
    });
  }
  return wrapped;
}

function headerAndFooter(md) {
  const defaultRenderer = md.renderer.rules.marpit_header || ((tokens, idx) => tokens[idx].content);
  const defaultFooterRenderer = md.renderer.rules.marpit_footer || ((tokens, idx) => tokens[idx].content);

  md.core.ruler.push('marpit_header_and_footer', (state) => {
    const { marpit } = state.md;
    if (!marpit) return;
    const { header, footer } = marpit;
    if (!header && !footer) return;
    state.tokens = wrapTokens(state.tokens, { header, footer });
  });

  md.renderer.rules.marpit_header = (tokens, idx) => {
    const token = tokens[idx];
    return `<header>${defaultRenderer(tokens, idx)}</header>`;
  };

  md.renderer.rules.marpit_footer = (tokens, idx) => {
    const token = tokens[idx];
    return `<footer>${defaultFooterRenderer(tokens, idx)}</footer>`;
  };
}

module.exports = headerAndFooter;
module.exports.default = headerAndFooter;
module.exports.headerAndFooter = headerAndFooter;
