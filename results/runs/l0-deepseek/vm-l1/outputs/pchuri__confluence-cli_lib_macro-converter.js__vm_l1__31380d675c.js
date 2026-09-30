const globalObject = typeof globalThis !== 'undefined' ? globalThis : typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : undefined;
const moduleContext = globalObject.__moduleContext || (globalObject.__moduleContext = {});

(function() {
  if (!moduleContext.module) {
    try { moduleContext.module = module; } catch (e) {}
  }
  if (!moduleContext.exports) {
    try { moduleContext.exports = exports; } catch (e) {}
  }
  if (!moduleContext.require) {
    try { moduleContext.require = require; } catch (e) {}
  }
  if (!moduleContext.__dirname) {
    try { moduleContext.__dirname = __dirname; } catch (e) {}
  }
  if (!moduleContext.__filename) {
    try { moduleContext.__filename = __filename; } catch (e) {}
  }
})();

const MarkdownIt = require('markdown-it');
const { StorageWalker } = require('./storage-walker');
const { htmlToStorage } = require('./html-to-storage');
const { VALID_LINK_STYLES, resolveLinkStyle } = require('./link-style');

const CALLOUT_MARKERS = ['note', 'warning', 'info'];
const STASH_DELIM = '\uE000';
const PASSTHROUGH_TAG_RE = /<\/?(?:br|u|sub|sup|mark|details|summary)(?=[\s/>])(?:"[^"]*"|'[^']*'|[^>])*>/gi;
const PASSTHROUGH_BLOCK_RE = /<(svg|div)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi;
const INLINE_CODE_RE = /`[^`\n]+`/g;

function escapeXmlAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

class MacroConverter {
  isCloud() {
    return false;
  }

  detectLanguageLabels() {
    return [];
  }

  _findCodeRanges() {
    return [];
  }

  _renderMarkdownToHtml() {
    return '';
  }

  markdownToStorage() {
    return '';
  }

  markdownToNativeStorage() {
    return '';
  }

  htmlToConfluenceStorage() {
    return '';
  }

  storageToMarkdown() {
    return '';
  }

  setupConfluenceMarkdownExtensions() {
    return undefined;
  }
}

module.exports = MacroConverter;
module.exports.VALID_LINK_STYLES = VALID_LINK_STYLES;
