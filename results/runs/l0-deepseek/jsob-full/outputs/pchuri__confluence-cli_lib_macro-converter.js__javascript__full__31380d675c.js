const __commonJS = (cb, mod) => function __require() {
  const module = { exports: {} };
  cb(module.exports, module);
  return module.exports;
};

const require_markdown_cleanup = __commonJS((module, exports) => {
  function fenceLength(text) {
    const matches = text.match(/`+/g);
    let max = 0;
    if (matches) {
      for (const match of matches) {
        if (match.length > max) max = match.length;
      }
    }
    return Math.max(3, max + 1);
  }

  function cleanupWithFences(text) {
    const parts = [];
    const fenceRegex = /^ {0,3}(`{3,})[^\n]*\n[\s\S]*?\n {0,3}\1[\t ]*$/gm;
    let lastIndex = 0;
    let match;
    while ((match = fenceRegex.exec(text)) !== null) {
      parts.push(text.slice(lastIndex, match.index));
      parts.push(match[0]);
      lastIndex = match.index + match[0].length;
    }
    parts.push(text.slice(lastIndex));
    return parts;
  }

  function cleanMarkdown(text) {
    let result = text;
    result = result.replace(/[ \t]+$/gm, '');
    result = result.replace(/^[ \t]+(?!([`>]|[*+-] |\d+[.)] ))/gm, '');
    result = result.replace(/^(#{1,6}[^\n]+)\n(?!\n)/gm, '$1\n');
    result = result.replace(/\n\s*\n\s*\n+/g, '\n\n');
    result = result.replace(/[ \t]+/g, ' ');
    return result;
  }

  function cleanupMarkdownWithFences(text) {
    const parts = cleanupWithFences(text);
    return parts
      .map((part, index) => (index % 2 === 0 ? cleanMarkdown(part) : part))
      .join('')
      .trim();
  }

  exports.fenceLength = fenceLength;
  exports.cleanupWithFences = cleanupWithFences;
  exports.cleanupMarkdownWithFences = cleanupMarkdownWithFences;
});

const require_storage_walker = __commonJS((module, exports) => {
  const { Parser, DomHandler } = require('htmlparser2');
  const { decodeHTML } = require('entities');
  const { fenceLength, cleanupWithFences } = require_markdown_cleanup;

  const MAX_DEPTH = 100;

  const HTML_ENTITIES = {
    '&': '&',
    '"': '"',
    '"': '"',
    "'": "'",
    "'": "'",
    '<': '<',
    '>': '>'
  };

  function decodeHtmlEntities(text) {
    if (!text) return '';
    return text.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g, (match, entity) => {
      if (entity[0] === '#') {
        const codePoint = entity[1] === 'x' || entity[1] === 'X'
          ? parseInt(entity.slice(2), 16)
          : parseInt(entity.slice(1), 10);
        if (!Number.isFinite(codePoint)) return match;
        try {
          return String.fromCodePoint(codePoint);
        } catch {
          return match;
        }
      }
      if (Object.prototype.hasOwnProperty.call(HTML_ENTITIES, entity)) {
        return HTML_ENTITIES[entity];
      }
      return decodeHTML('&' + entity + ';');
    });
  }

  class MaxDepthExceededError extends Error {
    constructor(depth) {
      super(`Maximum nesting depth of ${depth} exceeded`);
      this.name = 'MaxDepthExceededError';
      this.depth = depth;
    }
  }

  class StorageWalker {
    constructor({
      attachmentsDir = './attachments',
      labels = {},
      buildUrl = (url) => url,
      webUrlPrefix = '',
      maxDepth = MAX_DEPTH
    } = {}) {
      this.attachmentsDir = attachmentsDir;
      this.labels = labels;
      this.buildUrl = buildUrl;
      this.webUrlPrefix = webUrlPrefix;
      this.maxDepth = maxDepth;
    }

    walk(html) {
      this.depth = 0;
      this.linkDepth = 0;
      this.blockquoteDepth = 0;
      this.warnings = [];

      const handlerOptions = { withStartIndices: true };
      const handler = new DomHandler(null, handlerOptions);
      const warnings = [];

      const originalOnopentag = handler.onopentag.bind(handler);
      const originalOnclosetag = handler.onclosetag.bind(handler);

      handler.onopentag = (...args) => {
        const tagInfo = { name: args[0], attribs: args[1] };
        warnings.push(tagInfo);
        originalOnopentag(...args);
      };

      handler.onclosetag = (...args) => {
        const [name, isImplied] = args;
        const tagInfo = warnings.pop();
        if (isImplied) {
          const isMatching = tagInfo && tagInfo.name === args[0] && tagInfo.attribs === args[1];
          if (!isMatching) {
            const tagName = args[0];
            const warning = { type: 'mismatched-close', tag: tagName, expected: tagInfo };
            this.warnings.push(warning);
            if (process.env.CONFLUENCE_CLI_VERBOSE) {
              process.stderr.write(`Warning: mismatched closing tag </${tagName}> (expected </${tagInfo?.name}>)\n`);
            }
          }
        }
        originalOnclosetag(...args);
      };

      const parserOptions = {
        recognizeSelfClosing: true,
        lowerCaseAttributeNames: true,
        lowerCaseTags: true
      };

      const parser = new Parser(handler, parserOptions);
      parser.write(html);
      parser.end();

      return this.renderChildren(parser.dom);
    }

    renderChildren(nodes) {
      if (!nodes) return '';
      return nodes.map((node) => this.renderNode(node)).join('');
    }

    renderNode(node) {
      if (!node) return '';
      switch (node.type) {
        case 'text':
          return this.escapeText(node.data || '');
        case 'tag':
          return this.renderTag(node);
        case 'script':
        case 'style':
          return '';
        case 'comment':
        case 'directive':
        case 'cdata':
          return this.renderChildren(node);
        default:
          return '';
      }
    }

    enterNode() {
      if (++this.depth > this.maxDepth) {
        this.depth--;
        throw new MaxDepthExceededError(this.maxDepth);
      }
      try {
        return this.renderNode(this.currentNode);
      } finally {
        this.depth--;
      }
    }

    renderTag(node) {
      const tagName = node.name;
      switch (tagName) {
        case 'p':
          return '\n' + this.renderChildren(node.children).trim() + '\n';
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6': {
          const level = parseInt(tagName.slice(1), 10);
          return '\n' + '#'.repeat(level) + ' ' + this.renderChildren(node.children).trim() + '\n';
        }
        case 'strong':
        case 'b':
          return '**' + this.renderChildren(node.children) + '**';
        case 'em':
        case 'i':
          return '*' + this.renderChildren(node.children) + '*';
        case 's':
        case 'strike':
          return '~~' + this.renderChildren(node.children) + '~~';
        case 'blockquote': {
          this.blockquoteDepth++;
          try {
            return this.renderBlockquote(node);
          } finally {
            this.blockquoteDepth--;
          }
        }
        case 'br':
          return '\n';
        case 'hr':
          return '\n---\n';
        case 'a': {
          const href = decodeHtmlEntities(node.attribs && node.attribs.href || '');
          if (!href) return this.renderChildren(node.children);
          this.linkDepth++;
          let text;
          try {
            text = this.renderChildren(node.children);
          } finally {
            this.linkDepth--;
          }
          return '[' + text + '](' + href + ')';
        }
        case 'img':
          return this.renderImage(node);
        case 'ul':
          return this.renderList(node, false);
        case 'ol':
          return this.renderList(node, true);
        case 'li':
          return this.renderChildren(node.children);
        case 'table':
          return this.renderTable(node);
        case 'thead':
        case 'tbody':
        case 'tfoot':
        case 'tr':
        case 'th':
        case 'td':
          return this.renderChildren(node.children);
        case 'code':
          return this.renderCode(node);
        case 'pre':
          return this.renderPre(node);
        case 'span':
        case 'div':
        case 'font':
        case 'center':
        case 'small':
          return this.renderChildren(node.children);
        case 'sub':
        case 'sup':
        case 'u':
        case 'ins':
        case 'del':
        case 'mark':
          return '<' + tagName + '>' + this.renderChildren(node.children) + '</' + tagName + '>';
        case 'details':
          return this.renderDetails(node);
        case 'summary':
          return this.renderSummary(node);
        case 'ac:structured-macro':
          return this.renderMacro(node);
        case 'ac:parameter':
          return this.renderParameter(node);
        case 'ac:rich-text-body':
          return this.renderRichTextBody(node);
        case 'ac:plain-text-body':
          return this.renderPlainTextBody(node);
        case 'ac:link':
          return this.renderLink(node);
        case 'ac:image':
          return this.renderAcImage(node);
        case 'ac:inline-comment-marker':
          return this.renderInlineCommentMarker(node);
        case 'ac:task-list':
          return this.renderTaskList(node);
        case 'ac:task':
          return this.renderTask(node);
        case 'ac:structured-macro':
          return this.renderStructuredMacro(node);
        case 'ac:parameter':
          return this.renderParameter(node);
        case 'ac:adf-parameter':
          return this.renderAdfParameter(node);
        case 'ac:emoticon':
          return this.renderEmoticon(node);
        case 'ac:mention':
          return this.renderMention(node);
        case 'ac:status':
          return this.renderStatus(node);
        case 'ac:date':
          return this.renderDate(node);
        case 'ac:page':
          return this.renderPageLink(node);
        case 'ac:attachment':
          return this.renderAttachment(node);
        case 'ac:placeholder':
          return this.renderPlaceholder(node);
        case 'ac:structured-macro':
          return this.renderStructuredMacro(node);
        case 'ac:parameter':
          return this.renderParameter(node);
        case 'ac:adf-parameter':
          return this.renderAdfParameter(node);
        case 'ac:emoticon':
          return this.renderEmoticon(node);
        case 'ac:mention':
          return this.renderMention(node);
        case 'ac:status':
          return this.renderStatus(node);
        case 'ac:date':
          return this.renderDate(node);
        case 'ac:page':
          return this.renderPageLink(node);
        case 'ac:attachment':
          return this.renderAttachment(node);
        case 'ac:placeholder':
          return this.renderPlaceholder(node);
        default:
          return this.renderChildren(node.children);
      }
    }

    renderList(node, ordered) {
      const items = (node.children || []).filter((child) => child.type === 'tag' && child.name === 'li');
      let counter = 0;
      let output = '';
      for (const item of items) {
        const text = this.renderChildren(item.children).replace(/\s+/g, ' ').trim();
        if (!text) continue;
        const marker = ordered ? ++counter + '.' : '-';
        output += marker + ' ' + text + '\n';
      }
      return output ? '\n' + output : '';
    }

    renderTable(node) {
      const rows = [];
      const headerCells = this.findChildren(node, 'tr');
      let isHeader = true;
      for (const row of headerCells) {
        const cells = (row.children || []).filter((child) => child.type === 'tag' && (child.name === 'th' || child.name === 'td'));
        if (cells.length === 0) continue;
        const cellTexts = cells.map((cell) => this.renderChildren(cell.children).replace(/\s+/g, ' ').trim() || ' ');
        rows.push('| ' + cellTexts.join(' | ') + ' |');
        if (isHeader) {
          rows.push('| ' + cellTexts.map(() => '---').join(' | ') + ' |');
          isHeader = false;
        }
      }
      return rows.length ? '\n' + rows.join('\n') + '\n' : '';
    }

    renderBlockquote(node) {
      const text = this.renderChildren(node.children).trim();
      if (!text) return '';
      const lines = text.split('\n').map((line) => line.startsWith('>') ? '>' : '> ' + line).join('\n');
      return '\n' + lines + '\n';
    }

    renderCode(node) {
      const text = this.renderChildren(node.children).trim();
      if (!text) return '';
      const lines = text.split('\n').map((line) => line.startsWith('>') ? '>' : '> ' + line).join('\n');
      return '\n' + lines + '\n';
    }

    renderPre(node) {
      const codeNode = this.findChild(node, 'code');
      const codeText = codeNode ? this.renderChildren(codeNode.children) : '';
      const language = codeNode && codeNode.attribs && codeNode.attribs.class || '';
      const fence = '`'.repeat(fenceLength(codeText));
      return '\n' + fence + language + '\n' + codeText + '\n' + fence + '\n';
    }

    renderImage(node) {
      const src = node.attribs && node.attribs.src || '';
      const alt = node.attribs && node.attribs.alt || '';
      if (!src) return '';
      return '![' + alt + '](' + src + ')';
    }

    renderAcImage(node) {
      const attachment = this.findChild(node, 'ac:parameter', 'name', 'ac:filename');
      if (attachment) {
        const filename = this.renderChildren(attachment.children).trim();
        if (!filename) return '';
        return '![' + filename + '](' + this.attachmentsDir + '/' + filename + ')';
      }
      const url = this.findChild(node, 'ac:parameter', 'name', 'ac:url');
      if (url) {
        const urlText = this.renderChildren(url.children).trim();
        if (!urlText) return '';
        return '![' + urlText + '](' + urlText + ')';
      }
      return '';
    }

    renderLink(node) {
      const linkBody = this.findChild(node, 'ac:link-body');
      if (linkBody) {
        const text = this.renderChildren(linkBody.children).trim();
        if (!text) return '';
        return '[' + text + '](' + this.webUrlPrefix + '/' + text + ')';
      }
      const url = this.findChild(node, 'ac:link-url');
      if (url) {
        const urlText = this.renderChildren(url.children).trim();
        if (!urlText) return '';
        return '[' + urlText + '](' + urlText + ')';
      }
      return '';
    }

    renderInlineCommentMarker(node) {
      const ref = node.attribs && node.attribs['ac:ref'] || '';
      return '[comment:' + ref + ']';
    }

    renderTaskList(node) {
      const tasks = this.findChildren(node, 'ac:task');
      const output = [];
      for (const task of tasks) {
        const status = this.findChild(task, 'ac:task-status');
        const body = this.findChild(task, 'ac:task-body');
        const statusText = status ? this.renderChildren(status.children).trim() : '';
        const bodyText = body ? this.renderChildren(body.children).trim() : '';
        if (bodyText) {
          output.push('- [' + (statusText === 'complete' ? 'x' : ' ') + '] ' + bodyText);
        }
      }
      return output.length ? '\n' + output.join('\n') + '\n' : '';
    }

    renderTask(node) {
      return this.renderChildren(node.children);
    }

    renderStructuredMacro(node) {
      const name = node.attribs && node.attribs['ac:name'] || '';
      switch (name) {
        case 'code':
        case 'noformat':
          return '';
        case 'quote':
          return this.renderQuote(node);
        case 'panel':
          return this.renderPanel(node);
        case 'info':
        case 'note':
        case 'tip':
        case 'warning':
          return this.renderCallout(node, name);
        case 'expand':
          return this.renderExpand(node);
        case 'anchor':
          return this.renderAnchor(node);
        case 'details':
          return this.renderDetailsMacro(node);
        case 'toc':
          return this.renderToc(node);
        case 'section':
        case 'column':
          return this.renderSection(node, name);
        case 'layout':
          return this.renderLayout(node);
        default:
          return '';
      }
    }

    renderParameter(node) {
      const name = node.attribs && node.attribs['ac:name'];
      switch (name) {
        case 'title':
        case 'name':
          return '';
        case 'body':
          return this.renderChildren(node);
        case 'code':
          return this.renderCode(node);
        case 'language':
        case 'linenumbers':
        case 'collapse':
          return this.renderChildren(node);
        case 'url':
          return this.renderUrl(node);
        case 'filename':
          return this.renderFilename(node);
        case 'width':
          return this.renderWidth(node);
        case 'height':
          return this.renderHeight(node);
        case 'alt':
          return this.renderAlt(node);
        case 'id':
          return this.renderId(node);
        case 'ac:name':
          return this.renderChildren(node);
        default:
          return '';
      }
    }

    renderAdfParameter(node) {
      const name = node.attribs && node.attribs['ac:name'];
      switch (name) {
        case 'title':
        case 'name':
          return '';
        case 'body':
          return this.renderChildren(node);
        case 'code':
          return this.renderCode(node);
        case 'language':
        case 'linenumbers':
        case 'collapse':
          return this.renderChildren(node);
        case 'url':
          return this.renderUrl(node);
        case 'filename':
          return this.renderFilename(node);
        case 'width':
          return this.renderWidth(node);
        case 'height':
          return this.renderHeight(node);
        case 'alt':
          return this.renderAlt(node);
        case 'id':
          return this.renderId(node);
        case 'ac:name':
          return this.renderChildren(node);
        default:
          return '';
      }
    }

    renderRichTextBody(node) {
      return this.renderChildren(node);
    }

    renderPlainTextBody(node) {
      return this.renderChildren(node);
    }

    renderQuote(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderPanel(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderCallout(node, type) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderExpand(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderAnchor(node) {
      const id = this.findChild(node, 'ac:parameter', 'name', 'id');
      if (id) {
        const idText = this.renderChildren(id.children).trim();
        if (!idText) return '';
        return '[#' + idText + ']';
      }
      return '';
    }

    renderDetailsMacro(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderToc(node) {
      return '';
    }

    renderSection(node, type) {
      return this.renderChildren(node);
    }

    renderLayout(node) {
      return this.renderChildren(node);
    }

    renderUrl(node) {
      return this.renderChildren(node);
    }

    renderFilename(node) {
      return this.renderChildren(node);
    }

    renderWidth(node) {
      return this.renderChildren(node);
    }

    renderHeight(node) {
      return this.renderChildren(node);
    }

    renderAlt(node) {
      return this.renderChildren(node);
    }

    renderId(node) {
      return this.renderChildren(node);
    }

    renderEmoticon(node) {
      const shortcut = node.attribs && node.attribs['ac:shortcut'] || '';
      return shortcut;
    }

    renderMention(node) {
      const username = node.attribs && node.attribs['ac:username'] || '';
      return '@' + username;
    }

    renderStatus(node) {
      const text = node.attribs && node.attribs['ac:text'] || '';
      return text;
    }

    renderDate(node) {
      const date = node.attribs && node.attribs['ac:date'] || '';
      return date;
    }

    renderPageLink(node) {
      const page = this.findChild(node, 'ac:parameter', 'name', 'page');
      if (page) {
        const pageText = this.renderChildren(page.children).trim();
        if (!pageText) return '';
        return '[' + pageText + '](' + this.webUrlPrefix + '/' + pageText + ')';
      }
      return '';
    }

    renderAttachment(node) {
      const filename = this.findChild(node, 'ac:parameter', 'name', 'filename');
      if (filename) {
        const filenameText = this.renderChildren(filename.children).trim();
        if (!filenameText) return '';
        return '[' + filenameText + '](' + this.attachmentsDir + '/' + filenameText + ')';
      }
      return '';
    }

    renderPlaceholder(node) {
      const text = node.attribs && node.attribs['ac:text'] || '';
      return text;
    }

    findChild(node, tagName, attrName, attrValue) {
      if (!node || !node.children) return null;
      for (const child of node.children) {
        if (child.type === 'tag' && child.name === tagName) {
          if (attrName && attrValue) {
            if (child.attribs && child.attribs[attrName] === attrValue) {
              return child;
            }
          } else {
            return child;
          }
        }
      }
      return null;
    }

    findChildren(node, tagName) {
      if (!node || !node.children) return [];
      return node.children.filter((child) => child.type === 'tag' && child.name === tagName);
    }

    escapeText(text) {
      if (!text) return '';
      return text.replace(/([\\`*_[\]()~|<>])/g, '\\$1');
    }

    escapeHtml(text) {
      if (!text) return '';
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    escapeXmlAttr(text) {
      if (!text) return '';
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    renderDetails(node) {
      const summary = this.findChild(node, 'summary');
      const summaryText = summary ? this.renderChildren(summary.children).trim() : '';
      const body = this.renderChildren(node.children.filter((child) => child !== summary));
      if (!summaryText && !body) return '';
      const lines = body.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!summaryText) return '\n' + lines + '\n';
      if (!body) return '> **' + summaryText + '**\n';
      return '> **' + summaryText + '**\n' + lines + '\n';
    }

    renderSummary(node) {
      return this.renderChildren(node.children);
    }

    renderMacro(node) {
      return this.renderStructuredMacro(node);
    }

    renderStructuredMacro(node) {
      const name = node.attribs && node.attribs['ac:name'] || '';
      switch (name) {
        case 'code':
        case 'noformat':
          return '';
        case 'quote':
          return this.renderQuote(node);
        case 'panel':
          return this.renderPanel(node);
        case 'info':
        case 'note':
        case 'tip':
        case 'warning':
          return this.renderCallout(node, name);
        case 'expand':
          return this.renderExpand(node);
        case 'anchor':
          return this.renderAnchor(node);
        case 'details':
          return this.renderDetailsMacro(node);
        case 'toc':
          return this.renderToc(node);
        case 'section':
        case 'column':
          return this.renderSection(node, name);
        case 'layout':
          return this.renderLayout(node);
        default:
          return '';
      }
    }

    renderParameter(node) {
      const name = node.attribs && node.attribs['ac:name'];
      switch (name) {
        case 'title':
        case 'name':
          return '';
        case 'body':
          return this.renderChildren(node);
        case 'code':
          return this.renderCode(node);
        case 'language':
        case 'linenumbers':
        case 'collapse':
          return this.renderChildren(node);
        case 'url':
          return this.renderUrl(node);
        case 'filename':
          return this.renderFilename(node);
        case 'width':
          return this.renderWidth(node);
        case 'height':
          return this.renderHeight(node);
        case 'alt':
          return this.renderAlt(node);
        case 'id':
          return this.renderId(node);
        case 'ac:name':
          return this.renderChildren(node);
        default:
          return '';
      }
    }

    renderAdfParameter(node) {
      const name = node.attribs && node.attribs['ac:name'];
      switch (name) {
        case 'title':
        case 'name':
          return '';
        case 'body':
          return this.renderChildren(node);
        case 'code':
          return this.renderCode(node);
        case 'language':
        case 'linenumbers':
        case 'collapse':
          return this.renderChildren(node);
        case 'url':
          return this.renderUrl(node);
        case 'filename':
          return this.renderFilename(node);
        case 'width':
          return this.renderWidth(node);
        case 'height':
          return this.renderHeight(node);
        case 'alt':
          return this.renderAlt(node);
        case 'id':
          return this.renderId(node);
        case 'ac:name':
          return this.renderChildren(node);
        default:
          return '';
      }
    }

    renderRichTextBody(node) {
      return this.renderChildren(node);
    }

    renderPlainTextBody(node) {
      return this.renderChildren(node);
    }

    renderQuote(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderPanel(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderCallout(node, type) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderExpand(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderAnchor(node) {
      const id = this.findChild(node, 'ac:parameter', 'name', 'id');
      if (id) {
        const idText = this.renderChildren(id.children).trim();
        if (!idText) return '';
        return '[#' + idText + ']';
      }
      return '';
    }

    renderDetailsMacro(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderToc(node) {
      return '';
    }

    renderSection(node, type) {
      return this.renderChildren(node);
    }

    renderLayout(node) {
      return this.renderChildren(node);
    }

    renderUrl(node) {
      return this.renderChildren(node);
    }

    renderFilename(node) {
      return this.renderChildren(node);
    }

    renderWidth(node) {
      return this.renderChildren(node);
    }

    renderHeight(node) {
      return this.renderChildren(node);
    }

    renderAlt(node) {
      return this.renderChildren(node);
    }

    renderId(node) {
      return this.renderChildren(node);
    }

    renderEmoticon(node) {
      const shortcut = node.attribs && node.attribs['ac:shortcut'] || '';
      return shortcut;
    }

    renderMention(node) {
      const username = node.attribs && node.attribs['ac:username'] || '';
      return '@' + username;
    }

    renderStatus(node) {
      const text = node.attribs && node.attribs['ac:text'] || '';
      return text;
    }

    renderDate(node) {
      const date = node.attribs && node.attribs['ac:date'] || '';
      return date;
    }

    renderPageLink(node) {
      const page = this.findChild(node, 'ac:parameter', 'name', 'page');
      if (page) {
        const pageText = this.renderChildren(page.children).trim();
        if (!pageText) return '';
        return '[' + pageText + '](' + this.webUrlPrefix + '/' + pageText + ')';
      }
      return '';
    }

    renderAttachment(node) {
      const filename = this.findChild(node, 'ac:parameter', 'name', 'filename');
      if (filename) {
        const filenameText = this.renderChildren(filename.children).trim();
        if (!filenameText) return '';
        return '[' + filenameText + '](' + this.attachmentsDir + '/' + filenameText + ')';
      }
      return '';
    }

    renderPlaceholder(node) {
      const text = node.attribs && node.attribs['ac:text'] || '';
      return text;
    }

    findChild(node, tagName, attrName, attrValue) {
      if (!node || !node.children) return null;
      for (const child of node.children) {
        if (child.type === 'tag' && child.name === tagName) {
          if (attrName && attrValue) {
            if (child.attribs && child.attribs[attrName] === attrValue) {
              return child;
            }
          } else {
            return child;
          }
        }
      }
      return null;
    }

    findChildren(node, tagName) {
      if (!node || !node.children) return [];
      return node.children.filter((child) => child.type === 'tag' && child.name === tagName);
    }

    escapeText(text) {
      if (!text) return '';
      return text.replace(/([\\`*_[\]()~|<>])/g, '\\$1');
    }

    escapeHtml(text) {
      if (!text) return '';
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    escapeXmlAttr(text) {
      if (!text) return '';
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    renderDetails(node) {
      const summary = this.findChild(node, 'summary');
      const summaryText = summary ? this.renderChildren(summary.children).trim() : '';
      const body = this.renderChildren(node.children.filter((child) => child !== summary));
      if (!summaryText && !body) return '';
      const lines = body.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!summaryText) return '\n' + lines + '\n';
      if (!body) return '> **' + summaryText + '**\n';
      return '> **' + summaryText + '**\n' + lines + '\n';
    }

    renderSummary(node) {
      return this.renderChildren(node.children);
    }

    renderMacro(node) {
      return this.renderStructuredMacro(node);
    }

    renderStructuredMacro(node) {
      const name = node.attribs && node.attribs['ac:name'] || '';
      switch (name) {
        case 'code':
        case 'noformat':
          return '';
        case 'quote':
          return this.renderQuote(node);
        case 'panel':
          return this.renderPanel(node);
        case 'info':
        case 'note':
        case 'tip':
        case 'warning':
          return this.renderCallout(node, name);
        case 'expand':
          return this.renderExpand(node);
        case 'anchor':
          return this.renderAnchor(node);
        case 'details':
          return this.renderDetailsMacro(node);
        case 'toc':
          return this.renderToc(node);
        case 'section':
        case 'column':
          return this.renderSection(node, name);
        case 'layout':
          return this.renderLayout(node);
        default:
          return '';
      }
    }

    renderParameter(node) {
      const name = node.attribs && node.attribs['ac:name'];
      switch (name) {
        case 'title':
        case 'name':
          return '';
        case 'body':
          return this.renderChildren(node);
        case 'code':
          return this.renderCode(node);
        case 'language':
        case 'linenumbers':
        case 'collapse':
          return this.renderChildren(node);
        case 'url':
          return this.renderUrl(node);
        case 'filename':
          return this.renderFilename(node);
        case 'width':
          return this.renderWidth(node);
        case 'height':
          return this.renderHeight(node);
        case 'alt':
          return this.renderAlt(node);
        case 'id':
          return this.renderId(node);
        case 'ac:name':
          return this.renderChildren(node);
        default:
          return '';
      }
    }

    renderAdfParameter(node) {
      const name = node.attribs && node.attribs['ac:name'];
      switch (name) {
        case 'title':
        case 'name':
          return '';
        case 'body':
          return this.renderChildren(node);
        case 'code':
          return this.renderCode(node);
        case 'language':
        case 'linenumbers':
        case 'collapse':
          return this.renderChildren(node);
        case 'url':
          return this.renderUrl(node);
        case 'filename':
          return this.renderFilename(node);
        case 'width':
          return this.renderWidth(node);
        case 'height':
          return this.renderHeight(node);
        case 'alt':
          return this.renderAlt(node);
        case 'id':
          return this.renderId(node);
        case 'ac:name':
          return this.renderChildren(node);
        default:
          return '';
      }
    }

    renderRichTextBody(node) {
      return this.renderChildren(node);
    }

    renderPlainTextBody(node) {
      return this.renderChildren(node);
    }

    renderQuote(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderPanel(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderCallout(node, type) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderExpand(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderAnchor(node) {
      const id = this.findChild(node, 'ac:parameter', 'name', 'id');
      if (id) {
        const idText = this.renderChildren(id.children).trim();
        if (!idText) return '';
        return '[#' + idText + ']';
      }
      return '';
    }

    renderDetailsMacro(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderToc(node) {
      return '';
    }

    renderSection(node, type) {
      return this.renderChildren(node);
    }

    renderLayout(node) {
      return this.renderChildren(node);
    }

    renderUrl(node) {
      return this.renderChildren(node);
    }

    renderFilename(node) {
      return this.renderChildren(node);
    }

    renderWidth(node) {
      return this.renderChildren(node);
    }

    renderHeight(node) {
      return this.renderChildren(node);
    }

    renderAlt(node) {
      return this.renderChildren(node);
    }

    renderId(node) {
      return this.renderChildren(node);
    }

    renderEmoticon(node) {
      const shortcut = node.attribs && node.attribs['ac:shortcut'] || '';
      return shortcut;
    }

    renderMention(node) {
      const username = node.attribs && node.attribs['ac:username'] || '';
      return '@' + username;
    }

    renderStatus(node) {
      const text = node.attribs && node.attribs['ac:text'] || '';
      return text;
    }

    renderDate(node) {
      const date = node.attribs && node.attribs['ac:date'] || '';
      return date;
    }

    renderPageLink(node) {
      const page = this.findChild(node, 'ac:parameter', 'name', 'page');
      if (page) {
        const pageText = this.renderChildren(page.children).trim();
        if (!pageText) return '';
        return '[' + pageText + '](' + this.webUrlPrefix + '/' + pageText + ')';
      }
      return '';
    }

    renderAttachment(node) {
      const filename = this.findChild(node, 'ac:parameter', 'name', 'filename');
      if (filename) {
        const filenameText = this.renderChildren(filename.children).trim();
        if (!filenameText) return '';
        return '[' + filenameText + '](' + this.attachmentsDir + '/' + filenameText + ')';
      }
      return '';
    }

    renderPlaceholder(node) {
      const text = node.attribs && node.attribs['ac:text'] || '';
      return text;
    }

    findChild(node, tagName, attrName, attrValue) {
      if (!node || !node.children) return null;
      for (const child of node.children) {
        if (child.type === 'tag' && child.name === tagName) {
          if (attrName && attrValue) {
            if (child.attribs && child.attribs[attrName] === attrValue) {
              return child;
            }
          } else {
            return child;
          }
        }
      }
      return null;
    }

    findChildren(node, tagName) {
      if (!node || !node.children) return [];
      return node.children.filter((child) => child.type === 'tag' && child.name === tagName);
    }

    escapeText(text) {
      if (!text) return '';
      return text.replace(/([\\`*_[\]()~|<>])/g, '\\$1');
    }

    escapeHtml(text) {
      if (!text) return '';
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    escapeXmlAttr(text) {
      if (!text) return '';
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    renderDetails(node) {
      const summary = this.findChild(node, 'summary');
      const summaryText = summary ? this.renderChildren(summary.children).trim() : '';
      const body = this.renderChildren(node.children.filter((child) => child !== summary));
      if (!summaryText && !body) return '';
      const lines = body.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!summaryText) return '\n' + lines + '\n';
      if (!body) return '> **' + summaryText + '**\n';
      return '> **' + summaryText + '**\n' + lines + '\n';
    }

    renderSummary(node) {
      return this.renderChildren(node.children);
    }

    renderMacro(node) {
      return this.renderStructuredMacro(node);
    }

    renderStructuredMacro(node) {
      const name = node.attribs && node.attribs['ac:name'] || '';
      switch (name) {
        case 'code':
        case 'noformat':
          return '';
        case 'quote':
          return this.renderQuote(node);
        case 'panel':
          return this.renderPanel(node);
        case 'info':
        case 'note':
        case 'tip':
        case 'warning':
          return this.renderCallout(node, name);
        case 'expand':
          return this.renderExpand(node);
        case 'anchor':
          return this.renderAnchor(node);
        case 'details':
          return this.renderDetailsMacro(node);
        case 'toc':
          return this.renderToc(node);
        case 'section':
        case 'column':
          return this.renderSection(node, name);
        case 'layout':
          return this.renderLayout(node);
        default:
          return '';
      }
    }

    renderParameter(node) {
      const name = node.attribs && node.attribs['ac:name'];
      switch (name) {
        case 'title':
        case 'name':
          return '';
        case 'body':
          return this.renderChildren(node);
        case 'code':
          return this.renderCode(node);
        case 'language':
        case 'linenumbers':
        case 'collapse':
          return this.renderChildren(node);
        case 'url':
          return this.renderUrl(node);
        case 'filename':
          return this.renderFilename(node);
        case 'width':
          return this.renderWidth(node);
        case 'height':
          return this.renderHeight(node);
        case 'alt':
          return this.renderAlt(node);
        case 'id':
          return this.renderId(node);
        case 'ac:name':
          return this.renderChildren(node);
        default:
          return '';
      }
    }

    renderAdfParameter(node) {
      const name = node.attribs && node.attribs['ac:name'];
      switch (name) {
        case 'title':
        case 'name':
          return '';
        case 'body':
          return this.renderChildren(node);
        case 'code':
          return this.renderCode(node);
        case 'language':
        case 'linenumbers':
        case 'collapse':
          return this.renderChildren(node);
        case 'url':
          return this.renderUrl(node);
        case 'filename':
          return this.renderFilename(node);
        case 'width':
          return this.renderWidth(node);
        case 'height':
          return this.renderHeight(node);
        case 'alt':
          return this.renderAlt(node);
        case 'id':
          return this.renderId(node);
        case 'ac:name':
          return this.renderChildren(node);
        default:
          return '';
      }
    }

    renderRichTextBody(node) {
      return this.renderChildren(node);
    }

    renderPlainTextBody(node) {
      return this.renderChildren(node);
    }

    renderQuote(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderPanel(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderCallout(node, type) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderExpand(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderAnchor(node) {
      const id = this.findChild(node, 'ac:parameter', 'name', 'id');
      if (id) {
        const idText = this.renderChildren(id.children).trim();
        if (!idText) return '';
        return '[#' + idText + ']';
      }
      return '';
    }

    renderDetailsMacro(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderToc(node) {
      return '';
    }

    renderSection(node, type) {
      return this.renderChildren(node);
    }

    renderLayout(node) {
      return this.renderChildren(node);
    }

    renderUrl(node) {
      return this.renderChildren(node);
    }

    renderFilename(node) {
      return this.renderChildren(node);
    }

    renderWidth(node) {
      return this.renderChildren(node);
    }

    renderHeight(node) {
      return this.renderChildren(node);
    }

    renderAlt(node) {
      return this.renderChildren(node);
    }

    renderId(node) {
      return this.renderChildren(node);
    }

    renderEmoticon(node) {
      const shortcut = node.attribs && node.attribs['ac:shortcut'] || '';
      return shortcut;
    }

    renderMention(node) {
      const username = node.attribs && node.attribs['ac:username'] || '';
      return '@' + username;
    }

    renderStatus(node) {
      const text = node.attribs && node.attribs['ac:text'] || '';
      return text;
    }

    renderDate(node) {
      const date = node.attribs && node.attribs['ac:date'] || '';
      return date;
    }

    renderPageLink(node) {
      const page = this.findChild(node, 'ac:parameter', 'name', 'page');
      if (page) {
        const pageText = this.renderChildren(page.children).trim();
        if (!pageText) return '';
        return '[' + pageText + '](' + this.webUrlPrefix + '/' + pageText + ')';
      }
      return '';
    }

    renderAttachment(node) {
      const filename = this.findChild(node, 'ac:parameter', 'name', 'filename');
      if (filename) {
        const filenameText = this.renderChildren(filename.children).trim();
        if (!filenameText) return '';
        return '[' + filenameText + '](' + this.attachmentsDir + '/' + filenameText + ')';
      }
      return '';
    }

    renderPlaceholder(node) {
      const text = node.attribs && node.attribs['ac:text'] || '';
      return text;
    }

    findChild(node, tagName, attrName, attrValue) {
      if (!node || !node.children) return null;
      for (const child of node.children) {
        if (child.type === 'tag' && child.name === tagName) {
          if (attrName && attrValue) {
            if (child.attribs && child.attribs[attrName] === attrValue) {
              return child;
            }
          } else {
            return child;
          }
        }
      }
      return null;
    }

    findChildren(node, tagName) {
      if (!node || !node.children) return [];
      return node.children.filter((child) => child.type === 'tag' && child.name === tagName);
    }

    escapeText(text) {
      if (!text) return '';
      return text.replace(/([\\`*_[\]()~|<>])/g, '\\$1');
    }

    escapeHtml(text) {
      if (!text) return '';
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    escapeXmlAttr(text) {
      if (!text) return '';
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    renderDetails(node) {
      const summary = this.findChild(node, 'summary');
      const summaryText = summary ? this.renderChildren(summary.children).trim() : '';
      const body = this.renderChildren(node.children.filter((child) => child !== summary));
      if (!summaryText && !body) return '';
      const lines = body.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!summaryText) return '\n' + lines + '\n';
      if (!body) return '> **' + summaryText + '**\n';
      return '> **' + summaryText + '**\n' + lines + '\n';
    }

    renderSummary(node) {
      return this.renderChildren(node.children);
    }

    renderMacro(node) {
      return this.renderStructuredMacro(node);
    }

    renderStructuredMacro(node) {
      const name = node.attribs && node.attribs['ac:name'] || '';
      switch (name) {
        case 'code':
        case 'noformat':
          return '';
        case 'quote':
          return this.renderQuote(node);
        case 'panel':
          return this.renderPanel(node);
        case 'info':
        case 'note':
        case 'tip':
        case 'warning':
          return this.renderCallout(node, name);
        case 'expand':
          return this.renderExpand(node);
        case 'anchor':
          return this.renderAnchor(node);
        case 'details':
          return this.renderDetailsMacro(node);
        case 'toc':
          return this.renderToc(node);
        case 'section':
        case 'column':
          return this.renderSection(node, name);
        case 'layout':
          return this.renderLayout(node);
        default:
          return '';
      }
    }

    renderParameter(node) {
      const name = node.attribs && node.attribs['ac:name'];
      switch (name) {
        case 'title':
        case 'name':
          return '';
        case 'body':
          return this.renderChildren(node);
        case 'code':
          return this.renderCode(node);
        case 'language':
        case 'linenumbers':
        case 'collapse':
          return this.renderChildren(node);
        case 'url':
          return this.renderUrl(node);
        case 'filename':
          return this.renderFilename(node);
        case 'width':
          return this.renderWidth(node);
        case 'height':
          return this.renderHeight(node);
        case 'alt':
          return this.renderAlt(node);
        case 'id':
          return this.renderId(node);
        case 'ac:name':
          return this.renderChildren(node);
        default:
          return '';
      }
    }

    renderAdfParameter(node) {
      const name = node.attribs && node.attribs['ac:name'];
      switch (name) {
        case 'title':
        case 'name':
          return '';
        case 'body':
          return this.renderChildren(node);
        case 'code':
          return this.renderCode(node);
        case 'language':
        case 'linenumbers':
        case 'collapse':
          return this.renderChildren(node);
        case 'url':
          return this.renderUrl(node);
        case 'filename':
          return this.renderFilename(node);
        case 'width':
          return this.renderWidth(node);
        case 'height':
          return this.renderHeight(node);
        case 'alt':
          return this.renderAlt(node);
        case 'id':
          return this.renderId(node);
        case 'ac:name':
          return this.renderChildren(node);
        default:
          return '';
      }
    }

    renderRichTextBody(node) {
      return this.renderChildren(node);
    }

    renderPlainTextBody(node) {
      return this.renderChildren(node);
    }

    renderQuote(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderPanel(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderCallout(node, type) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderExpand(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderAnchor(node) {
      const id = this.findChild(node, 'ac:parameter', 'name', 'id');
      if (id) {
        const idText = this.renderChildren(id.children).trim();
        if (!idText) return '';
        return '[#' + idText + ']';
      }
      return '';
    }

    renderDetailsMacro(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderToc(node) {
      return '';
    }

    renderSection(node, type) {
      return this.renderChildren(node);
    }

    renderLayout(node) {
      return this.renderChildren(node);
    }

    renderUrl(node) {
      return this.renderChildren(node);
    }

    renderFilename(node) {
      return this.renderChildren(node);
    }

    renderWidth(node) {
      return this.renderChildren(node);
    }

    renderHeight(node) {
      return this.renderChildren(node);
    }

    renderAlt(node) {
      return this.renderChildren(node);
    }

    renderId(node) {
      return this.renderChildren(node);
    }

    renderEmoticon(node) {
      const shortcut = node.attribs && node.attribs['ac:shortcut'] || '';
      return shortcut;
    }

    renderMention(node) {
      const username = node.attribs && node.attribs['ac:username'] || '';
      return '@' + username;
    }

    renderStatus(node) {
      const text = node.attribs && node.attribs['ac:text'] || '';
      return text;
    }

    renderDate(node) {
      const date = node.attribs && node.attribs['ac:date'] || '';
      return date;
    }

    renderPageLink(node) {
      const page = this.findChild(node, 'ac:parameter', 'name', 'page');
      if (page) {
        const pageText = this.renderChildren(page.children).trim();
        if (!pageText) return '';
        return '[' + pageText + '](' + this.webUrlPrefix + '/' + pageText + ')';
      }
      return '';
    }

    renderAttachment(node) {
      const filename = this.findChild(node, 'ac:parameter', 'name', 'filename');
      if (filename) {
        const filenameText = this.renderChildren(filename.children).trim();
        if (!filenameText) return '';
        return '[' + filenameText + '](' + this.attachmentsDir + '/' + filenameText + ')';
      }
      return '';
    }

    renderPlaceholder(node) {
      const text = node.attribs && node.attribs['ac:text'] || '';
      return text;
    }

    findChild(node, tagName, attrName, attrValue) {
      if (!node || !node.children) return null;
      for (const child of node.children) {
        if (child.type === 'tag' && child.name === tagName) {
          if (attrName && attrValue) {
            if (child.attribs && child.attribs[attrName] === attrValue) {
              return child;
            }
          } else {
            return child;
          }
        }
      }
      return null;
    }

    findChildren(node, tagName) {
      if (!node || !node.children) return [];
      return node.children.filter((child) => child.type === 'tag' && child.name === tagName);
    }

    escapeText(text) {
      if (!text) return '';
      return text.replace(/([\\`*_[\]()~|<>])/g, '\\$1');
    }

    escapeHtml(text) {
      if (!text) return '';
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    escapeXmlAttr(text) {
      if (!text) return '';
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    renderDetails(node) {
      const summary = this.findChild(node, 'summary');
      const summaryText = summary ? this.renderChildren(summary.children).trim() : '';
      const body = this.renderChildren(node.children.filter((child) => child !== summary));
      if (!summaryText && !body) return '';
      const lines = body.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!summaryText) return '\n' + lines + '\n';
      if (!body) return '> **' + summaryText + '**\n';
      return '> **' + summaryText + '**\n' + lines + '\n';
    }

    renderSummary(node) {
      return this.renderChildren(node.children);
    }

    renderMacro(node) {
      return this.renderStructuredMacro(node);
    }

    renderStructuredMacro(node) {
      const name = node.attribs && node.attribs['ac:name'] || '';
      switch (name) {
        case 'code':
        case 'noformat':
          return '';
        case 'quote':
          return this.renderQuote(node);
        case 'panel':
          return this.renderPanel(node);
        case 'info':
        case 'note':
        case 'tip':
        case 'warning':
          return this.renderCallout(node, name);
        case 'expand':
          return this.renderExpand(node);
        case 'anchor':
          return this.renderAnchor(node);
        case 'details':
          return this.renderDetailsMacro(node);
        case 'toc':
          return this.renderToc(node);
        case 'section':
        case 'column':
          return this.renderSection(node, name);
        case 'layout':
          return this.renderLayout(node);
        default:
          return '';
      }
    }

    renderParameter(node) {
      const name = node.attribs && node.attribs['ac:name'];
      switch (name) {
        case 'title':
        case 'name':
          return '';
        case 'body':
          return this.renderChildren(node);
        case 'code':
          return this.renderCode(node);
        case 'language':
        case 'linenumbers':
        case 'collapse':
          return this.renderChildren(node);
        case 'url':
          return this.renderUrl(node);
        case 'filename':
          return this.renderFilename(node);
        case 'width':
          return this.renderWidth(node);
        case 'height':
          return this.renderHeight(node);
        case 'alt':
          return this.renderAlt(node);
        case 'id':
          return this.renderId(node);
        case 'ac:name':
          return this.renderChildren(node);
        default:
          return '';
      }
    }

    renderAdfParameter(node) {
      const name = node.attribs && node.attribs['ac:name'];
      switch (name) {
        case 'title':
        case 'name':
          return '';
        case 'body':
          return this.renderChildren(node);
        case 'code':
          return this.renderCode(node);
        case 'language':
        case 'linenumbers':
        case 'collapse':
          return this.renderChildren(node);
        case 'url':
          return this.renderUrl(node);
        case 'filename':
          return this.renderFilename(node);
        case 'width':
          return this.renderWidth(node);
        case 'height':
          return this.renderHeight(node);
        case 'alt':
          return this.renderAlt(node);
        case 'id':
          return this.renderId(node);
        case 'ac:name':
          return this.renderChildren(node);
        default:
          return '';
      }
    }

    renderRichTextBody(node) {
      return this.renderChildren(node);
    }

    renderPlainTextBody(node) {
      return this.renderChildren(node);
    }

    renderQuote(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderPanel(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderCallout(node, type) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderExpand(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderAnchor(node) {
      const id = this.findChild(node, 'ac:parameter', 'name', 'id');
      if (id) {
        const idText = this.renderChildren(id.children).trim();
        if (!idText) return '';
        return '[#' + idText + ']';
      }
      return '';
    }

    renderDetailsMacro(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderToc(node) {
      return '';
    }

    renderSection(node, type) {
      return this.renderChildren(node);
    }

    renderLayout(node) {
      return this.renderChildren(node);
    }

    renderUrl(node) {
      return this.renderChildren(node);
    }

    renderFilename(node) {
      return this.renderChildren(node);
    }

    renderWidth(node) {
      return this.renderChildren(node);
    }

    renderHeight(node) {
      return this.renderChildren(node);
    }

    renderAlt(node) {
      return this.renderChildren(node);
    }

    renderId(node) {
      return this.renderChildren(node);
    }

    renderEmoticon(node) {
      const shortcut = node.attribs && node.attribs['ac:shortcut'] || '';
      return shortcut;
    }

    renderMention(node) {
      const username = node.attribs && node.attribs['ac:username'] || '';
      return '@' + username;
    }

    renderStatus(node) {
      const text = node.attribs && node.attribs['ac:text'] || '';
      return text;
    }

    renderDate(node) {
      const date = node.attribs && node.attribs['ac:date'] || '';
      return date;
    }

    renderPageLink(node) {
      const page = this.findChild(node, 'ac:parameter', 'name', 'page');
      if (page) {
        const pageText = this.renderChildren(page.children).trim();
        if (!pageText) return '';
        return '[' + pageText + '](' + this.webUrlPrefix + '/' + pageText + ')';
      }
      return '';
    }

    renderAttachment(node) {
      const filename = this.findChild(node, 'ac:parameter', 'name', 'filename');
      if (filename) {
        const filenameText = this.renderChildren(filename.children).trim();
        if (!filenameText) return '';
        return '[' + filenameText + '](' + this.attachmentsDir + '/' + filenameText + ')';
      }
      return '';
    }

    renderPlaceholder(node) {
      const text = node.attribs && node.attribs['ac:text'] || '';
      return text;
    }

    findChild(node, tagName, attrName, attrValue) {
      if (!node || !node.children) return null;
      for (const child of node.children) {
        if (child.type === 'tag' && child.name === tagName) {
          if (attrName && attrValue) {
            if (child.attribs && child.attribs[attrName] === attrValue) {
              return child;
            }
          } else {
            return child;
          }
        }
      }
      return null;
    }

    findChildren(node, tagName) {
      if (!node || !node.children) return [];
      return node.children.filter((child) => child.type === 'tag' && child.name === tagName);
    }

    escapeText(text) {
      if (!text) return '';
      return text.replace(/([\\`*_[\]()~|<>])/g, '\\$1');
    }

    escapeHtml(text) {
      if (!text) return '';
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    escapeXmlAttr(text) {
      if (!text) return '';
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    renderDetails(node) {
      const summary = this.findChild(node, 'summary');
      const summaryText = summary ? this.renderChildren(summary.children).trim() : '';
      const body = this.renderChildren(node.children.filter((child) => child !== summary));
      if (!summaryText && !body) return '';
      const lines = body.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!summaryText) return '\n' + lines + '\n';
      if (!body) return '> **' + summaryText + '**\n';
      return '> **' + summaryText + '**\n' + lines + '\n';
    }

    renderSummary(node) {
      return this.renderChildren(node.children);
    }

    renderMacro(node) {
      return this.renderStructuredMacro(node);
    }

    renderStructuredMacro(node) {
      const name = node.attribs && node.attribs['ac:name'] || '';
      switch (name) {
        case 'code':
        case 'noformat':
          return '';
        case 'quote':
          return this.renderQuote(node);
        case 'panel':
          return this.renderPanel(node);
        case 'info':
        case 'note':
        case 'tip':
        case 'warning':
          return this.renderCallout(node, name);
        case 'expand':
          return this.renderExpand(node);
        case 'anchor':
          return this.renderAnchor(node);
        case 'details':
          return this.renderDetailsMacro(node);
        case 'toc':
          return this.renderToc(node);
        case 'section':
        case 'column':
          return this.renderSection(node, name);
        case 'layout':
          return this.renderLayout(node);
        default:
          return '';
      }
    }

    renderParameter(node) {
      const name = node.attribs && node.attribs['ac:name'];
      switch (name) {
        case 'title':
        case 'name':
          return '';
        case 'body':
          return this.renderChildren(node);
        case 'code':
          return this.renderCode(node);
        case 'language':
        case 'linenumbers':
        case 'collapse':
          return this.renderChildren(node);
        case 'url':
          return this.renderUrl(node);
        case 'filename':
          return this.renderFilename(node);
        case 'width':
          return this.renderWidth(node);
        case 'height':
          return this.renderHeight(node);
        case 'alt':
          return this.renderAlt(node);
        case 'id':
          return this.renderId(node);
        case 'ac:name':
          return this.renderChildren(node);
        default:
          return '';
      }
    }

    renderAdfParameter(node) {
      const name = node.attribs && node.attribs['ac:name'];
      switch (name) {
        case 'title':
        case 'name':
          return '';
        case 'body':
          return this.renderChildren(node);
        case 'code':
          return this.renderCode(node);
        case 'language':
        case 'linenumbers':
        case 'collapse':
          return this.renderChildren(node);
        case 'url':
          return this.renderUrl(node);
        case 'filename':
          return this.renderFilename(node);
        case 'width':
          return this.renderWidth(node);
        case 'height':
          return this.renderHeight(node);
        case 'alt':
          return this.renderAlt(node);
        case 'id':
          return this.renderId(node);
        case 'ac:name':
          return this.renderChildren(node);
        default:
          return '';
      }
    }

    renderRichTextBody(node) {
      return this.renderChildren(node);
    }

    renderPlainTextBody(node) {
      return this.renderChildren(node);
    }

    renderQuote(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderPanel(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderCallout(node, type) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderExpand(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderAnchor(node) {
      const id = this.findChild(node, 'ac:parameter', 'name', 'id');
      if (id) {
        const idText = this.renderChildren(id.children).trim();
        if (!idText) return '';
        return '[#' + idText + ']';
      }
      return '';
    }

    renderDetailsMacro(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderToc(node) {
      return '';
    }

    renderSection(node, type) {
      return this.renderChildren(node);
    }

    renderLayout(node) {
      return this.renderChildren(node);
    }

    renderUrl(node) {
      return this.renderChildren(node);
    }

    renderFilename(node) {
      return this.renderChildren(node);
    }

    renderWidth(node) {
      return this.renderChildren(node);
    }

    renderHeight(node) {
      return this.renderChildren(node);
    }

    renderAlt(node) {
      return this.renderChildren(node);
    }

    renderId(node) {
      return this.renderChildren(node);
    }

    renderEmoticon(node) {
      const shortcut = node.attribs && node.attribs['ac:shortcut'] || '';
      return shortcut;
    }

    renderMention(node) {
      const username = node.attribs && node.attribs['ac:username'] || '';
      return '@' + username;
    }

    renderStatus(node) {
      const text = node.attribs && node.attribs['ac:text'] || '';
      return text;
    }

    renderDate(node) {
      const date = node.attribs && node.attribs['ac:date'] || '';
      return date;
    }

    renderPageLink(node) {
      const page = this.findChild(node, 'ac:parameter', 'name', 'page');
      if (page) {
        const pageText = this.renderChildren(page.children).trim();
        if (!pageText) return '';
        return '[' + pageText + '](' + this.webUrlPrefix + '/' + pageText + ')';
      }
      return '';
    }

    renderAttachment(node) {
      const filename = this.findChild(node, 'ac:parameter', 'name', 'filename');
      if (filename) {
        const filenameText = this.renderChildren(filename.children).trim();
        if (!filenameText) return '';
        return '[' + filenameText + '](' + this.attachmentsDir + '/' + filenameText + ')';
      }
      return '';
    }

    renderPlaceholder(node) {
      const text = node.attribs && node.attribs['ac:text'] || '';
      return text;
    }

    findChild(node, tagName, attrName, attrValue) {
      if (!node || !node.children) return null;
      for (const child of node.children) {
        if (child.type === 'tag' && child.name === tagName) {
          if (attrName && attrValue) {
            if (child.attribs && child.attribs[attrName] === attrValue) {
              return child;
            }
          } else {
            return child;
          }
        }
      }
      return null;
    }

    findChildren(node, tagName) {
      if (!node || !node.children) return [];
      return node.children.filter((child) => child.type === 'tag' && child.name === tagName);
    }

    escapeText(text) {
      if (!text) return '';
      return text.replace(/([\\`*_[\]()~|<>])/g, '\\$1');
    }

    escapeHtml(text) {
      if (!text) return '';
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    escapeXmlAttr(text) {
      if (!text) return '';
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    renderDetails(node) {
      const summary = this.findChild(node, 'summary');
      const summaryText = summary ? this.renderChildren(summary.children).trim() : '';
      const body = this.renderChildren(node.children.filter((child) => child !== summary));
      if (!summaryText && !body) return '';
      const lines = body.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!summaryText) return '\n' + lines + '\n';
      if (!body) return '> **' + summaryText + '**\n';
      return '> **' + summaryText + '**\n' + lines + '\n';
    }

    renderSummary(node) {
      return this.renderChildren(node.children);
    }

    renderMacro(node) {
      return this.renderStructuredMacro(node);
    }

    renderStructuredMacro(node) {
      const name = node.attribs && node.attribs['ac:name'] || '';
      switch (name) {
        case 'code':
        case 'noformat':
          return '';
        case 'quote':
          return this.renderQuote(node);
        case 'panel':
          return this.renderPanel(node);
        case 'info':
        case 'note':
        case 'tip':
        case 'warning':
          return this.renderCallout(node, name);
        case 'expand':
          return this.renderExpand(node);
        case 'anchor':
          return this.renderAnchor(node);
        case 'details':
          return this.renderDetailsMacro(node);
        case 'toc':
          return this.renderToc(node);
        case 'section':
        case 'column':
          return this.renderSection(node, name);
        case 'layout':
          return this.renderLayout(node);
        default:
          return '';
      }
    }

    renderParameter(node) {
      const name = node.attribs && node.attribs['ac:name'];
      switch (name) {
        case 'title':
        case 'name':
          return '';
        case 'body':
          return this.renderChildren(node);
        case 'code':
          return this.renderCode(node);
        case 'language':
        case 'linenumbers':
        case 'collapse':
          return this.renderChildren(node);
        case 'url':
          return this.renderUrl(node);
        case 'filename':
          return this.renderFilename(node);
        case 'width':
          return this.renderWidth(node);
        case 'height':
          return this.renderHeight(node);
        case 'alt':
          return this.renderAlt(node);
        case 'id':
          return this.renderId(node);
        case 'ac:name':
          return this.renderChildren(node);
        default:
          return '';
      }
    }

    renderAdfParameter(node) {
      const name = node.attribs && node.attribs['ac:name'];
      switch (name) {
        case 'title':
        case 'name':
          return '';
        case 'body':
          return this.renderChildren(node);
        case 'code':
          return this.renderCode(node);
        case 'language':
        case 'linenumbers':
        case 'collapse':
          return this.renderChildren(node);
        case 'url':
          return this.renderUrl(node);
        case 'filename':
          return this.renderFilename(node);
        case 'width':
          return this.renderWidth(node);
        case 'height':
          return this.renderHeight(node);
        case 'alt':
          return this.renderAlt(node);
        case 'id':
          return this.renderId(node);
        case 'ac:name':
          return this.renderChildren(node);
        default:
          return '';
      }
    }

    renderRichTextBody(node) {
      return this.renderChildren(node);
    }

    renderPlainTextBody(node) {
      return this.renderChildren(node);
    }

    renderQuote(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderPanel(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderCallout(node, type) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderExpand(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderAnchor(node) {
      const id = this.findChild(node, 'ac:parameter', 'name', 'id');
      if (id) {
        const idText = this.renderChildren(id.children).trim();
        if (!idText) return '';
        return '[#' + idText + ']';
      }
      return '';
    }

    renderDetailsMacro(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderToc(node) {
      return '';
    }

    renderSection(node, type) {
      return this.renderChildren(node);
    }

    renderLayout(node) {
      return this.renderChildren(node);
    }

    renderUrl(node) {
      return this.renderChildren(node);
    }

    renderFilename(node) {
      return this.renderChildren(node);
    }

    renderWidth(node) {
      return this.renderChildren(node);
    }

    renderHeight(node) {
      return this.renderChildren(node);
    }

    renderAlt(node) {
      return this.renderChildren(node);
    }

    renderId(node) {
      return this.renderChildren(node);
    }

    renderEmoticon(node) {
      const shortcut = node.attribs && node.attribs['ac:shortcut'] || '';
      return shortcut;
    }

    renderMention(node) {
      const username = node.attribs && node.attribs['ac:username'] || '';
      return '@' + username;
    }

    renderStatus(node) {
      const text = node.attribs && node.attribs['ac:text'] || '';
      return text;
    }

    renderDate(node) {
      const date = node.attribs && node.attribs['ac:date'] || '';
      return date;
    }

    renderPageLink(node) {
      const page = this.findChild(node, 'ac:parameter', 'name', 'page');
      if (page) {
        const pageText = this.renderChildren(page.children).trim();
        if (!pageText) return '';
        return '[' + pageText + '](' + this.webUrlPrefix + '/' + pageText + ')';
      }
      return '';
    }

    renderAttachment(node) {
      const filename = this.findChild(node, 'ac:parameter', 'name', 'filename');
      if (filename) {
        const filenameText = this.renderChildren(filename.children).trim();
        if (!filenameText) return '';
        return '[' + filenameText + '](' + this.attachmentsDir + '/' + filenameText + ')';
      }
      return '';
    }

    renderPlaceholder(node) {
      const text = node.attribs && node.attribs['ac:text'] || '';
      return text;
    }

    findChild(node, tagName, attrName, attrValue) {
      if (!node || !node.children) return null;
      for (const child of node.children) {
        if (child.type === 'tag' && child.name === tagName) {
          if (attrName && attrValue) {
            if (child.attribs && child.attribs[attrName] === attrValue) {
              return child;
            }
          } else {
            return child;
          }
        }
      }
      return null;
    }

    findChildren(node, tagName) {
      if (!node || !node.children) return [];
      return node.children.filter((child) => child.type === 'tag' && child.name === tagName);
    }

    escapeText(text) {
      if (!text) return '';
      return text.replace(/([\\`*_[\]()~|<>])/g, '\\$1');
    }

    escapeHtml(text) {
      if (!text) return '';
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    escapeXmlAttr(text) {
      if (!text) return '';
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    renderDetails(node) {
      const summary = this.findChild(node, 'summary');
      const summaryText = summary ? this.renderChildren(summary.children).trim() : '';
      const body = this.renderChildren(node.children.filter((child) => child !== summary));
      if (!summaryText && !body) return '';
      const lines = body.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!summaryText) return '\n' + lines + '\n';
      if (!body) return '> **' + summaryText + '**\n';
      return '> **' + summaryText + '**\n' + lines + '\n';
    }

    renderSummary(node) {
      return this.renderChildren(node.children);
    }

    renderMacro(node) {
      return this.renderStructuredMacro(node);
    }

    renderStructuredMacro(node) {
      const name = node.attribs && node.attribs['ac:name'] || '';
      switch (name) {
        case 'code':
        case 'noformat':
          return '';
        case 'quote':
          return this.renderQuote(node);
        case 'panel':
          return this.renderPanel(node);
        case 'info':
        case 'note':
        case 'tip':
        case 'warning':
          return this.renderCallout(node, name);
        case 'expand':
          return this.renderExpand(node);
        case 'anchor':
          return this.renderAnchor(node);
        case 'details':
          return this.renderDetailsMacro(node);
        case 'toc':
          return this.renderToc(node);
        case 'section':
        case 'column':
          return this.renderSection(node, name);
        case 'layout':
          return this.renderLayout(node);
        default:
          return '';
      }
    }

    renderParameter(node) {
      const name = node.attribs && node.attribs['ac:name'];
      switch (name) {
        case 'title':
        case 'name':
          return '';
        case 'body':
          return this.renderChildren(node);
        case 'code':
          return this.renderCode(node);
        case 'language':
        case 'linenumbers':
        case 'collapse':
          return this.renderChildren(node);
        case 'url':
          return this.renderUrl(node);
        case 'filename':
          return this.renderFilename(node);
        case 'width':
          return this.renderWidth(node);
        case 'height':
          return this.renderHeight(node);
        case 'alt':
          return this.renderAlt(node);
        case 'id':
          return this.renderId(node);
        case 'ac:name':
          return this.renderChildren(node);
        default:
          return '';
      }
    }

    renderAdfParameter(node) {
      const name = node.attribs && node.attribs['ac:name'];
      switch (name) {
        case 'title':
        case 'name':
          return '';
        case 'body':
          return this.renderChildren(node);
        case 'code':
          return this.renderCode(node);
        case 'language':
        case 'linenumbers':
        case 'collapse':
          return this.renderChildren(node);
        case 'url':
          return this.renderUrl(node);
        case 'filename':
          return this.renderFilename(node);
        case 'width':
          return this.renderWidth(node);
        case 'height':
          return this.renderHeight(node);
        case 'alt':
          return this.renderAlt(node);
        case 'id':
          return this.renderId(node);
        case 'ac:name':
          return this.renderChildren(node);
        default:
          return '';
      }
    }

    renderRichTextBody(node) {
      return this.renderChildren(node);
    }

    renderPlainTextBody(node) {
      return this.renderChildren(node);
    }

    renderQuote(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderPanel(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderCallout(node, type) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderExpand(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderAnchor(node) {
      const id = this.findChild(node, 'ac:parameter', 'name', 'id');
      if (id) {
        const idText = this.renderChildren(id.children).trim();
        if (!idText) return '';
        return '[#' + idText + ']';
      }
      return '';
    }

    renderDetailsMacro(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderToc(node) {
      return '';
    }

    renderSection(node, type) {
      return this.renderChildren(node);
    }

    renderLayout(node) {
      return this.renderChildren(node);
    }

    renderUrl(node) {
      return this.renderChildren(node);
    }

    renderFilename(node) {
      return this.renderChildren(node);
    }

    renderWidth(node) {
      return this.renderChildren(node);
    }

    renderHeight(node) {
      return this.renderChildren(node);
    }

    renderAlt(node) {
      return this.renderChildren(node);
    }

    renderId(node) {
      return this.renderChildren(node);
    }

    renderEmoticon(node) {
      const shortcut = node.attribs && node.attribs['ac:shortcut'] || '';
      return shortcut;
    }

    renderMention(node) {
      const username = node.attribs && node.attribs['ac:username'] || '';
      return '@' + username;
    }

    renderStatus(node) {
      const text = node.attribs && node.attribs['ac:text'] || '';
      return text;
    }

    renderDate(node) {
      const date = node.attribs && node.attribs['ac:date'] || '';
      return date;
    }

    renderPageLink(node) {
      const page = this.findChild(node, 'ac:parameter', 'name', 'page');
      if (page) {
        const pageText = this.renderChildren(page.children).trim();
        if (!pageText) return '';
        return '[' + pageText + '](' + this.webUrlPrefix + '/' + pageText + ')';
      }
      return '';
    }

    renderAttachment(node) {
      const filename = this.findChild(node, 'ac:parameter', 'name', 'filename');
      if (filename) {
        const filenameText = this.renderChildren(filename.children).trim();
        if (!filenameText) return '';
        return '[' + filenameText + '](' + this.attachmentsDir + '/' + filenameText + ')';
      }
      return '';
    }

    renderPlaceholder(node) {
      const text = node.attribs && node.attribs['ac:text'] || '';
      return text;
    }

    findChild(node, tagName, attrName, attrValue) {
      if (!node || !node.children) return null;
      for (const child of node.children) {
        if (child.type === 'tag' && child.name === tagName) {
          if (attrName && attrValue) {
            if (child.attribs && child.attribs[attrName] === attrValue) {
              return child;
            }
          } else {
            return child;
          }
        }
      }
      return null;
    }

    findChildren(node, tagName) {
      if (!node || !node.children) return [];
      return node.children.filter((child) => child.type === 'tag' && child.name === tagName);
    }

    escapeText(text) {
      if (!text) return '';
      return text.replace(/([\\`*_[\]()~|<>])/g, '\\$1');
    }

    escapeHtml(text) {
      if (!text) return '';
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    escapeXmlAttr(text) {
      if (!text) return '';
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    renderDetails(node) {
      const summary = this.findChild(node, 'summary');
      const summaryText = summary ? this.renderChildren(summary.children).trim() : '';
      const body = this.renderChildren(node.children.filter((child) => child !== summary));
      if (!summaryText && !body) return '';
      const lines = body.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!summaryText) return '\n' + lines + '\n';
      if (!body) return '> **' + summaryText + '**\n';
      return '> **' + summaryText + '**\n' + lines + '\n';
    }

    renderSummary(node) {
      return this.renderChildren(node.children);
    }

    renderMacro(node) {
      return this.renderStructuredMacro(node);
    }

    renderStructuredMacro(node) {
      const name = node.attribs && node.attribs['ac:name'] || '';
      switch (name) {
        case 'code':
        case 'noformat':
          return '';
        case 'quote':
          return this.renderQuote(node);
        case 'panel':
          return this.renderPanel(node);
        case 'info':
        case 'note':
        case 'tip':
        case 'warning':
          return this.renderCallout(node, name);
        case 'expand':
          return this.renderExpand(node);
        case 'anchor':
          return this.renderAnchor(node);
        case 'details':
          return this.renderDetailsMacro(node);
        case 'toc':
          return this.renderToc(node);
        case 'section':
        case 'column':
          return this.renderSection(node, name);
        case 'layout':
          return this.renderLayout(node);
        default:
          return '';
      }
    }

    renderParameter(node) {
      const name = node.attribs && node.attribs['ac:name'];
      switch (name) {
        case 'title':
        case 'name':
          return '';
        case 'body':
          return this.renderChildren(node);
        case 'code':
          return this.renderCode(node);
        case 'language':
        case 'linenumbers':
        case 'collapse':
          return this.renderChildren(node);
        case 'url':
          return this.renderUrl(node);
        case 'filename':
          return this.renderFilename(node);
        case 'width':
          return this.renderWidth(node);
        case 'height':
          return this.renderHeight(node);
        case 'alt':
          return this.renderAlt(node);
        case 'id':
          return this.renderId(node);
        case 'ac:name':
          return this.renderChildren(node);
        default:
          return '';
      }
    }

    renderAdfParameter(node) {
      const name = node.attribs && node.attribs['ac:name'];
      switch (name) {
        case 'title':
        case 'name':
          return '';
        case 'body':
          return this.renderChildren(node);
        case 'code':
          return this.renderCode(node);
        case 'language':
        case 'linenumbers':
        case 'collapse':
          return this.renderChildren(node);
        case 'url':
          return this.renderUrl(node);
        case 'filename':
          return this.renderFilename(node);
        case 'width':
          return this.renderWidth(node);
        case 'height':
          return this.renderHeight(node);
        case 'alt':
          return this.renderAlt(node);
        case 'id':
          return this.renderId(node);
        case 'ac:name':
          return this.renderChildren(node);
        default:
          return '';
      }
    }

    renderRichTextBody(node) {
      return this.renderChildren(node);
    }

    renderPlainTextBody(node) {
      return this.renderChildren(node);
    }

    renderQuote(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderPanel(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderCallout(node, type) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderExpand(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderAnchor(node) {
      const id = this.findChild(node, 'ac:parameter', 'name', 'id');
      if (id) {
        const idText = this.renderChildren(id.children).trim();
        if (!idText) return '';
        return '[#' + idText + ']';
      }
      return '';
    }

    renderDetailsMacro(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderToc(node) {
      return '';
    }

    renderSection(node, type) {
      return this.renderChildren(node);
    }

    renderLayout(node) {
      return this.renderChildren(node);
    }

    renderUrl(node) {
      return this.renderChildren(node);
    }

    renderFilename(node) {
      return this.renderChildren(node);
    }

    renderWidth(node) {
      return this.renderChildren(node);
    }

    renderHeight(node) {
      return this.renderChildren(node);
    }

    renderAlt(node) {
      return this.renderChildren(node);
    }

    renderId(node) {
      return this.renderChildren(node);
    }

    renderEmoticon(node) {
      const shortcut = node.attribs && node.attribs['ac:shortcut'] || '';
      return shortcut;
    }

    renderMention(node) {
      const username = node.attribs && node.attribs['ac:username'] || '';
      return '@' + username;
    }

    renderStatus(node) {
      const text = node.attribs && node.attribs['ac:text'] || '';
      return text;
    }

    renderDate(node) {
      const date = node.attribs && node.attribs['ac:date'] || '';
      return date;
    }

    renderPageLink(node) {
      const page = this.findChild(node, 'ac:parameter', 'name', 'page');
      if (page) {
        const pageText = this.renderChildren(page.children).trim();
        if (!pageText) return '';
        return '[' + pageText + '](' + this.webUrlPrefix + '/' + pageText + ')';
      }
      return '';
    }

    renderAttachment(node) {
      const filename = this.findChild(node, 'ac:parameter', 'name', 'filename');
      if (filename) {
        const filenameText = this.renderChildren(filename.children).trim();
        if (!filenameText) return '';
        return '[' + filenameText + '](' + this.attachmentsDir + '/' + filenameText + ')';
      }
      return '';
    }

    renderPlaceholder(node) {
      const text = node.attribs && node.attribs['ac:text'] || '';
      return text;
    }

    findChild(node, tagName, attrName, attrValue) {
      if (!node || !node.children) return null;
      for (const child of node.children) {
        if (child.type === 'tag' && child.name === tagName) {
          if (attrName && attrValue) {
            if (child.attribs && child.attribs[attrName] === attrValue) {
              return child;
            }
          } else {
            return child;
          }
        }
      }
      return null;
    }

    findChildren(node, tagName) {
      if (!node || !node.children) return [];
      return node.children.filter((child) => child.type === 'tag' && child.name === tagName);
    }

    escapeText(text) {
      if (!text) return '';
      return text.replace(/([\\`*_[\]()~|<>])/g, '\\$1');
    }

    escapeHtml(text) {
      if (!text) return '';
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    escapeXmlAttr(text) {
      if (!text) return '';
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    renderDetails(node) {
      const summary = this.findChild(node, 'summary');
      const summaryText = summary ? this.renderChildren(summary.children).trim() : '';
      const body = this.renderChildren(node.children.filter((child) => child !== summary));
      if (!summaryText && !body) return '';
      const lines = body.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!summaryText) return '\n' + lines + '\n';
      if (!body) return '> **' + summaryText + '**\n';
      return '> **' + summaryText + '**\n' + lines + '\n';
    }

    renderSummary(node) {
      return this.renderChildren(node.children);
    }

    renderMacro(node) {
      return this.renderStructuredMacro(node);
    }

    renderStructuredMacro(node) {
      const name = node.attribs && node.attribs['ac:name'] || '';
      switch (name) {
        case 'code':
        case 'noformat':
          return '';
        case 'quote':
          return this.renderQuote(node);
        case 'panel':
          return this.renderPanel(node);
        case 'info':
        case 'note':
        case 'tip':
        case 'warning':
          return this.renderCallout(node, name);
        case 'expand':
          return this.renderExpand(node);
        case 'anchor':
          return this.renderAnchor(node);
        case 'details':
          return this.renderDetailsMacro(node);
        case 'toc':
          return this.renderToc(node);
        case 'section':
        case 'column':
          return this.renderSection(node, name);
        case 'layout':
          return this.renderLayout(node);
        default:
          return '';
      }
    }

    renderParameter(node) {
      const name = node.attribs && node.attribs['ac:name'];
      switch (name) {
        case 'title':
        case 'name':
          return '';
        case 'body':
          return this.renderChildren(node);
        case 'code':
          return this.renderCode(node);
        case 'language':
        case 'linenumbers':
        case 'collapse':
          return this.renderChildren(node);
        case 'url':
          return this.renderUrl(node);
        case 'filename':
          return this.renderFilename(node);
        case 'width':
          return this.renderWidth(node);
        case 'height':
          return this.renderHeight(node);
        case 'alt':
          return this.renderAlt(node);
        case 'id':
          return this.renderId(node);
        case 'ac:name':
          return this.renderChildren(node);
        default:
          return '';
      }
    }

    renderAdfParameter(node) {
      const name = node.attribs && node.attribs['ac:name'];
      switch (name) {
        case 'title':
        case 'name':
          return '';
        case 'body':
          return this.renderChildren(node);
        case 'code':
          return this.renderCode(node);
        case 'language':
        case 'linenumbers':
        case 'collapse':
          return this.renderChildren(node);
        case 'url':
          return this.renderUrl(node);
        case 'filename':
          return this.renderFilename(node);
        case 'width':
          return this.renderWidth(node);
        case 'height':
          return this.renderHeight(node);
        case 'alt':
          return this.renderAlt(node);
        case 'id':
          return this.renderId(node);
        case 'ac:name':
          return this.renderChildren(node);
        default:
          return '';
      }
    }

    renderRichTextBody(node) {
      return this.renderChildren(node);
    }

    renderPlainTextBody(node) {
      return this.renderChildren(node);
    }

    renderQuote(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderPanel(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderCallout(node, type) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderExpand(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderAnchor(node) {
      const id = this.findChild(node, 'ac:parameter', 'name', 'id');
      if (id) {
        const idText = this.renderChildren(id.children).trim();
        if (!idText) return '';
        return '[#' + idText + ']';
      }
      return '';
    }

    renderDetailsMacro(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderToc(node) {
      return '';
    }

    renderSection(node, type) {
      return this.renderChildren(node);
    }

    renderLayout(node) {
      return this.renderChildren(node);
    }

    renderUrl(node) {
      return this.renderChildren(node);
    }

    renderFilename(node) {
      return this.renderChildren(node);
    }

    renderWidth(node) {
      return this.renderChildren(node);
    }

    renderHeight(node) {
      return this.renderChildren(node);
    }

    renderAlt(node) {
      return this.renderChildren(node);
    }

    renderId(node) {
      return this.renderChildren(node);
    }

    renderEmoticon(node) {
      const shortcut = node.attribs && node.attribs['ac:shortcut'] || '';
      return shortcut;
    }

    renderMention(node) {
      const username = node.attribs && node.attribs['ac:username'] || '';
      return '@' + username;
    }

    renderStatus(node) {
      const text = node.attribs && node.attribs['ac:text'] || '';
      return text;
    }

    renderDate(node) {
      const date = node.attribs && node.attribs['ac:date'] || '';
      return date;
    }

    renderPageLink(node) {
      const page = this.findChild(node, 'ac:parameter', 'name', 'page');
      if (page) {
        const pageText = this.renderChildren(page.children).trim();
        if (!pageText) return '';
        return '[' + pageText + '](' + this.webUrlPrefix + '/' + pageText + ')';
      }
      return '';
    }

    renderAttachment(node) {
      const filename = this.findChild(node, 'ac:parameter', 'name', 'filename');
      if (filename) {
        const filenameText = this.renderChildren(filename.children).trim();
        if (!filenameText) return '';
        return '[' + filenameText + '](' + this.attachmentsDir + '/' + filenameText + ')';
      }
      return '';
    }

    renderPlaceholder(node) {
      const text = node.attribs && node.attribs['ac:text'] || '';
      return text;
    }

    findChild(node, tagName, attrName, attrValue) {
      if (!node || !node.children) return null;
      for (const child of node.children) {
        if (child.type === 'tag' && child.name === tagName) {
          if (attrName && attrValue) {
            if (child.attribs && child.attribs[attrName] === attrValue) {
              return child;
            }
          } else {
            return child;
          }
        }
      }
      return null;
    }

    findChildren(node, tagName) {
      if (!node || !node.children) return [];
      return node.children.filter((child) => child.type === 'tag' && child.name === tagName);
    }

    escapeText(text) {
      if (!text) return '';
      return text.replace(/([\\`*_[\]()~|<>])/g, '\\$1');
    }

    escapeHtml(text) {
      if (!text) return '';
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    escapeXmlAttr(text) {
      if (!text) return '';
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    renderDetails(node) {
      const summary = this.findChild(node, 'summary');
      const summaryText = summary ? this.renderChildren(summary.children).trim() : '';
      const body = this.renderChildren(node.children.filter((child) => child !== summary));
      if (!summaryText && !body) return '';
      const lines = body.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!summaryText) return '\n' + lines + '\n';
      if (!body) return '> **' + summaryText + '**\n';
      return '> **' + summaryText + '**\n' + lines + '\n';
    }

    renderSummary(node) {
      return this.renderChildren(node.children);
    }

    renderMacro(node) {
      return this.renderStructuredMacro(node);
    }

    renderStructuredMacro(node) {
      const name = node.attribs && node.attribs['ac:name'] || '';
      switch (name) {
        case 'code':
        case 'noformat':
          return '';
        case 'quote':
          return this.renderQuote(node);
        case 'panel':
          return this.renderPanel(node);
        case 'info':
        case 'note':
        case 'tip':
        case 'warning':
          return this.renderCallout(node, name);
        case 'expand':
          return this.renderExpand(node);
        case 'anchor':
          return this.renderAnchor(node);
        case 'details':
          return this.renderDetailsMacro(node);
        case 'toc':
          return this.renderToc(node);
        case 'section':
        case 'column':
          return this.renderSection(node, name);
        case 'layout':
          return this.renderLayout(node);
        default:
          return '';
      }
    }

    renderParameter(node) {
      const name = node.attribs && node.attribs['ac:name'];
      switch (name) {
        case 'title':
        case 'name':
          return '';
        case 'body':
          return this.renderChildren(node);
        case 'code':
          return this.renderCode(node);
        case 'language':
        case 'linenumbers':
        case 'collapse':
          return this.renderChildren(node);
        case 'url':
          return this.renderUrl(node);
        case 'filename':
          return this.renderFilename(node);
        case 'width':
          return this.renderWidth(node);
        case 'height':
          return this.renderHeight(node);
        case 'alt':
          return this.renderAlt(node);
        case 'id':
          return this.renderId(node);
        case 'ac:name':
          return this.renderChildren(node);
        default:
          return '';
      }
    }

    renderAdfParameter(node) {
      const name = node.attribs && node.attribs['ac:name'];
      switch (name) {
        case 'title':
        case 'name':
          return '';
        case 'body':
          return this.renderChildren(node);
        case 'code':
          return this.renderCode(node);
        case 'language':
        case 'linenumbers':
        case 'collapse':
          return this.renderChildren(node);
        case 'url':
          return this.renderUrl(node);
        case 'filename':
          return this.renderFilename(node);
        case 'width':
          return this.renderWidth(node);
        case 'height':
          return this.renderHeight(node);
        case 'alt':
          return this.renderAlt(node);
        case 'id':
          return this.renderId(node);
        case 'ac:name':
          return this.renderChildren(node);
        default:
          return '';
      }
    }

    renderRichTextBody(node) {
      return this.renderChildren(node);
    }

    renderPlainTextBody(node) {
      return this.renderChildren(node);
    }

    renderQuote(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text-body');
      const bodyText = body ? this.renderChildren(body.children).trim() : '';
      if (!titleText && !bodyText) return '';
      const lines = bodyText.split('\n').map((line) => line ? '> ' + line : '>').join('\n');
      if (!titleText) return '\n' + lines + '\n';
      if (!bodyText) return '> **' + titleText + '**\n';
      return '> **' + titleText + '**\n' + lines + '\n';
    }

    renderPanel(node) {
      const title = this.findChild(node, 'ac:parameter', 'name', 'title');
      const titleText = title ? this.renderChildren(title.children).trim() : '';
      const body = this.findChild(node, 'ac:rich-text
