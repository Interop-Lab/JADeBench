var __getOwnPropNames = Object.getOwnPropertyNames;

var __commonJS = (cb, det) => function _require() {
  const module = {};
  module.exports = {};
  (det || (__getOwnPropNames(cb)[0] && (cb(__getOwnPropNames(cb)[0], module), module)))(
    (det = module).exports,
    det
  );
  return det.exports;
};

var require_markdown_cleanup = __commonJS({
  '../work/pchuri__confluence-cli/lib/markdown-cleanup.js'(exports, module) {
    function fenceLength(text) {
      let max = 0;
      const matches = text.match(/`+/g);
      if (matches) {
        for (const m of matches) {
          if (m.length > max) max = m.length;
        }
      }
      return Math.max(3, max + 1);
    }

    function splitByFences(text) {
      const parts = [];
      const re = /^ {0,3}(`{3,})[^\n]*\n[\s\S]*?\n {0,3}\1[\t ]*$/gm;
      let last = 0;
      let m;
      while ((m = re.exec(text)) !== null) {
        parts.push(text.slice(last, m.index));
        parts.push(m[0]);
        last = m.index + m[0].length;
      }
      parts.push(text.slice(last));
      return parts;
    }

    function cleanupText(text) {
      let s = text;
      s = s.replace(/[ \t]+$/gm, '');
      s = s.replace(/^[ \t]+(?!([`>]|[*+-] |\d+[.)] ))/gm, '');
      s = s.replace(/^(#{1,6}[^\n]+)\n(?!\n)/gm, '$1\n\n');
      s = s.replace(/\n\s*\n\s*\n+/g, '\n\n');
      s = s.replace(/[ \t]+/g, ' ');
      return s;
    }

    function cleanupWithFences(text) {
      const parts = splitByFences(text);
      return parts
        .map((part, i) => (i % 2 === 0 ? part : cleanupText(part)))
        .join('')
        .trim();
    }

    const exportsObj = {};
    exportsObj.fenceLength = fenceLength;
    exportsObj.splitByFences = splitByFences;
    exportsObj.cleanupText = cleanupText;
    exportsObj.cleanupWithFences = cleanupWithFences;
    module.exports = exportsObj;
  }
});

var require_storage_walker = __commonJS({
  '../work/pchuri__confluence-cli/lib/storage-walker.js'(exports, module) {
    var { Parser, DomHandler } = require('htmlparser2');
    var { decodeHTML } = require('entities');
    var { fenceLength, cleanupWithFences } = require_markdown_cleanup();

    var DEFAULT_MAX_DEPTH = 50;

    const QUOTE_MAP = {};
    QUOTE_MAP[' '] = ' ';
    QUOTE_MAP['"'] = '"';
    QUOTE_MAP['"'] = '"';
    QUOTEMAP['"'] = '"';
    QUOTE_MAP["'"] = "'";
    QUOTE_MAP["'"] = "'";
    QUOTE_MAP['`'] = '`';
    var QUOTES = QUOTE_MAP;

    function decodeEntities(text) {
      if (!text) return '';
      return text.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g, (full, ent) => {
        if (ent[0] === '#') {
          const num =
            ent[1] === 'x' || ent[1] === 'X'
              ? parseInt(ent.slice(1), 16)
              : parseInt(ent.slice(1), 10);
          if (!Number.isFinite(num)) return full;
          try {
            return String.fromCodePoint(num);
          } catch {
            return full;
          }
        }
        if (Object.prototype.hasOwnProperty.call(QUOTES, ent)) {
          return QUOTES[ent];
        }
        return decodeHTML('&' + ent + ';');
      });
    }

    var MaxDepthExceededError = class extends Error {
      constructor(maxDepth) {
        super('Maximum nesting depth (' + maxDepth + ') exceeded');
        this.name = 'MaxDepthExceededError';
        this.maxDepth = maxDepth;
      }
    };

    var StorageWalker = class {
      constructor({
        attachmentsDir: attachmentsDir = 'attachments',
        labels: labels = {},
        buildUrl: buildUrl = id => id,
        webUrlPrefix: webUrlPrefix = '',
        maxDepth: maxDepth = DEFAULT_MAX_DEPTH
      } = {}) {
        this.buildUrl = buildUrl;
        this.maxDepth = maxDepth;
        this.labels = labels;
        this.attachmentsDir = attachmentsDir;
        this.webUrlPrefix = webUrlPrefix;
      }

      walk(html) {
        this.depth = 0;
        this.currentListDepth = 0;
        this.currentTableDepth = 0;
        this.warnings = [];

        const handler = new DomHandler(null, { withStartIndices: true });
        const markerStack = [];
        const onstart = handler.onStartIndex.bind(handler);
        const onend = handler.onEndIndex.bind(handler);

        handler.onstart = (...args) => {
          const marker = {};
          marker.index = args[0].startIndex;
          marker.name = args[0].name;
          markerStack.push(marker);
          onstart(...args);
        };

        handler.onend = (...args) => {
          const [node, marker] = args;
          const lastMarker = markerStack.pop();
          if (marker) {
            const isContent =
              lastMarker &&
              lastMarker.index === node.startIndex &&
              lastMarker.name === node.name;
            if (!isContent) {
              const snippet = html.slice(node.startIndex, node.endIndex);
              this.warnings.push({
                type: 'unparsed',
                snippet: snippet,
                name: node.name
              });
              if (process.env.CONFLUENCE_CLI_VERBOSE) {
                process.stderr.write(
                  'Warning: Unparsed content in <' +
                    node.name +
                    '>: ' +
                    snippet +
                    '\n'
                );
              }
            }
            onend(...args);
          }
        };

        const parserOpts = {};
        parserOpts.lowerCaseTags = true;
        parserOpts.lowerCaseAttributeNames = true;
        parserOpts.recognizeSelfClosing = true;

        const parser = new Parser(handler, parserOpts);
        parser.write(html);
        parser.end();

        return this.processNodes(this.getChildNodes(handler.root));
      }

      getChildNodes(node) {
        if (!node) return '';
        return (node.childNodes || []).map(child => this.processNode(child)).join('');
      }

      processNode(node) {
        if (!node) return '';
        switch (node.type) {
          case 'text':
            return this.getTextContent(node.data || '');
          case 'tag':
            return this.processElement(node);
          case 'script':
          case 'style':
            return '';
          case 'cdata':
          case 'comment':
          case 'directive':
            return this.processElement(node);
          default:
            return '';
        }
      }

      processElement(node) {
        if (++this.depth > this.maxDepth) {
          this.depth--;
          throw new MaxDepthExceededError(this.maxDepth);
        }
        try {
          return this.processTag(node);
        } finally {
          this.depth--;
        }
      }

      processTag(node) {
        const tag = node.name;
        switch (tag) {
          case 'p':
            return '\n' + this.getChildNodes(node.childNodes || []).trim() + '\n';
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6': {
            const level = parseInt(tag.slice(1), 10);
            return '\n' + '#'.repeat(level) + ' ' + this.getChildNodes(node.childNodes || []).trim() + '\n';
          }
          case 'strong':
          case 'b':
            return '**' + this.getChildNodes(node.childNodes || []) + '**';
          case 'em':
          case 'i':
            return '*' + this.getChildNodes(node.childNodes || []) + '*';
          case 's':
          case 'del':
          case 'strike':
            return '~~' + this.getChildNodes(node.childNodes || []) + '~~';
          case 'code': {
            return this.processCode(node);
          }
          case 'br':
            return '\n';
          case 'hr':
            return '\n---\n';
          case 'a': {
            const href = decodeEntities(node.attribs && node.attribs.href || '');
            if (!href) return this.getChildNodes(node.childNodes || []);
            this.currentListDepth++;
            let text;
            try {
              text = this.getChildNodes(node.childNodes || []);
            } finally {
              this.currentListDepth--;
            }
            return '[' + text + '](' + href + ')';
          }
          case 'img':
            return this.processImage(node);
          case 'ul':
            return this.processList(node, false);
          case 'ol':
            return this.processList(node, true);
          case 'li':
            return this.getChildNodes(node.childNodes || []);
          case 'blockquote':
            return this.processBlockquote(node);
          case 'table':
          case 'thead':
          case 'tbody':
          case 'tfoot':
          case 'tr':
          case 'th':
          case 'td':
            return this.getChildNodes(node.childNodes || []);
          case 'pre':
            return this.processPre(node);
          case 'div':
            return this.processDiv(node);
          case 'span':
          case 'font':
          case 'u':
          case 'sub':
          case 'sup':
          case 'mark':
            return '<' + tag + '>' + this.getChildNodes(node.childNodes || []) + '</' + tag + '>';
          case 'details':
            return this.processDetails(node);
          case 'summary':
            return this.processSummary(node);
          case 'ac:structured-macro':
            return this.processMacro(node);
          case 'ac:parameter':
            return this.processParameter(node);
          case 'ac:rich-text-body':
            return this.processRichTextBody(node);
          case 'ac:plain-text-body':
            return this.processPlainTextNode(node);
          case 'ac:link':
            return this.processLink(node);
          case 'ri:attachment':
            return this.processAttachment(node);
          case 'ri:page':
            return this.processPage(node);
          case 'ri:user':
            return this.processUser(node);
          case 'ri:url':
            return this.processUrl(node);
          case 'ac:image':
            return this.processAcImage(node);
          case 'ac:emoticon':
          case 'ac:task-list':
          case 'ac:task':
          case 'ac:task-id':
          case 'ac:task-status':
            return '';
          default:
            return this.getChildNodes(node.childNodes || []);
        }
      }

      processList(node, ordered) {
        const items = (node.childNodes || []).filter(c => c.type === 'tag' && c.name === 'li');
        let counter = 0;
        let result = '';
        for (const item of items) {
          const text = this.getChildNodes(item.childNodes || [])
            .replace(/\s+/g, ' ')
            .trim();
          if (!text) continue;
          const marker = ordered ? ++counter + '.' : '-';
          result += marker + ' ' + text + '\n';
        }
        return result ? '\n' + result : '';
      }

      processTable(node) {
        const rows = [];
        const trs = this.getChildElements(node, 'tr');
        let first = true;
        for (const tr of trs) {
          const cells = (tr.childNodes || []).filter(
            c => c.type === 'tag' && (c.name === 'th' || c.name === 'td')
          );
          if (cells.length === 0) continue;
          const row = cells.map(
            cell => this.getChildNodes(cell.childNodes || []).replace(/\s+/g, ' ').trim() || ' '
          );
          rows.push('| ' + row.join(' | ') + ' |');
          if (first) {
            rows.push('| ' + row.map(() => '---').join(' | ') + ' |');
            first = false;
          }
        }
        return rows.length > 0 ? '\n' + rows.join('\n') + '\n' : '';
      }

      processBlockquote(node) {
        const text = this.getChildNodes(node.childNodes || []).trim();
        if (!text) return '';
        const quoted = text
          .split('\n')
          .map(line => (line.length === 0 ? '>' : '> ' + line))
          .join('\n');
        return '\n' + quoted + '\n';
      }

      processCode(node) {
        const codeNode = this.findElement(node, 'code');
        const lang = (codeNode ? this.getTextContent(codeNode) : '').trim();
        const content = this.getChildNodes(node);
        const fence = '`'.repeat(fenceLength(content));
        return '\n' + fence + lang + '\n' + content + '\n' + fence + '\n';
      }

      processPre(node) {
        const codeNode = this.findElement(node, '');
        const lang = (codeNode ? this.getTextContent(codeNode) : '').trim();
        const content = this.getChildNodes(node).trim();
        const quoted = content
          .split('\n')
          .map(line => (line.length === 0 ? '>' : '> ' + line))
          .join('\n');
        const header = '\n**' + lang.toUpperCase() + '**';
        const body = content.length > 0 ? header + '\n' + quoted : header;
        return '\n' + body + '\n';
      }

      processDiv(node) {
        const align = node.attribs && node.attribs['data-align'];
        switch (align) {
          case 'center':
          case 'right':
            return '';
          case 'left':
            return this.processBlockquote(node);
          case 'justify':
            return this.processPre(node);
          case 'full':
          case 'full-width':
            return this.processTable(node);
          default:
            return this.getChildNodes(node.childNodes || []);
        }
      }

      processDetails(node) {
        const summaryNode = this.findElement(node, 'summary');
        const summary = (summaryNode ? this.getTextContent(summaryNode) : '').trim();
        const content = this.getChildNodes(node);
        if (summary)
          return (
            '\n**' +
            summary +
            '**\n' +
            this.getChildNodes(content).trim() +
            '\n'
          );
        return (
          '\n**' +
          (this.labels.expand || 'Expand') +
          '**\n' +
          this.getChildNodes(content).trim() +
          '\n'
        );
      }

      processSummary(node) {
        const summaryNode = this.findElement(node, '');
        const summary = (summaryNode ? this.getTextContent(summaryNode) : '').trim();
        const fence = '`'.repeat(fenceLength(summary));
        return '\n' + fence + '\n' + summary + '\n' + fence + '\n';
      }

      processMacro(node) {
        const name = node.attribs && node.attribs.name;
        switch (name) {
          case 'code':
            return this.processCodeBlock(node);
          case 'warning':
          case 'info':
          case 'note':
          case 'tip':
            return this.processCallout(node, name);
          case 'panel':
            return this.processPanel(node);
          case 'expand':
            return this.processExpand(node);
          case 'toc':
            return this.processToc(node);
          case 'status':
            return this.processStatus(node);
          case 'tasks':
            return this.processTasks(node);
          case 'tasklist':
            return this.processTaskList(node);
          default:
            return '';
        }
      }

      processCodeBlock(node) {
        const paramNode = this.findElement(node, 'ac:parameter');
        const lang = (paramNode ? this.getTextContent(paramNode) : '').trim();
        const bodyNode = this.findElement(node, 'ac:plain-text-body');
        const code = bodyNode ? this.getTextContent(bodyNode) : '';
        const fence = '`'.repeat(fenceLength(code));
        return '\n' + fence + lang + '\n' + code + '\n' + fence + '\n';
      }

      processCallout(node, type) {
        const paramNode = this.findElement(node, 'ac:parameter');
        const title = (paramNode ? this.getTextContent(paramNode) : '').trim();
        const content = this.getChildNodes(node);
        const body = this.getChildNodes(content).trim();
        const icon = this.labels[type + 'Icon'] || type.toUpperCase();
        const prefix = title ? ': ' + title + ' ' : ' ';
        return '\n**' + icon + '**' + prefix + '(' + type + ': ' + body + ')\n';
      }

      processPanel(node) {
        const titleNode = this.findElement(node, 'ac:parameter');
        const title = (titleNode ? this.getTextContent(titleNode) : '').trim();
        const content = this.getChildNodes(node);
        const body = this.getChildNodes(content).trim();
        const panelTitle = this.labels.panelTitle || 'Panel';
        if (title)
          return (
            '\n**' +
            panelTitle +
            ': ' +
            title +
            '**\n' +
            body +
            '\n'
          );
        return (
          '\n**' +
          (this.labels.panel || 'Panel') +
          '**\n' +
          body +
          '\n'
        );
      }

      processExpand(node) {
        const titleNode = this.findElement(node, 'ac:parameter');
        const title = (titleNode ? this.getTextContent(titleNode) : '').trim();
        const content = this.getChildNodes(node);
        const body = this.getChildNodes(content).trim();
        const expandTitle = this.labels.expand || 'Expand';
        if (title)
          return (
            '\n**' +
            expandTitle +
            ': ' +
            title +
            '**\n' +
            body +
            '\n'
          );
        return '\n**' + expandTitle + '**\n' + body + '\n';
      }

      processToc(node) {
        return '\n**Table of Contents**\n';
      }

      processStatus(node) {
        const paramNode = this.findElement(node, 'ac:parameter');
        const text = (paramNode ? this.getTextContent(paramNode) : '').trim();
        const color = this.findElement(node, 'ac:parameter');
        const colorText = color ? this.getTextContent(color) : '';
        return '\n**' + text + '** (' + colorText + ')\n';
      }

      processTasks(node) {
        const items = (node.childNodes || []).filter(
          c => c.type === 'tag' && c.name === 'ac:task'
        );
        const result = [];
        for (const item of items) {
          const idNode = this.findElement(item, 'ac:task-id');
          const statusNode = this.findElement(item, 'ac:task-status');
          const id = idNode ? this.getTextContent(idNode) : '';
          const status = statusNode ? this.getTextContent(statusNode) : '';
          result.push('- [' + (status === 'complete' ? 'x' : ' ') + '] ' + id);
        }
        return result.length > 0 ? '\n' + result.join('\n') + '\n' : '';
      }

      processTaskList(node) {
        const paramNode = this.findElement(node, 'ac:parameter');
        const title = (paramNode ? this.getTextContent(paramNode) : '').trim();
        const content = this.getChildNodes(node);
        const body = this.getChildNodes(content).trim();
        if (!title && !body) return '';
        const quoted = body
          .split('\n')
          .map(line => (line ? '> ' + line : '>'))
          .join('\n');
        if (!title) return '\n' + quoted + '\n';
        if (!body) return '\n**' + title + '**\n';
        return '\n**' + title + '**\n' + quoted + '\n';
      }

      processParameter(node) {
        const paramNode = this.findElement(node, 'ac:parameter');
        const text = (paramNode ? this.getTextContent(paramNode) : '').trim();
        const fence = '`'.repeat(fenceLength(text));
        return '\n' + fence + '\n' + text + '\n' + fence + '\n';
      }

      processRichTextBody(node) {
        const paramNode = this.findElement(node, 'ac:parameter');
        const title = (paramNode ? this.getTextContent(paramNode) : '').trim();
        const content = this.getChildNodes(node);
        const body = this.getChildNodes(content).trim();
        if (!title && !body) return '';
        const quoted = body
          .split('\n')
          .map(line => (line ? '> ' + line : '>'))
          .join('\n');
        if (!title) return '\n' + quoted + '\n';
        if (!body) return '\n**' + title + '**\n';
        return '\n**' + title + '**\n' + quoted + '\n';
      }

      processPlainTextNode(node) {
        const paramNode = this.findElement(node, 'ac:parameter');
        const text = (paramNode ? this.getTextContent(paramNode) : '').trim();
        const fence = '`'.repeat(fenceLength(text));
        return '\n' + fence + '\n' + text + '\n' + fence + '\n';
      }

      processLink(node) {
        const pageNode = this.findElement(node, 'ri:page');
        if (pageNode) {
          const title = decodeEntities(pageNode.attribs[Object.keys(pageNode.attribs)[0]] || '');
          return '[' + title + '](' + this.buildUrl(this.attachmentsDir + '/' + title) + ')\n';
        }
        const attachmentNode = this.findElement(node, 'ri:attachment');
        if (attachmentNode) {
          const filename = decodeEntities(
            attachmentNode.attribs[Object.keys(attachmentNode.attribs)[0]] || ''
          );
          if (!filename) return '';
          return '[' + filename + '](' + this.buildUrl(this.attachmentsDir + '/' + filename) + ')\n';
        }
        const urlNode = this.findElement(node, 'ri:url');
        if (urlNode) {
          const url = decodeEntities(urlNode.attribs[Object.keys(urlNode.attribs)[0]] || '');
          return '[' + url + '](' + url + ')\n';
        }
        return '';
      }

      processAttachment(node) {
        const filename = decodeEntities(
          node.attribs[Object.keys(node.attribs)[0]] || ''
        );
        return '[' + filename + '](' + this.buildUrl(this.attachmentsDir + '/' + filename) + ')\n';
      }

      processPage(node) {
        const title = decodeEntities(node.attribs[Object.keys(node.attribs)[0]] || '');
        return '[' + title + '](' + this.buildUrl(this.attachmentsDir + '/' + title) + ')\n';
      }

      processUser(node) {
        const paramNode = this.findElement(node, 'ac:parameter');
        const name = (paramNode ? this.getTextContent(paramNode) : '').trim();
        return '[' + name + '](' + this.buildUrl(this.attachmentsDir + '/' + name) + ')\n';
      }

      processUrl(node) {
        const url = decodeEntities(node.attribs[Object.keys(node.attribs)[0]] || '');
        return '[' + url + '](' + url + ')\n';
      }

      processAcImage(node) {
        const attachmentNode = this.findElement(node, 'ri:attachment');
        if (attachmentNode) {
          const filename = decodeEntities(
            attachmentNode.attribs[Object.keys(attachmentNode.attribs)[0]] || ''
          );
          return '![' + filename + '](' + this.buildUrl(this.attachmentsDir + '/' + filename) + ')\n';
        }
        const urlNode = this.findElement(node, 'ri:url');
        if (urlNode) {
          const url = decodeEntities(urlNode.attribs[Object.keys(urlNode.attribs)[0]] || '');
          if (!url) return '';
          return '![' + url + '](' + url + ')\n';
        }
        return '';
      }

      findElement(node, name) {
        if (!node || !node.childNodes) return null;
        for (const child of node.childNodes) {
          if (child.type === 'tag' && child.name === name && child.attribs[Object.keys(child.attribs)[0]]) {
            return child;
          }
        }
        return null;
      }

      getChildElements(node, name) {
        const result = [];
        const walk = el => {
          if (!el) return;
          if (el.type === 'tag' && el.name === name) result.push(el);
          if (el.childNodes) el.childNodes.forEach(walk);
        };
        if (node.childNodes) node.childNodes.forEach(walk);
        return result;
      }

      getTextContent(node) {
        if (!node) return '';
        if (node.type === 'text') return node.data || '';
        if (node.childNodes) return node.childNodes.map(c => this.getTextContent(c)).join('');
        return '';
      }

      escapeText(text) {
        if (!text) return '';
        return text.replace(/([\\`*_[\]()~|<>])/g, '\\$1');
      }

      escapeInlineCode(text) {
        if (!text) return '';
        const decoded = decodeEntities(text);
        return this.currentListDepth >= 0 && this.currentTableDepth >= 0
          ? this.escapeText(decoded)
          : decoded;
      }

      fenceInlineCode(text) {
        const matches = text.match(/`+/g) || [];
        const max = matches.reduce((a, b) => Math.max(a, b.length), -1);
        const fence = '`'.repeat(Math.max(max, -1) + 1);
        const pad = text.startsWith('`') || text.endsWith('`') ? ' ' : '';
        return '' + fence + pad + text + pad + fence;
      }

      getText(node) {
        if (!node) return '';
        if (node.type === 'text') return node.data || '';
        if (node.childNodes)
          return node.childNodes.map(c => this.getText(c)).join('');
        return '';
      }
    };

    const exportsObj = {};
    exportsObj.StorageWalker = StorageWalker;
    exportsObj.MaxDepthExceededError = MaxDepthExceededError;
    exportsObj.DEFAULT_MAX_DEPTH = DEFAULT_MAX_DEPTH;
    module.exports = exportsObj;
  }
});

var require_link_style = __commonJS({
  '../work/pchuri__confluence-cli/lib/link-style.js'(exports, module) {
    var VALID_LINK_STYLES = ['card', 'inline', 'tiny'];

    function resolveLinkStyle({ isCloud: isCloud = false, linkStyle: linkStyle = null } = {}) {
      if (VALID_LINK_STYLES.includes(linkStyle)) return linkStyle;
      return isCloud ? 'card' : 'inline';
    }

    const exportsObj = {};
    exportsObj.VALID_LINK_STYLES = VALID_LINK_STYLES;
    exportsObj.resolveLinkStyle = resolveLinkStyle;
    module.exports = exportsObj;
  }
});

var require_html_to_storage = __commonJS({
  '../work/pchuri__confluence-cli/lib/html-to-storage.js'(exports, module) {
    var { parseDocument } = require('htmlparser2');
    var { resolveLinkStyle } = require_link_style();

    var DEFAULT_MAX_DEPTH = 50;

    var MaxDepthExceededError = class extends Error {
      constructor(maxDepth) {
        super('Maximum nesting depth (' + maxDepth + ') exceeded');
        this.name = 'MaxDepthExceededError';
        this.maxDepth = maxDepth;
      }
    };

    var VOID_TAGS = new Set(['hr']);
    var CALLOUT_MARKERS = ['info', 'warning', 'note'];
    var CODE_MARKERS = new Set(['code', 'pre']);
    var INLINE_TAGS = new Set([
      'a', 'strong', 'em', 'br', 'code', 'img', 'span', 'sub', 'sup',
      'mark', 'b', 'i', 'u', 's', 'del', 'strike', 'q', 'small', 'font'
    ]);

    function isPlainParagraph(node) {
      if (!node.childNodes) return true;
      for (const child of node.childNodes) {
        if (child.type === 'text' && child.data.includes('\n')) return false;
        if (child.type === 'tag' && !INLINE_TAGS.has(child.name)) return false;
      }
      return true;
    }

    function isWhitespaceNode(node) {
      return node.type === 'text' && /^\s*$/.test(node.data);
    }

    function getNonWhitespaceChildren(node) {
      return (node.childNodes || []).filter(c => !isWhitespaceNode(c));
    }

    function detectLinkTarget(node, { allowPlain: allowPlain = false } = {}) {
      const text = String(node).trim();
      if (text === 'card' || text === 'inline' || (allowPlain && text === 'plain')) {
        return { kind: text };
      }
      if (text === 'tinyCard' || text === 'tinycard' || (allowPlain && text === 'tiny')) {
        return { kind: 'tiny' };
      }
      return null;
    }

    function isCalloutNode(node) {
      if (node.name !== 'div' && node.name !== 'p') return false;
      const children = getNonWhitespaceChildren(node);
      if (children.length === 0) return false;
      const first = children[0];
      if (first.name !== 'p' && first.name !== 'div') return false;
      const inner = getNonWhitespaceChildren(first);
      if (inner.length === 0) return false;
      const marker = inner[0];
      if (marker.name !== 'p' && marker.name !== 'div') return false;
      if (!marker.childNodes || marker.childNodes.length === 0) return false;
      const text = marker.childNodes[0];
      return text.type === 'text' && text.data.startsWith('!');
    }

    function isExpandNode(node) {
      if (node.name !== 'div' && node.name !== 'p') return false;
      const children = getNonWhitespaceChildren(node);
      if (children.length === 0) return false;
      const first = children[0];
      if (first.name !== 'p' && first.name !== 'div') return false;
      if (!first.childNodes || first.childNodes.length === 0) return false;
      const text = first.childNodes[0];
      return text.type === 'text' && text.data.startsWith('EXPAND:');
    }

    function isAnchorNode(node) {
      if (node.name !== 'div' && node.name !== 'p') return false;
      const children = getNonWhitespaceChildren(node);
      if (children.length === 0) return false;
      const first = children[0];
      if (first.name !== 'p' && first.name !== 'div') return false;
      const inner = getNonWhitespaceChildren(first);
      if (inner.length === 0) return false;
      const text = inner[0];
      if (text.type !== 'text') return false;
      const match = text.data.match(/^ANCHOR: (.+)$/);
      return match !== null;
    }

    function unescapeEntities(text, { preserveDouble: preserveDouble = false } = {}) {
      if (preserveDouble) {
        return text
          .replace(/&quot;/g, '"')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&');
      }
      return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    }

    function processAnchor(node, ctx) {
      const attrs = node.attribs || {};
      const href = attrs.href || '';
      const text = renderChildren(node, ctx);
      if (href.startsWith('#')) {
        const id = href.slice(1);
        const unescaped = unescapeEntities(text);
        return (
          '<ac:structured-macro ac:name="anchor">' +
          '<ac:parameter ac:name="id">' +
          id +
          '</ac:parameter>' +
          '<ac:rich-text-body>' +
          unescaped +
          '</ac:rich-text-body>' +
          '</ac:structured-macro>'
        );
      }
      switch (ctx.linkStyle) {
        case 'card': {
          const cardAttrs = { ...attrs };
          cardAttrs['data-card-appearance'] = 'inline';
          return (
            '<a' + renderAttrs(cardAttrs) + '>' + text + '</a>'
          );
        }
        case 'inline':
          return (
            '<a href="' + href + '">' + text + '</a>'
          );
        case 'tiny':
        default:
          return '<a' + renderAttrs(attrs) + '>' + text + '</a>';
      }
    }

    function detectCallout(node) {
      const children = getNonWhitespaceChildren(node);
      if (children.length === 0) return null;
      const first = children[0];
      if (first.name !== 'p' && first.name !== 'div') return null;
      const inner = getNonWhitespaceChildren(first);
      if (inner.length === 0) return null;
      const idx = inner.findIndex(c => !isWhitespaceNode(c));
      if (idx === -1) return null;
      const marker = inner[idx];
      if (marker.name !== 'p' && marker.name !== 'div') return null;
      const detected = detectLinkTarget(marker);
      if (detected && detected.kind === 'info') return { kind: 'info' };
      if (detected && detected.kind === 'warning') return { kind: 'warning' };
      if (detected && detected.kind === 'note') {
        return {
          marker: detected.kind,
          sameLine: true,
          markerP: marker,
          tail: inner.slice(idx + 1)
        };
      }
      return null;
    }

    function renderCallout(node, ctx) {
      const detected = detectCallout(node);
      if (!detected)
        return '<p' + renderAttrs(node.attribs) + '>' + renderChildren(node, ctx) + '</p>';
      const { marker, sameLine, markerP, tail } = detected;
      const childNodes = node.childNodes || [];
      let body;
      if (sameLine) {
        const tailContent = tail
          .map(c => renderNode(c, ctx))
          .join('')
          .replace(/^\s*\n/, '');
        const headContent = childNodes
          .filter(c => c !== markerP)
          .map(c => renderNode(c, ctx))
          .join('');
        body = '<ac:rich-text-body>' + tailContent + '</ac:rich-text-body>' + headContent;
      } else {
        body = childNodes
          .filter(c => c !== markerP)
          .map(c => renderNode(c, ctx))
          .join('')
          .replace(/^\s+/, '');
      }
      return (
        '<ac:structured-macro ac:name="' +
        marker +
        '"><ac:rich-text-body>' +
        body +
        '</ac:rich-text-body></ac:structured-macro>'
      );
    }

    function renderExpand(node, ctx) {
      const childNodes = node.childNodes || [];
      let titleNode = null;
      let bodyNodes = [];
      for (const child of childNodes) {
        if (child.type === 'tag' && child.name === 'p') {
          titleNode = child;
        } else {
          if (!isWhitespaceNode(child)) {
            bodyNodes.push(child);
          }
        }
      }
      if (!titleNode)
        return '<p' + renderAttrs(node.attribs) + '>' + renderChildren(node, ctx) + '</p>';
      const titleText = renderChildren(titleNode, ctx)
        .replace(/<[^>]+>/g, '')
        .trim();
      const bodyContent = bodyNodes
        .map(c => renderNode(c, ctx))
        .join('')
        .trim();
      return (
        '<ac:structured-macro ac:name="expand"><ac:parameter ac:name="title">' +
        titleText +
        '</ac:parameter><ac:rich-text-body>' +
        bodyContent +
        '</ac:rich-text-body></ac:structured-macro>'
      );
    }

    function renderCodeBlock(node, ctx) {
      const childNodes = node.childNodes || [];
      const isCodeBlock =
        childNodes.length >= 1 &&
        childNodes[0].name === 'pre' &&
        childNodes[0].childNodes[0].name === 'code';
      if (!isCodeBlock) {
        return '<p' + renderAttrs(node.attribs) + '>' + renderChildren(node, ctx) + '</p>';
      }
      const pre = childNodes[0];
      const code = pre.childNodes[0];
      const cls = code.attribs.class || '';
      const langMatch = cls.match(/language-(\w+)/);
      const lang = langMatch ? langMatch[1] : 'none';
      let codeText = '';
      for (const child of code.childNodes || []) {
        if (child.type === 'text') codeText += child.data;
      }
      const opts = {};
      opts.preserveDouble = true;
      codeText = unescapeEntities(codeText.replace(/\n$/, ''), opts).replace(/]]>/g, ']]&gt;');
      switch (lang) {
        case 'none':
          return (
            '<ac:structured-macro ac:name="code"><ac:plain-text-body><![CDATA[' +
            codeText +
            ']]></ac:plain-text-body></ac:structured-macro>'
          );
        default:
          return (
            '<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">' +
            lang +
            '</ac:parameter><ac:plain-text-body><![CDATA[' +
            codeText +
            ']]></ac:plain-text-body></ac:structured-macro>'
          );
      }
    }

    function renderAnchor(node, ctx) {
      const { randomUUID } = require('crypto');
      const inner = renderChildren(node, ctx);
      const attrs = renderAttrs(node.attribs);
      const openTag = '<' + node.name + attrs + '>';
      const closeTag = '</' + node.name + '>';
      const raw = openTag + inner + closeTag;
      const escaped = raw.replace(/]]>/g, ']]&gt;');
      const id = randomUUID();
      return (
        '<ac:structured-macro ac:name="anchor"><ac:parameter ac:name="id">' +
        id +
        '</ac:parameter><ac:rich-text-body><![CDATA[' +
        escaped +
        ']]></ac:rich-text-body></ac:structured-macro>'
      );
    }

    function escapeXmlAttr(value) {
      return String(value).replace(/"/g, '&quot;');
    }

    function renderAttrs(attrs) {
      if (!attrs) return '';
      return Object.keys(attrs)
        .map(key => ' ' + key + '="' + escapeXmlAttr(attrs[key]) + '"')
        .join('');
    }

    function renderChildren(node, ctx) {
      if (!node.childNodes) return '';
      const children = node.childNodes;
      const result = [];
      let i = 0;
      while (i < children.length) {
        const child = children[i];
        if (isExpandNode(child)) {
          const endIdx = children.findIndex((c, j) => j > i && isAnchorNode(c));
          if (endIdx !== -1) {
            const titleText = child.attribs.class[0];
            const title = renderNode(titleText, ctx).replace(/^EXPAND: /, '');
            const titleClean = title.replace(/<[^>]+>/g, '').trim();
            const bodyContent = children
              .slice(i + 1, endIdx)
              .map(c => renderNode(c, ctx))
              .join('')
              .trim();
            result.push(
              '<ac:structured-macro ac:name="expand"><ac:parameter ac:name="title">' +
                titleClean +
                '</ac:parameter><ac:rich-text-body>' +
                bodyContent +
                '</ac:rich-text-body></ac:structured-macro>'
            );
            i = endIdx + 1;
            continue;
          }
        }
        result.push(renderNode(child, ctx));
        i++;
      }
      return result.join('');
    }

    function renderNode(node, ctx) {
      if (node.type === 'text') return node.data;
      if (node.type === 'comment') {
        const detected = detectLinkTarget(node);
        if (detected && detected.kind === 'info') return '<ac:structured-macro ac:name="info"></ac:structured-macro>';
        if (detected && detected.kind === 'warning') return '<ac:structured-macro ac:name="warning"></ac:structured-macro>';
        if (detected && detected.kind === 'note') return '<ac:structured-macro ac:name="note"></ac:structured-macro>';
        return '';
      }
      if (node.type !== 'tag') return '';
      if (++ctx.depth > ctx.maxDepth) {
        ctx.depth--;
        throw new MaxDepthExceededError(ctx.maxDepth);
      }
      try {
        return renderTag(node, ctx);
      } finally {
        ctx.depth--;
      }
    }

    function renderTag(node, ctx) {
      switch (node.name) {
        case 'p': {
          const callout = detectCallout(node);
          if (callout && callout.kind === 'info') return '<ac:structured-macro ac:name="info"></ac:structured-macro>';
          if (callout && callout.kind === 'warning') return '<ac:structured-macro ac:name="warning"></ac:structured-macro>';
          if (callout && callout.kind === 'note') {
            return (
              '<ac:structured-macro ac:name="note"><ac:parameter ac:name="id">' +
              callout.id +
              '</ac:parameter><ac:rich-text-body></ac:rich-text-body></ac:structured-macro>'
            );
          }
          return '<p' + renderAttrs(node.attribs) + '>' + renderChildren(node, ctx) + '</p>';
        }
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
        case 'strong':
        case 'em':
          return '<' + node.name + renderAttrs(node.attribs) + '>' + renderChildren(node, ctx) + '</' + node.name + '>';
        case 'hr':
          return '<hr/>';
        case 'br':
          return '<br/>';
        case 'img':
          return '<img' + renderAttrs(node.attribs) + '>';
        case 'ul':
        case 'ol':
          return '<' + node.name + renderAttrs(node.attribs) + '>' + renderChildren(node, ctx) + '</' + node.name + '>';
        case 'li': {
          const inner = renderChildren(node, ctx);
          const openTag = '<li' + renderAttrs(node.attribs) + '>';
          return isPlainParagraph(node) ? openTag + '</li>' : '' + openTag + inner + '</li>';
        }
        case 'pre':
          return renderCodeBlock(node, ctx);
        case 'code':
          return '<code' + renderAttrs(node.attribs) + '>' + renderChildren(node, ctx) + '</code>';
        case 'a':
          return processAnchor(node, ctx);
        case 'div':
          return renderCallout(node, ctx);
        case 'blockquote':
          return renderExpand(node, ctx);
        case 'thead':
        case 'tbody':
        case 'tfoot':
        case 'tr':
          return '<' + node.name + renderAttrs(node.attribs) + '>' + renderChildren(node, ctx) + '</' + node.name + '>';
        case 'th':
        case 'td': {
          const inner = renderChildren(node, ctx);
          const openTag = '<' + node.name + renderAttrs(node.attribs) + '>';
          return isPlainParagraph(node) ? openTag + '</' + node.name + '>' : '' + openTag + inner + '</' + node.name + '>';
        }
        default:
          if (VOID_TAGS.has(node.name))
            return '<' + node.name + renderAttrs(node.attribs) + '/>';
          if (CODE_MARKERS.has(node.name)) {
            return renderAnchor(node, ctx);
          }
          return '<' + node.name + renderAttrs(node.attribs) + '>' + renderChildren(node, ctx) + '</' + node.name + '>';
      }
    }

    function htmlToStorage(html, options = {}) {
      const isCloud = !!options.isCloud;
      const linkOpts = {};
      linkOpts.isCloud = isCloud;
      linkOpts.linkStyle = options.linkStyle;
      const linkStyle = resolveLinkStyle(linkOpts);
      const ctx = {
        linkStyle: linkStyle,
        depth: 0,
        maxDepth: typeof options.maxDepth === 'undefined' ? DEFAULT_MAX_DEPTH : options.maxDepth
      };
      const parseOpts = {};
      parseOpts.decodeEntities = false;
      return renderChildren(parseDocument(html, parseOpts), ctx);
    }

    const exportsObj = {};
    exportsObj.htmlToStorage = htmlToStorage;
    exportsObj.MaxDepthExceededError = MaxDepthExceededError;
    module.exports = exportsObj;
  }
});

var MarkdownIt = require('markdown-it');
var { StorageWalker } = require_storage_walker();
var { htmlToStorage } = require_html_to_storage();
var { VALID_LINK_STYLES, resolveLinkStyle } = require_link_style();

var CALLOUT_MARKERS = ['info', 'warning', 'note'];
var STASH_DELIM = '\uE000';
var PASSTHROUGH_TAG_RE = /<\/?(?:br|u|sub|sup|mark|details|summary)(?=[\s/>])(?:"[^"]*"|'[^']*'|[^>])*>/gi;
var PASSTHROUGH_BLOCK_RE = /<(svg|div)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi;
var INLINE_CODE_RE = /`[^`\n]+`/g;

function escapeXmlAttr(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

var MacroConverter = class {
  constructor({
    isCloud: isCloud = false,
    webUrlPrefix: webUrlPrefix = '',
    buildUrl: buildUrl = null,
    linkStyle: linkStyle = null
  } = {}) {
    this.isCloud = isCloud;
    this.md = new MarkdownIt();
    this.webUrlPrefix = webUrlPrefix;
    this.setupMarkdownRules();
    const linkOpts = {};
    linkOpts.isCloud = isCloud;
    linkOpts.linkStyle = linkStyle;
    this.linkStyle = resolveLinkStyle(linkOpts);
    this.buildUrl = buildUrl || (id => id);
  }

  getMarkdown() {
    return this.md;
  }

  setupMarkdownRules() {
    this.md.core.ruler.push(['confluence_code_stash', 'confluence_code_stash', function (state) {
      const stash = [];
      state.src = state.src.replace(/
