const MarkdownIt = require('markdown-it');
const { StorageWalker } = require('./storage-walker');
const { htmlToStorage } = require('./html-to-storage');
const { VALID_LINK_STYLES, resolveLinkStyle } = require('./link-style');
const { markdownCleanup } = require('./markdown-cleanup');

const CALLOUT_MARKERS = ['info', 'note', 'warning'];
const STASH_DELIM = '\uE000';
const PASSTHROUGH_TAG_RE = /<\/?(?:br|u|sub|sup|mark|details|summary)(?=[\s/>])(?:"[^"]*"|'[^']*'|[^>])*>/gi;
const PASSTHROUGH_BLOCK_RE = /<(svg|div)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi;
const INLINE_CODE_RE = /`[^`\n]+`/g;

function escapeXmlAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

class MacroConverter {
  constructor() {
    this.md = new MarkdownIt({
      html: true,
      breaks: false,
      linkify: true,
    });
    this.setupConfluenceMarkdownExtensions();
  }

  isCloud() {
    return false;
  }

  setupConfluenceMarkdownExtensions() {
    const md = this.md;

    md.core.ruler.before('normalize', 'confluence_stash', (state) => {
      const src = state.src;
      let result = '';
      let lastIndex = 0;
      let match;

      PASSTHROUGH_BLOCK_RE.lastIndex = 0;
      while ((match = PASSTHROUGH_BLOCK_RE.exec(src)) !== null) {
        result += src.slice(lastIndex, match.index);
        result += STASH_DELIM + match[0] + STASH_DELIM;
        lastIndex = match.index + match[0].length;
      }
      result += src.slice(lastIndex);
      state.src = result;
    });

    md.core.ruler.after('confluence_stash', 'confluence_passthrough_tags', (state) => {
      const src = state.src;
      let result = '';
      let lastIndex = 0;
      let match;

      PASSTHROUGH_TAG_RE.lastIndex = 0;
      while ((match = PASSTHROUGH_TAG_RE.exec(src)) !== null) {
        result += src.slice(lastIndex, match.index);
        result += STASH_DELIM + match[0] + STASH_DELIM;
        lastIndex = match.index + match[0].length;
      }
      result += src.slice(lastIndex);
      state.src = result;
    });

    md.core.ruler.after('confluence_passthrough_tags', 'confluence_inline_code', (state) => {
      const src = state.src;
      let result = '';
      let lastIndex = 0;
      let match;

      INLINE_CODE_RE.lastIndex = 0;
      while ((match = INLINE_CODE_RE.exec(src)) !== null) {
        result += src.slice(lastIndex, match.index);
        result += STASH_DELIM + match[0] + STASH_DELIM;
        lastIndex = match.index + match[0].length;
      }
      result += src.slice(lastIndex);
      state.src = result;
    });

    md.block.ruler.before('fence', 'confluence_callout', (state, startLine, endLine, silent) => {
      const pos = state.bMarks[startLine] + state.tShift[startLine];
      const max = state.eMarks[startLine];
      const marker = state.src.charCodeAt(pos);

      if (marker !== 0x3E /* > */) {
        return false;
      }

      const text = state.src.slice(pos + 1, max).trim1();
      const calloutType = CALLOUT_MARKERS.find(m => text.toLowerCase().startsWith(m));

      if (!calloutType) {
        return false;
      }

      if (silent) {
        return true;
      }

      const contentStart = startLine + 1;
      let nextLine = contentStart;

      while (nextLine < endLine) {
        const linePos = state.bMarks[nextLine] + state.tShift[next) {
          break;
        }
        nextLine++;
      }

      const content = state.getLines(contentStart, nextLine, state.blkIndent, true);

      const token = state.push('confluence_callout', 'div', 1);
      token.block = true;
      token.markup = '>';
      token.map = [startLine, nextLine];
      token.meta = { type: calloutType, content };

      state.line = nextLine;
      return true;
    });

    md.inline.ruler.after('emphasis', 'confluence_stash_restore', (state, silent) => {
      const pos = state.pos;
      const max = state.posMax;

      if (state.src.charCodeAt(pos) !== 0xE000) {
        return false;
      }

      let end = pos + 1;
      while (end < max && state.src.charCodeAt(end) !== 0xE000) {
        end++;
      }

      if (end >= max) {
        return false;
      }

      if (!silent) {
        const content = state.src.slice(pos + 1, end);
        const token = state.push('text', '', 0);
        token.content = content;
      }

      state.pos = end + 1;
      return true;
    });
  }

  markdownToStorage(markdown) {
    let html = this.md.render(markdown);
    html = markdownCleanup(html);
    html = htmlToStorage(html);
    return html;
  }

  markdownToNativeStorage(markdown) {
    const html = this.md.render(markdown);
    const walker = new StorageWalker(html);
    return walker.toStorage();
  }

  storageToMarkdown(storage) {
    const walker = new StorageWalker(storage);
    return walker.toMarkdown();
  }

  htmlToConfluenceStorage(html) {
    return htmlToStorage(html);
  }

  detectLanguageLabels(code) {
    const langMap = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'rb': 'ruby',
      'sh': 'bash',
      'bash': 'bash',
      'zsh': 'bash',
      'json': 'json',
      'xml': 'xml',
      'html': 'html',
      'css': 'css',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'sql': 'sql',
      'yaml': 'yaml',
      'yml': 'yaml',
      'toml': 'toml',
      'ini': 'ini',
      'diff': 'diff',
      'patch': 'diff',
    };
    return langMap[code.toLowerCase()] || code;
  }

  _renderMarkdownToHtml(markdown) {
    return this.md.render(markdown);
  }

  _findCodeRanges(text) {
    const ranges = [];
    const regex = /
